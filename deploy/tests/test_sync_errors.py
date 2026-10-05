"""The scheduled sync answers a clear 503 (not a 500) when the Claude API is unavailable."""

import sys
from pathlib import Path

import anthropic
import httpx
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT.parent / "engine" / "tests"))

from test_bridge import FakePostgrest  # noqa: E402

from outreach import bridge, llm, store  # noqa: E402
from outreach.models import Candidate, Message, Prospect  # noqa: E402


def test_sync_returns_503_when_claude_is_out_of_credits(monkeypatch):
    fake = FakePostgrest()
    for k, v in {"SUPABASE_URL": "https://x.supabase.co", "SUPABASE_KEY": "sb_publishable_x", "ENGINE_TOKEN": "eng_x",
                 "CRM_PASSWORD": "pw", "CRON_SECRET": "cron", "ANTHROPIC_API_KEY": "sk-test"}.items():
        monkeypatch.setenv(k, v)
    monkeypatch.setattr(store.httpx, "request", fake)
    import api.index as api_module
    client = TestClient(api_module.app)

    c = Candidate(id="asha-1", full_name="Asha")
    c.prospects = [Prospect(id="r1", full_name="Rahul Shah", status="sent", linkedin_url="https://linkedin.com/in/rahul",
                            messages=[Message(direction="outbound", step=1, body="Hi Rahul, x", sent_at="x", created_at="x")])]
    store.save(c)
    bridge.add_inbound("https://www.linkedin.com/in/rahul/", "Rahul Shah", "Sure.")

    def down(*a, **k):
        req = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
        raise anthropic.APIStatusError("Your credit balance is too low", response=httpx.Response(400, request=req), body=None)

    monkeypatch.setattr(llm, "parse", down)
    for r in (client.post("/api/crm/sync", headers={"x-crm-key": "pw"}),
              client.get("/api/cron/sync", headers={"authorization": "Bearer cron"})):
        assert r.status_code == 503
        assert r.json()["detail"]["error"] == "Claude API unavailable (check credits)"
    assert fake.tables["inbound_replies"][0]["processed_at"] is None        # the reply waits for the next run
