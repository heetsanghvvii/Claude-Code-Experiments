# Handoff: Food Label Checker prototype

Branch: `food-scanner-prototype`. PR: https://github.com/heetsanghvvii/Claude-Code-Experiments/pull/1 (open, do NOT merge unless the owner says so). Base branch is `claude/nifty-cori-rqnald`.

## Hard rules from the owner
- Work ONLY inside `food-scanner/`. The repo holds other projects. Never touch anything outside it.
- Static site only: plain HTML, CSS, JavaScript. No build step, no backend, no API keys, no accounts, zero cost.
- No deployment, no publishing, no GitHub Pages. No external services beyond Open Food Facts (OFF) and the Tesseract.js CDN (jsdelivr).
- Honesty: no health claims anywhere (never "healthy" or "unhealthy", no seed-oil claims). Show the data source next to every result. Never invent or estimate data. Missing data gives "this field is missing" or "insufficient data".
- Three scores/boxes stay separate and never blend: the OFF-supplied Nutri-Score grade, the local Nutri-Score calculation, the custom composition score. The Jain check is also separate from all scores.
- Owner style: short answers, no filler, no em dashes. If asked a two-option question, give one answer.
- Never say "Jain" or "Jain certified". Allowed verdicts: "No non-Jain ingredients detected", "Not Jain: <ingredients>", "Cannot determine - <reason>".

## Files
- `index.html`, `style.css`, `app.js`: UI (mobile-first, light and dark). `app.js` builds DOM with a small `h()` helper and `textContent` only (OFF data is untrusted, never use innerHTML).
- `off.js`: OFF fetch, mapping of per-100g inputs, excluded-category check. Uses only `_100g` as-sold values, never `_prepared`.
- `nutriscore.js`: Nutri-Score 2023 general foods. Thresholds strictly greater than. Protein is NEVER counted when negative points N >= 11 (no FVL exception in 2023). Blocks implausible data.
- `custom-score.js`: owner-requested original 0 to 100 formula with arbitrary weights (see README). Not Nutri-Score, no health meaning.
- `jain-rules.js`: editable rule data (groups, functional classes, E/INS tables, `config.honey`). `jain.js`: engine. `ingredients.js`: heuristic parser.
- `tests/run.js` (33 unit tests, `node food-scanner/tests/run.js`), `tests/crosscheck.js` (live compare with OFF's own 2023 scores; run with `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<bundle>` in proxied environments).
- `targets.js` (user targets), `value.js` (protein per 100 kcal, per Rs 100, ranking), `bands.js` (colour band thresholds), `scan.js` (camera), `custom-score.js` (now Macro Score v2), `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `tests/fixtures/protein-india.sample.json` (TEST data only, never copy into `data/`). Optional data files: `data/protein-india.json`, `data/seed-mrp.json`.
- `README.md`: methodology, rules, limitations.

## Behaviour decisions already made
- CHANGED 2026-11-11 by owner: camera barcode scanning is now allowed and built (`scan.js`; native BarcodeDetector, else ZXing 0.21.3 from jsdelivr on button press). The photo/OCR reader still does not decode barcodes. Typed entry still works.
- Product direction (owner, 2026-11-11): health and fitness users in India; working project name "Project Macro" (on-screen name stays "Food Label Checker"). Jain check stays, moved last in the result, to be developed later.
- Result order: header, Your targets, Protein value, Nutrition per 100g (with colour chips), Ingredients, OFF grade, local Nutri-Score, Macro Score, Jain check.
- Macro Score v2 replaced the old custom composition score (owner scope). Colours: published thresholds (UK front-of-pack, EU claims) or the user's own targets, always with a word. They are not a health verdict by the app.
- Installable: manifest and network-first service worker (never caches OFF API or other origins), registered only on https or localhost.
- OCR: Tesseract.js 5.1.1 from jsdelivr, loaded only when the user presses the button. Low OCR confidence (mean below 75 or more than 25% of words below 60) or an unticked confirmation box keeps the Jain verdict at "Cannot determine".
- OFF ingredient lists with 2 or fewer items plus listed allergens are treated as incomplete (Jain stays "Cannot determine").
- Photo preview stays hidden until the image loads; failures show an error. CSS has `[hidden] { display: none !important; }` because `display` rules otherwise override `hidden`.
- Honey and bee products: checkbox, default treated as not Jain.
- Categories not scored (separate Nutri-Score rules not implemented): beverages, waters, cheeses, fats and oils, salts, red meat.

## Verified so far
- 17 unit tests pass. Live in headless Chromium (phone viewport, light and dark): Nutella 3017620422003 full data; Parle-G 8901719134845 and Balaji 8906010500764 scored; Maggi 8901058000290 insufficient data; Britannia Bourbon 8901063139329 insufficient; Tata Salt 8904043901015; unknown barcode not found.
- Local Nutri-Score matched OFF's 2023 score on every compared product (about 35 per run; OFF often returns 503 for some pages).
- OCR tested on a generated label image only.

## Not verified / open items
- Camera scanning has not been tested with a real barcode or a real phone (headless only: error path for no camera). The ZXing fallback path was not exercised.
- UK front-of-pack (Department of Health / FSA 2013) and EU Regulation (EC) 1924/2006 thresholds were not re-read at source; re-check them against the source documents.
- `data/protein-india.json` did not exist at build time; ranking and compare tab were tested with the TEST fixture via request interception only. `data/seed-mrp.json` was an empty list.
- Service worker and install prompt not tested on a real device.
- Nutri-Score thresholds were not read live from the Sante publique France document (site was unreachable). Owner later confirmed the protein rule against FAQ-updatedAlgo-V11.pdf. Re-check the other thresholds against that PDF.
- Real phone camera capture and real label photos not tested.
- No real Indian product with gelatin was found for a live Jain example (sample text only).
- Jain rules are keyword based, English only, and incomplete. Expect to extend `jain-rules.js`.
- Custom score weights are arbitrary and open to change (tables at the top of `custom-score.js`).

## Environment notes
- Cloud sessions may block OFF and CDNs. A personal environment `claude-code-experiments` was created allowing `world.openfoodfacts.org`, `static.openfoodfacts.org`, `cdn.jsdelivr.net`, `unpkg.com`. Product images may load from `images.openfoodfacts.org` (not allowed there, images are hidden on failure).
- Playwright and Chromium are preinstalled in the cloud container for UI checks.

## Workflow
Commit to `food-scanner-prototype`, push, and update PR 1. End commit messages with the attribution lines the environment requests. Do not merge. Re-run `node food-scanner/tests/run.js` before every commit.
