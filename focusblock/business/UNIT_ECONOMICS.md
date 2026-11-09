# nope unit economics (CFO, Mon 9 Nov 2026)

Source of truth: `business/unit_economics.xlsx` (live formulas, blue = input, black = formula, recalculated with LibreOffice, zero formula errors; Sensitivity sheet has two self checks that tie to the Unit economics sheet). Labels: FACT (vendor or listing value), ASSUMPTION, UNVERIFIED (needs outside check). Every figure below is ASSUMPTION unless stated. Nothing here is a promise of profit.

Reconciled with `product/BOM_AND_COSTS.md` (now present). Base case case cost is Rs 126, the BOM two part set at 50 units (Rs 115 plus 10 percent scrap). Still open: a real vendor quote for the new files.

## 1. One base case (per order placed, Rs)

Base = GST registered with 18 percent inside the price (UNVERIFIED), 15 percent refunds, founder time at Rs 200 per hour, ad GST of 18 percent not recoverable (UNVERIFIED), Rs 3,000 a month creative spread over 25 orders.

| Line | Low | Base | Stress | Label |
|---|---|---|---|---|
| Price paid | 1,999 | 1,999 | 1,999 | FACT (locked) |
| Net revenue (ex GST) | 1,999 (not registered) | 1,694 | 1,694 | UNVERIFIED |
| Case (body plus cap) | 42 | 126 | 275 | FACT for 42 (Zbotic Rs 2,097 for 50, placeholder file, incl GST); 126 per BOM; 275 per GTM.md |
| NFC sticker | 15 | 22 | 30 | FACT (Rs 15 to 30 listings) |
| Pad or foam and bumpers | 30 | 45 | 60 | ASSUMPTION |
| Box and insert card | 40 | 60 | 80 | ASSUMPTION |
| Outbound shipping | 60 | 90 | 120 | ASSUMPTION |
| Landed cost, delivered | 187 | 343 | 565 | |
| Payment fee | 0 | 20 | 47 | ASSUMPTION |
| Assembly, QC and support time | 18 | 77 | 225 | ASSUMPTION |
| Replacement allowance | 4 | 17 | 57 | ASSUMPTION |
| Refund rate | 8% | 15% | 25% | ASSUMPTION |
| Refund cost beyond landed cost (expected) | 161 | 260 | 459 | computed |
| **Contribution before ads** | **1,629** | **977** | **342** | computed |
| Contribution, cash only (no founder time) | 1,649 | 1,061 | 598 | computed |
| **Break even CAC, as Ads Manager shows it (ex ad GST)** | 1,629 | **828** | 290 | computed |
| **Break even CAC, loaded with creative** | 1,629 | **726** | negative | computed |
| Break even gross ROAS (price over CAC) | 1.2 | **2.4** (2.8 loaded) | 6.9 | computed |
| Target CAC (half of loaded break even) | 815 | about 360 | none | computed |

Cost of ONE refunded order on top of giving the money back: about Rs 404 base (landed cost, gateway fee, handling, expected reverse shipping, less recovered parts). Sunk outbound shipping and packaging stay in the landed cost on every order, so they are not added twice. Phase 1 policy is refund with no return, so only 25 percent of refunds come back and only half of those are resellable (inputs).

GST both ways (base otherwise): not registered gives contribution Rs 1,236 and loaded break even CAC Rs 946; registered gives Rs 977 and Rs 726. The CA answer is worth about Rs 260 per order. Ad GST still applies in both unless credit is claimable.

## 2. The three numbers, reconciled

