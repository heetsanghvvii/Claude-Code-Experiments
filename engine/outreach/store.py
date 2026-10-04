"""Persistence. One JSON document per candidate, plus a few shared documents.

Uses Supabase (table `engine_state`) when SUPABASE_URL, SUPABASE_KEY (the public publishable key)
and ENGINE_TOKEN are set, so scheduled runs in fresh cloud sessions see the same state.
Row-level security only lets requests carrying the right x-engine-token through (migration 0003).
Falls back to local files.
"""

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx

from .models import Candidate, Prospect

DATA_DIR = Path(os.environ.get("OUTREACH_DATA_DIR", "data"))
SHARED_DOCS = {"feedback", "usage"}


def _supabase() -> tuple[str, dict] | None:
    url, key, token = (os.environ.get(k) for k in ("SUPABASE_URL", "SUPABASE_KEY", "ENGINE_TOKEN"))
    if not (url and key and token):
        return None
    return url.rstrip("/") + "/rest/v1", {"apikey": key, "x-engine-token": token}


def rest(method: str, table: str, *, params: dict | None = None, json_body=None, prefer: str = "") -> list | None:
    """Call Supabase's REST API. Raises if Supabase is not configured."""
    cfg = _supabase()
    if cfg is None:
        raise RuntimeError("Set SUPABASE_URL, SUPABASE_KEY and ENGINE_TOKEN")
    base, headers = cfg
    if prefer:
        headers = {**headers, "Prefer": prefer}
    r = httpx.request(method, f"{base}/{table}", params=params, json=json_body, headers=headers, timeout=30)
    r.raise_for_status()
    return r.json() if r.content else None


# ---------- generic documents ----------

def get_doc(doc_id: str) -> dict | None:
    if _supabase():
        rows = rest("GET", "engine_state", params={"id": f"eq.{doc_id}", "select": "doc"})
        return rows[0]["doc"] if rows else None
    path = DATA_DIR / f"{doc_id}.json"
    return json.loads(path.read_text()) if path.exists() else None


def put_doc(doc_id: str, doc: dict) -> None:
    if _supabase():
        rest("POST", "engine_state", params={"on_conflict": "id"},
             json_body={"id": doc_id, "doc": doc, "updated_at": datetime.now(timezone.utc).isoformat()},
             prefer="resolution=merge-duplicates")
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = DATA_DIR / f"{doc_id}.tmp"
    tmp.write_text(json.dumps(doc, indent=2))
    tmp.replace(DATA_DIR / f"{doc_id}.json")


def list_doc_ids() -> list[str]:
    if _supabase():
        return sorted(r["id"] for r in rest("GET", "engine_state", params={"select": "id"}))
    return sorted(p.stem for p in DATA_DIR.glob("*.json")) if DATA_DIR.exists() else []


# ---------- candidates ----------

def new_id(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:24]
    return f"{slug}-{uuid.uuid4().hex[:6]}"


def save(candidate: Candidate) -> None:
    put_doc(candidate.id, json.loads(candidate.model_dump_json()))


def load(candidate_id: str) -> Candidate:
    doc = get_doc(candidate_id)
    if doc is None:
        raise KeyError(f"No candidate {candidate_id}")
    return Candidate.model_validate(doc)


def list_ids() -> list[str]:
    return [i for i in list_doc_ids() if i not in SHARED_DOCS]


def get_prospect(candidate: Candidate, prospect_id: str) -> Prospect:
    for p in candidate.prospects:
        if p.id == prospect_id:
            return p
    raise KeyError(f"No prospect {prospect_id} for {candidate.id}")
