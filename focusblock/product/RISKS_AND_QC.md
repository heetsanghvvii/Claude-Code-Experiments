# Risks, failure modes and QC for the first 50 units

Severity (S) and likelihood (L) on a 1 to 5 scale, my judgement, not measured. "Unverified" means nobody has tested it on our parts yet.

## 1. Failure modes

| # | Failure mode | Cause | S | L | Mitigation in the design | Mitigation in process or product | Status |
|---|---|---|---|---|---|---|---|
| 1 | Lost puck, user locked out | Carried in a bag, left in another room, child hides it (research: Aarav, Neha, Meera) | 5 | 4 | Puck is large enough (64 mm) to be hard to lose in a pocket; orange is visible; optional wall nest gives it a fixed home | Backup code card in every box; app supports 2+ pucks; spare puck SKU; emergency unlock in app | Design done, app support **unverified** |
| 2 | Sticker detaches, rattles or shifts | Adhesive creep in heat, bad surface | 4 | 3 | Sticker trapped: foam disc presses it to the ceiling, shaft only 0.45 mm bigger than the sticker, so it cannot move even with zero adhesive | Shake and drop test on every unit | **Unverified** until samples |
| 3 | Case cracks | Drop on tile, crushed in a bag | 3 | 2 | Thick body (median wall 12 mm), round form, no thin sections except the 1.75 mm bayonet ledge | 4 walls, 30 % gyroid; drop test 1 m x 5 on tile for samples | **Unverified** |
| 4 | Bayonet too tight or too loose | FDM tolerance, vendor printer calibration | 3 | 4 | Wedge ramp tolerates about plus or minus 0.1 to 0.15 mm; radial clearance 0.25 mm; one extra cap ordered in samples | Tune `CAP_RAD_CLEARANCE` and `LOCK_INTERFERENCE` after samples; fallback: 58 mm felt pad over the underside | Most likely sample failure |
| 5 | NFC fails through the shell | Distance too large for some phones, metal-ring case, phone without NFC | 5 | 2 | 25 mm tag, 2.4 mm skin, no metal or magnets, no carbon or metallic filament | G1 test matrix (NFC_ENGINEERING.md); "check NFC" before checkout; quick start card troubleshooting | **Unverified**, gate G1 Mon 16 Nov |
| 6 | Finish defects | Stringing, zits, layer lines on the pillow roll, colour mismatch between parts | 3 | 4 | Flat top (prints clean with ironing), no supports on any visible face, seam placed at the back | Vendor asked for 0.12 to 0.16 mm layers, seam "aligned rear", ironing; incoming inspection; one filament lot | Expected on FDM, accept "handmade" level for 50 |
| 7 | Heat in a car or in the sun | PETG softens around 70 to 80 C (typical datasheet glass transition, **unverified** for the vendor's filament); Indian parked cars can exceed that | 3 | 2 | Thick part, low stress design | Care line on the card: not on the dashboard. P1 test: 70 C oven 1 hour, measure warp. ASA upgrade if it fails | **Unverified** |
| 8 | Moisture | Monsoon humidity, wet desk, spilled chai | 2 | 3 | PETG does not absorb meaningfully; NTAG213 on PET film tolerates humidity (**known** in general) | Not waterproof, no claim made. Wipe clean | Low risk |
| 9 | Swallowed small parts | Child opens the cap with a coin and finds the 25 mm sticker, foam disc or 10 mm bumpers | 4 | 1 | Cap needs a coin to open; cap and puck are too large to swallow (41.5 and 64 mm) | "Not a toy, keep away from children under 3" on the box; bumpers well bonded in pockets | Labelling **unverified** |
| 10 | Magnet safety | Only if magnets are added later | 5 | 0 now | No magnets in v1.0 by decision | If ever added: fully enclosed, glued, not removable without tools; review child-safety rules first | n/a |
| 11 | Puck slides when tapped | Light plastic on a smooth desk | 2 | 3 | Three silicone bumpers | Tap test in QC | **Unverified** |
| 12 | "Looks like a toy" | Bright colour, visible layer lines | 3 | 3 | Proportions and lettering from the brand photo; matte | Founder sign-off on samples in daylight | Open |
| 13 | Wrong tag paired or tag overwritten | User writes over the tag with a free app | 2 | 2 | n/a | Lock tags in production after writing (decision); app pairs by UID | Decision pending |
| 14 | Regulatory and labelling | Legal Metrology packaged commodity declarations; GST HSN classification; whether a passive NFC tag needs any wireless approval (WPC / ETA) | 3 | 2 | Passive tag, no transmitter, no battery | CLO and a CA to confirm. All **unverified**. Do not claim any certification | **Unverified** |
| 15 | E-waste or battery rules | n/a: no battery and no electronics besides a passive tag | 1 | 1 | By design | Confirm with CLO that a passive tag is not covered | **Unverified** |

## 2. Per-unit QC checklist (first 50 units)

Print this table, one row per unit. A unit ships only if every column passes. Keep the sheet; it becomes the pilot's quality record.

**Equipment:** 5 Android phones (different brands, see NFC_ENGINEERING.md) with the nope app, a 1 m tape mark on a wall, a tile floor patch, a kitchen scale (0.1 g), a Rs 5 coin, a printed brand-photo swatch, a pen.

| Step | Check | Pass criterion | Time |
|---|---|---|---|
| 1. Incoming parts | Body and cap from the same lot, no cracks, no warping | Body sits flat on glass, no rock. Diameter 64.0 mm plus or minus 0.3 with calipers (every 10th unit) | 30 s |
| 2. Finish | Top face, roll and lettering in daylight next to the swatch | No zits or strings on the top face; letters fully open (no filled counters in "o", "p", "e"); colour matches the batch reference | 30 s |
| 3. Weigh | Body + cap | Within plus or minus 2 g of the first approved unit (records infill consistency) | 10 s |
| 4. Tag write | Write NDEF and record UID in the sheet | UID logged, NDEF reads back | 30 s |
| 5. Assemble | Sticker adhesive up, centred in the shaft ceiling; foam on the post; cap in at the dot, twist to the bar | Cap reaches the bar mark; face flush or slightly recessed | 45 s |
| 6. Fit | Twist cap open and closed 3 times | Opens with a coin in under 10 s; closes with a felt click of resistance; no wobble | 30 s |
| 7. Shake | Shake hard next to the ear for 5 s | No rattle | 10 s |
| 8. Drop | 1 m onto tile, flat and on edge (2 drops) | No crack, cap stays locked | 20 s |
| 9. Scan | Tap with each of 5 phones, own cases, 2 taps each | 10/10 reads, each within about 1 s | 2 min |
| 10. Pairing | Pair in the app, lock, tap to unlock, unpair | Full lock and unlock cycle works | 1 min |
| 11. Feet | Fit 3 bumpers, press 5 s each | Puck does not rock; does not slide more than 5 mm when tapped 5 times | 30 s |
| 12. Pack | Insert, cards, backup code card, seal | Everything in, serial (UID last 4) written on the box bottom | 1 min |

About 8 minutes per unit, 7 hours for 50. Split across two days.

**Batch-level checks (once per batch, not per unit):** 3 random units get the full NFC margin test (3 mm coupons on top, 10/10 reads); 1 unit gets 70 C oven for 1 hour if a lab oven is available, else 2 hours on a car dashboard on a sunny afternoon, then re-measure and re-scan.

**Reject handling:** cosmetic rejects become demo, video and "seconds" units; structural or NFC rejects get opened and the sticker reused (stickers are cheap but the test data is not: write down why).
