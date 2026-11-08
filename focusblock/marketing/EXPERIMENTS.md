# nope: 10 Cheap Experiments

Labels: **[A]** assumption, **[U]** unverified, **[F]** founder, **[D]** repo document. Every threshold here is **[A]**: change it once you see real numbers.

**Read this first: small numbers lie.** At Phase 1 budgets, most tests will have tens of clicks and single-digit sales. Treat a difference smaller than about 2x as noise. Look for big, obvious winners, and repeat a surprising result before you bet on it. Log every experiment in the "Experiments" tab of the sheet (METRICS.md).

Order to run: E1, E5 and E6 in weeks 2 to 3 (they shape everything else); E2, E3, E7, E8 in weeks 3 to 5; E4 and E9 after 50 are sold; E10 any time it fits.

---

### E1. Five angles, five reels ads

- **Hypothesis:** the "leave it in another room" angle (A1) gets the lowest cost per lead, because it explains why a physical puck matters.
- **How:** prospecting campaign, one broad ad set, 5 reels ads (R1 to R5 in GTM.md: room, tap, privacy, pay once, bedtime). Same end card, same landing, angle-matched headline via `?a=`.
- **Cost:** Rs 4,500 (Rs 450/day for 10 days).
- **Success metric:** cost per landing page view and cost per lead per ad; hook rate.
- **Win:** one angle at under Rs 25 per landing page view and under Rs 200 per lead.
- **Kill criteria:** after 4 days and about Rs 1,000 per ad, pause any ad with hook rate under 15% or CTR under 0.4%. If every ad is above Rs 50 per landing page view at day 10, stop spending and re-shoot with a different first second, not a different budget.

### E2. Three hooks on the winning angle

- **Hypothesis:** the first 2 seconds drive most of the difference; a new hook on the winning body beats a new angle.
- **How:** duplicate the E1 winner 3 times, change only the first 2 seconds (for example: a spoken line, a text-only frame, the tap sound in close-up).
- **Cost:** Rs 3,000 inside the step 2 budget.
- **Success metric:** hook rate and cost per lead versus the original.
- **Win:** any hook with 30%+ better cost per lead becomes the new control.
- **Kill:** hooks with hook rate below the original after Rs 1,000 each.

### E3. Reel vs static vs carousel (same angle)

- **Hypothesis:** reels win on reach and cost per click, but the 5 card carousel wins on lead rate because it answers objections.
- **How:** winning angle as reel (R), 4:5 static (S) and carousel (C1) in the same ad set.
- **Cost:** Rs 3,000.
- **Success metric:** cost per lead and lead to paid rate by format.
- **Win:** keep any format within 1.5x of the best cost per lead in rotation (Meta likes variety [U]).
- **Kill:** a format above 2x the best cost per lead after Rs 1,000.

### E4. Price test for batch 2 (Rs 1,499 vs Rs 1,999 vs Rs 2,499) on a waitlist

- **Hypothesis:** Rs 1,999 converts within 20% of Rs 1,499 while making more per unit; Rs 2,499 drops sharply. (Personas split: some said Rs 999 to Rs 1,499, Rohan read Rs 1,999 as cheap [D].)
- **How:** run **after the 50 are sold**, on the batch 2 waitlist page only. Three page variants by link (`?p=1499`, `?p=1999`, `?p=2499`), traffic split by three identical ads differing only in URL. CTA: "Reserve at Rs X, pay when batch 2 is ready". Then invite reservers to pay and measure real payments.
- **Honesty rule:** anyone who reserved at a price **gets that price**. Never show a price you won't honour. Rs 1,999 stays the Phase 1 price [F].
- **Cost:** Rs 6,000 (Rs 2,000 per variant), plus margin given up on Rs 1,499 reservations.
- **Success metric:** reservation rate per landing page view, then reservation to paid rate, then revenue per 1,000 visitors.
- **Win:** pick the price with the highest **revenue per visitor**, not the highest conversion.
- **Kill:** stop any variant at 200 landing page views with zero reservations.

### E5. "Pay now" vs "Chat first" call to action

