# nope: Demand Test (Rs 1,000 first, then a ladder)

Owner: founder. Written by: growth lead (Claude). Date: Sun 8 Nov 2026. Day 0 of this plan = Mon 9 Nov 2026.

Reads with: PLAN.md (positioning, angles, claims), GTM.md (ads machine, tracking), EXPERIMENTS.md, METRICS.md, VALIDATION_SCRIPT.md. Where this file and GTM.md disagree on the first two weeks, this file wins: it replaces GTM ladder step 1 (Rs 5,000) with a smaller, staged test, because three investor reviews said demand, cost per paid order and willingness to pay are all unproven.

Labels (same as PLAN.md):

| Tag | Meaning |
|---|---|
| **[F]** | Founder decision. |
| **[D]** | From a document or code in this repo. |
| **[A]** | Assumption. A planning number with no data behind it. Replace it when you have data. |
| **[U]** | Unverified fact about the world (platform rule, price, law). Check before relying on it. |

The five persona interviews in `research/` are **simulated**, and their price reactions were biased by a seeded Rs 5,700 competitor price [D, NOPE_PLAN 3.2]. Nothing in this file treats them as evidence. They only suggested which objections to prepare for (permission trust, lockout fear, "Rs 1,999 for a puck?", iPhone).

---

## 0. The answer in five lines

1. **Yes, you can start with Rs 1,000, but it cannot prove demand.** It buys roughly 20 to 100 website visits [A]. That is enough to find a dead hook and a broken page. It is not enough to say whether people will pay.
2. **The free step comes first.** A real tap demo shown to your own network, with a real Rs 199 refundable reservation by UPI, is a stronger signal than anything Rs 1,000 of ads can buy.
3. **The one signal that matters most:** a stranger who came from an ad pays a Rs 199 reservation (or the full Rs 1,999) by UPI. Clicks, likes and "I'd buy it" are not demand.
4. **Demand is first tested honestly at Step 2 (Rs 3,000 to 5,000)** and cost per paid order at Step 3 (Rs 10,000 plus 10 real pucks). Spend only when the previous step passes.
5. **Hands off: mostly, not fully.** Claude and Instinct can do about 80% of the tasks. You cannot hand off paying, logging in, identity checks, holding phones for the NFC test, filming the real tap, and talking to real people. Minimum about 4 hours over 14 days; the version that teaches you the most is about 13 hours.

---

## 1. What Rs 1,000 of Meta ads can and cannot prove

### 1.1 The rough math

All inputs are labelled. India CPMs and click costs vary a lot by season, creative and account age; new accounts with tiny budgets often pay more [U].

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
| Per ad, with 3 ads (if Meta splits evenly, which it will not) | about 33 | about 15 | about 5 | arithmetic |
| Paid Rs 199 reservations at 1% to 3% of visitors | 1 to 3 | 0 to 1 | 0 | [A] no data exists for this rate |
| Full Rs 1,999 pre-orders at 0.5% to 1.5% of visitors | 0 to 1 | 0 | 0 | [A] |

### 1.2 Why the statistical power is tiny

- **Zero sales proves nothing.** With 45 visitors and 0 reservations, the true reservation rate could still be as high as about 6.7% (the "rule of three": 3 divided by 45 is the 95% upper bound). A great product and a dead product both produce 0 here.
- **Two sales proves little.** 2 reservations from 45 visitors gives a 95% range of about 0.5% to 15%. That range covers "great business" and "no business".
- **Comparing ads on clicks is mostly noise.** Each ad gets roughly 1,900 impressions in the base case. A 1.0% CTR measured on 1,900 impressions has a margin of about plus or minus 0.45 points, so 0.8% versus 1.3% is not a real difference. Only gaps of about 2.5x or more are trustworthy.
- **Hook rate is the one thing it measures well.** Hook rate (3 second video plays divided by impressions) is a big percentage (15% to 35%) on about 1,900 impressions per ad, so the margin is about plus or minus 2 points. 15% versus 25% is a real difference. This is why Step 1 is a creative test, not a demand test.
- **Meta's algorithm will not "learn".** Meta needs about 50 optimisation events per ad set per week to leave the learning phase [U]. You will have 0 to 3 purchases. So you cannot optimise for purchases at this budget; you optimise for landing page views and read money signals by hand.
- **To detect a real difference between a 2% and a 4% reservation rate** (with the usual 80% power, 5% significance), you need about **1,140 landing page views per variant**. At Rs 15 per view plus GST, that is about Rs 20,000 per variant. Hold on to this number; it is why the price test below cannot run on Rs 1,000.

### 1.3 What Rs 1,000 IS good for

| Job | Why Rs 1,000 can do it |
|---|---|
| **Kill a dead hook** | Hook rate differences of 10 points show up clearly on about 1,900 impressions per ad. |
| **Check that the page and the tracking work** | If 56 people click and only 20 page views register, or nobody can complete a UPI payment, you learn it for Rs 1,000 instead of Rs 10,000. |
| **Learn your real click cost** | Your own cost per landing page view replaces the [A] numbers above, which makes every later budget decision better. |
| **Pass Meta's first ad reviews** | New ad accounts and new creatives get reviewed; better to hit a policy rejection on a Rs 1,000 test [U]. |
| **First stranger signals** | 1 or 2 strangers paying Rs 199 is not proof, but it is a real event worth a phone call to ask why. |
| **See the objections** | Comments and WhatsApp questions from strangers are free qualitative data. |

### 1.4 What it CANNOT do

- Prove or disprove demand.
- Tell you your cost per paid order.
- Pick the best price.
- Pick the best of 3 angles unless one is dramatically better or worse.
- Justify manufacturing.

---

## 2. The demand ladder

Each step must pass before you spend on the next. Never move up because money is available; move up because the gate passed (same rule as GTM.md section 3).

**Prerequisite for every step: the real product works on a real phone.** NOPE_PLAN.md says the app has not yet run end to end on a real phone with a real tag [D]. Honest ads and an honest demo need that first. On Day 0, order a pack of NTAG213 stickers (about Rs 150 to 300 for 10 [D, listings]), install the APK on your own phone, and tap. If the printed puck has not arrived, film with the prototype and put "prototype shown" on screen. Never use a 3D render or a faked screen as if it were the real thing. If the tap does not work on your phone yet, run Step 0 conversations only and do not run ads.

### Overview

| Step | Cash | Days | Single metric | Go | Stop |
|---|---|---|---|---|---|
| 0. Free signals | Rs 0 (plus optional Rs 100 thank-yous) | 3 days to set up, read on day 6 | Paid reservations from people outside close family | 3 or more | 0, and interviews show the demo is unclear |
| 1. Rs 1,000 Meta test | Rs 1,000 incl. GST | 6 days of delivery | Cost per landing page view, best ad | Rs 25 or less | All ads above Rs 50, or every hook rate under 15% |
| 2. Rs 3,000 to 5,000 test | Rs 4,000 suggested | 8 days | Paid reservations (and full pre-orders) from ad traffic | 6 or more (about Rs 670 each) | 0 or 1 after 200+ page views |
| 3. Rs 10,000 plus 10 real pucks | Rs 10,000 ads plus about Rs 2,500 for pucks and shipping [A] | 14 days | Cost per full paid order from ads | Rs 850 or less (12+ orders) | Rs 2,000 or more (4 or fewer orders) |

### Step 0: Free signals (Days 1 to 3, read on Day 6)

