# BOM and landed cost per unit

All money in Indian rupees (Rs). Selling price Rs 1,999 per puck, GST inclusive.

**Labels.** Every number is one of:
- **[VQ] vendor-quoted**: only the Zbotic PETG quote: about Rs 2,097 for 50 parts in total (about Rs 42 a part) and Rs 61 for one piece. That quote was for a **different placeholder file**, not for v1.0, so it is a reference point, not our price.
- **[A] assumption**: my estimate. Replace it with a real quote. None of these are vendor claims.
- **[D] design fact**: comes from `case/build_report.txt`.

Change the inputs in section 1, then recompute with the formulas in section 2. A copy of the calculation is at the end so it can be pasted into Python or a spreadsheet.

---

## 1. Inputs

### Design facts [D]

| Item | Value |
|---|---|
| Body volume | 33.8 cm3, est. 24 g at 30 % infill, 29 g at 50 %, 43 g solid |
| Cap volume | 9.3 cm3, est. 8 g at 30 %, 9 g at 50 % |
| Puck set (body + cap) | est. 32 to 38 g printed |
| Box internal size needed | 90 x 90 x 30 mm (single), see PACKAGING.md |
| Shipped weight | about 150 g with box (estimate [A]) |

Zbotic placeholder quote implied Rs 42 per part at 50 [VQ]. Our body is likely heavier than that placeholder (unknown), so I assume more.

### Per-unit inputs by volume

