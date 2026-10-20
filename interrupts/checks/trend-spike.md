# Check: trend spike

Scheduled task prompt. Run as the orchestrator. Never publish.

## Inputs
- `queue/briefs/` and `memory/post-log.md` (what is already covered)
- `brand-brain/channel-playbooks.md` (pillars, active channels)
- trend-radar output: ask the trend-radar agent for its latest scan (topics with mention velocity, platform, source links)

## Thresholds
| Metric | Spike | Strong spike |
| --- | --- | --- |
| Mention volume vs 7-day average | 3x or more | 6x or more |
| Hours since the trend started | under 48 | under 24 |
| Pillar fit (playbook) | on a pillar | core pillar |
| Already covered in post-log (last 30 days) | no | no |
| Brand safety (no tragedy, politics, legal claims) | pass | pass |

A trend qualifies when it hits the Spike column on volume AND pillar fit AND is not already covered AND passes brand safety.

## Action
1. Ask trend-radar for the current scan. If nothing qualifies, stop. Write nothing. Reply `no spike`.
2. For each qualifying trend, score it with the orchestrator rubric (time sensitivity will usually be 3).
3. Write a brief to `queue/briefs/` (signal `trend`) with the source links, the angle options, and the deadline (the trend window).
4. Strong spike: score 8 or more, `priority: high`.

## Routing
- Text-led trend: content-engine.
- Visual or format-led trend (meme format, sound, template): creative-studio, then content-engine.
- Brand safety unclear, or a sensitive topic: do NOT dispatch. Ask the human (edge case).
- Paid amplification suggested: ask the human (budget question) with amount and expected gain.

## Output
One line per trend: topic, score, department. Nothing else.
