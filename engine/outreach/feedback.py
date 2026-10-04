"""Feedback layer: operator edits and real outcomes teach the writer agents.

Stored globally (across all candidates) in data/feedback.json, because the patterns
that make openers work carry over between clients.
"""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone

from . import llm, prompts, store
from .models import Candidate, Playbook

REPLIED = {"replied", "conversation", "referral", "interview", "offer"}
CONTACTED = REPLIED | {"sent", "accepted", "no_response", "declined"}
MIN_EVIDENCE = 5  # edits + outcomes needed before distilling a playbook


def _path():
    return store.DATA_DIR / "feedback.json"


def load() -> dict:
    if _path().exists():
        return json.loads(_path().read_text())
    return {"edits": [], "playbook": [], "playbook_history": []}


def save(data: dict) -> None:
    store.DATA_DIR.mkdir(parents=True, exist_ok=True)
    _path().write_text(json.dumps(data, indent=2))


def record_edit(draft: str, final: str, writer: str, hook_type: str, bucket: str) -> None:
    if draft.strip() == final.strip():
        return
    data = load()
    data["edits"].append({
        "draft": draft, "final": final, "writer": writer, "hook_type": hook_type, "bucket": bucket,
        "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    })
    save(data)


def playbook() -> list[str]:
    return load().get("playbook", [])


def outcomes(candidates: list[Candidate]) -> list[dict]:
    """Every sent opener with whether it got a reply."""
    rows = []
    for c in candidates:
        for p in c.prospects:
            if p.status not in CONTACTED:
                continue
            opener = next((m for m in p.messages if m.direction == "outbound" and m.step == 1), None)
            if opener:
                rows.append({
                    "body": opener.body, "writer": opener.writer, "bucket": p.bucket.value,
                    "hook_type": p.hooks[0].hook_type if p.hooks else "", "replied": p.status in REPLIED,
                })
    return rows


def writer_stats(rows: list[dict]) -> dict[str, tuple[int, int]]:
    stats: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for r in rows:
        stats[r["writer"] or "unknown"][0] += r["replied"]
        stats[r["writer"] or "unknown"][1] += 1
    return {k: (v[0], v[1]) for k, v in stats.items()}


def examples(rows: list[dict], n: int = 3) -> list[str]:
    """Recent openers that got replies, used as style references for writers."""
    return [r["body"] for r in rows if r["replied"]][-n:]


def guidance(candidates: list[Candidate]) -> str:
    """Text block injected into writer and judge prompts."""
    parts = []
    rules = playbook()
    if rules:
        parts.append("Writing rules learned from past results:\n- " + "\n- ".join(rules))
    winners = examples(outcomes(candidates))
    if winners:
        parts.append("Past openers that got replies (match the feel, never copy the content):\n" +
                     "\n".join(f'"{w}"' for w in winners))
    return "\n\n".join(parts)


def distill(candidates: list[Candidate]) -> list[str] | None:
    """Rewrite the playbook from edits and outcomes. Returns None if not enough evidence."""
    data = load()
    rows = outcomes(candidates)
    evidence = len(data["edits"]) + len(rows)
    if evidence < MIN_EVIDENCE:
        return None
    edits = "\n\n".join(f"DRAFT: {e['draft']}\nSENT: {e['final']}" for e in data["edits"][-30:])
    replied = "\n".join(f"- {r['body']}" for r in rows if r["replied"])[-6000:]
    ignored = "\n".join(f"- {r['body']}" for r in rows if not r["replied"])[-6000:]
    current = "\n".join(f"- {r}" for r in data["playbook"]) or "(none)"
    text = (f"CURRENT RULES:\n{current}\n\nOPERATOR EDITS:\n{edits or '(none)'}\n\n"
            f"GOT REPLIES:\n{replied or '(none)'}\n\nNO REPLY:\n{ignored or '(none)'}")
    result = llm.parse(prompts.DISTILL_PLAYBOOK, text, Playbook, effort="high")
    data["playbook_history"].append({"rules": data["playbook"], "replaced_at": datetime.now(timezone.utc).isoformat(timespec="seconds")})
    data["playbook"] = result.rules
    save(data)
    return result.rules
