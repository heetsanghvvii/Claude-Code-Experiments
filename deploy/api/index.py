"""Knock backend on Vercel: website intake, operator CRM API, and the scheduled sync.

Environment (Vercel project settings):
  SUPABASE_URL, SUPABASE_KEY, ENGINE_TOKEN   engine state in Supabase (token-gated RLS)
  CRM_PASSWORD                               operator login for /crm and /api/crm/*
  CRON_SECRET                                Vercel cron auth for /api/cron/sync
  ANTHROPIC_API_KEY                          needed only for sync (drafting replies, learning)
"""

from __future__ import annotations

import hashlib
import hmac
import io
import os
import re
import sys
import uuid
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Literal

from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # the copied `outreach` package

from outreach import bridge, feedback, profiles, store  # noqa: E402
from outreach.models import Candidate  # noqa: E402

app = FastAPI(title="Knock API", docs_url=None, redoc_url=None)

FUNNEL = ["sent", "accepted", "replied", "conversation", "referral", "interview", "offer"]
CONTACTED = set(FUNNEL) | {"no_response", "declined"}
SHARED = {"feedback", "usage", "bridge_inbound", "bridge_outbox"}


def _check(secret_env: str, given: str | None) -> None:
    expected = os.environ.get(secret_env, "")
    if not expected or not given or not hmac.compare_digest(expected, given):
        raise HTTPException(status_code=401, detail="Wrong or missing password")


def crm_auth(x_crm_key: str | None) -> None:
    _check("CRM_PASSWORD", x_crm_key)


@app.get("/api/health")
def health():
    return {"ok": True, "supabase": bool(store._supabase()), "claude": bool(os.environ.get("ANTHROPIC_API_KEY"))}


# ---------- public: website sign-ups ----------

class Intake(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=254)
    linkedin_url: str | None = Field(default=None, max_length=300)
    target_role: str | None = Field(default=None, max_length=200)
    target_companies: str | None = Field(default=None, max_length=1000)
    city: str | None = Field(default=None, max_length=120)
    package: str | None = None
    website: str | None = None  # honeypot: humans leave it empty


EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PACKAGES = {"sprint", "standard", "full", "done_for_you"}


