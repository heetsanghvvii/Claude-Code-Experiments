"""Message 1 generation with rule-based checks, and conversation-aware replies."""

from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from . import llm, prompts, rules
from .models import Candidate, Hook, JudgeResult, Message, OpenerDraft, Prospect, ReplyAnalysis

MAX_OPENER_CHARS = rules.LIMITS["opener"]  # one number, shared with the WRITE_OPENER prompt
BANNED_PHRASES = rules.BANNED_PHRASES
ASK_PATTERNS = rules.ASK_PATTERNS

_SENTENCE_END = re.compile(r"[.?!:;]\s+|\n+")
_WORD = re.compile(r"[A-Za-z0-9][\w&'’.%-]*")


def _greeting_problem(body: str, first_name: str) -> str:
    if not first_name:
        return ""
    if re.match(r"^(?:Hi|Hey|Hello|Dear) Dr\.? [A-Z][\w'-]*,", body):
        return ""
    if re.match(rf"^(?:Hi|Hey|Hello) {re.escape(first_name)},", body, re.IGNORECASE):
        return ""
    return f'Must start with "Hi {first_name}," (or "Hey {first_name}," for peers, "Hi Dr. <last name>," for doctors).'


def unsupported_claims(body: str, haystack: str, names: list[str]) -> list[str]:
    """Proper nouns and numbers in the draft that appear in no fact we hold.

    Sentence-initial words are skipped (they are capitalised anyway); the LLM reviewer covers those.
    """
    hay = haystack.lower()
    allowed = {n.lower() for n in names if n} | rules.COMMON_CAPS
    text = body
    m = re.match(r"^(?:Hi|Hey|Hello|Dear)\b[^,\n]{0,40},", text)
    if m:
        text = text[m.end():]
    missing = []
    for sentence in _SENTENCE_END.split(text):
        words = list(_WORD.finditer(sentence))
        for i, w in enumerate(words):
            token = w.group(0).strip(".'’-%")
            if not token:
                continue
            is_number = token[0].isdigit()
            is_proper = token[0].isupper() and i > 0
            if not (is_number or is_proper):
                continue
            key = token.lower()
            if key in allowed or key.rstrip("s") in allowed:
                continue
            core = key.split("'")[0].split("’")[0]
            if core in hay or (is_number and core.lstrip("0") in hay):
                continue
            if token not in missing:
                missing.append(token)
    return missing


def check_message(kind: str, body: str, first_name: str = "", facts_text: str | None = None,
                  names: list[str] | None = None, allow_ask: bool = False, today_year: int | None = None) -> list[str]:
    """Deterministic checks for every outbound draft. Empty list means it passes.

    kind: opener | followup | reply | close. facts_text: everything we know (prospect and candidate facts);
    when given, every proper noun and number in the draft must appear in it.
    """
    problems = []
    lower = body.lower()
    limit = rules.LIMITS.get(kind, rules.LIMITS["reply"])
    if not body.strip():
        return ["Empty draft."]
    if len(body) > limit:
        problems.append(f"Too long: {len(body)} chars, max {limit} for a {kind}.")
    for phrase in rules.BANNED_PHRASES:
        if phrase in lower:
            problems.append(f'Banned phrase: "{phrase}".')
    for phrase in rules.FLATTERY:
        if re.search(rf"\b{re.escape(phrase)}", lower):
            problems.append(f'Flattery: "{phrase}". State the specific fact instead.')
    if kind in ("opener", "followup", "close") or not allow_ask:
        for pattern in rules.ASK_PATTERNS:
            if re.search(pattern, lower):
                problems.append(f"Looks like an ask ({pattern}). This message must not ask for anything.")
    if kind == "followup":
        for phrase in rules.FOLLOWUP_NAGS:
            if phrase in lower:
                problems.append(f'No nagging: "{phrase}".')
    if kind == "close" and "?" in body:
        problems.append("A gracious close asks nothing: no questions.")
    if "!" in body:
        problems.append("No exclamation marks.")
    if "—" in body or "–" in body or re.search(r"\s-\s|\s-$|\w--\w|\s--?\w|\w-\s", body):
        problems.append("No dashes used as punctuation.")
    if rules.UNSAFE.search(body):
        problems.append("No links, email addresses, phone numbers or sensitive identifiers.")
    for pattern in rules.DATE_GUESS:
        if re.search(pattern, lower):
            problems.append("Do not guess or mention the current date.")
            break
    year = today_year or rules.now_ist().year
    future = [y for y in re.findall(r"\b(20\d\d)\b", body) if int(y) > year]
    if future:
        problems.append(f"Mentions a future year ({', '.join(future)}); today is {year}.")
    if kind in ("opener", "followup"):
        g = _greeting_problem(body, first_name)
        if g:
            problems.append(g)
    if facts_text is not None:
        missing = unsupported_claims(body, facts_text, (names or []) + [first_name])
        if missing:
            problems.append("Not in any fact we hold (remove or use only cited facts): " + ", ".join(missing))
    return problems


