"""Auto-reply loop through the inbox/outbox bridge, on local storage and on a fake Supabase REST API."""

import csv
import json
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import unquote

import httpx
import pytest

from outreach import bridge, cli, discovery, llm, store
from outreach.models import (
    BucketDecision, Candidate, ExtractedFact, ExtractedProfile, Fact, Message, Prospect, ReplyAnalysis,
)

SENTIMENT = {"value": "warm"}


def _reply(system, content, schema, effort="medium"):
    if schema is ReplyAnalysis:
        return ReplyAnalysis(sentiment=SENTIMENT["value"], rapport=4, redirect_to="", ask_type="none",
                             ask_reason="build rapport", next_message="Makes sense. How do you prioritise?")
    if schema is ExtractedProfile:
        name = re.search(r"Full Name: (.+)", content).group(1)
        return ExtractedProfile(full_name=name, headline="PM", current_company="Zepto", current_title="PM",
                                location="Bangalore", facts=[ExtractedFact(kind="employer", text=f"{name} works at Zepto")])
    if schema is BucketDecision:
        return BucketDecision(bucket="team_member", reason="PM at Zepto", keep=True)
    raise AssertionError(schema)


def _seed(auto_send=True):
    c = Candidate(id="asha-1", full_name="Asha Mehta", target_roles=["PM"], auto_send=auto_send, reply_delay_minutes=30,
                  facts=[Fact(id="c:1", owner="candidate", kind="education", text="IIM A", source="cv")])
    p = Prospect(id="rahul-1", full_name="Rahul Shah", company="Zepto", status="sent",
                 linkedin_url="https://www.linkedin.com/in/rahulshah/",
                 messages=[Message(direction="outbound", step=1, body="Hey Rahul, ...", approved=True, created_at="x")])
    c.prospects.append(p)
    store.save(c)


class FakePostgrest:
    """Just enough of PostgREST for the store and bridge: eq / is.null / not.is.null / lte filters."""

    def __init__(self):
        self.tables = {"engine_state": [], "inbound_replies": [], "outbox": []}
        self.seq = 0

    def _match(self, row, params):
        for k, v in (params or {}).items():
            if k in ("select", "order", "on_conflict"):
                continue
            v = unquote(str(v))
            if v == "is.null" and row.get(k) is not None:
                return False
            if v == "not.is.null" and row.get(k) is None:
                return False
            if v.startswith("eq.") and str(row.get(k)) != v[3:]:
                return False
            if v.startswith("lte.") and not (row.get(k) and row[k] <= v[4:]):
                return False
        return True

    def __call__(self, method, url, params=None, json=None, headers=None, timeout=None):
        assert headers["x-engine-token"] == "eng_x" and headers["apikey"] == "sb_publishable_x"
        table = url.rsplit("/", 1)[1]
        rows = self.tables[table]
        if method == "GET":
            out = [dict(r) for r in rows if self._match(r, params)]
            return httpx.Response(200, json=out, request=httpx.Request(method, url))
        if method == "POST":
            body = dict(json)
            if params and params.get("on_conflict"):
                rows[:] = [r for r in rows if r["id"] != body["id"]]
            else:
                self.seq += 1
                body.setdefault("id", self.seq)
                body.setdefault("processed_at", None)
                body.setdefault("sent_at", None)
            rows.append(body)
            return httpx.Response(201, request=httpx.Request(method, url))
        if method == "PATCH":
            for r in rows:
                if self._match(r, params):
                    r.update(json)
            return httpx.Response(204, request=httpx.Request(method, url))
        raise AssertionError(method)


@pytest.fixture(params=["local", "supabase"])
def env(request, monkeypatch, tmp_path):
    monkeypatch.setattr(store, "DATA_DIR", tmp_path / "data")
    monkeypatch.setattr(llm, "parse", _reply)
    SENTIMENT["value"] = "warm"
    if request.param == "supabase":
        fake = FakePostgrest()
        monkeypatch.setenv("SUPABASE_URL", "https://x.supabase.co")
        monkeypatch.setenv("SUPABASE_KEY", "sb_publishable_x")
        monkeypatch.setenv("ENGINE_TOKEN", "eng_x")
        monkeypatch.setattr(store.httpx, "request", fake)
    else:
        monkeypatch.delenv("SUPABASE_URL", raising=False)
    return request.param


