# nope: Demand Test (Rs 1,000 first, then a ladder)

Owner: founder (MD). Written by: growth lead / CMO (Claude). v1 Sun 8 Nov 2026. **v2 Mon 9 Nov 2026**, revised to follow CEO decisions D1, D2, D6 to D10, D13 and D14 (`ceo/DECISION_LOG.md`), the gates in `ceo/CRITICAL_PATH.md` and the triggers in `ceo/KILL_CRITERIA.md`. Day 0 of this plan = Mon 9 Nov 2026.

Reads with: PLAN.md (positioning, angles), GTM.md (ads machine, tracking), EXPERIMENTS.md, METRICS.md, VALIDATION_SCRIPT.md. **For the first 14 days this file replaces GTM.md** (CEO D2). The GTM "paid pre-orders from 16 Nov" step is cancelled. The GTM copy "Ships about 3 to 4 weeks after pre-order" is removed until a ship-by date is set after G1.

Labels:

| Tag | Meaning |
|---|---|
| **[F]** | Founder or CEO decision. |
| **[D]** | From a document or code in this repo. |
| **[A]** | Assumption: a planning number with no data behind it. Replace it when you have data. |
| **[U]** | Unverified fact about the world (platform rule, price, law). Check it before relying on it. |

The five persona interviews in `research/` are **simulated**, and their price reactions were biased by a seeded Rs 5,700 competitor price [D, NOPE_PLAN 3.2]. Nothing in this file treats them as evidence. They only suggested which objections to prepare for (permission trust, lockout fear, "Rs 1,999 for a puck?", iPhone).

### The gates this plan obeys (owned by the CEO and CTO, not by marketing)

| Gate | When [A] | What it means for marketing |
|---|---|---|
| **G0** phone lock | Wed 11 to Thu 12 Nov | The app locks and unlocks on 3 phones of 3 brands with a bare sticker. **The Rs 1,000 hook test is not published until G0 passes.** |
| **G1** NFC through the printed shell | Mon 16 Nov target, Wed 18 Nov latest | The printed puck reads reliably on 5 phones. Needed before any page or message asks for money. |
| **G2** first money | Wed 18 Nov earliest | G1 passed, employment contract read, business bank or UPI account, a payment link, terms and refund pages live, CLO wording check. **No personal UPI ID, ever** (CEO D6). |
| **G4** demand read | Fri 20 Nov | Step 0 and Step 1 results read with the decision tree in section 8. Step 2 needs a fresh MD yes on this day (CEO D13). |

**Claims rule (CEO D3):** every ad, caption, page line and card is checked against the CTO's Verified Claims List (`docs/CLAIMS_VERIFIED.md`, due Wed 11 Nov) and the CLO wording list before the MD sees it. Allowed today: Android with NFC, Rs 1,999 once, no subscription, 30 day refund, leave it in another room, backup code, emergency unlock. Banned until verified: "nothing leaves your phone", "never locked out", "cannot be bypassed", "works on every Android", schedules, per-feature blocking, iPhone, any health or addiction claim, any Brick comparison. Anything not on the list is out, even if it seems harmless.

---

## 0. The answer in five lines

