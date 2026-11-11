/* Per-nutrient colour bands (pure module). Thresholds are published ones, not the app's own health view.
 * Low / Medium / High (fat, saturated fat, sugars, salt): UK front-of-pack colour coding thresholds for foods
 * per 100 g (Department of Health / Food Standards Agency, 2013).
 * Protein and fibre wording: EU nutrition claim conditions, Regulation (EC) 1924/2006.
 * A chip always carries a text word; colour is never the only signal. Missing value means no chip (null). */
(function (root) {
  "use strict";
  // low: at or below is Low. high: strictly above is High. Otherwise Medium.
  var UK = {
    fat: { label: "Fat", low: 3.0, high: 17.5 },
    satFat: { label: "Saturated fat", low: 1.5, high: 5.0 },
    sugars: { label: "Sugars", low: 5.0, high: 22.5 },
    salt: { label: "Salt", low: 0.3, high: 1.5 }
  };
  var EPS = 1e-9;
  function isNum(v) { return typeof v === "number" && isFinite(v); }

  // Returns { word, level } or null when the value is missing.
  function lmh(key, v) {
    var t = UK[key];
    if (!t || !isNum(v)) return null;
    if (v <= t.low + EPS) return { word: "Low", level: "green" };
    if (v > t.high + EPS) return { word: "High", level: "red" };
    return { word: "Medium", level: "amber" };
  }
  // Protein: share of energy = protein g x 4 / kcal. High protein at 0.20 or more, Source of protein at 0.12 or more.
  function protein(proteinG, kcal) {
    if (!isNum(proteinG) || !isNum(kcal) || kcal <= 0) return null;
    var share = proteinG * 4 / kcal;
    if (share >= 0.20 - EPS) return { word: "High protein", level: "green", share: share };
    if (share >= 0.12 - EPS) return { word: "Source of protein", level: "amber", share: share };
    return null;
  }
  // Fibre per 100 g: High fibre at 6 g or more, Source of fibre at 3 g or more.
  function fibre(g) {
    if (!isNum(g)) return null;
    if (g >= 6 - EPS) return { word: "High fibre", level: "green" };
    if (g >= 3 - EPS) return { word: "Source of fibre", level: "amber" };
    return null;
  }
  var NOTES = {
    uk: "Low / Medium / High bands follow the UK front-of-pack colour coding thresholds for foods per 100 g (Department of Health / Food Standards Agency, 2013).",
    eu: "Protein and fibre wording follows the EU nutrition claim conditions, Regulation (EC) 1924/2006."
  };
  var api = { UK: UK, lmh: lmh, protein: protein, fibre: fibre, NOTES: NOTES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.bands = api; }
})(typeof window !== "undefined" ? window : globalThis);
