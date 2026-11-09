# Risk register

Author: CEO. Date: Mon 9 Nov 2026. Labels: ASSUMPTION, UNVERIFIED. Probability and impact are CEO judgements on a 1 to 5 scale (ASSUMPTION). Treatment: ACCEPT, MITIGATE, KILL the idea. Costs in Rs. Founder minutes per week are ASSUMPTION.
Note: the original list of 15 red team risks was not a file in the repo. I built the 15 below from the brief and the CSO review synthesis (strategy/REVIEW_SYNTHESIS.md R1 to R24), and mapped the 12 investor concerns in section 2. Reconcile when the CSO confirms its list.

## 1. Fifteen risks

| # | Risk | P | I | Treatment | How, who, by when | Cost | Founder min |
|---|---|---|---|---|---|---|---|
| 1 | Tap never tested on a real phone | 5 | 5 | MITIGATE | G0 on Wed 11 Nov, G1 Mon 16 Nov. CTO, CPO | 0 plus prints | 120 |
| 2 | NFC read fails through the printed shell or on some phones | 3 | 5 | MITIGATE | Coupons 1.0 to 4.0 mm, 5 phones, felt pad fallback, thinner skin option. CPO by Mon 16 Nov | 1,000 reprint reserve | 60 |
| 3 | Android 13+ restricted settings blocks accessibility on sideloaded APK (UNVERIFIED) | 4 | 5 | MITIGATE | Test on Android 13, 14, 15; guide with screenshots; fallback usage mode in the sideload build if needed. CTO, CCO by Thu 12 Nov | 0 | 30 |
| 4 | Play rejects the accessibility blocker | 3 | 3 for first 50, 5 later | MITIGATE | Phase 1 is direct APK. Play flavour with fallback usage mode, fee after G1, closed test from Fri 20 Nov. CTO, CLO | Play fee about 2,100 | 20 |
| 5 | Bypass too easy (turn permission off, uninstall, tag clone) | 5 | 3 | ACCEPT with honesty | Permission-lost banner, opt-in strict mode, never claim "unbypassable". Weekly check-in asks about it. CTO, CMO | dev time | 0 |
| 6 | Demand unproven, personas simulated at a seeded Rs 5,700 | 4 | 5 | MITIGATE | Ladder: free signals, Rs 1,000 hook, Rs 199 reservations, Step 2. 10 real interviews with no competitor price in the script. CMO, CCO | 1,000 now | 300 |
| 7 | Unit economics worse than assumed (refunds, GST, ops, founder time) | 4 | 4 | MITIGATE | Workbook is truth; update with real quotes; break-even CAC Rs 750. CFO | 0 | 0 |
| 8 | Ad cost per paid order above break-even | 4 | 5 | MITIGATE | Stop rules K6 to K12; free sources first; hook test before conversion test. CMO, CFO | up to 14,000 later | 20 |
| 9 | Cannot measure week 4 retention (app collects nothing) | 5 | 3 | MITIGATE | WhatsApp check-ins day 1, 3, 7, 14, 28, opt-in share card, "early signal" wording. CCO, CTO | 0 | 10 |
| 10 | Founder time too small (8 to 10 hours per week) | 4 | 5 | MITIGATE | Hands-off map, 7 hours per week in the plan, helper rule at 15 orders a week, stretch dates not quality. CEO, COO | 0 | n/a |
| 11 | Trademark on the common word "nope" | 3 | 4 | MITIGATE | Free search now, filing after Step 2 go, modifier or logo mark fallback. CLO | filing about 4,500 to 9,000 per class (UNVERIFIED) | 10 |
| 12 | GST and invoice treatment unclear | 3 | 3 | MITIGATE | One CA call with written questions; no GST line until answered; clean ledger. CLO, CFO by Wed 18 Nov | about 1,000 | 30 |
| 13 | Employer contract (IP, moonlighting, conflict) | 2 | 5 | MITIGATE | MD reads it Day 0; no customer money before. CLO template email if needed | 0 | 20 |
| 14 | NFC-less phones cause refunds | 3 | 3 | MITIGATE | Page NFC check and WhatsApp confirm before payment; log answers. CMO, COO | 0 | 0 |
| 15 | Payment and platform risk: personal UPI flagged, Meta account restricted, ad claims policy | 3 | 4 | MITIGATE | Business account and payment link; no personal UPI; claims list; organic fallback. COO, CLO, CMO | 0 | 20 |

Further risks I track (not in the 15): print vendor lead time and single vendor (COO supplier comparison, MITIGATE with 2 quotes), bayonet fit (reprint), silent failure of blocking with "LOCKED" shown (CTO health indicator, before pilot), lost puck and lost code (rescue route open item, COO and CCO), copy risk (Brick price cut or localisation, ACCEPT, moat is speed and support), founder ID and KYC lead times, DPDP and WhatsApp consent for check-ins (CLO wording), TEST_MODE buttons shipped in release builds (CTO confirm off).

## 2. The 12 recurring investor concerns, mapped

| # | Concern | Treatment | Where handled |
|---|---|---|---|
| 1 | Nothing run on a real phone with a real tag | MITIGATE | Risk 1, G0 and G1 |
| 2 | Play may reject the accessibility blocker | MITIGATE | Risk 4, D5 |
| 3 | Android 13+ restricted settings for sideloaded APKs | MITIGATE | Risk 3 |
| 4 | Bypass too easy | ACCEPT with honest copy | Risk 5, D4 |
| 5 | Demand unproven, simulated research | MITIGATE | Risk 6, demand ladder |
| 6 | Unit economics incomplete | MITIGATE | Risk 7, PROFIT_PLAN.md |
| 7 | No way to measure week 4 retention | MITIGATE | Risk 9, D11 |
| 8 | Founder time too small | MITIGATE | Risk 10 |
| 9 | Legal: trademark, GST, domain, employer contract | MITIGATE | Risks 11 to 13, D14 |
| 10 | NFC through the case and NFC-less phones | MITIGATE | Risks 2 and 14 |
| 11 | Defer iPhone, Bluetooth, subscription, custom hardware | KILL these ideas for now | D16 |
| 12 | Keep the hero about the ritual, test two hero angles | MITIGATE | D10 |

## 3. Ideas killed or deferred

| Idea | Decision | Revisit |
|---|---|---|
| iPhone build | Deferred (Apple paperwork clock is an MD decision later) | After 500 units or iPhone waitlist above one third of requests |
| Bluetooth beacon, custom hardware | Killed for Phase 1 | After 500 units |
| Subscription or paid tier | Killed (locked) | Not before month 6 |
| Magnets, nest accessory, molded tooling | Deferred | After 50 sold and a 5,000 unit forecast |
| Selling before NFC test | Killed | n/a |
| Parent-and-teen angle, health or addiction claims | Killed | n/a |
| Brick comparison in ads | Killed | n/a |
| Full checkout and backend | Deferred to about 100 orders | 100 orders |

## 4. Top 5 by exposure today

Risk 1 and 2 (tap and shell), risk 3 (restricted settings), risk 6 and 8 (demand and CAC), risk 10 (founder time).