1. **Yes, you can start with Rs 1,000, but it cannot prove demand.** It buys roughly 20 to 100 website visits [A]. That is enough to find a dead hook and a broken page. It is not enough to say whether people will pay.
2. **Free signals come first, money comes later.** Until G2 (earliest Wed 18 Nov) the page is a waitlist ("Join the first 50") that asks for phone model and an NFC check. From G2, waitlist members are offered a Rs 199 refundable reservation through a business payment link.
3. **The one signal that matters most:** a stranger who first came from an ad pays the Rs 199 reservation (or the full Rs 1,999). Clicks, likes, waitlist joins and "I'd buy it" are not demand.
4. **Demand is first tested honestly at Step 2 (Rs 3,000 to 5,000, needs a new MD yes on Fri 20 Nov)** and cost per paid order at Step 3 (Rs 10,000, read together with the 10 pilot pucks). Spend only when the previous step passes.
5. **Hands off: mostly, not fully.** Claude and Instinct can do about 80% of the tasks. You cannot hand off paying, logging in, identity and bank checks, holding phones for the NFC tests, filming the real tap, reading your employment contract, and talking to real people. Minimum about 4 hours over 14 days; the version that teaches you the most is about 13 hours (CEO's G0 and G1 test sessions are counted separately in CRITICAL_PATH.md).

---

## 1. What Rs 1,000 of Meta ads can and cannot prove

### 1.1 The rough math

India CPMs and click costs vary by season, creative and account age; new accounts with tiny budgets often pay more [U].

| Line | Best case | Base case | Worst case | Label |
|---|---|---|---|---|
| Cash you spend | Rs 1,000 | Rs 1,000 | Rs 1,000 | [F] |
| GST on Meta ads (18% on top of spend) | Rs 153 | Rs 153 | Rs 153 | [U] check your first Meta invoice |
| **Actual ad budget** | **Rs 847** | **Rs 847** | **Rs 847** | arithmetic |
| CPM (cost per 1,000 impressions) | Rs 100 | Rs 150 | Rs 250 | [A] |
| Impressions | 8,470 | 5,650 | 3,390 | arithmetic |
| Link click-through rate | 1.5% | 1.0% | 0.6% | [A] |
| **Cost per link click** | **about Rs 7** | **about Rs 15** | **about Rs 42** | arithmetic |
| Link clicks | about 127 | about 56 | about 20 | arithmetic |
| Landing page views (80% of clicks load the page) | about 100 | about 45 | about 16 | [A] |
| Per ad, with 3 ads (if Meta split evenly, which it will not) | about 33 | about 15 | about 5 | arithmetic |
| Qualified waitlist joins (name, phone model, NFC answer) at 5% to 12% of visitors | 5 to 12 | 2 to 5 | 1 to 2 | [A] |
| Later paid Rs 199 reservations, if 10% to 25% of those joins pay after G2 | 1 to 3 | 0 to 1 | 0 | [A] no data exists for either rate |

### 1.2 Why the statistical power is tiny

- **Zero sales proves nothing.** With 45 visitors and 0 payments, the true rate could still be as high as about 6.7% (the "rule of three": 3 divided by 45 is the 95% upper bound). A great product and a dead product both produce 0 here.
- **Two sales proves little.** 2 payments from 45 visitors gives a 95% range of about 0.5% to 15%, which covers both "great business" and "no business".
- **Comparing ads on clicks is mostly noise.** Each ad gets roughly 1,900 impressions in the base case. A 1.0% CTR measured on 1,900 impressions has a margin of about plus or minus 0.45 points, so 0.8% versus 1.3% is not a real difference. Only gaps of about 2.5x or more are trustworthy.
- **Hook rate is the one thing it measures well.** Hook rate (3 second plays divided by impressions) is a big percentage (15% to 35%), so on about 1,900 impressions per ad the margin is about plus or minus 2 points. 15% versus 25% is a real difference. This is why Step 1 is a creative test, not a demand test.
- **Meta's algorithm will not "learn".** It needs about 50 optimisation events per ad set per week to leave the learning phase [U]. You will have a handful of joins and 0 to 3 payments, so you optimise for landing page views and read money signals by hand.
- **To tell a 2% from a 4% payment rate** (80% power, 5% significance) you need about **1,140 landing page views per variant**: about Rs 20,000 per variant at Rs 15 a view plus GST. That is why the price test in section 3.6 cannot run on Rs 1,000.

### 1.3 What Rs 1,000 IS good for

| Job | Why Rs 1,000 can do it |
|---|---|
| **Kill a dead hook** | Hook rate differences of 10 points show up clearly on about 1,900 impressions per ad. |
| **Check that the page and tracking work** | If 56 people click and only 20 page views register, or the form loses entries, you learn it for Rs 1,000 instead of Rs 10,000. |
| **Learn your real click cost** | Your own cost per landing page view replaces the [A] numbers above. |
| **Pass Meta's first ad reviews** | Better to hit a policy rejection on a Rs 1,000 test [U]. |
| **Collect stranger contacts to offer the reservation to after G2** | Ad-sourced waitlist joins keep their ad code, so if they pay later, the payment still counts as an ad result. |
| **See the objections** | Comments and WhatsApp questions from strangers are free qualitative data. |

### 1.4 What it CANNOT do

Prove or disprove demand. Tell you your cost per paid order. Pick the best price. Pick the best of 3 angles unless one is dramatically better or worse. Justify manufacturing.

---

## 2. The demand ladder

Each step must pass before you spend on the next. Never move up because money is available; move up because the gate passed.

**Prerequisite: the real product works on real phones (G0).** Nothing has run end to end on a real phone yet [D, NOPE_PLAN]. Honest ads need that first. If the printed puck has not arrived when you film, film with the prototype and put "prototype shown" on screen. Never use a 3D render or a faked screen as the real thing. If G0 fails, run Step 0 conversations only; no ads (KILL_CRITERIA K1).

### Overview

| Step | Cash | When [A] | Single metric | Go | Stop |
|---|---|---|---|---|---|
| 0. Free signals | Rs 0 (optional Rs 100 interview thank-yous) | Live Thu 12 Nov; waitlist read Sun 15 Nov; money read Fri 20 Nov | (a) Qualified waitlist joins by Day 6; (b) paid reservations from outside close family by Fri 20 Nov | (a) 30+; (b) 3+ | (a) under 10, and interviews show the demo is unclear; (b) 0 |
| 1. Rs 1,000 hook test | Rs 1,000 incl. GST | Publish Fri 13 Nov **only if G0 passed**; deliver Sat 14 to Thu 19 Nov; read Fri 20 Nov | Cost per landing page view, best ad | Rs 25 or less | All ads above Rs 50, or every hook rate under 15% (K6) |
| 2. Rs 3,000 to 5,000 | Rs 4,000 suggested | From about Sun 22 Nov, after G2 and a new MD yes | Paid reservations plus full orders with an ad code | 8 or more | 0 or 1 after 200+ page views (K8) |
| 3. Rs 10,000 | Rs 10,000 incl. GST | After Step 2 GO; read with the 10 pilot pucks (ship Mon 23 to Fri 27 Nov, CEO D2) | Cost per full paid order from ads | Rs 600 or less | Rs 2,000 or more (K9) |

CAC numbers come from CEO D8: about Rs 1,000 contribution per order before ads [A], **break-even CAC about Rs 750, scale ceiling Rs 600, target Rs 400**, and Rs 850 tolerated only while learning and while total test spend stays under Rs 18,000.

### Step 0: Free signals (live Thu 12 Nov)

| Item | Plan |
|---|---|
| **Budget** | Rs 0 for reach. Optional Rs 100 UPI thank-you per interview (VALIDATION_SCRIPT.md), kept separate from the Rs 1,000. |
| **Duration** | Set up Days 0 to 3, live Day 3 (Thu 12 Nov). Read (a) on Day 6 (Sun 15 Nov). Read (b) on Day 11 (Fri 20 Nov), because no money can be taken before G2 (earliest Wed 18 Nov). |
| **Creative** | One real 10 to 15 second tap demo filmed by you during the G0 session: tap the phone on the puck or sticker, open a feed app, get bounced Home, walk the puck to the kitchen shelf. Captions burned in. Same clip on Instagram, WhatsApp status and DMs. |
| **Audience** | Your network plus one step out: WhatsApp status viewers, Instagram followers, 10 DMs to people who are not close family and do not work in startups or marketing, and 10 interviews recruited per VALIDATION_SCRIPT.md section 1 (minimum version: 2 or 3 short calls). |
| **Action asked, until G2** | "Join the first 50": name, city, phone model, and "does your phone show NFC when you search Settings?" Link to the waitlist page with `utm_source=wa_status` (or `ig`, `dm`, `interview`). Low-effort option: "Reply NOPE and I'll keep you posted." No payment, no UPI QR, no reservation button. |
| **Action asked, from G2** | WhatsApp each qualified joiner (NFC confirmed) the Rs 199 refundable reservation through the business payment link, with their existing order code. Plain UPI to the business account only for buyers you know (CEO D6). |
| **Single metric** | (a) **Qualified waitlist joins** (all four fields filled, NFC answered) by Day 6. (b) **Paid reservations** from anyone outside close family (parents, siblings, partner) by Fri 20 Nov. |
| **Go** | (a) **30 or more** (CEO OKR [A]). (b) **3 or more** paid. Reasoning: your network is the friendliest audience you will ever have; VALIDATION_SCRIPT.md also says "3+ pre-order: proceed". |
| **Fix** | (a) 10 to 29. (b) 1 or 2. Keep going, but rank the top objection from every "no" and every interview and fix it on the page first. |
| **Stop (for now)** | (a) under 10 joins, fewer than 2 forwards, and interviews show 6 of 10 cannot say what nope is after the demo, or 5 of 10 would not grant the permission. (b) 0 paid by Fri 20 Nov with G2 open for at least 2 days. Do not move to Step 2. |
| **What decision follows** | (a) Go or fix: Step 1 publishes Fri 13 Nov if G0 passed. (b) feeds the Fri 20 Nov G4 decision. |
| **Cheapest next action if it fails** | 5 more 20 minute calls asking only "what would have to change for this to be a yes?" (free). Re-shoot the demo around the top answer. Do not buy ads to "find" demand your own network did not show. |
| **Warning** | Warm-network money is biased upward. A pass is necessary, not sufficient. Network codes never start with `A`, so they never count as ad results (CEO D9). |

### Step 1: Rs 1,000 hook test (publish Fri 13 Nov if G0 passed)

| Item | Plan |
|---|---|
| **Budget** | Rs 1,000 cash including GST: **lifetime budget Rs 840** on one ad set over 6 days (about Rs 140 a day). A lifetime budget cannot exceed its total [U]; daily budgets can overspend on single days [U]. Also set an account spending limit of Rs 1,000. |
| **Duration** | 6 days of delivery, Sat 14 to Thu 19 Nov. No edits in the first 72 hours. |
| **Where traffic goes** | The **waitlist page, no payment, no "Pre-order" button** (CEO D1), for the whole test, even if G2 passes mid-test. Changing the page mid-test would break the read. After G2, ad-sourced joiners get the reservation offer by WhatsApp, keeping their `NP-A` code. |
| **Creative** | 3 reels ads: A1 room, A5 bedtime, A4 pay once (section 4; confirmed by CEO D10). Same end card, same page, same button. |
| **Audience** | India, age 18+, all genders, no interests, no lookalikes (broad [F]). Android only if Meta still offers OS targeting [U]; otherwise "Android" is in every ad. |
| **Objective** | Traffic, performance goal "maximise landing page views" (needs the Pixel). Without the Pixel, "link clicks". Not Sales or Leads at this budget. |
| **Single metric** | **Cost per landing page view of the best ad**, counting only ads that spent at least Rs 150. (No Pixel: cost per link click, thresholds in brackets.) |
| **Go** | Best ad at **Rs 25 or less** per landing page view (Rs 20 or less per click) [A]. |
| **Fix** | Rs 25 to 50 (Rs 20 to 40 per click): the first 3 seconds need work. |
| **Stop this creative** | All ads above Rs 50 (Rs 40 per click), or every hook rate under 15% after Rs 150 each (K6). |
| **Diagnostics, read but do not decide on** | Hook rate (25%+ good, under 15% dead) [A]. Page views divided by link clicks (under 50% means the page is slow or tracking is broken: fix before reading anything else, K7). Qualified waitlist joins with `NP-A` codes. Stranger questions on WhatsApp and in comments. |
| **What decision follows** | Go: ask the MD for Step 2 on Fri 20 Nov. Fix: re-cut the first 3 seconds and rerun Rs 1,000 once. Stop: new creative, not more money. |
| **Cheapest next action if it fails** | Post 3 new first-3-second versions as free organic reels for 3 days and compare 3 second retention in Instagram insights. Pay for a second Rs 1,000 test only with the hook that did best organically. If page views per click were low, fix page speed first (free). |
| **What a Step 1 result does NOT mean** | Few joins or 0 payments is **not** a fail. 2 payments is **not** a pass. See section 1.2. |

### Step 2: Rs 3,000 to 5,000 (suggested Rs 4,000, 8 days)

| Item | Plan |
|---|---|
| **Preconditions** | Step 1 GO (or FIX with a better hook), G2 passed, and a **fresh MD yes on Fri 20 Nov** (Step 2 is outside the Rs 10,000 tranches, CEO D13). |
| **Budget** | Rs 4,000 cash including GST (about Rs 3,390 of ad budget, about Rs 425 a day). |
| **Duration** | 8 days. |
| **Where traffic goes** | Page in **reservation mode**: Rs 199 refundable reservation through the business payment link, plus the full Rs 1,999 option. Hero A and hero B via `?a=` (section 3.1). |
| **Creative** | The Step 1 winner, 2 new hooks on the same body (EXPERIMENTS.md E2), and **one study and work focus reel** sent to hero B, "Break time stays break time" (CEO D10). Maximum 4 ads. |
| **Audience** | Same broad ad set. Optional Rs 50 a day retargeting of site visitors and video viewers with the founder-face clip, only if Step 1 sent 100+ page views [U: small audiences may not deliver]. |
| **Objective** | Stay on Traffic with landing page views. Switch to Sales optimising for the Lead event only if Step 1 produced 10 or more Lead events. |
| **Expected volume** | About 225 landing page views in the base case [A]. |
| **Single metric** | **Paid reservations plus full orders that carry an ad code (`NP-A...`)**, including Step 1 joiners who pay now. A full order counts as one. |
| **Go** | **8 or more** (about Rs 500 cash each). Reasoning: if about 60% of Rs 199 reservations convert to full orders [A], Rs 500 per reservation is about Rs 830 per order, inside the Rs 850 learning tolerance (CEO D8). Economics are judged properly at Step 3. |
| **Fix** | 2 to 7. Real but weak. Change one thing (trust block, chat-first, or the hook) and run one more Rs 4,000 round, maximum. Watch K11: Rs 6,000 of total ad spend with fewer than 3 stranger-paid orders pauses all paid acquisition. |
| **Stop** | 0 or 1 after at least 200 landing page views (K8). The first step where "no" means something: 0 out of 200 puts the likely payment rate under about 1.5%, so each reservation would cost over about Rs 1,000 plus GST. |
| **Hero read** | Compare hero A and hero B on paid signals per landing page view, but only act on a 2x gap or more (CEO D10 revisit rule). |
| **What decision follows** | Go: Step 3, using the pilot buyers' first-week results. Fix: one more round. Stop: pause paid ads. |
| **Cheapest next action if it fails** | Message the WhatsApp chatters who did not pay and ask for 10 minute calls (free). Cheap page views but no money: the page or the offer is the problem (EXPERIMENTS.md E5, E6). Expensive page views and no money: stop paid, back to organic and network. |

### Step 3: Rs 10,000, read together with the 10 pilot pucks (14 days)

| Item | Plan |
|---|---|
| **Budget** | Rs 10,000 cash on ads including GST (about Rs 605 a day). The pilot kit (about Rs 1,500, CEO D13 tranche 2) is already planned and is not part of this budget. |
| **Duration** | 14 days of ads. |
| **Pilot** | The 10 pilot pucks ship Mon 23 to Fri 27 Nov if prints arrive on time (CEO D2), to the first paying buyers (Rs 1,800 balance on a reservation, or Rs 1,999 in full). Their day 1, 3 and 7 WhatsApp check-ins (CEO D11) are the pilot guardrails below. |
| **Creative** | The 2 best ads from Step 2, the founder-face clip, and real setup footage from pilot buyers once they agree in writing. All re-checked against the claims list. |
| **Audience** | Broad prospecting plus retargeting (GTM.md section 3). |
| **Objective** | Sales, optimising for Lead or InitiateCheckout, whichever had more events in Step 2. |
| **Single metric** | **Cost per full paid order from ads** = ad cash divided by full Rs 1,999 payments with an `NP-A` code (converted reservations from Steps 1 and 2 count, with their spend included). |
| **Go** | **Rs 600 or less** (17 or more orders on Rs 10,000), the CEO scale ceiling. Still a small sample: 17 orders gives a cost range of roughly Rs 350 to 950. |
| **Fix** | Rs 601 to 2,000 (5 to 16 orders). Improve creative and the page; do not raise spend. If it sits above Rs 850 for 7 days, pause ads (K10). |
| **Stop** | Rs 2,000 or more (4 or fewer orders) (K9). |
| **Pilot guardrails (must also pass)** | NFC tap works on at least 9 of 10 buyers' phones; at least 6 of 10 still locking on day 7 (self-reported; non-replies count as not retained, CEO D11); 2 or fewer refunds; zero lockouts without rescue (K4). |
| **What decision follows** | Go on both: make the rest of the founding 50 and move to GTM.md Tier 1. Ads pass, pilot fails: fix the product before more ad money. Pilot passes, ads fail: the product works, the channel does not; fix creative and page. |
| **Cheapest next action if it fails** | Stop ads. Refund any reservation you will not fulfil within 3 working days, as promised. Learn from the pilot buyers (day 7 and day 28 calls) before any pivot in angle (try gift, A7), offer or product. K17: if cash spent reaches Rs 10,000 with zero stranger-paid orders, stop all spend and refund every reservation. |

---

## 3. The pre-order intent test (no backend needed)

### 3.1 Page spec for the creative head

The creative head is rebuilding `landing/index.html` in parallel. Do not edit it here. The page has **two modes**, switched by one line the founder or Claude flips when G2 passes. The current file still has placeholders that would break the test [D]: WhatsApp number `91XXXXXXXXXX`, UPI ID `yourname@upi` (and a personal UPI ID is now banned, CEO D6), footer "Nope is a placeholder brand name", "about 2 to 3 weeks" shipping, no NFC check, no founder, and "Your phone stays in your hand", which contradicts the lead angle.

**Both modes**

1. Real product in a real hand above the fold on a 360 px wide phone (a frame from the tap demo).
2. **Hero by `?a=`** (CEO D10): `?a=A` (default, used by all three Step 1 ads) shows hero A **"Leave it in another room."** `?a=B` shows hero B **"Break time stays break time."** Unknown or missing values show hero A. Both heroes sit under the tagline "Put it down."
3. "Rs 1,999 once · No subscription · 30 day refund" and "Rs 1,999, MRP inclusive of all taxes" near the price (CEO D14). No GST registration line.
4. "Android with NFC only."
5. **NFC phone check**, before any form or payment: "Check in 10 seconds: Settings, search NFC. Nothing shows up? nope won't work on that phone yet. Tell us your model and we'll let you know." No payment is accepted without a confirmed NFC phone (CEO D15).
6. **Stage line:** "nope is made by one person in [city]. The founding batch is hand-made and is tested before it ships."
7. **Who makes this:** founder's real name, a real photo of the founder's face, city, WhatsApp number.
8. **Order code** generated and shown (logic below).
9. **No ship-by date or "3 to 4 weeks" line** until G1 sets one (CEO D2). Until then: "We'll confirm the ship date on WhatsApp before you pay anything."
10. Footer: privacy policy link, terms and refund page links, the Pixel line if the Pixel is used ("Our website uses Meta's pixel to measure ads."), lowercase "nope" everywhere. Do **not** add "The app has no tracking" or "nothing leaves your phone" until the claims list allows it.
11. **No** countdowns, no stock counters unless updated by hand and true, no Brick name or price, no outcome numbers, nothing outside the Verified Claims List.

**Waitlist mode (until G2)**

12. Primary button: **"Join the first 50"**. Form fields: first name, city, WhatsApp number, phone brand and model, "Does your phone show NFC? Yes / No / Not sure". The order code and UTM values go into the form invisibly.
13. Form backend with no server: a Google Form (prefilled entry IDs) or a Google Sheet behind it, so entries are not lost if WhatsApp does not open. After submit: "Thanks. You're on the list for the first 50. Your code is NP-A1W-7K2Q. We'll message you on WhatsApp." Plus an optional "Say hi on WhatsApp" button with a prefilled message carrying the code.
14. **No** price button, no payment link, no UPI QR, no "Pre-order" wording anywhere (CEO D1).

**Reservation mode (from G2, Step 2 onwards)**

15. Primary button: **"Reserve for Rs 199"**. Secondary: "or pay Rs 1,999 in full".
16. **Reservation terms in full** (CEO D7, CLO to check wording): "Rs 199 holds one numbered puck from the founding batch of 50. It counts towards the Rs 1,999 price; you pay the Rs 1,800 balance when your puck is ready. Changed your mind? Message 'refund' any time before shipping and it is back to your original payment method within 3 working days. No forms, no argument."
17. **Full order terms:** "Ships by [date set after G1]. Miss it by more than 7 days and you can take a full refund on request. After delivery, 30 days to decide; refund to your original payment method within 3 working days."
18. **Payment:** the business payment link (gateway hosted page) as the button. Pass the order code in the link's reference or notes field if the gateway supports it [U]; otherwise the thank-you text asks the buyer to send their code and payment screenshot on WhatsApp. Plain UPI to the business account is shown only in WhatsApp, only to known network buyers (CEO D6).
19. **Cap:** at 50 reservations plus orders, the founder flips one line to "Founding batch full. Join the batch 2 list." Never take more money than units you can make. Deposit money is never spent (CEO D9, K16).

**Order code logic (client side, no server):** read `utm_content` (for example `A1_room_reel_v1`) and take the part before the first underscore as the source. No UTM: use a `src` parameter, else `X`. Add a type letter: `W` waitlist, `R` Rs 199 reservation, `F` full order. Then 4 random characters from an alphabet without 0, O, 1, I. Store it in `localStorage` (wrapped in try/catch) so a returning visitor keeps the same code; when a `W` joiner later pays, the founder logs the same code with the new type.

### 3.2 Signal hierarchy (strongest first)

Only levels 1 and 2 count as demand. Before G2, level 6 is the best signal you can have, and it is not demand.

| Level | Signal | Why it ranks here |
|---|---|---|
| 1 | Full Rs 1,999 paid, ad code (`NP-A...`) | Money at full price from a stranger. The real thing. |
| 2 | Rs 199 reservation paid, ad code | Money from a stranger, small and refundable. |
| 3 | Levels 1 or 2 from the warm network (codes `S`, `O`, `D`, `I`, `N`) | Real money, biased by relationship. Read at Step 0 only. |
| 4 | A reservation later refunded | Informative: ask why. Log, do not count as demand. |
| 5 | WhatsApp chat with a code, after G2, asking how to pay | Intent at the money moment. |
| 6 | Qualified waitlist join: phone model given and NFC confirmed | Effort plus qualification, no money. |
| 7 | Waitlist join with missing fields, or "Reply NOPE" | Low effort. |
| 8 | Tap on "Join" or "Reserve" (Pixel only) | Finds leaks between interest and action. |
| 9 | Landing page view | Attention. |
| 10 | Link click, likes, comments, saves, shares, "I'd buy this" | Not demand. Read comments for objections only. |

### 3.3 Naming scheme to match payments to ads

**Ad names** (also `utm_content`): `A1_room_reel_v1`, `A5_bed_reel_v1`, `A4_price_reel_v1`; in Step 2 add `B1_break_reel_v1` for the study and work focus reel. Version up (`v2`) when anything changes.

| Source code | Source | UTM |
|---|---|---|
| A1, A4, A5, B1 | Meta ad of that angle | `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}` |
| O | Instagram organic post or bio | `utm_source=ig&utm_medium=organic_social&utm_campaign=dt0&utm_content=O_demo_v1` |
| S | WhatsApp status | `utm_source=wa_status&utm_medium=organic_social&utm_campaign=dt0&utm_content=S_demo_v1` |
| D | Direct message | `utm_source=dm&utm_medium=dm&utm_campaign=dt0&utm_content=D_v1` |
| I | Interviewee | `utm_source=interview&utm_medium=dm&utm_campaign=dt0&utm_content=I_v1` |
| N | Anything else from your network | `utm_source=network&utm_medium=referral&utm_campaign=dt0&utm_content=N_v1` |
| X | No UTM | none |

Campaign names: `dt1_rs1000`, `dt2_rs4000`, `dt3_rs10000`.

**Order code** = `NP-` + source + type + `-` + 4 characters. Examples: `NP-A1W-7K2Q` (joined from the A1 ad), the same person paying later is logged as `NP-A1R-7K2Q`; `NP-SR-9HQ4` (WhatsApp status, reservation). Keep it under 20 characters so it fits any payment note [U].

**Matching by hand:** the amount gives the type (Rs 199 or Rs 1,999). The payment link reference or the WhatsApp screenshot gives the code. If both are missing, ask "Where did you first see nope?" and log the source as `?` with their answer. Money is matched in the business account or gateway dashboard only, by the founder.

### 3.4 Google Sheet layout ("nope demand test")

One sheet, seven tabs. No customer phone numbers in the sheet; they stay in WhatsApp and in the form responses sheet that only the founder opens. First name and city only.

**Tab `Daily_Ads`** (one row per ad per day; Instinct fills it)

| Col | Header | Formula (row 2) |
|---|---|---|
| A | date | |
| B | step (1, 2, 3) | |
| C | ad_name | |
| D | spend_rs | |
| E | impressions | |
| F | reach | |
| G | frequency | |
| H | plays_3s | |
| I | hook_rate | `=IFERROR(H2/E2,"")` |
| J | link_clicks | |
| K | ctr | `=IFERROR(J2/E2,"")` |
| L | landing_page_views | |
| M | lpv_per_click | `=IFERROR(L2/J2,"")` |
| N | cost_per_lpv | `=IFERROR(D2/L2,"")` |
| O | cost_per_click | `=IFERROR(D2/J2,"")` |
| P | delivery_status | |
| Q | review_status | |
| R | comments_or_questions_seen | |
| S | notes | |

**Tab `Signals`** (one row per signal of level 1 to 7)

`A timestamp | B order_code | C source_code | D signal_level (1 to 10, dropdown) | E signal_type (full_paid / reservation_paid / refunded / whatsapp_pay_intent / waitlist_qualified / waitlist_partial) | F amount_rs | G first_name | H city | I phone_model | J nfc_ok (Y/N/?) | K where_heard (their words) | L payment_verified_by_founder (Y/N) | M payment_ref_last4 | N refund_status (none / requested / paid + date) | O hero (A/B) | P notes`

Only the founder fills column L, after seeing the money in the business account or gateway dashboard.

**Tab `Summary`** (formulas only)

| Row | Formula idea |
|---|---|
| Spend per ad | `=SUMIFS(Daily_Ads!D:D, Daily_Ads!C:C, A2)` |
| Landing page views per ad | `=SUMIFS(Daily_Ads!L:L, Daily_Ads!C:C, A2)` |
| Cost per landing page view per ad | spend divided by page views |
| Hook rate per ad | `=SUMIFS(Daily_Ads!H:H, Daily_Ads!C:C, A2)/SUMIFS(Daily_Ads!E:E, Daily_Ads!C:C, A2)` |
| Qualified waitlist joins from ads | `=COUNTIFS(Signals!C:C,"A*",Signals!E:E,"waitlist_qualified")` plus `"B*"` |
| Qualified waitlist joins, all sources | `=COUNTIFS(Signals!E:E,"waitlist_qualified")` |
| Verified paid signals from ads | `=COUNTIFS(Signals!C:C,"A*",Signals!D:D,"<=2",Signals!L:L,"Y")` plus `"B*"` |
| Verified paid signals from network | `=COUNTIFS(Signals!D:D,3,Signals!L:L,"Y")` |
| Cost per verified ad payment | total ad spend divided by the count above |
| Total cash spent incl. GST | `=SUM(Daily_Ads!D:D)*(1+Settings!B2)` |

**Tab `Gates`**: `step | single_metric | go_threshold | stop_threshold | actual (formula from Summary) | verdict (GO / FIX / STOP) | decided_on | decided_by`. Prefill with section 2. Add rows for G0, G1, G2 with "certified by" (CTO, CPO, COO).

**Tab `Interviews`**: the note template columns from VALIDATION_SCRIPT.md section 6.

**Tab `Competitors`**: `date | site | search_term | listing_title | seller | price_rs | rating | review_count | uses_NFC (Y/N/?) | subscription (Y/N/?) | url | screenshot_file | notes`.

**Tab `Settings`**: `B2 gst_rate 0.18 | B3 cash_budget_step1 1000 | B4 lifetime_budget 840 | B5 go_cost_per_lpv 25 | B6 stop_cost_per_lpv 50 | B7 kill_hook_rate 0.15 | B8 min_spend_to_judge_ad 150 | B9 cac_target 400 | B10 cac_ceiling 600 | B11 cac_breakeven 750`.

### 3.5 Measuring without a server

| What | Source | Who records it |
|---|---|---|
| Spend, impressions, 3 second plays, link clicks, CTR, frequency | Ads Manager | Instinct, daily |
| Landing page views | Ads Manager, **only if the Pixel is installed** | Instinct, daily |
| Waitlist joins with code, UTM, phone model, NFC answer | Google Form responses sheet | automatic; Instinct copies counts (not phone numbers) into Signals |
| WhatsApp chats with codes | WhatsApp Business: messages containing "NP-" | Founder, or Instinct (optional, read only, runbook d) |
| Payments (from G2) | Business account or gateway dashboard, plus screenshot on WhatsApp | **Founder only** (column L) |
| Organic reach | Instagram insights, WhatsApp status viewer count | Instinct (Instagram), founder (status) |

**Optional improvement, recommended before Step 1: the Meta Pixel.** A few lines on a static page; the creative head adds it. Without it you cannot use the "landing page views" goal or see the click-to-view drop. Events: PageView, ViewContent (price section visible), Lead (waitlist form submit), Contact (WhatsApp tap), and from reservation mode InitiateCheckout (Reserve or Pay tap, `value` 199 or 1999, `currency` INR). Purchase stays manual (offline upload later, GTM.md section 4). Add the footer disclosure line and check DPDP Act consent expectations [U]. A privacy-light free page counter (for example GoatCounter or Cloudflare Web Analytics) is an alternative check [U: features vary].

### 3.6 The price test: honest answer

**A Rs 1,499 vs Rs 1,999 vs Rs 2,499 test does not work with Rs 1,000.** Three arms of about 15 page views each produce 0 or 1 payments per arm (section 1.1). Telling a 2% from a 4% rate needs about 1,140 page views per arm, about Rs 60,000 for three arms. On top of that, **the price is locked at Rs 1,999 by the MD** (CEO decision log header), and the only earlier "price evidence" was simulated and anchored on a seeded Rs 5,700.

**What to do instead:**

1. **Sequence it.** Steps 0 to 3 run at Rs 1,999 only. A real price test can run only if the MD reopens price, after Step 3 or after the founding 50 sell, on the batch 2 waitlist (EXPERIMENTS.md E4), with about 1,000 page views per arm, and anyone who reserves at a price gets that price.
2. **What we can learn now without changing the price (free):**
   - In interviews, the real ask in VALIDATION_SCRIPT.md question 17, never "how much would you pay?", and never any competitor's price. Log what they compare Rs 1,999 to (question 15).
   - Count "price?" and "too costly" replies to the A4 (pay once) ad versus the others.
   - After G2, compare who picks Rs 199 reservation versus Rs 1,999 in full. A high share paying in full is a willingness-to-pay signal at the locked price.
   - CEO D9 revisit: if fewer than 3 stranger payments by Fri 20 Nov, test "pay in full only" against the reservation, which is a mechanism test, not a price change.
3. **If the MD does reopen price and wants a WhatsApp sub-test:** split warm contacts into 3 groups by the last digit of their phone number (0 to 3, 4 to 6, 7 to 9), each with its own link (`?p=1499`, `?p=1999`, `?p=2499`), same Rs 199 reservation. With 30 to 60 people per group it only detects a huge gap. People in one network talk to each other: tell the truth if asked and honour the lowest price shown to anyone who asks.

---

## 4. Three-angle creative set for Rs 1,000

**Why these three (confirmed by CEO D10):** each does a different job, so if one wins you learn something specific. A1 (leave it in another room) explains why a physical puck matters and is the lead angle. A5 (bedtime) is a specific, familiar moment. A4 (pay once) puts the price first: lower CTR is likely but clicks are pre-qualified, so judge A4 on qualified joins and later payments, not clicks. A2 (tap) overlaps with A1's demo; A3 (privacy) depends on claims not yet verified. The study and work focus reel (hero B) joins in Step 2.

Shared rules (PLAN.md sections 7 and 8, GTM.md section 14, CEO D3): 9:16, 1080x1920, 9 to 15 seconds, captions burned in, real footage of the real tap, "Android" on screen, no Instagram or YouTube logos (generic app tiles), no outcome claims, no "addiction" words, text kept out of the top 14% and bottom 35% of the frame, every line checked against the Verified Claims List. End card for all: "nope · Rs 1,999 once · Join the first 50" plus "Android with NFC · 30 day refund · No subscription". **No "reserve", "pre-order" or payment wording in Step 1 ads** (the page has no payment in Step 1).

Claims used below, all on the CEO's allowed list or describing the core mechanism the G0 test proves: Android with NFC, Rs 1,999 once, no subscription, 30 day refund, leave it in another room, tap to lock and unlock. If the CTO's list does not include the tap-to-lock description in this wording, use the list's wording.

### Ad 1: `A1_room_reel_v1`

- **Hook (first 3 seconds):** close-up of a hand tapping the phone on the puck, then the hand carries the puck away. On screen and spoken: **"My phone is here. The off switch is in the kitchen."**
- **Body (3 to 12 s):** puck goes on a kitchen shelf; back on the sofa, a feed app opens and bounces Home; a beat; phone down. On screen: "Tap to lock. A walk to unlock."
- **Primary text:** "Tap your phone on the nope puck and the apps you chose are locked. To unlock, tap it again. So leave the puck in another room. It doesn't stop you. It makes you walk.
  Rs 1,999 once. No subscription. 30 day refund.
  Android phones with NFC only. Join the list for the founding batch of 50."
- **Headline:** "The off switch lives in another room" (36 characters)
- **Description:** "Android with NFC · 30 day refund"
- **Call to action button:** Learn more
- **URL:** page `?a=A`

### Ad 2: `A5_bed_reel_v1`

- **Hook (first 3 seconds):** dark bedroom, phone glow on a face. On screen: **"11:48 pm. 'Just one more.'"** The feed app opens and bounces straight to Home.
- **Body (3 to 12 s):** cut to earlier: tapping the phone on the puck on a hallway shelf, walking to bed. Spoken or on screen: "Bedtime scroll? The puck's in the other room." End: phone face down on the bed.
- **Primary text:** "Before bed, tap your phone on the nope puck and leave it outside your room. The apps you chose stay locked until you walk back to it.
  Rs 1,999 once. No subscription. 30 day refund.
  Android phones with NFC only. Join the list for the first 50."
- **Headline:** "Bedtime scroll? The puck's next door" (36 characters)
- **Description:** "Android with NFC · No subscription"
- **Call to action button:** Learn more
- **URL:** page `?a=A`

(v1 said "Calls still work". Removed: not on the allowed claims list yet.)

### Ad 3: `A4_price_reel_v1`

- **Hook (first 3 seconds):** the puck in an open palm, slow turn. On screen, large: **"Rs 1,999. Once. That's the whole price."**
- **Body (3 to 12 s):** the tap, the lock, the app bouncing Home. On screen in sequence: "No subscription." "No monthly fee." "30 days to decide."
- **Primary text:** "nope is a small puck that locks the apps you choose with one tap. Tap again to unlock. Pay once: no subscription, no monthly fee. If it isn't for you, 30 days for a full refund.
  Android phones with NFC only. Join the list for the founding batch of 50."
- **Headline:** "Pay once. No subscription." (26 characters)
- **Description:** "Android with NFC · 30 day refund"
- **Call to action button:** Learn more
- **URL:** page `?a=A`

(v1 said "No account" and "Ever". Removed: not on the allowed claims list.)

All three use "Learn more" so the button is not a variable, and because the page explains before it asks for anything.

### Campaign settings (simplest that works)

| Setting | Value |
|---|---|
| Campaigns | 1: `dt1_rs1000` |
| Objective | Traffic [U: Meta renames objectives] |
| Performance goal | Maximise number of landing page views (Pixel). Fallback: link clicks. |
| Advantage campaign budget | Off (budget on the single ad set) |
| Ad sets | 1: `dt1_broad_IN` |
| Budget | Lifetime Rs 840, schedule Sat 14 Nov 00:00 to Thu 19 Nov 23:59 IST (6 days) |
| Account spending limit | Rs 1,000 (founder sets in billing) |
| Location | India |
| Age | 18 and over, no upper limit [F: broad] |
| Gender | All |
| Detailed targeting | None |
| Advantage+ audience | On with no suggestions, or off with broad settings. Do not add interests. |
| Devices | Android only if offered [U]; if not, leave all |
| Language | Leave empty (all) |
| Placements | Manual: Instagram Reels, Stories, Feed, Explore; Facebook Reels, Stories, Feed. Off: Audience Network, Messenger, right column, in-stream, search. |
| Creative enhancements | All Advantage+ creative options OFF (auto text, music, visual touch-ups, translations) [U: names vary]. Auto text could add claims outside the list. |
| Ads | 3, as above, all to `?a=A` |
| URL parameters | `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}` |
| Pixel / dataset | Select it if installed |
| Spend split | Meta will not split evenly across the 3 ads. Uneven spend is itself a signal. An ad with under Rs 150 spent by Thu 19 Nov is "untested", not "lost". |

### Exact launch checklist (all ticked before Publish)

**Gates and product**
- [ ] **G0 passed** and certified by the CTO (3 of 3 phones, 10 of 10 taps). If not, do not publish.
- [ ] All three reels use real footage from the G0 session; any prototype is labelled "prototype shown".
- [ ] Every line of every ad, the end card and the page checked against `docs/CLAIMS_VERIFIED.md` and the CLO wording list; the check is noted in the sheet.

**Page (waitlist mode)**
- [ ] Live on its final address (getnope.in or a free host address), loads in under about 3 seconds on 4G [A].
- [ ] **No** payment button, payment link, UPI ID, QR code, "Pre-order" or "Reserve" wording anywhere.
- [ ] No ship-by date and no "3 to 4 weeks" line.
- [ ] Real WhatsApp Business number; no `XXXXXXXXXX`; footer "placeholder brand name" removed.
- [ ] Price line, "MRP inclusive of all taxes", 30 day refund, NFC check, founder name, photo and city visible.
- [ ] `?a=A` and `?a=B` show the right heroes; a missing or unknown `a` shows hero A.
- [ ] The order code appears and shows `A5` when the page is opened with `?utm_content=A5_bed_reel_v1`.
- [ ] A test join from someone else's phone lands in the form responses sheet with code, UTM, phone model and NFC answer. Delete the test row afterwards.
- [ ] Pixel (if used) shows PageView and Lead in Events Manager test events; footer Pixel line present.

**Meta**
- [ ] Facebook Page "nope" and Instagram professional account exist, linked, each with at least 3 posts (demo reel, how it works, who makes this).
- [ ] Ad account in INR, payment method added by the founder, spending limit Rs 1,000.
- [ ] Settings exactly as in the table; creative enhancements off.
- [ ] Previews checked on Reels and Stories: no text under the interface, "Android" visible.
- [ ] URL parameters on all 3 ads.

**Operations**
- [ ] WhatsApp Business installed with quick replies `/nfc`, `/lost`, `/refund` (GTM.md section 13, with CEO D3 and D7 wording: "backup code and emergency unlock", "no forms, no argument"; `/ship` stays unused until a ship-by date exists), plus `/join` from section 10 here. Drop GTM's `/privacy` text until the claims list allows "nothing leaves your phone".
- [ ] Google Sheet ready with all tabs.
- [ ] Founder has 10 minutes a day blocked for WhatsApp.
- [ ] Nobody you know is asked to click, like or share the ads.

---

## 5. Hands-off map (Days 0 to 14)

### 5.1 What only the founder can do (no workaround)

- **Pay for anything**: ads, domain, stickers, prints. Claude cannot pay; Instinct stops before every payment.
- **Log in and pass security**: passwords, OTPs, two-factor prompts, identity confirmation on Meta [U]. Google Play identity verification is also founder-only, but the Play fee is paid only after G1 and Play is not on the path to the first 50 (CEO D5).
- **Bank and payment KYC**: the business account and the gateway payment link (G2), signatures, documents.
- **Read the employment contract** (moonlighting, IP, conflict) before any customer money (CEO D14).
- **Accept terms of service** (Meta, Namecheap, hosting, gateway).
- **Hold phones for the G0 and G1 tests**, borrow phones of other brands, and **film the real tap**.
- **Talk to real people**: interviews, and strangers on WhatsApp who are about to pay someone they have never met.
- **Confirm money arrived and send refunds** from the business account or gateway.
- **Approve anything public**: ads, posts, page facts.

### 5.2 Task table

Founder minutes are estimates [A]. G0 and G1 test sessions are owned by the CTO and CPO and timed in CRITICAL_PATH.md; only the marketing part (filming) is counted here.

| # | Task | Day(s) | Who does it | Founder minutes | Approval needed |
|---|---|---|---|---|---|
| 1 | Read section 0, say "go", give name, city, WhatsApp Business number | 0 | Founder | 15 | |
| 2 | Page spec to creative head (section 3.1) | 0 | Claude | 0 | |
| 3 | Ad copy, DM and status texts, waitlist form questions, quick replies, all checked against the claims list | 0 to 3 | Claude | 0 | Founder reads once (row 12) |
| 4 | Create Google Sheet tracker (runbook c) | 0 | Instinct | 0 | |
| 5 | Domain to cart (runbook b), then pay | 0 | Instinct, then Founder | 10 | Checkout |
| 6 | Meta setup: Page, Instagram professional account, ad account, Pixel | 0 to 1 | Instinct clicks through; Founder logs in, passes ID or OTP checks, accepts terms, adds payment method, sets the Rs 1,000 limit | 45 | Each security or payment screen |
| 7 | WhatsApp Business on the founder's phone with quick replies | 1 | Founder (Claude wrote the replies) | 15 | |
| 8 | Film the tap demo and the 3 ad clips during the G0 session, plus a founder photo | 2 | Founder (shot list from Claude) | 40 | |
| 9 | Edit reels, build waitlist page, Pixel and order codes | 2 to 3 | Creative head and Claude | 0 | |
| 10 | Host page, connect domain DNS | 2 to 3 | Instinct (founder logged in to host and Namecheap) | 5 | Any paid plan: stop |
| 11 | Page QA with a test join from a friend's phone | 3 | Founder | 10 | |
| 12 | Approve page facts and copy | 3 | Founder | 15 | Approve |
| 13 | Step 0: post demo on Instagram and WhatsApp status, send 10 DMs | 3 | Founder sends; Claude drafted; Instinct can schedule the Instagram post (runbook f) | 30 | Founder approves post |
| 14 | 10 interviews (VALIDATION_SCRIPT.md, no competitor price) | 3 to 10 | Founder | 300 (minimum version: 30) | |
| 15 | Interview notes into the sheet, synthesis | 3 to 12 | Claude from voice notes or transcripts | 0 | |
| 16 | Build Step 1 campaign up to the review screen (runbook a) | 4 | Instinct | 0 | |
| 17 | Check G0 certificate and screenshots, click Publish | 4 | Founder | 15 | **Publish** |
| 18 | Daily 10 minute ads check, fill sheet, send summary (runbook d) | 5 to 14 | Instinct | 0 | Pausing only if founder opted in |
| 19 | Read daily summary | 5 to 14 | Founder | 20 total | |
| 20 | Answer WhatsApp joiners | 3 to 14 | Founder (quick replies from Claude) | 70 total [A] | |
| 21 | G2 tasks: business account, payment link, contract read (COO and MD) | 0 to 9 | Founder with COO checklist | counted in CRITICAL_PATH.md | KYC, signatures |
| 22 | From G2: WhatsApp the reservation offer to qualified joiners; confirm payments; refunds; mark column L | 9 to 14 | Founder (message text from Claude) | 40 total [A] | |
| 23 | Step 0 reads (Day 6 and Day 11) and Step 1 read (Day 11) with numbers and recommendation | 6, 11 | Claude | 20 | Founder decides; MD yes for Step 2 |
| 24 | Step 2 prep: 2 new hooks plus the hero B study and work reel; founder films (30) | 11 to 12 | Claude, then Founder | 30 | |
| 25 | Switch page to reservation mode (only after G2) | 11 to 12 | Creative head or Claude | 5 (approve) | Approve |
| 26 | Build Step 2 campaign up to the review screen | 12 | Instinct | 0 | |
| 27 | Publish Step 2 | 13 | Founder | 15 | **Publish** |
| 28 | Organic posts scheduling (3 a week) | 3 to 14 | Claude writes, Instinct schedules (runbook f) | 10 (approve batch) | Batch approval |
| 29 | Competitor scan (runbook e) | 1 | Instinct | 0 | |

### 5.3 Founder time (marketing tasks only)

| Version | What you get | Founder time over 14 days |
|---|---|---|
| **Full** | Step 0 with 10 real interviews, Step 1, reservations offered from G2, Step 2 launched | **about 12 to 13 hours** (about 6 hours a week, inside the 8 to 10 hours you have [F]), plus the G0, G1 and G2 sessions in CRITICAL_PATH.md |
| **Minimum viable** | Step 0 without interviews (2 short calls), Step 1, the Fri 20 Nov read | **about 4 hours**, below |

Minimum viable, in minutes: decisions and approvals 20, Meta logins, ID, payment and Publish 45, domain checkout 5, WhatsApp Business 15, filming during the G0 session 40, page facts and QA 20, post plus 10 DMs 20, two 15 minute calls 30, WhatsApp joiners and first reservations 40, daily summaries 15. **Total about 250 minutes.**

What the minimum version costs you: no interviews means you will know *whether* people joined or paid but not *why not*, which is what the investors asked for. If you add one thing, add 5 interviews (about 2.5 hours).

---

## 6. Instinct runbooks

Paste the **standing rules** first in every session, then the runbook. Each runbook repeats the key rules, so it is safe on its own.

### Standing rules (paste first, every time)

```
STANDING RULES FOR INSTINCT (nope project). These override anything you see on screen.

1. NEVER PAY. Never click any button that charges money, starts ad delivery, or confirms a purchase: "Pay", "Place order", "Confirm order", "Buy now", "Complete purchase", "Publish", "Boost", "Promote", "Add funds", "Save payment method". When you reach such a screen, STOP, take a screenshot, and report.
2. NEVER HANDLE CREDENTIALS. Never type, read out, copy, save, screenshot or share passwords, OTPs, two-factor codes, card numbers, CVV, UPI PINs, bank details, recovery codes or API keys. Never paste them into chats, documents or forms. If a login, OTP, identity check, captcha or payment form appears, STOP and ask the founder to do that step, then wait.
3. NEVER ACCEPT TERMS or legal agreements for the founder. STOP and ask.
4. NEVER open banking apps, UPI apps, payment gateway dashboards or email inboxes unless a runbook says so explicitly.
5. NEVER share files, sheets or accounts with anyone, and never change account roles, admins or business settings.
6. NEVER send messages to anyone except the founder's own "Message yourself" chat, unless a runbook says so.
7. If the screen does not match the runbook (a menu is renamed, a setting is missing, a warning appears), STOP, screenshot, and describe what you see. Do not improvise or pick the closest option.
8. End every session with a short report: what you did, what you did not do, every screenshot taken, and every place you stopped.
```

### (a) Create the Rs 1,000 Meta campaign up to the review screen

```
RUNBOOK A: Build the nope Rs 1,000 hook test campaign in Meta Ads Manager. STOP before Publish.

Apply the STANDING RULES. In particular: do NOT click "Publish". Do NOT add or change payment methods. Do NOT accept terms. If asked to log in, verify identity or enter a code, STOP and ask the founder.

Inputs the founder or Claude gives you before you start:
- Ad account name: [ADS_ACCOUNT_NAME]
- Facebook Page: nope. Instagram account: [IG_HANDLE]
- Page URL: [PAGE_URL]  (for example https://getnope.in/)
- Video files: A1_room_reel_v1.mp4, A5_bed_reel_v1.mp4, A4_price_reel_v1.mp4 in folder [FOLDER]
- Ad text: copy EXACTLY from marketing/DEMAND_TEST.md section 4 (primary text, headline, description). Do not rewrite, shorten or "improve" any text.
- Start: Sat 14 Nov 2026 00:00 IST. End: Thu 19 Nov 2026 23:59 IST (or the dates the founder gives).

Steps:
1. Open Ads Manager for [ADS_ACCOUNT_NAME]. Screenshot the account overview. If there is any warning about the account, payment or identity, STOP and report.
2. Create a new campaign. Objective: Traffic. Campaign name: dt1_rs1000. Advantage campaign budget: OFF. Special ad categories: none. If Traffic is not offered, STOP and report the list of objectives you see.
3. Ad set name: dt1_broad_IN.
   - Conversion location: Website.
   - Performance goal: "Maximise number of landing page views". If that option is missing or says a Pixel is required, choose "Maximise number of link clicks" and note this in the report.
   - Dataset or Pixel: select the nope Pixel if one exists. If none exists, leave it and note it.
   - Budget: LIFETIME budget, 840 INR, with the start and end dates above. If only daily budget is available, set 140 INR daily and note it.
   - Location: India. Age: 18 to 65+. Gender: All. Detailed targeting: none. Languages: none.
   - Advantage+ audience: if on, do not add any suggestions. Do not add interests, lookalikes or custom audiences.
   - Devices: if there is an option to target Android devices only, select Android only. If not, leave it and note it.
   - Placements: Manual. Turn ON: Instagram Reels, Instagram Stories, Instagram Feed, Instagram Explore, Facebook Reels, Facebook Stories, Facebook Feed. Turn OFF everything else, including Audience Network, Messenger, right column, in-stream videos and search.
4. Create 3 ads in this ad set. For each ad:
   - Ad name: A1_room_reel_v1, A5_bed_reel_v1, A4_price_reel_v1 (one each).
   - Identity: Facebook Page nope and Instagram account [IG_HANDLE].
   - Format: single video. Upload the matching video file.
   - Primary text, headline, description: paste exactly from DEMAND_TEST.md section 4 for that ad.
   - Call to action: Learn more.
   - Website URL: [PAGE_URL]?a=A for all three ads.
   - URL parameters field: utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
   - Turn OFF every Advantage+ creative or "enhancement" option (text improvements, music, visual touch-ups, image or video expansion, translations, overlays, site links). If any cannot be turned off, STOP and report.
5. For each ad, open the preview for Instagram Reels and Instagram Stories. Screenshot both. Check that no caption text is hidden under buttons and that the word "Android" is visible. Note any problem.
6. Open the final review screen. Screenshot the campaign, ad set and each ad summary, including budget, schedule, placements and URL parameters.
7. STOP. Do NOT click Publish. Leave the campaign as a draft.
8. Report to the founder: "Campaign dt1_rs1000 is built and waiting for your review. Lifetime budget 840 INR from [start] to [end]. Before you Publish: (1) confirm the CTO certified G0, (2) check the screenshots, (3) check the account spending limit is 1,000 INR in Billing. Then click Publish yourself." List every setting you could not set exactly as written.
```

### (b) Buy getnope.in on Namecheap up to checkout

```
RUNBOOK B: Put getnope.in in the Namecheap cart and stop at checkout. Then (only after the founder has paid) set DNS records.

Apply the STANDING RULES. Do NOT enter payment details. Do NOT click "Confirm order" or "Pay". If asked to log in or create an account, STOP and ask the founder.

Part 1: cart
1. Open namecheap.com. Search for getnope.in.
2. Screenshot the result: available or not, first-year price, and the renewal price (open the price details if needed). If it is NOT available, STOP and report the 5 closest alternatives Namecheap suggests that end in .in or .com, with prices. Do not add any of them.
3. Add getnope.in to the cart for 1 year only.
4. In the cart: keep any FREE privacy or WHOIS protection if offered. REMOVE every paid add-on: premium DNS, SSL certificates, email, hosting, website builder, VPN, extra years. Do not change auto-renew; report what it is set to.
5. Click through to the checkout or payment page. STOP there.
6. Screenshot the final total, the currency, and the line items. Report: "getnope.in is in the cart for [total]. Renewal is [price]. Auto-renew is [on/off]. Please log in if needed and pay yourself."

Part 2: DNS (only after the founder says "domain paid")
7. Open Domain List, then Manage for getnope.in, then Advanced DNS.
8. Add exactly the records the founder or Claude gives you for the web host: [RECORD TYPE, HOST, VALUE, TTL]. Do not delete existing records unless told to by name.
9. Screenshot the records table and report. Do not buy anything offered on these pages.
```

### (c) Set up the Google Sheet tracker

```
RUNBOOK C: Create the "nope demand test" Google Sheet.

Apply the STANDING RULES. Do NOT share the sheet with anyone. Do NOT install add-ons, extensions or scripts. Do NOT turn on link sharing.

1. In the founder's Google Drive (already logged in), create a new Google Sheet named "nope demand test".
2. Create these tabs in this order: Daily_Ads, Signals, Summary, Gates, Interviews, Competitors, Settings.
3. In each tab, type the headers in row 1 exactly as listed in marketing/DEMAND_TEST.md section 3.4. Freeze row 1. Bold row 1.
4. Daily_Ads: put the formulas from section 3.4 in row 2 for columns I, K, M, N, O and fill them down to row 300. Format I, K, M as percentages with 1 decimal place; D, N, O as numbers with 0 decimals.
5. Signals: add dropdowns. Column D: 1 to 10. Column E: full_paid, reservation_paid, refunded, whatsapp_pay_intent, waitlist_qualified, waitlist_partial. Column J: Y, N, ?. Column L: Y, N. Column N: none, requested, paid. Column O: A, B.
6. Settings: column A names and column B values: gst_rate 0.18; cash_budget_step1 1000; lifetime_budget 840; go_cost_per_lpv 25; stop_cost_per_lpv 50; kill_hook_rate 0.15; min_spend_to_judge_ad 150; cac_target 400; cac_ceiling 600; cac_breakeven 750.
7. Summary: in A2 to A4 type A1_room_reel_v1, A5_bed_reel_v1, A4_price_reel_v1. Add columns spend, landing page views, cost per landing page view, hook rate, using SUMIFS on Daily_Ads by ad name as in section 3.4. Below, add the waitlist, paid signals, cost per verified ad payment, and total cash rows with the formulas given.
8. Gates: rows for G0, G1, G2 (columns: gate, certified_by, date, result) and for steps 0 to 3 with the single metric and go and stop thresholds from section 2.
9. Interviews and Competitors: headers only.
10. Screenshot each tab. Report the sheet's URL to the founder only (in the "Message yourself" chat or your session report). Confirm that sharing is "Restricted".
```

### (d) Daily 10 minute check

```
RUNBOOK D: Daily ads check for nope. Run once a day at about 9:00 am IST, from the day after the campaign goes live until the founder says stop. Time limit: 10 minutes.

Apply the STANDING RULES. Ads Manager is READ ONLY for you: do NOT edit, duplicate, turn on, publish, change budgets or change any setting. The only exception is step 5, and only if the founder has written "PAUSE RULE ON" in this session.

1. Open Ads Manager, the current step's campaign (dt1_rs1000 first). Date range: "Yesterday". Column preset "DT_daily". If it does not exist, create it once with these columns: Delivery, Amount spent, Impressions, Reach, Frequency, 3-second video plays, Link clicks, CTR (link click-through rate), Landing page views, Cost per landing page view, Cost per link click. Saving a column preset is allowed.
2. For each ad, add one row to the Daily_Ads tab of "nope demand test": date (yesterday), step, ad_name, spend, impressions, reach, frequency, 3-second plays, link clicks, landing page views, delivery status, review status (Active, In review, Rejected, Learning limited). Check the ad's comments on Instagram and Facebook and write any question or objection, in short, in column R. Do not reply to comments.
3. Open the waitlist form responses sheet. Count new rows since yesterday by source code (the letters after "NP-" and before W, R or F) and by NFC answer. For each new row, add a row to Signals with timestamp, order code, source code, signal level 6 (NFC answered) or 7 (fields missing), signal type, first name, city, phone model, NFC answer. Do NOT copy phone numbers.
4. Read the Summary tab: total spend, cost per landing page view per ad, hook rate per ad, qualified joins from ads and from all sources, verified paid signals from ads and from network.
5. PAUSE RULE (only if the founder wrote "PAUSE RULE ON"): you may pause ONE ad if it has spent at least 150 INR AND its hook rate is under 15% AND its cost per landing page view is above 50 INR. Never pause the last active ad. Never turn anything on. Never change budgets. Record what you paused and why.
6. Check these alarms:
   - Any ad Rejected, or any account warning.
   - Yesterday's spend above 200 INR (pacing problem), or total spend at or above 840 INR.
   - Any ad with at least 150 INR spent and hook rate under 15%.
   - Landing page views divided by link clicks under 50% on any ad with 20 or more clicks (page or tracking problem).
   - Frequency above 3. CPM above 300 INR.
   - Link clicks but zero new form rows for 2 days in a row (form may be broken).
7. Write this summary and send it to the founder's own "Message yourself" WhatsApp chat (WhatsApp Web, founder already logged in). If WhatsApp Web is not logged in, put it in your session report. Use this exact format:

   nope test, day [N] of 6 ([date])
   Spent: Rs [total] of Rs 840 (plus GST)
   Best ad: [name], Rs [cost per LPV] per page view, hook [x]%
   Others: [name] Rs [x] / hook [x]%; [name] Rs [x] / hook [x]%
   Page views total: [n]. Clicks total: [n].
   Qualified joins: [n] from ads, [n] total. NFC "No": [n]
   Paid (verified, from G2): [n] from ads, [n] from network
   Alarms: [none, or list]
   Questions people asked: [short list or none]
   Action needed from you: [none, or one line]

8. Optional, only if the founder wrote "WHATSAPP LOG ON": open WhatsApp Business Web and read new chats since your last check that contain "NP-". For each, update or add the Signals row (level 5 if they ask how to pay, 2 or 1 if they say they paid). Leave "payment_verified_by_founder" EMPTY. Do not copy phone numbers. Do not reply. Do not open any bank, UPI or gateway page.
```

### (e) Monthly competitor scan on Amazon.in and Flipkart

```
RUNBOOK E: Monthly competitor scan for NFC app blockers. Run on the 1st of each month (and once this week as a baseline).

Apply the STANDING RULES. Stay LOGGED OUT if possible. Do NOT add anything to the cart, do NOT buy, do NOT click "Buy now", do NOT write reviews, do NOT ask sellers questions, do NOT click sponsored ads on purpose (open organic listings).

1. On amazon.in and on flipkart.com, search each of these terms and look at the first 2 pages of results:
   "NFC app blocker", "phone blocker NFC", "app lock NFC tag", "digital detox device", "phone lock box", "screen time blocker", "focus device phone", "brick phone blocker".
2. Keep only listings that block apps or lock a phone (NFC tags sold as blockers, lock boxes, timer boxes, blocker devices). Ignore plain blank NFC stickers unless the listing says it blocks apps.
3. For each kept listing, open it and record in the Competitors tab of "nope demand test": date, site, search term, listing title, seller, price in Rs, star rating, number of ratings, uses NFC (Y/N/?), needs a subscription (Y/N/?), URL, screenshot file name. Take one screenshot of the title, price and rating area. Name files like 2026-12-01_amazon_01.png.
4. Also open getbrick.com (logged out) and record the price shown for India, with a screenshot. Do not start checkout.
5. Report: number of relevant listings per site, any NEW listing since last month, the cheapest and the most-rated listings, any listing priced between Rs 999 and Rs 2,999, and any listing that uses the word "nope". Attach the screenshots. This report is internal: nothing from it goes into ads (no competitor comparisons, CEO D3).
```

### (f) Post scheduling help (Meta Business Suite)

```
RUNBOOK F: Schedule approved organic posts for nope in Meta Business Suite.

Apply the STANDING RULES. Schedule ONLY posts that the founder approved in writing with the exact words "APPROVED BATCH [number]" in this session, and only the exact files and captions in that batch. Do NOT click "Boost", "Promote" or any paid option. Do NOT reply to comments or messages. Do NOT change profile, bio or account settings.

Inputs: a batch list with, for each post: file name, caption text (paste exactly), first comment (optional), platforms (Instagram, Facebook), date and time in IST. Claude confirms in the batch list that every caption was checked against the Verified Claims List.

1. Open Meta Business Suite, Planner. Confirm the account shown is nope. If not, STOP.
2. For each post in the approved batch: Create post or Create reel. Upload the file. Paste the caption exactly, including line breaks. Select the platforms listed. Choose "Schedule" with the listed date and time.
3. Before the final "Schedule" click on the FIRST post of each batch, screenshot the preview and STOP for the founder to reply "OK". After "OK", schedule the rest of that batch without stopping, as long as each matches the list exactly.
4. If Business Suite suggests boosting or turning a post into an ad, decline.
5. Screenshot the Planner calendar after scheduling and report the list of scheduled posts with dates.
```

Stickers, felt pads and the print order are already covered by CEO D12 and the COO's carts (Instinct carts, MD pays); no separate marketing runbook is needed.

---

## 7. Daily schedule, Days 0 to 14

Day 0 = Mon 9 Nov 2026. Founder minutes are marketing tasks only; G0, G1 and G2 sessions are in CRITICAL_PATH.md.

| Day | Date | Founder (minutes) | Claude | Instinct |
|---|---|---|---|---|
| 0 | Mon 9 Nov | Say "go", give name, city, WhatsApp Business number (15). Pay domain (5). Start Meta account logins (20). Read employment contract (CEO D14, CRITICAL_PATH). | Page spec to creative head; ad copy; DM, status and form texts; quick replies | Sheet (c); domain to cart (b); Meta setup click-through up to each login or payment screen |
| 1 | Tue 10 Nov | Finish Meta logins and payment method (25). WhatsApp Business (15). Send interview recruitment message (10). | Interview screener form; shot list for the G0 session | Competitor scan (e), baseline |
| 2 | Wed 11 Nov | **G0 session** (CTO protocol). Film demo and 3 ad clips in the same session, founder photo (40). | Check all copy against `docs/CLAIMS_VERIFIED.md` once published | Hosting and DNS (b part 2) once page files exist |
| 3 | Thu 12 Nov | G0 verdict. Approve page facts (15), QA with a test join (10). **Step 0 live:** post demo, status, 10 DMs (30). Interview 1 (30). | Reply drafts; log Step 0 joins | Schedule organic posts for the week (f) |
| 4 | Fri 13 Nov | Interview 2 (30). **If G0 passed:** review campaign screenshots, check spending limit, Publish (15). If not: do not publish; CTO retest by Sat 14 Nov. | Pre-launch check against section 4 | Build campaign to review screen (a) |
| 5 | Sat 14 Nov | Ads start. WhatsApp joiners (10). Interview (30). | | Confirm ads Active |
| 6 | Sun 15 Nov | **Step 0 read (a)**: qualified joins (10). WhatsApp (10). Interview (30). | Step 0 (a) verdict with numbers | Daily check (d) |
| 7 | Mon 16 Nov | **G1 session** (CPO). WhatsApp (10). Read summary (2). | Mid-test note: any ad clearly dead on hook rate? | Daily check; pause rule only if opted in |
| 8 | Tue 17 Nov | WhatsApp (10). Interview (30). | Interview notes into the sheet; reservation message text checked by CLO | Daily check |
| 9 | Wed 18 Nov | **G2 earliest.** If G2 passes: WhatsApp the reservation offer to qualified joiners, network first, then ad-sourced (30). Interview (30). | | Daily check |
| 10 | Thu 19 Nov | WhatsApp, confirm payments, mark column L (15). Last day of Step 1 delivery. | Draft Step 1 analysis | Daily check |
| 11 | Fri 20 Nov | **G4 read** with Claude and CEO (20): Step 0 (b) payments, Step 1 cost per page view. **MD yes or no for Step 2.** | Verdicts, Step 2 plan or fix plan, 2 new hooks and hero B reel script | Final Step 1 check and totals |
| 12 | Sat 21 Nov | If Step 2 is a yes: film 2 new first-3-second clips and the study and work reel (30). Approve reservation mode (5). | Interview synthesis (VALIDATION_SCRIPT.md section 8); page switch to reservation mode | Build Step 2 campaign to review (a, with names `dt2_rs4000`, lifetime about Rs 3,390 over 8 days) |
| 13 | Sun 22 Nov | Review and **Publish Step 2** (15). WhatsApp (10). | | |
| 14 | Mon 23 Nov | 14-day review with Claude (15). Pilot pucks start shipping if prints arrived (COO). | 14-day report: what we know, what we do not, next gate | Daily check (Step 2 day 1) |

Step 2 runs to about Mon 30 Nov and Step 3 to about mid December, outside this table.

---

## 8. Decision tree (GO, FIX, STOP)

```
WED 11 to THU 12 NOV: G0. Lock and unlock on 3 phones of 3 brands, bare sticker?
|-- 3 of 3 ............................... GO   -> Publish the hook test Fri 13 Nov.
|-- 2 of 3 or restricted settings slow ... FIX  -> No publish. CTO fixes, retest by Sat 14 Nov. Step 0 continues.
`-- 1 or fewer ........................... STOP -> Freeze all marketing and money pages (K1). Engineering only.

SUN 15 NOV: STEP 0 read (a). Qualified waitlist joins?
|-- 30 or more ........................... GO   -> Continue.
|-- 10 to 29 ............................. FIX  -> Fix the top objection on the page; continue.
`-- under 10, few forwards, and interviews show the demo is unclear or the permission is refused
                                       ... STOP -> Pause ads before more money goes in. 5 "what would make it a yes" calls. New demo or offer.

MON 16 to WED 18 NOV: G1 and G2. Printed puck reads on 5 phones; business account, payment link, contract read, terms live?
|-- All pass ............................. Offer the Rs 199 reservation to qualified joiners by WhatsApp.
`-- Any missing .......................... Keep the waitlist. No money asked. (Ads are not paused for this; CEO D6.)

FRI 20 NOV: G4 read.
First: page views / link clicks under 50%? -> BROKEN PAGE OR TRACKING (K7). Fix, rerun. Read nothing else.
Step 1, best ad cost per landing page view (ads with Rs 150+ spent):
|-- Rs 25 or less (Rs 20 per click) ...... GO
|-- Rs 25 to 50 (Rs 20 to 40 per click) .. FIX  -> New first 3 seconds, tested free as organic, rerun Rs 1,000 once.
`-- over Rs 50 on all, or hook under 15% on all
                                       ... STOP -> New creative, not more money (K6).
Step 0 (b), paid reservations from outside close family (G2 open 2+ days):
|-- 3 or more ............................ GO
|-- 1 or 2 ............................... FIX
`-- 0 .................................... STOP for Step 2; try "pay in full only" (CEO D9) and talk to joiners.
=> Ask the MD for Step 2 only if Step 1 is GO (or FIX with a better hook) AND Step 0 (b) is GO or FIX.

ABOUT MON 30 NOV: STEP 2 read (Rs 4,000, needs 200+ landing page views).
Paid reservations + full orders with an ad code:
|-- 8 or more ............................ GO   -> Step 3, read with the pilot buyers' first week.
|-- 2 to 7 ............................... FIX  -> One change (trust block / chat-first / hook). One more round max. Watch K11.
`-- 0 or 1 ............................... STOP -> Stop paid ads (K8). Organic and network only. Talk to 10 non-payers.

ABOUT MID DECEMBER: STEP 3 read (Rs 10,000) plus pilot guardrails.
Cost per full paid order from ads:
|-- Rs 600 or less AND pilot passes ...... GO   -> Make the rest of the founding 50. GTM.md Tier 1.
|-- Rs 601 to 2,000, or pilot borderline . FIX  -> Improve creative, page or product. Do not raise spend. Above Rs 850 for 7 days: pause (K10).
|-- Rs 2,000 or more ..................... STOP -> Stop ads (K9). Refund reservations you will not fulfil.
`-- Ads pass, pilot fails ................ STOP ADS, FIX PRODUCT first.
```

---

## 9. The 5 mistakes that would waste the Rs 1,000

1. **Publishing before G0, or sending traffic to a broken page.** If the tap does not work on 3 phones, the ads sell something that does not exist yet. And the current page still has a placeholder WhatsApp number, a placeholder UPI ID and a "placeholder brand name" footer [D]. Test a real join from someone else's phone before Publish.
2. **Asking for money too early, or the wrong way.** No payment wording in Step 1, no money before G2, and never a personal UPI ID (CEO D1, D6). Getting this wrong risks a flagged bank account and a broken promise, which costs more than Rs 1,000.
3. **Pressing "Boost post" or choosing the Engagement objective.** It buys likes and views, not visits to the waitlist. Use one Traffic campaign with landing page views, built from the checklist.
4. **Testing too many things at once, or tinkering.** Three prices, five angles, several ad sets on Rs 847 of real budget gives every variant almost nothing. One ad set, three ads, one price, one hero. No edits in the first 72 hours, and no page changes during the 6 days.
5. **Reading the result as a verdict, or polluting it with friends.** "0 sales, demand is dead" and "2 sales, let's manufacture" are both wrong at this sample size (section 1.2). Do not ask your network to click or share the ads, and never count network joins or payments as ad results.

Also watch: GST on ads (Rs 1,000 cash is about Rs 847 of delivery [U]), Meta's automatic creative "enhancements" adding claims outside the list, and any render or faked screen in place of the real tap.

---

## 10. Ready-to-send texts for Step 0 (Claude drafted, founder sends; CLO to check before use)

**WhatsApp status and Instagram caption (with the demo clip):**
"I've been building this for a few months. It's called nope. Tap your phone on the puck and the apps you chose lock. To unlock, you tap it again, so I leave mine in the kitchen. Android with NFC. Rs 1,999 once, no subscription. I'm making the first 50 by hand. Join the list here: [link]. Or reply NOPE and I'll keep you posted."

**DM (to 10 people, not close family):**
"Hi [name], quick one: I made a small thing called nope. 15 second video here [link]. It's for anyone who opens a feed 'for a minute'. Honest question: would this be useful to you, or to someone you know? If yes, you can join the list for the first 50 at the link. If no, I'd love to hear why, that helps more."

**Quick reply `/join` (before G2):**
"Thanks for joining! Quick check so you don't waste money later: open Settings and search NFC. Does it show up? Which phone is it? I'll message you when the first 50 open, with the date they ship. Nothing to pay now."

**Message after G2 (to qualified joiners, CLO-checked wording, payment link from the business account):**
"Hi [name], the founding batch of nope is open. You can hold one of the 50 for Rs 199: [payment link]. It counts towards the Rs 1,999 price, and you can get it back any time before shipping, within 3 working days, no forms, no argument. Your code is [NP-...]; please send the payment screenshot here with it. Ships by [date set after G1]."

**Waitlist form (if you use a Google Form instead of the page):** first name; city; WhatsApp number; phone brand and model; "Does your phone show NFC in Settings? Yes / No / Not sure".
