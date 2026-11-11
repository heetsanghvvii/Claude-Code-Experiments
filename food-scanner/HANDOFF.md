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
- `tests/run.js` (17 unit tests, `node food-scanner/tests/run.js`), `tests/crosscheck.js` (live compare with OFF's own 2023 scores; run with `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<bundle>` in proxied environments).
- `README.md`: methodology, rules, limitations.

## Behaviour decisions already made
- Barcode input is typed or pasted digits. No camera scanning, and the photo reader does not decode barcodes. Do not claim otherwise anywhere. App name is "Food Label Checker".
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
