# Review synthesis: three outside AI investor reviews

Author: CSO. Date: 9 Nov 2026. Scope: every criticism, merged, checked against the repo.

Labels: FACT = seen in a repo file or code. ASSUMPTION = a planning number with no data. UNVERIFIED = believed true, not checked. Numbers come only from repo files; none are invented.

Outcome of the reviews [FACT, from the brief]: 0 of 18 investor votes were yes. All three said pass today. A pass today on a pre-launch product with zero customers is the correct reading, not an insult. The job is to earn a different answer with evidence.

How to read "True?": YES = our files confirm it. PARTLY = true with a qualification. RISK = a plausible risk, not yet a fact.

## 1. Decision matrix

Owner roles: CEO, COO, CCO (customer), CTO, CFO, CMO, CPO, CLO, CREATIVE, MD (founder), CSO. Costs are only given where a repo file gives a number; otherwise "low" or "unknown, to be quoted".

| # | Criticism (merged) | Raised by | True given our files? | Severity | Decision | Owner | Cost | Deadline |
|---|---|---|---|---|---|---|---|---|
| R1 | Nothing has run on a real phone with a real tag | All 3 | YES. NOPE_PLAN section 1 and 13.8: "no real device test yet" [FACT] | Critical (gates everything) | DO. Borrow 5 or more Android phones across brands, run the dev build then a real tag | CTO | Low: tags Rs 15 to Rs 30 each [FACT, plan], phones borrowed | 16 Nov |
| R2 | Play Store may reject the accessibility-based blocker | All 3 | RISK. COMPLIANCE_INDIA section 9 says Play limits the API and a blocker is "a risk area" (LIKELY, not verified) [UNVERIFIED] | High at scale, low for first 50 (direct APK) | TEST. Read the current Play accessibility policy text, write the disclosure, and spike a fallback (Usage Access plus overlay) to see if it blocks reliably. Do not promise a Play date | CTO with CLO | Play registration one time US$25 [UNVERIFIED, COMPLIANCE] | Policy read 20 Nov; fallback spike 30 Nov |
| R3 | Android 13 and later restricts accessibility for sideloaded APKs | 2 of 3 plus brief | RISK. COMPLIANCE_INDIA section 9 says toggles are greyed out until "allow restricted settings" in App Info [UNVERIFIED]. If true, it hits every first-50 buyer because Phase 1 is a sideloaded APK | High. It can kill activation for the first 50 | TEST on Android 13, 14 and 15 phones in week 1. If true: write a 4-step setup guide, record a 30 second video, and test whether Play closed or internal testing install avoids it [UNVERIFIED] | CTO, CCO for the guide | Low | 16 Nov |
| R4 | Bypass is easy (disable permission, uninstall, clone the tag) | All 3 | YES. NOPE_PLAN 11 and 14 admit it. Extra bypass the plan does not list: the tag token is a readable text record, so a Rs 15 to Rs 30 sticker can be written with the same token and kept in a pocket, defeating "leave it in another room" [FACT for design in 13.4] | High for the retention promise, medium for the first 50 | DO the honest framing: "reduces impulsive opens, does not make it impossible". TEST how many pilot users bypass in 4 weeks (ask). DEFER signed tags (NTAG 424 DNA) and device-admin uninstall protection. REJECT any "unbreakable" claim | CPO, CMO for claims | Low | Claims rule now; bypass question in day 7 and day 28 check-ins |
| R5 | Demand is unproven | All 3 | YES. Zero customers [FACT]. Marketing DEMAND_TEST.md already says Rs 1,000 of ads cannot prove demand | Critical | TEST via the DEMAND_TEST ladder. Success signal is a stranger from an ad paying, not clicks | CMO | Rs 1,000, then Rs 3,000 to Rs 5,000, then Rs 10,000 plus 10 real pucks [FACT, DEMAND_TEST] | Step 1 starts after R1 passes |
| R6 | Persona research is simulated and seeded with Rs 5,700 | All 3 | YES. NOPE_PLAN 3.2 says so itself [FACT] | High (bad evidence is worse than none) | DO. Treat as hypothesis only. Run 10 real interviews with a script that does not state any competitor price | CCO with CMO | Low (time) | 22 Nov |
| R7 | Unit economics incomplete: refunds waste shipping and packaging, founder time, ops, GST. Rs 1,235 is a break-even ceiling | All 3 | YES, and worse than the reviews say: NOPE_PLAN 9.2 gives Rs 1,235 but BOM_AND_COSTS gives Rs 1,270 at 50 units. BOM counts only the cost of a return, not the refunded revenue. My arithmetic on BOM inputs: Rs 1,270 minus 8 percent of Rs 1,694 refunded = about Rs 1,135 [ASSUMPTION inputs]. At 20 percent returns the BOM sensitivity row shows Rs 1,232 but true figure is about Rs 893 [my arithmetic] | High | DO. CFO rebuilds one model: refunds lose revenue, add founder time at a stated rate, support minutes, GST scenarios (registered or not), gateway and fixed costs. Publish one number | CFO | Low | 20 Nov |
| R8 | No way to measure week 4 retention | 2 of 3 | PARTLY. The app has no analytics by design [FACT, METRICS.md]. METRICS uses a self-reported day 28 check-in (north star: locked on 4 or more of days 22 to 28) [FACT] | High (it is the north star) | DO self-report via WhatsApp check-ins plus a 1-tap in-app "did you lock today" prompt that stays on the phone and is shown to the user to relay. REJECT third party analytics SDKs for now (they break the "nothing leaves your phone" claim). Revisit an opt-in anonymous counter only after CLO sign-off | CCO, CTO | Low | Check-in template 16 Nov |
| R9 | Founder time 8 to 10 hours a week is too small | All 3 | YES [ASSUMPTION in plan Appendix B] | Critical | DO. Cut scope (see ONE_PAGER "will not do"), hand everything agent-doable to roles, and set a rule: if founder time cannot reach about 15 hours a week by December, stretch every date by the same ratio rather than cut quality [my recommendation] | CEO, COO | Time | 13 Nov decision |
| R10 | Trademark for a common word | 2 of 3 | YES. COMPLIANCE_INDIA section 8: "nope" is weak and crowded likely; no search done [FACT: not done] | Medium now, high after spend on brand | DO. Free IP India public search this week for "nope" and variants in Classes 9, 42, 35. Plan a modifier or logo mark. Filing fee about Rs 4,500 per class for individuals [UNVERIFIED] | CLO | About Rs 4,500 per class plus attorney [UNVERIFIED] | Search 16 Nov; filing decision 30 Nov |
| R11 | GST treatment open | 2 of 3 | YES. Registration threshold, HSN and whether Rs 1,999 is inclusive are all "ask a CA" [FACT] | Medium | DO. Single CA call with the written questions already in COMPLIANCE_INDIA | CLO, CFO | CA fee, unknown | 20 Nov |
| R12 | Domain not bought | 2 of 3 | YES. getnope.in seen available at about US$9.98 a year, not purchased [FACT, plan 6.1] | Low cost, high embarrassment (site uses a placeholder) | DO today | CEO/MD | About US$9.98 a year | 10 Nov |
| R13 | Employer contract (IP, conflict, moonlighting) | 2 of 3 | YES. COMPLIANCE_INDIA section 12 lists it as unread [FACT] | Critical gate: if the employer claims IP, nothing else matters and no investor will fund | DO first. The MD reads the contract and, if unclear, gets one hour with a lawyer | MD, CLO | Low | 13 Nov, before any ad money |
| R14 | NFC read through the printed case unverified | 2 of 3 | YES. NFC_ENGINEERING marks distance and phone variation as unverified [FACT]. Also BOM file still says terracotta PETG while the locked palette is charcoal and saffron, so the real case colour is not settled; pigments with metal can break reads [FACT, NFC_ENGINEERING] | High (a puck that does not tap is a refund) | DO. Test matrix: 3 skin thicknesses by 5 or more phones by with and without a phone case. Write a pass bar before testing | CPO, CTO | Print cost: placeholder quote Rs 61 for one, Rs 2,097 for 50 [FACT] | 20 Nov |
| R15 | NFC-less phones | 2 of 3 | PARTLY. Nothing in our files measures the share of target phones without NFC [UNVERIFIED]. The site does not gate on it [no evidence it does] | Medium (cheap phones, mostly in the broad audience) | DO. Add "Does your phone have NFC? How to check in 10 seconds" to the site and to the WhatsApp script. Count the answers | CMO, CCO | Zero | 16 Nov |
| R16 | Defer iPhone, Bluetooth, subscription, custom hardware | All 3 | AGREE with plan. Roadmap already defers them | Medium | DEFER all four. Exception in D2 below (low-cost iPhone option work) | CEO | none | Revisit at 500 units |
| R17 | Two reviews: narrow the audience. One: stay broad | Split | See disagreement D1 | High | See D1 | CMO, CSO | Low | 13 Nov |
| R18 | One review: pull Apple approvals forward | Split | See disagreement D2 | Medium | See D2 | CTO | About US$99 a year for the developer program [UNVERIFIED, COMPLIANCE section 10] | See D2 |
| R19 | Payment checkout (manual UPI vs gateway) | Split | See disagreement D3 | High | See D3 | CFO, CTO | Gateway about 2 percent [UNVERIFIED] | 18 Nov |
| R20 | Brick can undercut or localize; hardware is easy to copy; moat is thin | Implied in all 3, stated in plan section 7.2 | YES, and honest answer is "little moat today" | High over 12 months | DO. Pick a moat option now (COMPETITION.md recommends wedge plus community) | CSO, CEO | Low | 20 Nov |
| R21 | The 30 day refund wastes shipping, packaging and founder time | Part of economics | YES (see R7) | Medium | TEST. Keep the 30 day refund for the first 50 because trust beats margin at launch [my judgment]. Measure refund rate and reason. Decide the policy for batch 2 with data. Do not drop the guarantee: Brick has one [FACT, plan section 7] | CFO, CCO | Refund cost per BOM | After first 50 |
| R22 | Support and lock-out burden on a solo founder | Part of founder time | YES, plan lists as High | High | DO. Rescue code and emergency unlock are built [FACT]; CCO owns a macro library and a rule that nobody is locked out more than 2 hours | CCO | Low | Before first shipment |
| R23 | Manufacturing beyond 50 not quoted | Part of ops | YES. Tooling and minimums "not yet quoted" [FACT] | Medium | DEFER molding. BOM file says molding pays back vs print farm only after about 7,100 units [FACT, BOM, my reading]. Get two print-farm quotes for 500 | COO | Low | 15 Dec |
| R24 | Advertising claims and platform policy (ASCI, Meta) | Plan risk | RISK [UNVERIFIED] | Medium | DO. Claims checklist already in marketing PLAN; CLO to check ASCI guidance once | CLO | Low | 20 Nov |

