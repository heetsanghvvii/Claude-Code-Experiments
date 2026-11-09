# NFC engineering: how the tap works through the shell

Scope: the physical NFC path between an Android phone and the NTAG213 sticker inside the nope puck. App behaviour is out of scope except where the hardware forces a decision.

Status legend: **known** = standard NFC physics or published NXP / NFC Forum facts that do not need our test; **unverified** = plausible, must be measured on our parts before we promise it to customers.

---

## 1. What actually happens in a tap

1. The phone's NFC controller drives a loop antenna at 13.56 MHz. This is a near-field magnetic coupling, not a radio link. (**known**)
2. The NTAG213 sticker is a passive tag: a coil (the antenna you can see as rings in the sticker) plus a tiny chip. It has no battery. It harvests power from the phone's field and answers by load modulation. (**known**)
3. Coupling falls off very fast with distance and with antenna size mismatch. A bigger tag coil couples better with a phone coil. (**known**)
4. The phone reads the tag UID (7 bytes on NTAG213) and any NDEF record we wrote. The app maps "this UID = my puck" and toggles lock state. (**known** for the chip, app logic is ours)

The puck is passive and permanent. No battery means no charging, no dead puck, nothing that ages except the adhesive and the plastic. This directly answers Rohan's "drawer of dead smart-home things" and Aarav's "is it a tracker?" worry: a passive NTAG213 cannot transmit on its own and has no location capability. (**known**)

## 2. Where the sticker sits in v1.0

```
 phone back
 ─────────────   <- user taps here, anywhere on the 44 mm flat top
 2.4 mm PETG skin (1.6 mm under the letters)
 25 mm NTAG213 sticker, adhesive side up, stuck to the skin ceiling
 1.0 mm foam disc (squeezed to ~0.6 mm), pushes the sticker flat
 solid PETG post on the base cap
```

- Sticker centre = puck centre = centre of the "nope" lettering. The logo is the tap target. (design fact)
- Sticker shaft is 25.9 mm, so the sticker cannot drift sideways. (design fact)
- Distance from the outer top surface to the tag coil: about 2.4 mm. Real phone-to-coil distance adds the phone's own back glass and internal stack plus any phone case, typically several mm more. (**unverified** per phone)

## 3. What matters, in order

| Factor | Effect | Our choice |
|---|---|---|
| Tag coil size | Biggest lever we control. 25 mm couples noticeably better than 18 mm with most phone coils. (**known** direction, size of gap **unverified**) | 25 mm default |
| Distance (skin + phone case) | Read reliability drops sharply past a phone-specific limit. The plastic is not the problem, the millimetres are. (**known**) | 2.4 mm skin, keep it under 3 mm |
| Shell material | PETG, PLA, ASA, ABS, PP, silicone and resin are all effectively transparent at 13.56 MHz at these thicknesses. Colour pigments do not matter unless they are metallic or carbon loaded. (**known**, but see the pigment row) | PETG, no metallic or carbon fill |
| Metallic, "silk", "glitter" or carbon fibre filaments | Contain conductive or metallic particles. Can detune or shield. (**unverified** how much, avoid) | Forbidden in the order sheet |
| Metal behind the tag (desk, laptop, steel shelf) | Eddy currents detune the tag. A 25 mm tag lying on a steel surface can fail entirely. (**known** effect, threshold **unverified**) | 13.6 mm of plastic between tag and the desk surface, plus 2 mm bumpers. Probably enough, test on a steel almirah shelf |
| Magnets near the tag | NdFeB magnets are conductive, nickel plated metal. Close to the coil they act like metal. Ring magnets around the tag are the worst case. Separately, magnets near phones can upset the compass and confuse MagSafe-style accessories. (**known** direction) | No magnets in v1.0. The nest accessory holds the puck mechanically |
| Phone case | TPU, silicone and leather cases add 1 to 3 mm. Cases with a metal ring, metal plate (car mount plate) or MagSafe ring block or weaken the field. Neha asked exactly this. (**known** direction) | Quick start card says: metal-ring cases may not work, tap without it |
| Phone antenna position | Varies by model: some near the camera, some mid-back. The user may need to move the phone. (**known**) | App onboarding shows "find your phone's sweet spot" with a live read indicator |
| Phone has no NFC | Some budget Android phones sold in India ship without NFC. (**known** that such models exist, market share **unverified**) | Landing page and checkout must ask the buyer to check NFC first. This is a returns risk, not a case-design fix |
| Foam or air gap between tag and skin | Each 1 mm of gap is another 1 mm of distance. The foam disc keeps it at zero. (design) | Foam under the sticker, never above |

### Magnets: the honest note for the accessory

Magnets are tempting for a fridge or wall mount, and Brick-style mounts often use them. For nope v1.0 we do not use magnets because:
1. Any magnet within a few mm of the coil risks detuning the tag (**unverified** at what distance it starts to matter).
2. If a magnet is ever added, it must sit at the outer rim, at least 10 mm away from the 25 mm coil edge, and be tested with the full phone matrix below. With a 64 mm puck and a 25 mm tag, the rim is 19.5 mm from the coil edge, so a rim magnet is geometrically possible later.
3. Magnets add a child-safety obligation (swallowed magnets are a serious hazard), see RISKS_AND_QC.md.