- **Hypothesis:** for a new brand taking UPI, "Chat on WhatsApp to pre-order" converts more visitors to paid than a direct "Pay with UPI" button, because people want a human first.
- **How:** two site variants (`?c=pay`, `?c=chat`), same ad, 50/50 split by two ads with different URLs.
- **Cost:** Rs 0 extra (inside E1 spend), plus founder chat time (track minutes per sale).
- **Success metric:** paid orders per 100 landing page views, and founder minutes per paid order.
- **Win:** the variant with more paid orders per visitor unless it costs over 20 minutes of chat per sale [A].
- **Kill:** after 300 landing page views per variant, drop the loser.

### E6. Trust block above the fold

- **Hypothesis:** putting the privacy and lost-puck answers (a 20 second clip plus two lines) right under the hero raises lead to paid conversion, because the permission is the top objection [F].
- **How:** variant A: standard order (privacy further down). Variant B: trust block directly below the hero. Also: half of new WhatsApp leads get the 45 second privacy and rescue video before the payment link, half get the link only.
- **Cost:** Rs 0 extra.
- **Success metric:** lead to paid rate within 7 days per variant; count of privacy questions asked in chat.
- **Win:** a 30%+ higher lead to paid rate, or half the privacy questions.
- **Kill:** no difference after 60 leads per variant: keep the simpler page.

### E7. Gift angle and gift page

- **Hypothesis:** a gift framing ("Not a lecture. Just a puck.") reaches a different buyer (siblings, partners, parents of adult children, friends) with a higher order value through the two-pack.
- **How:** reels ad R7 and static S5 to a gift variant of the site (`?a=A7`): gift note, setup call for the recipient, "ship to someone else" field. Run in week 4 to 6 (end of year gifting [A]).
- **Cost:** Rs 3,000.
- **Success metric:** cost per paid order and share of two-packs.
- **Win:** cost per paid order within 1.3x of the best angle, or 25%+ two-pack share.
- **Kill:** above Rs 850 per paid order after Rs 3,000.

### E8. Seed 5 creators with real units

- **Hypothesis:** honest posts from 5 small Indian creators produce more paid orders per rupee than the same unit cost spent on ads, and give us real proof for A9.
- **How:** week 5, 5 creators with 5,000 to 50,000 followers [A] who post everyday life, desk or productivity content. Free unit, no script, no obligation, "gifted" disclosure in writing [U: ASCI]. Give each a link (`utm_source=creator_name`) and a code.
- **Cost:** 5 units at your unit cost (about Rs 1,850 at the assumed Rs 370 [A]) plus shipping.
- **Success metric:** paid orders and leads per creator; whether any post is usable as a partnership ad [U].
- **Win:** 3+ paid orders total, or one post you can run as an ad with permission.
- **Kill:** zero posts after 3 weeks: stop seeding; try paid micro creators only in Tier 2.

### E9. Hinglish vs English

- **Hypothesis:** Hinglish on-screen text and voice ("Phone kitchen mein hai.") lowers cost per lead with a broad India audience.
- **How:** the top 2 ads, English vs Hinglish versions, same visuals. Optional Hindi-only version later.
- **Cost:** Rs 3,000.
- **Success metric:** cost per lead and cost per paid order.
- **Win:** 25%+ lower cost per lead with similar lead to paid rate.
- **Kill:** worse cost per lead after Rs 1,000 per ad.

### E10. Optional: one physical poster with a QR (small segment test)

- **Hypothesis:** students in a paid self-study library or a hostel (strongest pain in the research [D]) convert better than broad ads, at near zero cost.
- **How:** with the owner's or warden's permission, one A4 poster plus a demo puck at the front desk for 2 weeks. QR to the site with `utm_source=poster&utm_content=[place]`. Offer the owner Rs 200 per sale [A].
- **Cost:** about Rs 300 for prints [U] plus travel.
- **Success metric:** scans (count landing views with that UTM), leads, paid orders.
- **Win:** 3+ paid orders in 2 weeks: consider 3 more locations as a side channel.
- **Kill:** under 20 scans in the first week, or zero sales in 2 weeks.

---

## Experiment log columns (sheet tab "Experiments")

`id | name | hypothesis | start date | end date | variants | spend Rs | primary metric | result per variant | sample size | winner | confidence (low/med/high) | decision | what we learned (one line)`
