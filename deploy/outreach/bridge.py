"""Inbox/outbox bridge between the engine and whatever sends on LinkedIn.

Tier 1 (now): the client approves and sends from their portal; every draft first passes the automated
review layer (review.py) and nothing waits for the founder. Done-for-you sending through La Growth Machine
is out of scope for now; the outbox is kept for it. That later flow is a scheduled Claude in Chrome task:
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

import anthropic
import httpx

from . import feedback, messages, profiles, review, rules, store
from .models import Candidate, Message, Prospect, ReplyAnalysis

AUTO_SEND_SENTIMENTS = {"warm", "neutral", "redirecting"}
MAX_AUTO_SEND_CHARS = 600
# Anything that could leak contact details or carry a link is never auto-sent, whatever the sentiment.
UNSAFE_FOR_AUTO_SEND = rules.UNSAFE
AUTO_SEND_REVIEW = {"passed", "checks_only"}
CLAUDE_DOWN = "Claude API unavailable (check credits)"

try:  # lets FastAPI answer a clean 503 without the API module having to catch anything
    from starlette.exceptions import HTTPException as _HTTPError
except ImportError:  # pragma: no cover - engine used without the web stack
    _HTTPError = RuntimeError


class ClaudeUnavailable(_HTTPError):
    """Raised by sync() when the Anthropic API fails. A 503 with a structured detail under FastAPI."""

    def __init__(self, detail: dict):
        if _HTTPError is RuntimeError:  # pragma: no cover
            super().__init__(detail.get("error"))
            self.status_code, self.detail = 503, detail
        else:
            super().__init__(status_code=503, detail=detail)


def claude_error(e: Exception, stats: dict | None = None) -> dict:
    """Structured error for Anthropic API failures (no credits, bad key, outage, rate limit)."""
    hint = CLAUDE_DOWN
    status = getattr(e, "status_code", None)
    if status in (401, 403):
        hint = "Claude API unavailable (check ANTHROPIC_API_KEY)"
    elif status == 429:
        hint = "Claude API unavailable (rate limited, retry later)"
    return {"ok": False, "status": 503, "error": hint, "type": type(e).__name__,
            "message": str(e)[:300], "partial": stats or {}}


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


def add_inbound(linkedin_url: str, prospect_name: str, text: str,
                candidate_id: str | None = None, prospect_id: str | None = None) -> None:
    """Queue a reply for the next sync. With candidate_id and prospect_id it is already matched (client portal)."""
    row = {"linkedin_url": linkedin_url, "prospect_name": prospect_name, "text": text, "received_at": _iso(_now())}
    if candidate_id and prospect_id:
        row.update(candidate_id=candidate_id, prospect_id=prospect_id)
    if store._supabase():
        try:
            store.rest("POST", "inbound_replies", json_body=row)
        except httpx.HTTPStatusError as e:
            # Before migration 0006 adds the match columns, fall back to url/name matching in sync.
            if "candidate_id" not in row or e.response.status_code != 400:
                raise
            store.rest("POST", "inbound_replies", json_body={k: v for k, v in row.items() if k not in ("candidate_id", "prospect_id")})
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

def match_row(candidates: dict[str, Candidate], row: dict) -> tuple[Candidate, Prospect] | None:
    """A reply row already matched to a prospect (client portal) wins; otherwise match by LinkedIn URL or name."""
    c = candidates.get(row.get("candidate_id") or "")
    if c is not None:
        try:
            return c, store.get_prospect(c, row.get("prospect_id") or "")
        except KeyError:
            pass
    return find_prospect(list(candidates.values()), row.get("linkedin_url", ""), row.get("prospect_name", ""))


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


def handle_reply(c: Candidate, p: Prospect, text: str, guidance: str | None = None,
                 analysis: ReplyAnalysis | None = None):
    """Log their reply, draft ours, run it through the review layer, and queue it if auto-send rules allow.

    analysis=None calls Claude via the API (and the LLM reviewer). A given analysis comes from a
    subscription-mode work packet; its LLM review then runs as a separate `review` packet. Returns the analysis.
    """
    now = _now()
    step = max((m.step for m in p.messages), default=0) + 1
    inbound = Message(direction="inbound", step=step, body=text, created_at=_iso(now))
    p.messages.append(inbound)
    use_api = analysis is None
    if use_api:
        try:
            if guidance is None:
                guidance = feedback.reply_guidance([store.load(cid) for cid in store.list_ids()])
            analysis = messages.next_reply(c, p, guidance)
        except Exception:
            p.messages.remove(inbound)             # leave the thread as it was so a retry is not a "duplicate"
            raise
    if p.status in ("message_ready", "approved", "sent", "accepted", "drafting"):
        p.status = "replied"
    negative = analysis.sentiment == "negative"
    draft = Message(direction="outbound", step=step + 1, body=analysis.next_message,
                    ask_type="none" if negative else analysis.ask_type, writer="reply", created_at=_iso(now),
                    judge_reason=f"sentiment={analysis.sentiment}; rapport={analysis.rapport}; {analysis.ask_reason}")
    review.review(c, p, draft, "reply", rapport=analysis.rapport, use_llm=use_api, negative=negative)
    if use_api and draft.review_status == "rewrite":   # one automatic rewrite with the reviewer's notes
        notes = ("Your previous draft was rejected by the reviewer:\n" + draft.body + "\nProblems:\n- "
                 + "\n- ".join(draft.review_notes))
        retry = messages.next_reply(c, p, "\n\n".join(x for x in (guidance, notes) if x))
        draft.body, draft.ask_type = retry.next_message, retry.ask_type
        review.review(c, p, draft, "reply", rapport=retry.rapport)
    if (c.auto_send and not negative and analysis.sentiment in AUTO_SEND_SENTIMENTS
            and draft.review_status in AUTO_SEND_REVIEW and safe_to_auto_send(draft.body)):
        queue(c, p, draft)
    p.messages.append(draft)
    return analysis


def queue(c: Candidate, p: Prospect, msg: Message) -> None:
    msg.approved = True
    msg.send_after = _iso(_now() + timedelta(minutes=c.reply_delay_minutes))
    enqueue(c, p, msg)


def sync(raise_errors: bool = True) -> dict:
    """Process new replies and record sends. Safe to run on a schedule.

    Anthropic API failures (no credits, bad key, outage) never surface as a 500: work done so far is saved,
    unprocessed replies stay queued for the next run, and the error is structured. With raise_errors=True
    (the default, used by the web API) it raises ClaudeUnavailable, which FastAPI returns as a 503 with
    {"detail": {"error": "Claude API unavailable (check credits)", ...}}; with False it returns that dict.
    """
    stats = {"replies": 0, "queued": 0, "held": 0, "unmatched": 0, "sent_recorded": 0}
    try:
        return _sync(stats)
    except anthropic.APIError as e:
        err = claude_error(e, stats)
        if raise_errors:
            raise ClaudeUnavailable(err) from e
        return err


def match_inbound(candidates: dict[str, Candidate], row: dict) -> tuple[tuple[Candidate, Prospect] | None, str]:
    """Match an inbound row. Unmatched and duplicate rows are marked processed and return (None, reason)."""
    found = match_row(candidates, row)
    if not found:
        _mark_inbound(row["id"], "unmatched")
        return None, "unmatched"
    c, p = found
    last_in = next((m.body for m in reversed(p.messages) if m.direction == "inbound"), None)
    if last_in and last_in.strip() == (row.get("text") or "").strip():
        _mark_inbound(row["id"], "duplicate")
        return None, "duplicate"
    return found, ""


def record_sends(candidates: dict[str, Candidate], stats: dict) -> None:
    """Copy sent_at from outbox rows onto the messages."""
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
                stats["sent_recorded"] = stats.get("sent_recorded", 0) + 1
                store.save(c)


def _sync(stats: dict) -> dict:
    ids = store.list_ids()
    candidates = {cid: store.load(cid) for cid in ids}
    reply_notes = None

    for row in pending_inbound():
        found, why = match_inbound(candidates, row)
        if not found:
            if why == "unmatched":
                stats["unmatched"] += 1
            continue
        c, p = found
        if reply_notes is None:
            reply_notes = feedback.reply_guidance(list(candidates.values()))
        result = handle_reply(c, p, row["text"], reply_notes)
        stats["replies"] += 1
        queued = p.messages[-1].approved
        stats["queued" if queued else "held"] += 1
        _mark_inbound(row["id"], f"{result.sentiment}/{result.ask_type}/{'queued' if queued else 'held'}")
        store.save(c)

    record_sends(candidates, stats)

    for c in candidates.values():                 # onboarding imports made while Claude was unavailable
        if profiles.pending_text(c):
            profiles.facts_from_story_text(c)
            stats["facts_extracted"] = stats.get("facts_extracted", 0) + 1
            store.save(c)

    learned = feedback.learn(list(candidates.values()))
    if learned:
        stats["learned"] = {k: v for k, v in learned.items() if k in ("evidence", "retired", "spawned")}
    return stats
