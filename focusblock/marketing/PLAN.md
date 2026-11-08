# nope: Marketing Plan (Phase 1: the first 50, then the call on 500)

Owner: founder. Written by: CMO. Date: 8 Nov 2026. Brand, visual assets and website: creative head (agent a7b8f6e1482ae1b12). This file sets positioning, messaging, offer and rules; GTM.md sets the Meta ads machine and the funnel.

## How to read the labels

| Tag | Meaning |
|---|---|
| **[F]** | From the founder (decided). |
| **[D]** | From a document or the app code in this repo. |
| **[A]** | My assumption. Change it in the sheet when you learn more. |
| **[U]** | Unverified fact about the world (a platform rule, a price, a law). Check it before you rely on it or publish it. |

The five persona interviews in `research/` are **simulated**. They are useful for objections and wording, not as evidence. `VALIDATION_SCRIPT.md` replaces them with 10 real conversations.

---

## 1. Positioning (broad India audience)

**Founder direction [F]:** do not target a segment. The audience is anyone in India who wants to scroll less. Primary channel is Instagram and Meta ads to the website for pre-order.

**One line:** nope is the puck you leave in another room, so your scroll apps need a walk, not just a thumb.

**Positioning statement**

> For anyone in India who opens Instagram or YouTube "for a minute" and loses an hour, **nope** is a palm-sized puck that locks the apps you choose with one tap. Unlike screen time limits you dismiss with one more tap, the off switch lives outside your phone, ideally in another room. Pay once, no subscription, no account, and nothing leaves your phone. Android for now.

**Why this works broadly:** the pain that every persona shared, student or professional, was the same: a limit that costs one tap to ignore, and a phone that is always within reach [D, all five personas]. Physical distance is our honest edge. We never claim nope is uncheatable. We claim it turns cheating into a walk. Karan's line is the brand truth: "It doesn't stop you. It makes you choose." [D].

**What nope is not:** not parental control, not a cure, not a detox programme, not a cheaper version of anyone.

**Who still filters themselves out (say it plainly in ads and on the site):**

- iPhone users. Android only for now [F]. Put "Android" in every ad's primary text or on-image.
- Android phones without NFC [U: share unknown; not every budget model has it]. The site must show a 10 second "check your phone" step before payment.
- Company-managed work phones that block Accessibility services [U].

Broad does not mean anyone: these three filters protect the 30 day refund from avoidable returns.

---

## 2. Creative angles (instead of segments)

Meta's broad targeting finds the people; the **angle** decides who stops scrolling. We test angles, not audiences. Each angle has one job, one hook, and one honest proof.

| # | Angle | Core hook (say it, show it) | Who it probably pulls [A] | Honest proof on screen |
|---|---|---|---|---|
| A1 | **Leave it in another room** (lead angle) | "My phone is here. My Instagram is in the kitchen." | Anyone who scrolls in bed or on the sofa | Real footage: tap, puck goes on a kitchen shelf, blocked app sends you Home |
| A2 | **One deliberate tap** | "One tap to lock. A walk to unlock." | People tired of fiddly settings | The tap in under 2 seconds, uncut |
| A3 | **Plain-language privacy** | "It sees which app opened. Nothing else." | The sceptics; also lowers cost per purchase on other angles via retargeting | The real in-app disclosure screen; "No account. No analytics." |
| A4 | **Pay once** | "Rs 1,999 once. No subscription. Ever." | People with subscription fatigue (Rohan) | Price card, 30 day refund line |
| A5 | **Bedtime scrolling** | "Bedtime scroll? The puck's in the other room." | Late-night scrollers of any age | Night scene, puck on a hallway shelf, phone on the bed with apps locked |
| A6 | **Work focus** | "Deep work starts with one tap." | Professionals, WFH, freelancers | Laptop desk, phone face down, puck across the room |
| A7 | **Gift** | "Not a lecture. Just a puck." | Siblings, partners, friends, grown kids buying for parents | Gift box, the note card |
| A8 | **Never locked out** (trust) | "Lost the puck? Your backup code gets you back in." | Retargeting: visitors who did not buy | Screen recording of the rescue flow |
| A9 | **Social proof** (only when real) | A real buyer's own words, after day 7 | Everyone, from week 6 | Only with written consent, unedited meaning, labelled "one person's experience" |

Avoid any angle that tells viewers what they are ("you're addicted", "your brain is fried"). It breaks our voice and is risky under Meta's policy on personal attributes [U, see section 8].

