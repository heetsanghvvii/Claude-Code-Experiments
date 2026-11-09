# PRD: nope puck, physical product v1.0 "pebble"

Owner: product (hardware). Status: ready for a 50-unit pilot build. Date: 2026-11-08.

## 1. Problem

People who want to use their phone less keep failing with app-only blockers because the override is one tap away and the decision happens in the same hand that holds the phone. nope moves the "unlock" decision to a physical object you have to walk to. The object has to be good enough to sit on a desk in a family home, survive a bag, and never become the reason someone is locked out of their own phone.

The research (5 synthetic personas, hypotheses only, see `../research/`) points at four physical jobs, not just "be an NFC tag".

## 2. Users and jobs to be done

| Persona (synthetic) | Job the puck must do | Physical implication |
|---|---|---|
| Aarav, 20, student, hostel | "Put friction between me and Reels, but don't let me get stuck when I am in the library." He expects to lose it within a week and wants one on the desk, one in the bag. | Spare puck option, durable enough for a bag, recovery code card in the box |
| Neha, 24, exam aspirant | "Make walking to the puck the effort, and do not lock me out before a mock." Worried it "looks like a toy" when Papa sees it. Asked about metal-ring cases. | Looks like a calm, quality object; quick start card answers the case question; lost-puck recovery explained on paper |
| Rohan, 31, engineer | "Make the tap feel solid. Heavy enough not to slide. No battery. Do not rattle." Would gift one to his father with setup done. | No battery, no rattle (foam), non-slip feet, weight target, gift option with a setup card |
| Meera, 42, parent | "Something the whole family can use, not a punishment device." Reads 1-star reviews, wants warranty, GST invoice, address on the box. | Neutral design, honest packaging labels, warranty card |
| Karan, 29, creator | "Make me leave the bed. Make it small, I'm not carrying a coaster." | "Leave it in another room" ritual, the wall nest, a size that is a palm not a plate |

Primary job (P0): **Be a calm, permanent, reliable "off switch" that lives somewhere other than my hand.**
Secondary jobs: be a gift; be replaceable cheaply when lost; be trusted (no battery, no tracker, honest labels).

## 3. Design summary (v1.0 "pebble")

- 64 mm diameter x 16 mm tall (H/D 0.25), flat top 44 mm across, wide pillow roll (10 x 7.5 mm superellipse), soft 45-degree-limited bottom round.
- "nope" debossed 0.8 mm, 32 mm wide (half the diameter, as in the brand photo), with a 0.4 mm soft chamfer. Placeholder font Corben Bold (OFL); swap in the real lettering via SVG.
- Hidden 25 mm NTAG213 under a 2.4 mm skin, centred under the logo, held flat by a 1 mm foam disc.
- Quarter-turn bayonet base cap with a wedge lock, coin slot, open/locked marks, "put it down." debossed inside the foot ring, three 10 mm silicone bumpers.
- Fallback: skip the cap, cover the underside with a 58 mm felt pad.
- Accessory: "nest", a sage wall or desk cradle that holds the puck by its rim, no magnets.
- Estimated mass 32 to 38 g printed (body + cap at 30 to 50 % infill). **Unverified** until weighed.

## 4. Requirements

### P0 (must ship in the 50-unit pilot)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| P0-1 | Reads reliably | 10/10 taps on 5 different Android phones with their usual non-metal cases, centred, at the production skin. 9/10 at 10 mm off-centre. See NFC_ENGINEERING.md |
| P0-2 | Read margin | 10/10 on all test phones with 3 mm extra plastic stacked on top |
| P0-3 | Matches the brand photo | Founder signs off the printed sample against panel 2 side by side, in daylight |
| P0-4 | No battery, no electronics besides the passive tag | BOM check |
| P0-5 | Sticker cannot fall out or rattle | Shake test: 10 s vigorous shake next to the ear, no rattle; 1 m drop x 5 then read 10/10 |
| P0-6 | Cap stays closed in a bag, opens with a coin | Cap does not open in a 5-drop test; opens in under 10 s with a Rs 1 or Rs 5 coin; 20 open/close cycles without loss of grip |
| P0-7 | Does not slide on a desk | Puck on a laminate desk, phone tapped onto it from 5 cm 10 times: puck moves less than 5 mm in total |
| P0-8 | Lost-puck recovery path exists on paper | Every box contains a backup code card. App supports pairing a second puck |
| P0-9 | Honest labelling | Box carries maker name and address, contact, month of manufacture, MRP, "contains a passive NFC tag, no battery". Exact legal wording **unverified**, see RISKS_AND_QC.md |
| P0-10 | Printable at a commodity vendor | Watertight STL, walls at least 1.6 mm, overhangs within 45 degrees or short bridges, one material (PETG) |

### P1 (pilot if cheap, required by 500 units)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| P1-1 | Spare puck SKU | Second puck pairs to the same account in under 30 s |
| P1-2 | Gift option | Gift sleeve plus a setup card the giver can fill in |
| P1-3 | Wall or desk nest | Puck stays in the nest when the wall is bumped; phone tap does not dislodge it |
| P1-4 | Real brand lettering | SVG from the brand designer, run through `build_case.py --svg`, strokes and gaps at least 0.8 mm |
| P1-5 | Heat tolerance documented | Puck left in a closed car for one afternoon in summer (or 70 C oven for 1 h) does not warp more than 0.3 mm, still reads |
| P1-6 | Colour consistency | All 50 units within one filament lot; visual check against the brand terracotta swatch |

### P2 (later, molding era)

| ID | Requirement |
|---|---|
| P2-1 | Molded finish with soft-touch matte texture, slight top crown (0.3 to 0.5 mm) |
| P2-2 | Sage, sand and charcoal colourways |
| P2-3 | iPhone support (app side; puck unchanged if NDEF is written correctly) |
| P2-4 | "Soft nope": silicone-skinned version that feels like the pillow in the photo |
| P2-5 | Engraved name or date for gifts |

## 5. Non-goals

- No battery, LEDs, buzzers, Bluetooth or charging. The puck is a key, not a gadget.
- No tamper-proofing against a determined user. Karan: "Don't build a fortress." The product makes you choose, it does not stop you.
- No magnets in v1.0.
- No child-specific design or parental-control positioning (Meera's research verdict: not the primary segment).
- No square or block form. nope stays round and warm, deliberately unlike Brick.
- No waterproof rating claim.

## 6. Success metrics (pilot of 50)

| Metric | Target | How measured |
|---|---|---|
| Out-of-box first tap success | at least 95 % of buyers pair within 2 minutes | App onboarding event |
| Read failures reported | under 2 % of taps in week 1 | App logs failed or repeated taps (if implemented) and support tickets |
| Physical defects at arrival | 0 cracked, under 5 % cosmetic complaints | Support inbox, photo requests |
| Lost puck incidents in 30 days | measured, not targeted; expect 5 to 15 % (hypothesis from Aarav) | Backup code use, spare puck orders |
| Spare puck attach rate | 15 % or more (hypothesis) | Orders |
| "Looks like the photo" | at least 8/10 buyers agree in a 1-question survey | Post-delivery survey |
| Returns | under 8 % | Orders |

## 7. Acceptance for "pilot ready"

All P0 criteria pass on 3 pre-production samples printed by the chosen vendor, the NFC afternoon test matrix is filled in, and the founder has answered the decisions in README.md.

## 8. Open questions

See the ranked decision list in README.md.
