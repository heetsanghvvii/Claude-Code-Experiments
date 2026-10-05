"""Self-learning layer. Every signal teaches the agents:

- Operator edits             -> opener playbook (rules for writers and judge)
- Opener reply outcomes      -> writer selection (Thompson sampling per prospect bucket),
                                retiring weak writers, evolving new writer angles from winners
- Operator overriding judge  -> judge calibration examples
- Conversation outcomes      -> reply playbook and ask-type stats for the reply agent

Stored globally (across all candidates) in the "feedback" document, because the patterns
that make outreach work carry over between clients. `learn()` runs automatically from `sync`.
"""

from __future__ import annotations

import random
from collections import defaultdict
from datetime import datetime, timezone

from . import llm, prompts, store
from .models import Candidate, Playbook, WriterAngle

REPLIED = {"replied", "conversation", "referral", "interview", "offer"}
ADVANCED = {"referral", "interview", "offer"}
CONTACTED = REPLIED | {"sent", "accepted", "no_response", "declined"}
MIN_EVIDENCE = 5          # signals needed before the first playbook
AUTO_LEARN_EVERY = 10     # new signals between automatic learning runs
MIN_SENDS_TO_JUDGE = 10   # sends before a writer can be retired
MAX_WRITERS = 5
WRITERS_PER_PROSPECT = 3


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load() -> dict:
    data = store.get_doc("feedback") or {}
    for key, default in (("edits", []), ("playbook", []), ("playbook_history", []), ("writers", {}),
                         ("retired", {}), ("judge_misses", []), ("reply_playbook", []), ("learned_at_evidence", 0)):
        data.setdefault(key, default)
    if not data["writers"]:
        data["writers"] = dict(prompts.WRITERS)
    return data


def save(data: dict) -> None:
    store.put_doc("feedback", data)


# ---------- signals ----------

def record_edit(draft: str, final: str, writer: str, hook_type: str, bucket: str) -> None:
    if draft.strip() == final.strip():
        return
    data = load()
    data["edits"].append({"draft": draft, "final": final, "writer": writer, "hook_type": hook_type,
                          "bucket": bucket, "at": _now()})
    save(data)


def record_judge_miss(context: str, judge_pick: str, operator_pick: str) -> None:
    data = load()
    data["judge_misses"].append({"context": context[-600:], "judge_pick": judge_pick,
                                 "operator_pick": operator_pick, "at": _now()})
    data["judge_misses"] = data["judge_misses"][-20:]
    save(data)


def outcomes(candidates: list[Candidate]) -> list[dict]:
    """Every sent opener with whether it got a reply."""
    rows = []
    for c in candidates:
        for p in c.prospects:
            if p.status not in CONTACTED:
                continue
            opener = next((m for m in p.messages if m.direction == "outbound" and m.step == 1), None)
            if opener:
                rows.append({"body": opener.body, "writer": opener.writer, "bucket": p.bucket.value,
                             "hook_type": p.hooks[0].hook_type if p.hooks else "", "replied": p.status in REPLIED})
    return rows


def conversations(candidates: list[Candidate]) -> list[dict]:
    """Every conversation that got past the opener, with where it ended up."""
    rows = []
    for c in candidates:
        for p in c.prospects:
            if not any(m.direction == "inbound" for m in p.messages):
                continue
            asks = [m.ask_type for m in p.messages if m.direction == "outbound" and m.step > 1 and m.sent_at]
            thread = "\n".join(f"{'ME' if m.direction == 'outbound' else 'THEM'}: {m.body}" for m in p.messages)
            rows.append({"thread": thread, "asks": asks, "bucket": p.bucket.value, "advanced": p.status in ADVANCED,
                         "status": p.status})
    return rows


def evidence_count(data: dict, candidates: list[Candidate]) -> int:
    return len(data["edits"]) + len(outcomes(candidates)) + len(conversations(candidates)) + len(data["judge_misses"])


# ---------- writer selection ----------

def writer_stats(rows: list[dict], bucket: str | None = None) -> dict[str, tuple[int, int]]:
    stats: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for r in rows:
        if bucket and r["bucket"] != bucket:
            continue
        stats[r["writer"] or "unknown"][0] += r["replied"]
        stats[r["writer"] or "unknown"][1] += 1
    return {k: (v[0], v[1]) for k, v in stats.items()}


