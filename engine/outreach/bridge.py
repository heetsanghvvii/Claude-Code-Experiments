"""Inbox/outbox bridge between the engine and whatever sends on LinkedIn.

Today the sender is La Growth Machine driven by a scheduled Claude in Chrome task:
  - Chrome copies new replies from the LGM inbox into `inbound_replies`.
  - `sync` reads them, drafts the next message from the whole thread, and queues it in `outbox`
    with a send_after time (auto-send) or holds it for approval.
  - Chrome sends due outbox rows from the LGM inbox and stamps `sent_at`.
Later the LGM API (Pro plan) can replace Chrome without changing the engine.

Uses Supabase tables when configured, local documents otherwise.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timedelta, timezone

from . import feedback, messages, profiles, store
from .models import Candidate, Message, Prospect

AUTO_SEND_SENTIMENTS = {"warm", "neutral", "redirecting"}
MAX_AUTO_SEND_CHARS = 600
# Anything that could leak contact details or carry a link is held for a human, whatever the sentiment.
UNSAFE_FOR_AUTO_SEND = re.compile(
    r"https?://|www\.|\b[\w.+-]+@[\w-]+\.[\w.]+\b|(?:\+?\d[\s-]?){10,}|\b(?:password|otp|bank|upi|aadhaar|pan card)\b",
    re.IGNORECASE)


def safe_to_auto_send(body: str) -> bool:
    return len(body) <= MAX_AUTO_SEND_CHARS and not UNSAFE_FOR_AUTO_SEND.search(body)
LOCAL_INBOUND, LOCAL_OUTBOX = "bridge_inbound", "bridge_outbox"
store.SHARED_DOCS.update({LOCAL_INBOUND, LOCAL_OUTBOX})


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat(timespec="seconds")


def normalize_url(url: str) -> str:
    m = re.search(r"linkedin\.com/in/([^/?#]+)", url or "")
    return m.group(1).lower() if m else ""


# ---------- queue storage ----------

def _local(doc: str) -> list[dict]:
    return store.get_doc(doc) or []


def pending_inbound() -> list[dict]:
    if store._supabase():
        return store.rest("GET", "inbound_replies", params={"processed_at": "is.null", "order": "received_at"})
    return [r for r in _local(LOCAL_INBOUND) if not r.get("processed_at")]


def add_inbound(linkedin_url: str, prospect_name: str, text: str) -> None:
    row = {"linkedin_url": linkedin_url, "prospect_name": prospect_name, "text": text, "received_at": _iso(_now())}
    if store._supabase():
        store.rest("POST", "inbound_replies", json_body=row)
        return
    rows = _local(LOCAL_INBOUND)
    rows.append({"id": uuid.uuid4().hex, **row})
    store.put_doc(LOCAL_INBOUND, rows)


def _mark_inbound(row_id, result: str) -> None:
    if store._supabase():
        store.rest("PATCH", "inbound_replies", params={"id": f"eq.{row_id}"},
                   json_body={"processed_at": _iso(_now()), "result": result})
        return
    rows = _local(LOCAL_INBOUND)
    for r in rows:
        if r["id"] == row_id:
            r["processed_at"], r["result"] = _iso(_now()), result
    store.put_doc(LOCAL_INBOUND, rows)


def enqueue(c: Candidate, p: Prospect, msg: Message) -> None:
    row = {"candidate_id": c.id, "prospect_id": p.id, "prospect_name": p.full_name, "linkedin_url": p.linkedin_url,
           "step": msg.step, "body": msg.body, "send_after": msg.send_after}
    if store._supabase():
        store.rest("POST", "outbox", json_body=row)
        return
    rows = _local(LOCAL_OUTBOX)
    rows.append({"id": uuid.uuid4().hex, "sent_at": None, **row})
    store.put_doc(LOCAL_OUTBOX, rows)


def outbox(due_only: bool = True) -> list[dict]:
    now = _iso(_now())
    if store._supabase():
        params = {"sent_at": "is.null", "order": "send_after"}
        if due_only:
            params["send_after"] = f"lte.{now}"
        return store.rest("GET", "outbox", params=params)
    return [r for r in _local(LOCAL_OUTBOX) if not r.get("sent_at") and (not due_only or r["send_after"] <= now)]


def sent_rows() -> list[dict]:
    if store._supabase():
        return store.rest("GET", "outbox", params={"sent_at": "not.is.null"})
    return [r for r in _local(LOCAL_OUTBOX) if r.get("sent_at")]


def mark_sent(row_id) -> None:
    if store._supabase():
        store.rest("PATCH", "outbox", params={"id": f"eq.{row_id}"}, json_body={"sent_at": _iso(_now())})
        return
    rows = _local(LOCAL_OUTBOX)
    for r in rows:
        if r["id"] == row_id:
            r["sent_at"] = _iso(_now())
    store.put_doc(LOCAL_OUTBOX, rows)


# ---------- engine logic ----------

def find_prospect(candidates: list[Candidate], linkedin_url: str, name: str) -> tuple[Candidate, Prospect] | None:
    key = normalize_url(linkedin_url)
    matches = []
    for c in candidates:
        for p in c.prospects:
            if key and normalize_url(p.linkedin_url) == key:
                return c, p
            if not key and name and p.full_name.lower() == name.strip().lower():
                matches.append((c, p))
    return matches[0] if len(matches) == 1 else None


def handle_reply(c: Candidate, p: Prospect, text: str, guidance: str | None = None):
    """Log their reply, draft ours, and queue it if auto-send rules allow. Returns the analysis."""
    now = _now()
    step = max((m.step for m in p.messages), default=0) + 1
    p.messages.append(Message(direction="inbound", step=step, body=text, created_at=_iso(now)))
    if p.status in ("message_ready", "approved", "sent", "accepted"):
        p.status = "replied"
    if guidance is None:
        guidance = feedback.reply_guidance([store.load(cid) for cid in store.list_ids()])
    result = messages.next_reply(c, p, guidance)
    draft = Message(direction="outbound", step=step + 1, body=result.next_message, ask_type=result.ask_type,
                    created_at=_iso(now))
    if c.auto_send and result.sentiment in AUTO_SEND_SENTIMENTS and safe_to_auto_send(draft.body):
        queue(c, p, draft)
    p.messages.append(draft)
    return result


def queue(c: Candidate, p: Prospect, msg: Message) -> None:
    msg.approved = True
    msg.send_after = _iso(_now() + timedelta(minutes=c.reply_delay_minutes))
    enqueue(c, p, msg)


def sync() -> dict:
    """Process new replies and record sends. Safe to run on a schedule."""
    ids = store.list_ids()
    candidates = {cid: store.load(cid) for cid in ids}
    stats = {"replies": 0, "queued": 0, "held": 0, "unmatched": 0, "sent_recorded": 0}
    reply_notes = None

    for row in pending_inbound():
        found = find_prospect(list(candidates.values()), row.get("linkedin_url", ""), row.get("prospect_name", ""))
        if not found:
            stats["unmatched"] += 1
            _mark_inbound(row["id"], "unmatched")
            continue
        c, p = found
        last_in = next((m.body for m in reversed(p.messages) if m.direction == "inbound"), None)
        if last_in and last_in.strip() == row["text"].strip():
            _mark_inbound(row["id"], "duplicate")
            continue
        if reply_notes is None:
            reply_notes = feedback.reply_guidance(list(candidates.values()))
        result = handle_reply(c, p, row["text"], reply_notes)
        stats["replies"] += 1
        queued = p.messages[-1].approved
        stats["queued" if queued else "held"] += 1
        _mark_inbound(row["id"], f"{result.sentiment}/{result.ask_type}/{'queued' if queued else 'held'}")
        store.save(c)

    for row in sent_rows():
        c = candidates.get(row["candidate_id"])
        if not c:
            continue
        try:
            p = store.get_prospect(c, row["prospect_id"])
        except KeyError:
            continue
        for m in p.messages:
            if m.direction == "outbound" and m.step == row["step"] and not m.sent_at:
                m.sent_at = row["sent_at"]
                if m.step == 1 and p.status in ("message_ready", "approved"):
                    p.status = "sent"
                stats["sent_recorded"] += 1
                store.save(c)

    for c in candidates.values():                 # onboarding imports made while Claude was unavailable
        if profiles.pending_text(c):
            profiles.facts_from_story_text(c)
            stats["facts_extracted"] = stats.get("facts_extracted", 0) + 1
            store.save(c)

    learned = feedback.learn(list(candidates.values()))
    if learned:
        stats["learned"] = {k: v for k, v in learned.items() if k in ("evidence", "retired", "spawned")}
    return stats