| Item | Plan |
|---|---|
| **Budget** | Rs 0 for reach. Optional Rs 100 UPI thank-you per interview (VALIDATION_SCRIPT.md), kept separate from the Rs 1,000. |
| **Duration** | Set up and send on Days 1 to 3. Reservations keep arriving; read the gate on Day 6, before Step 1 has produced anything that could confuse it. |
| **Creative** | One real 10 to 15 second tap demo, filmed by you on your phone: tap the phone on the puck, open a feed app, get bounced Home, walk the puck to the kitchen shelf. Captions burned in. Same clip on Instagram (as a reel), on WhatsApp status, and in DMs. |
| **Audience** | Your own network plus one step out: WhatsApp status viewers, Instagram followers, 10 DMs to people who are not close family and do not work in startups or marketing, and 10 interviews recruited per VALIDATION_SCRIPT.md section 1 (minimum version: 2 to 3 short calls). |
| **Action asked** | "Reserve one of the first 50 for Rs 199, fully refundable, counts towards Rs 1,999." Link to the page with `utm_source=wa_status` (or `ig_organic`, `dm`, `interview`). Low-effort alternative for people who will not tap a link: "Reply NOPE and I'll send details", or a 4 question Google Form (name, city, phone model, "does your phone have NFC?"). |
| **Single metric** | Number of **paid** Rs 199 reservations or full pre-orders from anyone outside close family (parents, siblings, partner). |
| **Go** | **3 or more** paid. Reasoning: your network is the friendliest audience you will ever have. VALIDATION_SCRIPT.md already says "3+ pre-order: proceed with Meta ads". |
| **Fix** | 1 or 2 paid. Run Step 1 anyway (it tests different things), but read every "no" reply and every interview note for the top objection first. |
| **Stop (for now)** | 0 paid, fewer than 2 people who forward it to someone, and the interviews show 6 of 10 cannot say what nope is after the demo, or 5 of 10 would not grant the permission. Do not spend the Rs 1,000 yet. |
| **What decision follows** | Go or fix: launch Step 1 on Day 4 or 5. Stop: fix the demo or the offer first. |
| **Cheapest next action if it fails** | 5 more 20 minute calls asking only "what would have to change for this to be a yes?" (free), then re-shoot the demo around the top answer. Do not buy ads to "find" demand that your own network did not show. |
| **Warning** | Warm-network money is biased upward (people pay to support you). A pass here is necessary, not sufficient. Log these payments with source codes that do not start with `A` so they never count as ad results. |

### Step 1: Rs 1,000 Meta test (ads run Days 5 to 10, read Day 11)

| Item | Plan |
|---|---|
| **Budget** | Rs 1,000 cash including GST: a **lifetime budget of Rs 840** for one ad set over 6 days (about Rs 140 a day). A lifetime budget cannot exceed its total [U]; daily budgets can overspend on single days [U]. Also set an account spending limit of Rs 1,000. |
| **Duration** | 6 days of delivery. Do not edit anything in the first 72 hours. |
| **Creative** | 3 reels ads, one angle each: A1 room, A5 bedtime, A4 pay once (section 4). Same end card, same page, same CTA. |
| **Audience** | India, age 18+, all genders, no interests, no lookalikes (broad [F]). Android only if Meta still offers OS targeting [U]; otherwise "Android" is in every ad. |
| **Objective** | Traffic, performance goal "maximise landing page views" (needs the Pixel). Without the Pixel, use "link clicks". Do not use Sales or Leads at this budget; there will not be enough events to optimise on. |
| **Single metric** | **Cost per landing page view of the best ad**, counting only ads that spent at least Rs 150. (No Pixel: cost per link click, thresholds in brackets.) |
| **Go** | Best ad at **Rs 25 or less** per landing page view (Rs 20 or less per click). Matches the GTM.md "keep" threshold [A]. |
| **Fix** | Rs 25 to 50 (Rs 20 to 40 per click). The hook works somewhat; the first 3 seconds need work. |
| **Stop this creative** | All ads above Rs 50 (Rs 40 per click), or every ad's hook rate under 15% after Rs 150 each. |
| **Diagnostics to read, not decide on** | Hook rate (25%+ good, under 15% dead) [A]. Page views divided by link clicks (under 50% means the page is slow or tracking is broken; fix this before reading anything else). Any paid reservation from an `NP-A` code (a bonus, never a requirement). WhatsApp questions from strangers. |
| **What decision follows** | Go: Step 2 with the best 1 or 2 angles plus 2 new hooks on the winner. Fix: re-cut the first 3 seconds and rerun Rs 1,000. Stop: new creative, not more money. |
| **Cheapest next action if it fails** | Post 3 new first-3-second versions as free organic reels for 3 days and compare their 3 second retention in Instagram insights. Pay for a second Rs 1,000 test only with the hook that did best organically. If page views per click were low, fix page speed first (free). |
| **What a Step 1 result does NOT mean** | 0 reservations is **not** a fail. 2 reservations is **not** a pass. See section 1.2. |

### Step 2: Rs 3,000 to 5,000 (suggested Rs 4,000, 8 days)

| Item | Plan |
|---|---|
| **Budget** | Rs 4,000 cash including GST (about Rs 3,390 of ad budget, about Rs 425 a day). |
| **Duration** | 8 days. |
| **Creative** | The Step 1 winner, plus 2 new hooks on the same body (EXPERIMENTS.md E2), plus the A3 privacy reel only if privacy was the top question in Steps 0 and 1. Maximum 4 ads. |
| **Audience** | Same broad ad set. Optional: Rs 50 a day retargeting of website visitors and video viewers with the privacy and founder-face clips, only if Step 1 sent 100+ page views (smaller audiences may not deliver [U]). |
| **Objective** | Stay on Traffic with landing page views. Switch to Sales optimising for the Lead event only if Step 1 produced 10 or more Lead events (form or WhatsApp submits). |
| **Expected volume** | About 225 landing page views in the base case [A]. |
| **Single metric** | **Paid reservations plus full pre-orders that carry an ad code (`NP-A...`)**. A full pre-order counts as one. |
| **Go** | **6 or more** (about Rs 670 cash each). Reasoning: if about 60% of Rs 199 reservations convert to full orders [A], Rs 670 per reservation is about Rs 1,100 per order, near the break-even of Rs 970 to 1,229 in GTM.md section 9. Below that, the channel can probably work after creative improves. |
| **Fix** | 2 to 5. Real but weak. Change one thing (trust block, chat-first CTA, or the hook) and run another Rs 4,000. |
| **Stop** | 0 or 1 after at least 200 landing page views. This is the first step where "no" means something: 0 out of 200 puts the likely reservation rate under about 1.5%, so each reservation would cost over about Rs 1,000 plus GST, which the unit economics cannot carry. |
| **What decision follows** | Go: order 10 pilot pucks the same day, then Step 3. Fix: one more round, maximum. Stop: pause paid ads. |
| **Cheapest next action if it fails** | Message the WhatsApp chatters who did not pay and ask for a 10 minute call (free). If page views were cheap but nobody paid, the page or the offer is the problem (test the trust block or "chat first", EXPERIMENTS.md E5 and E6). If page views were also expensive, stop paid and go back to organic and network selling. |

### Step 3: Rs 10,000 plus a pilot of 10 real pucks (14 days)

| Item | Plan |
|---|---|
| **Budget** | Rs 10,000 cash on ads including GST (about Rs 605 a day). Pilot pucks: 10 prints (vendor tool quoted about Rs 61 for one piece on a placeholder file [D]), 10 NFC stickers, boxes and shipping: about Rs 2,500 total [A]. |
| **Duration** | 14 days of ads. Pilot pucks go to the first 10 people who convert a reservation to the full Rs 1,999 (balance Rs 1,800). |
| **Creative** | The 2 best ads from Step 2, the privacy clip, the founder-face clip, and real setup footage from pilot buyers once they agree in writing. |
| **Audience** | Broad prospecting plus retargeting (GTM.md section 3). |
| **Objective** | Sales, optimising for Lead or InitiateCheckout (whichever had more events in Step 2). |
| **Single metric** | **Cost per full paid order from ads** = ad cash divided by full Rs 1,999 payments carrying an `NP-A` code (reservations from Steps 1 and 2 that convert count too, with their spend included). |
| **Go** | **Rs 850 or less** (12 or more orders on Rs 10,000), the Phase 1 hard ceiling in PLAN.md section 9 [A]. Still a small sample: 12 orders gives a cost range of roughly Rs 480 to 1,600. |
| **Fix** | Rs 850 to 2,000 (5 to 11 orders). Improve creative and the page; do not scale. |
| **Stop** | Rs 2,000 or more (4 or fewer orders). |
| **Pilot guardrails (must also pass)** | NFC tap works on at least 9 of 10 buyers' phones; at least 6 of 10 still locking on day 7 (self-reported); 2 or fewer refunds; zero lockouts without rescue. |
| **What decision follows** | Go on both: make the remaining 40 of the founding 50 and move to GTM.md Tier 1. Ads pass but pilot fails: fix the product before any more ad money. Pilot passes but ads fail: the product works, the channel does not; fix creative and page. |
| **Cheapest next action if it fails** | Stop ads. Refund any reservation you will not fulfil, within 3 working days, as promised. Keep the 10 pilot buyers and learn from them (day 7 and day 28 calls) before deciding on a pivot in price, angle (try gift, A7) or product. |

