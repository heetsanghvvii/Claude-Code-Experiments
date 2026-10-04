"""Message 1 generation with rule-based checks, and conversation-aware replies."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from . import llm, prompts
from .models import Candidate, Hook, Message, OpenerDraft, Prospect, ReplyAnalysis

MAX_OPENER_CHARS = 300  # LinkedIn connection note limit

BANNED_PHRASES = [
    "came across your profile", "impressive", "i'd love to connect", "would love to connect",
    "learn from your journey", "pick your brain", "hope this finds you", "reaching out",
    "i hope you're doing well", "synergy", "excited to", "passionate about",
]

# An opener must not ask for any of these.
ASK_PATTERNS = [
    r"\breferr?al\b", r"\brefer me\b", r"\bopenings?\b", r"\bvacanc", r"\binterview\b",
    r"\bresume\b", r"\bcv\b", r"\bhiring\b", r"\bjob\b", r"\bquick call\b", r"\bcoffee\b",
    r"\b15 minutes\b", r"\bhop on\b",
]


def check_opener(body: str, first_name: str) -> list[str]:
    """Return a list of problems. Empty list means the message passes."""
    problems = []
    lower = body.lower()
    if len(body) > MAX_OPENER_CHARS:
        problems.append(f"Too long: {len(body)} chars, max {MAX_OPENER_CHARS}.")
    for phrase in BANNED_PHRASES:
        if phrase in lower:
            problems.append(f'Banned phrase: "{phrase}".')
    for pattern in ASK_PATTERNS:
        if re.search(pattern, lower):
            problems.append(f"Looks like an ask ({pattern}). Message 1 must not ask for anything.")
    if "!" in body:
        problems.append("No exclamation marks.")
    if "—" in body or "–" in body or " - " in body:
        problems.append("No dashes used as punctuation.")
    if first_name and first_name.lower() not in lower[:40]:
        problems.append(f"Must greet {first_name} by first name at the start.")
    return problems


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _candidate_brief(candidate: Candidate) -> str:
    story = "\n".join(f"- {k}: {v}" for k, v in candidate.story.items())
    return f"Candidate: {candidate.full_name}. {candidate.headline}\nTarget roles: {', '.join(candidate.target_roles)}\n{story}"


def write_opener(candidate: Candidate, prospect: Prospect, hook: Hook, max_attempts: int = 3) -> tuple[Message, list[str]]:
    facts = {f.id: f.text for f in candidate.facts + prospect.facts}
    first_name = prospect.full_name.split()[0] if prospect.full_name else ""
    base = (
        f"{_candidate_brief(candidate)}\n\n"
        f"Recipient: {prospect.full_name}, {prospect.headline} at {prospect.company}\n"
        f"Hook: {hook.summary}\n"
        f"Candidate side: {facts.get(hook.candidate_fact_id, '')}\n"
        f"Recipient side: {facts.get(hook.prospect_fact_id, '')}"
    )
    feedback = ""
    problems: list[str] = []
    draft = None
    for _ in range(max_attempts):
        draft = llm.parse(prompts.WRITE_OPENER, base + feedback, OpenerDraft)
        problems = check_opener(draft.body, first_name)
        if not problems:
            break
        feedback = "\n\nYour previous draft was rejected:\n" + draft.body + "\nProblems:\n- " + "\n- ".join(problems)
    msg = Message(direction="outbound", step=1, body=draft.body, style=draft.style, created_at=_now())
    return msg, problems


def thread_text(prospect: Prospect) -> str:
    lines = []
    for m in prospect.messages:
        who = "CANDIDATE" if m.direction == "outbound" else prospect.full_name.upper()
        lines.append(f"{who}: {m.body}")
    return "\n".join(lines)


def next_reply(candidate: Candidate, prospect: Prospect) -> ReplyAnalysis:
    facts = "\n".join(f"- {f.text}" for f in prospect.facts[:15])
    text = (
        f"{_candidate_brief(candidate)}\n\n"
        f"Recipient: {prospect.full_name}, {prospect.headline} at {prospect.company} ({prospect.bucket.value})\n"
        f"What we know about them:\n{facts}\n\n"
        f"THREAD SO FAR:\n{thread_text(prospect)}"
    )
    return llm.parse(prompts.ANALYZE_REPLY, text, ReplyAnalysis, effort="high")
