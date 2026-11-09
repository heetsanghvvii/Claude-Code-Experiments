# Profit plan

Author: CEO. Date: Mon 9 Nov 2026. Source: business/unit_economics.xlsx (CFO, recalculated by me with LibreOffice), product/BOM_AND_COSTS.md (CPO), marketing/DEMAND_TEST.md (CMO). UNIT_ECONOMICS.md was not yet written at the time of this v1.
Labels: FACT (a number in a file or listing), ASSUMPTION (planning number), UNVERIFIED (needs outside check). Every unit economics input below is ASSUMPTION unless stated. Nothing here is a promise of profit.

## 1. Plain statement

The business has Rs 0 revenue, 0 customers and no tested product. It cannot be profitable by tomorrow morning. This plan defines profit honestly so we know the exact conditions to reach it and the earliest dates we could honestly see it.

## 2. Definitions (three levels)

| Level | Definition | Earliest realistic date (ASSUMPTION) |
|---|---|---|
| L1 Unit profit | One order is contribution positive after refunds, shipping, packaging, payment fees, ops time, support time, founder time at Rs 200 per hour, GST on ads and creative cost | Measured on the first 20 orders, about Mon 7 Dec 2026 |
| L2 Batch 1 cash break-even | All cash spent on the first 50 batch (envelopes, test ads, pilot kit, tools, fees) is back, net of refunds and held deposits | About Feb 2027, after the 30 day refund window of the last order closes |
| L3 Monthly profit | A month with positive contribution after ads, creative, tools and fixed fees, founder time still valued | Not before Mar 2027 and only if CAC is under about Rs 600 for 2 months |

## 3. Unit economics (per order placed, base case)

From the workbook, base column, then adjusted for the two part case.

| Line | Rs | Label |
|---|---|---|
| Price paid | 1,999 | FACT (locked) |
| Net revenue after 18 percent GST inside the price | 1,694 | ASSUMPTION (GST treatment UNVERIFIED, CA call needed; if not registered, net is 1,999 and everything improves) |
| Materials: case 60, sticker 22, cap or pad 45, box 60 | 187 | ASSUMPTION, partly FACT (vendor quote on a placeholder file, listings) |
| Shipping out | 90 | ASSUMPTION |
| Payment fee, assembly and QC time, support time, replacement allowance | 130 | ASSUMPTION |
| Refund cost at 15 percent refund rate (revenue given back, handling, reverse shipping, less recovered parts) | 261 | ASSUMPTION |
| Contribution before ads (workbook) | 1,045 | computed |
| Adjustment for the heavier two part design (BOM file says parts Rs 126 incl scrap plus bumpers and foam, versus workbook case plus cap Rs 105) | minus about 45 | ASSUMPTION until a vendor quotes the new files |
| **Contribution before ads, used by the CEO** | **about 1,000** | ASSUMPTION |
| Range (workbook low to stress) | 340 to 1,630 | ASSUMPTION |
| Cash only contribution (without founder time) | about 1,085 | ASSUMPTION |

Compare: NOPE_PLAN said Rs 1,235, BOM said Rs 1,270, CSO said Rs 1,135. All overstate because refunded revenue, founder time or ad GST were missing.

## 4. The conditions under which it is profitable

Ad GST of 18 percent is added to every Meta rupee (UNVERIFIED, check the first invoice). Creative cost loaded at Rs 120 per order (workbook base).

| Quantity | Value | Meaning |
|---|---|---|
| Break-even CAC as shown in Meta (ex GST) | about Rs 750 | (1,000 minus 120 creative) divided by 1.18. Above this every order loses money |
| Target CAC | Rs 400 or less | Leaves room for founder time, support, mistakes |
| Scale ceiling | Rs 600 | We do not raise spend above a pilot level if the 7 day average CAC is above this |
| Learning tolerance | Rs 850, only while total test ad spend is under Rs 18,000 | This is a research cost, we say so, and each order loses about Rs 80 to Rs 100 |
| Maximum refund rate | 25 percent at CAC 600; 38 percent at CAC 400; about 15 percent at CAC 750 | Each extra refund point costs about Rs 18 per order (ASSUMPTION) |
| Minimum landing page view to paid conversion | 4.2 percent if a landing page view costs Rs 25; 2.5 percent if Rs 15; 6.3 percent at Rs 25 for the Rs 400 target | CAC equals cost per view divided by conversion |
| Share of orders from free sources | Each 20 percent of orders from network or organic lowers blended CAC by 20 percent | Cheapest lever |

