"""Local JSON store: one file per candidate. Swap for Supabase in Phase 2."""

from __future__ import annotations

import os
import re
import uuid
from pathlib import Path

from .models import Candidate, Prospect

DATA_DIR = Path(os.environ.get("OUTREACH_DATA_DIR", "data"))


def _path(candidate_id: str) -> Path:
    return DATA_DIR / f"{candidate_id}.json"


def new_id(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:24]
    return f"{slug}-{uuid.uuid4().hex[:6]}"


def save(candidate: Candidate) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = _path(candidate.id).with_suffix(".tmp")
    tmp.write_text(candidate.model_dump_json(indent=2))
    tmp.replace(_path(candidate.id))


def load(candidate_id: str) -> Candidate:
    return Candidate.model_validate_json(_path(candidate_id).read_text())


def list_ids() -> list[str]:
    return sorted(p.stem for p in DATA_DIR.glob("*.json")) if DATA_DIR.exists() else []


def get_prospect(candidate: Candidate, prospect_id: str) -> Prospect:
    for p in candidate.prospects:
        if p.id == prospect_id:
            return p
    raise KeyError(f"No prospect {prospect_id} for {candidate.id}")