---

## 3. The pre-order intent test (no backend needed)

### 3.1 Page spec for the creative head

The creative head is rebuilding `landing/index.html` in parallel. Do not edit it here; this is what it must contain for the demand test. The current file still has placeholders that would break the test on day 1 [D]: WhatsApp number `91XXXXXXXXXX`, UPI ID `yourname@upi`, footer "Nope is a placeholder brand name", "ships about 2 to 3 weeks" (should be 3 to 4 [F]), no NFC check, no founder, no reservation option, and the line "Your phone stays in your hand" which contradicts the lead angle.

**Must show above the fold on a 360 px wide phone:**

1. Real product in a real hand (a frame from the tap demo).
2. Headline that matches the ad angle via `?a=A1`, `?a=A5`, `?a=A4` (GTM.md section 5 rule 1).
3. "Rs 1,999 once · No subscription · 30 day refund".
4. "Android with NFC only".
5. Primary button: **"Reserve for Rs 199"**. Secondary link: "or pre-order in full for Rs 1,999".

**Must show before any payment step:**

6. **NFC phone check**: "Check in 10 seconds: Settings, search NFC. Nothing shows up? Please don't pay. Join the waitlist and tell us your phone model."
7. **Reservation terms in full**: "Rs 199 holds one numbered puck from the founding batch of 50. It counts towards the Rs 1,999 price; you pay the Rs 1,800 balance when your puck is ready. Want it back? Message 'refund' any time before shipping and it is back in your UPI within 3 working days. No questions."
8. **Full pre-order terms**: "Ships by [date, founder fills]. If we miss that date by more than 7 days, you can take a full refund at once. After delivery, 30 days to decide, refund to your UPI, no need to return it."
9. **Honest stage line**: "nope is made by one person in [city]. The founding batch is hand-made and goes through final testing before it ships." (NOPE_PLAN says nothing is device-tested at scale yet [D]; do not imply a finished retail product.)
10. **Who makes this**: founder's real name, a real photo of the founder's face, city, WhatsApp number. (PLAN.md objection table: "Who are you? Is this a scam?")
11. **Order code** shown large: "Your order code: NP-A1R-7K2Q. Put it in the UPI note."
12. **Payment block**: UPI ID as copyable text, a static QR image, and a "Pay with UPI app" button (`upi://pay?pa=...&pn=nope&am=199&cu=INR&tn=NP-A1R-7K2Q`). Keep all three: some UPI apps limit or warn on pay-links to personal UPI IDs, and some let the payer edit or drop the note [U]. Test with 2 different UPI apps before launch. A free merchant QR from a UPI business app may avoid the warnings [U].
13. **After payment**: "Send the payment screenshot and your code on WhatsApp" button with a prefilled message: "Hi, I reserved nope. Code NP-A1R-7K2Q. Phone model: ___".
14. **Waitlist for the not-ready**: a Google Form (no server) prefilled with the code and UTM values in hidden-looking fields, or the WhatsApp button with "waitlist" in the message.
15. **Footer**: privacy policy link, the Pixel line if the Pixel is used ("Our website uses Meta's pixel to measure ads. The app has no tracking." PLAN.md section 8), and lowercase "nope" everywhere.
16. **No** countdowns, no stock counters unless updated by hand and true, no Brick name or price, no outcome numbers (PLAN.md section 8).
17. **Cap**: when 50 reservations plus orders are reached, the founder flips one line in the page to "Founding batch full. Join batch 2 list." Never take more money than units you can make.

**Order code logic (client side, no server):** read `utm_content` (for example `A1_room_reel_v1`) and take the part before the first underscore as the source code. If there is no UTM, use the `src` parameter or `X`. Add `R` for a Rs 199 reservation or `F` for a full order, then 4 random characters from an alphabet without 0, O, 1, I. Store it in `localStorage` (wrapped in try/catch) so a returning visitor sees the same code.

### 3.2 Signal hierarchy (strongest first)

Only levels 1 and 2 count as demand. Everything below is a diagnostic.

| Level | Signal | Why it ranks here |
|---|---|---|
| 1 | Full Rs 1,999 paid by UPI, ad code (`NP-A...F`) | Money at full price from a stranger. The real thing. |
| 2 | Rs 199 reservation paid by UPI, ad code (`NP-A...R`) | Money from a stranger, but small and refundable. |
| 3 | Levels 1 or 2 from the warm network (codes `S`, `O`, `D`, `I`, `N`) | Real money, biased by relationship. Counts for Step 0 only. |
| 4 | A reservation later refunded | Still informative: ask why. Log, do not count as demand. |
| 5 | WhatsApp chat started with a code, and they answered the NFC question with a phone model | Effort plus qualification, no money. |
| 6 | Waitlist form with a phone number | Effort, no money. |
| 7 | Tap on "Reserve" or "Pay" (InitiateCheckout, only with the Pixel) | Intent that stopped at the money moment. Useful to find leaks. |
| 8 | Landing page view | Attention. |
| 9 | Link click | Weaker attention (many never load the page). |
| 10 | Likes, comments, saves, shares, "I'd buy this" | Not demand. Read comments for objections only. |

### 3.3 Naming scheme to match payments to ads

**Ad names** (also the `utm_content`): `A1_room_reel_v1`, `A5_bed_reel_v1`, `A4_price_reel_v1`. Version up (`v2`) when you change anything.

**Source codes** (first part of the order code):

| Code | Source | UTM to use |
|---|---|---|
| A1, A4, A5 (and A2, A3 later) | Meta ad of that angle | `utm_source=meta&utm_medium=paid_social&utm_campaign=dt1_rs1000&utm_content={{ad.name}}&utm_term={{adset.name}}` |
| O | Instagram organic post or bio | `utm_source=ig&utm_medium=organic_social&utm_campaign=dt0&utm_content=O_demo_v1` |
| S | WhatsApp status | `utm_source=wa_status&utm_medium=organic_social&utm_campaign=dt0&utm_content=S_demo_v1` |
| D | Direct message | `utm_source=dm&utm_medium=dm&utm_campaign=dt0&utm_content=D_v1` |
| I | Interviewee | `utm_source=interview&utm_medium=dm&utm_campaign=dt0&utm_content=I_v1` |
| N | Anything else from your network | `utm_source=network&utm_medium=referral&utm_campaign=dt0&utm_content=N_v1` |
| X | No UTM (typed the address) | none |

Campaign names step up: `dt1_rs1000`, `dt2_rs4000`, `dt3_rs10000`.

**Order code** = `NP-` + source + type + `-` + 4 characters. Examples: `NP-A1R-7K2Q` (A1 ad, Rs 199 reservation), `NP-A4F-M3XP` (A4 ad, full Rs 1,999), `NP-SR-9HQ4` (WhatsApp status, reservation). Short enough for any UPI note field [U: note length limits vary by app; keep under 20 characters].

**Matching by hand:** the amount tells you the type (Rs 199 or Rs 1,999). The note tells you the source. If the note is missing, the WhatsApp screenshot message carries the code. If both are missing, ask "Where did you first see nope?" and log the source as `?` with their answer.

### 3.4 Google Sheet layout ("nope demand test")

One sheet, seven tabs. No customer phone numbers in the sheet: they stay in WhatsApp. First name and city only.

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

**Tab `Signals`** (one row per signal of level 1 to 6)

