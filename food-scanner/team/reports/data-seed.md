# Data lead report: seed prices, Open Prices, blocked items (2026-11-11)

Output: `data/seed-mrp.json` (179 rows, exact 12-field schema). Rebuild with `tools/build-seed.js` (NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt; optional SEED_CACHE_DIR). No value was estimated: anything not shown on the brand page is null.

## Rows per brand and category

| Brand | Category | Rows | With MRP | Full nutrition (protein and kcal) | Per-serving conversions | With barcode |
|---|---|---|---|---|---|---|
| Pintola | muesli-oats | 12 | 11 | 0 | 0 | 10 |
| Pintola | nut-butters | 63 | 63 | 0 | 0 | 63 |
| The Whole Truth | protein-bars | 20 | 20 | 20 | 20 | 0 |
| The Whole Truth | protein-powders | 32 | 32 | 30 | 30 | 0 |
| The Whole Truth | nut-butters | 11 | 11 | 11 | 11 | 0 |
| The Whole Truth | muesli-oats | 6 | 6 | 4 | 4 | 0 |
| Yogabar | protein-bars | 7 | 7 | 0 | 0 | 0 |
| Yogabar | protein-powders | 10 | 10 | 0 | 0 | 0 |
| Yogabar | nut-butters | 1 | 1 | 0 | 0 | 0 |
| Yogabar | muesli-oats | 15 | 15 | 0 | 0 | 0 |
| Yogabar | high-protein-snacks | 2 | 2 | 0 | 0 | 0 |
| MuscleBlaze | all | 0 | 0 | 0 | 0 | 0 |
| Total | | 179 | 178 | 65 | 65 | 73 |

Per category: protein-bars 27, protein-powders 42, nut-butters 75, muesli-oats 33, high-protein-snacks 2.
Rows usable for protein per Rs 100 (pack_g, a price, and protein_100g all present): 65 (bars 20, powders 30, nut butters 11, muesli 4). All 65 are The Whole Truth.

Notes on the fields:
- mrp_inr is the brand's crossed-out "compare at" price (Shopify compare_at_price; The Whole Truth compare_at_price). I did not verify that it equals the MRP printed on the pack. In 27 rows it equals the selling price (no discount shown). One Pintola row (Steel Cut Oats 1kg) shows no compare price, so mrp_inr is null.
- The Whole Truth gives nutrition per serving with a stated serving size (bar 52 to 67 g, scoop 35 g, 2 scoops 50 g, 35 g spoon). All 65 nutrition rows were converted to per 100 g by pure division and carry note "derived from per-serving (serving X g)". The Whole Truth also gives net weight as "N x W" per variant, used for pack_g.
- Shopify's grams field is a shipping weight and was wrong in several places. pack_g follows the variant title (4 hand-checked overrides in the script, each with its page URL and reason): Yogabar Power Up Coffee Crush Butter bar 70 g (also confirmed on the printed wrapper image: Net Weight 70 g), Yogabar Dark Chocolate and Cranberry Muesli 450 g, and two Yogabar Date Minis at 200 g. Pintola variants where title and grams disagree (e.g. Oats 400g with grams 800, Dark Chocolate Peanut Butter 500gm with grams 350) used the title and say so in the note.
- Pintola barcodes come from each product's /products/<handle>.js (products.json omits them). Yogabar and The Whole Truth show no barcode on the pages read.

## Nutrition not captured (null, with note)

- Yogabar (35 rows) and Pintola (75 rows): no nutrition text in the page HTML, the Shopify JSON or the description. Yogabar rows whose page lists a "nutrition label" image carry note "nutrition only in image" (confirmed by viewing one label, which is a photo of the wrapper). Other rows carry "nutrition not in page text (no machine-readable table; not read from images)". Per your rule I did not read numbers off images.
- The Whole Truth: Ragi Cocoa 15 g powder (2 rows) and No Added Sugar Muesli (2 rows) show a nutrition table without a serving size or per-100 g basis, so they stay null.
- 0 rows needed the "nutrition only in image" treatment for The Whole Truth.

## Skipped products and why