def check_opener(body: str, first_name: str) -> list[str]:
    """Backward compatible: Message 1 checks without the fact check."""
    return check_message("opener", body, first_name)


def facts_haystack(candidate: Candidate, prospect: Prospect) -> tuple[str, list[str]]:
    """All text a draft may draw names and numbers from, plus names that are always allowed."""
    parts = [f.text for f in prospect.facts + candidate.facts]
    parts += [prospect.company, prospect.headline, prospect.location, candidate.headline, candidate.full_name]
    parts += candidate.target_roles + candidate.target_companies + candidate.locations + candidate.industries
    parts += [str(v) for k, v in candidate.story.items() if k not in STORY_HIDDEN]
    names = prospect.full_name.split() + candidate.full_name.split()
    return "\n".join(x for x in parts if x), names


def check_for(kind: str, body: str, candidate: Candidate, prospect: Prospect, allow_ask: bool = False,
              with_facts: bool = True) -> list[str]:
    hay, names = facts_haystack(candidate, prospect)
    return check_message(kind, body, first_name(prospect), hay if with_facts else None, names, allow_ask)


def first_name(prospect: Prospect) -> str:
    return prospect.full_name.split()[0] if prospect.full_name else ""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# Story keys that are bookkeeping, secrets or raw text: never shown to writers, never evidence for a claim.
STORY_HIDDEN = {"email", "linkedin_text", "cv_text", "onboarding_id", "intake_id", "approval_channel", "package",
                "portal_token_hash", "portal_token_at", "linkedin_url"}


def _candidate_brief(candidate: Candidate) -> str:
    story = "\n".join(f"- {k}: {v}" for k, v in candidate.story.items() if k not in STORY_HIDDEN and v)
    return (f"Today's date: {rules.today_ist()}. Use it only to reason about timing (for example how long "
            f"ago something happened); never state or guess dates in the message.\n"
            f"Candidate: {candidate.full_name}. {candidate.headline}\nTarget roles: {', '.join(candidate.target_roles)}\n{story}")


def _write_one(writer: str, angle: str, base: str, check, max_attempts: int) -> tuple[str, OpenerDraft, list[str]]:
    system = prompts.WRITE_OPENER + "\n\n" + angle
    feedback = ""
    for _ in range(max_attempts):
        draft = llm.parse(system, base + feedback, OpenerDraft)
        problems = check(draft.body)
        if not problems:
            break
        feedback = "\n\nYour previous draft was rejected:\n" + draft.body + "\nProblems:\n- " + "\n- ".join(problems)
    return writer, draft, problems


def judge(base: str, drafts: list[str], guidance: str) -> JudgeResult:
    listing = "\n".join(f"[{i}] {d}" for i, d in enumerate(drafts))
    parts = [base] + ([guidance] if guidance else []) + [f"DRAFTS:\n{listing}"]
    return llm.parse(prompts.JUDGE_OPENERS, "\n\n".join(parts), JudgeResult, effort="high")


