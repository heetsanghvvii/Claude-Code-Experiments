/* Optional, needs network. Compares the local score with Open Food Facts' own 2023 score for products
 * where OFF computed one. Run: node food-scanner/tests/crosscheck.js [pages]  */
const ns = require("../nutriscore.js"), off = require("../off.js");
const pages = Number(process.argv[2] || 3);
(async () => {
  let compared = 0, same = 0, skipped = 0; const diffs = [];
  for (let p = 1; p <= pages; p++) {
    const r = await fetch("https://world.openfoodfacts.org/api/v2/search?countries_tags_en=india&page_size=50&page=" + p +
      "&fields=code,product_name,nutriments,categories_tags,nutriscore");
    let j; try { j = await r.json(); } catch (e) { console.error("page " + p + " unavailable (HTTP " + r.status + ")"); continue; }
    for (const pr of j.products || []) {
      const o = pr.nutriscore && pr.nutriscore["2023"];
      if (!o || o.score === undefined || o.score === null || !o.data || o.data.is_beverage || o.data.is_cheese || o.data.is_fat_oil_nuts_seeds || o.data.is_red_meat_product || o.data.is_water || off.excludedCategory(pr.categories_tags)) { skipped++; continue; }
      const x = off.extractInputs(pr.nutriments).inputs, res = ns.compute(x);
      if (res.status !== "ok") { skipped++; continue; }
      compared++;
      if (res.score === o.score) same++; else diffs.push(pr.code + " " + pr.product_name + " local=" + res.score + " off=" + o.score);
    }
  }
  console.log({ compared, same, skipped }); diffs.slice(0, 15).forEach(d => console.log(" diff:", d));
})().catch(e => { console.error(e.message); process.exit(1); });