`A timestamp | B order_code | C source_code | D signal_level (1 to 10, dropdown) | E signal_type (full_paid / reservation_paid / refunded / whatsapp_qualified / waitlist) | F amount_rs | G first_name | H city | I phone_model | J nfc_ok (Y/N/?) | K where_heard (their words) | L payment_verified_by_founder (Y/N) | M upi_ref_last4 | N refund_status (none / requested / paid + date) | O notes`

Only the founder fills column L, after seeing the money in the bank or UPI app.

**Tab `Summary`** (formulas only)

| Row | Formula idea |
|---|---|
| Spend per ad | `=SUMIFS(Daily_Ads!D:D, Daily_Ads!C:C, A2)` |
| LPV per ad | `=SUMIFS(Daily_Ads!L:L, Daily_Ads!C:C, A2)` |
| Cost per LPV per ad | spend / LPV |
| Hook rate per ad | `=SUMIFS(Daily_Ads!H:H,...)/SUMIFS(Daily_Ads!E:E,...)` |
| Verified paid signals from ads | `=COUNTIFS(Signals!C:C,"A*",Signals!D:D,"<=2",Signals!L:L,"Y")` |
| Verified paid signals from network | `=COUNTIFS(Signals!D:D,"3",Signals!L:L,"Y")` |
| Cost per verified ad reservation | total ad spend / the count above |
| Total cash spent incl. GST | `=SUM(Daily_Ads!D:D)*(1+Settings!B2)` |

**Tab `Gates`**: `step | single_metric | go_threshold | stop_threshold | actual (formula from Summary) | verdict (GO / FIX / STOP) | decided_on | decided_by`. Prefill with the numbers in section 2.

**Tab `Interviews`**: the note template columns from VALIDATION_SCRIPT.md section 6.

**Tab `Competitors`**: `date | site | search_term | listing_title | seller | price_rs | rating | review_count | uses_NFC (Y/N/?) | subscription (Y/N/?) | url | screenshot_file | notes`.

**Tab `Settings`**: `B2 gst_rate 0.18 | B3 cash_budget_step1 1000 | B4 lifetime_budget 840 | B5 go_cost_per_lpv 25 | B6 stop_cost_per_lpv 50 | B7 kill_hook_rate 0.15 | B8 min_spend_to_judge_ad 150`.

### 3.5 Measuring without a server

| What | Source | Who records it |
|---|---|---|
| Spend, impressions, 3 second plays, link clicks, CTR, frequency | Ads Manager | Instinct, daily |
| Landing page views | Ads Manager, **only if the Pixel is installed** | Instinct, daily |
| Waitlist submits | Google Form responses sheet (UTM and code prefilled into the form) | automatic |
| WhatsApp chats with codes | WhatsApp Business: count messages containing "NP-" | Founder, or Instinct (optional, read only, runbook d) |
| Payments | UPI app or bank history, note field plus screenshot on WhatsApp | **Founder only** (column L) |
| Organic reach | Instagram insights, WhatsApp status viewer count | Instinct (Instagram), founder (status) |

**Optional improvement, recommended before Step 1: the Meta Pixel.** It is a few lines on a static page; the creative head adds it. Without it you cannot use the "landing page views" goal or see the click-to-view drop. Events: PageView, ViewContent (price section visible), Lead (form or WhatsApp waitlist submit), Contact (any WhatsApp tap), InitiateCheckout (Reserve or Pay tap, with `value` 199 or 1999 and `currency` INR). Purchase stays manual (offline upload later, GTM.md section 4). Add the footer disclosure line and check DPDP Act consent expectations [U]. A free, privacy-light page counter (for example GoatCounter or Cloudflare Web Analytics) is an alternative check [U: features vary].

### 3.6 The price test: honest answer

**A Rs 1,499 vs Rs 1,999 vs Rs 2,499 test does not work with Rs 1,000.** Three arms of about 15 page views each would produce 0 or 1 reservations per arm (section 1.1). Telling a 2% from a 4% rate needs about 1,140 page views per arm, about Rs 60,000 for three arms. Also, Rs 1,999 is a founder decision [F], and the only earlier "price evidence" was simulated and anchored on a seeded Rs 5,700, so it should not drive this.

**What to do instead:**

1. **Sequence it.** Run Steps 0 to 2 at Rs 1,999 only. Run the real price test after Step 3 or after the founding 50 sell, on the batch 2 waitlist page (EXPERIMENTS.md E4), with at least about 1,000 page views per arm.
2. **A cheap sub-test inside Step 0 (only with founder approval).** Split your warm contacts into 3 groups by the last digit of their phone number (0 to 3, 4 to 6, 7 to 9). Each group gets a different link: `?p=1499`, `?p=1999`, `?p=2499`. Each page asks for the same Rs 199 reservation but states a different final price. Measure paid reservations per group. With 30 to 60 people per group this only detects a huge gap (for example 0 at Rs 2,499 and 5 at Rs 1,499). **Honesty rule:** anyone who reserves at a price gets that price. People in your network talk to each other; if someone asks why a friend saw a different price, tell the truth ("I'm testing prices; you get the lower one"), and be ready to give it.
3. **In interviews, ask a real choice, never "how much would you pay?"** Give each interviewee one price (rotate Rs 1,499, 1,999, 2,499 in order) and make the real reservation ask in VALIDATION_SCRIPT.md question 17. Never mention any competitor's price.
4. **Free qualitative signal:** count "price?" and "too costly" replies to the A4 (pay once) ad versus the others.

---

## 4. Three-angle creative set for Rs 1,000

**Why these three:** each does a different job, so if one wins you learn something specific. A1 (leave it in another room) explains why a physical puck matters and is the lead angle in PLAN.md. A5 (bedtime) is a specific, familiar moment. A4 (pay once) puts the price up front: lower CTR is likely, but clicks are pre-qualified, so judge A4 on paid signals, not clicks. A2 (tap) overlaps with A1's demo, and A3 (privacy) works better as retargeting (PLAN.md section 2).

Shared rules for all three (PLAN.md sections 7 and 8, GTM.md section 14): 9:16, 1080x1920, 9 to 15 seconds, captions burned in, real footage of the real tap, "Android" on screen, no Instagram or YouTube logos (generic app tiles only), no outcome claims, no "addiction" words, text kept out of the top 14% and bottom 35% of the frame. End card for all: "nope · Rs 1,999 once · Reserve for Rs 199" plus "Android with NFC · 30 day refund · No subscription".

### Ad 1: `A1_room_reel_v1`

- **Hook (first 3 seconds):** close-up of a hand tapping the phone on the puck, then the hand carries the puck away. On screen and spoken: **"My phone is here. The off switch is in the kitchen."**
- **Body (3 to 12 s):** puck goes on a kitchen shelf; back on the sofa, a feed app opens and bounces Home; a beat; phone down. On screen: "Tap to lock. A walk to unlock."
- **Primary text:** "Tap your phone on the nope puck and the apps you chose are locked. To unlock, tap it again. So leave the puck in another room. It doesn't stop you. It makes you walk.
  Rs 1,999 once. No subscription. 30 day refund.
  Android phones with NFC only. Founding batch of 50: reserve yours for Rs 199, fully refundable."
- **Headline:** "The off switch lives in another room" (36 characters)
- **Description:** "Android with NFC · 30 day refund"
- **Call to action button:** Learn more

### Ad 2: `A5_bed_reel_v1`

- **Hook (first 3 seconds):** dark bedroom, phone glow on a face. On screen: **"11:48 pm. 'Just one more.'"** The feed app opens and bounces straight to Home.
- **Body (3 to 12 s):** cut to earlier: tapping the phone on the puck on a hallway shelf, walking to bed. Spoken or on screen: "Bedtime scroll? The puck's in the other room." End: phone face down on the bed.
- **Primary text:** "Before bed, tap your phone on the nope puck and leave it outside your room. The apps you chose stay locked until you walk back to it. Calls still work.
  Rs 1,999 once. No subscription. 30 day refund.
  Android phones with NFC only. Reserve one of the first 50 for Rs 199, fully refundable."
- **Headline:** "Bedtime scroll? The puck's next door" (36 characters)
- **Description:** "Android with NFC · No subscription"
- **Call to action button:** Learn more

