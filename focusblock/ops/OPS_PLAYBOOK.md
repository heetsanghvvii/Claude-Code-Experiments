# nope OPS PLAYBOOK: first 50 units

Owner: COO. Date: 2026-11-09. Scope: ad click to a working locked phone, for the first 50 hand made units.

Labels used on every number: **[F]** fact from our own files, **[A]** assumption (my estimate, change freely), **[U]** unverified (must be checked before relying on it). Nothing here is a vendor claim. Placeholders in square brackets, for example [founder WhatsApp], are to be filled in.

Owners: **Claude** (writes, drafts, analyses, keeps files), **Instinct** (browser agent; stops before any payment), **Founder only** (hands, money, phone, signature, anything physical or a bank app).

Inputs I relied on: GTM.md (order code format `NP-A1-7K2Q`, UTM scheme, ship promise of about 3 to 4 weeks [F], founder time 8 to 10 hours a week for everything [F]), BOM_AND_COSTS.md (parts, box size, 150 g shipped weight [A]), NFC_ENGINEERING.md (25 mm NTAG213, test matrix, lock decision), PRD.md (P0 requirements), COMPLIANCE_INDIA.md (box declarations, refund terms).

---

## CEO decisions applied (2026-11-09, ceo/AGENT_ORDERS.md and DECISION_LOG D7)

- No money before gate G2 (earliest Wed 18 Nov): G1 NFC read through the printed shell on 5 phones, business account, payment link, terms and refund pages live, CLO wording check. Paid pre-orders do NOT open on 16 Nov.
- Order cap: 10 a week comfort, 15 a week hard cap, then a helper or gateway checkout.
- Refund policy (D7): 30 days from delivery, to the original payment method, within 3 working days of request. Return not required in batch 1, but ask for a photo of the setup problem or a return if the buyer is willing. One refund per person. Rs 199 reservation refundable any time before shipping within 3 working days. Defective unit: we pay reverse shipping and replace or refund. Missed ship-by date by more than 7 days: full refund on request. Wording: "no forms, no argument", not "no questions". Day 28 message reminds the buyer of the window. Where section 2 or macros differ, D7 wins.
- Open by Fri 13 Nov: rescue route when puck and code are both lost (proposal: identity check by WhatsApp plus a replacement puck at cost), and two print vendor quotes for the pilot batch.

---

## 0. The flow on one page

```
Ad click -> site (order code made) -> UPI pay with code in note -> screenshot on WhatsApp
 -> 1 Intake and payment match -> 2 Confirmation -> 3 Print order (batched)
 -> 4 Receive and inspect -> 5 Assemble, tag, pair test, QC -> 6 Pack
 -> 7 Ship -> 8 Tracking message -> 9 Delivery check in -> 10 Day 7 -> 11 Day 28
 side paths: refund and return, lost puck, defect, supplier backup
```

Batch rule [A]: do not print one by one. Order prints in batches of 10 units (plus 2 spare sets) once 8 paid orders are waiting, or every Friday if at least 5 are waiting. A batch of 12 sets at the 115 parts per set assumed in BOM is a small vendor order, and one batch cycle (order, print, ship to us) is assumed to take 7 to 10 days [A, U: ask the vendor].

---

## 1. Step by step with owner and time

Founder minutes are per order and are estimates [A] until we time the first 5 orders (log real minutes in the tracker column `founder_min`).

### Step 1. Order intake and payment matching (target: same day, within 24 hours)

