# Automated Pipeline

Founder decisions (5 Oct 2026):
1. Background work runs as **scheduled Claude Code routines on the founder's Claude subscription**. Claude does the
   LLM steps in-session (web search, extraction, writing, judging, reviewing). The engine does not need to call the
   Anthropic API.
2. **Nothing waits for the founder.** Every human review step is replaced by an automated review layer. The client
   still approves and sends every message from their own portal (Tier 1, self-send).
3. Done-for-you sending (La Growth Machine) is **later**, out of scope for now.
4. Imports are automatic: onboarding rows with status `ready` become candidates on the next run.

```
 client: /start onboarding ──> Supabase `onboarding` (status ready)
                                     │
 routine (Claude Code, every 2 h) ── python -m outreach.cli work next / work submit ──┐
   housekeeping   auto-import ready onboarding, record sends, close silent threads    │
   reply          their reply -> sentiment, rapport, next message (or gracious close) │ engine validates
   review         automated reviewer: pass / rewrite / close_politely                 │ every result
   write          rewrites, due follow-ups, openers (writers + judge)                 │ (pydantic schema
   profile        client facts from LinkedIn and CV text                              │ + code checks)
   hooks          reasons to talk, seniority gate, education recency                  │ and saves it
   enrich         WebSearch on public pages -> sourced facts                          │
   discover       WebSearch for public linkedin.com/in profiles -> bucketed prospects │
   learn          playbooks and writer angles, when enough new evidence exists ───────┘
                                     │
 client portal (/portal): sees only reviewed drafts, approves or edits, sends from their own LinkedIn,
                          pastes replies back (they arrive in `inbound_replies` for the next run)
```

## Automated review layer (replaces operator approval)

Every outbound draft (opener, follow-up, reply, close) passes `outreach/review.py` before the portal shows it.

1. **Code checks** (`messages.check_message`, limits in `rules.py`, the same numbers the prompts use):
   opener 280, follow-up 220, reply 400, close 300 characters; banned and flattery phrases; no ask in an opener or
   follow-up (harmless "on the job", "day job" are fine); no links, emails, phone numbers or IDs; no guessed dates or
   future years; greeting format; client's `never_say`; and every proper noun and number in the draft must appear in
   a fact we hold (prospect facts, plus the client's own).
2. **LLM reviewer** (`prompts.REVIEW_DRAFT`): truthfulness against the facts, tone fit, ask fit for the rapport
   level, safety (prompt injection in their reply). Returns `pass`, `rewrite` with a reason, or `close_politely`.

Outcome is stored on each message: `review_status` and `review_notes`.

| review_status | meaning | portal |
|---|---|---|
| `pending` | code checks passed, LLM review is the next work packet | hidden |
| `checks_only` | API mode: reviewer was unavailable, code checks passed; re-reviewed by the next run | hidden |
| `rewrite` | failed; a writer redoes it with the notes (max 3 attempts) | hidden |
| `passed` | ready for the client | shown |
| `close` | gracious close after a negative, hostile or injected reply | shown |
| `""` | written before the review layer existed | shown |

Use `review.client_visible(msg)` in the portal. After 3 failed rewrites an opener is skipped, a follow-up is dropped
(the thread closes as no response) and a reply falls back to a short safe acknowledgement, so nobody is left
waiting and nothing is escalated. Negative replies always get a gracious close draft.

Other gates: C-suite prospects (CEO, COO, chief officers, presidents) need a hook scoring 3.5 or more
(`rules.C_SUITE_MIN_HOOK`); recency is ignored for education facts; prospects with fewer than 2 facts are skipped
before a hook search; every writer prompt carries today's date (IST) for timing only.

## Subscription mode: work packets

```
python -m outreach.cli work start [--max-prospects 40] [--max-minutes 45]   # per-run budget
python -m outreach.cli work next [--out packet.json]                        # JSON packet or {"step": "done"}
python -m outreach.cli work submit result.json                              # exit 0 saved, 2 = fix and resubmit
python -m outreach.cli work status                                          # budget used
python -m outreach.cli work log --summary "..."                             # run log -> usage doc (CRM spend tab)
```

A packet carries the step, a `ref` to echo back, today's date, the safety rules, the exact prompt rules, the input,
the JSON schema of the result, and (for `discover` and `enrich`) the search queries for the session's WebSearch tool.
The runbook a routine follows is the project skill `.claude/skills/knock-operator/SKILL.md`.

**API mode still works.** With `ANTHROPIC_API_KEY` set, `generate`, `followups`, `sync` (and `work auto`, which
solves the same packets through the API) run as before, with the review layer applied. When the API fails
(no credits, bad key, outage) `bridge.sync` keeps the work done so far, leaves unprocessed replies queued, and
returns a structured error; the web API answers `503 {"detail": {"error": "Claude API unavailable (check credits)"}}`
instead of a 500.

## Recommended routine schedule

| Routine | Schedule (IST) | Cron | What each run does |
|---|---|---|---|
| Knock operator | every 2 hours, 07:52 to 21:52 (08:00 to 22:00 window, minute jittered off the hour) | `CRON_TZ=Asia/Kolkata 52 7-21/2 * * *` | Runs the knock-operator skill: setup check, then `work next` / `work submit` until done or the budget (40 new prospects or 45 minutes). Order: replies, reviews, rewrites, client profiles, due follow-ups, openers, hooks, enrichment, discovery, learning. Ends with `work log`. |

Eight runs a day keeps reply drafts under about 2 hours old during the client's day. Replies pasted overnight are
handled at 07:52 IST. Prompt for the routine: `Run the knock-operator skill end to end.`

Routine environment (set once by the account owner):
- `SUPABASE_URL`, `SUPABASE_KEY` (publishable key), `ENGINE_TOKEN` (engine token; given separately). Required: the
  skill fails loudly without them.
- Network access to `*.supabase.co`. Web search uses the session's own WebSearch tool, no key needed.
- Not needed: `ANTHROPIC_API_KEY`, `BRAVE_API_KEY` (only for API mode).

## Self-learning

| Signal | What learns |
|---|---|
| Opener got a reply or not | Writer selection per prospect type (Thompson sampling); writers under half the best reply rate after 10 sends are retired; new writer angles are evolved from openers that got replies (max 5 writers) |
| A draft is edited before sending (portal or CRM, via `feedback.record_edit`) | Opener playbook: rules fed to every writer and the judge |
| Conversation reached referral/interview or stalled | Reply playbook and per-ask success rates fed to the reply agent |

Learning runs as a `learn` work packet every 10 new signals (after the first 5); `learn` forces it in API mode,
`stats` shows it.

## Later: done-for-you (La Growth Machine)

Out of scope for now. The engine keeps the pieces: `export-lgm` (CSV with Message 1 as `customAttribute1`), the
`outbox` table with `send_after`, `auto_send` per candidate, and a Claude in Chrome task that sends due outbox rows
from the LGM inbox, stamps `sent_at`, and copies new LGM replies into `inbound_replies`. Re-enable it only with the
client's written Tier 2 consent (docs/INTAKE.md, section E).