---

## 3. Messaging pillars and proof points we can honestly make today

Re-check every proof point in the **release build** before it appears in an ad.

| Pillar | Message | Proof available today |
|---|---|---|
| **1. Distance beats willpower** (lead) | Put it down. Put the puck in the other room. | Real video of the mechanism. No result claims. |
| **2. One deliberate tap** | Tap to lock. Tap to unlock. | NFC tap flow [D, app]. |
| **3. Private by design** | No account. No analytics. Nothing leaves your phone. The permission sees only which app just opened. | Privacy policy and Accessibility disclosure [D]. Verify no network SDKs in the release build. |
| **4. Never locked out** | Lost the puck? Your backup code gets you back in. | 10 character backup code shown once at pairing, unlocks and lets you pair a new puck [D, app]. 2 emergency unlocks a day, each needs a 10 second hold [D, app]. |
| **5. Stay reachable** | Calls always work. WhatsApp, UPI apps and Maps are marked "keep reachable". | Phone dialer can never be blocked; WhatsApp, Google Pay, PhonePe, Paytm, BHIM, CRED, Maps and Messages show a warning before you can block them [D, `src/essentials.ts`]. Say **"marked keep reachable"**, never "always allowed": a user can still block them after a confirmation. |
| **6. Pay once, 30 days to decide** | Rs 1,999. No subscription. 30 day refund. | [F] |

Supporting facts: locking works offline (landing FAQ [D], verify); optional browser blocking covers Chrome, Firefox, Samsung Internet, Edge, Brave, Opera and UC Browser [D, app], so say "major browsers", not "the web"; hand-made in small batches with a 3D printed case [F].

---

## 4. Objection handling

| Objection (source) | Answer in our voice | Proof or action | Where it lives |
|---|---|---|---|
| "Accessibility permission means you can read my screen and my UPI." (all personas) | "It sees one thing: the name of the app that just opened. Not your screen, not your messages, not what you type. Nothing leaves your phone." | 30 to 45 second screen recording of the disclosure and the Settings toggle. Link the privacy policy. | Site above the FAQ, retargeting ad A3, WhatsApp |
| "What if I lose the puck and I'm locked out?" (Neha, Aarav) | "You won't be. Save your backup code and you're back in within a minute. Plus 2 emergency unlocks a day." | Rescue video; onboarding card says "save your code in two places". | Site, box card, ad A8 |
| "What if your company shuts down?" (Neha, Rohan) | "No account, no server. Uninstalling removes every block." | Verify uninstall fully releases blocks. Show founder name and city. | Site "who makes this" |
| "Rs 1,999 for a puck?" (several) | Don't argue. "Pay once, no subscription, 30 days to decide." | Refund terms in full, next to the price. | Every ad, site |
| "Rs 1,999 feels cheap, will it last?" (Rohan) | "Hand-made, numbered founding batch. Fails in 6 months? We replace it." | Only if founder approves the replacement promise (SUMMARY Decision 3). | Site, box card |
| "I'll just use the browser or uninstall." (Karan, Aarav) | "You can. nope doesn't stop you. It makes you walk first. Optional browser blocking covers the major browsers." | Honesty is the proof. Never say "uncheatable". | FAQ, organic reels |
| "Two emergency unlocks will be gone by 11am." (Neha, Rohan) | "Each needs a 10 second hold. Long enough to ask: is this an emergency?" | App behaviour [D]. | FAQ |
| "WhatsApp has my work and family." (Neha, Rohan) | "Don't lock WhatsApp. nope warns you before you do. Lock the feeds instead." | Essentials warning [D]. We cannot allow one chat and block the rest. Never imply it. | FAQ, setup |
| "Will it work on my phone?" | "Android with NFC, yes. Check in 10 seconds: Settings, search NFC." | NFC check before the pay button. Thick or metal-ring cases may block the tap [U]; test. | Site, first WhatsApp reply |
| "Who are you? Is this a scam?" (Meera, Karan) | Real founder name, city, WhatsApp number, refund to your UPI. | Remove the landing footer "placeholder brand name" [D]. | Site, ad comments |
| "Why not iPhone?" | "Android first. iPhone needs Apple's approval. Join the iPhone list; no dates promised." | [F] | FAQ, comment replies |

---

## 5. Offer and pricing mechanics

