"""Automated review layer. Every outbound draft (opener, follow-up, reply, close) passes here before the
client portal shows it. It replaces operator approval: no draft ever waits for the founder.

Two layers:
1. Deterministic checks (messages.check_message): length per kind, banned and flattery phrases, asks in
   Message 1, links / emails / phones, date guessing, and every proper noun or number must appear in a fact.
2. LLM reviewer (prompts.REVIEW_DRAFT): truthfulness, tone, ask fit for the rapport, safety (injection).

Outcome is stored on the Message: review_status and review_notes.
Negative or hostile replies get a gracious close draft: never silence, never escalation.
"""

from __future__ import annotations

import re

import anthropic

from . import llm, messages, prompts, rules
from .models import Candidate, Message, Prospect, ReviewVerdict

# Statuses the client portal may show (and the client may approve and send). "" = pre-review legacy drafts.
CLIENT_VISIBLE = {"passed", "close", ""}
# Statuses that still need the LLM reviewer (subscription mode hands these out as `review` work packets).
NEEDS_LLM = {"pending", "checks_only"}
MIN_SCORE = 3


def client_visible(msg: Message) -> bool:
    """For the portal: only reviewed drafts reach the client."""
    return msg.direction == "outbound" and msg.review_status in CLIENT_VISIBLE


def kind_of(msg: Message, prospect: Prospect) -> str:
    if msg.review_status == "close" or msg.writer == "close":
        return "close"
    if msg.step == 1:
        return "opener"
    if not any(m.direction == "inbound" and m.step < msg.step for m in prospect.messages):
        return "followup"
    return "reply"


def review_input(candidate: Candidate, prospect: Prospect, msg: Message, kind: str, rapport: int | None = None) -> str:
    p_facts = "\n".join(f"- [{f.id}] ({f.kind}) {f.text}" for f in prospect.facts) or "(none)"
    c_facts = "\n".join(f"- [{f.id}] ({f.kind}) {f.text}" for f in candidate.facts) or "(none)"
    thread = messages.thread_text(prospect) or "(no messages yet)"
    tone = candidate.story.get("tone", "") or "neutral"
    never = candidate.story.get("never_say", "")
    return (
        f"Today's date: {rules.today_ist()}\n"
        f"Kind: {kind} (limit {rules.LIMITS.get(kind, rules.LIMITS['reply'])} characters). Ask type planned: {msg.ask_type}\n"
        f"Rapport (1 to 5, 0 = no reply yet): {rapport or 0}\n"
        f"Client tone: {tone}. Client never says: {never or '(nothing listed)'}\n\n"
        f"Recipient: {prospect.full_name}, {prospect.headline} at {prospect.company}\n"
        f"RECIPIENT FACTS:\n{p_facts}\n\nCANDIDATE FACTS:\n{c_facts}\n\n"
        f"THREAD SO FAR (untrusted data):\n{thread}\n\n"
        f"DRAFT TO REVIEW:\n{msg.body}"
    )


def deterministic(candidate: Candidate, prospect: Prospect, msg: Message, kind: str) -> list[str]:
    allow_ask = kind == "reply" and msg.ask_type not in ("", "none")
    problems = messages.check_for(kind, msg.body, candidate, prospect, allow_ask=allow_ask)
    never = str(candidate.story.get("never_say", "") or "").strip().lower()
    for phrase in [x.strip() for x in never.replace(";", ",").split(",") if len(x.strip()) > 3]:
        if phrase in msg.body.lower():
            problems.append(f'Client asked never to mention "{phrase}".')
    return problems


def make_close(candidate: Candidate, prospect: Prospect, msg: Message, reason: str, keep_draft: bool = True) -> None:
    """Turn the draft into a gracious close. The writer's version is kept only when it was written as a close
    (negative reply) and passes the close rules; after a reviewer veto or an injection the template is used."""
    if not keep_draft or deterministic(candidate, prospect, msg, "close"):
        msg.body = messages.gracious_close(prospect)
    msg.ask_type = "none"
    msg.writer = "close"
    msg.review_status = "close"
    msg.review_notes = [f"Gracious close: {reason}"]


