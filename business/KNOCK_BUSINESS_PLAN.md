# Knock: Business Plan

Knock on the right door.

Prepared: 4 October 2026 (IST). Founder: Heet, Mumbai.
Status: pre-revenue. The engine and website are built. No paying clients yet, so there are no results to report.

**How to read the numbers.** Every figure is labelled.
- **[Decided]** means the founder has already decided it (from `business/DECISIONS_SO_FAR.md`).
- **[S]** means it comes from a cited source (mostly `business/market_and_competitors.md` and `reports/Cold outreach messaging playbook.md`).
- **[E]** means it is our estimate. Estimates will be replaced by measured numbers after the first 5 clients.

Currency: INR. Exchange rate used: Rs 88 per USD [E]. All prices exclude GST (see section 7).

---

## Contents

1. One-liner and positioning
2. Problem and customer
3. Solution and how delivery works
4. Market size
5. Competitors and differentiation
6. Pricing and packages
7. Unit economics
8. Go-to-market
9. Operations and capacity
10. Metrics
11. Risks and mitigations
12. Financial projection (12 months)
13. Roadmap
14. Next 14 days

---

## 1. One-liner and positioning

**One-liner.** Knock gets MBA and product management candidates in India into real conversations with the people who hire at their target companies, through researched, personal messages the candidate approves.

**Positioning statement.** For Indian MBA graduates and people moving into product management who are tired of applying into silence, Knock is a private career concierge. We find the right people at your target companies, find a genuine reason for each of them to talk to you, write the first message in your voice, and guide every reply until it becomes a referral or an interview. Unlike job portals, resume writers and mentor marketplaces, we do the outreach work itself, one person at a time.

**What Knock is.** A premium, human, tech-enabled service. Quality over volume: 60 hand-picked people a week, not thousands [Decided].

**What Knock is not.** An "AI tool", a mass-messaging bot, or a referral marketplace.

**AI is how we deliver, never the headline.** This matters commercially, not just for style. Research shows people cannot tell a well-written AI message from a human one, but when they are told a message was AI-written they judge the sender as lazy and insincere [S: University of Michigan study, cited in the playbook]. Our clients' messages must read as theirs, because they are theirs: every message is approved by the candidate.

| We say | We do not say |
|---|---|
| "Interviews at your target companies, through the people who work there" | "AI-powered outreach" |
| "Researched by us, approved by you, sent as you" | "Automated", "at scale", "hundreds of messages" |
| "60 hand-picked people a week" | "Guaranteed referrals" or "guaranteed interviews" |
| "Private career concierge" | "Bot", "growth hacking" |

---


> **Update 5 Oct:** target clients broadened beyond MBA/PM. See business/ICP.md for the current ICP; MBA graduates are now one segment of six. Market sizing below covers the original niche and understates the broadened market.
## 2. Problem and customer

### The problem

- **Applying cold is getting worse.** LinkedIn India research says applicants per role in India have more than doubled since early 2022, and 49% of professionals are applying to more jobs but hearing back less [S].
- **Referrals work, but the asks people send do not.** Referred candidates were about 4 times more likely to hear back (LinkedIn, 2018) and were hired at about 30% against about 7% from other sources (Jobvite, older survey) [S]. But referrers are flooded with "Hi sir, please refer me, resume attached" messages that they ignore [S: Indian career guidance in the playbook].
- **Doing it well takes time and skill most candidates do not have.** Good outreach means picking the right 2 to 3 people per company, finding an uncommon shared tie, writing under 400 characters, asking one small question, and following up exactly once. Most candidates skip the research, send too many generic messages, and burn their best contacts.
- **Candidates fear looking spammy or desperate.** In a tight network like Indian B-schools and product teams, people compare messages [S].

### Initial customer (ICP)

**Primary ICP [Decided niche, details E]:**
- Indian MBA or PGDM graduates and final-year students, roughly 0 to 6 years of work experience before or after the MBA.
- Targeting product management, product-adjacent, strategy, or consulting roles at Indian product companies, startups, and MNC tech teams.
- Comfortable on LinkedIn and in English. Based in or targeting metro hubs (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune).
- Has a target list of 5 to 8 companies and can name 1 to 2 role titles.
- Will pay Rs 2,499 to Rs 5,499 out of their own pocket for a short sprint.

**Secondary ICP:** lateral switchers moving into product (from engineering, consulting, operations, analytics), often after a PM course or bootcamp.

**Not our customer (for now):** freshers with no target list, people who want mass applications, candidates outside India, and anyone who wants us to misrepresent their background.

### Jobs to be done

| When I... | I want to... | So that I can... |
|---|---|---|
| finish an MBA or a PM course and see few interview calls | reach people inside my target companies | get a referral or a conversation before my application is screened out |
| am making a career switch (ops to product, engineering to product) | find people who made the same switch | learn how they did it and get vouched for |
| have 5 to 8 dream companies | know exactly who to contact and what to say | avoid wasting my few warm contacts on bad messages |
| get a reply and do not know what to say next | get a strong next message drafted | turn a polite reply into a call, then a referral |
| am busy with placements, work or interviews | have the research and writing done for me | spend my time on interview prep, not prospecting |

