"""Knock backend on Vercel: website intake, operator CRM API, and the scheduled sync.

Environment (Vercel project settings):
  SUPABASE_URL, SUPABASE_KEY, ENGINE_TOKEN   engine state in Supabase (token-gated RLS)
  CRM_PASSWORD                               operator login for /crm and /api/crm/*
  CRON_SECRET                                Vercel cron auth for /api/cron/sync
  ANTHROPIC_API_KEY                          needed only for sync (drafting replies, learning)
"""

from __future__ import annotations

import hmac
import os
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # the copied `outreach` package

from outreach import bridge, feedback, store  # noqa: E402
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
    return {"summary": _summary(doc), "prospects": [_prospect_view(p) for p in doc["prospects"]]}


class Approve(BaseModel):
    body: str | None = Field(default=None, max_length=1200)


@app.post("/api/crm/candidates/{candidate_id}/prospects/{prospect_id}/approve")
def crm_approve(candidate_id: str, prospect_id: str, payload: Approve, x_crm_key: str | None = Header(default=None)):
    """Approve the latest draft (optionally edited). Openers become 'approved'; follow-ups go to the outbox."""
    crm_auth(x_crm_key)
    c = store.load(candidate_id)
    p = store.get_prospect(c, prospect_id)
    if not p.messages or p.messages[-1].direction != "outbound":
        raise HTTPException(status_code=409, detail="Nothing to approve")
    msg = p.messages[-1]
    if payload.body and payload.body.strip() != msg.body.strip():
        if msg.step == 1:
            feedback.record_edit(msg.body, payload.body, msg.writer, p.hooks[0].hook_type if p.hooks else "", p.bucket.value)
        msg.body, msg.edited = payload.body.strip(), True
    if msg.step == 1:
        msg.approved, p.status = True, "approved"
    elif not msg.approved:
        bridge.queue(c, p, msg)
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
