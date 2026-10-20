# Check: bad review or negative sentiment

Scheduled task prompt. Run as the orchestrator. Never publish and never reply publicly yourself.

## Inputs
- engagement agent's inbox digest: new comments, DMs, reviews, mentions since the last run
- `brand-brain/faq-library.md` and `brand-brain/voice-guide.md`
- Read commands if the human enabled live reads: `node integrations/meta/dms.js comments <media_id>`, `node integrations/youtube/comments.js list <video_id>`

## Thresholds
| Signal | Watch | Escalate |
| --- | --- | --- |
| Negative comments or reviews in 24h | 3 | 10 |
| Single message with 1-2 star rating or hostile tone | 1 | 1 with a public audience (500+ likes, or from a verified or large account) |
| Mentions of safety, legal, refund, discrimination, data issues | n/a | any |
| Sentiment shift vs 7-day average | 20% more negative | 40% more negative |

## Action
1. Ask engagement for the digest. If nothing reaches Watch, stop. Reply `no issue`.
2. Watch level: brief (signal `inbox`) asking engagement to draft calm replies using the FAQ library. Replies go to `queue/pending` for human approval.
3. Escalate level: do NOT dispatch drafting by default. Interrupt the human immediately with: what happened, link, the worst message quoted, counts, and a suggested response. This is an edge case.
4. Never delete, hide, or argue. Never reply publicly without human approval.

## Routing
- Watch: engagement (score 5-7).
- Escalate: human first (score 9-10), then engagement with the human's decision.
- Pattern points to a content problem (a post caused it): also send a note to content-engine via a brief so the angle is not repeated.

## Output
Counts, level (watch or escalate), brief paths, and whether the human was interrupted.
