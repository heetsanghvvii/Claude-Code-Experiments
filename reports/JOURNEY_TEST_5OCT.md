# End-to-end journey test, 5 Oct 2026 (candidate: Heet)

Run in subscription mode: Claude Code did the engine's thinking (research, hooks, writing, judging); data went into the live Supabase and shows in the live CRM.

## What happened
| Step | Result |
|---|---|
| Sign-up on live site | Worked. Row landed in Supabase (12:03 IST). |
| Import to client | Worked (Import sign-ups in CRM). Typos and the LinkedIn `?isSelfProfile=true` suffix were copied as is. |
| Profile facts | 16 facts taken from the LinkedIn PDF by hand (no customer upload page live yet). |
| Find people | 16 people across Zepto, Swiggy, Blinkit, Zomato from public web search, about 38 searches. |
| Research | 1 to 4 facts per person, almost all from search snippets; most profile pages were not readable. |
| Hooks and drafts | 6 kept, 10 skipped (C-suite, brand-only, unconfirmed recruiters, no hook). 18 drafts, all pass the rule checks. |
| CRM | Live CRM shows the client, 6 drafts to approve, sources and reasons. |
| Approve, mark sent, log reply | Worked on the live API. |
| Sync (draft the answer) | Failed with a server error: Claude API has no credits and the error is not handled. Reply stayed safely unprocessed. Answer drafted by hand instead. |

## Gaps found (and status)
| # | Gap | Severity | Status |
|---|---|---|---|
| 1 | No page for customers to upload LinkedIn PDF and CV | High | Built (/start), not deployed yet |
| 2 | No client portal: clients cannot see, approve or send drafts | High | Being built |
| 3 | Pipeline needs a person to start each step | High | Being built: scheduled Claude Code tasks + work packets |
| 4 | Drafts and replies wait for operator review | High | Being built: automated review layer, no founder in the loop |
| 5 | Sync crashes when the Claude API fails | High | Being fixed: clear error instead of crash |
| 6 | Only 6 messages from 4 companies: a 60-person Sprint needs about 15 to 25 target companies or deeper search per company | High | Intake now asks for 10 to 30 companies; discovery depth to tune |
| 7 | LinkedIn URLs missing for 13 of 16 people | Medium | Portal will offer a LinkedIn search link (name + company) |
| 8 | Facts come from search snippets, some stale (2024) | Medium | Show source date; client confirms the person still works there before sending |
| 9 | No seniority gate: engine would message CEOs and COOs | Medium | Being fixed |
| 10 | Length rule mismatch (prompt 280, code 300) and "job" ban blocks harmless phrases | Low | Being fixed |
| 11 | No flattery or unsupported-claim check in code | Medium | Being fixed (review layer) |
| 12 | Writers do not know today's date | Low | Being fixed |
| 13 | Import keeps typos and URL junk | Low | To do: normalise on import |
| 14 | CRM shows "Zepto · Zepto" and does not show draft alternatives | Low | To do |
| 15 | Uploaded files never submitted are not cleaned up | Low | To do |
| 16 | Unit economics: founder time made packages unprofitable | Resolved | Automation removes founder review; hours now support only |

## Decisions recorded (founder, 5 Oct)
- Client portal: yes. Background work: scheduled Claude Code tasks. Imports: automatic (manual is fine for now).
- No reply waits for a human: automated review layer replaces the operator.
- Done-for-you (LGM) later, after self-send works.
- Support: founder handles.

Screenshots: deploy/screenshots/journey/.
