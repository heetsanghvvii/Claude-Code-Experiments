# Check: viral post

Scheduled task prompt. Run as the orchestrator. Never publish.

## Inputs
- `memory/post-log.md` (published posts, with URLs and any logged performance)
- Fresh metrics: run the stats scripts in dry run first to confirm the request, then with `LIVE=1` ONLY if the human has enabled live reads for scheduled checks:
  `node integrations/meta/dms.js insights <media_id>`, `node integrations/youtube/stats.js video <id>`, `node integrations/linkedin/stats.js post <urn>`
  If the human has not enabled live reads, ask the human to paste metrics instead.
- Baseline: median of the last 10 posts on the same channel (from post-log.md performance column)

## Thresholds
| Metric | Viral | Breakout |
| --- | --- | --- |
| Reach or views vs channel median, first 24h | 3x | 8x |
| Engagement rate vs median | 2x | 4x |
| Shares or saves vs median | 3x | 6x |
| Post age | under 7 days | under 3 days |

Viral = any two metrics in the Viral column. Breakout = any two in the Breakout column.

## Action
1. Compute the multiples for every post under 7 days old. If none qualify, stop. Reply `no viral post`.
2. For a qualifying post, write a brief (signal `metrics`) with: post id, the numbers, why it likely worked (hook, format, topic), and the ask: a follow-up post exploiting the same angle (not a copy), plus a pinned comment or CTA update.
3. Ask the engagement agent to prepare replies for the surge of comments and DMs (drafts only; the human approves).
4. Ask the human to add the performance to the `memory/post-log.md` row via `perf` (do not edit the log yourself).

## Routing
- Follow-up post: content-engine (score 7+; breakout 9).
- Comment and DM surge: engagement.
- Spend on boosting the post: human (budget question).
- Signs of a negative pile-on in the comments: also run `checks/bad-review.md`.

## Output
Post id, multiples, briefs written. Nothing else.
