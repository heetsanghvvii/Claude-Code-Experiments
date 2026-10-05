"""Deterministic writing rules shared by prompts, writers and the review layer.

One number per message kind, used both in the prompts and in the code checks, so a draft that the
prompt forbids can never pass the code (and the other way round).
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

IST = timezone(timedelta(hours=5, minutes=30))

# Max characters per message kind.
LIMITS = {
    "opener": 280,     # LinkedIn connection note is 300; we keep a margin
    "followup": 220,   # second touch after no reply
    "reply": 400,      # next message in a live conversation
    "close": 300,      # gracious close after a negative or hostile reply
}

BANNED_PHRASES = [
    "came across your profile", "i'd love to connect", "would love to connect",
    "learn from your journey", "pick your brain", "hope this finds you", "reaching out",
    "i hope you're doing well", "synergy", "excited to", "passionate about",
]

# Flattery reads as a template and lowers replies. Matched on word boundaries.
FLATTERY = [
    "impressive", "impressed", "amazing", "incredible", "inspiring", "inspired by", "huge fan", "big fan",
    "admire", "brilliant", "stellar", "remarkable", "fantastic", "outstanding", "great work", "love your work",
    "rockstar", "legend", "thought leader", "fast arc", "a rare", "more people talk about than",
    "trailblazer", "visionary", "kudos", "hats off",
]

# Asks that Message 1 and the follow-up must never contain. "on the job" and "day job" are fine.
ASK_PATTERNS = [
    r"\breferr?al\b", r"\brefer(?:ring)? me\b", r"\bopenings?\b", r"\bvacanc", r"\binterview\b",
    r"\bresume\b", r"\bcv\b", r"\bhiring\b", r"\bjob (?:opening|opportunit|posting|offer|search|hunt)",
    r"\b(?:looking for|find|get|land|need|apply for|applying for) (?:a |any |the )?(?:new )?(?:job|role|position)\b",
    r"\b(?:any|a) (?:job|role|position)s? (?:open|available|on your team)", r"\bopen (?:roles?|positions?)\b",
    r"\bfor a job\b", r"\bquick call\b", r"\bcoffee\b", r"\b15 minutes\b", r"\bhop on\b", r"\bjump on a\b",
]

FOLLOWUP_NAGS = [
    "just following up", "following up", "bumping", "circling back", "didn't hear back", "did not hear back",
    "did you see my", "in case you missed", "gentle reminder",
]

# Links, emails, phone numbers and sensitive identifiers never leave in a draft.
UNSAFE = re.compile(
    r"https?://|www\.|\b[\w.+-]+@[\w-]+\.[\w.]+\b|(?:\+?\d[\s-]?){10,}|\b(?:password|otp|bank|upi|aadhaar|pan card)\b",
    re.IGNORECASE)

# A guessed or hedged date ("I think it's October") or a date beyond today is a sign the writer invented timing.
DATE_GUESS = [
    r"\bi (?:think|believe|guess|assume) (?:it'?s|today is|we'?re in)\b", r"\bas of (?:today|now)\b",
    r"\b(?:today|the current date) (?:is|being)\b", r"\bif (?:i'?m|my) (?:dates?|calendar)\b",
    r"\bassuming (?:it'?s|today)\b",
]

# Capitalised words that are not claims about anyone.
COMMON_CAPS = {
    "i", "i'm", "i've", "i'd", "i'll", "linkedin", "pm", "pms", "apm", "ai", "ml", "mba", "b2b", "b2c", "d2c",
    "saas", "ux", "ui", "gm", "vp", "kpi", "kpis", "okr", "okrs", "p&l", "hi", "hey", "hello", "dr", "dr.",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
}

# C-suite: too senior for a cold first touch unless the hook is unusually strong.
C_SUITE = re.compile(
    r"\b(?:ceo|coo|cfo|cto|cmo|cpo|cbo|cro|cxo|chief [a-z ]{0,30}officer|managing director|president)\b",
    re.IGNORECASE)
C_SUITE_MIN_HOOK = 3.5


def is_c_suite(headline: str) -> bool:
    text = headline or ""
    return bool(C_SUITE.search(text)) and not re.search(r"\b(?:vice president|vp|assistant|associate|office of)\b",
                                                        text, re.IGNORECASE)


def now_ist() -> datetime:
    return datetime.now(IST)


def today_ist() -> str:
    """Today's date for writer prompts, e.g. '2026-10-05 (Monday), IST'."""
    d = now_ist()
    return f"{d.date().isoformat()} ({d.strftime('%A')}), IST"
