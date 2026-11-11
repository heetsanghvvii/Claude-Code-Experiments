# CTO coverage report: Indian protein dataset

Date: 2026-11-11. All numbers measured live against world.openfoodfacts.org (v2 search for the dataset, legacy search.pl for name checks), 7 s between calls. Dataset built by `tools/build-dataset.js` into `data/protein-india.json` (150.6 KB, limit about 400 KB).

## 1. Dataset by category key

"Rankable" means proteins_100g and energy_kcal_100g are both present. "Six nutrient inputs" means energy, sugars, saturated fat, salt, fiber and protein are all present. The seventh Nutri-Score input (fruit, vegetable, nut percentage) is not in the dataset schema and was not fetched, so a true "full seven inputs" count is NOT measured. The six-input count is an upper bound on it.

| Key | Products | Rankable | Six nutrient inputs | With product_quantity |
|---|---|---|---|---|
| protein-bars | 66 | 59 | 52 | 35 |
| protein-powders | 172 | 141 | 62 | 105 |
| nut-butters | 165 | 142 | 103 | 111 |
| muesli-oats | 192 | 167 | 152 | 113 |
| high-protein-snacks | 62 | 41 | 26 | 32 |
| Total | 657 | 550 | 395 | 396 |

## 2. Tags used and live OFF counts (countries_tags_en=india, categories_tags=<tag>)

- protein-bars: en:protein-bars (62), en:energy-bars (29)
- protein-powders: en:protein-powders (117), en:whey-protein (2), en:bodybuilding-supplements (248)
- nut-butters: en:peanut-butters (172), en:nut-butters (86), en:almond-butters (2)
- muesli-oats: en:mueslis (95), en:oat-flakes (60), en:rolled-oats (60), en:oats (65)
- high-protein-snacks: en:makhana (41), en:fox-nuts (41), en:roasted-peanuts (21)

Tags probed that returned 0 Indian products: en:roasted-chickpeas, en:protein-chips, en:high-protein-snacks, en:protein-snacks, en:chickpea-snacks, en:high-protein-foods. They are not in the dataset. en:soy-chunks returned 11 and was not used.

Counts shrink after de-duplication because a product appears in one key only (first match in key order). 402 duplicates were skipped.

Caveats on category quality:
- en:bodybuilding-supplements is broad. It can include items that are not protein powders (for example creatine, gainers). They are in the protein-powders key because the brief allowed this tag. Rankable rows only need protein and energy values, so a non-protein item with low protein is still ranked by its own data, but the category label may be wrong for some rows. Not audited row by row.
- en:energy-bars is a looser group than protein bars. High-protein-snacks has no true "protein snack" tag, only makhana, fox nuts and roasted peanuts.
- Each tag was fetched in full (all pages, count equals fetched). Nothing was capped.

## 3. Rows dropped

- 39 with no product name.
- 3 physically implausible (protein over 100 g or kcal over 900), for example a Kellogg's muesli listed at 955 kcal per 100 g.
- Kcal derived from kJ/4.184 (rounded to 1 decimal) only where energy-kcal_100g was missing.

## 4. Live OFF totals for India

- Indian products in OFF: 26,062 (`countries_tags_en=india&page_size=1`, field `count`).
- With ingredients completed: 8,675 (`countries_tags_en=india&states_tags_en=ingredients-completed&page_size=1`; the form `states_tags=en:ingredients-completed` returned the same 8,675). This is the contributor "ingredients completed" state, not a count of products with any ingredients text. A count of "any ingredients text" was not obtained. So at most about 33 percent of Indian products have contributor-verified ingredients.

## 5. Coverage of 15 well-known Indian protein products

Method: legacy search `search.pl` with `search_terms=<query>`, filtered to countries contains india. A product counts as "found" if its brand or name contains the brand token. This confirms the brand is present and lists real products, but I checked product type by eye on the first 6 hits only. Rankable = at least one matching product has protein and energy per 100 g.

| # | Product asked | Found | Rankable | Notes |
|---|---|---|---|---|
| 1 | RiteBite Max Protein | yes (35 brand hits) | yes | MAX protein bar 8906009532363: 20 g protein, 346 kcal |
| 2 | Yoga Bar protein bar | yes (46) | yes | Yoga Bar Protein Bar 8904335602385: 20 g, 362 kcal |
| 3 | The Whole Truth protein bar | yes (50) | yes | double cocoa protein bar: 25.6 g, 492 kcal |
| 4 | MuscleBlaze whey | yes (50) | yes | Whey: 70 g, 391.6 kcal. One MuscleBlaze creatine row has no nutrition |
| 5 | Pintola peanut butter | yes (41) | yes | 30 g, 639 kcal |
| 6 | MyFitness peanut butter | yes (25) | yes | 23 g, 637 kcal |
| 7 | Saffola oats | yes (25) | yes | 12.6 g, 369 kcal |
| 8 | Kellogg's muesli | yes (17) | yes, partly | One row 955 kcal (implausible, dropped from dataset), one row has no energy; others rankable |
| 9 | Amul protein | yes (19) | yes | Protein lassi, buttermilk, shake (dairy drinks, not powder). Amul Pro Whey malt beverage has no nutrition values |
| 10 | Epigamia | yes (47) | yes | Greek yogurt and Turbo protein shake; dairy, outside the five category keys |
| 11 | Quaker oats | yes (20) | yes | 11.8 g, 407 kcal |
| 12 | Sundrop peanut butter | yes (14) | yes | One row has no nutrition; others rankable |
| 13 | Alpino peanut butter | yes (25) | yes | 30 g, 625 kcal |
| 14 | Avvatar whey | yes (24) | yes | One gainer row has no nutrition; whey rows rankable |
| 15 | Optimum Nutrition Gold Standard whey | yes (9) | yes | 75 to 79 g protein; check the product is tagged India in the app |

Result: 15 of 15 brands found, 15 of 15 have at least one rankable product. Not every product from these brands is rankable and not every brand hit is in the five dataset categories (Amul and Epigamia dairy items are not). Per-product coverage inside the dataset was not measured.

## 6. Failures and limits

- OFF returned HTTP 503 often (roughly one in three calls). The script retries up to 7 times with growing waits. The first full run failed on en:mueslis after 4 retries, so I raised retries to 7 and re-ran; the final run had zero failed requests.
- The six-input vs seven-input gap in section 1 is real. Fruit, vegetable and nut percentage is not collected.
- No ingredient-text count, only the ingredients-completed state count.
- Name checks are brand-token matches, partly eyeballed. Not a full audit.
- Data is crowd-sourced and unverified. Some rows may have wrong values that stay within plausible ranges.