| Input | 50 units | 500 units | 5,000 units | Label |
|---|---|---|---|---|
| Manufacturing route | FDM PETG at vendor | FDM print farm or urethane casting | Injection molding | plan |
| Printed / molded parts per set (body + cap) | 115 | 85 | 22 | [A] (50: scaled from [VQ] Rs 42/part by mass; 5,000: molded part price, tooling separate) |
| Scrap and reprint allowance | 10 % | 6 % | 3 % | [A] |
| NTAG213 25 mm sticker | 22 | 12 | 7 | [A] |
| Foam disc 25 x 1 mm | 2 | 1 | 0.5 | [A] |
| 3 silicone bumpers 10 mm | 6 | 4 | 2 | [A] |
| Kraft box | 45 | 25 | 12 | [A] |
| Insert (folded card or pulp) | 15 | 8 | 4 | [A] |
| Quick start card + backup code card | 10 | 4 | 2 | [A] |
| Seal sticker / label | 3 | 2 | 1 | [A] |
| Assembly, tag write, QC labour | 30 | 15 | 8 | [A] (at 50 this is founder time valued at about Rs 300/h, 6 min per unit) |
| Outbound shipping in India (prepaid, about 150 g) | 85 | 75 | 65 | [A] (aggregator slab rates, negotiable with volume) |
| Payment gateway fee | 2 % + 18 % GST on fee | same | same | [A] (typical Indian gateway pricing, check your contract) |
| Return rate | 8 % | 6 % | 5 % | [A] |
| Reverse shipping per return | 100 | 90 | 80 | [A] |
| Value lost per return (fraction of COGS) | 50 % | 50 % | 50 % | [A] (box and card scrapped, puck re-QC'd) |
| Warranty replacements (fraction of units) | 3 % | 3 % | 2 % | [A] |
| GST on the sale | 18 % included in Rs 1,999 | same | same | [A] (HSN classification **unverified**, ask a CA) |
| One-time fixed cost for this phase | 20,000 | 60,000 | 4,50,000 | [A] see below |

Fixed cost detail [A]:
- 50: sample prints and iterations, 25 test stickers, coupons, borrowed-phone testing, first packaging proofs: about Rs 20,000.
- 500: silicone moulds or print-farm setup, packaging print plates, a CAD freelancer to turn the parametric model into STEP: about Rs 60,000.
- 5,000: two-part injection mould (body + cap) Rs 3 to 6 lakh, packaging tooling (die cut), first-article inspection: I use Rs 4.5 lakh. **Unverified**, see MANUFACTURING_ROADMAP.md.

**Not included** (deliberately, because they are not per-unit physical costs): app development, marketing and customer acquisition, founder salary, customer support. Customer acquisition cost will very likely be the biggest number in the real P&L. Do not read the margins below as profit.

## 2. Formulas

```
parts         = print_per_set x (1 + scrap)
bom           = parts + sticker + foam + bumpers
packaging     = box + insert + cards + seal
cogs          = bom + packaging + assembly
gateway       = price x 2 % x 1.18
returns       = return_rate x (ship + reverse_ship + 0.5 x cogs)
warranty      = warranty_rate x (bom + ship)
landed        = cogs + ship + gateway + returns + warranty
net_revenue   = price / 1.18                      (GST out)
contribution  = net_revenue - landed
margin %      = contribution / net_revenue
break_even    = fixed_cost / contribution         (units, before marketing)
```

## 3. Results (with the inputs above)

| Line | 50 | 500 | 5,000 |
|---|---|---|---|
| Parts incl. scrap | 126.5 | 90.1 | 22.7 |
| BOM (parts + sticker + foam + bumpers) | 156.5 | 107.1 | 32.2 |
| Packaging | 73.0 | 39.0 | 19.0 |
| Assembly and QC | 30.0 | 15.0 | 8.0 |
| **COGS** | **259.5** | **161.1** | **59.2** |
| Outbound shipping | 85.0 | 75.0 | 65.0 |
| Payment gateway | 47.2 | 47.2 | 47.2 |
| Returns allowance | 25.2 | 14.7 | 8.7 |
| Warranty allowance | 7.2 | 5.5 | 1.9 |
| **Landed cost per unit** | **424.1** | **303.5** | **182.0** |
| Net revenue (Rs 1,999 less 18 % GST) | 1,694.1 | 1,694.1 | 1,694.1 |
| **Contribution per unit** | **1,270.0** | **1,390.6** | **1,512.1** |
| Contribution margin | 75.0 % | 82.1 % | 89.3 % |
| Fixed cost of the phase | 20,000 | 60,000 | 4,50,000 |
| **Break-even units (before marketing)** | **16** | **43** | **298** |

### What this tells you

1. The hardware is cheap relative to the price at every volume. The physical product is not what will make or break the business; acquisition cost and returns will.
2. Shipping plus gateway (about Rs 110 to 130) costs more than the puck itself from 500 units on. Bundles (two-pack: desk + bag, research Aarav) ship for nearly the same cost and lift order value. Push the two-pack.
3. Injection molding only pays back against a Rs 85 print-farm set after roughly **Rs 4.5 lakh / (85 - 22) = about 7,100 units** of parts savings. Do not mold before you have a confident 5,000+ unit forecast. See MANUFACTURING_ROADMAP.md.
4. At Rs 1,999 a spare puck priced at Rs 499 to Rs 699 still contributes well (landed spare cost at 50 units is about Rs 300 including its own shipping if shipped alone, much less if added to an order) [A].

### Sensitivity (50 units, single input changed)

| Change | Landed per unit | Contribution |
|---|---|---|
| Base | 424 | 1,270 |
| Vendor charges Rs 200 per set instead of 115 | 518 | 1,176 |
| Return rate 20 % instead of 8 % | 462 | 1,232 |
| Shipping Rs 120 instead of 85 | 462 | 1,232 |
| GST turns out to be 12 % instead of 18 % | 424 | 1,361 |

## 4. Bill of materials (v1.0)

| # | Part | Qty | Spec | Source | Label |
|---|---|---|---|---|---|
| 1 | Body | 1 | `case/nope_body.stl`, PETG matte terracotta | Print vendor (Zbotic candidate) | [VQ] reference only |
| 2 | Base cap | 1 | `case/nope_base_cap.stl`, same filament lot | Print vendor | [A] |
| 3 | NFC sticker | 1 | NTAG213, 25 mm round, PET, adhesive back, blank, unlocked | NFC sticker sellers on Amazon India / IndiaMART | [A] |
| 4 | Foam disc | 1 | 25 mm x 1 mm EVA or PE foam, single-side adhesive (adhesive down onto the post) | Craft foam sheet + 25 mm punch, or die-cut supplier | [A] |
| 5 | Bumpers | 3 | 10 mm x 2 to 3 mm clear or brown silicone, self-adhesive | Furniture bumper packs | [A] |
| 6 | Felt pad (fallback only) | 0 or 1 | 58 mm round self-adhesive felt | Furniture felt packs, or cut from sheet | [A] |
| 7 | Box | 1 | Kraft tuck box, 90 x 90 x 30 mm internal, 1-colour terracotta print | Local box maker | [A] |
| 8 | Insert | 1 | Folded kraft card with 65 mm round cut-out | Same box maker | [A] |
| 9 | Quick start card | 1 | A6, 2 sides, 300 gsm uncoated | Local printer | [A] |
| 10 | Backup code card | 1 | A7, writable uncoated stock | Local printer | [A] |
| 11 | Seal | 1 | 30 mm round kraft sticker, "put it down." | Local printer | [A] |
| 12 | Nest (accessory, separate SKU) | 0 or 1 | `case/nope_nest.stl`, PETG sage, plus 2 screws and wall plugs | Print vendor | [A] |

## 5. Calculation snippet

```python
price, gst = 1999, 0.18
V = {50:  dict(print=115, scrap=.10, sticker=22, foam=2,  feet=6, box=45, insert=15, cards=10, seal=3, asm=30, ship=85, ret=.08, rship=100, war=.03, fixed=20000),
     500: dict(print=85,  scrap=.06, sticker=12, foam=1,  feet=4, box=25, insert=8,  cards=4,  seal=2, asm=15, ship=75, ret=.06, rship=90,  war=.03, fixed=60000),
     5000:dict(print=22,  scrap=.03, sticker=7,  foam=.5, feet=2, box=12, insert=4,  cards=2,  seal=1, asm=8,  ship=65, ret=.05, rship=80,  war=.02, fixed=450000)}
net = price / (1 + gst)
for n, v in V.items():
    bom = v['print'] * (1 + v['scrap']) + v['sticker'] + v['foam'] + v['feet']
    cogs = bom + v['box'] + v['insert'] + v['cards'] + v['seal'] + v['asm']
    landed = cogs + v['ship'] + price * .02 * 1.18 + v['ret'] * (v['ship'] + v['rship'] + .5 * cogs) + v['war'] * (bom + v['ship'])
    c = net - landed
    print(n, round(landed, 1), round(c, 1), f"{c / net:.1%}", round(v['fixed'] / c))
```
