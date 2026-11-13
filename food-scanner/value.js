/* Protein value facts and category ranking (pure module).
 * Only arithmetic on numbers the label or the user supplied. Nothing is estimated.
 * A ranking orders one number. It is not a quality judgement. */
(function (root) {
  "use strict";
  var INSUFFICIENT = "insufficient data";
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function r1(v) { return Math.round(v * 10) / 10; }

  // Protein per 100 kcal = proteins_100g / energy_kcal_100g * 100. Needs both fields, energy above zero.
  function proteinPer100kcal(protein, kcal) {
    if (!isNum(protein) || !isNum(kcal)) return { status: "insufficient", reason: INSUFFICIENT + ": needs protein and energy (kcal) per 100 g" };
    if (kcal <= 0) return { status: "insufficient", reason: INSUFFICIENT + ": energy is zero or negative" };
    if (protein < 0) return { status: "insufficient", reason: INSUFFICIENT + ": protein is negative" };
    var raw = protein / kcal * 100;
    return { status: "ok", raw: raw, value: r1(raw), formula: protein + " g / " + kcal + " kcal x 100" };
  }

  // Protein per Rs 100 = (protein_100g * pack_g / 100) / mrp * 100. Pack weight in grams, price in rupees.
  function proteinPerRs100(protein, packG, mrp) {
    var miss = [];
    if (!isNum(protein)) miss.push("protein per 100 g");
    if (!isNum(packG) || packG <= 0) miss.push("pack weight in grams");
    if (!isNum(mrp) || mrp <= 0) miss.push("price (MRP)");
    if (miss.length) return { status: "insufficient", reason: INSUFFICIENT + ": needs " + miss.join(", "), missing: miss };
    if (protein < 0) return { status: "insufficient", reason: INSUFFICIENT + ": protein is negative", missing: [] };
    var packProtein = protein * packG / 100, raw = packProtein / mrp * 100;
    return { status: "ok", raw: raw, value: r1(raw), packProtein: packProtein,
      formula: "(" + protein + " g x " + packG + " g / 100) / Rs " + mrp + " x 100" };
  }

  // Pack weight in grams from Open Food Facts fields. Grams only; millilitre products return null with a reason.
  function packGrams(productQuantity, unit, quantityText) {
    var q = typeof productQuantity === "string" && productQuantity.trim() !== "" ? Number(productQuantity) : productQuantity;
    if (!isNum(q) || q <= 0) return { grams: null, reason: "missing" };
    var u = typeof unit === "string" ? unit.trim().toLowerCase() : "";
    var qt = typeof quantityText === "string" ? quantityText : "";
    if (u === "ml" || u === "l" || u === "cl" || u === "dl" || /\d\s*(ml|cl|dl|l|litre|liter)s?\b/i.test(qt)) return { grams: null, reason: "ml" };
    if (u === "g" || /\d\s*(g|gm|gms|gram|grams|kg)\b/i.test(qt)) return { grams: q, reason: "ok" };
    return { grams: null, reason: "unit unknown" };
  }

  function ratio(p) {
    if (!p) return null;
    var r = proteinPer100kcal(p.proteins_100g, p.energy_kcal_100g);
    return r.status === "ok" ? r.raw : null;
  }

  // Products with both protein and energy (> 0), sorted by protein per 100 kcal descending. Ties keep input order.
  function rankCategory(products) {
    var list = [], left = 0;
    (products || []).forEach(function (p, i) {
      var r = ratio(p);
      if (r === null) { left++; return; }
      list.push({ p: p, ratio: r, i: i });
    });
    list.sort(function (a, b) { return (b.ratio - a.ratio) || (a.i - b.i); });
    return { rows: list.map(function (x) { return { product: x.p, ratio: x.ratio, value: r1(x.ratio) }; }), leftOut: left, total: (products || []).length };
  }

  var EPS = 1e-9;
  // Position of a value among a category's products (competition ranking: ties share the better rank).
  // Products without both fields are not counted. A product with the same barcode is left out of the others.
  function position(products, myRatio, myCode) {
    if (!isNum(myRatio)) return null;
    var others = (products || []).filter(function (p) { return !(myCode && p && String(p.code) === String(myCode)); });
    var rk = rankCategory(others).rows, better = 0, tied = 0;
    rk.forEach(function (x) { if (x.ratio > myRatio + EPS) better++; else if (Math.abs(x.ratio - myRatio) <= EPS) tied++; });
    return { rank: better + 1, of: rk.length + 1, tiedWith: tied };
  }

  function ordinal(n) {
    var m100 = n % 100, m10 = n % 10;
    if (m100 >= 11 && m100 <= 13) return n + "th";
    return n + (m10 === 1 ? "st" : m10 === 2 ? "nd" : m10 === 3 ? "rd" : "th");
  }

  // First category key whose tags intersect the product's categories_tags. Returns all matches in data order.
  function matchCategories(categoriesTags, categories) {
    var tags = categoriesTags || [], out = [];
    Object.keys(categories || {}).forEach(function (k) {
      var ct = (categories[k] && categories[k].tags) || [];
      if (ct.some(function (t) { return tags.indexOf(t) !== -1; })) out.push(k);
    });
    return out;
  }

  // Protein per Rs 100 for curated MRP records, descending. Records missing a number are skipped and counted.
  function rankMrp(records) {
    var rows = [], skipped = 0;
    (records || []).forEach(function (r, i) {
      var v = proteinPerRs100(r && r.protein_100g, r && r.pack_g, r && r.mrp_inr);
      if (v.status !== "ok") { skipped++; return; }
      rows.push({ rec: r, value: v.value, raw: v.raw, i: i });
    });
    rows.sort(function (a, b) { return (b.raw - a.raw) || (a.i - b.i); });
    return { rows: rows, skipped: skipped };
  }

  var api = { proteinPer100kcal: proteinPer100kcal, proteinPerRs100: proteinPerRs100, packGrams: packGrams, rankCategory: rankCategory,
    position: position, ordinal: ordinal, matchCategories: matchCategories, rankMrp: rankMrp, ratio: ratio };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.value = api; }
})(typeof window !== "undefined" ? window : globalThis);