| Number | Where | What it is | Why it differs |
|---|---|---|---|
| Rs 1,235 | NOPE_PLAN 9.2 | 1,694 x 90 percent minus Rs 290 landed | Correct arithmetic on thin inputs. No ops time, support, reverse shipping, handling, replacement, ad GST, creative. Refund 10 percent |
| Rs 1,270 | BOM at 50 units | Net revenue minus landed cost Rs 424 | Counts only the cost of a return, never the refunded revenue (8 percent of 1,694 = Rs 135) |
| Rs 1,135 | CSO | BOM less refunded revenue | Right fix for revenue, but still 8 percent refunds and no support time |
| Rs 1,045 | workbook v1 | Case Rs 60 | Single part case |
| **Rs 977** | **workbook now** | **BOM parts Rs 126** | **Use this** |
| About Rs 1,000 | CEO PROFIT_PLAN | 1,045 minus about 45 | Same answer within Rs 25; the break even CAC of about Rs 750 corresponds to Rs 726 (loaded) here. Use Rs 725 |

Bridge from CSO Rs 1,135 to Rs 977: refund rate 15 percent instead of 8 (revenue given back, handling, reverse shipping, net) minus 100; support time minus 33; assembly and QC at Rs 200 per hour with 13 minutes against BOM Rs 30 and wider materials, minus 37; replacement 5 percent against 3 percent, minus 10; shipping Rs 90 against 85, minus 5; gateway 1 percent against 2.36 percent, plus 27. Total minus 158.

## 3. What the three investor reviews got right and wrong

Right: unit economics were incomplete; founder time, support, reverse logistics, GST and ad costs were missing; Rs 1,235 is a ceiling, not a break even you can plan on; the CAC is the unknown that decides everything.
Wrong or loose:
- "Before sunk refund costs": the Rs 290 landed cost is charged on all orders, so sunk shipping and packaging on refunded orders were already inside Rs 1,235. The real omissions are reverse shipping, handling, the unit not being resellable, and the higher refund rate.
- Rs 1,235 treated as the break even CAC. It is a ceiling before ad GST (divide by 1.18) and creative. Loaded, it is about Rs 725.
- GTM.md's Rs 1,229 column treats Rs 1,999 as untaxed revenue while also assuming GST inside the price; its Rs 970 column uses a Rs 275 case that no quote supports.
- Break even ROAS of 1.6 is too low: 2.4 (2.8 loaded).
- BOM is more careful on landed cost than the plan but missed refunded revenue.

## 4. The 5 inputs that matter most, and how to measure each in the first 50 orders

| Rank | Input (base) | Effect | Measure |
|---|---|---|---|
| 1 | CAC (unknown) | Break even 726 loaded; at 850 every paid order loses about Rs 146 | Ads Manager spend divided by ad attributed paid orders, 7 day window; network orders get non ad codes and are excluded. Log in the orders sheet |
| 2 | Refund rate (15%) | About Rs 17 of contribution per point; 10 percent gives Rs 1,064 | Refund requests and reasons inside the 30 day window; count only paid orders delivered 30 days ago. Add a reason code |
| 3 | GST treatment (registered) | Rs 260 per order | CA call. Record the answer and date in the Inputs sheet |
| 4 | Founder time (13 min assembly and QC, 10 min support, Rs 200 per hour) | Rs 77 base; Rs 84 per order at Rs 200 per hour | Stopwatch the first 10 builds; keep a WhatsApp minutes tally per order and per refund |
| 5 | Case cost and defects (Rs 126, 5 percent replacements) | Case Rs 60 to 126 moves contribution about Rs 68 | Vendor quote for the real files; count failed NFC reads and reprints per batch |

Also watch: landing page view to paid conversion. CAC equals cost per view over conversion; at Rs 25 per view, break even needs about 3.4 percent (726 loaded, 828 variable: 3.0 to 3.4 percent).

## 5. Scenarios (base case, selected CAC Rs 850 in the cash flow, 6 months)

| | 50 units | 500 units | 5,000 units (stretch) |
|---|---|---|---|
| Net revenue | 84,703 | 847,034 | 8,470,339 |
| Contribution before ads (incl time) | 48,850 | 488,500 | 4,885,000 |
| Ad budget at CAC 400 / 600 / 850 / 1,200 / 1,800 (with ad GST) | 14k / 21k / 30k / 42k / 64k | 189k / 283k / 401k / 566k / 850k | 2.1M / 3.2M / 4.5M / 6.4M / 9.6M |
| Cash up front (inventory + ads + setup) | 48,023 | 546,975 | 5,884,700 |
| Peak cash gap in the monthly flow | 529 | 3,162 | 35,669 |
| Cumulative cash turns positive | month 2 | month 2 | month 3 |