| # | Action | Owner | Time |
|---|---|---|---|
| 1.1 | Buyer taps Pay with UPI on the site. Site makes order code (format `NP-<angle>-<4 chars>`, for example NP-A1-7K2Q [F]) and puts it in the UPI note and in the WhatsApp message. Lead row lands in the form backend with UTM values (CTO/Creative own this build) | Site (Creative/CTO) | 0 |
| 1.2 | Buyer sends payment screenshot plus code on WhatsApp. Claude drafts the reply from macro M19 (SUPPORT_MACROS.md) | Claude drafts | 0 |
| 1.3 | Founder opens the UPI or bank app once a day (10:00 and 20:00, or when notified) and checks credits. Match rule: amount is exactly Rs 1,999 AND the note contains the code. If the note is missing or edited, match by amount + payer name + screenshot time [U: UPI apps may not show or may allow edits to the note, per GTM.md] | Founder only | 1.5 min per order (batched) |
| 1.4 | Founder pastes the day's credits (code, amount, payer name, time, UPI ref) into a "payments_in" tab, or sends Claude a screenshot to read. Never send Claude bank passwords or OTPs | Founder only, Claude reads screenshot | included above |
| 1.5 | Claude updates the order tracker row: payment_status = MATCHED, copies UTM from the lead row, flags mismatches (wrong amount, no code, duplicate payment) | Claude | 0 |
| 1.6 | Pre-shipment check by WhatsApp (GTM.md step 1): phone model, Android version, NFC present, case type, delivery address with pincode and a phone number the courier can call | Claude drafts, founder sends | 0.5 min |

Rules:
- Pay-first only after the NFC check on the site. If a buyer has no NFC, refund the same day (no questions) and move them to the waitlist.
- Mismatch older than 48 hours: ask the buyer once, then hold. Never ship on an unmatched payment.
- Keep a payment screenshot in the order folder. Do not store card or bank login details anywhere.
- GST: the invoice type depends on the CA's decision (COMPLIANCE_INDIA.md). Until then issue a numbered receipt `NP-INV-0001` onward. [U]

### Step 2. Confirmation message (within 2 hours of match, in the founder's free windows)

| # | Action | Owner | Time |
|---|---|---|---|
| 2.1 | Claude drafts the confirmation: order code, amount received, expected ship date window (3 to 4 weeks from pre-order [F]), refund terms in one line, what we need from the buyer (address, phone model confirmation) | Claude | 0 |
| 2.2 | Founder reviews and taps send on WhatsApp Business (use a quick reply) | Founder only | 0.5 min |
| 2.3 | Claude sets `confirm_sent` = date in the tracker | Claude | 0 |

### Step 3. Print order to the 3D print vendor (batch)

| # | Action | Owner | Time |
|---|---|---|---|
| 3.1 | Claude checks the trigger (8 paid orders waiting, or Friday with 5) and prepares the print sheet: quantity = paid orders + 2 spare sets + 10 percent scrap [A], files `case/nope_body.stl` and `case/nope_base_cap.stl`, material PETG, matte terracotta, one filament lot, no silk, metallic, glitter or carbon filament (NFC_ENGINEERING.md), infill 30 to 50 percent, wall at least 1.6 mm | Claude | 0 |
| 3.2 | Instinct fills the vendor's quote or cart form up to the review screen and screenshots it (prompt in HANDS_OFF_MAP.md, task T3). It stops before payment | Instinct | 0 |
| 3.3 | Founder reviews the review-screen screenshot against the print sheet and pays | Founder only | 3 min per batch (about 0.3 min per order at batch 10) |
| 3.4 | Claude opens a row in the batch log (print_batch_log.csv): batch id, date, vendor, quantity, price, promised date, lot | Claude | 0 |
| 3.5 | First batch only: order a 3 set sample first and run the whole NFC matrix (NFC_ENGINEERING.md section 4) before ordering 12 sets. This is a gate, not an option | Founder only | counted in the pre-launch plan, not per order |

Never leave the vendor to choose colour or infill. Put the spec in writing on the order and keep the order confirmation.

### Step 4. Receiving and incoming inspection