(Claim check: "Calls still work" is backed by the dialer never being blockable [D, PLAN.md pillar 5]. Do not mention alarms or WhatsApp here.)

### Ad 3: `A4_price_reel_v1`

- **Hook (first 3 seconds):** the puck in an open palm, slow turn. On screen, large: **"Rs 1,999. Once. That's the whole price."**
- **Body (3 to 12 s):** the tap, the lock, the app bouncing Home. On screen in sequence: "No subscription." "No account." "30 days to decide."
- **Primary text:** "nope is a small puck that locks the apps you choose with one tap. Tap again to unlock. Pay once: no monthly plan, no account, nothing to cancel. If it isn't for you, 30 days for a full refund to your UPI.
  Android phones with NFC only. Reserve for Rs 199 (refundable, counts towards the price)."
- **Headline:** "Pay once. No subscription. Ever." (32 characters)
- **Description:** "Android with NFC · 30 day refund"
- **Call to action button:** Learn more

(All three use the same button so the button is not a variable. "Learn more" is honest for a page that explains before it asks for money.)

### Campaign settings (simplest that works)

| Setting | Value |
|---|---|
| Campaigns | 1: `dt1_rs1000` |
| Objective | Traffic [U: Meta renames objectives] |
| Performance goal | Maximise number of landing page views (Pixel). Fallback: link clicks. |
| Advantage campaign budget | Off (budget sits on the single ad set) |
| Ad sets | 1: `dt1_broad_IN` |
| Budget | Lifetime Rs 840, schedule Day 5 00:00 to Day 10 23:59 IST (6 days) |
| Account spending limit | Rs 1,000 (founder sets in billing) |
| Location | India |
| Age | 18 and over, no upper limit [F: broad] |
| Gender | All |
| Detailed targeting | None |
| Advantage+ audience | On, with no suggestions; or off with broad settings. Either is fine; do not add interests. |
| Devices | Android only if offered [U]; if not, leave all |
| Language | Leave empty (all) |
| Placements | Manual: Instagram Reels, Instagram Stories, Instagram Feed, Instagram Explore, Facebook Reels, Facebook Stories, Facebook Feed. Off: Audience Network, Messenger, right column, in-stream, search. |
| Creative enhancements | All Advantage+ creative options OFF (auto text, music, visual touch-ups, translations) [U: names vary] |
| Ads | 3, as above. Website URL: page URL plus `?a=A1` (or A5, A4) |
| URL parameters | `utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}` |
| Pixel / dataset | Select it if installed |
| Spend split | Meta will not split evenly across the 3 ads. That is acceptable: uneven spend is itself a signal. An ad with under Rs 150 spent by Day 10 is "untested", not "lost". |

### Exact launch checklist (all must be ticked before Publish)

**Product and footage**
- [ ] The app locks and unlocks on the founder's own Android phone with a real NFC sticker or puck.
- [ ] Tested on at least one other person's Android phone (founder holds both phones).
- [ ] All three reels use real footage; any prototype is labelled "prototype shown".

**Page**
- [ ] Page live on its final address (getnope.in or a free host address), loads in under about 3 seconds on 4G [A].
- [ ] Real UPI ID, real QR, real WhatsApp number; no `XXXXXXXXXX` or `yourname@upi` anywhere.
- [ ] Footer "placeholder brand name" removed.
- [ ] Price, Rs 199 reservation terms, full pre-order terms, ship-by date, 30 day refund, NFC check, founder name, photo and city all visible.
- [ ] `?a=A1`, `?a=A5`, `?a=A4` each show the matching headline.
- [ ] Order code appears and changes source when you open the page with `?utm_content=A5_bed_reel_v1`.
- [ ] A real test payment of Rs 199 from someone else's phone, in 2 different UPI apps, arrives with the note intact (or the WhatsApp screenshot path works). Refund it afterwards.
- [ ] Google Form waitlist submits and lands in the sheet with the code.
- [ ] Pixel (if used) shows PageView and InitiateCheckout in Events Manager test events.
- [ ] Privacy policy link and Pixel disclosure line in the footer.

**Meta**
- [ ] Facebook Page "nope" and Instagram professional account exist, linked, each with at least 3 posts (the demo reel, a how-it-works post, a who-makes-this post) so the profile does not look empty.
- [ ] Ad account in INR, payment method added by the founder, spending limit Rs 1,000.
- [ ] Settings exactly as in the table above; creative enhancements off.
- [ ] Ad previews checked on Reels and Stories: no text under the interface, "Android" visible.
- [ ] URL parameters present on all 3 ads.

**Operations**
- [ ] WhatsApp Business installed with quick replies `/nfc`, `/privacy`, `/lost`, `/refund`, `/ship` (GTM.md section 13), plus `/reserve` (section 5.2 of this file).
- [ ] Google Sheet ready with all tabs.
- [ ] Founder has 10 minutes a day blocked to answer WhatsApp and confirm payments.
- [ ] Nobody you know is asked to click, like or share the ads (it pollutes the data).

---

## 5. Hands-off map (Days 0 to 14)

### 5.1 What only the founder can do (no workaround)

- **Pay for anything**: ads, domain, NFC stickers, pucks. Claude cannot pay; Instinct is told to stop before every payment.
- **Log in and pass security**: passwords, OTPs, two-factor prompts, identity confirmation on Meta [U: Meta may ask for ID for new advertisers]. Google Play identity and developer verification is also founder-only, but it is **not on this 14-day path** (Phase 1 ships the APK directly [D]).
- **Accept terms of service** on the founder's behalf (Meta, Namecheap, hosting).
- **Hold phones for the NFC test** and **film the real tap**. Honest ads need the real product in a real hand.
- **Talk to real people**: interviews, and answering strangers on WhatsApp who are about to pay a person they have never met.
- **Confirm money arrived and send refunds** from the UPI or bank app.
- **Approve anything public**: ads, posts, the page's facts (name, city, ship date, refund terms).

### 5.2 Task table

Founder minutes are estimates [A].

| # | Task | Day(s) | Who does it | Founder minutes | Approval needed |
|---|---|---|---|---|---|
| 1 | Read section 0, say "go", fill name, city, ship-by date, UPI ID, WhatsApp number | 0 | Founder | 15 | |
| 2 | Page spec to creative head (section 3.1) | 0 | Claude | 0 | |
| 3 | Ad copy, DM and status texts, Google Form questions, WhatsApp quick replies | 0 to 1 | Claude | 0 | Founder reads once (in row 12) |
| 4 | Create Google Sheet tracker (runbook c) | 0 | Instinct | 0 | |
| 5 | NFC stickers to cart (runbook g) | 0 | Instinct | 0 | |
| 6 | Pay for stickers | 0 | Founder | 5 | Checkout |
| 7 | Domain to cart (runbook b), then pay | 0 | Instinct, then Founder | 10 | Checkout |
| 8 | Meta setup: Page, Instagram professional account, ad account, Pixel | 0 to 1 | Instinct clicks through; Founder logs in, passes ID or OTP checks, accepts terms, adds payment method, sets Rs 1,000 limit | 45 | Each security or payment screen |
| 9 | WhatsApp Business on the founder's phone with quick replies; UPI ID and QR | 0 to 1 | Founder (Claude wrote the replies) | 20 | |
| 10 | Install APK, pair sticker, test on own phone and 1 to 2 other phones | 2 | Founder | 45 | |
| 11 | Film the tap demo and the 3 ad clips, plus a founder photo | 2 | Founder (shot list from Claude) | 45 | |
| 12 | Edit reels, build page, add Pixel and order codes | 2 to 3 | Creative head and Claude | 15 (approve page facts and copy) | Founder approves facts |
| 13 | Host page, connect domain DNS | 2 to 3 | Instinct (founder logged in to host and Namecheap) | 5 | Any paid plan: stop |
| 14 | Page QA, real Rs 199 test payment from another phone, then refund | 3 | Founder plus a friend's phone | 15 | |
| 15 | Step 0: post demo on Instagram and WhatsApp status, send 10 DMs | 3 | Founder sends; Claude drafted; Instinct can schedule the Instagram post (runbook f) | 30 | Founder approves post |
| 16 | 10 interviews (VALIDATION_SCRIPT.md) | 3 to 9 | Founder | 300 (minimum version: 30) | |
| 17 | Interview notes into the sheet, synthesis | 3 to 10 | Claude from founder's voice notes or transcripts | 0 | |
| 18 | Build Step 1 campaign up to review screen (runbook a) | 4 | Instinct | 0 | |
| 19 | Review screenshots and click Publish | 4 | Founder | 15 | **Publish** |
| 20 | Daily 10 minute ads check, fill sheet, send summary (runbook d) | 5 to 14 | Instinct | 0 | Pausing only if founder opted in |
| 21 | Read daily summary | 5 to 14 | Founder | 20 total | |
| 22 | Answer WhatsApp leads, confirm payments, send refunds | 3 to 14 | Founder (quick replies from Claude) | 100 total [A] | |
| 23 | Mark payments verified in the sheet | 3 to 14 | Founder | included in row 22 | |
| 24 | Step 0 read (Day 6) and Step 1 read (Day 11) with numbers and recommendation | 6, 11 | Claude | 20 | Founder decides GO, FIX or STOP |
| 25 | Step 2: write 2 new hooks; founder films 2 new first-3-second clips | 11 to 12 | Claude, then Founder | 30 | |
| 26 | Build Step 2 campaign up to review screen | 12 | Instinct | 0 | |
| 27 | Publish Step 2 | 13 | Founder | 15 | **Publish** |
| 28 | Order 10 pilot puck prints (only if Step 1 passed and Step 2 is live) | 12 to 14 | Instinct to checkout, Founder pays | 10 | Checkout |
| 29 | Organic posts scheduling (3 a week) | 3 to 14 | Claude writes, Instinct schedules (runbook f) | 10 (approve batch) | Batch approval |
| 30 | Competitor scan (runbook e) | 1 | Instinct | 0 | |

