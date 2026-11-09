# QC checklist per unit (print one per puck, or fill in the tracker columns)

Labels: [F] fact from our docs, [A] assumption, [U] unverified. Pass criteria come from PRD.md P0 and NFC_ENGINEERING.md section 4.

Unit number: ____  Order code: ____  Print batch: ____  Tag UID: ____  Date: ____  Checked by: ____

## A. Visual (body and cap)
| Check | Pass | Fail | Notes |
|---|---|---|---|
| No warp, cracks or layer splitting | [ ] | [ ] | |
| "nope" lettering legible, no stringing | [ ] | [ ] | |
| Colour matches terracotta swatch, daylight, no metallic sparkle | [ ] | [ ] | |
| Bayonet and coin slot clean, no blobs | [ ] | [ ] | |
| Surface free of dents and scratches that show at arm's length | [ ] | [ ] | |

## B. Fit
| Check | Pass | Fail | Notes |
|---|---|---|---|
| Cap turns in and locks with a quarter turn | [ ] | [ ] | |
| Cap opens with a Rs 1 or Rs 5 coin in under 10 s [F PRD P0-6] | [ ] | [ ] | |
| Sticker centred under logo, flat, foam seated | [ ] | [ ] | |
| Shake test 10 s, no rattle [F PRD P0-5] | [ ] | [ ] | |
| 3 bumpers present, puck does not slide on a laminate desk | [ ] | [ ] | |

## C. NFC read (10 taps each, phone lowered from 5 cm in about 1 s)
Full 5 phone test: first unit of each batch, every 5th unit, and any unit with a slow or missed read [A]. Other units: main phone and reference phone only.

| Phone | Model | Android | Case | Reads out of 10 | Any read over 1 s | Pass (10/10) |
|---|---|---|---|---|---|---|
| 1 Main (founder) | | | | | | [ ] |
| 2 Reference | | | | | | [ ] |
| 3 (full test only) | | | | | | [ ] |
| 4 (full test only) | | | | | | [ ] |
| 5 (full test only) | | | | | | [ ] |

| Extra check | Result |
|---|---|
| 10 mm off centre, 9/10 or better [F P0-1] | |
| Tag UID recorded and unique in tracker | [ ] |
| Tag locked (production units only, pending decision) | [ ] |

## D. App pairing
| Check | Pass | Fail |
|---|---|---|
| App installs and opens on the main phone | [ ] | [ ] |
| Pair this puck, lock a test app, tap unlock | [ ] | [ ] |
| Second puck pairs to the same account [A, U: build dependent] | [ ] | [ ] |

## E. Rescue code test (first 10 units, then every 5th) [A]
| Check | Pass | Fail |
|---|---|---|
| Backup code generated in app, entered in rescue screen, lock lifts | [ ] | [ ] |
| Test install reset to clean afterwards | [ ] | [ ] |

## F. Packaging
| Check | Pass | Fail |
|---|---|---|
| Box declarations printed: maker name and address, product name, net quantity, month and year, MRP Rs 1,999 incl. taxes, care contact [U exact wording, CLO] | [ ] | [ ] |
| Quick start card, backup code card (blank writable), warranty and returns card in the box | [ ] | [ ] |
| Seal sticker placed, puck number written | [ ] | [ ] |
| Packed in bag, weight recorded: ____ g (design assumption about 150 g [A]) | [ ] | [ ] |
| Photo of sealed box with order code taken | [ ] | [ ] |

## Result
PASS / REWORK / REJECT. Defect cause code (if any): visual / fit / nfc / app / pack / other. Action: ______
