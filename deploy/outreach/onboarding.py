"""Automatic import of client onboarding submissions (Supabase `onboarding`, status 'ready').

Same mapping as the CRM's manual import (POST /api/crm/onboarding/{id}/import in deploy/api/index.py).
Only rows with status 'ready' are imported: a website sign-up (intake_requests) alone is never enough,
because research needs the onboarding answers, the LinkedIn PDF and consent.

Fact extraction is not done here: raw LinkedIn / CV text is left in the story and becomes a `profile`
work packet (subscription mode) or is extracted on the next API sync.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Callable

from . import store
from .models import Candidate

# TODO(portal): the client portal creates a portal link on first import (portal_link in deploy/api/index.py
# needs the request's base URL). When that logic moves into the engine, set this hook so routines create
# the link too: PORTAL_LINK_HOOK(candidate) -> url or None. The caller saves the candidate afterwards.
PORTAL_LINK_HOOK: Callable[[Candidate], str | None] | None = None


def apply_onboarding(candidate: Candidate | None, ob: dict, intake_row: dict | None, files: list[dict]) -> tuple[Candidate, bool]:
    """Map one onboarding row (plus its intake row and file texts) onto a candidate. Returns (candidate, created)."""
    a = ob.get("answers") or {}
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
    for f in files:
        key = "linkedin_text" if f.get("kind") == "linkedin_pdf" else "cv_text"
        if f.get("text_content"):
            story[key] = f["text_content"][:20_000]
    candidate.story = story
    return candidate, created


def _existing(ob: dict, intake_row: dict | None) -> Candidate | None:
    for cid in (ob.get("candidate_id"), (intake_row or {}).get("candidate_id")):
        if cid:
            try:
                return store.load(cid)
            except KeyError:
                pass
    return None


def import_ready() -> list[dict]:
    """Import every onboarding row with status 'ready'. Needs Supabase; returns one summary per row."""
    if not store._supabase():
        return []
    rows = store.rest("GET", "onboarding", params={"status": "eq.ready", "order": "created_at"}) or []
    out = []
    for ob in rows:
        intake_row = None
        if ob.get("intake_id") is not None:
            found = store.rest("GET", "intake_requests", params={"id": f"eq.{ob['intake_id']}"}) or []
            intake_row = found[0] if found else None
        files = store.rest("GET", "candidate_files", params={
            "onboarding_id": f"eq.{ob['id']}", "select": "id,kind,text_content"}) or []
        candidate, created = apply_onboarding(_existing(ob, intake_row), ob, intake_row, files)
        portal_url = None
        if PORTAL_LINK_HOOK and not candidate.story.get("portal_token_hash"):
            portal_url = PORTAL_LINK_HOOK(candidate)
        store.save(candidate)
        now = datetime.now(timezone.utc).isoformat()
        store.rest("PATCH", "onboarding", params={"id": f"eq.{ob['id']}"},
                   json_body={"status": "imported", "processed_at": now, "candidate_id": candidate.id})
        if intake_row and not intake_row.get("processed_at"):
            store.rest("PATCH", "intake_requests", params={"id": f"eq.{intake_row['id']}"},
                       json_body={"processed_at": now, "candidate_id": candidate.id})
        out.append({"candidate_id": candidate.id, "created": created, "portal_url": portal_url})
    return out
