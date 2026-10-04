# Launch Plan

Goal: first 3 paying Tier 1 clients, then Tier 2.
North star: interviews per 100 targeted prospects.

Status key: [x] done, [~] in progress, [ ] todo. (You) = founder task, (Build) = code.

## Phase 0: Foundations (week 1)

- [ ] (You) Pick a name and buy the domain
- [ ] (You) Create accounts: Anthropic API, Brave Search API ($5 free credits/month), Cloudflare (free)
- [x] (Build) Supabase project `outbound-engine` (Mumbai, free) created with schema applied
- [ ] (You) Note your Clay credit balance and whether credits expire
- [ ] (You) Write the intake questionnaire (see `docs/INTAKE.md`)
- [x] (Build) Database schema (`supabase/migrations/0001_init.sql`)
- [x] (Build) Engine: CV / LinkedIn PDF parser to structured facts
- [x] (Build) Engine: prospect discovery via Brave Search (public LinkedIn results, no login)
- [x] (Build) Engine: hook engine with fact citations (no citation = no hook)
- [x] (Build) Engine: Message 1 from 3 parallel writer agents, rule checks, judge agent picks the winner
- [x] (Build) Feedback layer: operator edits + reply outcomes distilled into a playbook fed back to writers
- [x] (Build) Engine: reply classifier and next-message drafter
- [x] (Build) Operator CLI and CSV export for Tier 1
- [x] (Build) No-reply follow-ups (one second touch on a new hook, then close), weekly LGM export cap
- [x] (Build) Cost tracking per command, candidate and prospect (`cost`)
- [x] (Build) Website sign-ups table `intake_requests` (public insert only) + `intake-pull`
- [x] (Build) Self-learning agents, own web enrichment, token-gated Supabase access

## Phase 1: Dogfood (week 2)

- [ ] (You) Run the full pipeline on yourself or a friend: 1 candidate, 3 companies, 15 prospects
- [ ] (You) Hand-review every hook and message. Log every edit you make (these become prompt fixes)
- [ ] (Build) Tune prompts from your edits
- [ ] (You) Measure: time per client, Claude API cost per prospect, Clay credits used (if any)

## Phase 2: Client website and CRM (weeks 2 to 3)

- [ ] (Build) Client site on Cloudflare Pages + Supabase Auth (magic link login)
  - Prospect list with Message 1, copy button, status buttons (sent, accepted, replied)
  - Paste reply box, returns next message draft
  - Outcome buttons: meaningful conversation, referral, interview, offer
- [ ] (Build) Operator CRM view: all clients, funnel per client, last activity, stuck prospects
- [ ] (Build) Funnel metrics views in SQL (by bucket, hook type, company)
- [ ] (Build) Row-level security so clients only see their own data

## Phase 3: Sell (week 3 onward)

- [ ] (You) Landing page: outcome-first copy ("Interviews at your target companies, through the people who work there")
- [ ] (You) Payment: Razorpay payment link (upfront only)
- [ ] (You) One-page terms: what we deliver, what the client does, no outcome guarantee, data use consent
- [ ] (You) First 10 founding clients from your network: MBA batchmates, PM communities, LinkedIn post
- [ ] (You) Founding price: Tier 1 Rs 3,999, Tier 2 Rs 14,999

## Phase 4: Tier 2 (after 3 Tier 1 clients)

- [ ] (You) LGM account, one identity per Tier 2 client
- [ ] (Build) Push approved prospects to an LGM audience with `message_1` as a custom attribute
- [ ] (Build) LGM webhook receiver for accepted / replied events
- [ ] (You) Safe sending limits: max ~100 invites/week per client account

## Guardrails (always)

- Never log into LinkedIn programmatically or scrape it. Discovery uses public search results; full profiles come from LinkedIn's own "Save to PDF", done by hand.
- Every hook must cite a real fact from both profiles.
- A human approves every message before it is sent.
- Store client data in Supabase only; delete on request.
