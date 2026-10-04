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