- MuscleBlaze (www.muscleblaze.com): robots.txt answered HTTP 403 with a Cloudflare bot challenge page. robots.txt could not be read, so permission could not be confirmed, and I did not try to get around the challenge. 0 rows.
- Pintola (15 products, 2 variants): seeds, nuts, quinoa, jaggery, rice cakes (not protein categories); two 800 g "(400g*2)" two-pack variants.
- Yogabar (46 product or variant entries): 22 two- and three-pack variants of the same item, 1 combo variant, 23 excluded products (variety packs, bestseller combo, ready-to-drink shakes and smoothies and oat drink sold in ml or litres, energy bars, plain nuts and seeds, creatine, chocolate and snack boxes).
- The Whole Truth (not fetched by design): personalised boxes, All in One, Everyone Party, assorted and sampler packs (variety, nutrition differs by item); kids protein blocks, snackbars and milk-mixes; dark cocoa bars, fudge bars, Badaaaam bars, merch; the 1.5 kg Super Saver muesli packs (request cap). 36 product pages were read.

## Spot check

Re-opened the live source for 12 products (about 20 rows) and confirmed each number against the page as served that day:
- The Whole Truth, 6 pages re-fetched fresh and compared to the page's own JSON-LD, serving-size text, net weight and compare-at price: Peanut Cocoa Pro Box of 5 (335 g, 995/796, 20.5 g protein and 347.8 kcal per 67 g gives 30.6 and 519.1), Light Cocoa 24 g powder (1 kg, 2 kg), Unflavoured 30 g Whey Isolate (500 g, 1 kg, 2 kg), Creamy Unsweetened Peanut Butter 325 g, Choco Fruit Crunch Muesli 350 g, Walnut Fudge Box of 5 and 10. All matched, no corrections.
- Pintola, 2 products re-fetched via .js: Classic Peanut Butter (3 variants checked: price, compare price, barcode 8908010900148, 8908010900162, 8908010900186 matched), High Protein Dark Chocolate Oats 400g (confirmed title weight 400 g versus grams 800).
- Yogabar, 3 products: Dark Chocolate and Cranberry Muesli 450g (price 299, compare 445 matched; page title says 450g versus grams 400, override applied), Ultimate Whey Isolate Chocolate 500g (1699, 2099 matched), Power Up Coffee Crush Butter 70g bar (wrapper image shows Net Weight 70 g; override applied).
- Corrections made from the first pass: 4 pack_g overrides (above); first build wrongly skipped 11 The Whole Truth pages (parser) and used a bad regex that excluded Yogabar muesli (fixed); a combo variant (ProClean Plant Protein Chocolate and Coffee Combo, price about double) was removed.
- Final quality gate on all 179 rows: protein 0 to 100, kcal 0 to 900, protein x 4 not above kcal (plus small margin), pack_g and prices positive, mrp not below price, protein and kcal both present or both null. 0 failures. Rows that failed during development were removed or fixed, never guessed.

Request counts per brand host this session (including robots.txt, sitemap or feed, spot checks, homepage and affiliate-path probes): Pintola 46, Yogabar 43, The Whole Truth 50. These overshoot the "about 40" guidance because I first fetched full Pintola pages and then switched to the lighter .js endpoint, and added spot-check re-opens. All requests were spaced at least 2 seconds apart per host.

## Task 2: Open Prices (prices.openfoodfacts.org)

