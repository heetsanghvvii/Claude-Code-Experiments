# Agent team: Food Label Checker

The owner is the only human. One agent reports to the owner: the CEO.

```
Owner
  └─ CEO / Orchestrator (top model, the only one that talks to the owner)
       ├─ CTO      data pipeline, scoring code, tests
       ├─ CPO      product scope, UI, demo, QA
       ├─ CMO      market, competitors, go-to-market, content
       ├─ CFO      costs, revenue model, business case, kill criteria
       └─ Counsel  (on demand) data licensing, FSSAI, defamation risk review
```

## How it runs
- The CEO is the session's main model. It decides, writes the deck and reports. It never delegates the final synthesis.
- Every other role is a subagent on a cheaper model, spawned only when there is a concrete task, with a written brief and one output file in `team/reports/`.
- Each subagent returns a summary under 300 words. Detail stays in its report file, so the CEO context stays small.
- Subagents obey `HANDOFF.md` hard rules. They write only inside `food-scanner/`.

## Charters
| Role | Owns | Output file | Model tier |
|---|---|---|---|
| CEO | priorities, phase gates, deck, owner reporting | deck (artifact) | top |
| CTO | `off.js`, scoring, Jain engine, data pipeline, tests | `reports/cto-data.md` | mid |
| CPO | UI, demo evidence, MVP scope, bug list | `demo/`, `reports/cpo-*.md` | mid |
| CMO | competitor watch, segments, channels, copy | `reports/cmo-market.md` | mid |
| CFO | cost stack, 12-month model, cash asks, kill criteria | `reports/cfo-model.md` | mid |
| Counsel | licence and legal review before any launch | `reports/counsel-*.md` | mid, on demand |

## Spending rule
No agent spends money. Any spend needs a business case from the CFO, in the deck, which the owner sends to outside reviewers (ChatGPT, Gemini and others) before approving.

## Owner decisions that only the owner can make
Changing a hard rule in `HANDOFF.md` (for example allowing deployment), approving spend, merging PR 1.