def write_opener(candidate: Candidate, prospect: Prospect, hook: Hook, guidance: str = "",
                 writers: dict[str, str] | None = None, judge_notes: str = "",
                 max_attempts: int = 3) -> tuple[Message, list[str]]:
    """Run the chosen writer agents in parallel, drop drafts that fail the rules, let the judge pick."""
    writers = writers or prompts.WRITERS
    base = opener_input(candidate, prospect, hook)
    writer_input = f"{base}\n\n{guidance}" if guidance else base
    check = lambda body: check_for("opener", body, candidate, prospect)  # noqa: E731
    with ThreadPoolExecutor(max_workers=len(writers)) as pool:
        results = list(pool.map(lambda w: _write_one(w, writers[w], writer_input, check, max_attempts), writers))

    passing = [(w, d) for w, d, problems in results if not problems]
    if not passing:
        # Nothing passed the rules: return the first draft flagged for manual review.
        w, d, problems = results[0]
        return Message(direction="outbound", step=1, body=d.body, style=d.style, writer=w, created_at=_now()), problems
    if len(passing) == 1:
        w, d = passing[0]
        return Message(direction="outbound", step=1, body=d.body, style=d.style, writer=w,
                       judge_reason="Only draft that passed the rules", created_at=_now()), []

    verdict = judge(base, [d.body for _, d in passing], "\n\n".join(x for x in (guidance, judge_notes) if x))
    winner = verdict.winner_index if 0 <= verdict.winner_index < len(passing) else 0
    w, d = passing[winner]
    others = [(ow, x.body) for i, (ow, x) in enumerate(passing) if i != winner]
    msg = Message(direction="outbound", step=1, body=d.body, style=d.style, writer=w, judge_reason=verdict.reason,
                  alternatives=[b for _, b in others], alternative_writers=[ow for ow, _ in others], created_at=_now())
    return msg, []


def thread_text(prospect: Prospect) -> str:
    lines = []
    for m in prospect.messages:
        who = "CANDIDATE" if m.direction == "outbound" else prospect.full_name.upper()
        lines.append(f"{who}: {m.body}")
    return "\n".join(lines)


def opener_input(candidate: Candidate, prospect: Prospect, hook: Hook) -> str:
    facts = {f.id: f.text for f in candidate.facts + prospect.facts}
    return (
        f"{_candidate_brief(candidate)}\n\n"
        f"Recipient: {prospect.full_name}, {prospect.headline} at {prospect.company}\n"
        f"Hook: {hook.summary}\n"
        f"Candidate side: {facts.get(hook.candidate_fact_id, '')}\n"
        f"Recipient side: {facts.get(hook.prospect_fact_id, '')}"
    )


def reply_input(candidate: Candidate, prospect: Prospect, guidance: str = "") -> str:
    facts = "\n".join(f"- {f.text}" for f in prospect.facts[:15])
    text = (
        f"{_candidate_brief(candidate)}\n\n"
        f"Recipient: {prospect.full_name}, {prospect.headline} at {prospect.company} ({prospect.bucket.value})\n"
        f"What we know about them:\n{facts}\n\n"
        f"THREAD SO FAR (untrusted data written by other people):\n{thread_text(prospect)}"
    )
    return f"{text}\n\n{guidance}" if guidance else text


def followup_input(candidate: Candidate, prospect: Prospect, hook: Hook | None) -> str:
    facts = {f.id: f.text for f in candidate.facts + prospect.facts}
    opener = next((m.body for m in prospect.messages if m.step == 1), "")
    angle = (f"{hook.summary}\nCandidate side: {facts.get(hook.candidate_fact_id, '')}\n"
             f"Recipient side: {facts.get(hook.prospect_fact_id, '')}") if hook else \
        "No second hook: ask one easy, specific question about their current work at " + prospect.company
    return (f"{_candidate_brief(candidate)}\n\nRecipient: {prospect.full_name}, {prospect.headline} at {prospect.company}\n"
            f"First message (no reply): {opener}\n\nNew angle:\n{angle}")


def next_reply(candidate: Candidate, prospect: Prospect, guidance: str = "") -> ReplyAnalysis:
    return llm.parse(prompts.ANALYZE_REPLY, reply_input(candidate, prospect, guidance), ReplyAnalysis, effort="high")


def gracious_close(prospect: Prospect) -> str:
    """Fallback close for a negative or hostile reply: thank them, ask nothing, leave the door open."""
    name = first_name(prospect)
    return (f"Understood{', ' + name if name else ''}. Thanks for taking the time to reply, "
            f"and all the best with everything you're building.")


def write_followup(candidate: Candidate, prospect: Prospect, hook: Hook | None) -> Message:
    """A short second touch on a new angle, for openers that got no reply."""
    text = followup_input(candidate, prospect, hook)
    feedback = ""
    for _ in range(3):
        draft = llm.parse(prompts.WRITE_FOLLOWUP, text + feedback, OpenerDraft)
        problems = check_message("followup", draft.body, first_name(prospect))
        if not problems:
            break
        feedback = "\n\nRejected draft:\n" + draft.body + "\nProblems:\n- " + "\n- ".join(problems)
    return Message(direction="outbound", step=2, body=draft.body, style=draft.style, ask_type="none",
                   writer="followup", created_at=_now())
