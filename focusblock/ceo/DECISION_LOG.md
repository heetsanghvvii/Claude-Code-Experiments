# Decision log

Author: CEO. Date: Mon 9 Nov 2026. Labels: FACT, ASSUMPTION, UNVERIFIED. Locked by the MD and never changed here: price Rs 1,999, name nope, tagline "Put it down.", charcoal and saffron, broad audience on Instagram and Meta, Android first, no subscription.
Format: context, options, decision, owner, trigger to revisit.

## D1. Sell before the NFC test passes?
- Context: DEMAND_TEST starts paid traffic Fri 13 Nov. Nothing has run on a real phone (FACT, NOPE_PLAN section 1). Three outside reviews called this the top gap.
- Options: (a) sell now, (b) free signals and Rs 1,000 hook test now, money later, (c) wait for everything.
- Decision: (b). Gate G0 (3 phone lock test with bare tags) must pass before the Rs 1,000 hook test is published. Gate G1 (NFC through the printed shell) plus a business payment channel must pass before any page asks for money. Until then the page is a waitlist and the button says "Join the first 50". No Rs 199 reservation, no UPI QR.
- Owner: CEO sets, CMO and Creative implement, CTO certifies gates.
- Revisit: if G1 fails twice, stop all outbound marketing (KILL_CRITERIA K1).

## D2. Dates: CMO plan versus reality
- Context: GTM.md assumes paid pre-orders from Mon 16 Nov and site v2 by 14 Nov (FACT). Units cannot ship before late Nov, and G1 may only be possible about Mon 16 Nov (print lead time UNVERIFIED).
- Decision: DEMAND_TEST.md replaces GTM.md for the first 14 days (the CMO already said so). GTM "paid pre-orders 16 to 22 Nov" is cancelled. Reservations open no earlier than Wed 18 Nov. Remove the copy "Ships about 3 to 4 weeks after pre-order" until a ship-by date is set. Working founding batch ship-by date: Tue 15 Dec 2026 (ASSUMPTION, set only after G1). Pilot of 10 ships Mon 23 to Fri 27 Nov if prints arrive on time. If we miss the ship-by date by more than 7 days, full refund on request.
- Owner: CMO, COO. Revisit: when G1 passes.

## D3. Copy that promises more than the app can do
- Context: product and landing copy was written before the app was tested.
- Decision: Verified Claims List owned by CTO. Anything not on the list cannot appear in an ad, page or card. Banned until verified: "nothing leaves your phone" (needs manifest check for INTERNET permission, UNVERIFIED), "never locked out" (say "backup code and emergency unlock"), "cannot be bypassed", "works on every Android", schedules, per-feature blocking, iPhone, any health or addiction claim, any Brick comparison. Allowed: Android with NFC, Rs 1,999 once, no subscription, 30 day refund, leave it in another room, backup code, emergency unlock.
- Owner: CTO (list), CLO (policy), CMO and Creative (comply). Revisit: weekly.

## D4. Strict mode versus Play policy
- Context: investors said bypass is too easy. Strict mode (harder to turn off) is not started in the repo (FACT, no match in src). Play restricts sensitive permissions (UNVERIFIED).
- Options: always on, opt-in, skip.
- Decision: opt-in, off by default, labelled "Strict mode (harder to turn off, you can always use your backup code)". Not included in any Play build until CLO and CTO sign off. Marketing says "makes opening apps a deliberate act", never "unbypassable". A permission-lost banner and a blocking-health indicator (CCO items) ship before the pilot; they are higher priority than strict mode.
- Owner: CTO. Revisit: if week 1 pilot shows over 30 percent of users disabling the service (self-reported).

## D5. Play Store submission timing and detection mode
- Context: sideloaded APK on Android 13 or higher may need restricted settings (UNVERIFIED). Accessibility blockers may be rejected (UNVERIFIED). New personal accounts need a closed test with at least 12 testers for 14 days (LIKELY, CLO). Fallback usage mode code exists (FACT, UsageMonitorService.kt).
- Decision: Phase 1 ships a direct APK with accessibility as primary mode and a documented "allow restricted settings" step. Pay the Play fee (about Rs 2,100, UNVERIFIED) after G1, not today. Play build uses the fallback usage mode by default if CTO shows it works on 3 phones; accessibility mode is declared only if the fallback fails. CTO confirms feasibility of the two flavours by Fri 20 Nov. Closed test target start Fri 20 Nov, which makes production access Fri 4 Dec at the earliest and realistically Dec to Jan.
- Owner: CTO, CLO. Revisit: Android 13+ phone cannot enable accessibility after the guide steps, then ship the fallback mode in the sideload build too.

