# Decisions made with the founder so far (input for the business plan)

Founder: Heet, Mumbai. Runs One More Round (personalised card-game gifting). Product, ops, tech and marketing background. Bootstrapped, very little cash right now. Prefers fast execution, short communication, times in IST.

## Product
- Name: **Knock**. Tagline: "Knock on the right door." Domain candidates: knock.careers (preferred, about $29/yr, available), joinknock.in ($10/yr).
- What it does: finds the right people at a job seeker's target companies (hiring managers, team members, alumni, senior connectors), researches each, finds a genuine shared reason to talk, writes a personal first message, and guides every reply until it becomes a referral or interview. Candidate approves every message.
- North-star metric: interviews per 100 targeted prospects. Leading indicator: meaningful-conversation rate.
- Principle: quality over volume. 60 hand-picked people per week, not thousands.
- Positioning: a premium, human, tech-enabled **service** (private career concierge), not an "AI tool". AI is how it is delivered, never the headline. Go digital-product/SaaS later (after ~50 clients, stable prompts, demand exceeding capacity), keeping the service as the premium tier.
- Target clients: broadened (founder decision, 5 Oct). Anyone whose next job is at a company where referrals matter. Launch focus: career switchers (2 to 10 yrs) and laid-off professionals; MBA students via club pilots in parallel. Full ICP in business/ICP.md.

## Tiers and pricing (upfront only, no success fee)
- Founding prices first 10 clients, then standard.
- Packages by duration: Sprint 7 days / 60 people Rs 2,499; Standard 14 days / 120 people Rs 3,999; Full 21 days / 180 people Rs 5,499.
- Tier 1 Self-send: we research and write, client sends from their own LinkedIn and pastes replies into the portal.
- Tier 2 Done-for-you: from Rs 14,999 (founding), Rs 19,999 standard; outreach run via La Growth Machine (Basic plan, ~$70/identity/month) with a scheduled Claude-in-Chrome bridge (no LGM Pro, no money for it).
- Reply guarantees: not until data from the first 5 clients; then guarantee ~70% of observed typical results; remedy = keep working free (never refunds). Founder rejected padding lists with irrelevant "likely to reply" people (deceptive).
- Founder explicitly chose: no Clay (build our own: public search + LinkedIn Save-to-PDF + Claude), no LGM Pro, no paid tools until revenue.

## Costs known
- Claude API: Opus 5.5 at $4/$20 per M tokens; estimated Rs 10-15 per prospect with multi-writer + judge (to be measured with the `cost` command).
- Supabase free, Vercel Hobby (note: Hobby is non-commercial; upgrade to Pro $20/mo at first revenue), Brave Search ~$5 free credit/month or Claude web search.
- LGM Basic ~$70/identity/month for Tier 2 only.

## Built (backend)
- Python engine: discovery, web enrichment, fact extraction, hook engine with citations, 3 writer agents + judge, rule checks, self-learning (Thompson sampling writer selection, playbooks, writer evolution, judge calibration, ask stats), reply drafting, follow-ups, weekly send cap, cost tracking, prompt-injection guards, Supabase state, inbox/outbox bridge for LGM via Chrome.
- Vercel: landing page + intake API + password-protected operator CRM + daily cron sync (knock-eosin-beta.vercel.app).
- Skills: skill-competition (autopilot blind competitions), model-router (cheapest adequate model per agent).

## Research inputs
- reports/Cold outreach messaging playbook.md (best practices, rubric, risks: LinkedIn User Agreement 8.2 bans automation; DPDP obligations from ~May 2027; no cold WhatsApp)
- business/market_and_competitors.md (market size, competitor table, channels, pricing benchmarks)
- Partner pitch idea: B-school placement committees and clubs, free 5-student pilot.
- No numbers in external materials (5 Oct): no client counts, revenue or projections in decks or anything shared. The investor deck is a case study for recruiters showing the system and the thinking.
