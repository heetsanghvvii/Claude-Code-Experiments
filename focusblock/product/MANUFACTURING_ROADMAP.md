# Manufacturing roadmap: FDM now, casting next, injection molding at scale

Every cost, MOQ and lead time below is an **unverified estimate** from general industry knowledge unless it says [VQ] (the single Zbotic quote, about Rs 42 a part at 50 parts and Rs 61 for one, for a different placeholder file). Get real quotes before committing money. Section 5 says exactly how.

## 1. Stages at a glance

| Stage | Volume | Process | Part cost per set (body + cap) | One-time cost | Lead time | Looks like the photo? |
|---|---|---|---|---|---|---|
| 0. Samples | 5 sets + coupons | FDM PETG, outsourced (Zbotic) | Rs 60 to 150 | none | 3 to 7 days | 70 % (layer lines on the roll) |
| 1. Pilot | 50 | FDM PETG, outsourced or one owned printer | Rs 100 to 150 [A] | Rs 0 to 30k if you buy a printer | 1 to 2 weeks | 70 to 80 % with variable layer height and ironing |
| 2. Bridge | 200 to 2,000 | (a) FDM print farm, or (b) urethane resin cast in silicone moulds, or (c) MJF/SLS nylon, dyed | (a) Rs 70 to 100, (b) Rs 80 to 150, (c) Rs 150 to 300 | (b) Rs 5k to 15k per mould set, moulds last about 20 to 40 pulls | 2 to 4 weeks | (b) and (c) 85 to 90 %: no layer lines, true matte |
| 3. Scale | 5,000+ | Injection molding, PP or ABS or PC-ABS with colour masterbatch | Rs 15 to 30 | Rs 3 to 6 lakh for body + cap tools (family mould possible) | 5 to 8 weeks for tooling, then days | 95 %+: textured matte, soft radii, true deboss |

## 2. When to switch, and what triggers it

| From | To | Trigger (all must be true) | Why this trigger |
|---|---|---|---|
| Samples | Pilot (50) | G1 NFC test passes on 5 phones (NFC_ENGINEERING.md); bayonet fit passes on vendor prints; founder signs off the look against the brand photo | Never print 50 of something that does not read or does not close |
| Pilot | Bridge | 50 sold, returns under 10 %, no structural failures reported in 30 days, waitlist or orders of 150+ per month | Demand proven, design stable enough to make moulds |
| Bridge | Injection | Design frozen for 60 days with no physical change requests; a credible forecast of 5,000+ units in 6 months, or cash to carry the tool | Tool payback: Rs 4.5 lakh / (Rs 85 print-farm set - Rs 22 molded set) = about 7,000 units. Molding early burns cash and freezes mistakes |

Kill or pause triggers: G1 fails twice (see ceo/KILL_CRITERIA.md), or more than 20 % of pilot buyers report a physical problem.

## 3. What changes in the design at each stage

**FDM (now).** The generator is already tuned: flat top (no crown, so no contour rings), 45-degree-limited bottom edge, bayonet with a wedge ramp that tolerates plus or minus 0.1 mm, 45-degree cone inside instead of a flat ceiling, coin slot and bumper pockets on the bed face.

**Casting (bridge).** Same outer shape. Changes: add a 0.3 to 0.5 mm crown to the top (set `CROWN`), soften the letter chamfer, consider making the body solid in resin (heavier, nicer in hand, about 45 g). Cap can stay printed or be cast. Moulds are made from a sanded master print or an SLA master.

**Injection molding (scale).**
- Core out the body to a uniform 2.0 to 2.5 mm wall with internal ribs. Thick solid sections sink and warp in molding.
- Add 1 to 2 degrees of draft on all vertical walls, including the letter walls.
- Replace the bayonet with either an ultrasonic weld (permanent, cheapest, tag not replaceable) or a molded snap ring (reopenable). Decision for later, see README decisions.
- Tag insertion: either the same sticker on a post, or an in-mould label / insert. Ask the molder.
- Texture: a fine matte spark-erosion (VDI 3400 grade around 27 to 33) or a chemical etch texture (MT 11000 family) gets close to the photo's soft matte. Grades are **unverified**, request texture plaques.
- Rebuild the part in a parametric CAD tool (Fusion, Onshape, SolidWorks) from `build_case.py` parameters and export STEP. Molders do not quote from STL. Budget a freelance CAD engineer for 1 to 2 days, about Rs 5k to 15k [A].