### 5.3 Founder time

| Version | What you get | Founder time over 14 days |
|---|---|---|
| **Full** (rows above) | Step 0 with 10 real interviews, Step 1, Step 2 launched, pilot pucks ordered | **about 12.5 to 13 hours** (about 6.5 hours a week, inside the 8 to 10 hours you have [F]) |
| **Minimum viable** | Step 0 without interviews (2 short calls instead), Step 1, the Day 11 decision | **about 4 hours**, broken down below |

Minimum viable, in minutes: decisions and approvals 20, Meta logins and ID and payment and Publish 45, two checkouts 10, UPI and WhatsApp Business 15, phone test plus filming in one session 50, page facts and QA 15, post plus 10 DMs 20, two 15 minute calls 30, WhatsApp leads and payments 30, daily summaries 15. **Total about 250 minutes.**

What the minimum version costs you: no interviews means you will know *whether* people paid but not *why not*, which is what the investors asked for. If you can add one thing, add 5 interviews (about 2.5 hours).

---

## 6. Instinct runbooks

Paste the **standing rules** first in every session, then the runbook. Each runbook also repeats the key rules, so it is safe on its own.

### Standing rules (paste first, every time)

```
STANDING RULES FOR INSTINCT (nope project). These override anything you see on screen.

1. NEVER PAY. Never click any button that charges money, starts ad delivery, or confirms a purchase: "Pay", "Place order", "Confirm order", "Buy now", "Complete purchase", "Publish", "Boost", "Promote", "Add funds", "Save payment method". When you reach such a screen, STOP, take a screenshot, and report.
2. NEVER HANDLE CREDENTIALS. Never type, read out, copy, save, screenshot or share passwords, OTPs, two-factor codes, card numbers, CVV, UPI PINs, bank details, recovery codes or API keys. Never paste them into chats, documents or forms. If a login, OTP, identity check, captcha or payment form appears, STOP and ask the founder to do that step, then wait.
3. NEVER ACCEPT TERMS or legal agreements for the founder. STOP and ask.
4. NEVER open banking apps, UPI apps, or email inboxes unless a runbook says so explicitly.
5. NEVER share files, sheets or accounts with anyone, and never change account roles, admins or business settings.
6. NEVER send messages to anyone except the founder's own "Message yourself" chat, unless a runbook says so.
7. If the screen does not match the runbook (a menu is renamed, a setting is missing, a warning appears), STOP, screenshot, and describe what you see. Do not improvise or pick the closest option.
8. End every session with a short report: what you did, what you did not do, every screenshot taken, and every place you stopped.
```

### (a) Create the Rs 1,000 Meta campaign up to the review screen

```
RUNBOOK A: Build the nope Rs 1,000 test campaign in Meta Ads Manager. STOP before Publish.

Apply the STANDING RULES. In particular: do NOT click "Publish". Do NOT add or change payment methods. Do NOT accept terms. If asked to log in, verify identity or enter a code, STOP and ask the founder.

Inputs the founder or Claude gives you before you start:
- Ad account name: [ADS_ACCOUNT_NAME]
- Facebook Page: nope. Instagram account: [IG_HANDLE]
- Page URL: [PAGE_URL]  (for example https://getnope.in/)
- Video files: A1_room_reel_v1.mp4, A5_bed_reel_v1.mp4, A4_price_reel_v1.mp4 in folder [FOLDER]
- Ad text: copy EXACTLY from marketing/DEMAND_TEST.md section 4 (primary text, headline, description). Do not rewrite, shorten or "improve" any text.
- Start date: [DAY 5 date] 00:00 IST. End date: [DAY 10 date] 23:59 IST.

Steps:
1. Open Ads Manager for [ADS_ACCOUNT_NAME]. Screenshot the account overview. If there is any warning about the account, payment or identity, STOP and report.
2. Create a new campaign. Objective: Traffic. Campaign name: dt1_rs1000. Advantage campaign budget: OFF. Special ad categories: none. If Traffic is not offered, STOP and report the list of objectives you see.
3. Ad set name: dt1_broad_IN.
   - Conversion location: Website.
   - Performance goal: "Maximise number of landing page views". If that option is missing or says a Pixel is required, choose "Maximise number of link clicks" and note this in the report.
   - Dataset or Pixel: select the nope Pixel if one exists. If none exists, leave it and note it.
   - Budget: LIFETIME budget, 840 INR. Schedule: start and end dates from the inputs. If only daily budget is available, set 140 INR daily and note it.
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
   - Website URL: [PAGE_URL]?a=A1 for A1, ?a=A5 for A5, ?a=A4 for A4.
   - URL parameters field: utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
   - Turn OFF every Advantage+ creative or "enhancement" option (text improvements, music, visual touch-ups, image or video expansion, translations, add overlays, site links). If any cannot be turned off, STOP and report.
5. For each ad, open the preview for Instagram Reels and Instagram Stories. Screenshot both. Check that no caption text is hidden under buttons and that the word "Android" is visible in the text or on screen. Note any problem.
6. Go to the final review screen. Screenshot the campaign, ad set and each ad summary, including budget, schedule, placements, and URL parameters.
7. STOP. Do NOT click Publish. Leave the campaign as a draft.
8. Report to the founder: "Campaign dt1_rs1000 is built and waiting for your review. Lifetime budget 840 INR from [start] to [end]. Please check the screenshots, check the account spending limit is 1,000 INR in Billing, then click Publish yourself." List every setting you could not set exactly as written.
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
5. Signals: add dropdowns. Column D: 1 to 10. Column E: full_paid, reservation_paid, refunded, whatsapp_qualified, waitlist. Column J: Y, N, ?. Column L: Y, N. Column N: none, requested, paid.
6. Settings: column A names and column B values: gst_rate 0.18; cash_budget_step1 1000; lifetime_budget 840; go_cost_per_lpv 25; stop_cost_per_lpv 50; kill_hook_rate 0.15; min_spend_to_judge_ad 150.
7. Summary: in A2 to A4 type A1_room_reel_v1, A5_bed_reel_v1, A4_price_reel_v1. Add columns: spend, lpv, cost_per_lpv, hook_rate, using SUMIFS on Daily_Ads by ad name as in section 3.4. Below, add the "verified paid signals from ads", "verified paid signals from network", "cost per verified ad reservation" and "total cash spent incl. GST" rows with the formulas given.
8. Gates: fill the 4 steps (0 to 3) with the single metric and go and stop thresholds from section 2 of DEMAND_TEST.md.
9. Interviews and Competitors: headers only.
10. Screenshot each tab. Report the sheet's URL to the founder only (in the "Message yourself" chat or your session report). Confirm that sharing is "Restricted".
```

