# CEO briefing for the MD

Update 9 Nov (later): CFO numbers adopted (DECISION_LOG D19): contribution Rs 977, break-even CAC Rs 725, CA call now in tranche 1.

Author: CEO. Date: Mon 9 Nov 2026 (Day 0). Version: v1 (3 agent reports still pending, see section 9).
Labels: FACT (seen in a repo file or tool output), ASSUMPTION (planning number), UNVERIFIED (believed, not checked).

## 1. Verdict in one line

nope is NOT profitable and cannot be by tomorrow morning (zero customers, zero revenue, nothing tested on a real phone), but the fastest honest path to a profitable first 50 orders is now fully planned: prove the tap in 7 days, prove a stranger pays in 14 days, and spend at most Rs 8,600 of your Rs 10,000 to find out.

## 2. Status dashboard

| Workstream | Owner | State | Colour | Next action |
|---|---|---|---|---|
| Tap works on real phones | CTO | Never run on a real phone. Fallback mode code exists, strict mode not started, test protocol file missing | RED | Install on 3 phones Wed 11 Nov (Gate G0) |
| NFC read through the shell | CPO | New two part design done, not printed. Fit and read unverified | RED | Place print order today |
| Physical samples | CPO + MD | Old-file cart exists (Rs 272.30). New-file order not placed | AMBER | Approve print order (decision D12) |
| Demand | CMO | Test ladder written (very good), nothing run | RED | Free signals from Thu 12 Nov |
| Unit economics | CFO | Workbook done, UNIT_ECONOMICS.md missing. Base contribution about Rs 1,000 per order before ads | AMBER | Update case cost for the new two part design |
| Legal and compliance | CLO | Research done, nothing verified. Employer contract unread, no trademark search, GST open | AMBER | MD reads contract Day 0, no customer money before that |
| Brand and website | Creative | Logos and tokens done, landing v2 in progress (uncommitted), placeholders remain | AMBER | Landing in waitlist mode only until Gate G1 |
| Play Store | CTO + CLO | Docs drafted, no account, risk unverified | AMBER | Pay fee after Gate G1, not before |
| Operations | COO | Playbook, templates, macros done | GREEN | Business bank account and payment link |
| Customer experience | CCO | Journey, setup guide, check-ins done. 37 UI issues found (14 high) | AMBER | CTO fixes the top 6 before any pilot |
| Strategy and risk | CSO | One pager, review synthesis done (R1 to R24) | GREEN | Fold into risk register |
| Money in | none | Rs 0 revenue | RED | Cannot change by tomorrow |

## 3. Decisions I made (full list with reasons in DECISION_LOG.md)

1. No paid traffic to anything that takes money until the NFC test and the 3 phone lock test pass. Free signals and the Rs 1,000 hook test run now, but only to a waitlist page that takes no payment.
2. Print order confirmed with changes: 2 new bodies, 3 new caps, 1 coupon strip, 2 old simple pucks, one vendor, one shipment, cap Rs 1,500 (section 7).
3. Break-even ad cost per paid order is about Rs 725 (CFO), not Rs 1,235. Scale ceiling is Rs 600, target Rs 400. The old Rs 850 ceiling is a learning-phase tolerance only.
4. Rs 199 refundable reservations only after Gate G1 and a business payment channel (earliest Wed 18 Nov). No personal UPI ID.
5. Strict mode is opt-in, off by default, absent from any Play build until CLO and CTO sign off. We never say "cannot be bypassed".
6. Google Play fee is paid after Gate G1 (Mon 16 Nov), not today. Phase 1 ships a direct APK, Play is not on the path to the first 50.
7. Ship-by date for the founding batch is set only after Gate G1. Working date: Tue 15 Dec 2026 (ASSUMPTION).

## 4. Approvals I need from you (maximum 5)

