# nope: Go-to-Market (Meta first, broad India audience)

Labels as in PLAN.md: **[F]** founder, **[D]** repo document or code, **[A]** my assumption, **[U]** unverified, check before relying on it. Today is Sunday 8 Nov 2026. Week 1 starts Monday 9 Nov.

Founder time: 8 to 10 hours a week [F]. The creative head (agent a7b8f6e1482ae1b12) owns visuals and the website; the founder owns footage, selling on WhatsApp, ads management and customers.

---

## 1. Channel mix and why

| Channel | Role | Share of effort [A] | Why this channel |
|---|---|---|---|
| **Meta ads (Instagram + Facebook) to the website** | Primary acquisition [F] | 40% of founder hours, 80%+ of cash | Broad targeting lets Meta find buyers without us picking a segment. Reels placements suit a product that is best understood in a 10 second demo. We can test angles cheaply. |
| **Organic Instagram (@nope account)** | Proof, retargeting fuel, comment-section trust | 25% | Every ad click visits the profile. An empty profile kills trust. Organic reels are also free creative tests. |
| **WhatsApp (Business app)** | Closing and support | 20% | The site's waitlist already opens WhatsApp [D]. Indian buyers paying an unknown brand by UPI want a human to ask "is this real?". Phase 1 closes on chat. |
| **Founder network + LinkedIn founder post** | First 5 to 10 orders, early testimonials | 5% | Free, fast, and gives you real users to film before strangers arrive. |
| **Creators (seeded, not paid at first)** | Social proof and partnership ads later | 5% | Real people using it beats any studio shot. |
| **Referrals** | Cheap second wave from week 5 | 5% | Every buyer knows other scrollers. |
| **Optional small tests** | Reddit and X founder posts, one co-working or study library poster | only if the above are on track | Cheap learning, not core. |

Dropped by founder direction [F]: segment channels such as hostels, coaching centres and student clubs as main routes. Keep at most one as an optional experiment (EXPERIMENTS.md E10).

---

## 2. Week by week: now to 50, then to 500

### Phase 1: first 50 paid orders (weeks 1 to 8)

| Week | Dates | Founder does (about 9 h) | Creative head delivers | Exit check |
|---|---|---|---|---|
| **1** | 9 to 15 Nov | 10 real interviews (VALIDATION_SCRIPT.md). Make the 5 decisions in SUMMARY.md. Set up Meta Business: Facebook Page, Instagram professional account, ad account, payment method, Pixel, domain verification [U]. Install WhatsApp Business with quick replies (section 13). **Start the Play closed testing track now** (12 testers for 14 days is required for personal accounts [D, U]) so buyers get the app by delivery. Film 2 hours of raw footage from the shot list (section 12). | Site v2 with Pixel events, NFC check and order code (sections 4 and 5). Round 1 ads (section 12). | Site live, Pixel firing (test in Events Manager), 5 ads approved. |
| **2** | 16 to 22 Nov | Launch Tier 0 test: 1 campaign, Rs 450/day, 5 ads. Open paid pre-orders with a ship-by date. Reply to every WhatsApp lead within 2 hours in your free windows. 3 organic reels. Warm network message to 30 people. | Organic templates, highlight covers | First pre-orders paid. Cost per landing page view and cost per lead known per angle. |
| **3** | 23 to 29 Nov | Day 4 read: kill the bottom 2 ads. Add 3 new hooks on the best angle. Launch retargeting (Rs 150/day). Apply for Play production access once 14 days are done. | Round 2 hooks, retargeting carousel and stories | 15+ paid [A]. |
| **4** | 30 Nov to 6 Dec | Units ready [F]. Pack, number, ship. 15 minute setup calls with the first 10 customers (section 10). Keep ads running if under 50. | Onboarding card and gift note print files | 25+ paid, first 10 activated. |
| **5** | 7 to 13 Dec | Day 7 check-ins. Ask for honest feedback; testimonial only if they offer. Turn on referral codes. Seed 5 creators with real units. | Social proof template (only real quotes) | 35+ paid. |
| **6** | 14 to 20 Dec | Close to 50. Once 50 are sold: switch ads to a **batch 2 waitlist** (no payment) at a lower budget, and say the batch 2 date honestly. | Batch 2 waitlist variant of the site | 50 paid. |
| **7 to 8** | 21 Dec to 3 Jan | "New year, put it down" organic and waitlist ads (resolution timing, no outcome claims). Week 4 retention read on the first buyers. Run the 500 decision (below). | New year creative set | Decision made. |