## D6. Manual UPI versus a payment gateway
- Context: CLO warns personal UPI with many unrelated credits can be flagged (LIKELY). CSO recommends a gateway payment link for ad orders. Plan said gateway after 100 orders (FACT).
- Decision: No personal UPI ID, ever. Before any money: business bank or UPI account in the proprietorship name, and a gateway hosted payment link if KYC clears by Wed 18 Nov. If KYC is late, first money steps wait, not the ads. Plain UPI to the business account only for known network buyers. Full checkout stays deferred until about 100 orders.
- Owner: COO (setup), MD (KYC, signatures), CFO (reconcile). Revisit: if gateway KYC not done by Fri 20 Nov, hold the Rs 199 reservations.

## D7. Refund policy details
- Context: 30 day refund is locked. Details are open. Workbook models no-return refunds with 25 percent returned (ASSUMPTION).
- Decision: 30 days from delivery, to the original payment method, within 3 working days of request, return not required in batch 1 but we ask for a photo of the setup problem or a return if the buyer is willing. One refund per person. Rs 199 reservation refundable any time before shipping, within 3 working days, no questions. Defective unit: we pay reverse shipping and replace or refund. Missed ship-by date by more than 7 days: full refund on request. Remove "no questions" wording; say "no forms, no argument". Day 28 reminder of the window (CCO).
- Owner: COO, CLO checks wording. Revisit: after first 20 refund events, or refunds above 15 percent.

## D8. Profit definition and which numbers are the truth
- Context: NOPE_PLAN says Rs 1,235 (reviewers: a ceiling), BOM file says Rs 1,270 (8 percent refunds, no founder time), workbook says Rs 1,045 base (15 percent refunds, founder time at Rs 200 per hour, ad GST 18 percent), CSO says Rs 1,135.
- Decision: the workbook is the single source of truth. Adjusted for the heavier two part case (BOM parts Rs 126 vs workbook Rs 60 plus Rs 45 cap), I use about Rs 1,000 per order before ads (ASSUMPTION). Break-even CAC about Rs 750 after creative cost; target Rs 400; scale ceiling Rs 600; learning-phase tolerance Rs 850 only while total test spend stays under Rs 18,000. Details in PROFIT_PLAN.md.
- Owner: CFO updates workbook case cost after the vendor quote. Revisit: when real quote or first 20 orders arrive.

## D9. Rs 199 reservation
- Context: reservations are a stronger signal than clicks (CMO). The price is locked at Rs 1,999, so a deposit is a payment mechanism, not a new price.
- Decision: allowed after G1 and a business payment channel, counts toward Rs 1,999, refundable before shipping. Deposit money is the customer's money; it is never spent on ads or parts. Network payments get non-ad order codes and never count as ad results.
- Owner: CMO, COO. Revisit: if fewer than 3 stranger payments by Fri 20 Nov, try "pay in full" only.

## D10. Hero messages
- Context: reviews say keep the hero about the ritual and test two hero angles. CMO built A1 room, A5 bedtime, A4 pay once. CSO proposes study focus as second hero.
- Decision: page hero A = "Leave it in another room" (ritual). Hero B = "Break time stays break time" (study and work focus) via ?a= parameter. Step 1 ads stay the CMO's three reels (room, bedtime, pay once). A study-focus reel is added to Step 2. Meta targeting stays broad. No teen or parent angle.
- Owner: CMO, Creative. Revisit: Step 2 result, if one hero beats the other by 2x or more on cost per paid order, ask the MD to reopen targeting for that angle only.

## D11. Retention measurement without app analytics
- Context: app collects nothing (FACT). CCO designed WhatsApp check-ins at day 1, 3, 7, 14, 28.
- Decision: no analytics SDK in v1 (protects the privacy promise). Measure by WhatsApp check-ins plus an opt-in local "share my week" card that the user sends if they want to. Non-replies count as not retained. Result is called "early signal", never "proven". CTO builds blocking-health and share card for the pilot, not for the hook test.
- Owner: CCO, CTO. Revisit: if reply rate is under 50 percent by day 28.

