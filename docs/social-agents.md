# Social Agent Team

Multi-agent system on Claude Code. Brand OS lives in `brand-brain/`. Agents live in `.claude/agents/`. Everything lands in `queue/pending` for human approval before anything is used.

## Phases
| Phase | Scope | Status |
| --- | --- | --- |
| 1 | brand-brain + content-engine + approval queue + memory (manual posting) | built |
| 2 | trend-radar + engagement | next |
| 3 | Platform APIs (Meta Graph, YouTube Data, LinkedIn), scheduler, orchestrator, interrupts | later |

(creative-studio ships with Phase 2 alongside engagement, orchestrator and scheduler with Phase 3.)

## Folders
- `brand-brain/` voice-guide, hook-bank, channel-playbooks, faq-library, visual-specs
- `queue/pending/` every output waiting on you
- `queue/approved/` approved, ready to post (or schedule in Phase 3)
- `queue/rejected/` rejected, with reason appended
- `queue/published/` done, with link and date
- `memory/post-log.md` one row per published post
- `memory/learnings.md` what works, what flopped

## Daily use (Phase 1)
1. Ask: "content-engine: write a LinkedIn post about <topic>".
2. Open `queue/pending/`. Read the SUMMARY.
3. Reply in chat: `approve <id>`, `edit <id>: <change>`, or `reject <id>: <why>`.
4. On approve: file moves to `queue/approved/`. You post manually.
5. After posting: tell Claude `posted <id> <url>`. File moves to `queue/published/` and a row is added to `memory/post-log.md`.
6. A few days later: `perf <id>: <numbers>`. Claude updates the log and `memory/learnings.md`.

## Queue handling rules (for the main Claude session)
When the human replies with one of these, act exactly so:
- `approve <id>`: set `status: approved` in front matter, move file `queue/pending/` to `queue/approved/`.
- `edit <id>: <change>`: re-run content-engine on that file with the change, overwrite in `queue/pending/`, status stays pending.
- `reject <id>: <why>`: set `status: rejected`, append `rejected_reason`, move to `queue/rejected/`. Add a line to `memory/learnings.md` under "Rejected and why".
- `posted <id> <url>`: set `status: published`, add `published_url` and `published_at`, move to `queue/published/`, append a row to `memory/post-log.md`.
- `perf <id>: <metrics>`: update the row's performance column, then add a takeaway to `memory/learnings.md` if a pattern is visible.

Only interrupt the human for: budget decisions, edge cases the playbooks do not cover, escalations flagged by engagement.

## Placeholder gate
Agents refuse to write brand content while required brand-brain files still contain `[BRACKETS]` for voice examples, banned words, or channel rules. Fill them first.