Emotional jobs: feel in control of the search, avoid looking desperate, avoid embarrassment in front of alumni.

---

## 3. Solution and how delivery works

### What the client gets

1. A short intake (resume, LinkedIn "Save to PDF", 5 to 8 target companies, 1 to 2 role titles, their story and communities). See `docs/INTAKE.md`.
2. A hand-picked list of people at each target company, bucketed as hiring managers, team members, recruiters, alumni and senior connectors.
3. For each person: the research, the genuine shared reason to talk (with its source), and a personal first message in the client's voice.
4. Reply coaching: when someone replies, the client gets the next message drafted from the whole thread, up to the referral ask.
5. One follow-up per person, on a new hook, then close. If someone does not reply after 3 business days, we move to a second person at that company (Dalton's 3B7 routine) [S].

### How the engine works (already built)

```
Intake  ->  discover  ->  enrich-web  ->  generate  ->  candidate approves  ->  send  ->  replies  ->  next message
            public        public posts,   hooks with      every message,       Tier 1: client sends by hand
            search        talks, articles  citations,     edits teach          Tier 2: client's own account
            results       -> facts         3 writers +    the writers           via La Growth Machine
                                           judge
```

- **Discovery:** public search results only (Brave Search or Claude web search). No LinkedIn login, no scraping. Full profiles come from LinkedIn's own "Save to PDF", done by hand.
- **Hooks with citations:** every hook must cite a real fact from both profiles. No citation, no hook.
- **Writers and judge:** 3 writer agents draft, rule checks run (length, banned phrases, no honorifics, one question), and a judge picks the winner against the playbook rubric.
- **Self-learning:** writer selection by Thompson sampling, a playbook built from the founder's and client's edits, judge calibration from overrides, and reply-playbook learning from outcomes.
- **Guards:** prompt-injection guards on fetched content, weekly send cap, cost tracking per prospect, data in Supabase.
- **Operator side:** password-protected CRM and daily sync on Vercel; intake form on the landing page.

### The candidate approves every message

This is a hard rule in both tiers. No message reaches a prospect without the candidate's approval. In Tier 2, the engine's auto-send option stays **off** for client accounts at launch; reply drafts wait for client approval, and negative replies always wait.

### Tier 1: Self-send (default)

- We research and write. The client copies each approved message and sends it from their own LinkedIn by hand, then pastes replies into the portal (or sends them to us) to get the next draft.
- Volume is what a careful human sends: about 30 to 60 targeted invitations a week, well under LinkedIn's soft limit of about 100 a week [S].
- LinkedIn risk: low, because a human is sending (see section 11).

### Tier 2: Done-for-you

- Same research and writing. Approved first messages go into a La Growth Machine (LGM Basic) audience on the **client's own LinkedIn account**, which the client connects to LGM themselves. Knock never asks for or stores a LinkedIn password.
- A scheduled Claude-in-Chrome task (every 3 hours) moves approved replies from Supabase into the LGM inbox and copies new replies back. It only pastes approved text and never writes a message itself (`docs/AUTOMATION.md`).
- Conservative limits, written consent, risk disclosure and a fallback to Tier 1 apply (section 11).
- Launch only after 3 Tier 1 clients are delivered [Decided in `docs/LAUNCH_PLAN.md`].

---

## 4. Market size

Method: count people, then multiply by what they would pay. All counts below are per year.

### Inputs

| Input | Figure | Label and source |
|---|---|---|
| MBA/PGDM enrolment (AICTE-approved), 2022-23 | 2,85,367 | [S] Careers360 AICTE data. Used as a proxy for graduates per year. Excludes non-AICTE university MBAs and executive programmes. |
| Lateral PM aspirants in India | 50,000 to 1,50,000 (midpoint 1,00,000) | [E] low confidence, from community sizes in the market file |
| Top B-school batch sizes | ISB ~812 to 839; IIM-A ~408; most of the top 60+ schools 200 to 600 | [S] ISB, IMS; rest [E] |
| Tier 1 average price (blended) | Rs 3,849 | [E] from our assumed mix: 30% Sprint, 50% Standard, 20% Full |
| Tier 2 price | Rs 14,999 founding, Rs 19,999 standard | [Decided] |

### TAM, SAM, SOM

| Layer | Definition | People per year | Value per year | Label |
|---|---|---|---|---|
| **TAM** | Every MBA/PGDM graduate plus every lateral PM aspirant buying one Tier 1 package | ~3,85,000 | ~Rs 148 crore | [E] 3.85 lakh x Rs 3,849 |
| **SAM** | People we can actually reach and who fit the ICP: graduates of the top ~60 B-schools targeting product, strategy or consulting roles (~40,000 [E]) plus metro, English-first lateral PM aspirants (~50,000 [E]) | ~90,000 | ~Rs 35 crore for Tier 1; more if 1 to 2% also buy Tier 2 | [E] |
| **Realistic ceiling** | 3 to 5% of a reachable ~3 lakh buy Tier 1, and 1 to 2% buy Tier 2 | 9,000 to 15,000 Tier 1 buyers | Rs 3.6 to 6 crore (Tier 1) plus Rs 4.5 to 9 crore (Tier 2) | [E] from the market file |

**Assumptions to state plainly:**
- Enrolment is used as a proxy for graduates. The latest hard number is 2022-23; 2023-24 and 2024-25 were not found.
- The lateral PM figure has no public source and could be off by 2x either way.
- Many people buy more than once in a search (for example, Sprint then Standard). TAM ignores repeat purchases, so it is conservative on that point.
- Year 1 SOM is a capacity limit, not a demand limit. Even the base case is under 0.2% of SAM by people count.

**Why the market is attractive even if small:** first-year PM pay in India is about Rs 12 to 22 LPA [S], and top-school MBA fees run Rs 25 to 40 lakh [S/M]. A Rs 3,999 package is under 0.4% of a first-year PM salary.

---

## 5. Competitors and differentiation

Nobody in India clearly owns "done for you, personalised, named-person outreach for MBAs and PMs" [E from the market file]. Our real competition is the candidate's own time and cheap freelance outreach help.

| Player | What they sell | Price (indicative) | Why Knock is different |
|---|---|---|---|
| Topmate, Preplaced (mentor marketplaces) | 1:1 calls, resume reviews, mentor access | Single calls ~Rs 500 to 3,000; packages ~Rs 3,999 [S/E] | They sell advice and time. We do the outreach work at your named target companies. |
| Nextleap, PM School, Product Space (PM courses) | Skills, cohorts, placement support | Bootcamps ~Rs 50,000 to 1.5 lakh [M/E] | They teach the job. We open doors at specific companies. Better as partners than rivals. |
| Scaler, upGrad (career services inside edtech) | Bundled support with long programmes | Rs 1 to 4.5 lakh [S/M] | Generic, bundled, engineer-heavy. |
| Resume writers | A better document | Rs 2,000 to 6,000 mid; Rs 9,000 to 20,000 premium [S] | A document does not get you a conversation. |
| LinkedIn Premium | InMail credits, unlimited notes | ~Rs 1,200 a month [S] | A tool, not a service. Cold InMail replies are low (5.5% in one 2026 dataset) [S]. |
| Referral exchanges (Blind, Refer.me) | Strangers trading referrals | Free or low [M] | Low quality, tech-heavy, few MBA/PM roles. |
| AI job tools (Careerflow, Teal, Jobright, auto-apply tools) | Resumes, trackers, mass apply | $13 to 45 a month [S] | Self-serve and US-centric; mass apply is the opposite of our model. |
| LinkedIn automation (Expandi, Waalaxy, Dripify, LGM) | Sales sequences | EUR 19 to $99 a seat a month [S] | DIY, template-driven, against LinkedIn's terms. We use LGM only inside Tier 2, with consent and limits. |
| Global reverse recruiters (Find My Profession, Scale.jobs) | Done-for-you applying | $199 to 3,999 a month (Rs 17,000 to 3.4 lakh) [S] | 10 to 25 times our price, application-heavy, not India-focused. |

**Our differentiation, in order of strength:**
1. **Execution, not advice.** We find, research, write and coach the replies.
2. **Quality over volume.** 60 hand-picked people a week, 2 to 3 per company, never identical copy inside one company.
3. **Every hook is real and cited.** No invented shared history. No fake "likely to reply" padding (the founder explicitly rejected it as deceptive).
4. **India-specific rules built in.** No honorifics, no cold WhatsApp, IST working-hours sends, Diwali awareness, alumni-status honesty (executive certificate is not a full-time MBA).
5. **Price.** Rs 2,499 to Rs 19,999 against Rs 1.3 lakh+ a month for global done-for-you.
6. **Measurement as a moat (future).** No public, rigorous dataset exists on reply rates for job-seeker networking messages [S: playbook conclusion]. Ours will become the only one.

---

## 6. Pricing and packages

All prices are upfront. No success fee [Decided].

### Tier 1: Self-send [Decided]

| Package | Duration | People researched and written for | Price |
|---|---|---|---|
| Sprint | 7 days | 60 | Rs 2,499 |
| Standard | 14 days | 120 | Rs 3,999 |
| Full | 21 days | 180 | Rs 5,499 |

### Tier 2: Done-for-you [Decided]

| | Price |
|---|---|
| Founding (first 10 clients) | from Rs 14,999 |
| Standard | from Rs 19,999 |

**Assumption [E]:** the base Tier 2 package covers Full scope (21 days, up to 180 people) plus one month of LGM sending and reply handling. Larger scopes are priced above "from".

### Rules [Decided]

- **Founding prices** apply to the first 10 clients, then standard prices.
- **Standard Tier 1 prices are not yet set.** This plan keeps Tier 1 at the listed prices in every projection, which is conservative. Section 7 shows why a Tier 1 price review after client 10 is worth doing.
- **No reply guarantee yet.** After data from the first 5 clients, we will guarantee about 70% of the typical observed result. The remedy is that we keep working for free. We never give refunds.
- **No padding.** We will not add irrelevant "likely to reply" people to inflate numbers.
- **No paid tools until revenue:** no Clay, no LGM Pro.

---

## 7. Unit economics (per package, INR)

### Cost inputs

| Item | Cost | Label |
|---|---|---|
| Claude API (Opus 5.5) | $4 per million input tokens, $20 per million output, $0.20 per million cached reads, $0.01 per web search | [S] `engine/outreach/llm.py` PRICES |
| Claude cost per prospect | Rs 12 base estimate; Rs 10 to 15 range; **Rs 15 used for planning** | [E] see below |
| La Growth Machine Basic | ~$70 per identity per month = Rs 6,160 | [Decided] Tier 2 only |
| Payment gateway (Razorpay) | ~2% plus 18% GST on the fee = 2.36% of price | [E] check current Razorpay rate |
| Vercel Pro | $20 a month = Rs 1,760, from first revenue (Hobby is non-commercial) | [Decided] fixed |
| Domain knock.careers | ~$29 a year = ~Rs 215 a month | [Decided] fixed |
| Supabase | Free now; Pro ~$25 a month = Rs 2,200 when we outgrow free limits | [E] fixed, later |
| Brave Search | ~$5 free credit a month, or Claude web search | [Decided] |
| Founder hours | See table | [E] to be measured in the dogfood run |

### How Rs 10 to 15 per prospect is estimated [E]

Per prospect, the engine runs enrichment, fact and hook extraction, 3 writers and a judge. A rough token budget:

| Item | Tokens or calls | Cost (USD) |
|---|---|---|
| Fresh input (prompts, profile facts, web results) | ~12,000 tokens x $4/M | $0.048 |
| Cached input (repeated system prompts and playbooks) | ~8,000 tokens x $0.20/M | $0.002 |
| Output (facts, hooks, 3 drafts, judge reasoning) | ~4,000 tokens x $20/M | $0.080 |
| Web searches | ~1 x $0.01 | $0.010 |
| **Total** | | **~$0.14 = ~Rs 12** |

Follow-up and reply drafts add roughly Rs 2 to 3 per prospect on average, because only some prospects reply. So **Rs 15 per prospect all-in** is the planning figure. Output tokens dominate: every extra writer draft costs real money. The `cost` command will replace this estimate after the dogfood run, and the model-router skill can move simple steps (extraction, classification) to cheaper models.

### Founder hours per package [E]

| Step | Sprint (60) | Standard (120) | Full (180) | Tier 2 (180) |
|---|---|---|---|---|
| Intake call and setup | 1.5 h | 1.5 h | 1.5 h | 2.0 h |
| Prospect review and LinkedIn "Save to PDF" for top prospects | 1.5 h | 2.5 h | 3.5 h | 3.5 h |
| Message review and approval prep (~1.5 min each) | 1.5 h | 3.0 h | 4.5 h | 4.5 h |
| Reply coaching across the package | 1.0 h | 2.5 h | 4.0 h | 4.5 h |
| LGM setup, daily outbox checks, account-health checks | n/a | n/a | n/a | 5.0 h |
| Wrap-up summary | 0.5 h | 0.5 h | 0.5 h | 0.5 h |
| **Total** | **6 h** | **10 h** | **14 h** | **20 h** |

### Gross margin per package (planning figures)

Gross margin here is cash margin before founder time and fixed costs.

| Package | Price | Claude API | LGM | Gateway | Variable cost | Gross margin | GM % | Founder hours | Margin per founder hour |
|---|---|---|---|---|---|---|---|---|---|
| Sprint | 2,499 | 900 | 0 | 59 | 959 | 1,540 | 62% | 6 | Rs 257 |
| Standard | 3,999 | 1,800 | 0 | 94 | 1,894 | 2,105 | 53% | 10 | Rs 211 |
| Full | 5,499 | 2,700 | 0 | 130 | 2,830 | 2,669 | 49% | 14 | Rs 191 |
| Tier 2 founding | 14,999 | 2,700 | 6,160 | 354 | 9,214 | 5,785 | 39% | 20 | Rs 289 |
| Tier 2 standard | 19,999 | 2,700 | 6,160 | 472 | 9,332 | 10,667 | 53% | 20 | Rs 533 |
| **Tier 1 blended** (30/50/20 mix) | 3,849 | | | | 1,801 | 2,048 | 53% | 9.6 | Rs 213 |

### Sensitivity to Claude cost per prospect

| Claude cost per prospect | Sprint GM | Standard GM | Full GM | Tier 2 standard GM |
|---|---|---|---|---|
| Rs 10 (low) | 1,840 (74%) | 2,705 (68%) | 3,569 (65%) | 11,567 (58%) |
| Rs 15 (planning) | 1,540 (62%) | 2,105 (53%) | 2,669 (49%) | 10,667 (53%) |
| Rs 25 (overrun) | 940 (38%) | 905 (23%) | 869 (16%) | 8,867 (44%) |

### What the numbers say

1. **Every package is cash-positive**, even at Rs 25 per prospect.
2. **Tier 1 pays poorly per founder hour** (about Rs 190 to 260 an hour). It is a proof and data engine, not a long-term profit engine at current hours and prices. Two levers fix it: cut hours as prompts stabilise (target: about 40% fewer hours per client by client 30 [E]) and review standard Tier 1 prices after client 10.
3. **Tier 2 standard is the most valuable use of founder time** (about Rs 533 an hour). The LGM seat is the biggest single cost; it is per month, so a Tier 2 client should be scheduled to use the full month.
4. **Claude cost is the swing factor for Tier 1.** Measuring it in the dogfood run is the first job.

### Break-even client count

| Goal | Monthly cost to cover | Clients needed per month |
|---|---|---|
| Cover fixed cash costs (Vercel Pro, domain, misc) | ~Rs 2,500 | **2 Tier 1 clients** (2 x Rs 2,048 margin) |
| Also cover Supabase Pro | ~Rs 4,700 | 3 Tier 1 clients |
| Also pay a part-time operator (Rs 20,000) | ~Rs 24,700 | 13 Tier 1 clients, or 7 Tier 1 plus 1 Tier 2 standard |
| Also pay the founder a modest Rs 50,000 draw | ~Rs 74,700 | 37 Tier 1 clients, or 11 Tier 1 plus 5 Tier 2 standard |

**GST and tax:** projected year-1 revenue (Rs 5 to 10 lakh) is under the Rs 20 lakh GST registration threshold for services [E; confirm with a CA]. Prices in this plan exclude GST. Profit figures are before income tax and before any founder salary.

---

## 8. Go-to-market

### Principles

- Lead with outcomes and the human service, never with AI.
- Never invent testimonials or results. Share only measured, consented, anonymised numbers.
- Time the push for the season: Diwali falls around Sunday 8 November 2026 (verify the date), so expect a slow week then; push in mid-to-late November, then again January to March for lateral hiring and final placements [S: Naukri JobSpeak, playbook].

### Channel 1: First 10 founding clients (founder network)

- Dogfood first: run the full pipeline on one friend (3 companies, 15 prospects) before selling.
- Personal messages to the founder's network: friends, ex-colleagues and their MBA or PM-aspiring contacts. Ask for introductions, not purchases.
- Offer: founding price, a 20-minute intake call, and a promise to share what we learn. In return we ask for honest feedback and consent to use anonymised results.
- Payment by Razorpay link, upfront. One-page terms: what we deliver, what the client does, no outcome guarantee, data-use consent.

### Channel 2: B-school club partnerships (free 5-student pilot)

- Targets: product clubs, consulting clubs and placement committees at schools where the founder has a contact. Placement committees are gatekeepers, so go through students first.
- Offer: a free Sprint (60 people, 7 days) for 5 students chosen by the club.
- What the club gets: free outreach help for 5 members, a 30-minute session on outreach that works, and an aggregate, anonymised results summary.
- What we get: real data, a case study (only with consent), and a route to the whole batch.
- After the pilot: offer the club a group rate or a referral arrangement (to be decided after the pilot; not priced in this plan).
- Cost of one pilot: about Rs 4,500 in Claude API (5 x 60 x Rs 15) and about 30 founder hours [E].
- A partner pitch deck is in progress (`competitions/deck-knock-partner-pitch/`).

### Channel 3: Founder-led LinkedIn content

- 3 posts a week from Heet's own profile: what makes outreach work (from the playbook research), anonymised before-and-after message rewrites, what we are measuring, honest lessons.
- Never claim results we have not measured. Never post a client's message without consent.
- Comment on posts by PM leaders and B-school pages; engage in PM communities (The Product Folks and similar).

### Channel 4: Referrals

- Ask every client at the end of their package: "Who else in your batch or team is searching?"
- Proposed reward (to be decided): a free extension week for the referrer, rather than cash, so it costs founder time and Claude API only.
- Later: Topmate PM mentors and PM bootcamps as affiliate partners (from the market file).

### Weekly targets for the first 90 days (weeks start Monday, IST)

Targets are cumulative paid clients unless stated. They match the base case in section 12.

| Week | Dates | Focus | Network conversations | LinkedIn posts | Club pitches | Paid clients (cumulative) |
|---|---|---|---|---|---|---|
| 1 | 5 to 11 Oct | Domain, accounts, terms, dogfood run starts | 10 | 1 | 0 | 0 |
| 2 | 12 to 18 Oct | Dogfood done, cost and hours measured, landing copy, Vercel Pro | 15 | 2 | 3 | 0 to 1 |
| 3 | 19 to 25 Oct | Founding slots open | 20 | 3 | 3 | 2 |
| 4 | 26 Oct to 1 Nov | Close first pilot club | 20 | 3 | 2 | 3 |
| 5 | 2 to 8 Nov | Pilot onboarding; Diwali on 8 Nov | 10 | 2 | 1 | 4 |
| 6 | 9 to 15 Nov | Delivery week; light selling | 10 | 2 | 0 | 5 |
| 7 | 16 to 22 Nov | Post-Diwali push | 20 | 3 | 2 | 6 |
| 8 | 23 to 29 Nov | First 5-client data readout | 20 | 3 | 2 | 8 |
| 9 | 30 Nov to 6 Dec | 10 founding clients done; first Tier 2 | 20 | 3 | 2 | 10 |
| 10 | 7 to 13 Dec | Design the reply guarantee from data | 15 | 3 | 2 | 12 |
| 11 | 14 to 20 Dec | Publish anonymised aggregate results (with consent) | 15 | 3 | 1 | 14 |
| 12 | 21 to 27 Dec | Holiday slowdown; plan January lateral push | 10 | 2 | 0 | 15 |
| 13 | 28 Dec to 3 Jan | Review the quarter, set Q1 targets | 10 | 2 | 1 | 16 |

Conversion assumption [E]: about 1 paid client per 8 to 10 network conversations once the offer is live. Measure it and adjust from week 4.

---

## 9. Operations and capacity

### Founder time [E]

- Heet also runs One More Round. This plan assumes about **25 hours a week** for Knock, of which about 5 hours go to selling and content and **about 20 hours to delivery**.
- Average Tier 1 delivery is about 9.6 hours per client, spread over 1 to 3 weeks (about 5 hours a week per active client). Tier 2 is about 20 hours over about 4 weeks.

### Capacity

| Founder delivery time | Active clients at once | New Tier 1 clients a month |
|---|---|---|
| 20 h a week (part-time, today) | ~4 | ~8 to 9 |
| 35 h a week (full-time on Knock) | ~7 | ~15 |
| 20 h founder + 20 h part-time operator | ~8 | ~16 to 18 |

Each Tier 2 client uses roughly the capacity of 2 Tier 1 clients.

### When to hire

Hire a part-time operator when **any two** of these hold for 4 weeks in a row:
- more than 8 new clients a month;
- a waitlist longer than 2 weeks;
- the founder spends more than 25 hours a week on delivery;
- prompts are stable enough that a trained reviewer can approve drafts with under 15% edits.

**Who:** a recent MBA graduate or final-year student with good written English, paid about Rs 20,000 a month part-time or Rs 800 to 1,200 per client [E]. They handle "Save to PDF", first-pass message review and reply drafting. The founder keeps intake calls, final quality checks and Tier 2 account safety.

In the base case this happens around **February 2027**. In the conservative case the founder stays solo, close to the limit in August and September 2027.

### Weekly operating rhythm

- Monday: intake calls, new client setup.
- Tuesday to Thursday: approvals, reply coaching, sends in the IST 9:30 to 12:00 window.
- Friday: quality audit (20 random messages scored on the rubric), metrics update, content.
- Daily, Tier 2 only: check the outbox and LGM account health; review the Chrome bridge summary every 3 hours on working days.

---

## 10. Metrics

### North star

**Interviews per 100 targeted prospects** [Decided]. Leading indicator: **meaningful-conversation rate** [Decided] (a reply that leads to a call, a real exchange of advice, or an offer to help).

### Funnel (per client and in total)

| Stage | Definition | Public benchmark (not our result) |
|---|---|---|
| Targeted | People researched and approved for outreach | n/a |
| Sent | Invitations or messages actually sent | n/a |
| Accepted | Connection accepted | ~28.5% platform-wide average [S, vendor data] |
| Replied | Any reply after acceptance | 9.4% with a note vs 5.4% without (Belkins, sales) [S]; 34.2% in 2026 recruiter data [S, reverse direction] |
| Meaningful conversation | Real exchange or call | No public benchmark |
| Referral | Referral given or offered | No public benchmark |
| Interview | Interview from a Knock conversation | No public benchmark |
| Offer | Offer received (tracked, never promised) | No public benchmark |

**We do not have our own numbers yet.** The benchmarks above come from sales and recruiting data and only bracket the range. We will publish our own rates after the first 5 clients, then use them to set the reply guarantee at about 70% of the typical result.

### Operating metrics

| Metric | Why it matters | Starting target [E] |
|---|---|---|
| Claude cost per prospect | Biggest Tier 1 cost | Rs 15 or less |
| Founder hours per client | Capacity and margin | Down 40% by client 30 |
| Edit rate (messages the candidate or founder changes) | Quality and prompt stability | Under 15% by client 30 |
| Rubric score of sent messages | Quality gate | 85+ out of 100 |
| Hooks with valid citations | Truthfulness | 100% |
| Contacts per recipient across all clients | Avoids a Knock "spam signature" | Max 1 Knock message per recipient per month |
| Tier 2 acceptance rate per account | Account safety | Pause below 30% |
| Tier 2 account warnings | Account safety | Zero |
| Referral rate (clients who refer someone) | Cheapest growth | 30% |
| Conversations to paid client | Sales efficiency | Measure from week 4 |

---

## 11. Risks and mitigations

### 11.1 LinkedIn User Agreement and automation (the biggest risk)

**The facts.** LinkedIn's User Agreement section 8.2 bans bots and unauthorised automated methods to "add or download contacts, send or redirect messages", and LinkedIn's help centre bans third-party software and browser extensions that automate activity [S]. "Cloud-based" or "human-like pacing" is not an exemption [S]. Enforcement falls on the member's account: restriction, suspension or termination. A restricted account in the middle of a job search is very costly for the candidate.

**How Knock resolves it:**

| | Tier 1: Self-send | Tier 2: Done-for-you via LGM |
|---|---|---|
| Who sends | The candidate, by hand, from their own LinkedIn | LGM, on the candidate's own account, with approved text only |
| Does Knock touch LinkedIn? | No. Discovery uses public search results; profiles come from the candidate's or founder's manual "Save to PDF". No login, no scraping. | Knock never logs into LinkedIn or holds the password. The client connects LGM themselves. The Chrome bridge works only in LGM and Supabase. |
| Is it automation under 8.2? | No | **Yes.** LGM is third-party automation. Limits reduce the chance of a restriction; they do not make it compliant. |
| Risk level | Low | Moderate, and borne by the client's account |

**Tier 2 safeguards (all mandatory):**
1. **Explicit written client consent** before setup, in plain English, signed or accepted by email.
2. **Account-risk disclosure** in that consent: "This uses automation software on your LinkedIn account. LinkedIn's User Agreement prohibits automation. Your account could be warned, restricted or suspended. Knock cannot guarantee it will not be. You can switch to self-send at any time."
3. **Conservative limits:** first week at most 10 invitations a day; after that at most 15 a day and 60 to 75 a week (well under the ~100 a week soft limit [S]); weekdays only, IST 9:30 to 19:00; no profile-visit or endorsement automation beyond the minimum campaign steps; withdraw invitations pending after 3 weeks.
4. **Account eligibility:** only accounts older than about 1 year with a complete profile and photo; no recently restricted accounts.
5. **Health checks:** pause the campaign if acceptance falls below 30% or if any warning, CAPTCHA, identity check or "invitation limit" message appears.
6. **Fallback to Tier 1 if warned:** stop LGM at once, move every remaining approved message to self-send, and extend the package at no extra cost. Consistent with the no-refund policy, the remedy is continued free work.
7. **The candidate still approves every message;** auto-send stays off.

**Recommendation: make Tier 1 (self-send) the default for every client.** Offer Tier 2 only to clients who ask for it, after we have delivered 3 Tier 1 clients, and only with signed consent. Tier 1 is compliant, cheaper, and the volume (30 to 60 a week) is exactly what good outreach needs anyway. Get a one-hour review from an Indian technology lawyer before the first Tier 2 client (budgeted at Rs 15,000 [E] in January 2027).

### 11.2 DPDP Act 2023 and Rules 2025

**The facts.** The DPDP Rules were notified on 14 November 2025. Core notice, consent, security and breach rules apply from about **May 2027** [S]. Knock, not the candidate, is the data fiduciary for two groups: clients (resumes, career history, chats) and prospects (names, profile facts, reply content). The exemption for data a person made public themselves is read narrowly by lawyers [S]. Penalties go up to Rs 250 crore per instance for security failures [S].

**Mitigations (build now, done before April 2027):**
- Clear, separate consent notice for clients stating the specific purpose; consent checkbox on the intake form.
- Use only professional information prospects published themselves; record the source of every fact (the engine already cites sources).
- No personal phone numbers, no guessed emails, no cold WhatsApp or SMS [S].
- Retention: delete prospect data 90 days after a client's package ends, and client data on request [E policy].
- Global suppression list: anyone who asks not to be contacted is never contacted again by any Knock client.
- Security: Supabase row-level security, token-gated engine access, minimal access, a written breach process.
- A published grievance contact (the founder) and a short privacy notice.
- Legal review alongside the LinkedIn review.

### 11.3 Prompt injection

**Risk:** public posts, articles and reply texts are untrusted. One could contain instructions that try to change what the writer says or does.

**Mitigations:** the engine already has prompt-injection guards; fetched text is treated as data, never instructions; the judge and rule checks flag odd content; the Chrome bridge may only paste the exact approved `body` text and send to people in the outbox; a human (candidate) approves every message; no tool that sends or deletes is ever triggered by fetched content.

### 11.4 Quality drift

**Risk:** self-learning (Thompson sampling, writer evolution, playbooks, judge calibration) could slowly drift toward messages that look polished but generic, or that overfit one client's taste.

**Mitigations:** the rubric is a send gate (85+ out of 100, any hard-gate failure blocks the message); a fixed "golden set" of 20 test prospects re-run after every playbook or writer change; versioned playbooks with rollback; a weekly Friday audit of 20 random messages; edit rate and reply rate tracked per writer; a maximum of 5 writers; an AI-tell check (no em dashes, no stock AI words) in the rule checks.

### 11.5 Founder bandwidth

**Risk:** Heet runs another business. Delivery slips, quality drops, or sales stop while delivering.

**Mitigations:** hard capacity cap of about 4 active clients until hiring; a waitlist rather than overselling; protected selling time (5 hours a week minimum); the hire trigger in section 9; Tier 2 limited to 1 to 3 clients a month in year 1.

### 11.6 Other risks

| Risk | Mitigation |
|---|---|
| Fabricated or overstated claims in messages (for example, implying full-time IIM alumni status from an executive certificate) | Every hook needs a citation; intake asks the exact programme; client approves every message |
| Knock "spam signature" across many clients writing to the same people | Max 1 Knock message per recipient per month across all clients; 2 to 3 people per company per client; vary structure, not just names |
| No proof of results at launch | Honest founding offer; measure and publish after 5 clients; no invented testimonials |
| Reply rates differ by sender identity (research shows bias by gender and name) [S] | Do not promise numbers; set guarantees per segment from our own data; flag it to clients honestly |
| Seasonality (Diwali, late December, May to June) | Plan pushes for mid-November and January to March; deliver, do not sell, in slow weeks |
| Claude API price or model changes | Track cost per prospect weekly; model-router for cheaper steps; prices reviewed quarterly |
| Vercel Hobby is non-commercial | Upgrade to Pro at first revenue |
| Clients expect refunds | Terms say clearly: no refunds; remedy is continued free work |
| Recipient complaints | Polite, short, one follow-up only; immediate suppression on request |

---

## 12. Financial projection

Removed at the founder's request (5 Oct). No client-count or revenue projections are committed. Plan with real data from the first clients instead: track cost per prospect, hours per client and the funnel from section 10, then decide pricing and capacity.

## 13. Roadmap

| Phase | When (estimate) | Trigger to move on | What we build and do |
|---|---|---|---|
| **1. Prove it (service)** | Oct to Dec 2026 | 10 founding clients delivered | Dogfood run; Tier 1 only; client portal (magic-link login, copy button, paste-reply box, outcome buttons); funnel views in SQL; terms and consent; first club pilot |
| **2. Tier 2 and data** | Dec 2026 to Mar 2027 | 3 Tier 1 clients delivered (for Tier 2); 5 clients of data (for guarantees) | Tier 2 with signed consent and limits; LGM webhook receiver; reply guarantee at ~70% of the typical result; publish anonymised aggregate results; legal review; first operator hire |
| **3. Stabilise** | Apr to Sep 2027 | Edit rate under 15%; hours per client down ~40% | DPDP compliance complete before May 2027; operator playbook; second and third club partnerships; Tier 1 price review; affiliate partners (PM mentors, bootcamps) |
| **4. SaaS** | After ~50 clients (base case reaches this around March 2027; build after prompts are stable, likely mid to late 2027) | ~50 clients, stable prompts, demand above capacity [Decided] | Self-serve digital product for the self-send flow; the service stays as the premium tier |

---

## 14. Next 14 days (Monday 5 October to Sunday 18 October 2026, IST)

| Day | Action | Owner |
|---|---|---|
| Mon 5 Oct | Buy knock.careers (~$29/yr); set up Anthropic API, Brave Search and Cloudflare accounts | Heet |
| Mon 5 Oct | Fix environment settings: network access for `*.supabase.co`, env vars per `docs/AUTOMATION.md` | Heet |
| Tue 6 Oct | Pick the dogfood candidate (a friend targeting PM roles); collect resume, LinkedIn PDF, 3 target companies | Heet |
| Tue 6 to Thu 8 Oct | Run the full pipeline: 15 prospects. Hand-review every hook and message; log every edit | Heet + engine |
| Thu 8 Oct | Run `cost` and record Claude cost per prospect and founder minutes per step | Heet |
| Fri 9 Oct | Tune prompts from the logged edits; re-run on the same 15 prospects; compare | Build |
| Fri 9 Oct | Draft one-page terms: deliverables, client duties, no outcome guarantee, no refunds (free continued work), data consent | Heet |
| Sat 10 Oct | Draft the client consent notice and privacy notice (DPDP-ready); add a consent checkbox to the intake form | Heet + Build |
| Sun 11 Oct | Write 10 personal messages to the network asking for introductions to MBA/PM job seekers | Heet |
| Mon 12 Oct | Set up Razorpay payment links for Sprint, Standard and Full | Heet |
| Mon 12 Oct | Upgrade Vercel to Pro before taking the first payment | Heet |
| Tue 13 Oct | Rewrite landing page copy: outcome-first, human service, no AI headline | Heet |
| Tue 13 to Wed 14 Oct | Shortlist 5 B-school clubs where Heet has a contact; send the free 5-student pilot pitch to 3 | Heet |
| Wed 14 Oct | Publish LinkedIn post 1: what the research says about outreach that works (no results claimed) | Heet |
| Thu 15 Oct | Write the Tier 2 consent and account-risk disclosure (keep on file; not offered yet) | Heet |
| Thu 15 Oct | Add the cross-client rule to the engine: max 1 Knock message per recipient per month; global suppression list | Build |
| Fri 16 Oct | Publish LinkedIn post 2; follow up with the 10 network contacts; book intake calls | Heet |
| Sat 17 Oct | Update this plan's cost and hours estimates with the dogfood numbers; re-check unit economics | Heet + Claude |
| Sun 18 Oct | Go or no-go to open founding slots on Monday 19 October | Heet |

**Done by 18 October means:** domain live, dogfood finished with measured cost and hours, terms and consent ready, payments live, 3 clubs pitched, 2 posts out, and the first intake calls booked.