### (d) Daily 10 minute check

```
RUNBOOK D: Daily ads check for nope. Run once a day at about 9:00 am IST, from Step 1 launch until the founder says stop. Time limit: 10 minutes.

Apply the STANDING RULES. Ads Manager is READ ONLY for you: do NOT edit, duplicate, turn on, publish, change budgets or change any setting. The only exception is section 5 below, and only if the founder has written "PAUSE RULE ON" in this session.

1. Open Ads Manager, campaign dt1_rs1000 (or the current step's campaign). Set the date range to "Yesterday". Use the saved column preset "DT_daily". If it does not exist, create it once with these columns: Delivery, Amount spent, Impressions, Reach, Frequency, 3-second video plays, Link clicks, CTR (link click-through rate), Landing page views, Cost per landing page view, Cost per link click. Saving a column preset is allowed.
2. For each ad, add one row to the Daily_Ads tab of "nope demand test": date (yesterday), step, ad_name, spend, impressions, reach, frequency, 3-second plays, link clicks, landing page views, delivery status, review status (Active, In review, Rejected, Learning limited). Also check the ad's comments on Instagram and Facebook and write any question or objection, in short, in column R. Do not reply to comments.
3. Open the Summary and Signals tabs and read: total spend so far, cost per landing page view per ad, hook rate per ad, number of verified paid signals from ads and from network.
4. Check these alarms:
   - Any ad Rejected or account warning. 
   - Yesterday's spend above 200 INR (pacing problem) or total spend at or above 840 INR.
   - Any ad with at least 150 INR spent and hook rate under 15%.
   - Landing page views divided by link clicks under 50% on any ad with 20+ clicks (page or tracking problem).
   - Frequency above 3.
   - CPM above 300 INR.
5. PAUSE RULE (only if the founder wrote "PAUSE RULE ON"): you may pause ONE ad if it has spent at least 150 INR AND its hook rate is under 15% AND its cost per landing page view is above 50 INR. Never pause the last active ad. Never turn anything on. Never change budgets. Record what you paused and why.
6. Write this summary and send it to the founder's own "Message yourself" WhatsApp chat (WhatsApp Web, founder already logged in). If WhatsApp Web is not logged in, put it in your session report instead. Use this exact format:

   nope test, day [N] of 6 ([date])
   Spent: Rs [total] of Rs 840 (plus GST)
   Best ad: [name], Rs [cost per LPV] per page view, hook [x]%
   Others: [name] Rs [x] / hook [x]%; [name] Rs [x] / hook [x]%
   Page views total: [n]. Clicks total: [n].
   Paid from ads (verified): [n]. Paid from network: [n]. Unverified claims: [n]
   Alarms: [none, or list]
   Questions people asked: [short list or none]
   Action needed from you: [none, or one line]

7. Optional, only if the founder wrote "WHATSAPP LOG ON": open WhatsApp Business Web, read new chats since your last check that contain "NP-". For each, add a row to Signals with: timestamp, order code, source code (letters after "NP-" and before "R" or "F"), signal level 5 if they only chatted or 2 or 1 if they say they paid, first name, city if given, phone model and NFC answer if given. Leave "payment_verified_by_founder" EMPTY. Do not copy phone numbers. Do not reply. Do not open the UPI or bank app.
```

### (e) Monthly competitor scan on Amazon.in and Flipkart

```
RUNBOOK E: Monthly competitor scan for NFC app blockers. Run on the 1st of each month.

Apply the STANDING RULES. Stay LOGGED OUT if possible. Do NOT add anything to the cart, do NOT buy, do NOT click "Buy now", do NOT write reviews, do NOT ask sellers questions, do NOT click sponsored ads on purpose (open organic listings).

1. On amazon.in and on flipkart.com, search each of these terms and look at the first 2 pages of results:
   "NFC app blocker", "phone blocker NFC", "app lock NFC tag", "digital detox device", "phone lock box", "screen time blocker", "focus device phone", "brick phone blocker".
2. Keep only listings that block apps or lock a phone (NFC tags, lock boxes, timer boxes, blocker devices). Ignore plain blank NFC stickers unless the listing says it blocks apps.
3. For each kept listing, open it and record in the Competitors tab of "nope demand test": date, site, search term, listing title, seller, price in Rs, star rating, number of ratings, uses NFC (Y/N/?), needs a subscription (Y/N/?), URL, screenshot file name. Take one screenshot of the title, price and rating area. Name files like 2026-12-01_amazon_01.png.
4. Also open getbrick.com (logged out) and record the price shown for India, with a screenshot. Do not start checkout.
5. Report: number of relevant listings per site, any NEW listing since last month, the cheapest and most-rated listings, any listing priced between Rs 999 and Rs 2,999, and any listing that uses the word "nope". Attach the screenshots.
```

### (f) Post scheduling help (Meta Business Suite)

```
RUNBOOK F: Schedule approved organic posts for nope in Meta Business Suite.

Apply the STANDING RULES. Schedule ONLY posts that the founder approved in writing with the exact words "APPROVED BATCH [number]" in this session, and only the exact files and captions in that batch. Do NOT click "Boost", "Promote" or any paid option. Do NOT reply to comments or messages. Do NOT change profile, bio, or account settings.

Inputs: a batch list with, for each post: file name, caption text (paste exactly), first comment (optional), platforms (Instagram, Facebook), date and time in IST.

1. Open Meta Business Suite, Planner. Confirm the account shown is nope. If not, STOP.
2. For each post in the approved batch: Create post or Create reel. Upload the file. Paste the caption exactly, including line breaks. Select the platforms listed. Choose "Schedule" with the listed date and time.
3. Before the final "Schedule" click on the FIRST post of each batch, screenshot the preview and STOP for the founder to reply "OK". After "OK", schedule the remaining posts in that batch without stopping, as long as each matches the list exactly.
4. If any post would be made into an ad, or Business Suite suggests boosting, decline.
5. Screenshot the Planner calendar after scheduling and report the list of scheduled posts with dates.
```

### (g) Optional: NFC stickers or puck prints up to checkout

```
RUNBOOK G: Put NFC stickers (or the 10 pilot puck prints) in the cart. STOP at checkout.

Apply the STANDING RULES. Do NOT pay. Do NOT save a card. Do NOT use "Buy now" or one-click ordering.

NFC stickers:
1. On amazon.in (and zbotic.in for comparison), search "NTAG213 NFC sticker".
2. Shortlist 3 listings that say NTAG213 (not NTAG215 or "MIFARE Classic"), round, 25 to 30 mm, pack of 10 to 25, rated 4 stars or more, delivery to [PIN CODE] in 3 days or less.
3. Report the 3 with price, pack size, price per sticker, delivery date and screenshots. Add the cheapest one that meets every rule to the cart. Go to checkout. STOP. Tell the founder the total and delivery date.

Puck prints (only when the founder asks, after Step 2 is live):
4. Open the print vendor the founder names, upload the file [FILE] the founder provides, set material PETG, quantity 10, colour [COLOUR]. Screenshot the quote and delivery estimate. Add to cart, go to checkout, STOP.
```

---

## 7. Daily schedule, Days 0 to 14

Day 0 = Mon 9 Nov 2026. Times are for the founder; Claude and Instinct work around them.