### Phase 2: from 50 to 500 (weeks 9 to 20, 4 Jan to 28 Mar), only if the gate passes

| Weeks | Focus |
|---|---|
| 9 to 10 | Lock batch 2 manufacturing method and unit cost (bulk 3D printing vs a moulded case [U costs]). Move payments to a gateway with a thank-you page so Meta can optimise for Purchase (section 4). Public Play listing. |
| 11 to 14 | Batch 2 paid pre-orders (deposit or full) to the waitlist first, then ads. Scale winning angles to Tier 2 budgets. Add the social proof angle (A9) with real buyer quotes. Hindi and Hinglish versions of the top 2 ads. |
| 15 to 20 | Ship batch 2 in waves of 100. Referral loop at scale. Creator partnership ads. Evaluate Amazon listing (fees and returns [U]) and the iPhone waitlist size. |

**The 500 gate (all must pass) [A]:**

1. 50 paid within 6 weeks of opening pre-orders.
2. Refund rate at or under 15%.
3. At least 40% of buyers still locking on 4 or more days a week in their week 4.
4. At least 25 of the 50 came from Meta ads or organic Instagram (not your network), at a blended cost per paid order under the break-even in section 9.
5. At least one angle with a cost per paid order under target for 2 weeks.
6. Zero unresolved lockouts; no Play policy rejection outstanding.

If 1 to 3 pass but 4 fails, the product works and the channel does not: fix creative and landing before scaling. If 3 fails, fix the product before spending more.

---

## 3. Meta ads structure

### Account setup (week 1)

- Meta Business portfolio, Facebook Page "nope", Instagram professional account linked, one ad account in INR, verified domain, Pixel (dataset) installed on the site [U: names and menus change].
- New ad accounts can have low spending limits and slower review at first [U]. Start in week 1 so this is not on the critical path.
- Ad spend in India may carry 18% GST on top of the budget [U]. Budget for it.

### Campaign 1: Prospecting (always on)

| Setting | Choice | Notes |
|---|---|---|
| Objective | **Sales**, conversion location Website | [U: Meta renames objectives] |
| Optimisation event | **Lead** (WhatsApp waitlist submit) at first; switch to **InitiateCheckout** (Pay with UPI tap) once it reaches roughly 50 a week | UPI payments happen outside the site, so Purchase cannot fire automatically in Phase 1 (section 4). Meta's learning phase needs about 50 optimisation events per ad set per week to exit [U]; at our budget we will mostly be "learning limited". Read directional signals, don't panic. |
| Budget | Campaign budget (Advantage campaign budget) [U], daily, see the ladder | Raise by no more than about 20% every 3 or 4 days to avoid resetting learning [U]. |
| Ad sets | **One** broad ad set | Consolidation beats fragmentation at small budgets. |
| Audience | Advantage+ audience, India, age 18+, no interests, no lookalikes in Phase 1 | Founder direction: broad [F]. The creative does the targeting. |
| Devices | Android only, if "specific mobile devices and operating systems" is still available alongside Advantage+ placements [U] | iPhone users cannot use nope yet [F]. If the setting is not available, every ad must say "Android" on screen. |
| Placements | Advantage+ placements; check that Instagram Reels, Stories, Feed and Facebook Reels and Feed are included | Remove Audience Network if early data shows junk clicks (high CTR, near zero leads) [A]. |
| Creative options | **Turn off** automatic creative enhancements (generated text, music, visual touch-ups) [U: names vary] | Auto-generated text can add claims we cannot make. |
| Ads | 4 to 6 live at a time, one per angle | Naming: `A1_room_reel_v1` (angle, short name, format, version) |
| URL | Site URL + `?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}` | Meta supports dynamic URL parameters like these [U]. |

