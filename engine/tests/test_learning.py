"""Self-learning: writer selection, retiring/spawning writers, judge calibration, ask stats."""

import random

import pytest

from outreach import cli, feedback, llm, prompts, store
from outreach.models import Bucket, Candidate, Hook, Message, Prospect, WriterAngle

WRITER_NAMES = list(prompts.WRITERS)


@pytest.fixture(autouse=True)
def local(monkeypatch, tmp_path):
    monkeypatch.setattr(store, "DATA_DIR", tmp_path / "data")
    monkeypatch.delenv("SUPABASE_URL", raising=False)


def _candidate(results):
    """results: list of (writer, bucket, replied)."""
    c = Candidate(id="c-1", full_name="Asha")
    for i, (writer, bucket, replied) in enumerate(results):
        c.prospects.append(Prospect(
            id=f"p{i}", full_name=f"P {i}", bucket=Bucket(bucket), status="replied" if replied else "no_response",
            messages=[Message(direction="outbound", step=1, body=f"Hey P, opener {i} by {writer}", writer=writer,
                              sent_at="x", created_at="x")]))
    store.save(c)
    return c


def test_thompson_sampling_prefers_writers_that_get_replies():
    good, bad, mid = WRITER_NAMES
    c = _candidate([(good, "alumni", True)] * 9 + [(good, "alumni", False)] +
                   [(bad, "alumni", False)] * 10 + [(mid, "alumni", i < 5) for i in range(10)])
    rng = random.Random(7)
    picks = [list(feedback.choose_writers([c], "alumni", k=1, rng=rng))[0] for _ in range(300)]
    assert picks.count(good) > 200 and picks.count(bad) < 10


def test_new_writers_still_get_explored():
    c = _candidate([])
    rng = random.Random(1)
    seen = {w for _ in range(50) for w in feedback.choose_writers([c], "recruiter", k=1, rng=rng)}
    assert seen == set(WRITER_NAMES)


def test_learn_retires_weak_writer_and_spawns_new_one(monkeypatch):
    good, bad, mid = WRITER_NAMES
    c = _candidate([(good, "alumni", i < 6) for i in range(10)] + [(bad, "alumni", i < 1) for i in range(10)] +
                   [(mid, "team_member", i < 4) for i in range(10)])
    calls = []

    def parse(system, content, schema, effort="medium"):
        calls.append(system)
        if schema is WriterAngle:
            assert "RETIRED (underperformed):\n- " + bad in content
            return WriterAngle(name="Project Nerd", angle="Ask about one concrete project they shipped.")
        return feedback.Playbook(rules=["rule"])

    monkeypatch.setattr(llm, "parse", parse)
    summary = feedback.learn([c])
    assert summary["retired"] == [bad] and summary["spawned"] == ["project_nerd"]
    data = feedback.load()
    assert set(data["writers"]) == {good, mid, "project_nerd"} and bad in data["retired"]
    assert feedback.learn([c]) is None                     # no new evidence since last run
    assert prompts.EVOLVE_WRITER in calls


def test_operator_choosing_alternative_teaches_judge():
    c = Candidate(id="c-1", full_name="Asha")
    c.prospects.append(Prospect(
        id="p1", full_name="Rahul Shah", headline="PM", company="Zepto", status="message_ready",
        hooks=[Hook(hook_type="shared_school", summary="s", candidate_fact_id="c:1", prospect_fact_id="p:1",
                    specificity=4, rarity=4, relevance=4, recency=4, score=4, selected=True)],
        messages=[Message(direction="outbound", step=1, body="judge pick", writer="curious_peer",
                          alternatives=["operator favourite", "other"],
                          alternative_writers=["shared_path", "sharp_observer"], created_at="x")]))
    store.save(c)
    cli.main(["approve", "c-1", "p1", "--alt", "1"])
    msg = store.get_prospect(store.load("c-1"), "p1").messages[0]
    assert msg.body == "operator favourite" and msg.writer == "shared_path" and msg.approved
    assert "judge pick" in msg.alternatives
    notes = feedback.judge_guidance()
    assert 'You picked: "judge pick"' in notes and 'operator chose instead: "operator favourite"' in notes


def test_ask_stats_track_which_asks_lead_to_interviews():
    c = Candidate(id="c-1", full_name="Asha")
    for i, (ask, status) in enumerate([("opening", "interview"), ("opening", "replied"), ("referral", "referral")]):
        c.prospects.append(Prospect(id=f"p{i}", full_name=f"P{i}", status=status, messages=[
            Message(direction="outbound", step=1, body="hi", created_at="x"),
            Message(direction="inbound", step=2, body="hey", created_at="x"),
            Message(direction="outbound", step=3, body="ask", ask_type=ask, sent_at="x", created_at="x")]))
    store.save(c)
    assert feedback.ask_stats([c]) == {"opening": (1, 2), "referral": (1, 1)}
    assert "opening: 1/2 conversations reached a referral or interview" in feedback.reply_guidance([c])
