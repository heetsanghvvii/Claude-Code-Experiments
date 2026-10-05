"""Turn resumes and LinkedIn "Save to PDF" exports into fact lists."""

from __future__ import annotations

from pathlib import Path

from . import llm, prompts
from .models import ExtractedProfile, Fact


def extract(pdf_paths: list[str | Path], extra_text: str = "") -> ExtractedProfile:
    content: list[dict] = [llm.pdf_block(p) for p in pdf_paths]
    text = "Extract the profile facts from the document(s) above."
    if extra_text.strip():
        text += f"\n\nAdditional material (recent posts or notes):\n{extra_text.strip()}"
    content.append({"type": "text", "text": text})
    return llm.parse(prompts.EXTRACT_PROFILE, content, ExtractedProfile)


def extract_text(text: str) -> ExtractedProfile:
    """Same as extract(), for enrichment data that arrives as text (e.g. a CSV row)."""
    return llm.parse(prompts.EXTRACT_PROFILE, f"Extract the profile facts from this data:\n\n{text}", ExtractedProfile)


def to_facts(profile: ExtractedProfile, owner: str, prefix: str, source: str) -> list[Fact]:
    return [
        Fact(id=f"{prefix}:{i}", owner=owner, kind=f.kind, text=f.text, source=source)
        for i, f in enumerate(profile.facts, start=1)
    ]


TEXT_KEYS = (("linkedin_text", "LinkedIn profile"), ("cv_text", "CV"))


def pending_text(candidate) -> bool:
    """True when onboarding left raw LinkedIn / CV text in the story for fact extraction."""
    return any(candidate.story.get(k) for k, _ in TEXT_KEYS)


def facts_from_story_text(candidate) -> int:
    """Extract facts from raw PDF text stored by onboarding, then drop the raw text from the story
    (the story is shown to every writer prompt, so it must stay short). Returns the number of facts."""
    parts = [f"{label}:\n{candidate.story[k]}" for k, label in TEXT_KEYS if candidate.story.get(k)]
    if not parts:
        return 0
    extracted = extract_text("\n\n".join(parts))
    candidate.headline = extracted.headline or candidate.headline
    candidate.facts = to_facts(extracted, "candidate", "c", "cv")
    for k, _ in TEXT_KEYS:
        candidate.story.pop(k, None)
    return len(candidate.facts)
