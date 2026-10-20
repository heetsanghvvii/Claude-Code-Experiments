# Interrupts

Interrupts are small scheduled checks that wake the orchestrator when something needs attention outside the normal flow. Each check is a prompt file in `checks/`. A scheduled task runs the prompt, the orchestrator scores the result, writes a brief to `queue/briefs/`, and dispatches a department. The human is interrupted only for budget questions and edge cases.

| Check | Question it answers | Routes to |
| --- | --- | --- |
| `checks/trend-spike.md` | Is a relevant trend taking off right now? | content-engine, creative-studio |
| `checks/viral-post.md` | Is one of our posts breaking out? | content-engine, engagement |
| `checks/bad-review.md` | Is negative sentiment building? | engagement, or the human |
| `checks/thin-calendar.md` | Will we miss the weekly minimums? | content-engine, scheduler |

Supporting files:
- `thin-calendar.js`: Node script (no deps) behind the thin-calendar check. Reads `queue/schedule.json`, `queue/approved/`, and the "Weekly calendar minimum" section of `brand-brain/channel-playbooks.md`; prints `{thin, gaps, ...}`. Missing files become `warnings`, not errors. Run `node interrupts/thin-calendar.js [--days=7] [--now=ISO] [--root=path]`.
- `schedule.md`: cron expressions and ready-to-paste scheduled task prompts.

Rules for every check:
1. Read-only first: gather signals, do not change anything until a threshold is crossed.
2. Silence is success. If no threshold is crossed, reply with the one-line "nothing to do" and write no files.
3. Thresholds live in the tables inside each check. Tune them there, with the learnings in `memory/learnings.md`.
4. A check may write briefs. It may never publish, approve, or edit `memory/post-log.md`.
5. Live API reads (insights, comments) need `LIVE=1` and the human's okay. Otherwise ask the human to paste metrics.
