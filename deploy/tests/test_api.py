"""API tests against an in-memory fake of Supabase's REST API."""

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT.parent / "engine" / "tests"))

from test_bridge import FakePostgrest  # noqa: E402

from outreach import llm, store  # noqa: E402
from outreach.models import Candidate, Message, Prospect, ReplyAnalysis  # noqa: E402


@pytest.fixture
def client(monkeypatch):
    fake = FakePostgrest()
    fake.tables["intake_requests"] = []
    for k, v in {"SUPABASE_URL": "https://x.supabase.co", "SUPABASE_KEY": "sb_publishable_x", "ENGINE_TOKEN": "eng_x",
                 "CRM_PASSWORD": "pw", "CRON_SECRET": "cron", "ANTHROPIC_API_KEY": "sk-test"}.items():
        monkeypatch.setenv(k, v)
    monkeypatch.setattr(store.httpx, "request", fake)
    import api.index as api_module
    return TestClient(api_module.app), fake


H = {"x-crm-key": "pw"}


def seed():
    c = Candidate(id="asha-1", full_name="Asha", auto_send=True, reply_delay_minutes=30, target_companies=["Zepto"])
    c.prospects = [
        Prospect(id="r1", full_name="Rahul Shah", company="Zepto", status="message_ready", linkedin_url="https://linkedin.com/in/rahul",
                 messages=[Message(direction="outbound", step=1, body="Hey Rahul, draft", created_at="x")]),
        Prospect(id="n1", full_name="Neha Rao", status="interview", messages=[]),
    ]
    store.save(c)


def test_health_and_auth(client):
    c, _ = client
    assert c.get("/api/health").json()["supabase"] is True
    assert c.get("/api/crm/summary").status_code == 401
    assert c.get("/api/crm/summary", headers={"x-crm-key": "wrong"}).status_code == 401


def test_intake_validates_and_drops_bots(client):
    c, fake = client
    assert c.post("/api/intake", json={"full_name": "Priya", "email": "nope"}).status_code == 422
    assert c.post("/api/intake", json={"full_name": "Bot", "email": "b@x.com", "website": "spam"}).json() == {"ok": True}
    r = c.post("/api/intake", json={"full_name": "Priya", "email": "priya@example.com", "package": "weird", "target_companies": "Zepto"})
    assert r.status_code == 200
    assert [row["full_name"] for row in fake.tables["intake_requests"]] == ["Priya"]
    assert fake.tables["intake_requests"][0]["package"] is None


def test_summary_and_candidate_detail(client):
    c, _ = client
    seed()
    s = c.get("/api/crm/summary", headers=H).json()
    assert s["kpis"]["candidates"] == 1 and s["kpis"]["interviews"] == 1 and s["kpis"]["awaiting_approval"] == 1
    assert s["kpis"]["interviews_per_100"] == 50.0
    d = c.get("/api/crm/candidates/asha-1", headers=H).json()
    assert {p["id"] for p in d["prospects"]} == {"r1", "n1"}
    assert c.get("/api/crm/candidates/nobody", headers=H).status_code == 404


def test_approve_edit_and_status(client):
    c, _ = client
    seed()
    r = c.post("/api/crm/candidates/asha-1/prospects/r1/approve", headers=H, json={"body": "Hey Rahul, edited"})
    assert r.json()["status"] == "approved"
    p = store.get_prospect(store.load("asha-1"), "r1")
    assert p.messages[0].body == "Hey Rahul, edited" and p.messages[0].edited
    assert c.post("/api/crm/candidates/asha-1/prospects/r1/status", headers=H, json={"status": "bogus"}).status_code == 422
    assert c.post("/api/crm/candidates/asha-1/prospects/r1/status", headers=H, json={"status": "sent"}).status_code == 200


def test_reply_sync_outbox_flow(client, monkeypatch):
    c, fake = client
    seed()
    store_c = store.load("asha-1")
    store.get_prospect(store_c, "r1").status = "sent"
    store.save(store_c)
    monkeypatch.setattr(llm, "parse", lambda *a, **k: ReplyAnalysis(
        sentiment="warm", rapport=4, redirect_to="", ask_type="none", ask_reason="x", next_message="Good to hear. What changed most?"))
    assert c.post("/api/crm/inbound", headers=H, json={"linkedin_url": "https://www.linkedin.com/in/rahul/", "text": "Speed."}).status_code == 200
    stats = c.post("/api/crm/sync", headers=H).json()
    assert stats["replies"] == 1 and stats["queued"] == 1
    row = fake.tables["outbox"][0]
    assert c.post(f"/api/crm/outbox/{row['id']}/sent", headers=H).status_code == 200
    assert fake.tables["outbox"][0]["sent_at"]


def test_cron_needs_secret_and_key(client, monkeypatch):
    c, _ = client
    assert c.get("/api/cron/sync").status_code == 401
    assert c.get("/api/cron/sync", headers={"authorization": "Bearer cron"}).status_code == 200
    monkeypatch.delenv("ANTHROPIC_API_KEY")
    assert c.post("/api/crm/sync", headers=H).status_code == 503


def test_intake_pull(client):
    c, fake = client
    fake.tables["intake_requests"].append({"id": 1, "full_name": "Priya Nair", "email": "p@x.com", "target_role": "PM",
                                           "target_companies": "Zepto, CRED", "city": "Bangalore", "package": "standard",
                                           "processed_at": None, "candidate_id": None, "linkedin_url": None})
    created = c.post("/api/crm/intake-pull", headers=H).json()["created"]
    assert len(created) == 1 and store.load(created[0]).target_companies == ["Zepto", "CRED"]
