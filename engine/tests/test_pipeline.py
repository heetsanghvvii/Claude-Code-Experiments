"""End-to-end CLI run with Claude and Brave replaced by canned responses."""

import pytest

import threading

from outreach import cli, discovery, feedback, llm, prompts, store
from outreach.models import (
    BucketDecision, DraftVerdict, ExtractedFact, ExtractedProfile, HookDraft, HookSet, JudgeResult,
    OpenerDraft, Playbook, ReplyAnalysis,
)

CANDIDATE = ExtractedProfile(
    full_name="Asha Mehta", headline="Brand Manager moving into Product", current_company="HUL",
    current_title="Brand Manager", location="Mumbai",
    facts=[
        ExtractedFact(kind="education", text="MBA, IIM Ahmedabad, 2022"),
        ExtractedFact(kind="role_change", text="Moving from brand management at HUL into product management"),
    ],
)
PROSPECT = ExtractedProfile(
    full_name="Rahul Shah", headline="Product Manager", current_company="Zepto",
    current_title="Product Manager", location="Bangalore",
    facts=[
        ExtractedFact(kind="role_change", text="Moved from Flipkart category management to product at Zepto in 2024"),
        ExtractedFact(kind="education", text="MBA, IIM Ahmedabad, 2019"),
    ],
)
GOOD_OPENER = ("Hey Rahul, noticed you moved from Flipkart category into product at Zepto. I'm making a similar "
               "jump from brand management. Curious, what was the biggest adjustment for you?")
BAD_OPENER = "Hi Rahul! I came across your profile and would love a referral."


@pytest.fixture
def fake(monkeypatch, tmp_path):
    monkeypatch.setattr(store, "DATA_DIR", tmp_path / "data")
    calls = {"opener": 0, "judge": [], "distill": 0}
    lock = threading.Lock()

    def parse(system, content, schema, effort="medium"):
        if schema is ExtractedProfile:
            text = content[-1]["text"] if isinstance(content, list) else content
            return PROSPECT if "posts" in text else CANDIDATE
        if schema is BucketDecision:
            return BucketDecision(bucket="alumni", reason="Same MBA school", keep="Recruiter" not in content)
        if schema is HookSet:
            return HookSet(hooks=[
                HookDraft(hook_type="similar_transition", summary="Both moved into product from category/brand roles",
                          candidate_fact_id="c:2", prospect_fact_id=f"p:{_pid(content)}:1",
                          specificity=5, rarity=4, relevance=5, recency=4),
                HookDraft(hook_type="shared_school", summary="Made up hook", candidate_fact_id="c:99",
                          prospect_fact_id="p:x:1", specificity=5, rarity=5, relevance=5, recency=5),
            ])
        if schema is OpenerDraft:
            writer = next(w for w, angle in prompts.WRITERS.items() if angle in system)
            with lock:
                calls["opener"] += 1
            if writer == "curious_peer" and "rejected" not in content:
                return OpenerDraft(body=BAD_OPENER, style="question")   # curious_peer fails once, then fixes it
            return OpenerDraft(body=GOOD_OPENER.replace("Curious", writer.split("_")[0].title()), style="question")
        if schema is JudgeResult:
            calls["judge"].append(content)
            return JudgeResult(verdicts=[DraftVerdict(draft_index=i, reply_likelihood=4, specificity=4, human_feel=4,
                                                      critique="ok") for i in range(3)],
                               winner_index=1, reason="Most specific question")
        if schema is Playbook:
            calls["distill"] += 1
            if system == prompts.DISTILL_REPLY_PLAYBOOK:
                assert "REACHED A REFERRAL OR INTERVIEW:\nME: Hey Rahul, edited" in content
                return Playbook(rules=["Ask about their team only after they share something specific."])
            assert "SENT: Hey Rahul, edited" in content
            return Playbook(rules=["Start with their name and the specific fact."])
        if schema is ReplyAnalysis:
            return ReplyAnalysis(sentiment="warm", rapport=4, redirect_to="", ask_type="opening",
                                 ask_reason="Warm reply, rapport built", next_message="That makes sense. Is your team hiring PMs?")
        raise AssertionError(schema)

    def _pid(text):
        import re
        return re.search(r"\[p:([^:\]]+):", text).group(1)

    monkeypatch.setattr(llm, "parse", parse)
    monkeypatch.setattr(llm, "pdf_block", lambda p: {"type": "document"})
    monkeypatch.setattr(discovery, "brave_search", lambda q, count=20: [
        {"url": "https://in.linkedin.com/in/rahulshah?trk=x", "title": "Rahul Shah - Product Manager - Zepto | LinkedIn", "description": "IIM A"},
        {"url": "https://in.linkedin.com/in/neha", "title": "Neha Rao - Recruiter - Zepto | LinkedIn", "description": "Recruiter"},
        {"url": "https://example.com/not-linkedin", "title": "Zepto careers", "description": ""},
    ])
    return calls, tmp_path


