"""Operational features: follow-ups, weekly export cap, cost tracking, website intake, failure resilience."""

import csv
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from outreach import bridge, cli, llm, store
from outreach.models import (
    Bucket, Candidate, ExtractedFact, ExtractedProfile, Hook, HookSet, Message, OpenerDraft, Prospect,
)

from test_bridge import FakePostgrest


def _iso(days_ago):
    return (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(timespec="seconds")


def _hook(n):
    return Hook(hook_type="shared_school", summary=f"hook {n}", candidate_fact_id="c:1", prospect_fact_id=f"p:{n}",
                specificity=4, rarity=4, relevance=4, recency=4, score=4)


@pytest.fixture(autouse=True)
def local(monkeypatch, tmp_path):
    monkeypatch.setattr(store, "DATA_DIR", tmp_path / "data")
    for k in ("SUPABASE_URL", "SUPABASE_KEY", "ENGINE_TOKEN"):
        monkeypatch.delenv(k, raising=False)
    llm.reset_usage()


def _seed(prospects, auto_send=False):
    c = Candidate(id="c-1", full_name="Asha", auto_send=auto_send, reply_delay_minutes=10, prospects=prospects)
    store.save(c)
    return c


def test_followups_draft_once_then_close(monkeypatch):
    seen = []

    def parse(system, content, schema, effort="medium"):
        seen.append(content)
        return OpenerDraft(body="Hi Rahul, how is the new pricing team shaping up?", style="question")

    monkeypatch.setattr(llm, "parse", parse)
    opener = lambda days: Message(direction="outbound", step=1, body="Hey Rahul, ...", sent_at=_iso(days), created_at="x")
    _seed([
        Prospect(id="old", full_name="Rahul Shah", company="Zepto", status="sent", hooks=[_hook(1), _hook(2)],
                 messages=[opener(8)]),
        Prospect(id="fresh", full_name="Neha Rao", status="sent", messages=[opener(2)]),
        Prospect(id="replied", full_name="Amit Jain", status="replied",
                 messages=[opener(9), Message(direction="inbound", step=2, body="hey", created_at="x")]),
    ], auto_send=True)

    cli.main(["followups", "c-1", "--days", "6"])
    c = store.load("c-1")
    old = store.get_prospect(c, "old")
    assert [m.step for m in old.messages] == [1, 2] and old.messages[1].writer == "followup"
    assert "hook 2" in seen[0]                                   # uses the second hook, a new angle
    assert len(store.get_prospect(c, "fresh").messages) == 1     # too recent
    assert len(store.get_prospect(c, "replied").messages) == 2   # already talking
    assert len(bridge.outbox(due_only=False)) == 1               # auto-send queued it

    old.messages[1].sent_at = _iso(7)                            # follow-up went out a week ago, still silent
    store.save(c)
    cli.main(["followups", "c-1", "--days", "6"])
    assert store.get_prospect(store.load("c-1"), "old").status == "no_response"
    assert len(seen) == 1                                        # never a third message


def test_followup_rules_reject_pushy_drafts(monkeypatch):
    drafts = iter(["Hi Rahul, just following up on my referral request!", "Hi Rahul, what surprised you most at Zepto?"])
    monkeypatch.setattr(llm, "parse", lambda *a, **k: OpenerDraft(body=next(drafts), style="question"))
    _seed([Prospect(id="p", full_name="Rahul Shah", status="sent",
                    messages=[Message(direction="outbound", step=1, body="Hey", sent_at=_iso(10), created_at="x")])])
    cli.main(["followups", "c-1"])
    assert store.get_prospect(store.load("c-1"), "p").messages[1].body.endswith("at Zepto?")


def test_export_respects_weekly_cap_and_priority(tmp_path):
    def approved(i, bucket):
        return Prospect(id=f"p{i}", full_name=f"Person {i}", bucket=Bucket(bucket), status="approved",
                        linkedin_url=f"https://linkedin.com/in/p{i}",
                        messages=[Message(direction="outbound", step=1, body=f"Hi {i}", approved=True, created_at="x")])
    _seed([approved(1, "recruiter"), approved(2, "hiring_manager"), approved(3, "team_member")])
    out = tmp_path / "batch1.csv"
    cli.main(["export-lgm", "c-1", "--out", str(out), "--limit", "2"])
    names = [r["firstname"] + " " + r["lastname"] for r in csv.DictReader(out.open())]
    assert names == ["Person 2", "Person 3"]                     # hiring manager, then team member
    c = store.load("c-1")
    assert store.get_prospect(c, "p2").status == "sent" and store.get_prospect(c, "p2").messages[0].sent_at
    out2 = tmp_path / "batch2.csv"
    cli.main(["export-lgm", "c-1", "--out", str(out2), "--limit", "2"])
    assert [r["firstname"] for r in csv.DictReader(out2.open())] == ["Person"] and "p1" in out2.read_text()


def test_usage_is_recorded_and_costed(monkeypatch, capsys):
    usage = SimpleNamespace(input_tokens=10_000, output_tokens=1_000, cache_read_input_tokens=0,
                            server_tool_use=SimpleNamespace(web_search_requests=2))

    def parse(system, content, schema, effort="medium"):
        llm.record_usage(usage)
        return OpenerDraft(body="Hi Rahul, what was the hardest part?", style="question")

    monkeypatch.setattr(llm, "parse", parse)
    _seed([Prospect(id="p", full_name="Rahul Shah", status="sent",
                    messages=[Message(direction="outbound", step=1, body="Hey", sent_at=_iso(10), created_at="x")])])
    cli.main(["followups", "c-1"])
    # 10k in * $4/M + 1k out * $20/M + 2 searches * $0.01 = 0.04 + 0.02 + 0.02
    assert llm.cost_usd({"input": 10_000, "output": 1_000, "cache_read": 0, "web_searches": 2}) == 0.08
    rows = store.get_doc("usage")
    assert rows[-1]["command"] == "followups" and rows[-1]["usd"] == 0.08
    capsys.readouterr()
    cli.main(["cost", "c-1"])
    out = capsys.readouterr().out
    assert "1 Claude calls" in out and "$0.08" in out and "Per targeted prospect" in out
    assert "usage" not in store.list_ids()                       # shared doc, not a candidate


def test_generate_continues_after_a_failure(monkeypatch, capsys):
    calls = {"n": 0}

    def parse(system, content, schema, effort="medium"):
        if schema is HookSet:
            calls["n"] += 1
            if calls["n"] == 1:
                raise RuntimeError("No structured output (stop_reason=max_tokens)")
            return HookSet(hooks=[])
        raise AssertionError(schema)

    monkeypatch.setattr(llm, "parse", parse)
    _seed([Prospect(id="a", full_name="A One", status="enriched"), Prospect(id="b", full_name="B Two", status="enriched")])
    cli.main(["generate", "c-1"])
    c = store.load("c-1")
    assert store.get_prospect(c, "a").status == "enriched"       # failed one left for retry
    assert store.get_prospect(c, "b").status == "skipped"        # next one still processed
    assert "1 of 2 failed: A One" in capsys.readouterr().out


def test_intake_pull_creates_candidates(monkeypatch, tmp_path):
    fake = FakePostgrest()
    fake.tables["intake_requests"] = [{"id": 7, "full_name": "Priya Nair", "email": "priya@example.com",
                                       "linkedin_url": "https://linkedin.com/in/priya", "target_role": "Product Manager",
                                       "target_companies": "Zepto, CRED", "city": "Bangalore", "package": "standard",
                                       "processed_at": None, "candidate_id": None}]
    monkeypatch.setenv("SUPABASE_URL", "https://x.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "sb_publishable_x")
    monkeypatch.setenv("ENGINE_TOKEN", "eng_x")
    monkeypatch.setattr(store.httpx, "request", fake)
    cli.main(["intake-pull"])
    row = fake.tables["intake_requests"][0]
    c = store.load(row["candidate_id"])
    assert row["processed_at"] and c.full_name == "Priya Nair"
    assert c.target_companies == ["Zepto", "CRED"] and c.story["package"] == "standard"
    cli.main(["intake-pull"])                                     # already processed: no duplicate
    assert len(store.list_ids()) == 1

    monkeypatch.setattr(llm, "pdf_block", lambda p: {"type": "document"})
    monkeypatch.setattr(llm, "parse", lambda *a, **k: ExtractedProfile(
        full_name="Priya Nair", headline="Brand Manager", current_company="HUL", current_title="BM",
        location="Mumbai", facts=[ExtractedFact(kind="education", text="MBA, IIM Bangalore, 2023")]))
    (tmp_path / "cv.pdf").write_bytes(b"%PDF")
    cli.main(["candidate-cv", c.id, "--cv", str(tmp_path / "cv.pdf")])
    c = store.load(c.id)
    assert c.facts[0].id == "c:1" and c.headline == "Brand Manager"