def choose_writers(candidates: list[Candidate], bucket: str, k: int = WRITERS_PER_PROSPECT,
                   rng: random.Random | None = None) -> dict[str, str]:
    """Thompson sampling: writers that get replies from this kind of person get picked more,
    while new or unlucky writers still get tried."""
    rng = rng or random.Random()
    data = load()
    rows = outcomes(candidates)
    by_bucket, overall = writer_stats(rows, bucket), writer_stats(rows)
    scores = {}
    for name in data["writers"]:
        replied, sent = by_bucket.get(name) if by_bucket.get(name, (0, 0))[1] >= 5 else overall.get(name, (0, 0))
        scores[name] = rng.betavariate(replied + 1, sent - replied + 1)
    chosen = sorted(scores, key=scores.get, reverse=True)[:k]
    return {name: data["writers"][name] for name in chosen}


# ---------- guidance injected into prompts ----------

def examples(rows: list[dict], n: int = 3) -> list[str]:
    return [r["body"] for r in rows if r["replied"]][-n:]


def guidance(candidates: list[Candidate]) -> str:
    """For writers and the judge."""
    data = load()
    parts = []
    if data["playbook"]:
        parts.append("Writing rules learned from past results:\n- " + "\n- ".join(data["playbook"]))
    winners = examples(outcomes(candidates))
    if winners:
        parts.append("Past openers that got replies (match the feel, never copy the content):\n" +
                     "\n".join(f'"{w}"' for w in winners))
    return "\n\n".join(parts)


def judge_guidance() -> str:
    misses = load()["judge_misses"][-5:]
    if not misses:
        return ""
    lines = [f'You picked: "{m["judge_pick"]}"\nThe operator chose instead: "{m["operator_pick"]}"' for m in misses]
    return "Recent cases where the operator overruled your pick. Learn their taste:\n\n" + "\n\n".join(lines)


def ask_stats(candidates: list[Candidate]) -> dict[str, tuple[int, int]]:
    stats: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for conv in conversations(candidates):
        for ask in set(conv["asks"]):
            stats[ask][0] += conv["advanced"]
            stats[ask][1] += 1
    return {k: (v[0], v[1]) for k, v in stats.items()}


def reply_guidance(candidates: list[Candidate]) -> str:
    """For the reply agent."""
    data = load()
    parts = []
    if data["reply_playbook"]:
        parts.append("Conversation rules learned from past results:\n- " + "\n- ".join(data["reply_playbook"]))
    stats = ask_stats(candidates)
    if stats:
        lines = [f"- {ask}: {adv}/{n} conversations reached a referral or interview" for ask, (adv, n) in sorted(stats.items())]
        parts.append("How each ask type has worked so far:\n" + "\n".join(lines))
    return "\n\n".join(parts)


# ---------- learning ----------

def openers_text(data: dict, rows: list[dict]) -> str:
    edits = "\n\n".join(f"DRAFT: {e['draft']}\nSENT: {e['final']}" for e in data["edits"][-30:])
    replied = "\n".join(f"- {r['body']}" for r in rows if r["replied"])[-6000:]
    ignored = "\n".join(f"- {r['body']}" for r in rows if not r["replied"])[-6000:]
    current = "\n".join(f"- {r}" for r in data["playbook"]) or "(none)"
    return (f"CURRENT RULES:\n{current}\n\nOPERATOR EDITS:\n{edits or '(none)'}\n\n"
            f"GOT REPLIES:\n{replied or '(none)'}\n\nNO REPLY:\n{ignored or '(none)'}")


def _distill_openers(data: dict, rows: list[dict]) -> list[str]:
    return llm.parse(prompts.DISTILL_PLAYBOOK, openers_text(data, rows), Playbook, effort="high").rules


def replies_text(data: dict, convs: list[dict]) -> str:
    won = "\n\n---\n\n".join(c["thread"] for c in convs if c["advanced"])[-8000:]
    lost = "\n\n---\n\n".join(c["thread"] for c in convs if not c["advanced"])[-8000:]
    current = "\n".join(f"- {r}" for r in data["reply_playbook"]) or "(none)"
    return (f"CURRENT RULES:\n{current}\n\nCONVERSATIONS THAT REACHED A REFERRAL OR INTERVIEW:\n{won or '(none)'}\n\n"
            f"CONVERSATIONS THAT STALLED:\n{lost or '(none)'}")


def _distill_replies(data: dict, convs: list[dict]) -> list[str]:
    return llm.parse(prompts.DISTILL_REPLY_PLAYBOOK, replies_text(data, convs), Playbook, effort="high").rules