Source: https://prices.openfoodfacts.org/api/v1/prices (schema at /api/schema). Measured 2026-11-11:
- Total prices in the database, all currencies: 343,111.
- INR prices (currency=INR): 523, all stored as currency INR. Pulled all 523 (ordered by id, 523 unique ids).
- Distinct INR products: 476 (3 prices are category prices with no product). 419 of those have an Indian 890 barcode prefix. Locations: 484 prices at Indian locations, 29 with no location, 10 elsewhere.
- Date range: 2023-11-23 to 2026-11-06. 270 prices dated in the last 12 months, 133 in the last 6 months. Only 43 products have 2 or more prices (max 3).
- Matches to seed-mrp.json barcodes: 3 (Pintola 8908010900070 crunchy peanut butter, price 300 on 2025-10-05; 8908010900339 almond butter, 398 and 368 on 2026-10-17; 8908010900056 crunchy unsweetened peanut butter, 155 on 2026-10-17). Seed has 73 barcodes (70 distinct). Zero matches for The Whole Truth or Yogabar rows (no barcodes in seed).
- Indian protein-type products by name or brand keyword (loose, includes some false positives): 43 products (e.g. Yoga Bar bars, wafers and oats; The Whole Truth peanut butter and protein bar; Amul protein products; Quaker and Kellogg's oats; True Elements muesli). Their barcodes are not in the seed.
- Licence as stated on the site (the app's FAQ text): the price dataset is under the Open Database License (ODbL), usable for any purpose with credit to Open Prices and share-alike for modified datasets. Product images are CC BY-SA 4.0. The API software is AGPL-3.0 (per the schema).
- Verdict: usable as a free, licensed cross-check price source for individual barcodes, but far too thin to be a price source for this app (523 INR prices, 3 seed matches, crowd-sourced, mostly single observations). Not merged into seed-mrp.json.

## Blocked or not done

- MuscleBlaze: Cloudflare challenge on robots.txt, not scraped (0 rows).
- HealthKart (www.healthkart.com): robots.txt also behind a Cloudflare challenge (HTTP 403), so its affiliate page was not read.
- Nutrition per 100 g for Pintola and Yogabar: only in images or absent; left null per rules. A human or OCR pass on the label images is the way to fill them.
- Barcodes for The Whole Truth and Yogabar: not shown on the pages read.
- Image CDN checks beyond the 3 images viewed were not done.
- Affiliate findings: see `team/reports/cmo-seed-affiliate.md`.

## Task 3: nutrition read from label images (Pintola, Yogabar)

Method: for each distinct product (same page or handle shares one table) the nutrition-table image was found from the Shopify `/products/<handle>.js` image list (Yogabar alt text and filenames name the table; Pintola images carry no alt text, so candidates were opened and viewed). Yogabar image URLs pointing at cdn.shopify.com were rewritten to www.yogabars.in/cdn/shop/..., Pintola to pintola.in/cdn/shop/...; all downloaded fine. Images were downscaled to 1600 px (or cropped at full resolution) before viewing. Two independent passes: `tools/label-reads/pass1.json` and `pass2.json` (map of image URL to protein, kcal, basis, serving, legible), product to image in `tools/label-reads/sources.json`. Only exact agreement went into `data/seed-mrp.json`. The values are also held in the `LABEL_READS` table in `tools/build-seed.js`, so a re-run does not wipe them. Rows keep their other notes after the new note.

- Distinct products attempted: 55 (20 Pintola, 35 Yogabar). Filled: 53 products, 105 rows (rows with nutrition: 65 to 170 of 179).
- Per-serving tables converted by division with the printed serving: Yogabar wafer bars (20 g, 20 g, 40 g) and Power Up Coffee Crush Butter 70 g bar (note says so). All others were printed per 100 g.
- Left null (2 products, 5 rows):
  - Pintola High Protein Dark Chocolate Peanut Butter (4 rows): no nutrition-table image found among the images checked within the request budget (the one opened showed ingredients only).
  - Yogabar The OG Muesli (1 row): the table is only in a side-panel image; it was read in one pass only (12.54 g protein, 420.40 kcal per 100 g, serving 40 g), so by the two-pass rule it stays null. A second pass on a re-downloaded image would fill it.
- Disagreements between passes: 0 (all 53 filled products matched exactly). Not counted as disagreements: first-choice Yogabar images for the two Ultimate Whey Isolate flavours and the OG Muesli back panel contained no table, so other images (back-of-pack panels) were used.
- Sanity gate (protein 0 to 100, kcal 0 to 900, protein x 4 not above kcal x 1.05): 0 failures. Nut butters outside 20 to 35 g protein or 550 to 680 kcal were re-checked against the image and confirmed as printed, not adjusted: Pintola Dark Chocolate Almond Butter 14 g and 553 kcal, Dark Chocolate Peanut Butter 18.6 g and 580 kcal, Natural Cashew Butter 19 g and 550 kcal, High Protein All Natural Unsweetened Peanut Butter 37 g and 610 kcal.
- Assumptions to know: (1) Pintola crunchy and creamy and size variants under one handle are treated as one table (the 4 American Recipe images checked were identical); (2) the Yogabar 400 g and 450 g Dark Chocolate Cranberry muesli pages use the same image file.
- Requests this task: Pintola 77, Yogabar 76 (robots.txt included, 429 retries included), at least 2 seconds apart.

Rows usable for protein per Rs 100 after this task (pack_g, a price and protein_100g present): 170 of 179.

| Brand | Category | Usable rows |
|---|---|---|
| Pintola | nut-butters | 59 |
| Pintola | muesli-oats | 12 |
| Yogabar | protein-bars | 7 |
| Yogabar | protein-powders | 10 |
| Yogabar | nut-butters | 1 |
| Yogabar | muesli-oats | 14 |
| Yogabar | high-protein-snacks | 2 |
| The Whole Truth | protein-bars | 20 |
| The Whole Truth | protein-powders | 30 |
| The Whole Truth | nut-butters | 11 |
| The Whole Truth | muesli-oats | 4 |

By category: protein-bars 27, protein-powders 40, nut-butters 71, muesli-oats 30, high-protein-snacks 2.