## D12. The first physical print order (decided)
- Context: Instinct built a Zbotic cart for 4 old simple orange PETG pucks at Rs 272.30 including Rs 44.23 shipping, not ordered (FACT from MD). CPO built a new two part design (nope_body.stl 64 x 16 mm, nope_base_cap.stl bayonet cap, nfc_test_coupons.stl for 1.0 to 4.0 mm). Fit and read are unverified (FACT, build_report.txt). My earlier recommendation: 2 sets new, 1 coupon strip, 2 old.
- Options: (a) old pucks only, (b) new design only, (c) mix.
- Decision: confirm (c) with two changes. Order in ONE shipment (shipping is a fixed Rs 44 per order, so combine):
  1. 2 x nope_body.stl
  2. 3 x nope_base_cap.stl (one extra cap because the bayonet fit is the likeliest failure and caps are small)
  3. 1 x nfc_test_coupons.stl (216 x 40 x 4 mm; if the vendor bed cannot take it, split into two strips)
  4. 2 x old simple puck (cheap baseline, fallback if the bayonet fails, and the thing we can film with)
  5. All parts: plain matte PETG, same orange, same lot. No silk, metallic, glitter or carbon filament (NFC_ENGINEERING). Colour: use orange for everything. The coupons must be the same colour as the production body, and black filament may contain carbon pigment (UNVERIFIED), so charcoal waits until after the NFC test.
  6. Do not select faster shipping unless the extra is under Rs 100.
  7. Cost cap Rs 1,500 including shipping. If Instinct's cart total is above that, reduce in this order: old pucks to 1, caps to 2, coupons to one half strip (1.0 to 3.0 mm only). If still above Rs 2,000, stop and send me the quote.
  8. Buy the same day with the print: 2 packs of 10 x 25 mm NTAG213 (blank, unlocked), 1 pack of 58 mm felt pads, 1 pack of 10 mm bumpers. Skip 18 mm stickers for now (cost-down option only).
  9. Free proxy test while prints are in transit: stack plastic cards (about 0.76 mm each, standard card thickness, UNVERIFIED for your cards) over a bare sticker to simulate 2.3 and 5.3 mm.
- Why overrule 4 old pucks: they would test nothing new and cost the same shipping. Why add a cap: one bad bayonet print kills the whole test.
- Owner: CPO specifies, Instinct carts, MD pays. Revisit: if bodies arrive warped or the cap does not engage, run the felt-pad fallback and reorder once (Rs 1,000 reserve).

## D13. Spend envelopes
- Decision: Tranche 1 (Rs 5,000): prints up to Rs 1,500, domain, stickers, felt and bumpers up to Rs 1,500 total, Meta hook test Rs 1,000, reserve Rs 1,000 for one reprint = Rs 5,000. Tranche 2 (Rs 5,000, released only on G1): pilot kit Rs 1,500, CA call about Rs 1,000, Play fee about Rs 2,100, leaves about Rs 400. Step 2 ads (Rs 3,000 to 4,000) are outside the Rs 10,000 and need a new MD yes on Fri 20 Nov. Total through Day 14 if all spent: about Rs 8,600 without the reprint reserve being used.
- Owner: CFO tracks every rupee in the workbook. Revisit: any line above plan by 20 percent.

## D14. Employer contract, trademark, GST
- Decision: MD reads the employment contract Day 0 (moonlighting, IP, conflict) and no customer money is taken until that is done. Trademark: free IP India search by Instinct and CLO this week, no filing until Step 2 is GO; if an identical or close live mark exists in Class 9 or 42, pause paid ads until a lawyer opinion. GST: do not print any GST line or claim registration status. Show "Rs 1,999, MRP inclusive of all taxes" and keep a clean sales ledger. Book one CA call with the written questions in business/COMPLIANCE_INDIA.md. These are not legal or tax conclusions; they are sequencing decisions.
- Owner: MD, CLO. Revisit: CA or lawyer answer.

## D15. NFC-less phones
- Decision: the page and the WhatsApp pre-order script ask for phone model and a 10 second NFC check. No payment is accepted without a confirmed NFC phone. Count the answers. Refund covers errors.
- Owner: CMO, COO.

## D16. Scope cuts
- Decision: deferred until after 50 orders: iPhone build (Apple paperwork clock may start later, MD decision), Bluetooth, subscription, custom hardware, the nest accessory, molded tooling, paid tier, schedules. Hardware thesis only. Spare puck bundle stays as an idea, tested with a WhatsApp offer after pilot.
- Owner: CEO.

## D17. Org and conflict rules
- Decision: C-suite structure in ORG_CHART.md. CTO owns technical truth, CLO owns legal wording, CFO owns the money gate, CEO decides all other conflicts. MD only decides money, public actions and locked items.
- Owner: CEO.