def test_full_pipeline(fake, capsys):
    calls, tmp = fake
    (tmp / "cv.pdf").write_bytes(b"%PDF")
    (tmp / "rahul.pdf").write_bytes(b"%PDF")
    (tmp / "posts.txt").write_text("Post about shipping weekly")

    cli.main(["candidate-add", "--cv", str(tmp / "cv.pdf"), "--roles", "Product Manager", "--companies", "Zepto"])
    cid = store.list_ids()[0]

    cli.main(["discover", cid])
    c = store.load(cid)
    assert [p.full_name for p in c.prospects] == ["Rahul Shah"]          # recruiter dropped, non-LinkedIn ignored
    assert c.prospects[0].linkedin_url == "https://in.linkedin.com/in/rahulshah"
    pid = c.prospects[0].id

    cli.main(["discover", cid])                                           # re-run adds no duplicates
    assert len(store.load(cid).prospects) == 1

    cli.main(["prospect-add", cid, "--id", pid, "--pdf", str(tmp / "rahul.pdf"), "--posts", str(tmp / "posts.txt")])
    cli.main(["generate", cid])
    p = store.get_prospect(store.load(cid), pid)
    assert len(p.hooks) == 1 and p.hooks[0].selected                     # fabricated hook rejected
    assert calls["opener"] == 4                                           # 3 writers + 1 rewrite of a bad draft
    msg = p.messages[0]
    assert len(msg.alternatives) == 2 and msg.judge_reason == "Most specific question"
    assert msg.body not in msg.alternatives and p.status == "message_ready"
    assert msg.writer in prompts.WRITERS
    winner_writer = msg.writer

    edited = "Hey Rahul, edited version. What was the hardest part of the switch?"
    cli.main(["approve", cid, pid, "--body", edited])
    assert feedback.load()["edits"][0]["writer"] == winner_writer
    assert store.get_prospect(store.load(cid), pid).messages[0].edited
    cli.main(["status", cid, pid, "sent"])
    cli.main(["reply", cid, pid, "--text", "Ha, the speed. Everything ships weekly."])
    p = store.get_prospect(store.load(cid), pid)
    assert [m.direction for m in p.messages] == ["outbound", "inbound", "outbound"]
    assert p.messages[-1].ask_type == "opening" and p.status == "replied"

    cli.main(["status", cid, pid, "interview"])
    capsys.readouterr()
    cli.main(["funnel", cid])
    out = capsys.readouterr().out
    assert "Interviews per 100 targeted: 100.0" in out

    cli.main(["export", cid, "--out", str(tmp / "out.csv")])
    assert "Rahul Shah" in (tmp / "out.csv").read_text()

    capsys.readouterr()
    cli.main(["stats"])
    out = capsys.readouterr().out
    assert f"{winner_writer:<16}1/1  100%" in out

    cli.main(["learn"])                                                   # 3 signals < 5: refuses
    assert calls["distill"] == 0
    monkeypatch_min = feedback.MIN_EVIDENCE
    feedback.MIN_EVIDENCE = 2
    try:
        cli.main(["learn"])
    finally:
        feedback.MIN_EVIDENCE = monkeypatch_min
    assert calls["distill"] == 2
    assert feedback.playbook() == ["Start with their name and the specific fact."]

    # Learned rules and winning openers flow into writers/judge; reply rules into the reply agent.
    everyone = [store.load(cid)]
    guidance = feedback.guidance(everyone)
    assert "Start with their name" in guidance and edited in guidance
    assert "Ask about their team only after" in feedback.reply_guidance(everyone)
