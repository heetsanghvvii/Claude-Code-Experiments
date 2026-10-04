#!/usr/bin/env python3
"""Turn judge results into a scoreboard.

Usage: python3 aggregate.py <results.json> <out_dir>

results.json: {"mapping": [{"id", "skill"}], "criteria": {"name": weight, ...},
               "judgements": [{"lens", "scores": [{"entry", <criterion>: 1-10, "brief_violations", ...}]}]}
Writes <out_dir>/scoreboard.md and <out_dir>/scoreboard.json. Weighted score per judge, then the mean
across judges; ties broken by the lowest spread between judges (more agreement wins).
"""

import json
import statistics
import sys
from pathlib import Path


def main(results_path: Path, out_dir: Path) -> None:
    data = json.loads(results_path.read_text())
    weights = data["criteria"]
    total_w = sum(weights.values())
    skills = {m["id"]: m["skill"] for m in data["mapping"]}
    per_entry: dict[str, list[float]] = {e: [] for e in skills}
    crit_scores: dict[str, dict[str, list[float]]] = {e: {c: [] for c in weights} for e in skills}
    notes: dict[str, list[str]] = {e: [] for e in skills}
    for j in data["judgements"]:
        for s in j.get("scores", []):
            e = s.get("entry")
            if e not in skills:
                continue
            per_entry[e].append(sum(float(s.get(c, 1)) * w for c, w in weights.items()) / total_w)
            for c in weights:
                crit_scores[e][c].append(float(s.get(c, 1)))
            if s.get("brief_violations") and s["brief_violations"].strip().lower() not in ("none", "n/a", ""):
                notes[e].append(f"{j.get('lens', 'judge')}: {s['brief_violations']}")
    rows = []
    for e, scores in per_entry.items():
        mean = round(statistics.mean(scores), 2) if scores else 0.0
        spread = round(max(scores) - min(scores), 2) if len(scores) > 1 else 0.0
        rows.append({"entry": e, "skill": skills[e], "score": mean, "spread": spread, "judges": len(scores),
                     "criteria": {c: round(statistics.mean(v), 1) if v else 0 for c, v in crit_scores[e].items()},
                     "violations": notes[e]})
    rows.sort(key=lambda r: (-r["score"], r["spread"]))
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "scoreboard.json").write_text(json.dumps(rows, indent=2))
    crit = list(weights)
    lines = ["| Rank | Entry | Skill | Score /10 | " + " | ".join(crit) + " | Judge spread |",
             "|---|---|---|---|" + "---|" * len(crit) + "---|"]
    for r in rows:
        lines.append(f"| {r['rank']} | {r['entry']} | {r['skill']} | **{r['score']}** | "
                     + " | ".join(str(r["criteria"][c]) for c in crit) + f" | {r['spread']} |")
    viol = [f"- **{r['entry']}** ({r['skill']}): " + "; ".join(r["violations"]) for r in rows if r["violations"]]
    md = "# Scoreboard\n\n" + "\n".join(lines) + "\n"
    if viol:
        md += "\n## Brief violations flagged by judges\n\n" + "\n".join(viol) + "\n"
    (out_dir / "scoreboard.md").write_text(md)
    print(md)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