## 2. The three disagreements, with recommendations inside the MD's locked decisions

Locked: Rs 1,999, nope brand with charcoal and saffron, broad audience on Instagram and Meta ads, Android first, no subscription.

### D1. Audience: narrow (two reviews) vs broad (one review)

- What the reviews argue: narrowing makes messages sharper and lowers cost per sale; staying broad gives scale and lets Meta find buyers.
- What our files say: the plan chose broad on purpose and admits "no group is already hungry for it" [FACT, plan 3.1]. Simulated personas split on price and objections, so they cannot choose a segment for us [FACT].
- Recommendation: do not touch the locked decision. Keep Meta targeting broad (no interest or age targeting for the first test). Narrow the creative, not the audience. Run two hero angles, each speaking to a specific moment, and let the data show who responds. See STRATEGY_ONE_PAGER.md for the two angles and the one to avoid.
- Why this is safe: Meta's delivery system picks who sees broad ads; creative that speaks to one moment pre-selects viewers without us changing targeting [my reasoning, UNVERIFIED in practice].
- Review trigger: if after Step 3 of the demand ladder one angle beats the other by 2x or more on cost per paid order, ask the MD to reopen the targeting lock for that angle only.

### D2. iPhone timing: defer (two reviews) vs pull Apple approvals forward (one)

