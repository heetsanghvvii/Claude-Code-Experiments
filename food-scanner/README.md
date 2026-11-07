# Food Label Scanner (private prototype)

Static web app for Indian food products. Plain HTML, CSS and JavaScript. No build step, no backend, no API keys, no accounts.

## What it does

1. **Barcode lookup** in Open Food Facts (OFF): name, brand, ingredients, nutrition per 100g, allergens. Missing fields are shown as "this field is missing". Unknown barcodes show "Product not found in Open Food Facts". Network failures are reported separately from not-found.
2. **OFF Nutri-Score grade** in its own box, labeled "Nutri-Score grade from Open Food Facts". It is never blended with the local score.
3. **Local Nutri-Score calculation** (2023 algorithm, general foods only) with a full "why this score" breakdown. If any required input is missing, it shows "Insufficient data: no score calculated" and lists the missing inputs.
4. **Jain screening aid** (separate from the score) on the ingredient list, from OFF or from a label photo.
5. **Label photo reading**: client-side OCR with Tesseract.js, editable text, confidence display, heuristic ingredient parsing.

Every result shows its data source (Open Food Facts, calculated from OFF data, or your photo/text). No health claims are made.

## Run locally

Open `food-scanner/index.html` in a browser, or serve the folder:

```bash
cd food-scanner && python3 -m http.server 8000
```

Works offline except: the OFF API call, product images, and the Tesseract.js script and English language data (loaded from cdn.jsdelivr.net only when you press "Read text from photo").

Tests (Node 18+, no dependencies):

```bash
node food-scanner/tests/run.js
```

Optional live cross-check against OFF's own 2023 scores (needs network; OFF may return 503 for some pages):

```bash
node food-scanner/tests/crosscheck.js 5
```

## Scoring methodology

Implements the Nutri-Score 2023 update for general foods (Sante publique France: https://www.santepubliquefrance.fr/en/nutrition-and-physical-activity/nutri-score).

- Negative points: energy (kJ, 0-10), sugars (g, 0-15), saturated fat (g, 0-10), salt (g, 0-20). A value earns one point per threshold it is strictly above.
- Positive points: fibre (0-5), protein (0-7), fruit/vegetables/legumes % (>40: 1, >60: 2, >80: 5).
- Score = negative minus positive. If negative points are 11 or more, protein points are never counted (2023 general case; the 2017 exception for fruit/veg/legumes points of 5 no longer applies; cheese keeps counting protein but is not scored here).
- Bands: A 0 or less, B 1-2, C 3-10, D 11-18, E 19 or more.
- All thresholds are in `nutriscore.js`.

Rules:
- All seven inputs must be present per 100g "as sold". Nothing is estimated. `_prepared` values are never substituted.
- Salt may be derived from sodium x 2.5 (shown in the notes).
- Fruit/veg/legumes % is OFF's own estimate from the ingredient list (not a label value); this is stated on screen.
- Values that are physically implausible or inconsistent (for example salt above 100 g/100g, saturated fat above total fat) block the score with a message.
- Categories with separate rules (beverages, waters, cheeses, fats/oils, salt, red meat) are not scored. Category comes from OFF tags, so a missing or wrong tag can let such a product through. Red-meat protein capping, beverage, cheese and fat/oil tables are not implemented.

Verification: unit tests check hand-worked cases, and `tests/crosscheck.js` compares the local score with OFF's own 2023 score on Indian products. In three runs here (12, 36 and 27 products compared, possibly overlapping), every compared score matched. I could not reach the SPF website from the build environment, so thresholds were written from the published specification as I know it and validated against OFF's computation, not read live from the SPF PDF. Please re-check `nutriscore.js` against the SPF document before relying on it.

This is a prototype calculation. Not an official label, not medical advice.

## Jain rule list and limitations

Rules live in `jain-rules.js` (editable data: term groups, functional classes, E/INS code tables, `config.honey`).

Groups:
- Not Jain: meat, fish, egg and derivatives (gelatin, lard, tallow, animal rennet, cochineal/carmine E120, shellac E904, lanolin ...); root vegetables and allium (onion, garlic, potato, carrot, radish, beetroot, turnip, yam ...); alcohol.
- Honey and bee products: configurable (checkbox in the UI, `config.honey`).
- Unknown, practices differ: ginger, turmeric, mushroom, tapioca, yeast, vinegar and similar.
- Unknown, origin unstated: lecithin without source, emulsifiers, enzymes, flavours, E471 and any E/INS code not in the table, generic starch, whey, cheese, glycerol, vitamin D3, and so on.
- Clearly plant, dairy, mineral or synthetic: a list of common ingredients and E-codes. Dairy is treated as acceptable.

Verdicts: "No non-Jain ingredients detected", "Not Jain: <ingredients>", or "Cannot determine - ..." (with reason). It never says "Jain" or "Jain certified". Any ingredient of unstated origin, or not in the rule list, prevents the first verdict. Low-confidence or unconfirmed OCR text always gives "Cannot determine".

Limitations:
- Keyword matching on English text; misspellings, regional names and other languages become "unknown".
- Matching is by whole words, longest phrase wins; unusual phrasing can be missed or misread.
- OFF ingredient text is crowd-sourced and can be incomplete, outdated or wrong. A very short list with allergens listed is treated as incomplete.
- "May contain" statements are not part of the verdict.
- Traditions differ. This is a screening aid only, not a certification - verify with your own dietary authority.

## Label photo reading

Tesseract.js 5.1.1 (English). The text is editable. Confidence is the OCR mean (0-100) plus the share of words below 60. Below 75 mean, or more than 25% weak words, counts as low. The Jain verdict stays at "Cannot determine" until you tick "I checked this text against the label and it is complete and correct". Parsing splits on commas and semicolons, flattens bracketed sub-ingredients, strips percentages and section headings, and treats bare numbers in brackets as INS codes.

## Known limitations

- OFF India coverage is about 25K products against millions worldwide; many barcodes will be not found, and many products lack fibre, fruit/veg % or per-100g values, so no score.
- OFF data quality varies (for example the Britannia Bourbon example has an absurd salt value and OCR-garbled ingredients).
- OCR accuracy varies with photo quality, curved packs and small print.
- Barcodes are typed in; there is no camera barcode scanning.
- Not a health tool. Nothing here is medical or dietary advice.