Honest reading. The CMO's own funnel gives about 1.5 percent direct conversion plus a waitlist route of about 2 percent (METRICS.md, ASSUMPTION). At Rs 25 per view that is a CAC of about Rs 700 to Rs 1,700, which is at or above break-even. Profit therefore needs one of: cheaper views (Rs 15 or less), conversion of 3 percent or more, or at least 40 percent of the first 50 from free sources. We do not know any of these yet.

## 5. First 50 batch, cash view (ASSUMPTION throughout)

| Item | Rs |
|---|---|
| Gross cash from 50 orders at Rs 1,999 | 99,950 |
| Less 15 percent refunds | minus about 15,000 |
| Less GST inside price (if registered) | minus about 13,000 |
| Less materials, shipping, fees, ops cash at about Rs 480 per order | minus about 24,000 |
| Cash margin before ads and fixed costs | about 48,000 |
| Fixed and test costs through Day 14 (envelopes) | minus about 8,600 |
| Ad spend steps 2 and 3 (CMO ladder: Rs 4,000 and Rs 10,000, plus ad GST) | minus up to 14,000 |
| Result before founder time | about plus 25,000 if all 50 sell and refunds stay at 15 percent |

Break-even is the point where blended CAC across all 50 equals about Rs 600 to Rs 700 (cash view). Case: if only 25 orders sell for the same spend, the batch loses money. Fewer than 20 orders from a fair test is a stop (KILL_CRITERIA).

## 6. Monthly view (illustrative, ASSUMPTION)

Fixed monthly: creative Rs 3,000, tools and domain about Rs 500, Play fee amortised excluded. Founder time already valued in contribution.

| Scenario | Orders per month | CAC (Meta, ex GST) | Contribution after ads and creative per order | Monthly result |
|---|---|---|---|---|
| Good | 40 | 400 | about 410 | about plus 13,000 |
| Break even | 25 | 600 | about 170 | about plus 1,000 |
| Bad | 40 | 850 | about minus 120 | about minus 8,000 |
| Stress | 10 | 1,400 | strongly negative | about minus 20,000 |

The comfort line for manual ops is 10 orders a week and the break line is about 15 a week (COO). Above that we need a helper or a gateway checkout, which is a cost not in this model.

## 7. Dates

| Milestone | Earliest honest date | Needs |
|---|---|---|
| First paid order (friendly buyer, Rs 199 or full) | Wed 18 Nov 2026 | G1 passed, business payment channel, contract read |
| First paid order from a stranger via an ad | Tue 24 Nov to Mon 30 Nov | Step 2 funded (new MD yes on Fri 20 Nov) |
| First 10 pucks delivered | Fri 27 Nov (if prints land by Mon 16 Nov) | Print order today |
| 20 paid orders (unit profit read, L1) | Mon 7 Dec | Step 2 go |
| 50 sold | Mid Dec 2026 to Jan 2027 | Gates pass |
| Batch 1 cash break-even (L2) | About Feb 2027 | CAC under Rs 600, refunds under 15 percent |
| Monthly profit (L3) | Mar 2027 at the earliest | Two clean months |

## 8. What cannot happen by tomorrow morning

- Any revenue, any customer, any profit.
- Proof that the tap works.
- Proof that strangers pay or what they cost.
- A tax or legal answer (CA and lawyer needed).
- Play Store approval (closed test needs 14 days after launch, LIKELY).

## 9. Open items for the CFO

Re-run the workbook with the new case design and vendor quote; add a tab for the envelope ledger; write UNIT_ECONOMICS.md; model the effect of the Rs 199 deposit on cash; model GST both ways (registered and not).