def test_auto_reply_loop(env):
    _seed(auto_send=True)
    # Chrome copies a reply from the LGM inbox (URL format differs from ours)
    bridge.add_inbound("linkedin.com/in/RahulShah?miniProfile=1", "Rahul Shah", "The speed. Everything ships weekly.")
    bridge.add_inbound("https://linkedin.com/in/stranger", "Someone Else", "Who is this?")

    stats = bridge.sync()
    assert stats["replies"] == 1 and stats["queued"] == 1 and stats["unmatched"] == 1

    p = store.get_prospect(store.load("asha-1"), "rahul-1")
    assert p.status == "replied" and [m.direction for m in p.messages] == ["outbound", "inbound", "outbound"]
    send_after = datetime.fromisoformat(p.messages[-1].send_after)
    assert timedelta(minutes=29) < send_after - datetime.now(timezone.utc) <= timedelta(minutes=30)

    assert bridge.outbox(due_only=True) == []                     # not due yet
    queued = bridge.outbox(due_only=False)
    assert len(queued) == 1 and queued[0]["body"] == "Makes sense. How do you prioritise?"

    assert bridge.sync()["replies"] == 0                          # processed rows are not re-read
    bridge.add_inbound("https://www.linkedin.com/in/rahulshah", "", "The speed. Everything ships weekly.")
    assert bridge.sync()["replies"] == 0                          # same text again = duplicate

    bridge.mark_sent(queued[0]["id"])                             # Chrome sent it from LGM
    assert bridge.sync()["sent_recorded"] == 1
    assert store.get_prospect(store.load("asha-1"), "rahul-1").messages[-1].sent_at
    assert bridge.sync()["sent_recorded"] == 0                    # idempotent


def test_negative_reply_is_held(env):
    _seed(auto_send=True)
    SENTIMENT["value"] = "negative"
    bridge.add_inbound("https://www.linkedin.com/in/rahulshah/", "Rahul Shah", "Please stop messaging me.")
    stats = bridge.sync()
    assert stats["held"] == 1 and bridge.outbox(due_only=False) == []


def test_review_mode_holds_until_approved(env, capsys):
    _seed(auto_send=False)
    bridge.add_inbound("https://www.linkedin.com/in/rahulshah/", "Rahul Shah", "Sure, happy to chat.")
    assert bridge.sync()["held"] == 1
    cli.main(["approve", "asha-1", "rahul-1", "--body", "Thanks Rahul. What does a good week look like?"])
    rows = bridge.outbox(due_only=False)
    assert len(rows) == 1 and rows[0]["body"].startswith("Thanks Rahul")


def test_csv_import_and_lgm_export(env, tmp_path, monkeypatch):
    _seed()
    csv_path = tmp_path / "people.csv"
    with csv_path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Full Name", "LinkedIn Profile", "Company", "Job Title", "Recent Posts", "Education"])
        w.writerow(["Neha Rao", "https://www.linkedin.com/in/neharao", "Zepto", "Senior PM", "Post on pricing", "ISB 2019"])
        w.writerow(["Rahul Shah", "https://in.linkedin.com/in/rahulshah", "Zepto", "PM", "", ""])   # already known
    cli.main(["import-csv", "asha-1", str(csv_path)])
    c = store.load("asha-1")
    neha = next(p for p in c.prospects if p.full_name == "Neha Rao")
    assert len(c.prospects) == 2 and neha.status == "enriched" and neha.source == "csv"
    assert neha.facts[0].id == f"p:{neha.id}:1" and neha.bucket.value == "team_member"

    neha.status = "approved"
    neha.messages = [Message(direction="outbound", step=1, body="Hey Neha, saw your pricing post.", created_at="x")]
    store.save(c)
    out = tmp_path / "lgm.csv"
    cli.main(["export-lgm", "asha-1", "--out", str(out)])
    rows = list(csv.DictReader(out.open()))
    assert rows == [{"firstname": "Neha", "lastname": "Rao", "linkedinUrl": "https://www.linkedin.com/in/neharao",
                     "companyName": "Zepto", "jobTitle": "Senior PM", "customAttribute1": "Hey Neha, saw your pricing post."}]