@app.post("/api/intake")
def intake(body: Intake):
    if body.website:
        return {"ok": True}  # silently drop bots
    if not EMAIL.match(body.email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    row = body.model_dump(exclude={"website"})
    if row.get("package") not in PACKAGES:
        row["package"] = None
    store.rest("POST", "intake_requests", json_body=row)
    return {"ok": True}


# ---------- operator CRM ----------

def _candidates() -> list[dict]:
    rows = store.rest("GET", "engine_state", params={"select": "id,doc,updated_at"}) if store._supabase() else \
        [{"id": i, "doc": store.get_doc(i), "updated_at": None} for i in store.list_doc_ids()]
    return [r for r in rows if r["id"] not in SHARED]


def _prospect_view(p: dict) -> dict:
    msgs = p.get("messages", [])
    last = msgs[-1] if msgs else None
    held = bool(last and last["direction"] == "outbound" and not last.get("approved") and last.get("step", 1) > 1)
    return {
        "id": p["id"], "name": p.get("full_name"), "company": p.get("company"), "headline": p.get("headline"),
        "bucket": p.get("bucket"), "status": p.get("status"), "linkedin_url": p.get("linkedin_url"),
        "hook": (p.get("hooks") or [{}])[0].get("summary", ""),
        "held_draft": held, "messages": msgs,
    }


def _summary(c: dict) -> dict:
    prospects = c.get("prospects", [])
    counts = Counter(p.get("status") for p in prospects)
    targeted = sum(v for k, v in counts.items() if k not in ("discovered", "skipped"))
    reached = lambda stages: sum(counts[s] for s in stages)
    interviews = counts["interview"] + counts["offer"]
    return {
        "id": c["id"], "name": c.get("full_name"), "tier": c.get("tier"), "auto_send": c.get("auto_send"),
        "target_companies": c.get("target_companies", []), "target_roles": c.get("target_roles", []),
        "targeted": targeted,
        "contacted": reached(CONTACTED),
        "replied": reached(FUNNEL[2:]),
        "conversations": reached(FUNNEL[3:]),
        "referrals": reached(FUNNEL[4:]),
        "interviews": interviews,
        "interviews_per_100": round(100 * interviews / targeted, 1) if targeted else None,
        "awaiting_approval": counts["message_ready"] + sum(1 for p in prospects if _prospect_view(p)["held_draft"]),
        "statuses": dict(counts),
    }


@app.get("/api/crm/summary")
def crm_summary(x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    rows = _candidates()
    cands = [r["doc"] for r in rows if r.get("doc")]
    models = [Candidate.model_validate(d) for d in cands]
    fb = feedback.load()
    rows_out = feedback.outcomes(models)
    usage = store.get_doc("usage") or []
    sb = bool(store._supabase())
    inbound = store.rest("GET", "inbound_replies", params={"order": "received_at.desc", "limit": "100"}) if sb else []
    outbox = store.rest("GET", "outbox", params={"order": "send_after.desc", "limit": "200"}) if sb else []
    intake_rows = store.rest("GET", "intake_requests", params={"order": "created_at.desc", "limit": "100"}) if sb else []
    candidates = [_summary(c) for c in cands]
    total = lambda k: sum(x[k] or 0 for x in candidates)
    targeted = total("targeted")
    now = datetime.now(timezone.utc).isoformat()
    return {
        "as_of": now,
        "kpis": {
            "candidates": len(candidates), "targeted": targeted, "contacted": total("contacted"),
            "replied": total("replied"), "conversations": total("conversations"), "referrals": total("referrals"),
            "interviews": total("interviews"),
            "reply_rate": round(100 * total("replied") / total("contacted"), 1) if total("contacted") else None,
            "interviews_per_100": round(100 * total("interviews") / targeted, 1) if targeted else None,
            "awaiting_approval": total("awaiting_approval"),
            "outbox_due": sum(1 for r in outbox if not r.get("sent_at") and r.get("send_after", "") <= now),
            "unmatched_replies": sum(1 for r in inbound if r.get("result") == "unmatched"),
            "new_signups": sum(1 for r in intake_rows if not r.get("processed_at")),
            "spend_usd": round(sum(u.get("usd", 0) for u in usage), 2),
        },
        "candidates": candidates,
        "inbound": inbound, "outbox": outbox, "intake": intake_rows,
        "learning": {
            "writers": fb["writers"], "retired": fb["retired"], "playbook": fb["playbook"],
            "reply_playbook": fb["reply_playbook"], "edits": len(fb["edits"]), "judge_overrides": len(fb["judge_misses"]),
            "writer_stats": {w: {"replied": r, "sent": n} for w, (r, n) in feedback.writer_stats(rows_out).items()},
            "ask_stats": {a: {"advanced": x, "total": n} for a, (x, n) in feedback.ask_stats(models).items()},
        },
        "spend": usage[-50:],
    }


@app.get("/api/crm/candidates/{candidate_id}")
def crm_candidate(candidate_id: str, x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    try:
        c = store.load(candidate_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="No such candidate")
    doc = c.model_dump()
    return {"summary": _summary(doc), "prospects": [_prospect_view(p) for p in doc["prospects"]],
            "portal": {"active": bool(c.story.get("portal_token_hash")), "created_at": c.story.get("portal_token_at", "")}}


class Approve(BaseModel):
    body: str | None = Field(default=None, max_length=1200)


def approve_draft(c: Candidate, p, body: str | None, queue_followup: bool = True):
    """Approve the latest draft, optionally edited; an edited opener is recorded for learning.
    Openers become 'approved'. Follow-ups go to the outbox, unless the client sends them by hand (portal)."""
    if not p.messages or p.messages[-1].direction != "outbound":
        raise HTTPException(status_code=409, detail="Nothing to approve")
    msg = p.messages[-1]
    if body and body.strip() != msg.body.strip():
        if msg.step == 1:
            feedback.record_edit(msg.body, body, msg.writer, p.hooks[0].hook_type if p.hooks else "", p.bucket.value)
        msg.body, msg.edited = body.strip(), True
    if msg.step == 1:
        msg.approved, p.status = True, "approved"
    elif not msg.approved:
        if queue_followup:
            bridge.queue(c, p, msg)
        else:
            msg.approved = True
    return msg


@app.post("/api/crm/candidates/{candidate_id}/prospects/{prospect_id}/approve")
def crm_approve(candidate_id: str, prospect_id: str, payload: Approve, x_crm_key: str | None = Header(default=None)):
    """Approve the latest draft (optionally edited). Openers become 'approved'; follow-ups go to the outbox."""
    crm_auth(x_crm_key)
    c = store.load(candidate_id)
    p = store.get_prospect(c, prospect_id)
    msg = approve_draft(c, p, payload.body)
    store.save(c)
    return {"ok": True, "status": p.status, "send_after": msg.send_after}


class StatusChange(BaseModel):
    status: str


@app.post("/api/crm/candidates/{candidate_id}/prospects/{prospect_id}/status")
def crm_status(candidate_id: str, prospect_id: str, payload: StatusChange, x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    allowed = {"sent", "accepted", "replied", "conversation", "referral", "interview", "offer", "no_response", "declined", "skipped"}
    if payload.status not in allowed:
        raise HTTPException(status_code=422, detail="Unknown status")
    c = store.load(candidate_id)
    store.get_prospect(c, prospect_id).status = payload.status
    store.save(c)
    return {"ok": True}


@app.post("/api/crm/outbox/{row_id}/sent")
def crm_mark_sent(row_id: int, x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    bridge.mark_sent(row_id)
    return {"ok": True}


class Reply(BaseModel):
    linkedin_url: str | None = Field(default=None, max_length=300)
    name: str | None = Field(default=None, max_length=120)
    text: str = Field(min_length=1, max_length=4000)


@app.post("/api/crm/inbound")
def crm_add_reply(payload: Reply, x_crm_key: str | None = Header(default=None)):
    """Log a reply by hand (normally the Chrome task does this); it is processed on the next sync."""
    crm_auth(x_crm_key)
    bridge.add_inbound(payload.linkedin_url or "", payload.name or "", payload.text)
    return {"ok": True}


def _run_sync() -> dict:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=503, detail="Add ANTHROPIC_API_KEY in Vercel project settings to run sync")
    return bridge.sync()


@app.post("/api/crm/sync")
def crm_sync(x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    return _run_sync()


@app.post("/api/crm/intake-pull")
def crm_intake_pull(x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    rows = store.rest("GET", "intake_requests", params={"processed_at": "is.null", "order": "created_at"})
    created = []
    split = lambda v: [x.strip() for x in (v or "").split(",") if x.strip()]
    for r in rows:
        c = Candidate(id=store.new_id(r["full_name"]), full_name=r["full_name"], target_roles=split(r.get("target_role")),
                      target_companies=split(r.get("target_companies")), locations=split(r.get("city")),
                      story={"email": r.get("email", ""), "linkedin_url": r.get("linkedin_url") or "",
                             "package": r.get("package") or "", "intake_id": r["id"]})
        store.save(c)
        store.rest("PATCH", "intake_requests", params={"id": f"eq.{r['id']}"},
                   json_body={"processed_at": datetime.now(timezone.utc).isoformat(), "candidate_id": c.id})
        created.append(c.id)
    return {"created": created}


@app.get("/api/cron/sync")
def cron_sync(authorization: str | None = Header(default=None)):
    _check("CRON_SECRET", (authorization or "").removeprefix("Bearer "))
    return _run_sync()


# ---------- public: client onboarding (/start) ----------
# Files are uploaded one at a time (each request stays under Vercel's 4.5 MB body limit), then the
# answers are submitted with the returned file ids. PDF bytes are stored but never logged or returned.

MAX_PDF_BYTES = 4 * 1024 * 1024
MAX_TEXT_CHARS = 60_000
FILES_PER_EMAIL_PER_DAY = 6
SUBMITS_PER_EMAIL_PER_DAY = 5
UNLINKED_FILES_PER_DAY = 300          # global brake on uploads that never get submitted
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
IST = timezone(timedelta(hours=5, minutes=30))
_upload_counts: dict[str, int] = {}   # per warm instance: sha256(email)+IST day -> uploads


def _today_ist() -> str:
    return datetime.now(IST).date().isoformat()


def _since_24h() -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()


def _recent(rows: list[dict]) -> list[dict]:
    cutoff = _since_24h()
    return [r for r in rows if not r.get("created_at") or str(r["created_at"]) >= cutoff]


def _clean_filename(name: str | None) -> str:
    name = Path(name or "file.pdf").name
    name = re.sub(r"[\x00-\x1f\x7f]", "", name).strip() or "file.pdf"
    return name[-200:]


def pdf_text(data: bytes) -> str:
    """Text layer of a PDF. Raises ValueError with a message meant for the person uploading."""
    from pypdf import PdfReader

    try:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted and not reader.decrypt(""):
            raise ValueError("This PDF is password protected. Please save it again without a password.")
        text = "\n".join((page.extract_text() or "") for page in reader.pages[:40])
    except ValueError:
        raise
    except Exception:
        raise ValueError("We could not read this PDF. Please export it again and retry.")
    text = re.sub(r"[ \t]+", " ", text).strip()
    if len(re.findall(r"[A-Za-z]{2,}", text)) < 15:
        raise ValueError("This looks like a scanned image, so we cannot read the text. "
                         "Please use LinkedIn's Save to PDF (or export your CV as a PDF from Word or Google Docs).")
    return text[:MAX_TEXT_CHARS]


@app.post("/api/onboarding/file")
async def onboarding_file(email: str = Form(max_length=254), kind: str = Form(), file: UploadFile = File()):
    email = email.strip().lower()
    if not EMAIL.match(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address first")
    if kind not in ("linkedin_pdf", "cv"):
        raise HTTPException(status_code=422, detail="Unknown file type")
    data = await file.read(MAX_PDF_BYTES + 1)
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="This file is larger than 4 MB. Please upload a smaller PDF.")
    if not data or b"%PDF-" not in data[:1024]:
        raise HTTPException(status_code=415, detail="This file is not a PDF. Please upload a PDF file.")
    quota_key = hashlib.sha256(f"{email}|{_today_ist()}".encode()).hexdigest()
    if _upload_counts.get(quota_key, 0) >= FILES_PER_EMAIL_PER_DAY:
        raise HTTPException(status_code=429, detail="That is a lot of uploads for one day. Please try again tomorrow or email hello@knock.careers.")
    unlinked = store.rest("GET", "candidate_files", params={
        "select": "id,created_at", "onboarding_id": "is.null", "created_at": f"gte.{_since_24h()}", "limit": "1000"})
    if len(_recent(unlinked or [])) >= UNLINKED_FILES_PER_DAY:
        raise HTTPException(status_code=429, detail="Uploads are paused for a moment. Please try again later or email hello@knock.careers.")
    try:
        text = pdf_text(data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    file_id = str(uuid.uuid4())
    store.rest("POST", "candidate_files", json_body={
        "id": file_id, "onboarding_id": None, "kind": kind, "filename": _clean_filename(file.filename),
        "size_bytes": len(data), "text_content": text, "pdf": "\\x" + data.hex()})
    _upload_counts[quota_key] = _upload_counts.get(quota_key, 0) + 1
    return {"ok": True, "id": file_id, "kind": kind, "filename": _clean_filename(file.filename),
            "size_bytes": len(data), "characters": len(text)}


def Short():
    return Field(default="", max_length=200)


def Long():
    return Field(default="", max_length=1500)


Item = Annotated[str, Field(max_length=120)]


class Details(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=254)


class Company(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    top: bool = False


class Answers(BaseModel):
    roles: list[Item] = Field(default=[], max_length=2)
    companies: list[Company] = Field(default=[], max_length=30)
    locations: list[Item] = Field(default=[], max_length=2)
    remote: Literal["yes", "no", ""] = ""
    seniority: str = Short()
    years: float | None = Field(default=None, ge=0, le=60)
    industries: list[Item] = Field(default=[], max_length=5)
    current_employer: str = Short()
    avoid_companies: str = Field(default="", max_length=1000)
    known_people: str = Field(default="", max_length=1000)
    why_now: str = Long()
    proud_1: str = Long()
    proud_2: str = Long()
    transition: str = Long()
    roots: str = Long()
    recent: str = Long()
    tone: Literal["formal", "neutral", "casual", ""] = ""
    never_say: str = Field(default="", max_length=1000)
    approval_channel: Literal["crm", "email", "whatsapp", ""] = ""
    approval_24h: bool = False


class Consents(BaseModel):
    message_approval: bool = False
    data_use: bool = False
    tier2: bool = False


class OnboardingIn(BaseModel):
    details: Details
    answers: Answers = Answers()
    consents: Consents = Consents()
    file_ids: list[str] = Field(default=[], max_length=FILES_PER_EMAIL_PER_DAY)
    package: str | None = None
    website: str | None = None  # honeypot


STORY_KEYS = ("why_now", "proud_1", "proud_2", "transition", "roots", "recent")


def _specific(text: str) -> bool:
    """A story answer counts when it names something: a number, or a proper noun after the first word."""
    words = text.split()
    if len(words) < 4:
        return False
    return bool(re.search(r"\d", text) or any(w[:1].isupper() for w in words[1:]))


def quality_missing(answers: dict, file_kinds: list[str], consents: dict | None = None) -> list[str]:
    """What stands between this onboarding and the research bar in docs/INTAKE.md."""
    missing = []
    companies = [c for c in answers.get("companies") or [] if (c.get("name") or "").strip()]
    if len(companies) < 10:
        missing.append(f"At least 10 target companies (you have {len(companies)})")
    if not [r for r in answers.get("roles") or [] if r.strip()]:
        missing.append("At least 1 target role")
    if "linkedin_pdf" not in file_kinds:
        missing.append("Your LinkedIn profile PDF")
    specific = sum(1 for k in STORY_KEYS if _specific(answers.get(k) or ""))
    if specific < 3:
        missing.append(f"3 story answers with a specific detail such as a place, an employer or a result (you have {specific})")
    if consents is not None and not (consents.get("message_approval") and consents.get("data_use")):
        missing.append("Consent to message approval and data use")
    return missing


def _intake_for(email: str) -> dict | None:
    rows = store.rest("GET", "intake_requests", params={"email": f"ilike.{email}", "order": "created_at.desc", "limit": "5"}) or []
    rows = [r for r in rows if (r.get("email") or "").strip().lower() == email]
    rows.sort(key=lambda r: (str(r.get("created_at") or ""), str(r.get("id"))), reverse=True)
    return rows[0] if rows else None


@app.post("/api/onboarding")
def onboarding_submit(body: OnboardingIn):
    if body.website:
        return {"ok": True, "status": "incomplete", "missing": []}  # silently drop bots
    email = body.details.email.strip().lower()
    if not EMAIL.match(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    if not body.details.full_name.strip():
        raise HTTPException(status_code=422, detail="Enter your full name")
    intake_row = _intake_for(email)
    package = body.package if body.package in PACKAGES else (intake_row or {}).get("package")
    c = body.consents
    if not (c.message_approval and c.data_use):
        raise HTTPException(status_code=422, detail="Please confirm message approval and data use to continue")
    if package == "done_for_you" and not c.tier2:
        raise HTTPException(status_code=422, detail="Done-for-you needs your written consent to send from your LinkedIn")
    earlier = store.rest("GET", "onboarding", params={"email": f"eq.{email}", "select": "id,created_at",
                                                     "created_at": f"gte.{_since_24h()}"}) or []
    if len(_recent(earlier)) >= SUBMITS_PER_EMAIL_PER_DAY:
        raise HTTPException(status_code=429, detail="We already have several submissions from you today. Email hello@knock.careers if something is wrong.")

    files = []
    for fid in dict.fromkeys(body.file_ids):
        if not UUID.match(fid):
            raise HTTPException(status_code=422, detail="One of your files could not be found. Please upload it again.")
        rows = store.rest("GET", "candidate_files", params={"id": f"eq.{fid}", "select": "id,kind,onboarding_id"}) or []
        if not rows or rows[0].get("onboarding_id"):
            raise HTTPException(status_code=422, detail="One of your files could not be found. Please upload it again.")
        files.append({"id": fid, "kind": rows[0]["kind"]})

    answers = body.answers.model_dump()
    answers["roles"] = [r.strip() for r in answers["roles"] if r.strip()]
    answers["locations"] = [x.strip() for x in answers["locations"] if x.strip()]
    answers["companies"] = [{"name": x["name"].strip(), "top": x["top"]} for x in answers["companies"] if x["name"].strip()]
    answers["package"] = package or ""
    missing = quality_missing(answers, [f["kind"] for f in files])
    status = "incomplete" if missing else "ready"
    consents = {**c.model_dump(), "recorded_at": datetime.now(timezone.utc).isoformat(),
                "data_retention": "deleted on request or 90 days after the engagement"}
    onboarding_id = str(uuid.uuid4())
    store.rest("POST", "onboarding", json_body={
        "id": onboarding_id, "intake_id": (intake_row or {}).get("id"), "email": email,
        "full_name": body.details.full_name.strip(), "answers": answers, "consents": consents, "status": status})
    for f in files:
        store.rest("PATCH", "candidate_files", params={"id": f"eq.{f['id']}"}, json_body={"onboarding_id": onboarding_id})
    return {"ok": True, "id": onboarding_id, "status": status, "missing": missing}


# ---------- operator CRM: onboarding ----------

FILE_FIELDS = ("id", "onboarding_id", "kind", "filename", "size_bytes", "created_at")


def _files_for(onboarding_id: str, with_text: bool = False) -> list[dict]:
    fields = FILE_FIELDS + (("text_content",) if with_text else ())
    rows = store.rest("GET", "candidate_files", params={"onboarding_id": f"eq.{onboarding_id}", "select": ",".join(fields)}) or []
    return [{k: r.get(k) for k in fields} for r in rows]  # never pass pdf bytes on


@app.get("/api/crm/onboarding")
def crm_onboarding(x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    rows = store.rest("GET", "onboarding", params={"order": "created_at.desc", "limit": "200"}) or []
    files = store.rest("GET", "candidate_files", params={"onboarding_id": "not.is.null", "select": ",".join(FILE_FIELDS)}) or []
    by_id: dict[str, list[dict]] = {}
    for f in files:
        by_id.setdefault(str(f.get("onboarding_id")), []).append({k: f.get(k) for k in FILE_FIELDS})
    out = []
    for r in rows:
        fl = by_id.get(str(r["id"]), [])
        answers = r.get("answers") or {}
        out.append({
            "id": r["id"], "created_at": r.get("created_at"), "email": r.get("email"), "full_name": r.get("full_name"),
            "status": r.get("status"), "processed_at": r.get("processed_at"), "candidate_id": r.get("candidate_id"),
            "intake_id": r.get("intake_id"), "package": answers.get("package") or "",
            "roles": answers.get("roles") or [], "companies": len(answers.get("companies") or []),
            "missing": quality_missing(answers, [f["kind"] for f in fl], r.get("consents") or {}),
            "files": fl, "answers": answers,
        })
    return {"onboarding": out}


@app.post("/api/crm/onboarding/{onboarding_id}/import")
def crm_onboarding_import(onboarding_id: str, request: Request, x_crm_key: str | None = Header(default=None)):
    """Create or update the engine candidate from an onboarding submission."""
    crm_auth(x_crm_key)
    if not UUID.match(onboarding_id):
        raise HTTPException(status_code=404, detail="No such onboarding")
    rows = store.rest("GET", "onboarding", params={"id": f"eq.{onboarding_id}"}) or []
    if not rows:
        raise HTTPException(status_code=404, detail="No such onboarding")
    ob = rows[0]
    a = ob.get("answers") or {}
    intake_row = None
    if ob.get("intake_id") is not None:
        found = store.rest("GET", "intake_requests", params={"id": f"eq.{ob['intake_id']}"}) or []
        intake_row = found[0] if found else None

    candidate = None
    for cid in (ob.get("candidate_id"), (intake_row or {}).get("candidate_id")):
        if cid:
            try:
                candidate = store.load(cid)
                break
            except KeyError:
                pass
    created = candidate is None
    if created:
        candidate = Candidate(id=store.new_id(ob["full_name"]), full_name=ob["full_name"])

    companies = a.get("companies") or []
    candidate.full_name = ob["full_name"]
    candidate.tier = "done_for_you" if a.get("package") == "done_for_you" else "self_send"
    candidate.target_roles = a.get("roles") or candidate.target_roles
    candidate.target_companies = [x["name"] for x in companies] or candidate.target_companies
    locations = list(a.get("locations") or []) + (["Remote"] if a.get("remote") == "yes" else [])
    candidate.locations = locations or candidate.locations
    candidate.industries = a.get("industries") or candidate.industries
    story = {k: v for k, v in candidate.story.items() if k not in ("linkedin_text", "cv_text")}
    story.update({
        "email": ob.get("email", ""), "package": a.get("package") or story.get("package", ""),
        "onboarding_id": ob["id"], "top_companies": [x["name"] for x in companies if x.get("top")],
        "seniority": a.get("seniority", ""), "years_experience": a.get("years"),
        "why_now": a.get("why_now", ""), "proudest": [x for x in (a.get("proud_1"), a.get("proud_2")) if x],
        "transition": a.get("transition", ""), "roots": a.get("roots", ""), "recent": a.get("recent", ""),
        "tone": a.get("tone", ""), "never_say": a.get("never_say", ""),
        "off_limits": {"current_employer": a.get("current_employer", ""), "avoid_companies": a.get("avoid_companies", ""),
                       "known_people": a.get("known_people", "")},
        "approval_channel": a.get("approval_channel", ""),
    })
    if intake_row:
        story.setdefault("intake_id", intake_row["id"])
        if intake_row.get("linkedin_url"):
            story.setdefault("linkedin_url", intake_row["linkedin_url"])
    for f in _files_for(ob["id"], with_text=True):
        key = "linkedin_text" if f["kind"] == "linkedin_pdf" else "cv_text"
        if f.get("text_content"):
            story[key] = f["text_content"][:20_000]
    candidate.story = story

    message = "No LinkedIn or CV text to extract facts from."
    if profiles.pending_text(candidate):
        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                n = profiles.facts_from_story_text(candidate)
                message = f"Extracted {n} facts from the LinkedIn profile and CV."
            except Exception:
                message = "Fact extraction failed this time; the text is saved and extraction runs on the next sync."
        else:
            message = "ANTHROPIC_API_KEY is not set, so the LinkedIn and CV text is saved and fact extraction runs on the next sync."
    portal_url = None
    if not candidate.story.get("portal_token_hash"):   # first import: the client gets their portal link
        portal_url = portal_link(candidate, request)
    store.save(candidate)
    now = datetime.now(timezone.utc).isoformat()
    store.rest("PATCH", "onboarding", params={"id": f"eq.{ob['id']}"},
               json_body={"status": "imported", "processed_at": now, "candidate_id": candidate.id})
    if intake_row and not intake_row.get("processed_at"):
        store.rest("PATCH", "intake_requests", params={"id": f"eq.{intake_row['id']}"},
                   json_body={"processed_at": now, "candidate_id": candidate.id})
    return {"ok": True, "candidate_id": candidate.id, "created": created, "facts": len(candidate.facts), "message": message,
            "portal_url": portal_url}


# ---------- client portal (/portal) ----------
# Tier 1 clients send from their own LinkedIn. Each candidate has one secret link, /portal?t=<token>;
# only the SHA-256 of the token is stored (story.portal_token_hash). The portal API takes the token in
# the x-portal-token header and only ever reads or writes that candidate's own prospects.

PORTAL_STATUSES = {"no_response", "declined", "referral", "interview", "offer"}
PRE_CONTACT = {"discovered", "enriched", "drafting", "message_ready", "approved"}
UNREVIEWED = {"pending", "rewrite"}   # drafts the automated review has not cleared yet stay hidden
BUCKET_LABELS = {
    "hiring_manager": "Could be your manager", "team_member": "Works on the team you want",
    "recruiter": "Recruiter", "alumni": "Shares your background",
    "senior_connector": "Senior and well connected", "other": "Useful to know",
}
HOOK_LABELS = {
    "shared_school": "Same school", "shared_employer": "Same employer", "similar_transition": "Similar career move",
    "relevant_work": "Their work is close to yours", "post_reaction": "Something they wrote",
    "shared_geo": "Same place", "shared_interest": "Shared interest",
}
PACKAGE_LABELS = {"sprint": "Sprint", "standard": "Standard", "full": "Full search", "done_for_you": "Done-for-you"}


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _base_url(request: Request) -> str:
    configured = os.environ.get("PORTAL_BASE_URL", "").rstrip("/")
    if configured:
        return configured
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    return f"{proto}://{host}"


def portal_link(c: Candidate, request: Request) -> str:
    """Create or rotate the candidate's portal token (the caller saves). The old link stops working."""
    import secrets

    token = secrets.token_urlsafe(32)
    c.story = {**c.story, "portal_token_hash": _token_hash(token),
               "portal_token_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    return f"{_base_url(request)}/portal?t={token}"


@app.post("/api/crm/candidates/{candidate_id}/portal-link")
def crm_portal_link(candidate_id: str, request: Request, x_crm_key: str | None = Header(default=None)):
    crm_auth(x_crm_key)
    try:
        c = store.load(candidate_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="No such candidate")
    rotated = bool(c.story.get("portal_token_hash"))
    url = portal_link(c, request)
    store.save(c)
    return {"ok": True, "url": url, "rotated": rotated, "created_at": c.story["portal_token_at"]}


def portal_auth(token: str | None) -> Candidate:
    bad = HTTPException(status_code=401, detail="This link is not valid any more. Ask Knock for a new one.")
    if not token or len(token) < 32 or len(token) > 200:
        raise bad
    want = _token_hash(token)
    if store._supabase():
        rows = store.rest("GET", "engine_state", params={"select": "id,doc", "doc->story->>portal_token_hash": f"eq.{want}"}) or []
        docs = [r["doc"] for r in rows if r.get("doc") and r["id"] not in SHARED]
    else:
        docs = [store.get_doc(i) for i in store.list_ids()]
    for doc in docs:
        have = ((doc or {}).get("story") or {}).get("portal_token_hash") or ""
        if have and hmac.compare_digest(have, want):
            return Candidate.model_validate(doc)
    raise bad


def _portal_prospect(c: Candidate, pid: str):
    try:
        return store.get_prospect(c, pid)
    except KeyError:
        raise HTTPException(status_code=404, detail="We could not find that person")


def _pending_replies(c: Candidate) -> dict[str, list[dict]]:
    """Replies the client pasted that the next scheduled run has not drafted an answer to yet."""
    out: dict[str, list[dict]] = {}
    by_url = {bridge.normalize_url(p.linkedin_url): p.id for p in c.prospects if p.linkedin_url}
    for row in bridge.pending_inbound() or []:
        if row.get("candidate_id"):
            if row["candidate_id"] != c.id:
                continue
            pid = row.get("prospect_id")
        else:
            pid = by_url.get(bridge.normalize_url(row.get("linkedin_url", "")))
        if pid:
            out.setdefault(pid, []).append({"body": row.get("text", ""), "received_at": row.get("received_at")})
    return out


SOURCE_LABELS = {
    ("candidate", "cv"): "Your CV and LinkedIn", ("candidate", "story"): "What you told us",
    ("prospect", "linkedin_pdf"): "Their LinkedIn profile", ("prospect", "csv"): "Their LinkedIn profile",
    ("prospect", "linkedin"): "Their LinkedIn profile", ("prospect", "web"): "Public web",
}


def _fact(p, facts: list, fact_id: str) -> dict | None:
    """One cited fact with where it came from. Links are only given when we have a real URL."""
    f = next((x for x in facts if x.id == fact_id), None)
    if f is None:
        return None
    src = (f.source or "").strip()
    url = src if re.match(r"^https?://", src) else ""
    if not url and f.owner == "prospect" and src in ("linkedin_pdf", "csv", "linkedin") and re.match(r"^https?://", p.linkedin_url or ""):
        url = p.linkedin_url
    label = SOURCE_LABELS.get((f.owner, src)) or ("Source" if url else "Our research")
    return {"owner": f.owner, "text": f.text, "source_url": url, "source_label": label}


def _section(p, pending: list) -> str:
    msgs = p.messages
    last = msgs[-1] if msgs else None
    if p.status == "skipped":
        return "skipped"
    if p.status in ("no_response", "declined"):
        return "closed"
    if pending or (last and last.direction == "inbound" and p.status in ("replied", "conversation")):
        return "writing"
    if last and last.direction == "outbound" and not last.sent_at and getattr(last, "review_status", "") in UNREVIEWED:
        return "writing" if any(m.direction == "inbound" for m in msgs) else "upcoming"
    if last and last.direction == "outbound" and not last.sent_at:
        return "ready"
    if any(m.direction == "inbound" for m in msgs):
        return "conversation"
    if last:
        return "waiting"
    return "upcoming"


def portal_prospect_view(c: Candidate, p, pending: list) -> dict:
    hook = next((h for h in p.hooks if h.selected), p.hooks[0] if p.hooks else None)
    facts = [f for f in ((_fact(p, c.facts, hook.candidate_fact_id), _fact(p, p.facts, hook.prospect_fact_id)) if hook else ()) if f]
    last = p.messages[-1] if p.messages else None
    draft = None
    if last and last.direction == "outbound" and not last.sent_at and not pending \
            and getattr(last, "review_status", "") not in UNREVIEWED:
        draft = {"step": last.step, "body": last.body, "approved": last.approved, "edited": last.edited}
    return {
        "id": p.id, "name": p.full_name, "headline": p.headline, "company": p.company, "location": p.location,
        "linkedin_url": p.linkedin_url, "bucket": p.bucket.value, "bucket_label": BUCKET_LABELS.get(p.bucket.value, "Useful to know"),
        "status": p.status, "section": _section(p, pending),
        "hook": {"summary": hook.summary, "label": HOOK_LABELS.get(hook.hook_type, ""), "facts": facts} if hook else None,
        "messages": [{"direction": m.direction, "step": m.step, "body": m.body, "sent_at": m.sent_at, "created_at": m.created_at}
                     for m in p.messages if m.direction == "inbound" or m.sent_at],
        "draft": draft,
        "pending_replies": pending,
    }


@app.get("/api/portal/me")
def portal_me(x_portal_token: str | None = Header(default=None)):
    c = portal_auth(x_portal_token)
    s = _summary(c.model_dump())
    pending = _pending_replies(c)
    sections = Counter(_section(p, pending.get(p.id, [])) for p in c.prospects)
    pkg = c.story.get("package", "")
    return {
        "name": c.full_name, "first_name": (c.full_name or "").split(" ")[0],
        "package": pkg, "package_label": PACKAGE_LABELS.get(pkg, ""),
        "target_roles": c.target_roles, "target_companies": c.target_companies,
        "progress": {"targeted": s["targeted"], "ready_to_send": sections["ready"], "sent": s["contacted"],
                     "replied": s["replied"], "conversations": s["conversations"], "referrals": s["referrals"],
                     "interviews": s["interviews"]},
        "writing": sections["writing"],
    }


@app.get("/api/portal/prospects")
def portal_prospects(x_portal_token: str | None = Header(default=None)):
    c = portal_auth(x_portal_token)
    pending = _pending_replies(c)
    return {"prospects": [portal_prospect_view(c, p, pending.get(p.id, [])) for p in c.prospects]}


@app.post("/api/portal/prospects/{prospect_id}/approve")
def portal_approve(prospect_id: str, payload: Approve, x_portal_token: str | None = Header(default=None)):
    c = portal_auth(x_portal_token)
    p = _portal_prospect(c, prospect_id)
    if p.status == "skipped" or (p.messages and p.messages[-1].sent_at):
        raise HTTPException(status_code=409, detail="There is no draft waiting for you here")
    approve_draft(c, p, payload.body, queue_followup=False)   # the client sends it themselves
    store.save(c)
    return {"ok": True, "status": p.status}


class PortalSent(BaseModel):
    body: str | None = Field(default=None, max_length=1200)


@app.post("/api/portal/prospects/{prospect_id}/sent")
def portal_sent(prospect_id: str, payload: PortalSent | None = None, x_portal_token: str | None = Header(default=None)):
    """The client sent the latest draft from their own LinkedIn. Approves it first if needed (with any edit)."""
    c = portal_auth(x_portal_token)
    p = _portal_prospect(c, prospect_id)
    if p.status == "skipped" or not p.messages or p.messages[-1].direction != "outbound" or p.messages[-1].sent_at:
        raise HTTPException(status_code=409, detail="There is no draft waiting for you here")
    msg = p.messages[-1]
    if not msg.approved or (payload and payload.body):
        approve_draft(c, p, payload.body if payload else None, queue_followup=False)
    msg.sent_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    if msg.step == 1 and p.status in PRE_CONTACT:
        p.status = "sent"
    elif msg.step > 1 and p.status == "replied":
        p.status = "conversation"
    for row in bridge.outbox(due_only=False) or []:   # an auto-queued copy must not be sent twice
        if row.get("candidate_id") == c.id and row.get("prospect_id") == p.id and int(row.get("step") or 0) == msg.step:
            bridge.mark_sent(row["id"])
    store.save(c)
    return {"ok": True, "status": p.status, "sent_at": msg.sent_at}


class PortalReply(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


@app.post("/api/portal/prospects/{prospect_id}/reply")
def portal_reply(prospect_id: str, payload: PortalReply, x_portal_token: str | None = Header(default=None)):
    """The client pastes the person's reply. The next scheduled sync drafts the answer."""
    c = portal_auth(x_portal_token)
    p = _portal_prospect(c, prospect_id)
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Paste their reply first")
    if not any(m.direction == "outbound" and m.sent_at for m in p.messages):
        raise HTTPException(status_code=409, detail="Mark your message as sent first, then add their reply")
    bridge.add_inbound(p.linkedin_url, p.full_name, text, candidate_id=c.id, prospect_id=p.id)
    if p.status in PRE_CONTACT | {"sent", "accepted", "no_response"}:
        p.status = "replied"
        store.save(c)
    return {"ok": True, "status": p.status}


@app.post("/api/portal/prospects/{prospect_id}/status")
def portal_status(prospect_id: str, payload: StatusChange, x_portal_token: str | None = Header(default=None)):
    c = portal_auth(x_portal_token)
    if payload.status not in PORTAL_STATUSES:
        raise HTTPException(status_code=422, detail="Unknown status")
    p = _portal_prospect(c, prospect_id)
    if not any(m.direction == "outbound" and m.sent_at for m in p.messages):
        raise HTTPException(status_code=409, detail="Mark your message as sent first")
    p.status = payload.status
    store.save(c)
    return {"ok": True, "status": p.status}


@app.post("/api/portal/prospects/{prospect_id}/skip")
def portal_skip(prospect_id: str, x_portal_token: str | None = Header(default=None)):
    c = portal_auth(x_portal_token)
    p = _portal_prospect(c, prospect_id)
    if p.status not in PRE_CONTACT:
        raise HTTPException(status_code=409, detail="You have already been in touch with this person")
    p.status = "skipped"
    store.save(c)
    return {"ok": True, "status": p.status}