| # | Approval | My recommendation | Cost | By when |
|---|---|---|---|---|
| A1 | Pay for the print order after Instinct builds the cart and shows the quote | Yes. If the quote is above Rs 1,500, drop to the reduced list in DECISION_LOG D12 | Up to Rs 1,500 | Mon 9 Nov |
| A2 | Day 0 buys: domain getnope.in, 25 mm NTAG213 stickers (2 packs of 10), felt pads, bumpers | Yes. Domain price is UNVERIFIED (about Rs 850) | Up to Rs 1,500 | Mon 9 Nov |
| A3 | Rs 1,000 Meta hook test: log in, accept terms, press Publish on Fri 13 Nov | Yes, but only if Gate G0 passed and the page is in waitlist mode | Rs 1,000 | Fri 13 Nov |
| A4 | Before any customer money: read your employment contract (20 min), open a separate business bank account or UPI, book one CA call | Yes. These are the only legal steps that block everything | CA call about Rs 1,000 (UNVERIFIED) | Contract today, account by Tue 17 Nov |
| A5 | Release the second Rs 5,000 only when Gate G1 passes: pilot kit Rs 1,500, CA call Rs 1,000, Play fee about Rs 2,100 | Yes, on G1 only. Step 2 ads (Rs 3,000 to 4,000) are NOT inside your Rs 10,000 and need a fresh yes on Fri 20 Nov | Rs 4,600 | Mon 16 Nov |

## 5. The 5 actions for tomorrow (Tue 10 Nov)

| # | Action | Who | Founder minutes | Cost |
|---|---|---|---|---|
| 1 | Pay for stickers and print order if not paid Monday evening | MD | 10 | counted in A1, A2 |
| 2 | Finish Meta ad account setup: log in, ID check, payment method, Rs 1,000 account spend limit | MD, with Instinct clicking through | 30 | Rs 0 now |
| 3 | WhatsApp Business app on your phone, set quick replies from ops/SUPPORT_MACROS.md | MD | 20 | Rs 0 |
| 4 | Send the interview recruitment message (VALIDATION_SCRIPT.md section 2) | MD sends, Claude drafted | 10 | Rs 0 |
| 5 | Ask 2 friends to lend phones on Wed (one Samsung, one Xiaomi or Realme, ideally one on Android 13 or higher) | MD | 5 | Rs 0 |

Total about 75 minutes. First 3 days total about 3.9 hours.

## 6. Three biggest risks

1. The tap does not work reliably on real phones or through the 2.4 mm printed skin (RED, never tested). If it fails, nothing else matters. Test on Wed 11 Nov and Mon 16 Nov.
2. Setup wall. A sideloaded APK on Android 13 or higher may need "allow restricted settings" before the accessibility toggle works (UNVERIFIED). This can kill activation for the first 50. Tested on Wed 11 Nov.
3. Strangers do not pay at a cost we can afford. Break-even is about Rs 725 per paid order (CFO), and nobody knows the real number. Learned first on Fri 20 Nov (hook and page cost) and properly only at Step 2.

## 7. Where the business stands on profitability (honest)

- Revenue today: Rs 0. Customers: 0. Profit: negative, about Rs 3,000 to Rs 8,600 of planned spend by Day 14.
- On our own assumptions, one order earns about Rs 977 before ads (range Rs 342 to Rs 1,629, ASSUMPTION, workbook). It is profitable per order only if the full cost of getting that customer is below about Rs 725 and refunds stay near 15 percent.
- Nobody knows the real ad cost for this product in India. That single number decides everything and we will first see a real number on Fri 20 Nov, and a trustworthy one around Fri 4 Dec.
- Earliest honest dates: first paid order from a friendly buyer Wed 18 Nov; first paid order from a stranger via an ad Tue 24 Nov to Mon 30 Nov (needs your yes to Step 2 funding); first 10 pucks delivered about Fri 27 Nov; first 50 sold about mid Dec 2026 to Jan 2027; first 50 cash break-even after refund windows close about Feb 2027. All ASSUMPTION.
- What cannot happen by tomorrow morning: any revenue, any proof of demand, any proof the tap works, any profit.

## 8. Files

ORG_CHART.md, DECISION_LOG.md, OKRS_14_DAYS.md, CRITICAL_PATH.md, RISK_REGISTER.md, AGENT_ORDERS.md, KILL_CRITERIA.md, PROFIT_PLAN.md (all in this folder). Reports from C-suite in reports/.

## 9. Waiting on

CTO (test protocol, strict mode, health indicator, flavour split), CFO (UNIT_ECONOMICS.md, re-run with new case cost), CPO (README, RISKS_AND_QC.md, PACKAGING.md), Creative (landing v2 and visuals), CLO (any update), CMO (landing page spec delivery). COO and CSO reports: COO.md and CSO.md not yet in ceo/reports at time of writing. I will finalize v2 when you tell me the last agents are done.
