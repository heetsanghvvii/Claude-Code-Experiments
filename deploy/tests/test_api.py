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


# ---------- onboarding ----------

def make_pdf(lines: list[str]) -> bytes:
    """A tiny but real PDF with a text layer (Helvetica), xref offsets computed properly."""
    ops = "BT /F1 11 Tf 72 760 Td 14 TL " + " ".join(f"({ln}) '" for ln in lines) + " ET"
    objs = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        f"<< /Length {len(ops)} >>\nstream\n{ops}\nendstream",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    out, offsets = b"%PDF-1.4\n", []
    for i, body in enumerate(objs, start=1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n{body}\nendobj\n".encode()
    xref = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    out += "".join(f"{o:010d} 00000 n \n" for o in offsets).encode()
    out += f"trailer\n<< /Size {len(objs) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    return out


PROFILE = make_pdf(["Priya Nair", "Product Manager at Zepto, Bengaluru, 2022 to present",
                    "Led the checkout redesign that lifted conversion by 12 percent",
                    "Previously Associate at McKinsey and Company in Mumbai for three years",
                    "Education: IIM Ahmedabad MBA 2020, NIT Trichy BTech 2016"])
BLANK = make_pdf([])


@pytest.fixture
def ob(client):
    import api.index as api_module
    api_module._upload_counts.clear()
    c, fake = client
    fake.tables["onboarding"] = []
    fake.tables["candidate_files"] = []
    return c, fake


def upload(c, data, kind="linkedin_pdf", name="Profile.pdf", email="priya@example.com"):
    return c.post("/api/onboarding/file", data={"email": email, "kind": kind}, files={"file": (name, data, "application/pdf")})


def test_file_upload_validation(ob):
    c, fake = ob
    assert upload(c, b"hello, not a pdf", name="cv.docx").status_code == 415
    assert upload(c, b"%PDF-1.4\n" + b"0" * (4 * 1024 * 1024)).status_code == 413
    r = upload(c, BLANK)
    assert r.status_code == 422 and "scanned image" in r.json()["detail"]
    assert upload(c, PROFILE, kind="photo").status_code == 422
    assert upload(c, PROFILE, email="nope").status_code == 422
    assert fake.tables["candidate_files"] == []

    r = upload(c, PROFILE)
    assert r.status_code == 200
    body = r.json()
    assert set(body) == {"ok", "id", "kind", "filename", "size_bytes", "characters"}  # never the bytes
    row = fake.tables["candidate_files"][0]
    assert row["id"] == body["id"] and row["onboarding_id"] is None and row["kind"] == "linkedin_pdf"
    assert row["pdf"].startswith("\\x255044462d") and row["size_bytes"] == len(PROFILE)
    assert "Zepto" in row["text_content"] and "IIM Ahmedabad" in row["text_content"]


def test_file_upload_daily_limit(ob):
    c, _ = ob
    for _ in range(6):
        assert upload(c, PROFILE, kind="cv").status_code == 200
    assert upload(c, PROFILE, kind="cv").status_code == 429
    assert upload(c, PROFILE, kind="cv", email="other@example.com").status_code == 200


COMPANIES = [{"name": n, "top": i < 5} for i, n in enumerate(
    ["Zepto", "CRED", "Swiggy", "Razorpay", "Meesho", "Groww", "PhonePe", "Flipkart", "Myntra", "Dunzo", "Urban Company"])]
STORY = {"why_now": "I want to own a product end to end after three years in consulting at McKinsey.",
         "proud_1": "Led the checkout redesign at Zepto that lifted conversion by 12 percent.",
         "proud_2": "Built a pricing tool used by 40 category managers.",
         "roots": "IIM Ahmedabad, NIT Trichy, grew up in Kochi, speak Malayalam and Hindi.",
         "recent": "ok"}


def submit(c, **over):
    body = {"details": {"full_name": "Priya Nair", "email": "Priya@Example.com"},
            "answers": {"roles": ["Product Manager"], "companies": COMPANIES, "locations": ["Bengaluru"], "remote": "yes",
                        "years": 6, "tone": "neutral", "never_say": "my gap year", "approval_channel": "crm",
                        "approval_24h": True, "current_employer": "Zepto", **STORY},
            "consents": {"message_approval": True, "data_use": True}, "file_ids": []}
    body.update(over)
    return c.post("/api/onboarding", json=body)


def test_onboarding_submit_validates_and_scores(ob):
    c, fake = ob
    fake.tables["intake_requests"] += [
        {"id": 7, "full_name": "Priya", "email": "priya@example.com", "created_at": "2026-09-01T00:00:00+00:00",
         "package": "standard", "processed_at": None, "candidate_id": None, "linkedin_url": "https://linkedin.com/in/priya"},
        {"id": 8, "full_name": "Other", "email": "other@example.com", "created_at": "2026-09-02T00:00:00+00:00",
         "package": "full", "processed_at": None, "candidate_id": None, "linkedin_url": None}]
    assert submit(c, consents={"message_approval": True, "data_use": False}).status_code == 422
    assert submit(c, details={"full_name": "Priya", "email": "bad"}).status_code == 422
    assert submit(c, package="done_for_you").status_code == 422           # tier 2 consent missing
    assert submit(c, file_ids=["not-a-uuid"]).status_code == 422
    assert submit(c, website="spam").json()["ok"] and fake.tables["onboarding"] == []

    r = submit(c).json()                                                   # no LinkedIn PDF yet
    assert r["status"] == "incomplete" and r["missing"] == ["Your LinkedIn profile PDF"]
    row = fake.tables["onboarding"][0]
    assert row["intake_id"] == 7 and row["email"] == "priya@example.com" and row["answers"]["package"] == "standard"
    assert row["consents"]["data_use"] is True and row["consents"]["recorded_at"]

    few = submit(c, answers={"roles": [], "companies": COMPANIES[:4], "why_now": "Change"}).json()
    assert few["status"] == "incomplete" and len(few["missing"]) == 4
    assert "you have 4" in few["missing"][0]

    fid = upload(c, PROFILE).json()["id"]
    cv = upload(c, PROFILE, kind="cv", name="CV.pdf").json()["id"]
    r = submit(c, file_ids=[fid, cv]).json()
    assert r["status"] == "ready" and r["missing"] == []
    assert {f["onboarding_id"] for f in fake.tables["candidate_files"]} == {r["id"]}
    assert submit(c, file_ids=[fid]).status_code == 422                   # already linked to a submission

    r = submit(c, package="done_for_you", consents={"message_approval": True, "data_use": True, "tier2": True})
    assert r.status_code == 200


def test_crm_onboarding_list_and_import(ob, monkeypatch):
    c, fake = ob
    fake.tables["intake_requests"].append({"id": 3, "full_name": "Priya", "email": "priya@example.com", "package": "done_for_you",
                                           "processed_at": None, "candidate_id": None, "linkedin_url": None})
    fid = upload(c, PROFILE).json()["id"]
    oid = submit(c, file_ids=[fid], consents={"message_approval": True, "data_use": True, "tier2": True}).json()["id"]

    assert c.get("/api/crm/onboarding").status_code == 401
    assert c.post(f"/api/crm/onboarding/{oid}/import").status_code == 401
    rows = c.get("/api/crm/onboarding", headers=H).json()["onboarding"]
    assert len(rows) == 1 and rows[0]["status"] == "ready" and rows[0]["missing"] == []
    f = rows[0]["files"][0]
    assert f["filename"] == "Profile.pdf" and f["size_bytes"] == len(PROFILE) and "pdf" not in f and "text_content" not in f

    monkeypatch.delenv("ANTHROPIC_API_KEY")
    assert c.post("/api/crm/onboarding/00000000-0000-0000-0000-000000000000/import", headers=H).status_code == 404
    r = c.post(f"/api/crm/onboarding/{oid}/import", headers=H).json()
    assert r["created"] and "next sync" in r["message"]
    cand = store.load(r["candidate_id"])
    assert cand.tier == "done_for_you" and cand.target_roles == ["Product Manager"] and len(cand.target_companies) == 11
    assert cand.locations == ["Bengaluru", "Remote"] and cand.story["tone"] == "neutral"
    assert cand.story["never_say"] == "my gap year" and cand.story["off_limits"]["current_employer"] == "Zepto"
    assert cand.story["top_companies"] == ["Zepto", "CRED", "Swiggy", "Razorpay", "Meesho"]
    assert "Zepto" in cand.story["linkedin_text"] and cand.facts == []
    assert fake.tables["onboarding"][0]["status"] == "imported"
    assert fake.tables["intake_requests"][0]["candidate_id"] == cand.id

    # The next sync (with Claude available) extracts facts and drops the raw text from the story.
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    from outreach.models import ExtractedFact, ExtractedProfile
    seen = {}

    def parse(system, content, schema, effort="medium"):
        seen["content"] = content
        return ExtractedProfile(full_name="Priya Nair", headline="PM at Zepto", current_company="Zepto", current_title="PM",
                                location="Bengaluru", facts=[ExtractedFact(kind="employer", text="PM at Zepto since 2022")])

    monkeypatch.setattr(llm, "parse", parse)
    assert c.post("/api/crm/sync", headers=H).json()["facts_extracted"] == 1
    cand = store.load(cand.id)
    assert "IIM Ahmedabad" in seen["content"] and cand.headline == "PM at Zepto" and len(cand.facts) == 1
    assert "linkedin_text" not in cand.story

    # Re-import updates the same candidate and, with Claude available, extracts straight away.
    r2 = c.post(f"/api/crm/onboarding/{oid}/import", headers=H).json()
    assert r2["candidate_id"] == cand.id and not r2["created"] and r2["facts"] == 1 and "Extracted 1 facts" in r2["message"]


# ---------- client portal ----------

from outreach.models import Fact, Hook  # noqa: E402


def seed_portal():
    """Two candidates, so we can check one never sees the other."""
    seed()
    c = store.load("asha-1")
    c.story = {"package": "standard"}
    c.facts = [Fact(id="c:1", owner="candidate", kind="employer", text="Ran growth at Blinkit for 3 years", source="cv")]
    r1 = store.get_prospect(c, "r1")
    r1.facts = [Fact(id="p:r1:1", owner="prospect", kind="post", text="Wrote about dark store speed in May", source="https://example.com/post")]
    r1.hooks = [Hook(hook_type="relevant_work", summary="Both obsess over delivery speed", candidate_fact_id="c:1",
                     prospect_fact_id="p:r1:1", specificity=4, rarity=3, relevance=5, recency=4, score=4.2, selected=True)]
    r1.messages[0].writer, r1.messages[0].judge_reason = "curious_peer", "SECRET JUDGE NOTE"
    store.save(c)
    store.save(Candidate(id="ben-2", full_name="Ben Other", prospects=[
        Prospect(id="x1", full_name="Xavier", status="message_ready",
                 messages=[Message(direction="outbound", step=1, body="Hi Xavier", created_at="x")])]))


def link(c, cid):
    r = c.post(f"/api/crm/candidates/{cid}/portal-link", headers=H)
    assert r.status_code == 200
    return r.json()


def P(token):
    return {"x-portal-token": token}


def test_portal_link_create_rotate_and_bad_tokens(client):
    c, fake = client
    seed_portal()
    assert c.post("/api/crm/candidates/asha-1/portal-link").status_code == 401
    assert c.post("/api/crm/candidates/nobody/portal-link", headers=H).status_code == 404
    first = link(c, "asha-1")
    assert first["url"].startswith("http://testserver/portal?t=") and not first["rotated"]
    token = first["url"].split("t=", 1)[1]
    assert len(token) >= 43
    doc = store.get_doc("asha-1")
    assert token not in str(doc) and len(doc["story"]["portal_token_hash"]) == 64   # only the hash is stored
    assert c.get("/api/portal/me", headers=P(token)).json()["name"] == "Asha"
    assert c.get("/api/crm/candidates/asha-1", headers=H).json()["portal"]["active"] is True

    second = link(c, "asha-1")
    assert second["rotated"]
    assert c.get("/api/portal/me", headers=P(token)).status_code == 401                 # old link stops working
    assert c.get("/api/portal/me", headers=P(second["url"].split("t=", 1)[1])).status_code == 200
    for bad in (None, "", "short", "x" * 43, token + "x"):
        assert c.get("/api/portal/me", headers=P(bad) if bad is not None else {}).status_code == 401
        assert c.post("/api/portal/prospects/r1/sent", headers=P(bad) if bad is not None else {}).status_code == 401


def test_portal_isolation_and_no_internal_fields(client):
    c, _ = client
    seed_portal()
    asha = link(c, "asha-1")["url"].split("t=", 1)[1]
    ben = link(c, "ben-2")["url"].split("t=", 1)[1]
    me = c.get("/api/portal/me", headers=P(asha)).json()
    assert me["package_label"] == "Standard" and me["progress"]["ready_to_send"] == 1 and me["progress"]["interviews"] == 1
    body = c.get("/api/portal/prospects", headers=P(asha)).json()
    assert {p["id"] for p in body["prospects"]} == {"r1", "n1"}
    text = str(body)
    for leak in ("SECRET JUDGE NOTE", "curious_peer", "judge_reason", "writer", "alternatives", "Xavier", "usd", "playbook"):
        assert leak not in text
    r1 = next(p for p in body["prospects"] if p["id"] == "r1")
    assert r1["section"] == "ready" and r1["draft"]["body"] == "Hey Rahul, draft" and r1["bucket_label"]
    assert [f["text"] for f in r1["hook"]["facts"]] == ["Ran growth at Blinkit for 3 years", "Wrote about dark store speed in May"]
    assert r1["hook"]["facts"][1]["source_url"] == "https://example.com/post"
    # Ben cannot touch Asha's people, and Asha cannot touch Ben's.
    assert c.post("/api/portal/prospects/r1/sent", headers=P(ben)).status_code == 404
    assert c.post("/api/portal/prospects/x1/skip", headers=P(asha)).status_code == 404
    assert [p["id"] for p in c.get("/api/portal/prospects", headers=P(ben)).json()["prospects"]] == ["x1"]
    assert store.get_prospect(store.load("ben-2"), "x1").status == "message_ready"


def test_portal_approve_edit_sent_reply_status(client, monkeypatch):
    c, fake = client
    seed_portal()
    tok = link(c, "asha-1")["url"].split("t=", 1)[1]
    edits = []
    import outreach.feedback as fb
    monkeypatch.setattr(fb, "record_edit", lambda *a: edits.append(a))

    assert c.post("/api/portal/prospects/r1/reply", headers=P(tok), json={"text": "too early"}).status_code == 409
    r = c.post("/api/portal/prospects/r1/approve", headers=P(tok), json={"body": "Hey Rahul, edited by me"})
    assert r.json()["status"] == "approved"
    assert edits and edits[0][1] == "Hey Rahul, edited by me" and edits[0][2] == "curious_peer"   # same learning path as CRM
    p = store.get_prospect(store.load("asha-1"), "r1")
    assert p.messages[0].body == "Hey Rahul, edited by me" and p.messages[0].edited and p.messages[0].approved

    r = c.post("/api/portal/prospects/r1/sent", headers=P(tok))
    assert r.json()["status"] == "sent" and r.json()["sent_at"]
    assert c.post("/api/portal/prospects/r1/sent", headers=P(tok)).status_code == 409        # nothing left to send
    assert c.post("/api/portal/prospects/r1/skip", headers=P(tok)).status_code == 409        # already contacted
    assert fake.tables["outbox"] == []                                                       # self-send: nothing queued
    assert next(x for x in c.get("/api/portal/prospects", headers=P(tok)).json()["prospects"] if x["id"] == "r1")["section"] == "waiting"

    assert c.post("/api/portal/prospects/r1/reply", headers=P(tok), json={"text": "Sure, happy to talk."}).json()["status"] == "replied"
    row = fake.tables["inbound_replies"][-1]
    assert row["candidate_id"] == "asha-1" and row["prospect_id"] == "r1" and row["text"] == "Sure, happy to talk."
    view = next(x for x in c.get("/api/portal/prospects", headers=P(tok)).json()["prospects"] if x["id"] == "r1")
    assert view["section"] == "writing" and view["pending_replies"][0]["body"] == "Sure, happy to talk."

    # The scheduled sync matches the reply to this prospect directly, and the follow-up draft shows up.
    from outreach import models as M

    def parse(system, content, schema, effort="medium"):
        if getattr(M, "ReviewVerdict", None) is schema:      # the automated review layer passes the draft
            return schema(truthfulness=5, tone_fit=5, ask_fit=5, safety=5, decision="pass", reason="fine")
        return ReplyAnalysis(sentiment="warm", rapport=4, redirect_to="", ask_type="none", ask_reason="x",
                             next_message="That is good to hear, Rahul. What does a strong first month look like on your team?")
    monkeypatch.setattr(llm, "parse", parse)
    stats = c.post("/api/crm/sync", headers=H).json()
    assert stats["replies"] == 1 and stats["unmatched"] == 0
    view = next(x for x in c.get("/api/portal/prospects", headers=P(tok)).json()["prospects"] if x["id"] == "r1")
    assert view["section"] == "ready" and view["draft"]["step"] == 3 and len(view["messages"]) == 2
    # auto_send queued a copy for the sender; marking it sent in the portal closes that row too.
    assert c.post("/api/portal/prospects/r1/sent", headers=P(tok), json={"body": "Thanks Rahul. 15 minutes on Thursday?"}).json()["status"] == "conversation"
    assert all(r["sent_at"] for r in fake.tables["outbox"])
    p = store.get_prospect(store.load("asha-1"), "r1")
    assert p.messages[-1].body == "Thanks Rahul. 15 minutes on Thursday?" and p.messages[-1].sent_at

    assert c.post("/api/portal/prospects/r1/status", headers=P(tok), json={"status": "skipped"}).status_code == 422
    assert c.post("/api/portal/prospects/r1/status", headers=P(tok), json={"status": "interview"}).json()["status"] == "interview"
    assert c.get("/api/portal/me", headers=P(tok)).json()["progress"]["interviews"] == 2


def test_portal_skip(client):
    c, _ = client
    seed_portal()
    tok = link(c, "asha-1")["url"].split("t=", 1)[1]
    assert c.post("/api/portal/prospects/r1/skip", headers=P(tok)).json()["status"] == "skipped"
    view = c.get("/api/portal/prospects", headers=P(tok)).json()["prospects"][0]
    assert view["section"] == "skipped"
    assert c.post("/api/portal/prospects/r1/approve", headers=P(tok), json={}).status_code == 409


def test_import_creates_portal_link_once(ob, monkeypatch):
    c, fake = ob
    monkeypatch.delenv("ANTHROPIC_API_KEY")
    fid = upload(c, PROFILE).json()["id"]
    oid = submit(c, file_ids=[fid]).json()["id"]
    r = c.post(f"/api/crm/onboarding/{oid}/import", headers=H).json()
    tok = r["portal_url"].split("/portal?t=", 1)[1]
    assert c.get("/api/portal/me", headers=P(tok)).json()["name"] == "Priya Nair"
    again = c.post(f"/api/crm/onboarding/{oid}/import", headers=H).json()
    assert again["portal_url"] is None                                          # re-import keeps the client's link
    assert c.get("/api/portal/me", headers=P(tok)).status_code == 200


def test_portal_hides_drafts_the_review_has_not_cleared(client):
    c, _ = client
    seed_portal()
    cand = store.load("asha-1")
    msg = store.get_prospect(cand, "r1").messages[0]
    if not hasattr(msg, "review_status"):
        pytest.skip("review layer not present")
    msg.review_status = "rewrite"
    store.save(cand)
    tok = link(c, "asha-1")["url"].split("t=", 1)[1]
    r1 = next(p for p in c.get("/api/portal/prospects", headers=P(tok)).json()["prospects"] if p["id"] == "r1")
    assert r1["draft"] is None and r1["section"] == "upcoming"
    assert c.get("/api/portal/me", headers=P(tok)).json()["progress"]["ready_to_send"] == 0


# ---------- customer app (/app): Supabase email sign-in ----------

import httpx  # noqa: E402

USERS = {"tok-asha-valid-0000000000": "Asha@Example.com", "tok-ben-valid-00000000000": "ben@example.com",
         "tok-stranger-000000000000": "nobody@example.com", "tok-unconfirmed-00000000": "asha@example.com"}


@pytest.fixture
def auth(client, monkeypatch):
    """Mock Supabase's GET /auth/v1/user and count the calls."""
    import api.index as api_module
    api_module._auth_cache.clear()
    api_module._upload_counts.clear()
    calls = []

    def fake_get(url, headers=None, timeout=None):
        calls.append((url, headers))
        assert url == "https://x.supabase.co/auth/v1/user" and headers["apikey"] == "sb_publishable_x"
        token = headers["Authorization"].removeprefix("Bearer ")
        req = httpx.Request("GET", url)
        if token not in USERS:
            return httpx.Response(401, json={"msg": "invalid JWT"}, request=req)
        user = {"id": "u1", "email": USERS[token], "email_confirmed_at": None if "unconfirmed" in token else "2026-10-01T00:00:00Z"}
        return httpx.Response(200, json=user, request=req)

    monkeypatch.setattr(api_module.httpx, "get", fake_get)
    c, fake = client
    seed_portal()
    for cid, email in (("asha-1", "asha@example.com"), ("ben-2", "BEN@example.com")):
        cand = store.load(cid)
        cand.story = {**cand.story, "email": email}
        store.save(cand)
    return c, fake, calls


def B(token):
    return {"authorization": f"Bearer {token}"}


ASHA, BEN = B("tok-asha-valid-0000000000"), B("tok-ben-valid-00000000000")


def test_public_config_serves_env_not_hardcoded(client):
    c, _ = client
    assert c.get("/api/public-config").json() == {"supabase_url": "https://x.supabase.co", "supabase_key": "sb_publishable_x"}


def test_valid_token_maps_to_candidate_and_is_cached(auth):
    c, _, calls = auth
    me = c.get("/api/me", headers=ASHA).json()
    assert me["name"] == "Asha" and me["email"] == "asha@example.com"
    assert me["today"]["cap"] == 15 and me["today"]["batch"] == ["r1"] and me["tasks"]["to_send"] == 1
    assert me["plan"]["package_label"] == "Standard" and me["plan"]["people_included"] == 120
    assert c.get("/api/me/prospects", headers=ASHA).status_code == 200
    assert len(calls) == 1                                    # second request served from the 60 second cache


def test_unknown_email_is_403_with_onboarding_link(auth):
    c, _, _ = auth
    r = c.get("/api/me", headers=B("tok-stranger-000000000000"))
    assert r.status_code == 403
    d = r.json()["detail"]
    assert d["message"] == "We could not find a Knock account for this email." and d["onboarding_url"] == "/start"


def test_invalid_missing_or_unconfirmed_token_is_401(auth):
    c, _, _ = auth
    for h in ({}, {"authorization": "tok-asha-valid-0000000000"}, B("short"), B("tok-forged-00000000000000"),
              B("tok-unconfirmed-00000000"), B("x" * 5000)):
        assert c.get("/api/me", headers=h).status_code == 401
        assert c.post("/api/me/prospects/r1/sent", headers=h).status_code == 401
    assert c.get("/api/me/profile", headers=B("tok-forged-00000000000000")).status_code == 401


def test_me_isolation_and_no_internal_fields(auth):
    c, _, _ = auth
    body = c.get("/api/me/prospects", headers=ASHA).json()
    assert {p["id"] for p in body["prospects"]} == {"r1", "n1"}
    text = str(body) + str(c.get("/api/me", headers=ASHA).json()) + str(c.get("/api/me/activity", headers=ASHA).json())
    text += str(c.get("/api/me/profile", headers=ASHA).json())
    for leak in ("SECRET JUDGE NOTE", "curious_peer", "judge_reason", "writer", "alternatives", "Xavier", "usd", "playbook",
                 "portal_token_hash", "review_notes"):
        assert leak not in text
    assert c.post("/api/me/prospects/x1/skip", headers=ASHA).status_code == 404       # Ben's person
    assert c.post("/api/me/prospects/r1/sent", headers=BEN).status_code == 404        # Asha's person
    assert [p["id"] for p in c.get("/api/me/prospects", headers=BEN).json()["prospects"]] == ["x1"]
    assert store.get_prospect(store.load("ben-2"), "x1").status == "message_ready"


def test_me_actions_mirror_portal(auth, monkeypatch):
    c, fake, _ = auth
    import outreach.feedback as fb
    monkeypatch.setattr(fb, "record_edit", lambda *a: None)
    assert c.post("/api/me/prospects/r1/reply", headers=ASHA, json={"text": "too early"}).status_code == 409
    assert c.post("/api/me/prospects/r1/approve", headers=ASHA, json={"body": "Hey Rahul, mine"}).json()["status"] == "approved"
    assert c.post("/api/me/prospects/r1/sent", headers=ASHA).json()["status"] == "sent"
    assert c.get("/api/me", headers=ASHA).json()["today"]["sent_today"] == 1
    assert c.post("/api/me/prospects/r1/reply", headers=ASHA, json={"text": "Happy to talk."}).json()["status"] == "replied"
    assert fake.tables["inbound_replies"][-1]["candidate_id"] == "asha-1"
    assert c.post("/api/me/prospects/r1/status", headers=ASHA, json={"status": "skipped"}).status_code == 422
    assert c.post("/api/me/prospects/r1/status", headers=ASHA, json={"status": "referral"}).json()["status"] == "referral"
    view = next(p for p in c.get("/api/me/prospects", headers=ASHA).json()["prospects"] if p["id"] == "r1")
    assert view["status_at"] and view["first_sent_at"]
    kinds = [e["kind"] for e in c.get("/api/me/activity", headers=ASHA).json()["events"]]
    assert {"sent", "status", "reply_added"} <= set(kinds)


def test_pacing_cap_counts_sends_today_in_ist(auth):
    c, _, _ = auth
    cand = store.load("asha-1")
    now = __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(timespec="seconds")
    cand.prospects += [Prospect(id=f"o{i}", full_name=f"Person {i}", company="Zepto", status="message_ready",
                                messages=[Message(direction="outbound", step=1, body=f"Hi {i}", created_at=now)]) for i in range(20)]
    cand.prospects += [Prospect(id=f"s{i}", full_name=f"Sent {i}", status="sent",
                                messages=[Message(direction="outbound", step=1, body="Hi", created_at=now, sent_at=now)]) for i in range(3)]
    cand.prospects.append(Prospect(id="old", full_name="Old", status="sent", messages=[
        Message(direction="outbound", step=1, body="Hi", created_at=now, sent_at="2026-01-01T10:00:00+00:00")]))
    store.save(cand)
    today = c.get("/api/me", headers=ASHA).json()["today"]
    assert today["sent_today"] == 3 and today["remaining"] == 12 and len(today["batch"]) == 12
    assert today["ready"] == 21 and today["later"] == 9
    people = c.get("/api/me/prospects", headers=ASHA).json()["prospects"]
    assert sum(p["in_batch"] for p in people) == 12
    assert next(p for p in people if p["id"] == "old")["stale"] is True
    assert c.get("/api/me", headers=ASHA).json()["tasks"]["stale"] == ["old"]
    # Everything sent today: the batch is empty, and the client is done for the day.
    for p in cand.prospects:
        if p.id[:1] == "o" and p.id[1:].isdigit() and int(p.id[1:]) < 12:
            p.messages[0].sent_at, p.status = now, "sent"
    store.save(cand)
    today = c.get("/api/me", headers=ASHA).json()["today"]
    assert today["remaining"] == 0 and today["batch"] == []


def test_profile_patch_validation_and_research_queue(auth):
    c, _, _ = auth
    prof = c.get("/api/me/profile", headers=ASHA).json()
    assert prof["target_companies"] == ["Zepto"] and prof["email"] == "asha@example.com"
    bad = [{"tier": "done_for_you"}, {"story": {"portal_token_hash": "x"}}, {"target_roles": ["  "]},
           {"target_companies": []}, {"tone": "shouty"}, {"target_roles": ["a", "b", "c", "d"]},
           {"story": {"why_now": "x" * 1501}}, {"target_companies": ["x" * 121]}]
    for b in bad:
        assert c.patch("/api/me/profile", headers=ASHA, json=b).status_code == 422, b
    cand = store.load("asha-1")
    cand.discovered = {"Zepto": "2026-10-01T00:00:00+00:00"}
    store.save(cand)
    r = c.patch("/api/me/profile", headers=ASHA, json={
        "target_companies": ["Zepto", "CRED", "cred", " Swiggy "], "top_companies": ["Swiggy", "Nowhere"],
        "story": {"why_now": "Ready to own a product at a consumer company after 3 years at Blinkit."},
        "tone": "casual", "never_say": "my notice period", "off_limits": {"current_employer": "Blinkit"}}).json()
    assert r["research_queued"] == ["CRED", "Swiggy"]
    cand = store.load("asha-1")
    assert cand.target_companies == ["Zepto", "CRED", "Swiggy"] and cand.story["top_companies"] == ["Swiggy"]
    assert cand.discovered == {"Zepto": "2026-10-01T00:00:00+00:00"} and cand.story["tone"] == "casual"
    assert cand.story["off_limits"]["current_employer"] == "Blinkit" and cand.story["research_requested_at"]
    assert cand.story["email"] == "asha@example.com"                     # untouched
    # A new role re-opens research at every company.
    r = c.patch("/api/me/profile", headers=ASHA, json={"target_roles": ["Growth Lead"]}).json()
    assert r["research_queued"] == ["Zepto", "CRED", "Swiggy"] and store.load("asha-1").discovered == {}
    assert c.patch("/api/me/profile", headers=BEN, json={"tone": "formal"}).status_code == 200
    assert store.load("asha-1").story["tone"] == "casual"                 # Ben's edit only touched Ben


def test_me_files_upload_needs_sign_in(auth):
    c, fake, _ = auth
    fake.tables["candidate_files"] = []
    files = {"file": ("Profile.pdf", PROFILE, "application/pdf")}
    assert c.post("/api/me/files", data={"kind": "linkedin_pdf"}, files=files).status_code == 401
    assert c.post("/api/me/files", headers=B("tok-forged-00000000000000"), data={"kind": "linkedin_pdf"}, files=files).status_code == 401
    assert c.post("/api/me/files", headers=B("tok-stranger-000000000000"), data={"kind": "cv"}, files=files).status_code == 403
    assert fake.tables["candidate_files"] == []
    assert c.post("/api/me/files", headers=ASHA, data={"kind": "photo"}, files=files).status_code == 422
    assert c.post("/api/me/files", headers=ASHA, data={"kind": "cv"}, files={"file": ("cv.docx", b"nope", "x")}).status_code == 415
    r = c.post("/api/me/files", headers=ASHA, data={"kind": "linkedin_pdf"}, files=files)
    assert r.status_code == 200 and set(r.json()) == {"ok", "id", "kind", "filename", "size_bytes", "characters"}
    row = fake.tables["candidate_files"][0]
    assert row["candidate_id"] == "asha-1" and row["kind"] == "linkedin_pdf"
    cand = store.load("asha-1")
    assert "Zepto" in cand.story["linkedin_text"] and cand.story["uploads"][0]["filename"] == "Profile.pdf"
    prof = c.get("/api/me/profile", headers=ASHA).json()
    assert prof["facts_pending"] is True and prof["files"][0]["kind"] == "linkedin_pdf" and "linkedin_text" not in str(prof)
