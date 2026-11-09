# COO report to CEO

Date: 2026-11-09. Files: ops/OPS_PLAYBOOK.md, SUPPORT_MACROS.md, SUPPLIERS.md, HANDS_OFF_MAP.md, ops/templates/. Labels: [F] fact, [A] assumption, [U] unverified.

## Headline
The first 50 units can be run by hand. Founder time is about 26 minutes per order [A], so 5 orders a week is about 19 minutes a day, 10 is about 37, 25 is about 93 (over the 60 minute target). The manual approach breaks at about 15 orders a week for time, and at about 20 to 25 a week for payment matching. Comfort line is 10 a week because the founder only has 8 to 10 hours a week for the whole business [F, GTM.md].

## 5 biggest operational risks
1. **NFC reads fail on some phones or cases** (never tested end to end, 280 cell matrix not run) [F: NFC_ENGINEERING.md]. A fail means refunds. Gate: run the matrix on a 3 set sample before the first batch.
2. **Single print vendor, unverified quality, lead time unknown** [U]. Quote was for a placeholder file. Need two vendors and a sample from each.
3. **Founder time**: assembly, QC and packing are founder only. Over 15 orders a week we miss ship dates. Ship promise is 3 to 4 weeks [F].
4. **Lockout and lost puck path**: if the puck and the backup code are both lost, the rescue route is undefined [U]. One S1 ticket here damages the brand.
5. **Payment matching and compliance**: manual UPI notes can be missing or edited [U]; box declarations, invoice type and refund terms await CLO and CA [U].

## What I need from the C-suite
- **CTO**: where the backup code is created, rescue route if puck and code are lost, second puck pairing in the shipping build, a signed APK link and install steps tested on Android 13+, and a clean-reset method for the test install.
- **CPO**: final STL files, lock or no-lock tag decision, box and insert dimensions, 5 test phones for the matrix.
- **CFO**: refund cash buffer (planning about Rs 15,000 [A]), who pays vendors, gateway switch point (about 20 orders a week), spare puck price (Rs 599 suggested [A]).
- **CLO**: box declaration wording, refund window start date, warranty card text, invoice format before the GST decision, "not for children under 3" line.
- **CMO/Creative**: site order code with UTM stored in a form backend, NFC check before pay, ship date on site fixed to 3 to 4 weeks, 90 second setup video.
- **Customer Officer**: own tickets, macros and day 7 and day 28 data once launched. Strategy: decide the batch 2 trigger and print vendor path.

## Recommended sequence, next 14 days (10 to 23 Nov)
- Days 1 to 3: Order 3 sample sets from two vendors (T3 up to review, founder pays). Order 10 NTAG213 stickers per candidate seller. CTO answers the 5 questions above. Claude sets up the Sheet (T1).
- Days 4 to 7: Run the NTAG213 5 line test and the NFC matrix on the samples. Courier comparison (T2). CLO signs box text. Print the first box and card proofs.
- Days 8 to 10: Go/no-go on hardware. If pass, place batch B01 (12 sets) once 8 paid orders exist or on the Friday rule. Dry run: one full order from fake order code to mock delivery, timed.
- Days 11 to 14: Soft open of paid pre-orders with ship-by date (GTM week 2 starts 16 Nov). Daily summary (T4) live. Train a helper on packing. Review first real timings and change the minutes in the playbook.

## 3 decisions I need from the CEO
1. **Order cap rule**: when a week passes 15 paid orders, do we pause ads to a waitlist (my recommendation) or add a paid helper at about 6 to 8 hours a week [A]?
2. **Refund and return policy**: full refund inside 30 days from delivery, refund does not require the puck back (my recommendation), refund within 3 working days.
3. **Hardware go gate**: no batch B01 until the sample passes P0 NFC criteria on 5 phones, and a second print vendor is qualified. Accept a later ship date over a failed first batch?