### Campaign 2: Retargeting (from week 3)

| Setting | Choice |
|---|---|
| Objective | Sales, optimise for Lead or InitiateCheckout (same as prospecting) |
| Audiences | Website visitors 14 days; Instagram account engagers 30 days; people who watched 50% or more of any nope video, 14 days [U] |
| Exclusions | Paid customers (upload a customer list only with consent and as Meta's rules allow [U]) and anyone who submitted the waitlist in the last 3 days |
| Creatives | A3 privacy, A8 rescue, the FAQ carousel, a founder-face "who makes this" video, refund card; from week 6, real buyer quotes (A9) |
| Budget | Rs 150/day, rising to Rs 300/day |
| Frequency | Watch weekly frequency; if above about 4 with falling CTR, refresh creative [A] |

### Creative testing framework

1. **Round 1 (week 2):** 5 reels ads, one per angle: A1 room, A2 tap, A3 privacy, A4 pay once, A5 bedtime. Same end card, same CTA. Plus 2 statics (4:5) for A1 and A4.
2. **Read after 4 days or about Rs 1,000 spend per ad, whichever is later [A].**

| Metric | Keep if [A] | Kill if [A] |
|---|---|---|
| Hook rate (3 second plays / impressions) | 25%+ | under 15% |
| Link CTR | 0.8%+ | under 0.4% |
| Cost per landing page view | under Rs 25 | over Rs 50 |
| Cost per lead (waitlist) | under Rs 200 | over Rs 400 |
| Cost per paid order (blended, manual) | under Rs 600 | over Rs 850 for 7 days |

3. **Round 2 (week 3):** 3 new hooks on the winning angle (same body, new first 2 seconds), plus the winner as a 4:5 static and a carousel. Hooks change results more than bodies do [A].
4. **Round 3 (weeks 4 to 6):** test A6 work focus and A7 gift. Add real proof (A9) when you have it.
5. Keep a **creative log** (sheet tab): ad name, angle, hook text, launch date, spend, metrics above, verdict, what you learned in one line.

### Budget ladder and daily budgets [A]

Cumulative cash. Add about 18% if GST on ads applies [U].

| Step | Cumulative spend | Days | Prospecting / day | Retargeting / day | Gate to move up |
|---|---|---|---|---|---|
| 1 | Rs 5,000 | 1 to 10 | Rs 450 | 0 | At least one ad under Rs 25 per landing page view |
| 2 | Rs 15,000 | 11 to 24 | Rs 600 | Rs 150 | Blended cost per paid order under Rs 850 |
| 3 | Rs 25,000 | 25 to 35 | Rs 750 | Rs 150 | 25+ paid orders; still under Rs 850 |
| 4 | Rs 50,000 | 36 to 60 | Rs 900 to 1,000 | Rs 200 | 50 sold; ads now fill the batch 2 waitlist |
| 5 | Rs 75,000 | 61 to 80 | Rs 1,000 to 1,500 | Rs 250 | Passed the 500 gate; unit cost known |

Never move up a step because money is available. Move up because the gate passed.

---

## 4. Tracking

### Pixel events on the site (creative head implements)

| Event | Fires when | Used for |
|---|---|---|
| PageView | Any page load | Audiences |
| ViewContent | Price section scrolls into view | Retargeting the engaged |
| Lead | WhatsApp waitlist form submitted (before WhatsApp opens) | Phase 1 optimisation event |
| Contact | Any "Chat on WhatsApp" tap | Diagnostics |
| InitiateCheckout | "Pre-order for Rs 1,999" / "Pay with UPI" tapped or QR shown | Later optimisation event |
| Purchase | **Not on the site in Phase 1.** Uploaded manually (below) | Real CAC and ROAS |

The current site keeps waitlist entries only in the visitor's browser and in a WhatsApp message they may never send [D]. Add a free form backend (for example a Google Form or Sheet behind the form) so every lead is captured even if WhatsApp does not open.

### Conversions API (CAPI)

CAPI sends events server to server and survives ad blockers [U]. Our site has no server. Phase 1: Pixel only plus manual offline uploads. Phase 2 (batch 2): move to a payment gateway page (Razorpay, Cashfree, Instamojo or similar; fees and KYC [U]) whose success redirect lands on `/thanks` (fires Purchase) and, if offered, whose native Meta integration sends server events. Or use Meta's Conversions API Gateway [U: hosting cost]. Do not build a backend for 50 units.

### UTM scheme

| Parameter | Values |
|---|---|
| utm_source | meta, ig (organic), wa, linkedin, reddit, x, creator_[name], referral, poster |
| utm_medium | paid_social, organic_social, dm, referral, offline |
| utm_campaign | p1_prospect, p1_retarget, p1_organic, p1_creator, p1_referral, b2_waitlist |
| utm_content | ad or post name, for example `A1_room_reel_v1` |
| utm_term | ad set name (paid) or placement |

Organic posts use a link-in-bio URL with `utm_source=ig&utm_medium=organic_social&utm_campaign=p1_organic`.

### Measuring UPI pre-orders by hand (the important bit)

1. The site generates an **order code** per visitor, for example `NP-A1-7K2Q` (angle code from utm_content, plus 4 random characters).
2. The code goes into the UPI payment note (the landing already builds a `upi://pay` link with a note field [D]), into the WhatsApp message, and into the form backend row with the UTM values.
3. When money arrives, find the note in your UPI app history. Some apps may not show or may let the payer edit the note [U], so the thank-you screen also asks the buyer to send the payment screenshot on WhatsApp with their code.
4. Log it in the Orders sheet (METRICS.md), matching code to UTM.
5. Weekly: upload paid orders to Meta as offline Purchase events (phone or email, event time, value 1999, currency INR) via Events Manager [U: the upload flow changes; check current docs]. Only upload customers whose details you collected with notice on the site.

Ask every buyer on WhatsApp "Where did you first hear about nope?" and log the answer next to the UTM. Self-reported source catches what UTMs miss (saw the ad, bought later from a friend's link).

---

## 5. Landing page conversion rules (for the creative head)

1. **Message match:** the hero headline changes with the ad angle via a URL parameter (`?a=A1` shows the A1 headline). Same visual world as the ad.
2. **Above the fold on a 360 px wide phone:** real product in a real hand or room, headline, "Rs 1,999 · Pay once · 30 day refund", the primary CTA "Pre-order for Rs 1,999", and "Android with NFC".
3. **Sticky bottom bar** with price and CTA after the first scroll.
4. **One primary action.** WhatsApp waitlist is the secondary, quieter option.
5. **NFC check before payment:** "Check in 10 seconds: Settings, search NFC. No NFC? Don't pay; join the waitlist." This prevents guaranteed refunds.
6. **Order of sections:** hero, 15 second demo video (muted autoplay, captions), how it works (3 steps), "leave it in another room", privacy (permission in plain words, link to policy), never locked out (rescue + emergency unlocks), what stays reachable, price and refund terms in full, who makes this (founder name, photo, city, WhatsApp), FAQ, final CTA.
7. **Trust lines next to the pay button:** refund terms, ship-by date, "pay only after we've chatted if you prefer".
8. **Ship date:** "Ships about 3 to 4 weeks after pre-order" [F]. The current page says 2 to 3 weeks [D]; fix it.
9. **Remove** the footer "placeholder brand name" [D] and use lowercase "nope" throughout.
10. **Remove** unverified comparative lines such as "Friction you can feel works better than a toggle" [D]; say "A tap you have to walk to" instead.
11. The current bullet "Your phone stays in your hand" [D] contradicts the lead angle. Replace with the other-room story.
12. **Speed:** under about 3 seconds to first view on a 4G phone [A]. Compress images, lazy-load the video, no heavy fonts.
13. **No fake urgency:** no countdowns, no invented stock counters. "x of 50 left" only if updated by hand and true.
14. Pixel disclosure line and privacy policy link in the footer (PLAN.md section 8).
15. Thank-you state: order code, "send us your payment screenshot on WhatsApp", what happens next, ship date, and the "ask someone to gift it" WhatsApp message.

---

## 6. Pre-order funnel math (assumptions you can change)

All rates are **[A]**. Indian CPMs vary by season and creative [U]. Per Rs 1,000 of Meta spend:

| Step | Low case | Base case | High case |
|---|---|---|---|
| CPM | Rs 220 | Rs 150 | Rs 100 |
| Impressions | 4,545 | 6,667 | 10,000 |
| Link CTR | 0.6% | 1.0% | 1.5% |
| Link clicks | 27 | 67 | 150 |
| Landing page views (% of clicks) | 75%: 20 | 80%: 53 | 85%: 128 |
| Pay directly on first visit (% of LPV) | 0.5%: 0.1 | 1.5%: 0.8 | 2.5%: 3.2 |
| Join waitlist (% of LPV) | 6%: 1.2 | 10%: 5.3 | 14%: 17.9 |
| Waitlist to paid within 14 days | 10%: 0.1 | 20%: 1.1 | 30%: 5.4 |
| **Paid orders per Rs 1,000** | **0.2** | **1.9** | **8.6** |
| **Cost per paid order** | **about Rs 4,400** | **about Rs 540** | **about Rs 120** |

**Reading it:** the base case sells 50 units from ads alone for about Rs 27,000. With the founder network, organic and referrals planned to bring 15 to 20 orders [A], ads need about 30 to 35 orders, which is about Rs 16,000 to 19,000 in the base case: Tier 1. The low case shows why Step 1 is only Rs 5,000: if you are there after 10 days, stop and fix creative and the landing before spending more.

**Planned sources for the first 50 [A]:** Meta ads 30, organic Instagram 6, founder network and LinkedIn 8, referrals 4, creators 2.

**Downstream [A]:** delivered 50; activated (paired, backup code saved, first lock in 48 hours) 85%; active on day 7 65%; active in week 4 45%; refunds 15% or fewer.

---

## 7. Referral loop

- **When:** after the day 7 check-in, only to buyers who say it is working.
- **Offer [A]:** the friend gets a free spare puck with their order (useful, protects the Rs 1,999 price); the referrer gets Rs 200 back to their UPI after the friend's day 7 check-in. Cost about Rs 200 plus one spare's unit cost per referral; check against margin.
- **Mechanics:** a personal code (`REF-PRIYA`) the friend types in the WhatsApp chat or a link with `utm_source=referral&utm_content=REF-PRIYA`. Log in the Orders sheet.
- **Share kit:** one WhatsApp-ready message and the 15 second demo video, so sharing takes 10 seconds.
- **Disclosure:** if a referrer posts publicly, they should mention they get a reward [U: ASCI]. Say so in the share kit.
- **Two-pack nudge:** "Know someone who needs one too? Two for Rs 3,499" at the moment of purchase.

---

## 8. Partnerships (small, optional)

Broad positioning means partnerships are side bets, not the engine. Two worth one hour each:

1. **Co-working spaces in your city:** offer a free demo puck at the front desk and a QR poster with `utm_source=poster`. Approach: walk in, ask for the community manager, 2 minute demo, "no cost to you, a thank-you of Rs 200 per sale [A] if you'd like". Kill after 3 weeks with under 2 sales.
2. **Creators (5, seeded):** pick people with 5,000 to 50,000 followers [A] who post desk setups, productivity or everyday life in India, and who reply to comments. DM: "I made a small thing called nope. Would you try it for a week? No script, no obligation to post, honest views welcome. If you post, please mark it as gifted." If one performs, ask permission to run their post as a partnership ad [U: Meta's partnership ads rules].

Optional E10 in EXPERIMENTS.md tests one study library or hostel poster, since students were the strongest pain in the research.

---

## 9. Unit economics

`product/BOM_AND_COSTS.md` does not exist. **Every cost below is [A].** Replace with your real numbers in the sheet.

| Line | Not GST registered | GST registered, price includes 18% [U: rate and threshold, ask a CA] |
|---|---|---|
| Price paid | Rs 1,999 | Rs 1,999 |
| Net revenue after GST | Rs 1,999 | Rs 1,694 |
| Case print, material, finishing [A] | Rs 275 | Rs 275 |
| NFC sticker [A] | Rs 25 | Rs 25 |
| Box, onboarding card, gift note [A] | Rs 70 | Rs 70 |
| **Unit cost (COGS)** | **Rs 370** | **Rs 370** |
| Shipping in India [A] | Rs 100 | Rs 100 |
| Payment fees (UPI direct; a gateway adds about 2% [U]) | Rs 0 | Rs 0 |
| Refund allowance: 15% refund rate, no return [A] | Rs 300 | Rs 254 |
| **Contribution before ads** | **Rs 1,229** | **Rs 970** |
| **Break-even CAC** | **Rs 1,229** | **Rs 970** |
| **Break-even ROAS** (price / CAC) | **1.6** | **2.1** |
| **Target CAC** (keep half the contribution) | **Rs 615** | **Rs 485** |

Notes: if ad spend carries 18% GST you cannot claim back, divide CAC by 1.18 [U]. The Phase 1 hard ceiling of Rs 850 per paid order (PLAN.md) sits below both break-evens. Founder time, setup calls and support are not costed; at 500 units they matter. A two-pack at Rs 3,499 raises revenue per order by 75% for one CAC; push it.

---

## 10. The first 10 customers

1. **Before shipping:** WhatsApp them personally. Confirm NFC on their phone, Android version, phone model, and the case they use.
2. **Delivery day:** a 15 minute WhatsApp video setup call. Watch them set up (don't drive). Note every hesitation. Make sure the **backup code is saved in two places**. Help them choose a spot in another room.
3. **Day 2:** "Did it lock? Anything confusing?" Fix bugs within 48 hours.
4. **Day 7:** 10 minute call: what they blocked, where the puck lives, emergency unlocks used, any cheat they found, would they be very disappointed without it (yes, somewhat, no).
5. **Day 14 and day 28:** two-line WhatsApp check: "How many days did you lock last week? Streak number?" (optional screenshot). The app has no analytics [D], so this is the only retention data you get.
6. Offer the refund proactively to anyone it isn't working for. A fast, kind refund is marketing.
7. Write a one-paragraph note per customer in the sheet. After 10, share the top 3 learnings with the creative head; they change ads and the site.

---

## 11. Honest reviews and testimonials

- Ask everyone for feedback; ask for a public quote only from those who offer it, after day 7.
- Use their exact words. Trim, never rewrite the meaning. Get written consent on WhatsApp ("Can we use this quote with your first name and city?").
- Never pay, discount or gift in exchange for a positive review. Creator posts on gifted units are labelled "gifted".
- Keep critical feedback. A "what our first 10 said" post with one honest complaint and the fix builds more trust than five five-star quotes.
- No numbers in testimonials unless the customer shows a screenshot, and even then label it "one person's experience" and check ASCI guidance [U].
- Store consents in the sheet (date, exact quote, where used).

---

## 12. Content engine (3 hours a week) and organic cadence

### Weekly cadence

| What | How often | Notes |
|---|---|---|
| Reels | 3 a week (Mon, Wed, Sat [A]) | 7 to 20 seconds, captions burned in, hook in the first second |
| Stories | Daily, 2 to 4 frames | Behind the build, polls ("Where would your puck live?"), WhatsApp link sticker |
| Carousel | 1 a week | How it works, privacy in plain words, FAQ |
| Comments and DMs | Daily, 10 minutes | Reply to every comment within 24 hours; comments are public trust |
| Highlights | Once, then update | How it works, Privacy, Rescue, Refund, Reviews (only real) |

Content pillars: the mechanism (tap and walk); "where does your puck live?" (rooms, shelves, the fridge top); behind the build (printing, numbering 01 to 50, packing); trust (privacy, rescue, refund); real buyers (from week 5, with consent).

### The 3 hour routine

| Block | Time | What |
|---|---|---|
| Sunday shoot | 90 min | Film 5 raw clips from the shot list in natural light. Phone on a stack of books, no studio. |
| Edit | 45 min | Use Instagram's built-in editor or the editor you already use (CapCut is not available in India [U]). Creative head's templates for captions and end cards. |
| Schedule | 30 min | Captions and schedule in Meta Business Suite. |
| Creative log | 15 min | Update the log; flag organic winners to turn into ads. |

### Shot list for raw footage (founder films, creative head edits)

1. Tap phone on puck, cut to the blocked app opening and bouncing to Home (uncut, real screen).
2. Walk to the kitchen, put the puck on a shelf, walk back, sit down with the phone.
3. Night: lying in bed, opening a feed app, bounced Home, a sigh, phone down.
4. Desk: laptop open, phone face down, puck visible across the room.
5. Hand holding the puck, slow turn, debossed "nope" visible.
6. Screen recording: the permission disclosure screen and the Settings toggle.
7. Screen recording: rescue with the backup code.
8. Packing: numbering a puck "07/50", box, note card.
9. Founder to camera, 20 seconds: "I'm [name] from [city]. I made nope because..." (for retargeting).
10. Gift: handing a wrapped box to someone, they open it, read the note.

---

## 13. WhatsApp quick replies (founder)

- **/nfc:** "Quick check before you pay: open Settings and search NFC. If it shows up, nope will work. If not, tell me your phone model and I'll check."
- **/privacy:** "nope's permission sees only the name of the app that just opened, to send you Home if it's blocked. It can't see your screen, messages or UPI. No account, nothing leaves your phone. Policy: [link]."
- **/lost:** "When you pair the puck, you get a 10 character backup code. Save it in two places. If the puck is lost, the code unlocks everything and lets you pair a new one."
- **/refund:** "30 days from delivery. Message me 'refund' and I'll send it to your UPI within 3 working days. No questions, and you don't need to send it back."
- **/ship:** "This founding batch ships by [date]. If I miss it by more than 7 days, you can take a full refund straight away."
- **/iphone:** "Android only for now. iPhone needs Apple's approval, so no date yet. Want me to add you to the iPhone list?"

---

## 14. Creative brief list (for the creative head, agent a7b8f6e1482ae1b12)

Palette: charcoal #1C1C1E, warm grey #C9C7C3, off-white #F5F4F1, saffron #FF8A1F (saffron text only on charcoal, charcoal text on saffron). Lowercase nope. Tagline "Put it down." CTA "Pre-order for Rs 1,999". Required micro-copy on every ad end card: "Android with NFC · 30 day refund · No subscription".

**Size rules [U: check Meta's current specs]:** Feed 4:5 at 1080x1350; square 1:1 at 1080x1080; Stories and Reels 9:16 at 1080x1920. In 9:16, keep text and logos out of roughly the top 14% and the bottom 20% (Stories) to 35% (Reels) for interface overlays. Primary text shows about 125 characters before "more"; keep headlines under about 40 characters. Video: burned-in captions (most watch muted), hook in the first second, 9 to 20 seconds for reels ads, 6 to 10 seconds for story ads.

### Round 1: needed by Sat 14 Nov (launch Mon 16 Nov)

| ID | Format | Size | Angle | Content |
|---|---|---|---|---|
| R1 | Reels ad | 1080x1920 | A1 room | Shots 2 and 1: "My phone is here. My Instagram is in the kitchen." End card. |
| R2 | Reels ad | 1080x1920 | A2 tap | Shot 1, uncut: "One tap to lock. A walk to unlock." |
| R3 | Reels ad | 1080x1920 | A3 privacy | Shot 6: "It sees which app opened. Nothing else." |
| R4 | Reels ad | 1080x1920 | A4 pay once | Shot 5 plus price card: "Rs 1,999 once. No subscription." |
| R5 | Reels ad | 1080x1920 | A5 bedtime | Shot 3: "Bedtime scroll? The puck's in the other room." |
| S1 | Static | 1080x1350 | A1 room | Puck on a kitchen shelf, headline "Put it down." |
| S2 | Static | 1080x1350 | A4 pay once | Price card, refund line, no subscription |
| S3 | Static | 1080x1080 | A1 room | Square version of S1 for Facebook Feed |
| C1 | Carousel, 5 cards | 1080x1080 each | How it works | 1 "Put it down." 2 Choose the apps. 3 Tap to lock. 4 Leave the puck in another room. 5 Rs 1,999 once, 30 day refund, CTA |

### Round 2: by Sat 21 Nov (retargeting and hook iterations)

| ID | Format | Size | Content |
|---|---|---|---|
| C2 | Carousel, 5 cards | 1080x1080 | FAQ for retargeting: privacy, lost puck rescue, works offline, refund, who makes this |
| ST1 | Story ad | 1080x1920 | A8 rescue: shot 7, "Lost the puck? You're not locked out." |
| ST2 | Story ad | 1080x1920 | A3 privacy, static or 6 second motion |
| ST3 | Story ad | 1080x1920 | Founder face, shot 9, "who makes this" |
| R1b to R1d | Reels ads | 1080x1920 | 3 new first-2-second hooks on the Round 1 winner |
| S4 | Static | 1080x1350 | Round 1 winner as a still |

### Round 3: by 5 Dec

| ID | Format | Size | Content |
|---|---|---|---|
| R6 | Reels ad | 1080x1920 | A6 work focus, shot 4 |
| R7 | Reels ad | 1080x1920 | A7 gift, shot 10, "Not a lecture. Just a puck." |
| S5 | Static | 1080x1350 | A7 gift box and note |
| P1 | Story and reel template | 1080x1920 | A9 real buyer quote frame (filled only with consented quotes) |
| H1, H2 | Hinglish versions of the top 2 ads | as original | "Phone kitchen mein hai." |

### Website and other assets

| Asset | Size [U where noted] |
|---|---|
| Mobile-first site v2 per section 5, with headline variants per angle (`?a=A1` to `?a=A8`) | responsive, test at 360 px wide |
| Share image (Open Graph) | 1200x630 |
| 15 second demo video for the site hero | 9:16 and 1:1 crops, under about 3 MB [A] |
| NFC check illustration | inline on site |
| Founder photo and "who makes this" block | inline |
| Organic reel cover template | 1080x1920 (grid shows a centre crop, about 1080x1440 [U]) |
| Highlight covers (5) | 1080x1920 |
| Play feature graphic | 1024x500 [D, verify] |
| Play screenshots (5, per `docs/play-store/store-listing.md`) | per Play specs [U] |
| Onboarding card (setup steps, backup code reminder, refund, WhatsApp) and gift note card | print size of your choice, fits the box |

Do not use real Instagram, YouTube or Facebook logos or app icons in any ad; use generic app tiles [U: trademark and Meta brand rules]. No fake buttons, fake notifications, countdowns or results claims.
