# Knock: morning report (5 Oct 2026, IST)

## Done
| Item | Where |
|---|---|
| Live site + intake form + operator CRM | knock-eosin-beta.vercel.app (CRM at /crm) |
| Website competition (winner: impeccable, airmail concept) | [scoreboard](https://github.com/heetsanghvvii/Claude-Code-Experiments/blob/claude/ai-job-seeker-outreach-49b5hr/site-competition/scoreboard.md) |
| Message competition (winner: our 3-writer engine; follow-up grafts applied) | [report](https://github.com/heetsanghvvii/Claude-Code-Experiments/blob/claude/ai-job-seeker-outreach-49b5hr/competitions/messages-openers/REPORT.md) |
| Deck competition (winner: PPT Master) | [report](https://github.com/heetsanghvvii/Claude-Code-Experiments/blob/claude/ai-job-seeker-outreach-49b5hr/competitions/deck-knock-partner-pitch/REPORT.md) |
| Case study deck for recruiters (no numbers) | decks/investor/ |
| Client deck | decks/client/ |
| Backend deck (no business numbers) | decks/backend/ |
| Business plan (projections removed) | business/KNOCK_BUSINESS_PLAN.md |
| ICP (broadened beyond MBA) | business/ICP.md |
| Brand kit and guidelines | brand/ |
| Launch video (21s) + share copy | launch/brag-output/ |
| Engine: 36 tests pass; API: 7 tests pass | engine/, deploy/ |
| Skills: skill-competition, model-router, caveman, brag-slim | .claude/skills/ |

## Your actions
1. Add ANTHROPIC_API_KEY in Vercel (project knock, Settings, Environment Variables).
2. Allow *.supabase.co and *.vercel.app in this environment's network settings.
3. Buy knock.careers (about $29/yr) when ready, then I connect it to Vercel.
4. Watch the launch video once with sound.
5. Fill <email> on the case study deck's closing slide.
6. Lawyer review before the first Tier 2 (done-for-you) client.

## On hold
- Smoke and stress tests (scripts ready in tests/live/, GitHub Actions workflow live-tests.yml, not run).

## Known gaps
- Live API never verified from here (container blocked); Vercel reports READY.
- Daily cron only (Vercel Hobby); docs/AUTOMATION.md mentions hourly sync via the Chrome task.
- No real end-to-end run with a real candidate yet.
- Condensed headline font not installed here; decks show it wide in PDFs, condensed in PowerPoint.

## Next
1. Dogfood: run the full engine on yourself as candidate 1.
2. Measure real cost per prospect with the cost command.
3. Set up the Claude-in-Chrome bridge task (docs/AUTOMATION.md).
4. Open founding slots once 1 to 3 pass.