- What our files say: iPhone needs the paid Apple program and a Family Controls entitlement request, reviewed by Apple, timeline "days to weeks or longer" [UNVERIFIED, COMPLIANCE section 10]. The iOS prototype is untested [FACT, plan section 14].
- Recommendation: split the decision. Do not build or ship iPhone in 2026 (Android first stays locked). But start the long-lead, low-cost, zero-engineering step: enrol in the Apple developer program and submit the entitlement request once the MD is ready to pay. Cost is about US$99 [UNVERIFIED]; the benefit is that the slow external clock starts while we do the Android work.
- Also capture demand: the website already has an /iphone answer and a waitlist [FACT, GTM]. Count iPhone requests. If iPhone is more than about one third of waitlist requests [my threshold, ASSUMPTION], raise the priority; if not, it stays parked.
- Risk to flag: an iPhone owner can already build a free Shortcuts NFC tag automation [UNVERIFIED], so iPhone value is lower than Android value until we build a real lock.
- Owner: CTO for the application, CEO to approve spend. Deadline: decision 20 Nov.

### D3. Payment checkout: manual UPI and WhatsApp vs a real gateway now

- What our files say: Phase 1 uses manual UPI and WhatsApp, gateway after about 100 orders [FACT, plan 8.3]. COMPLIANCE_INDIA section 11 warns that collecting many unrelated payments on a personal UPI ID can get flagged or frozen, and says gateway payment links are the cleanest for 50 units [FACT, UNVERIFIED in detail]. GTM notes Meta cannot optimise for purchases when payment happens off-site [FACT].
- Recommendation: use a gateway hosted payment link (fixed amount, auto receipt, traceable refund) for every order that comes from an ad. Keep plain UPI only for friends and network orders. Do not build a full checkout or backend yet; the payment link is a no-code step. Needs a business bank account in the proprietorship name and gateway KYC, so start now.
- Owner: CFO opens the account and gateway; CTO adds the link and order code to the site. Deadline: 18 Nov, before any stranger traffic.
- Cost: gateway fee about 2 percent [UNVERIFIED]; already in the BOM model as Rs 47 per unit [FACT].
- Fallback if gateway KYC is slow: run Step 1 (creative test only, no sales promised) on Rs 1,000 and delay money steps until the gateway is live.

## 3. Criticisms the reviews did not make but I add (red team)

1. Tag cloning defeats the core promise (R4 above).
2. The BOM file and the plan disagree on contribution (Rs 1,270 vs Rs 1,235), and the BOM does not subtract refunded revenue (R7).
3. Case colour in BOM is terracotta while the locked palette is charcoal and saffron; the product photo and the box must match the brand [FACT, BOM header].
4. Meta account risk: a new ad account with a hardware claim can be restricted; one restriction would stop the primary channel [UNVERIFIED]. Mitigation: a second route (WhatsApp, creators, network) is already in GTM.
5. Google announced developer verification for sideloaded apps from 2026 [UNVERIFIED, COMPLIANCE section 9]. A sideload-only plan could get harder mid-year. CTO to monitor.

## 4. What I would do first (ordered)

1. 10 Nov: buy the domain. 13 Nov: MD reads the employer contract.
2. 16 Nov: first real-phone test, Android 13 to 15 included (R1, R3).
3. 18 Nov: gateway link live (D3).
4. 20 Nov: NFC through-case test, CA call, trademark search, one economics model.
5. Only then: Rs 1,000 ad test.