Base price **Rs 1,999, one-time** [F]. Do not discount the base price in Phase 1; add value instead. There is no cost model in the repo (`product/BOM_AND_COSTS.md` does not exist), so every add-on price below is **[A]** and must clear at least 50% gross margin once you know unit cost (GTM.md section 9 has the unit economics template).

| Mechanic | Offer [A] | Why |
|---|---|---|
| **Founding batch (early bird)** | First 50 pucks hand-numbered 01 to 50, a 15 minute setup call on WhatsApp, and a free replacement if it fails in 6 months. No price cut. | True scarcity (you are making 50). Protects the Rs 1,999 anchor for batch 2. Show "x of 50 left" only if you update it by hand and it is true. |
| **Two-pack ("one for you, one for someone")** | Rs 3,499 for two. | Desk plus bag, or you plus a partner or friend [D, Aarav]. Raises order value, which lowers effective CAC. |
| **Spare puck** | Rs 499, existing buyers only. | Lost-puck fear [D]. |
| **Gift** | Same price, gift note in the box ("Not a lecture. Just a puck."), optional setup call with the recipient. | Gift angle A7; the note avoids "you think I have a problem". |
| **Ask-someone-to-pay** | A ready WhatsApp message on the thank-you screen: "Can you get me this? Rs 1,999, 30 day refund." | Broad version of the student "ask papa" framing; works for anyone who wants it as a gift. |
| **Refund** | 30 days from delivery, no questions, refund to the original UPI within 3 working days. Recommendation for Phase 1: **no return required**. Optional 10 minute exit chat, never a condition. | Karan: "no interrogation" [D]. At 50 units, learning beats recovering a print. Revisit at 500. |
| **Pre-order promise** | "Ships by [date]. Miss it by more than 7 days and you can take a full refund immediately." | Paying before the product exists needs a clear safety net. Units take about 3 to 4 weeks [F]; the landing currently says 2 to 3 weeks [D]. Fix it. |

**Price discipline:** never compare with Brick's price or name in ads, on the site or in comments [F]. Their Rs 5,700 is only what their site says today [F, U].

---

## 6. CTA and headline bank (for the creative head)

- Primary CTA label: **"Pre-order for Rs 1,999"** (agreed with creative head). Meta button: "Shop now" or "Pre-order" if available for the chosen objective [U].
- Secondary CTA: **"Join the waitlist on WhatsApp"** (for people not ready to pay).
- Headlines (short, ad-ready): "Put it down." / "Your phone stays here. The puck lives in the kitchen." / "It doesn't stop you. It makes you walk." / "One tap to lock. A walk to unlock." / "Pay once. No subscription." / "It sees which app opened. Nothing else." / "Bedtime scroll? The puck's in the other room." / "Deep work starts with one tap." / "Not a lecture. Just a puck."
- Required micro-copy near every CTA: "Android with NFC · 30 day refund · No subscription".

---

## 7. Brand voice

Calm, confident, a little witty. Never preachy, never shaming. Lowercase **nope** everywhere (the current landing uses "Nope"). Tagline: **Put it down.** Palette for any asset: charcoal #1C1C1E, warm grey #C9C7C3, off-white #F5F4F1, single accent saffron #FF8A1F (owned by the creative head).

| Do | Don't |
|---|---|
| "Put it down. The puck's in the kitchen." | "Break your phone addiction forever!" |
| "It doesn't stop you. It makes you walk." | "Impossible to cheat." |
| "Your 5 minute break, back to 5 minutes." | "Get 3 hours of your life back every day." (no source) |
| "Calls always work. WhatsApp and UPI are marked keep reachable." | "Never miss anything important!" |
| "Nothing leaves your phone." (after verifying) | "Military-grade privacy", "AI-powered", "science-backed" |
| Light Hinglish where natural: "Phone kitchen mein hai." | Forced slang, memes that punch down |
| Speak to an adult who chose this | "Are you addicted to your phone?" |
| "Android only for now." | "Coming soon to iPhone!" with no date |
| "Day 3. Still here." | "You broke your streak. Again." |

Words to avoid: addiction, addicted, detox, cure, toxic, zombie, brain rot, dopamine (as health claims or labels for the viewer).

---

## 8. What NOT to claim (ASCI, Meta ad policy, consumer law)

I am not a lawyer. Everything here is **[U]**: read the source before launch.

**Advertising Standards Council of India (ASCI)** has a code on truthful and substantiated claims, comparative ads, testimonials, and guidelines for influencer disclosure. Check ascionline.in for the current versions.

