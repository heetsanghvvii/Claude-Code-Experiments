# SUPPLIERS: what to buy for the first 50 units

Owner: COO. Date: 2026-11-09. Labels: **[F]** fact from our files, **[A]** assumption, **[U]** unverified. No seller names are invented here. The only vendor named in our files is Zbotic (candidate for printing); its quote was for a different placeholder file, so it is a reference point, not our price [F, BOM_AND_COSTS.md]. All costs below are my estimates [A] from BOM_AND_COSTS.md inputs, to be replaced with real quotes.

Quantity logic: 50 sold units, plus 10 percent for scrap and returns testing, plus a stock of spare pucks for replacements and demos. Buy for 60 puck sets for the first run [A].

| Item | Spec (from BOM [F]) | Quantity to buy | Unit cost, Rs [A] | Total, Rs [A] | Where to look (type only) | What to inspect |
|---|---|---|---|---|---|---|
| 3D printed body + cap | PETG matte terracotta, one filament lot, 30 to 50 percent infill, wall 1.6 mm, no silk or metallic or carbon fill | 60 sets in 5 batches of 12 (first a 3 set sample) | about 115 per set (BOM [A]) | about 6,900 | Print vendors (Zbotic is a reference), local print farms | Warp, layer splits, bayonet fit, lettering, colour lot, weight (design 32 to 38 g [A]), dimensions |
| NTAG213 stickers, 25 mm | PET, adhesive back, blank, unlocked | 100 (60 + 40 for tests, failed units and 18 mm vs 25 mm check) | about 22 | about 2,200 | NFC sticker sellers on Amazon India, IndiaMART, specialist NFC shops | The vendor test below; spec sheet in writing; chip type is really NTAG213; coil size 25 mm |
| Foam discs | EVA or PE, 25 x 1 mm, single side adhesive | 120 | about 2 | about 240 | Craft foam sheet plus a 25 mm punch, or die cut supplier | Thickness 1 mm, adhesive holds on PETG, no oil residue |
| Silicone bumpers | 10 mm x 2 to 3 mm, self adhesive, clear or brown | 200 (3 per puck plus extras) | about 2 each (6 per set) | about 400 | Furniture bumper packs | Adhesive on PETG, height same across, no strong smell |
| Kraft tuck box | 90 x 90 x 30 mm internal, 1 colour print | 70 | about 45 | about 3,150 | Local box maker | Internal dimensions fit the puck + insert, print colour, tuck closes tight, minimum order |
| Insert | Folded kraft card, 65 mm round cut-out | 70 | about 15 | about 1,050 | Same box maker | Cut-out size, puck sits without rattle |
| Quick start card | A6, 2 sides, 300 gsm uncoated | 70 | about 5 | about 350 | Local printer | Text legible, Hindi/English if CMO decides, no typos |
| Backup code card | A7, writable uncoated stock | 120 (spare to cover write-offs) | about 3 | about 360 | Local printer | Takes a ballpoint pen, does not smudge |
| Warranty and returns card | A7 or folded, text by CLO | 70 | about 2 | about 140 | Local printer | Legal wording matches CLO text |
| Seal sticker | 30 mm round kraft, "put it down." with declarations (or separate label) | 100 | about 3 | about 300 | Local printer | Adhesive, text fits, declarations legible [U wording] |
| Courier bags | Poly or padded mailer, about 200 x 250 mm | 80 | about 8 | about 640 | Packaging suppliers, online marketplaces | Fits box, opaque, tear resistant |
| Felt pad (fallback only) | 58 mm round, self adhesive | 10 | about 5 | about 50 | Furniture felt packs | Only if the bayonet cap is dropped |
| Labels and tape | Shipping labels, tape, markers | 1 set | | about 500 | Stationery | Label printer ink or sticker sheets |
| **Estimated total** | | | | **about 16,300** | | |

BOM check: BOM_AND_COSTS.md puts COGS around Rs 260 per unit at 50 units [A]; this table's spare-heavy purchase gives about Rs 16,300 for 60 sets, about Rs 271 per set, which is close to it [A]. Plus fixed phase cost Rs 20,000 for samples and tests in the BOM [A] (separate).

Cash note for CFO: first run purchases about Rs 16,300 [A] plus fixed Rs 20,000 [A] before the first sale clears. Do not order the full run until at least 8 paid orders exist, except the 3 set sample and the sticker test.

## NTAG213 vendor quality test (5 lines)

Do this BEFORE the first batch. Order 10 stickers from each candidate seller (cost about Rs 250 per seller [A]).

1. Chip check: scan 10 stickers with a free NFC reader app on one phone. All 10 must show type NTAG213 (not NTAG215, 216 or a fake) with a 7 byte UID, and memory about 144 bytes [U: confirm reader app output; mark mismatches as fail].
2. Write test: write a short NDEF link to all 10 stickers, then read each back on the same phone. All 10 must read back exactly the same text; any write error is a fail.
3. Phone read test: read the same 10 stickers on 5 different Android phones (Samsung, Xiaomi/Redmi/Poco, Realme/Oppo/OnePlus, Vivo/iQOO, Motorola/Pixel) with 10 taps each, stuck under a 2.4 mm PETG coupon. Pass rule: 10/10 on every phone for every sticker, margin test at 5.4 mm total passes on all phones (NFC_ENGINEERING.md P0 criteria).
4. Physical check: adhesive holds on PETG for 24 hours, sticker diameter is 25 mm plus or minus 1, no bent or cracked coils, no printed marks over the coil.
5. Decision rule: accept the seller only if 10 of 10 stickers pass lines 1 to 4. One fail means order another 10 to confirm; two fails means reject. Keep the spec sheet in writing from the seller (13.56 MHz, passive, no battery) for compliance files (COMPLIANCE_INDIA.md).

Never write-lock a sticker until it passes this test. Keep the losers, the rejected seller's name and the date in supplier_comparison.csv.

## General rules

1. Get two quotes for every item above Rs 1,000 and one sample before an order above Rs 2,000 [A].
2. Get a GST invoice for every purchase [A]; the CA decides what can be claimed later.
3. Pay by UPI or card from the business account only; do not use the founder's salary account for business purchases [A, CLO/CFO to confirm].
4. Keep a supplier note on each: contact, lead time, last order, issues.
5. Lead times are all [U] until the supplier states them in writing. Add 30 percent buffer when promising a ship date.
