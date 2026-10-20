# Check: thin calendar

Scheduled task prompt. Run as the orchestrator. Never publish.

## Inputs
- Run `node interrupts/thin-calendar.js` from the repo root. It prints JSON `{thin, gaps, scheduled, approved_unscheduled, minimums, warnings}`.
- `brand-brain/channel-playbooks.md` (minimums, pillars, active channels)
- `queue/pending` and `queue/briefs` (work already in flight)

## Thresholds
| Condition | Level |
| --- | --- |
| `thin` is false | no action |
| Any gap, `missing` of 1 | normal (score 4-6) |
| Any gap, `missing` of 2 or more on one channel | high (score 7-8) |
| Calendar empty for the next 3 days | high (score 8) |
| `warnings` mention unfilled minimums or missing playbook | edge case, tell the human once |

The script counts scheduled posts in the next 7 days plus approved files not yet scheduled. Items in `queue/pending` are NOT counted (they are not approved).

## Action
1. Run the script. If `thin` is false and there are no warnings, stop. Reply `calendar ok`.
2. Subtract in-flight pending files and open briefs for the same channel from each gap. Whatever remains is the real shortfall.
3. For each remaining shortfall, write a brief (signal `calendar-gap`) to `queue/briefs/`: channel, count needed, the pillar furthest below its target share, and the deadline (earliest publish slot minus 2 days).
4. If the script shows `approved_unscheduled` above zero, dispatch scheduler first (no new content needed for those).

## Routing
- Missing posts: content-engine (it will fetch trends itself if needed; send trend-radar first only if the playbook pillar needs fresh topics).
- Approved but unscheduled: scheduler.
- Visual-heavy formats (reels, carousels): content-engine, then creative-studio.

## Output
Gaps found, briefs written, departments dispatched. Nothing else.