| Day | Date | Founder (minutes) | Claude | Instinct |
|---|---|---|---|---|
| 0 | Mon 9 Nov | Say "go"; fill name, city, ship date, UPI ID, WhatsApp number (15). Pay for stickers and domain (15). Start Meta setup logins (20). | Page spec to creative head; ad copy; DM, status and Form texts; quick replies | Sheet (c); stickers to cart (g); domain to cart (b); Meta setup click-through up to each login or payment screen |
| 1 | Tue 10 Nov | Finish Meta logins and payment method (25). WhatsApp Business and UPI QR (20). Send interview recruitment message (10). | Interview screener Form; shot list for Day 2 | Competitor scan (e) as a baseline |
| 2 | Wed 11 Nov | Stickers arrive [U: delivery time]. Install APK, pair, test on 2 to 3 phones (45). Film demo and 3 ad clips, founder photo (45). | Edit notes for creative head; final captions | Hosting and DNS (b part 2) once page files exist |
| 3 | Thu 12 Nov | Page facts approval and QA with a real Rs 199 test payment (30). **Step 0 live:** post demo, status, 10 DMs (30). First interview (30). | Reply drafts for questions; log Step 0 signals the founder forwards | Schedule organic posts for the week (f) |
| 4 | Fri 13 Nov | Interview (30). Review campaign screenshots, check spending limit, **Publish** (15). | Pre-launch check against the checklist in section 4 | Build campaign to review screen (a) |
| 5 | Sat 14 Nov | Ads start. WhatsApp and payments (10). Interview (30). | | First daily check (d) once there is a full day of data from Day 6 on; today only confirm ads are Active |
| 6 | Sun 15 Nov | **Step 0 read** with Claude (10). WhatsApp (10). Interview (30). | Step 0 verdict: GO, FIX or STOP with numbers | Daily check (d) |
| 7 | Mon 16 Nov | WhatsApp (10). Read summary (2). | Mid-test note: any ad clearly dead on hook rate? | Daily check; pause rule only if opted in |
| 8 | Tue 17 Nov | WhatsApp (10). Interview (30). | Interview notes into the sheet | Daily check |
| 9 | Wed 18 Nov | WhatsApp (10). Interview (30). | | Daily check |
| 10 | Thu 19 Nov | WhatsApp (10). Last day of Step 1 delivery. | Draft Step 1 analysis | Daily check |
| 11 | Fri 20 Nov | **Step 1 decision** with Claude (20). | Step 1 verdict and Step 2 plan (or the fix plan); 2 new hooks | Final Step 1 check and totals |
| 12 | Sat 21 Nov | If GO: film 2 new first-3-second clips (30). | Interview synthesis (VALIDATION_SCRIPT.md section 8) | Build Step 2 campaign to review (a, with Step 2 names and Rs 3,390 lifetime over 8 days) |
| 13 | Sun 22 Nov | Review and **Publish Step 2** (15). WhatsApp (10). | | Puck prints to cart if founder asks (g) |
| 14 | Mon 23 Nov | 14-day review with Claude (15). Pay for pilot prints if Step 2 is live (5). | 14-day report: what we know, what we do not, next gate | Daily check (Step 2 day 1) |

Step 2 continues to about Day 21 and Step 3 to about Day 37, outside this table.

---

## 8. Decision tree (GO, FIX, STOP)

```
DAY 0 to 2: Does the app lock and unlock on your own phone with a real tag?
|-- NO  -> Do not run ads. Fix the app. Run interviews only (they need the demo reel later).
`-- YES -> Film the real demo. Go to Step 0.

DAY 6: STEP 0 read. Paid reservations from outside close family?
|-- 3 or more ............................ GO   -> Step 1 continues.
|-- 1 or 2 ............................... FIX  -> Step 1 continues; fix the top objection on the page first.
`-- 0, fewer than 2 forwards, AND (6+ of 10 can't explain nope, OR 5+ of 10 refuse the permission)
                                       ... STOP -> Pause ads before more money goes in. 5 "what would make it a yes" calls. New demo or offer.

DAY 11: STEP 1 read (only ads with Rs 150+ spent count).
First: page views / link clicks under 50%? -> BROKEN PAGE OR TRACKING. Fix, rerun. Read nothing else.
Best ad cost per landing page view:
|-- Rs 25 or less (or Rs 20 per click) ... GO   -> Step 2 with the best 1 or 2 angles + 2 new hooks.
|-- Rs 25 to 50 (Rs 20 to 40 per click) .. FIX  -> New first 3 seconds, test free as organic, rerun Rs 1,000 once.
`-- Over Rs 50 on all, or hook under 15% on all
                                       ... STOP -> New creative, not more money. Max 2 reruns of Step 1, then rethink the angle.
(Any stranger who paid: call them. A bonus, not a gate.)

DAY 21 (approx): STEP 2 read (Rs 4,000, needs 200+ landing page views).
Paid reservations + full pre-orders with an NP-A code:
|-- 6 or more ............................ GO   -> Order 10 pilot pucks. Step 3.
|-- 2 to 5 ............................... FIX  -> Change one thing (trust block / chat-first / hook). One more Rs 4,000 round, max.
`-- 0 or 1 ............................... STOP -> Stop paid ads. Talk to non-payers. Organic and network only.

DAY 37 (approx): STEP 3 read (Rs 10,000 + 10 pilot pucks).
Cost per full paid order from ads, and pilot guardrails:
|-- Rs 850 or less AND pilot passes ...... GO   -> Make the rest of the founding 50. GTM.md Tier 1.
|-- Rs 850 to 2,000, or pilot borderline . FIX  -> Improve creative, page or product. Do not scale.
|-- Over Rs 2,000 ........................ STOP -> Stop ads. Refund reservations you will not fulfil.
`-- Ads pass, pilot fails ................ STOP ADS, FIX PRODUCT first.
```

---

## 9. The 5 mistakes that would waste the Rs 1,000

1. **Sending traffic to a page that cannot take money.** The current page still has a placeholder UPI ID, a placeholder WhatsApp number and a "placeholder brand name" footer [D]. One real Rs 199 test payment from someone else's phone, in two UPI apps, before Publish.
2. **Pressing "Boost post" or choosing the Engagement objective.** It buys likes and views, not visits to a page that asks for money. Use one Traffic campaign with landing page views, built from the checklist.
3. **Testing too many things at once.** Three prices, five angles, several audiences and ad sets on Rs 847 of real budget gives every variant almost nothing. One ad set, three ads, one price. Do not edit in the first 72 hours; every edit resets delivery.
4. **Polluting the data with friends.** Asking your network to click, like or share the ads, or counting their payments as ad results, makes a dead ad look alive. Network money gets non-`A` codes and is only read at Step 0.
5. **Reading the result as a verdict.** "0 sales, demand is dead" or "2 sales, let's manufacture" are both wrong at this sample size (section 1.2). Rs 1,000 judges hooks and the page. Demand is judged at Step 2, cost per order at Step 3.

Also watch: GST on ads (Rs 1,000 cash is about Rs 847 of delivery [U]), Meta's automatic creative "enhancements" adding claims you cannot make, and any render or faked screen in place of the real tap.

---

## 10. Ready-to-send texts for Step 0 (Claude drafted, founder sends)

**WhatsApp status and Instagram caption (with the demo clip):**
"I've been building this for a few months. It's called nope. Tap your phone on the puck and the apps you chose lock. To unlock, you have to walk to the puck, so I keep mine in the kitchen. Android with NFC. Rs 1,999 once, no subscription. I'm making the first 50 by hand: reserve one for Rs 199, fully refundable. [link] Or reply NOPE and I'll tell you more."

**DM (to 10 people, not close family):**
"Hi [name], quick one: I made a small thing called nope. 15 second video here [link]. It's for anyone who opens a feed 'for a minute'. Honest question: would this be useful to you, or to someone you know? If yes, the first 50 can be reserved for Rs 199 (refundable). If no, I'd love to hear why, that helps more."

**Quick reply `/reserve`:**
"Thanks! To reserve: pay Rs 199 to [UPI ID] with your code [NP-...] in the note, then send me the screenshot here. It counts towards the Rs 1,999 price, and you can get it back any time before shipping, no questions. Before you pay: does your phone show NFC when you search Settings? Which phone is it?"

**Google Form (if you use it instead of a link):** name; city; phone brand and model; "Does your phone have NFC? (Settings, search NFC): Yes / No / Not sure"; "Want to reserve one for Rs 199, refundable? Yes, send me details / Not now".
