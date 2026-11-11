/* Open Food Facts access and mapping. Source of every value here: Open Food Facts. */
(function (root) {
  "use strict";
  var FIELDS = ["code", "product_name", "brands", "quantity", "ingredients_text", "ingredients_text_en",
    "allergens_tags", "traces_tags", "nutriments", "nutriscore_grade", "categories_tags", "image_front_small_url", "product_quantity", "product_quantity_unit"].join(",");

  // Categories where the general-foods algorithm does not apply (separate rules exist).
  var EXCLUDED = {
    "en:beverages": "beverages", "en:waters": "waters", "en:cheeses": "cheeses",
    "en:fats": "fats and oils", "en:vegetable-oils": "fats and oils", "en:salts": "salt products",
    "en:red-meat": "red meat", "en:red-meats": "red meat"
  };

  function num(v) { return typeof v === "number" && isFinite(v) ? v : (typeof v === "string" && v.trim() !== "" && isFinite(Number(v)) ? Number(v) : null); }

  function fetchProduct(barcode, signal) {
    var url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(barcode) + ".json?fields=" + FIELDS;
    return fetch(url, { signal: signal }).then(function (r) {
      if (r.status === 404) return { found: false };
      if (!r.ok) throw new Error("Open Food Facts answered HTTP " + r.status);
      return r.json().then(function (j) { return j && j.status === 1 && j.product ? { found: true, product: j.product } : { found: false }; });
    });
  }

  // Only per-100g "as sold" values are used. "_prepared" values are never substituted.
  function extractInputs(nm) {
    nm = nm || {};
    var notes = [];
    var salt = num(nm["salt_100g"]);
    if (salt === null && num(nm["sodium_100g"]) !== null) { salt = Math.round(num(nm["sodium_100g"]) * 2.5 * 1000) / 1000; notes.push("salt derived as sodium x 2.5"); }
    var fvl = num(nm["fruits-vegetables-legumes-estimate-from-ingredients_100g"]);
    if (fvl === null) { fvl = num(nm["fruits-vegetables-nuts-estimate-from-ingredients_100g"]); if (fvl !== null) notes.push("fruit/veg % uses the Open Food Facts fruits-vegetables-nuts estimate"); }
    else notes.push("fruit/veg/legumes % is an Open Food Facts estimate from the ingredient list, not a label value");
    var energy = num(nm["energy-kj_100g"]);
    if (energy === null) energy = num(nm["energy_100g"]);
    return {
      inputs: {
        energyKj: energy, sugars: num(nm["sugars_100g"]), satFat: num(nm["saturated-fat_100g"]), salt: salt,
        fibre: num(nm["fiber_100g"]), protein: num(nm["proteins_100g"]), fvl: fvl,
        fat: num(nm["fat_100g"]), carbs: num(nm["carbohydrates_100g"])
      },
      kcal: num(nm["energy-kcal_100g"]),
      notes: notes,
      onlyPrepared: Object.keys(nm).some(function (k) { return /_prepared_100g$/.test(k); }) && num(nm["energy-kj_100g"]) === null && num(nm["energy_100g"]) === null
    };
  }

  function excludedCategory(tags) {
    for (var i = 0; i < (tags || []).length; i++) if (EXCLUDED[tags[i]]) return EXCLUDED[tags[i]];
    return null;
  }

  function pretty(tags) {
    return (tags || []).map(function (t) { return t.replace(/^[a-z]{2}:/, "").replace(/-/g, " "); });
  }

  var api = { fetchProduct: fetchProduct, extractInputs: extractInputs, excludedCategory: excludedCategory, pretty: pretty };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.off = api; }
})(typeof window !== "undefined" ? window : globalThis);
