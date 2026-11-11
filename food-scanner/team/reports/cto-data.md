# CTO report: data for Indian products, scoring, MVP scope

Date: 2026-11-11. Scope: research only, no existing file modified. Tag "not verified" means I could not confirm it from a source in this session.

Environment limits that affected this report: the sandbox proxy returned 403 for world.openfoodfacts.org and static.openfoodfacts.org, and DNS failed for in.openfoodfacts.org, gs1india.org and indiafoodstats.blogspot.com. So live OFF API counts could not be pulled. Those hosts must be allowed in the session network settings to run the count queries in section 1. Everything below comes from web search snippets, not full page reads, unless stated. I did not scrape or probe Blinkit, Zepto, Instamart or BigBasket.

## 1. Open Food Facts India

Product count
- Best figure found: about 20,000 Indian packaged food products, per a Feb 2026 post (https://indiafoodstats.blogspot.com/2026/02/wikipedia-of-food-in-india-just-got.html). Earlier milestones: 10,000 around Sept 2024 (https://blog.openfoodfacts.org/en/news/open-food-facts-india-database-reaches-10k-product-milestone), 15,000+ by June 2025 (https://indiafoodstats.blogspot.com/2025/06/open-food-facts-june-2025-stats.html), about 18 new products per day as of Dec 2024 (https://indiafoodstats.blogspot.com/2024/12/open-food-facts-india-database-dec-2024.html).
- The README in the repo says about 25K. Treat 20K to 25K as the range; exact live count not verified (API blocked). Run this once network is allowed: `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=india&page_size=1&fields=code` and read the `count` field.
- OFF's wiki says some 90,000 products are reported sold in India (https://wiki.openfoodfacts.org/Dashboard/India). That is market size, not database size. So OFF covers roughly a quarter of the market at best, and that comparison is only indicative.
- Share with ingredients text and share with full nutrition: not verified. Query to run: add `&ingredients_text_with_allergens_en_exists=true` style filters, or compute from the dump (below). Expect gaps: the existing README already notes many products lack fibre or per-100g values, and the app cannot score them.

License and obligations
- Database under ODbL, individual contents under DbCL, product photos under CC BY-SA (https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side).
- Obligations per OFF's own guidance (https://wiki.openfoodfacts.org/ODBL_License): attribute public use, suggested text "(c) Open Food Facts contributors" on each screen showing OFF data; if you publicly use an adapted database you must offer that adapted database under ODbL; keep license notices. OFF's suggested route is to contribute improvements back.
- Practical reading for us (my interpretation, not legal advice, not verified against the ODbL text): showing OFF data per product in the app needs attribution. If we merge OFF with our own hand-entered data and publish the merged JSON shards, those shards are likely an adapted database and must be published under ODbL. That is fine for us because we plan to publish the shards openly anyway. Keep our own facts in a separate file from OFF-derived data so licensing is clean. Photos: CC BY-SA, so show credit and do not mix into proprietary assets.
- The Hugging Face copy lists AGPL-3.0 and ODbL (https://huggingface.co/datasets/openfoodfacts/product-database/blob/main/README.md). Use the ODbL terms from OFF directly.

Bulk dumps
- OFF offers daily JSONL, CSV, MongoDB and Parquet dumps (https://world.openfoodfacts.org/data), and a simplified Parquet on Hugging Face (https://huggingface.co/datasets/openfoodfacts/product-database).
- Filtering to India (from my knowledge of the schema, not verified live): keep rows where `countries_tags` contains `en:india`. For the Parquet file this can be done with DuckDB in one query, no full download into memory. Also keep barcodes starting `890` (GS1 India prefix, general knowledge, not verified here) as a cross-check, since some Indian products are tagged with other countries.
- Full dump is multi-GB (size not verified), so the filter runs offline on a dev machine or CI, and only the India subset is committed or published.

## 2. Other Indian sources

| Source | What it has | Access and terms | Verdict |
|---|---|---|---|
| GS1 India DataKart and Smart Consumer app | Brand-owner-submitted product data keyed by GTIN; one article says 7.5 million products, likely dated (https://zeebiz.com/companies/news-how-datakar-powered-smart-consumer-app-is-empowering-online-shoppers-to-make-better-purchase-decisions-93516) | Base DataKart is included in a brand's barcode subscription; Premium has separate fees, amounts not found (https://www.gs1india.org/wp-content/uploads/DataKart-Premium-Service-new.pdf). Smart Consumer app is free for consumers (https://gs1india.org/services/smart-consumer). A solution-provider page exists (https://gs1india.org/datakart/datakart-for-solution-providers). Fees and reuse terms for third-party apps: not verified | Best authoritative source for barcode to brand and name. Needs a business conversation. Do not scrape the app. Ask for a solution-provider API or data licence. |
| FSSAI FoSCoS | Licence and registration of food businesses; labels carry a 14-digit licence number (search result: https://fssai.gov.in/upload/uploadfiles/files/Direction_New_compressed.pdf) | Portal is login-based per one source (https://foscos.fssai.gov.in); a public no-login lookup not verified | Not a product database. At most useful to verify a manufacturer. No product ingredient or nutrition data found. |
| FSSAI labelling rules | Not data, but the legal basis: pre-packaged food labels must show ingredients and nutrition information (https://ssrana.in/corporate-laws/food-laws/packaging-labelling-food-india/). Barcode or GTIN described as optional for nutrition info, from draft text, final text not verified | Public regulation | Confirms every pack has the facts we need printed on it. |
| IFCT 2017 | Raw foods only: 528 key foods (other sources say 586), no composite dishes (https://nin.res.in/ebooks/IFCT2017.pdf, https://www.fao.org/food-composition/tables-and-databases/detail/(country--date)-title-9/en) | Free PDF, copyright NIN-ICMR, no explicit data licence found; ask NIN before redistributing | Not for packaged products. Possible later use for generic items. |
| Indian Nutrient Databank (INDB) | Open-access, mostly IFCT-derived foods and recipes; authors say packaged-food data is a gap (https://pmc.ncbi.nlm.nih.gov/articles/PMC11277795) | Code and files on GitHub | Not for packaged products. |
| Mendeley "Indian Packaged Foods Nutritional Composition Dataset (2026)" | 852 packaged products, ingredients, nutrition, CSV; barcodes not mentioned (https://data.mendeley.com/datasets/rhswn9z9xr/1) | Licence not verified | Small. Check licence and use for cross-checking only. |
| Kaggle and Hugging Face | I found no India-specific packaged dataset with barcodes. Other hits are OFF subsets | n/a | Use the OFF dump directly. |
| Brand websites | Some show ingredients and nutrition; coverage and terms per site not verified | Each site's terms apply | Read facts manually for the seed list. Do not bulk crawl. |
| Amazon India | Not verified. Its product data is also used under licence by sellers, so treat as a no-go for bulk reuse | n/a | Skip. |

## 3. Blinkit, Zepto, Instamart, BigBasket

What I could verify: nothing primary. My searches returned scraper-vendor marketing pages, not the platforms' own terms. I did not open the platforms' product pages, in line with the instruction not to probe them.
- Whether product pages publicly show full ingredient lists, nutrition tables and EAN barcodes: not verified. Third-party scraper listings advertise price, stock and ETA extraction (https://apify.com/memo23/blinkit-scraper.md), which says nothing about ingredients or EAN. Barcodes are generally not shown to shoppers on quick-commerce product pages (my expectation, not verified).
- Terms: Blinkit, Zepto, Instamart consumer terms on scraping: not verified. Swiggy terms page exists (https://www.swiggy.com/terms-and-conditions), but the retrieved text had no scraping clause visible. BigBasket's B2B terms list data mining, robots and similar extraction tools as restricted (https://www.bigbasket.com/fp/web/b2b-terms-and-conditions/), a snippet only; the consumer terms are not verified.
- Indian law, from commentary, not primary judgments:
  - IT Act s.43 gives civil compensation for copying data from a computer resource without the owner's permission, and s.66 makes dishonest or fraudulent versions an offence. No judgment squarely decides public-page scraping. A 2024 Rajya Sabha record reportedly shows the government view that even public scraping can fall under s.43, untested in court (https://ssrana.in/articles/data-scraping-issues-india/, https://www.mondaq.com/india/copyright/900156/data-scraping-and-legal-issues-in-india).
  - Copyright Act 1957: facts are not protected, but selection and arrangement in a compilation can be, and copying a substantial part of a database can infringe (same sources). India has no sui generis database right like the EU.
  - Case law: ANI Media v OpenAI (Delhi High Court) interim order found prima facie fair dealing for scraping to train an LLM and noted opt-out mechanisms; trial pending (https://www.mondaq.com/india/new-technology/1742056/indias-first-genai-litigation-and-the-case-for-a-statutory-licensing-model). It is about AI training, not product catalogues, and is interim.
- Verdict: Not usable as a bulk source; scraping Blinkit and its peers risks contract breach and s.43 exposure with no upside we cannot get cheaper, so the only clean routes are a written data partnership or affiliate feed, user-submitted photos of packs, or us manually entering facts printed on the pack (facts themselves are not copyrightable per the commentary above, but get legal advice before relying on that).
- Also note: the retailer listing is often a re-typing of the brand's label data. The primary source is the physical pack, which we can photograph or buy.

## 4. Recommended MVP data pipeline (cheapest and cleanest first)

1. OFF India subset as the base (about 20K to 25K products, free, ODbL). Filter offline in CI to India, strip to the fields we need, write JSON shards. Show "Data: Open Food Facts contributors, ODbL" on every result.
2. Seed list of the top 500 to 1000 Indian packaged SKUs by popularity, checked against OFF first. For gaps, a person (or the owner's family or friends) photographs the pack, we read ingredients and nutrition manually or with OCR, and enter facts into our own CSV. Effort guess: 5 to 10 minutes per SKU, so about 10 to 15 person-days for 1000 SKUs (my estimate, not sourced). Keep this in a separate file from OFF-derived data.
3. User-contributed label photos: the existing Tesseract.js flow produces text on the user's device. Add an optional "contribute to Open Food Facts" link that opens OFF's own upload flow. This grows OFF, not a private database, which keeps our legal position clean. Pure static, no backend.
4. Optional vision-LLM extraction for the seed list only (offline, run by us, human review). Cost estimate: one label photo about 1,500 image tokens plus 500 prompt tokens in and about 500 tokens out. At the Haiku 4.5 rates one source reports, $1 input and $5 output per million tokens (https://docs.kanaries.net/articles/haiku-pricing, conflicting with other sources, not verified against Anthropic's pricing page https://docs.anthropic.com/en/docs/about-claude/pricing), that is about $0.0045 per label, so about $4.50 per 1000 labels, plus review time. The token counts are my assumption. Third-party note: a 1000x1000 image is roughly 1,334 tokens (same search result set, not first-party).
5. GS1 India DataKart partnership as a growth step once there is traffic: ask for a solution-provider data licence. Not verified that they grant one or at what price.
6. Retailer partnership or affiliate feed (Blinkit and others) only if they offer one; ask, do not scrape.

Static-first storage
- Build step (offline script, not in the shipped app): filter dump to India, normalise fields, write shards keyed by barcode prefix, for example `data/8901/89010.json` or by the first 6 digits, each file a few hundred KB at most. The app fetches only the one shard for the typed barcode. Rough sizing: 25K products at about 1 KB each is about 25 MB raw, about 5 MB to 8 MB gzipped (my estimate). Add a small `index.json` with shard list and data date.
- Host on free static hosting (GitHub Pages, Cloudflare Pages or Netlify free tiers; current limits not verified). The owner's hard rule says no deployment yet, so this is a later step. Fall back to live OFF API calls for barcodes not in shards (OFF calls already exist in `off.js`).
- Refresh: monthly CI job re-pulls the dump and rebuilds shards.
- When a backend becomes necessary: (a) storing user submissions or corrections that we own; (b) search by name rather than barcode (a static search index of 25K names is feasible, about 1 MB to 2 MB gzipped, so this can wait); (c) abuse-prone image uploads; (d) accounts or saved history; (e) proxying a licensed GS1 feed whose terms forbid shipping the data to the browser. Until then, none.

## 5. How the scores work today (read from the code)

Inputs come from `off.js`: per 100 g "as sold" values only, never prepared values. Nothing is estimated; a missing input means "insufficient data".

Nutri-Score 2023, general foods (`nutriscore.js`)
- Needs: energy kJ, sugars g, saturated fat g, salt g (or sodium x 2.5), fibre g, protein g, and fruit/vegetable/legume percentage. Optional for sanity checks: total fat, carbohydrates.
- Count "bad" points N: energy 0 to 10, sugars 0 to 15, saturated fat 0 to 10, salt 0 to 20. A value earns one point for each threshold it is strictly above (for example energy steps of 335 kJ, salt steps of 0.2 g).
- Count "good" points P: fibre 0 to 5, fruit/veg/legumes 0 to 5 (1 point above 40%, 2 above 60%, 5 above 80%), protein 0 to 7. Protein is dropped when N is 11 or more.
- Score = N minus P. Grade: A is 0 or less, B 1 to 2, C 3 to 10, D 11 to 18, E 19 or more.
- Blocks implausible data (for example salt above 100 g). Beverages, waters, cheeses, fats and oils, salt and red meat are not scored because they use other rules.
- Caveat from HANDOFF: thresholds were not read from the official document live; re-check against the Sante publique France PDF. The fruit/veg % is OFF's estimate from the ingredient list, so products without that field cannot be scored.

Custom composition score (`custom-score.js`)
- Original, arbitrary weights, no health meaning. Start at 100. Subtract up to 25 each for energy (cap 2500 kJ), sugars (cap 30 g), saturated fat (cap 10 g), salt (cap 2.5 g), scaled linearly. Add up to 10 for fibre (cap 6 g) and up to 10 for protein (cap 15 g). Clamp 0 to 100.
- Needs: energy, sugars, saturated fat, salt, fibre, protein. It does not need the fruit/veg %, so it can score a few more products than Nutri-Score.

Jain ingredient check (`jain.js`, `jain-rules.js`, `ingredients.js`)
- Needs: an ingredients text (from OFF or confirmed OCR text). Nothing else.
- Steps: parse the text into items (split on commas and semicolons, flatten brackets, strip percentages, read bare numbers in brackets as INS codes); match each item against editable keyword groups, longest phrase wins; look up E/INS codes in tables.
- Each item becomes: not Jain (meat, fish, egg, gelatin, cochineal, shellac, onion, garlic, potato, carrot, other root vegetables, alcohol, and honey by default), unknown (ginger, turmeric, mushroom, yeast, vinegar, and additives or flavours of unstated origin), or ok (clear plant, dairy, mineral, synthetic).
- Verdict: any not-Jain item gives "Not Jain: ..."; else any unknown or unrecognised item gives "Cannot determine - ..."; only if everything is recognised and ok does it say "No non-Jain ingredients detected". Low-confidence or unconfirmed OCR text, or a very short OFF list with allergens, always gives "Cannot determine".
- Data fields it needs per product: ingredient text only. This is why ingredient text coverage in the dataset matters more than nutrition coverage for this feature.

## 6. MVP scope, effort and running cost

Scope (static, no backend)
1. Data build script: filter OFF dump to India, normalise, write shards plus index, attribution file. 
2. App change: read shard first, fall back to OFF API, show source and data date, add OFF attribution and ODbL notice.
3. Separate "our own facts" file for seed SKUs, loaded after OFF, source labelled "entered from pack by us".
4. Seed entry tool (a local HTML form or CSV workflow) plus validation using existing plausibility checks.
5. Contribute-to-OFF link after OCR.
6. Name search over a static index (optional).
7. Tests for the build script and the shard lookup; CI job for monthly refresh.
8. Re-check Nutri-Score thresholds against the official PDF; extend Jain rules for common Indian ingredients and regional names.

Effort in agent-days (my estimates, one agent working with owner review; not sourced)
- Build script and shards: 2
- App integration, attribution, source labels: 1.5
- Seed entry tool and validation: 1
- OCR to OFF contribution link: 0.5
- Name search index: 1
- Tests and CI refresh: 1
- Nutri-Score threshold audit: 0.5
- Jain rule extension for Indian ingredients: 1.5
- Contingency: 1
- Total: about 10 agent-days. Seed data entry for 1000 SKUs is separate human work, about 10 to 15 person-days (estimate in section 4), or lower with vision extraction plus review.

Running cost per month (estimates; hosting limits and prices not verified, check each provider)
| Monthly users | Hosting and bandwidth | OFF API calls | LLM extraction | Backend | Total |
|---|---|---|---|---|---|
| 0 | $0 on a free static tier | none | none | none | $0 |
| 1K | $0 (shards are a few MB per user at most, usually one shard of a few hundred KB) | low, only for barcodes not in shards | none | none | about $0 |
| 10K | likely $0 on a free tier; bandwidth about 10K x 0.5 MB = about 5 GB, my arithmetic | OFF asks reusers for a custom User-Agent and fair use; rate limits not verified | one-off seed run about $5 | none | about $0 to a few dollars |
| 100K | about 50 GB by the same arithmetic; may exceed some free tiers, then a paid static or CDN plan is needed (price not verified) | should be fully served from shards; consider mirroring to avoid load on OFF | seed refresh about $5 | likely needed once users submit data; a small serverless function plus object storage, price not verified | low tens of dollars is plausible but not verified |

Biggest risks
- Coverage: OFF India is about a quarter of the market by the 90K comparison; many products will still be "not found" or "insufficient data". The seed list and user contributions are the fix.
- OFF data quality is crowd-sourced (the README already cites an absurd salt value); the plausibility checks must stay.
- Legal: stay on OFF, own manual entry and any written partnership. Do not use quick-commerce scraping.
- Not verified items to close next: live OFF India count and field completeness, GS1 India terms and price, Blinkit, Zepto, Instamart consumer terms, free-tier limits, Anthropic current image pricing.