| # | Action | Owner | Time |
|---|---|---|---|
| 4.1 | Open the parcel the day it arrives. Count sets against the batch log. Photograph the parcel and a tray of the parts | Founder only | 5 min per batch |
| 4.2 | Visual check per part: no warp, no layer splitting, no stringing in the bayonet, the cap turns in the body, "nope" lettering legible, colour matches the terracotta swatch in daylight, no metallic sparkle | Founder only | 1 min per set |
| 4.3 | Weigh 5 sets, record grams (design estimate 32 to 38 g printed [A]) | Founder only | 2 min per batch |
| 4.4 | Claude fills the batch log with accepted, rework and rejected counts, photographs attached by filename | Claude | 0 |
| 4.5 | If reject rate is over 15 percent [A] or any set fails the cap or fit test: stop assembly, message the vendor with photos (macro in SUPPLIERS.md supplier note), do not assemble from a bad lot | Founder decides, Claude drafts | 5 min |

### Step 5. Assembly of body, sticker, cap, pairing test, backup code card

Prepare a 20 minute workstation set up once per batch: tray, tweezers, the foam punch discs, pre-peeled stickers, a coin, a flat desk, the test phones, the app build installed, a stopwatch.

| # | Action | Owner | Time |
|---|---|---|---|
| 5.1 | Press a foam disc onto the post of the cap (adhesive down onto the post, per BOM) | Founder only | 0.5 min |
| 5.2 | Stick the NTAG213 sticker to the inside ceiling of the body, centred under the logo (sticker adhesive side up on the skin ceiling per NFC_ENGINEERING.md section 2). Press 5 seconds | Founder only | 1 min |
| 5.3 | Tag decision: first 10 dev units left unlocked, production units locked after writing (decision in NFC_ENGINEERING.md section 5; pending founder/CTO confirmation). Write the NDEF app link to the sticker with the write tool the CTO specifies, record the 7 byte UID in the tracker. Do the write BEFORE the sticker is hidden if possible | Founder only | 1.5 min |
| 5.4 | Close the cap (quarter turn bayonet), stick 3 silicone bumpers | Founder only | 1 min |
| 5.5 | Shake test 10 seconds, no rattle | Founder only | 0.2 min |
| 5.6 | NFC read test and app pairing test using the QC checklist (templates/qc_checklist.md): 10 of 10 taps on the main test phone, pair in the app, lock, tap to unlock | Founder only | 3 min |
| 5.7 | Rescue code test on the test install: generate the backup code in the app, enter it in the rescue screen, confirm the lock lifts. Then reset the test install so the pairing is clean [U: how a clean re-pair works is a CTO answer] | Founder only | 2 min (first 10 units, then every 5th) |
| 5.8 | Backup code card: the box carries a writable A7 card. The buyer writes their app-generated code on it during setup [A: confirm with CTO that the code is created at the buyer's onboarding, not printed at the factory] | Founder only | 0.3 min |
| 5.9 | Number the puck inside the foot ring or on the seal (01 to 50), log UID against the number and the order code | Founder only, Claude records | 0.5 min |
| 5.10 | Claude fills the QC row. Any fail goes to the defect path (section 7) | Claude | 0 |

5 phone read test (QC rule, my recommendation [A]): the full 5 phone read (the P0 criterion, 10 taps each) is done on the first unit of every print batch, on every 5th unit after that, and on every unit that gives any slow or missed read on the main phone. All other units get the 10 tap test on the main phone plus a second reference phone. This keeps founder time realistic. Founder needs to borrow or hold 5 phone models (1 Samsung, 1 Xiaomi/Redmi/Poco, 1 Realme/Oppo/OnePlus, 1 Vivo/iQOO, 1 Motorola/Pixel per NFC_ENGINEERING.md).

Typical founder time for step 5 per unit: about 9 minutes with the sampled tests [A].

### Step 6. Packing

| # | Action | Owner | Time |
|---|---|---|---|
| 6.1 | Puck in the insert cut-out inside the kraft box. Add quick start card, backup code card, warranty and returns card (Claude writes the text, CLO approves wording), seal sticker with box declarations: maker name and address, product name, net quantity 1 unit, month and year of manufacture, MRP Rs 1,999 inclusive of all taxes, consumer care contact, passive NFC tag / no battery line (COMPLIANCE_INDIA.md section 3; exact wording [U] until CLO signs off) | Founder only | 2 min |
| 6.2 | Add "not for children under 3 / small parts" line [A: confirm with CLO] | Founder only | included |
| 6.3 | Put the box in a courier bag. Weigh on a kitchen scale (design assumption about 150 g shipped [A]). Photo of sealed box with the order code visible for dispute evidence | Founder only | 1 min |
| 6.4 | Print or hand write the shipping label (courier portal or India Post form). Instinct may fill the courier portal form to the review screen, never confirm paid labels itself (T5) | Founder only (Instinct prepares) | 1 min |

### Step 7. Shipping with an Indian courier

Options to compare (prices and service levels are all **[U]**, nothing below is a quote):

| Option | Why consider | What to check before using |
|---|---|---|
| An aggregator such as Shiprocket (one login that routes to several courier partners) | One pickup request, one dashboard, tracking links, partner choice per pincode | Weight slab for 0 to 500 g, rate per zone (metro, regional, rest of India), minimum wallet recharge, pickup from a home address, who handles disputes, RTO (return to origin) charge, weight discrepancy policy, whether we can pass tracking links into WhatsApp |
| Delhivery direct or a similar national courier | Wide pincode reach, usually the partner behind aggregators | Whether they onboard a tiny home seller directly, account minimums, pickup frequency, NDR (non delivery report) handling, COD not needed for us (prepaid only) |
| India Post Speed Post | Reaches nearly every pincode including small towns, no minimum, post office drop | Tracking quality, delivery time to the buyer's pincode, rate for 500 g, insurance or declared value options, drop off requirement (time at the post office for the founder) |

How to compare: Claude builds a comparison sheet (templates/supplier_comparison.csv has a courier tab section) and Instinct fills rates for 5 sample pincodes (Mumbai, Delhi, Bengaluru, a Tier 3 town, a remote pincode) from the public rate calculators (T2). Founder chooses, not Claude. Decision criteria: delivered on time rate, cost for 150 g box to metro and Tier 3, damage claims route, pickup versus drop, tracking messages.

Operating rules [A]:
- Ship prepaid only, no cash on delivery in batch 1 (COD adds remittance delay and RTO cost).
- Ship within 2 working days of QC pass. Hold shipping on Friday after 2 pm if the courier has no weekend scan [A].
- Pad the box: kraft box inside a padded or poly mailer, no loose puck in the bag.
- Insurance or declared value: decide with the courier's rule, a Rs 1,999 item is above many default cover limits [U].
- Pickup versus drop: pickup saves founder time (target: pickup), drop costs 15 to 30 minutes per trip [A]. Batch drops to 2 per week at most.
- Founder time per order: 2 min label, 1.5 min handover when batched (included in the 22 minutes in section 8).
- Courier AWB (airway bill) number goes into the tracker the same day.

### Step 8. Tracking message

Claude drafts, founder sends (0.5 min): order code, courier name, AWB, tracking link, expected delivery date range, "what to do when it arrives", one line asking to confirm phone model, and macro M12 for delay questions.

### Step 9. Delivery check in

Trigger: courier shows delivered, or day 5 after dispatch if tracking is silent.

| # | Action | Owner | Time |
|---|---|---|---|
| 9.1 | Claude flags delivered orders each morning in the daily summary | Claude | 0 |
| 9.2 | Founder sends "Did it arrive OK?" plus setup steps: install the app, find the sweet spot, save the backup code in TWO places (GTM.md post-purchase step 2), pick a spot in another room. Offer the optional 15 minute video setup call to the first 20 buyers only [A, GTM suggests it], then switch to a 90 second setup video for everyone | Founder only | 1 min message, plus 15 min if a call is taken |
| 9.3 | Claude logs: delivered date, setup done yes/no, first lock within 48 hours yes/no (activation target 85 percent [A from GTM]) | Claude | 0 |

If the buyer has not installed the app by delivery plus 3 days, send macro M1 once. Then leave them alone until day 7.

### Step 10. Day 7 check in

Claude drafts, founder sends (1.5 min including reading the reply): "How many days did you lock this week? Anything annoying?" Log in the tracker (`day7`: active / lapsed / no reply, plus a one line note). Anyone who reports a problem goes to the support ticket log. Anyone lapsed gets the battery optimisation macro M6 and M7 first, then a kind refund offer if it still fails.

### Step 11. Day 28 check in

Claude drafts, founder sends (1.5 min): streak or lock days last week, optional screenshot, "would you recommend it", consent to use a quote with first name and city (GTM.md) . Remind that the 30 day refund window ends on day 30 (no pressure, state it plainly). Log `day28`. The app has no analytics [F, GTM.md] so this is our only retention data.

---

## 2. Refund and return SOP (30 days)

Promise (locked by MD): 30 day refund, no subscription. Refund to the buyer's UPI within 3 working days of the decision [A, our promise, CLO to confirm wording on the policy page].

Window: 30 days from the courier delivered date [A: confirm with CLO that it runs from delivery, not payment].

| # | Step | Owner | Time |
|---|---|---|---|
| R1 | Buyer asks for a refund on WhatsApp or email. Claude drafts macro M10 and opens a row in refund_log.csv with reason code (no_nfc, not_working, changed_mind, damaged, other) | Claude | 0 |
| R2 | Offer one fix attempt only if the problem sounds fixable in under 5 minutes (tag will not read, app stopped blocking). Never argue. If they still want a refund, proceed | Founder only sends | 1 min |
| R3 | Ask for: UPI ID to refund to (the same account that paid), reason, and whether they will send the puck back | Claude drafts | 0 |
| R4 | Decision same day. Rule [A]: full refund of Rs 1,999 for any request inside 30 days. Return of the puck is requested but not a condition for refund below Rs 2,000 if the buyer is far away or the reverse shipping costs more than the unit value at risk (our cost to re-QC a returned unit is low; see BOM returns allowance) | Founder only | 1 min |
| R5 | Founder sends the refund from the bank or UPI app. No one else, no agent, ever, touches the payment. Capture the UPI reference | Founder only | 2 min |
| R6 | Claude records refund date, amount, UPI ref, days taken (target 3 working days or less). Send macro M11 with confirmation | Claude | 0 |
| R7 | Sticker check: if the buyer asked to return the puck, send a prepaid return label only if needed (cost about Rs 100 per BOM assumption [A]) or ask them to hand it back at a drop point. Otherwise ask them to keep it or give it to a friend (it is cheap and already tested). | Founder only | 3 min |

What to do with returned pucks (decision tree):
1. Received: photo, log in refund_log with `puck_returned = yes`.
2. Remove the sticker only if it is damaged. If not, keep the original sticker and its UID in the tracker.
3. Inspect: visual, fit, NFC read on the main phone and the second reference phone.
4. Pass: wipe, new foam disc if needed, re-run QC checklist, return to stock as a spare puck or "second hand" demo unit labelled in the tracker. It may NOT be sold as new. Possible uses: demo unit for creators, replacement for a lost puck order, loaner for NFC compatibility tests.
5. Fail: bin the sticker, keep the body for fit tests or recycle, log defect cause in the defect log (QC checklist template).
6. Never re-sell a returned unit as new. Never pass returned data around: the pucks hold no personal data, but the packaging might have the buyer's name; remove it.

Refund budget [A]: planning for 15 percent refund rate in the first 50 per GTM.md, so 7 to 8 refunds, Rs 15,000 cash buffer that stays liquid while waiting for the first deliveries (CFO to confirm the buffer).

---

## 3. Lost puck replacement flow

Facts: a passive tag, no battery. A lost puck means the buyer can still unlock using the backup code card (PRD P0-8) and the app supports pairing a second puck (PRD P1-1) [U: confirm with CTO that second puck pairing is in the build that ships].

| # | Step | Owner | Time |
|---|---|---|---|
| L1 | Buyer reports lost puck (macro M8). First ask: "Is your phone unlocked right now, or are you locked out?" If locked out, go to macro M20 and rescue code first | Claude drafts | 0 |
| L2 | Buyer finds the backup code on the card or in the app backup. If the card is lost too, macro M9: identity check by the order code and payer name, then CTO fixes the path (open question for the CTO: what is the rescue route if both the puck and the code are lost? Needs an answer before launch) | Founder + CTO | 5 min |
| L3 | Offer a replacement puck at the spare price. Spare price target Rs 499 to Rs 699 [A, BOM section 3]. Recommend Rs 599 for the first batch [A]; first replacement free if the puck was damaged in transit | Founder decides | 1 min |
| L4 | Spare is sent from stock (the 2 extra sets per batch). Shipping Rs 85 [A] included in the spare price. Founder pairs and QC tests as in Step 5 | Founder only | 9 min |
| L5 | Ship, track, check in like a normal order. Log as order code + `-R1` | Claude logs | 0 |
| L6 | Old UID is removed from the buyer's account in the app (CTO flow). Never deactivate the only working pairing before the replacement is paired | CTO + buyer | 5 min buyer |

---

## 4. Failure and defect handling

Severity [A]:
- **S1** buyer locked out of their phone: answer within 1 hour in waking hours, give macro M20 and rescue code immediately.
- **S2** puck will not read or app stops blocking: answer within 4 hours, fix by macros M4 to M7.
- **S3** cosmetic or shipping damage: answer within 24 hours, replace or refund.

Rules:
1. Every defect gets a row in support_ticket_log.csv with a cause code (hardware, app, phone model, user, courier, listing).
2. Three tickets with the same cause in one week: Claude flags it to the CEO and the owner (CPO for hardware, CTO for app, CMO for expectation).
3. Hardware defect on arrival: send a replacement first, ask for a photo, ask for the faulty puck only if cheap. Refund instead if the buyer prefers.
4. Reads fail on one phone model only: log model and Android version in a compatibility list on the tracker. If two buyers fail on the same model, add that model to the "check before you buy" list on the site (CPO + Creative).
5. Batch problem (vendor fault): quarantine the batch, notify the vendor with photos and the batch log id, ask for reprint, stop shipping from that batch. Notify affected buyers only if their puck is from that batch and a defect is found, with a replacement offer.
6. Never promise a repair. Replace or refund.

---

## 5. Supplier backup plan

| Risk | Plan | Trigger |
|---|---|---|
| Print vendor late or low quality | Keep two vendors qualified before launch (one primary, one backup, both quoted on the same print sheet). Order the 3 set sample from BOTH before the first real batch. Also keep 10 percent spare sets in stock | Vendor quote not honoured, reject rate over 15 percent, delay over 5 days past promise |
| Founder owns a printer or a friend does | Use for emergency reprints of 5 to 10 sets only, same PETG colour lot is not guaranteed so label it a "batch X" and tell the CPO | Last resort only |
| NTAG213 stickers fail the vendor quality test | Order 100 from a second seller, run the 5 line test (SUPPLIERS.md), use the winner | Any sticker test fail rate over 5 percent |
| Boxes or cards late | Plain kraft mailer plus a printed seal sticker as a fallback pack | Box maker misses the date |
| Courier fails | Aggregator account with 2 partners enabled, India Post as the fallback | Two missed pickups in a week |
| Founder unavailable (illness, travel) | One trusted family helper trained on Steps 6 and 7 with a one page checklist. Claude holds a buyer message ready saying shipping slips by X days | Founder out more than 2 days |

---

## 6. Daily rhythm (founder target under 60 minutes on most days)

| Time | Task | Owner | Founder minutes |
|---|---|---|---|
| 09:30 | Claude posts the daily order status summary (T4) into the founder's WhatsApp or the Sheet | Claude, Instinct reads Sheet | 3 |
| 10:00 | Check UPI credits, paste into payments_in | Founder only | 3 |
| Free window | Review and send drafted WhatsApp messages (confirmations, trackings, check ins) in one pass | Founder only | 10 to 15 |
| Assembly days (2 per week, Tue and Fri) | Steps 4 to 6 | Founder only | 60 to 120 per session |
| Courier pickup days | Hand over and photo | Founder only | 5 |
| 20:00 | Evening UPI check and urgent S1 tickets | Founder only | 3 |

---

## 7. Founder minutes

Per order, the founder-only items (base case, no video call) [A]:

| Item | Minutes |
|---|---|
| Payment match (batched) | 1.5 |
| Confirmation and pre-shipment WhatsApp | 1.0 |
| Print order share (batch of 10) | 0.3 |
| Receiving and inspection | 1.5 |
| Assembly, tag write, pairing, QC (sampled tests) | 9.0 |
| Packing and label | 4.0 |
| Courier handover (batched) | 1.5 |
| Tracking message | 0.5 |
| Delivery check in | 1.0 |
| Day 7 | 1.5 |
| Day 28 | 1.5 |
| **Base total per order** | **23.3** |
| Support allowance per order (average over the first 50, 1 ticket per 2.5 orders at 6 min [A]) | 2.5 |
| **Total per order** | **about 26 min** |
| Optional 15 minute setup call (first 20 buyers) | +15 (replaces the 1 min text) |

Per week and per day (7 day week average, support included, no calls):

| Orders per week | Founder minutes per week | Minutes per day (average over 7 days) | Hours per week | Comment |
|---|---|---|---|---|
| 5 | 130 | about 19 | 2.2 | Comfortable. Inside the 60 minute target on every day |
| 10 | 260 | about 37 | 4.3 | Fine, but uses half of the 8 to 10 founder hours a week [F, GTM] |
| 25 | 650 | about 93 | 10.8 | Over the whole founder budget. Exceeds 60 minutes a day on average and cannot be run alongside ads, footage and selling |

Batching effect [A]: with batches of 25 or more per week, assembly drops to about 6 minutes per unit with a jig and a fixed station, taking 25 orders to about 9.6 hours a week (25 x 23 minutes). Still too much for a 60 minute day.

With setup calls for each of 25 orders per week: +6 hours a week more. Do not do calls beyond the first 20 buyers.

### Where the manual approach breaks (answer to the MD)

- **Time breaks at about 15 orders a week** (calculation: 60 minutes a day times 7 = 420 minutes, divided by 26 = about 16; I use 15 to keep a small buffer). Over that, the founder cannot stay at 60 minutes a day.
- **Realistic comfort line is 10 orders a week**, because the same founder also has to run ads, make footage, answer leads and sell (8 to 10 hours a week in total per GTM.md).
- **Quality breaks first at about 12 to 15 per week** (assembly mistakes, skipped QC samples), not payments.
- **Payment matching breaks at about 20 to 25 orders a week**: manual UPI note matching with missing notes and screenshot requests eats founder time and error risk rises. This is the signal to move to a payment gateway with automatic order matching (cost about 2 percent plus GST on the fee, from the BOM assumption [A, U]).
- **Everything breaks at 50 orders a week** without a helper, a gateway, and an aggregator with printed labels.
- The first 50 units over 6 weeks is about 8 per week (GTM.md), which sits inside the manual comfort zone. If the ads succeed and a week crosses 15 paid orders, we pause ads to a waitlist rather than miss ship dates (decision requested from the CEO).

What to change before volume: hire a part time packer for assembly and packing only (hours per week estimated 6 to 8 [A]), move payments to a gateway, move to monthly 50 unit batches from a print farm, use shipping labels in bulk from the aggregator. See also BOM_AND_COSTS.md for the 500 unit route.

---

## 8. Open questions I need answered (also in ceo/reports/COO.md)

1. CTO: where is the backup code generated (at buyer onboarding or printed at the factory), what is the recovery route if both the puck and the code are lost, and does the shipping build support pairing a second puck?
2. CLO: refund window start date, exact box declaration wording, invoice type before the GST decision.
3. CPO: final printable files, lock or no lock for the sticker, the final box and insert dimensions.
4. CFO: refund cash buffer, who pays courier and print vendors (founder card or a wallet), and a gateway decision threshold.