def retire_writers(data: dict, rows: list[dict]) -> list[str]:
    """Retire writers under half the best reply rate after MIN_SENDS_TO_JUDGE sends."""
    retired = []
    stats = writer_stats(rows)
    rates = {w: r / n for w, (r, n) in stats.items() if w in data["writers"] and n >= MIN_SENDS_TO_JUDGE}
    if rates:
        best = max(rates.values())
        for w, rate in rates.items():
            if len(data["writers"]) > 2 and rate < best * 0.5:
                data["retired"][w] = {"angle": data["writers"].pop(w), "rate": round(rate, 3), "at": _now()}
                retired.append(w)
    return retired


def evolve_text(data: dict, rows: list[dict]) -> str | None:
    """Input for EVOLVE_WRITER, or None when no new writer is due."""
    winners = examples(rows, n=8)
    if len(data["writers"]) >= MAX_WRITERS or len(winners) < 3:
        return None
    current = "\n".join(f"- {n}: {a}" for n, a in data["writers"].items())
    retired = "\n".join(f"- {n}: {v['angle']}" for n, v in data["retired"].items()) or "(none)"
    return (f"CURRENT WRITERS:\n{current}\n\nRETIRED (underperformed):\n{retired}\n\n"
            f"OPENERS THAT GOT REPLIES:\n" + "\n".join(f"- {w}" for w in winners))


def add_writer(data: dict, new: WriterAngle) -> str | None:
    name = new.name.strip().lower().replace(" ", "_")
    if not name or name in data["writers"] or name in data["retired"]:
        return None
    data["writers"][name] = new.angle
    return name


def _evolve_writers(data: dict, rows: list[dict]) -> dict:
    """Retire writers that clearly underperform; spawn a new angle from what is working."""
    changes = {"retired": retire_writers(data, rows), "spawned": []}
    text = evolve_text(data, rows)
    if text:
        name = add_writer(data, llm.parse(prompts.EVOLVE_WRITER, text, WriterAngle, effort="high"))
        if name:
            changes["spawned"].append(name)
    return changes


def learn(candidates: list[Candidate], force: bool = False) -> dict | None:
    """Run every learning step if enough new evidence arrived. Returns a summary, or None if skipped."""
    data = load()
    total = evidence_count(data, candidates)
    if total < MIN_EVIDENCE or (not force and total - data["learned_at_evidence"] < AUTO_LEARN_EVERY):
        return None
    rows, convs = outcomes(candidates), conversations(candidates)
    summary: dict = {"evidence": total}
    if data["edits"] or rows:
        data["playbook_history"].append({"rules": data["playbook"], "replaced_at": _now()})
        data["playbook"] = _distill_openers(data, rows)
        summary["playbook"] = data["playbook"]
    if convs:
        data["reply_playbook"] = _distill_replies(data, convs)
        summary["reply_playbook"] = data["reply_playbook"]
    summary.update(_evolve_writers(data, rows))
    data["learned_at_evidence"] = total
    save(data)
    return summary


def learn_due(candidates: list[Candidate], force: bool = False) -> bool:
    data = load()
    total = evidence_count(data, candidates)
    return total >= MIN_EVIDENCE and (force or total - data["learned_at_evidence"] >= AUTO_LEARN_EVERY)


def apply_learned(candidates: list[Candidate], playbook_rules: list[str], reply_rules: list[str],
                  new_writer: WriterAngle | None) -> dict:
    """Subscription mode: store what a Claude Code session distilled (same effect as learn())."""
    data = load()
    rows, convs = outcomes(candidates), conversations(candidates)
    summary: dict = {"evidence": evidence_count(data, candidates)}
    if playbook_rules:
        data["playbook_history"].append({"rules": data["playbook"], "replaced_at": _now()})
        data["playbook"] = [r.strip() for r in playbook_rules if r.strip()][:15]
        summary["playbook"] = data["playbook"]
    if reply_rules and convs:
        data["reply_playbook"] = [r.strip() for r in reply_rules if r.strip()][:12]
        summary["reply_playbook"] = data["reply_playbook"]
    summary["retired"] = retire_writers(data, rows)
    summary["spawned"] = [n for n in [add_writer(data, new_writer)] if n] if new_writer and evolve_text(data, rows) else []
    data["learned_at_evidence"] = summary["evidence"]
    save(data)
    return summary


def playbook() -> list[str]:
    return load()["playbook"]