## 4. Colour and finish options for the brand orange

The brand board shows a terracotta puck (#C65D3B). The CEO decision log (ceo/DECISION_LOG.md) records the locked palette as "charcoal and saffron", and D12 orders plain matte orange PETG for the samples. The geometry is colour-agnostic; the founder must pick one name and one target swatch (README decision 1).

| Stage | How to get the colour | Notes |
|---|---|---|
| FDM | Pick the darkest, most muted plain orange PETG the vendor stocks (burnt or rust orange if offered). Ask for a printed swatch or a photo next to a white paper in daylight before the run | Matte PETG reads closer to the photo than glossy. No silk, metallic, glitter or carbon fill (NFC). Same filament lot for all 50 |
| FDM upgrade | ASA in orange: better heat (car dashboards) and UV resistance than PETG, naturally matte | Needs an enclosed printer; ask the vendor |
| Casting | Urethane resin with pigment paste, mixed to a physical colour chip | Match by eye to a printed Pantone chip; batch variation is real |
| Injection | Colour masterbatch matched to a Pantone reference. Ask for 3 colour plaques before tool trial | Plaques cost little, do it |
| Finish options | FDM: ironing on top, variable layer height on the roll, optional light bead blast. Molding: texture as above, or a soft-touch paint, or a TPE / silicone overmold for a "soft nope" (P2) | Soft-touch paint can wear in a bag; test before choosing |

## 5. How to get real quotes (do this exactly)

1. **Package the request.** One folder: `nope_body.stl`, `nope_base_cap.stl`, `nfc_test_coupons.stl`, the order sheet from README.md, a photo of panel 2 of the brand board, and the build_report.txt numbers (volumes and masses).
2. **FDM / print farm.** Upload the STLs to Zbotic's instant quote with: PETG, matte plain orange, 0.12 to 0.16 mm layers, 4 walls, 30 % gyroid. Repeat at quantities 5, 50, 200 so you see the price curve. Ask whether they can do variable layer height and ironing; if not, ask what they charge for 0.12 mm layers. Get the same from 2 other services (search "PETG 3D printing service" plus your city; IndiaMART lists many). Ask each for: price per part, lead time, colour lot guarantee, what they do with failed prints.
3. **Casting.** Ask local prototyping shops for "vacuum casting / urethane casting, 100 to 500 units, 2 parts, orange pigmented, matte". Send the same folder. Ask for mould cost, pulls per mould, part price, shrink and colour match process.
4. **Injection molding.** You need STEP files first (section 3). Then contact at least 3 molders in different clusters (for example Pune, Bengaluru, Delhi NCR or Ahmedabad industrial areas, or via IndiaMART). Ask for: tool cost (single vs family mould, steel grade, guaranteed shots), part price at 5,000 and 20,000, MOQ per run, texture options, colour masterbatch MOQ, T1 sample lead time, who owns the tool, and whether tool modification cost is included for one round.
5. **Compare** on a sheet: unit price, one-time cost, lead time, MOQ, tool ownership, defects policy. Put the numbers into BOM_AND_COSTS.md section 1 and recompute.

## 6. What to check with every vendor

- They print or mold from our file without "fixing" it (no auto-scaling, no hollowing, no added supports on the top face).
- Orientation: body top up, cap outer face down, coupons flat. Supports: none.
- Colour: one lot, one swatch approved before the run.
- Tolerance: ask for their typical dimensional accuracy on a 42 mm bore (we design for plus or minus 0.1 to 0.15 mm).
- Packaging of parts: individually bagged, no scratches on the top face.
- Reprint policy for parts with visible defects on the top face.
- Lead time in writing, and who pays reshipping if they miss it.
- For molders: tool ownership in writing, and storage terms.

## 7. Timeline for the next 3 weeks (pilot)

| Week | Action |
|---|---|
| Week 1 | Order samples (README order sheet, Order A). Buy stickers, foam, bumpers, felt. Proxy NFC test with stacked cards on bare stickers |
| Week 2 | Samples arrive: fit test the bayonet, run the G1 NFC matrix (Mon 16 Nov per ceo/DECISION_LOG.md), founder look sign-off. Adjust clearances in `build_case.py` if needed (one parameter each) |
| Week 3 | Order the pilot of 50 (Order B), packaging print, assemble, write tags, QC per RISKS_AND_QC.md, ship |