The v1.0 nest holds the puck with a printed lip, no magnets.

## 4. Test plan (one afternoon, about Rs 1,500 if you already own a printer or use a vendor)

### What to have

- 10 x 25 mm NTAG213 stickers and 10 x 18 mm NTAG213 stickers (same supplier you will buy production from).
- 1 printed `nfc_test_coupons.stl` set in the production PETG colour: coupons of 1.0, 1.6, 2.2, 3.0 and 4.0 mm. Stacking coupons gives any distance from 1.0 to 11.8 mm.
- 2 printed bodies (`nope_body.stl`) + caps, one with a 25 mm and one with an 18 mm sticker (rebuild with `--sticker 18`).
- At least 5 phones, borrowed from friends: aim for 1 Samsung (A or M series), 1 Xiaomi / Redmi / Poco, 1 Realme or Oppo or OnePlus, 1 Vivo or iQOO, 1 Motorola or Pixel. Write down model names.
- Each phone's usual case, plus 1 case with a metal ring if anyone has one.
- The free app "NFC Tools" (or our app build) to see reads.
- A steel almirah shelf or steel tray, and a wooden or laminate desk.

### The jig

No special hardware: a stack of coupons on the table, sticker underneath the bottom coupon, centred using the coupon notch. Phone lies flat on the top coupon. Tap = lower the phone from 5 cm onto the stack in about 1 second, like a real user.

### Matrix

| Axis | Levels |
|---|---|
| Sticker | 18 mm, 25 mm |
| Plastic over the sticker | 1.6, 2.2 (or 2.4 with the real body), 3.0, 4.0, then stacked 5.2, 6.2, 7.0 mm |
| Phone | 5 models minimum |
| Case | none, user's own case, metal ring case (if available) |
| Offset | centred, 10 mm off-centre (the user misses the logo) |
| Surface under the tag | wood, steel shelf |

That is 2 x 7 x 5 x 2 x 2 = 280 cells plus the case and surface variants. To keep it to one afternoon: run the full distance ladder only at "centred, own case, wood", and spot-check the other axes at the default (2.4 mm, 25 mm).

### Procedure per cell

10 taps. Record: number of successful reads out of 10, and whether any read took longer than about 1 second. Find each phone's **maximum distance**: the thickest stack with 10/10 reads.

### Pass criteria for the default (25 mm sticker, 2.4 mm skin, real puck)

1. 10/10 reads on every phone with its own non-metal case, centred. (P0)
2. At least 9/10 reads at 10 mm off-centre. (P0)
3. **Margin**: every phone reads 10/10 at 2.4 mm + 3.0 mm extra coupons (5.4 mm total). Three millimetres covers a thicker case and tolerance. (P0)
4. 10/10 reads with the puck resting on a steel shelf. (P1)
5. Metal-ring case result is recorded and goes onto the quick start card either way. (P1)

If the 18 mm sticker passes all P0 criteria on all phones, it remains a cost-down option at 5,000 units, not a launch default.

### How to read the result

- If 25 mm passes with margin: ship the default.
- If any phone fails criterion 3 but passes 1 and 2: reduce `SKIN` to 1.8 mm (leaves 1.0 mm under letters, so also reduce `LETTER_DEPTH` to 0.6 and accept 1.2 mm under letters, below our 1.6 mm wall target, or move the letters off the tag area) and retest.
- If a phone fails criterion 1: that phone model goes on a "not supported" list before launch.

## 5. Tag programming and binding (hardware-side decisions)

- Use the 7-byte UID as the puck identity. Each puck is unique. (**known** NTAG213 feature)
- Write a short NDEF record (for example an app link) so that a tap on a phone without the app opens the download page. Useful for gifts. (**known** possible, our link not built)
- Decide whether to permanently lock the tag after writing. Locking prevents a curious user from overwriting the NDEF with a free NFC app; it is irreversible. Recommendation: lock in production, leave the first 10 dev units unlocked. (decision for the founder)
- UID cloning is possible with special hardware or some rooted phones. For a self-control product this is an acceptable risk. (**known** limitation)
- The spare puck must be paired in the app as a second UID for the same account. The app must support 2+ pucks per user. (requirement for the app team)

## 6. Recommended default

| Parameter | Value | Why |
|---|---|---|
| Tag | NTAG213, 25 mm round, white PET, adhesive back | Best coupling at low cost, widely available |
| Skin | 2.4 mm PETG over the tag, 1.6 mm under the letters | Meets 1.6 mm min wall, distance small |
| Tag position | Centred under the logo, held flat by a 1 mm foam disc | Logo = tap target, no air gap, no rattle |
| Filament | Plain (non-silk, non-metallic, non-carbon) matte PETG | RF transparent |
| Magnets | None | Avoid detuning and child-safety burden |

Everything in sections 4 and 6 that is not marked **known** is **unverified** until the afternoon test is done. Record the results in a copy of the matrix table and attach it to this file.
