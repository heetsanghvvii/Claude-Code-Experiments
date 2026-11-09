# Org chart

Author: CEO. Date: Mon 9 Nov 2026.

## Reporting lines

```
MD (investor and founder): money, public actions, locked decisions
 |
CEO (this role)
 |-- CTO   Android engineer      agent a52c512bdb1c9c533 (Opus)
 |-- CFO   finance               agent a25ce1d6db5256d42
 |-- CMO   growth                agent a39c7b9419b30443c (Opus)
 |-- CPO   product and case      agent aaaba1926d20fa576 (Opus)
 |-- CLO   compliance            agent adfff44543c8b3e59
 |-- CCrO  creative head         agent a7b8f6e1482ae1b12 (Opus)
 |-- COO   operations            Sonnet agent, writes ops/ and ceo/reports/COO.md
 |-- CCO   customer              agent adbc421b662029654, writes customer/ and ceo/reports/CCO.md
 `-- CSO   strategy and risk     agent aca4d8fb85e6ac1e8, writes strategy/ and ceo/reports/CSO.md
Tools outside the org: Instinct (browser intern, stops before payment), Claude (writes, builds, analyses).
```

## Roles

| Role | Owns | Decides alone | Must ask |
|---|---|---|---|
| CEO | Priorities, gates, KPIs, kill criteria, conflicts | Sequencing, scope cuts, experiments, accept or reject agent advice | MD for money, publishing, contacting real people, locked items |
| CTO | App, native module, tests, Verified Claims List | Technical design, build flavours, what the app can truthfully do | CEO if a change slips a gate by more than 1 day |
| CFO | Workbook, spend ledger, envelope tracking, break-even numbers | Cost assumptions, which numbers are the truth | CEO for any new spend line |
| CMO | Demand ladder, ads, copy, tracking sheet, landing spec | Creative choices inside the claims list | CEO for any claim not on the list, any spend step |
| CPO | PRD, case, BOM spec, NFC test, print order spec | Design parameters, test method | CEO for colour or form changes |
| CLO | Compliance notes, wording checks, policy docs | What wording is too risky to use | Cannot give legal conclusions; says "ask CA or lawyer" |
| CCrO | Brand, website build, visuals, app theme | Visual direction inside the locked palette | CEO for page facts and any public release |
| COO | Order flow, payments matching, packing, shipping, refunds, support macros | Process design, templates | CEO for policy changes (refund, shipping promise) |
| CCO | Setup guide, check-ins, QA of screens, proof of use | Customer experience priorities, QA findings | CEO to gate shipping on QA |
| CSO | Strategy one pager, risk synthesis, assumptions to test | What to track and why | CEO for any change to bets |

## Weekly rhythm

| When | What | Who |
|---|---|---|
| Daily by 09:00 IST | Each role updates its one page ceo/reports/<ROLE>.md (max 10 lines: done, blocked, next, spend) | All roles |
| Daily 09:30 | CEO reads reports, updates CRITICAL_PATH.md and the day status, resolves conflicts | CEO |
| Daily | Instinct 10 minute ads check (once ads run) and summary to the sheet | Instinct via CMO |
| Mon | Week plan, founder minutes budget, spend ledger check | CEO, CFO |
| Wed and Sat | Gate check: G0, G1 and others as scheduled in CRITICAL_PATH.md | CEO with CTO and CPO |
| Sun | One page MD briefing, numbers against OKRS_14_DAYS.md, approvals list (max 5) | CEO |
| Day 7, 14, 28 after delivery | Customer check-ins | CCO, COO |

## How conflicts get decided

1. The owner of the domain decides inside the domain (table above).
2. Truth vetoes. CTO can veto any claim about what the app does. CLO can veto wording that creates legal or ad-policy risk. CFO can block any spend not in the envelope. A veto is lifted only by evidence.
3. Cross-domain conflict: the two roles each write 3 lines (position, cost, risk). CEO decides within 24 hours and logs it in DECISION_LOG.md. No second round.
4. Anything involving money, publishing, real people, or the locked list goes to the MD in the approvals list, with a recommendation.
5. Default under doubt: pick the cheaper reversible option and run a test (principle: cheap tests first).
6. Agents do not message the MD. Agents message the CEO; the CEO reports to the MD in files.

## Standing rules for everyone

- Label every number FACT, ASSUMPTION or UNVERIFIED.
- No invented numbers, testimonials or customers.
- No emdashes. Short sentences.
- Do not spend, publish, contact real people or take money.
- If a file is in progress, say so at the top.