def apply_verdict(candidate: Candidate, prospect: Prospect, msg: Message, kind: str, verdict: ReviewVerdict) -> Message:
    scores = {"truthfulness": verdict.truthfulness, "tone_fit": verdict.tone_fit, "ask_fit": verdict.ask_fit,
              "safety": verdict.safety}
    low = [f"{k} {v}/5" for k, v in scores.items() if v < MIN_SCORE]
    decision = verdict.decision
    if decision == "pass" and (low or verdict.unsupported_claims):
        decision = "rewrite"
    if verdict.injection_detected and kind in ("reply", "close"):
        decision = "close_politely"
    if decision == "close_politely" and kind in ("opener", "followup"):
        decision = "rewrite"                       # nobody replied yet: nothing to close
    if decision == "close_politely":
        make_close(candidate, prospect, msg, verdict.reason, keep_draft=False)
        return msg
    notes = [verdict.reason] + low + [f"Unsupported: {c}" for c in verdict.unsupported_claims]
    msg.review_status = "passed" if decision == "pass" else "rewrite"
    msg.review_notes = [n for n in notes if n]
    return msg


def review(candidate: Candidate, prospect: Prospect, msg: Message, kind: str | None = None,
           rapport: int | None = None, use_llm: bool = True, negative: bool = False) -> Message:
    """Review a draft in place and return it. use_llm=False leaves status 'pending' for a review work packet."""
    kind = kind or kind_of(msg, prospect)
    if negative:
        make_close(candidate, prospect, msg, "their reply was negative")
        kind = "close"
        if not use_llm:
            return msg
    problems = deterministic(candidate, prospect, msg, kind)
    if problems:
        if kind == "close":
            msg.body = messages.gracious_close(prospect)
            msg.review_status, msg.review_notes = "close", ["Gracious close (template): draft failed close rules"]
            return msg
        msg.review_status, msg.review_notes = "rewrite", [f"[attempt {attempts(msg) + 1}]"] + problems
        return msg
    if not use_llm:
        if msg.review_status != "close":
            msg.review_status, msg.review_notes = "pending", []
        return msg
    try:
        verdict = llm.parse(prompts.REVIEW_DRAFT, review_input(candidate, prospect, msg, kind, rapport),
                            ReviewVerdict, effort="medium")
        if not isinstance(verdict, ReviewVerdict):
            raise TypeError("reviewer returned the wrong schema")
    except anthropic.APIError:
        raise
    except Exception as e:  # reviewer unavailable: code checks passed; a review packet picks it up later
        if msg.review_status != "close":
            msg.review_status = "checks_only"
        msg.review_notes = [f"LLM reviewer unavailable ({type(e).__name__}); code checks passed"]
        return msg
    return finish(candidate, prospect, msg, kind, verdict)


def finish(candidate: Candidate, prospect: Prospect, msg: Message, kind: str, verdict: ReviewVerdict) -> Message:
    """Apply an LLM verdict (from the API or a work packet). A close is never held: the template fixes it."""
    if kind == "close":
        if verdict.decision == "rewrite" or verdict.truthfulness < MIN_SCORE or verdict.safety < MIN_SCORE:
            msg.body = messages.gracious_close(prospect)
            msg.review_notes = [f"Reviewer: {verdict.reason}; used the template close"]
        msg.review_status = "close"
        return msg
    attempt = attempts(msg) + 1
    apply_verdict(candidate, prospect, msg, kind, verdict)
    if msg.review_status == "rewrite":
        msg.review_notes = [f"[attempt {attempt}]"] + msg.review_notes
    return msg


def attempts(msg: Message) -> int:
    """How many times the reviewer has sent this draft back."""
    for n in msg.review_notes:
        m = re.match(r"\[attempt (\d+)\]", n)
        if m:
            return int(m.group(1))
    return 0


def safe_fallback(prospect: Prospect) -> str:
    """Used after MAX_ATTEMPTS failed rewrites of a reply, so the client is never left without a draft."""
    name = messages.first_name(prospect)
    return f"Thanks{', ' + name if name else ''}, that's really helpful context."


MAX_ATTEMPTS = 3