## D18. CLO follow-ups (9 Nov, from ceo/reports/CLO.md)
- Context: CLO asks for a decision on the seller address, "one refund per person", and the 30 day start date when the courier shows no delivery date.
- Decision: (1) "One refund per person" stays an internal abuse rule and is removed from public wording until a lawyer reviews it. (2) The 30 day window starts on the courier delivered date; if the courier shows none, it starts 7 days after dispatch. (3) Seller address: a legally required geographic address is LIKELY (CLO). Publishing the MD's home address is the MD's personal choice, so it goes to the MD as an approval item, not a CEO decision. My recommendation: use a low-cost business address option if one exists under Rs 1,000 a year (UNVERIFIED); otherwise the home address on the box and legal pages only, never in ads or social posts. Placeholders stay until the MD answers.
- Owner: CLO drafts, MD decides address. Revisit: lawyer review of the refund wording.
- Note: my 6 allowed messages in this run are used, so this is recorded here and will go to the CLO in the next run.

## D19. CFO numbers adopted (9 Nov, from ceo/reports/CFO.md and business/UNIT_ECONOMICS.md)
- Context: CFO's recalculated base contribution before ads is Rs 977 (low 1,629, stress 342). Break-even CAC in Ads Manager: Rs 828 variable, Rs 726 loaded with creative. If not GST registered: Rs 1,236 and loaded break-even Rs 946 (the CA answer is worth about Rs 260 per order). At Rs 850 each paid order loses about Rs 146. All ASSUMPTION.
- Decision: these replace my rounded figures (about Rs 1,000 contribution, Rs 750 break-even) everywhere. Ceiling: Rs 725. Scale ceiling: Rs 600. Target: Rs 360 to 400. Rs 850 learning tolerance is kept only while total test ad spend stays under Rs 18,000, and the cost of about Rs 146 per order is accepted knowingly.
- Envelope: CFO's tranche 1 sums to exactly Rs 5,000 (print 1,500, domain 850, stickers and pads 650, Meta 1,000 plus 180 GST, CA call 820). This moves the CA call into tranche 1 (earlier than my plan, still before any customer money) and removes my separate Rs 1,000 reprint reserve. Tranche 2 on G1: pilot kit Rs 1,500 and Play fee about Rs 2,100, leaving about Rs 1,400 as reserve for a reprint. Total through Day 14 up to Rs 8,600 stays correct.
- Owner: CFO. Revisit: vendor quote for the new files, CA answer on GST.

## D20. CPO reply and the terracotta conflict (9 Nov)
- Context: CPO delivered the print order spec (product/README.md "Order A") matching D12. Old puck v0.2 (60 x 12 mm) restored at product/case/legacy/nope_puck_v0.2_60x12.stl. Coupons are now a 3+2 grid of 128 x 84 mm, so no bed split needed. README, RISKS_AND_QC, PACKAGING, MANUFACTURING_ROADMAP written. CPO did not replace "terracotta" (its brief said terracotta #C65D3B) and logged it as founder decision 1.
- Decision: the locked palette is charcoal plus saffron orange (#FF8A1F). Terracotta is obsolete; it was the rejected first direction (NOPE_PLAN 6.2). All product docs, box and print colour follow saffron or orange. First prints are orange PETG either way, so nothing changes in the order. The CPO keeps a vendor quote request for the new files (MANUFACTURING_ROADMAP section 5) as a Day 1 task for Instinct to prepare, MD to approve.
- Owner: CPO. The CPO must send me its report via a ceo/reports/CPO.md file; I created it from its message.

## D21. CTO delivery (9 Nov, from ceo/reports/CTO.md)
- Context: CTO reports, all UNVERIFIED on a phone: blocking-health warning ("LOCKED, NOT BLOCKING"), Setup doctor (NFC off, no NFC, brand battery steps, Android 13+ restricted settings), usage access fallback mode, strict mode (off by default, APK only, can be compiled out), local share-my-week card, CCO quick fixes (puck wording, first-lock rehearsal, backup code confirm, NFC timeout, rescue support button). docs/ANDROID_TEST_PROTOCOL.md and docs/CLAIMS_VERIFIED.md (partial) written. tsc clean.
- Decision: this clears the engineering part of the pilot-readiness list ahead of schedule, so G0 on Wed 11 Nov is now limited only by phones and stickers. Strict mode stays off by default and out of any Play build (D4 stands). "Nothing leaves your phone" stays banned until the release APK is checked for the INTERNET permission. The G0 and pilot builds must be the standalone or production profile, not the tester profile with TEST_MODE buttons (CTO to name the exact EAS profile in the protocol). The WhatsApp number in src/support.ts is a placeholder; MD supplies the real number before the pilot.
- Owner: CTO. Revisit: G0 result.
