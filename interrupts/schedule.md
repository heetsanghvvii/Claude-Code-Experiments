# Interrupt schedule

Cron expressions are 5-field, shown in UTC and with `CRON_TZ=` for a local timezone. Replace `Asia/Kolkata` with the timezone in `brand-brain/channel-playbooks.md`. The minimum interval for scheduled tasks is normally hourly. Minutes are off the hour on purpose so tasks do not all fire at :00.

| Check | Frequency | Cron (local, `CRON_TZ=Asia/Kolkata`) | Cron (UTC) |
| --- | --- | --- | --- |
| trend-spike | every 4 hours | `CRON_TZ=Asia/Kolkata 7 */4 * * *` | `37 */4 * * *` (approx) |
| viral-post | every 3 hours, 08:00-22:00 | `CRON_TZ=Asia/Kolkata 13 8-22/3 * * *` | `43 2-16/3 * * *` (approx) |
| bad-review | every 2 hours | `CRON_TZ=Asia/Kolkata 21 */2 * * *` | `51 */2 * * *` (approx) |
| thin-calendar | weekdays 09:00 and Sunday 18:00 | `CRON_TZ=Asia/Kolkata 47 8 * * 1-5` and `CRON_TZ=Asia/Kolkata 41 17 * * 0` | `17 3 * * 1-5` and `11 12 * * 0` |

If you do not need to match a timezone, use the UTC column as is. Prefer the `CRON_TZ=` form so daylight saving does not shift the schedule.

## Create the tasks (create_trigger style)

Each call creates a scheduled task that spawns a fresh session on every fire (`create_new_session_on_fire=true`), so every prompt must stand alone. Pass `initiation: "human_request"` when the human asked for it. Pass `connectors: []` unless the human named connectors.

### trend-spike
```
create_trigger(
  name: "Interrupt: trend spike",
  cron_expression: "CRON_TZ=Asia/Kolkata 7 */4 * * *",
  create_new_session_on_fire: true,
  initiation: "human_request",
  prompt: "You are the orchestrator in /home/user/Claude-Code-Experiments. Read .claude/agents/orchestrator.md and follow it. Then run the check in interrupts/checks/trend-spike.md exactly. Write briefs to queue/briefs/ only when a threshold is crossed, dispatch the department named in the check, never publish, and interrupt the human only for budget questions or edge cases. If nothing qualifies, reply 'no spike' and write nothing."
)
```

### viral-post
```
create_trigger(
  name: "Interrupt: viral post",
  cron_expression: "CRON_TZ=Asia/Kolkata 13 8-22/3 * * *",
  create_new_session_on_fire: true,
  initiation: "human_request",
  prompt: "You are the orchestrator in /home/user/Claude-Code-Experiments. Read .claude/agents/orchestrator.md and follow it. Then run the check in interrupts/checks/viral-post.md exactly. Use metrics already logged in memory/post-log.md; do not set LIVE=1. If no post crosses the thresholds reply 'no viral post' and write nothing. Never publish."
)
```

### bad-review
```
create_trigger(
  name: "Interrupt: bad review",
  cron_expression: "CRON_TZ=Asia/Kolkata 21 */2 * * *",
  create_new_session_on_fire: true,
  initiation: "human_request",
  prompt: "You are the orchestrator in /home/user/Claude-Code-Experiments. Read .claude/agents/orchestrator.md and follow it. Then run the check in interrupts/checks/bad-review.md exactly. At Escalate level, stop and tell the human with the quoted message and a suggested response. Never reply publicly, never delete or hide anything, never publish. If nothing reaches Watch reply 'no issue'."
)
```

### thin-calendar
```
create_trigger(
  name: "Interrupt: thin calendar (weekdays)",
  cron_expression: "CRON_TZ=Asia/Kolkata 47 8 * * 1-5",
  create_new_session_on_fire: true,
  initiation: "human_request",
  prompt: "You are the orchestrator in /home/user/Claude-Code-Experiments. Read .claude/agents/orchestrator.md and follow it. Run 'node interrupts/thin-calendar.js' from the repo root, then follow interrupts/checks/thin-calendar.md exactly. Write calendar-gap briefs to queue/briefs/ and dispatch content-engine or scheduler as the check says. Scheduler runs in dry run only (no LIVE=1). Never publish. If thin is false reply 'calendar ok'."
)

create_trigger(
  name: "Interrupt: thin calendar (Sunday)",
  cron_expression: "CRON_TZ=Asia/Kolkata 41 17 * * 0",
  create_new_session_on_fire: true,
  initiation: "human_request",
  prompt: "Same as the weekday thin-calendar task: run node interrupts/thin-calendar.js and follow interrupts/checks/thin-calendar.md. Also include the coming week's plan in your final message."
)
```

## CronCreate style (inside a Claude Code session)

Use these when the task should run in the current session instead of a fresh one. Session-scoped, so they stop when the session ends.
```
CronCreate(cron: "7 */4 * * *",  prompt: "Run interrupts/checks/trend-spike.md as the orchestrator. Never publish.")
CronCreate(cron: "13 8-22/3 * * *", prompt: "Run interrupts/checks/viral-post.md as the orchestrator. Never publish.")
CronCreate(cron: "21 */2 * * *", prompt: "Run interrupts/checks/bad-review.md as the orchestrator. Never publish or reply publicly.")
CronCreate(cron: "47 8 * * 1-5", prompt: "Run node interrupts/thin-calendar.js then interrupts/checks/thin-calendar.md as the orchestrator. Never publish.")
```
The `CronCreate` cron times are in the machine's local timezone; the `create_trigger` cron is UTC unless prefixed with `CRON_TZ=`.

## One-off test fire

After creating a task, fire it once with `fire_trigger(trigger_id)` and confirm it replies with the "nothing to do" line or writes a brief in `queue/briefs/`. Disable a noisy check with `update_trigger(trigger_id, enabled: false)`.