Read with care: paid share is 60, 80 and 90 percent, so blended CAC is lower than the paid CAC. Pre-order cash arrives the same month as the spend in this simple model, which flatters the peak gap; the up front row is the conservative number. Break even CAC applies to paid orders. At CAC 1,200 the 500 unit case loses about Rs 96,000 after ads.

## 6. Sensitivity (Sheet Sensitivity)

Break even CAC (Ads Manager, variable) falls about Rs 74 for every 5 points of refund rate and about Rs 44 for every Rs 50 of landed cost; at 15 percent refunds and Rs 350 landed cost it is Rs 822, at 25 percent and Rs 500 it is Rs 545.

| Offer | Contribution before ads (low / base / stress) | Base break even CAC | Base ROAS to break even |
|---|---|---|---|
| Single Rs 1,499 | 1,169 / 622 / 36 | 527 | 2.8 |
| Single Rs 1,999 | 1,629 / 977 / 342 | 828 | 2.4 |
| Single Rs 2,499 | 2,089 / 1,332 / 648 | 1,129 | 2.2 |
| Two pack Rs 3,499 | 2,870 / 1,738 / 628 | 1,473 (Rs 869 per puck) | 2.4 |

The two pack nearly doubles contribution for one CAC (second box and parcel shipping are inputs). Rs 1,499 gives up Rs 355 per order and drops break even CAC under the Rs 600 ceiling: do not discount.

## 7. Budget plans (Sheet Budget plans, Envelope ledger)

Founder cash plans, aligned to the CEO decisions. Customer deposits (Rs 199) are customer money, tracked on the ledger sheet, never budget.

| Plan | Spend | What it buys |
|---|---|---|
| Rs 1,000 | Rs 700 sample prints and test stickers, Rs 300 interview thank-yous | The physical proof: does NFC read through the shell on real phones |
| Rs 5,000 (tranche 1) | Print order Rs 1,500; domain Rs 850; stickers, pads, bumpers Rs 650; Meta test Rs 1,000 plus Rs 180 GST (waitlist only, Fri 13 Nov); CA and contract steps Rs 820 | Real puck, waitlist, first CAC and cost per view reading. No Play fee yet |
| Rs 10,000 (tranche 2, on G1) | Tranche 1 plus Play fee Rs 2,100 (only after the NFC read test through the shell passes), CA top up, one small Meta step Rs 1,500, thank-yous | Play closed test clock, a second CAC read |
| Rs 75,000 | Adds scale steps Rs 11,000 media plus GST, pilot kit, boxes, 50 unit inventory and shipping, 2 months creative, refund reserve Rs 15,000; buffer Rs 9,740 | Batch 1 funded end to end. Apple Rs 8,300 left outside, released only after Gate 4 |

## 8. Recommended order of spending

1. Print order, up to Rs 1,500, and the NFC read test through the shell (free): nothing else matters if it fails.
2. Domain and stickers, up to Rs 1,500, and the interviews (nearly free).
3. Rs 1,000 Meta test on Fri 13 Nov to a waitlist, no payment. It gives cost per view and cost per lead, not CAC.
4. CA and contract steps, about Rs 1,000: GST answer is worth Rs 260 per order, more than any other single input.
5. Play fee Rs 2,100, only after the NFC read test passes.
6. Small Meta step Rs 1,500 after G1; read CAC against Rs 725 (ceiling) and about Rs 360 (target).
7. Pilot kit and boxes only once 20 paid orders show CAC under break even.
8. Apple developer Rs 8,300: deferred until the Android gate and the iPhone waitlist justify it.

Best use of Rs 5,000: tranche 1 as above. Best use of Rs 10,000: add Play fee and one gated Meta step, release the second Rs 5,000 only on G1.