**Meta advertising standards** restrict, among other things: ads that assert or imply personal attributes including health conditions ("Are you addicted?", "Struggling with your mental health?"); non-functional buttons or fake notification graphics; misleading claims; and use of Meta's own trademarks (Instagram and Facebook logos) in ways their brand guidelines do not allow. Check Meta's Advertising Standards and brand resources before the first ad. Using other companies' logos (YouTube) is a trademark risk too: show generic app tiles.

**Consumer protection:** e-commerce rules in India expect seller identity, contact details, refund and delivery terms to be visible. Ask a CA about GST registration and invoices before taking more than a handful of payments.

**Do not claim until you have evidence you could show a regulator:**

- Any number about screen time, focus, sleep, productivity or hours saved. A real buyer's screenshot must be labelled "one person's result" and checked against ASCI testimonial guidance.
- Health or psychological outcomes: addiction, anxiety, ADHD, sleep quality, dopamine.
- "Uncheatable", "can't be bypassed", "works on every Android phone".
- Comparisons with Brick or any named product, including price [F].
- "Made in India" unless you have checked what that requires. "Hand-made in small batches in [your city]" is safer if true.
- "Approved by Google" or anything implying Play Store endorsement.
- "Thousands of users", "as seen on", "#1", fake counters, fake countdowns.
- Anything from the simulated personas.
- iPhone dates.

**Creators and referrals:** anyone who received a free puck, money or a referral reward must disclose it clearly at the start of their post ("Gifted by nope", "#ad") [U: check ASCI's current influencer wording]. Tell them in writing.

**Pixel and privacy promise:** the app has no tracking [D], but the website will run the Meta Pixel. Say so on the site in one plain line ("Our website uses Meta's pixel to measure ads. The app has no tracking.") and check India's data protection law (DPDP Act) consent expectations [U]. A hidden pixel on a privacy-first brand is the kind of thing a sceptical Reddit thread finds.

---

## 9. Budget tiers

Phase 1 can only ship 50 units. Extra money buys **speed and better data** (a real CAC per angle), not more Phase 1 sales. Above roughly 50 orders, keep ads running only into a free batch 2 waitlist, or a deposit, and say clearly when batch 2 ships. Meta ad spend in India may attract 18% GST on top [U]; the figures below are total cash including it.

| | **Tier 0: Rs 0 to 5,000** | **Tier 1: Rs 5,000 to 25,000** | **Tier 2: Rs 25,000 to 75,000** |
|---|---|---|---|
| **Core idea** | One Meta test plus organic Instagram and the founder's network | Find a winning angle, add retargeting, start seeding creators | Scale the winners, buy a CAC number solid enough to plan 500 |
| **Meta spend [A]** | Rs 4,500: 1 prospecting campaign, Rs 450/day for 10 days, 5 to 7 ads (GTM.md ladder step 1) | Rs 15,000 to 20,000: prospecting Rs 600 to 800/day plus retargeting Rs 150/day for about 3 weeks | Rs 50,000 to 60,000: prospecting Rs 1,500 to 2,000/day, retargeting Rs 300/day, over 4 to 5 weeks |
| **Other spend [A, U]** | Rs 500: chai or a Rs 50 UPI thank-you for each of the 10 interviews (many will do it for free) | Rs 3,000 to 5,000: printed box and onboarding card for 50. 5 seeded units (your unit cost, outside this budget) | Rs 10,000 to 15,000: 2 or 3 paid micro creators (ask their rates; do not assume) and a product photo shoot if the creative head needs one |
| **Organic** | 3 reels a week, daily stories | Same, plus repurpose the best ad as organic | Same, plus partnership (creator) ads if creators agree |
| **What you learn** | Whether any angle gets landing page views under Rs 25 and waitlist leads under Rs 200 [A] | Which angle sells, real cost per paid order, whether retargeting with trust content converts | CAC per angle at scale, frequency limits, whether batch 2 can be sold before it is made |
| **Risk** | Too little data to exit Meta's learning phase [U]; read directional signals only | Overselling units you cannot make | Spending to learn before unit economics are known |
| **My call** | Start here in week 2. | Move up once one angle hits the Tier 0 targets. | Only after 25 paid orders and a known unit cost. |

**Hard rule at every tier [A]:** pause any ad set whose blended cost per *paid* order stays above **Rs 850** (the assumed break-even, GTM.md section 9) for 7 days. Replace that number once you have real unit costs.
