/* Macro Score v2 (project formula for fitness-focused label reading).
 * NOT Nutri-Score, not an official rating, not medical advice. Weights and anchors are project choices.
 * Per 100 g as sold. Five parts, each linear between two anchors and clamped to 0..max:
 *   points = max * clamp((value - zero) / (full - zero), 0, 1)
 * "zero" is the value that earns 0 points, "full" the value that earns max points.
 * Score = sum of points, rounded to a whole number (0 to 100).
 * No estimation: any missing input, or zero energy, means no score.
 *
 * EDIT THE TABLE BELOW to change weights and anchors. */
(function (root) {
  "use strict";
  var PARTS = [
    { key: "proteinDensity", label: "Protein density", unit: "g protein per 100 kcal", max: 40, zero: 0, full: 10 },
    { key: "sugars", label: "Sugars", unit: "g", max: 20, zero: 22.5, full: 5 },
    { key: "satFat", label: "Saturated fat", unit: "g", max: 15, zero: 5, full: 1.5 },
    { key: "salt", label: "Salt", unit: "g", max: 10, zero: 1.5, full: 0.3 },
    { key: "fibre", label: "Fibre", unit: "g", max: 15, zero: 0, full: 6 }
  ];
  // Band words describe the score only. Colour is always shown together with the word.
  var BANDS = [
    { min: 70, word: "High", level: "green" },
    { min: 40, word: "Mid", level: "amber" },
    { min: 0, word: "Low", level: "red" }
  ];
  var LABELS = { energy: "energy (kcal, or kJ) per 100g", sugars: "sugars (g per 100g)", satFat: "saturated fat (g per 100g)", salt: "salt or sodium (per 100g)", fibre: "fibre (g per 100g)", protein: "protein (g per 100g)" };
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function band(score) { for (var i = 0; i < BANDS.length; i++) if (score >= BANDS[i].min) return BANDS[i]; return BANDS[BANDS.length - 1]; }
  function pointsFor(part, v) {
    var f = (v - part.zero) / (part.full - part.zero);
    return part.max * Math.max(0, Math.min(1, f));
  }

  // x: { kcal, energyKj, sugars, satFat, salt, fibre, protein } per 100 g. Energy uses kcal, else kJ / 4.184.
  function compute(x, plausibility) {
    x = x || {};
    var kcal = isNum(x.kcal) ? x.kcal : (isNum(x.energyKj) ? x.energyKj / 4.184 : null);
    var missing = [];
    if (kcal === null) missing.push(LABELS.energy);
    ["protein", "sugars", "satFat", "salt", "fibre"].forEach(function (k) { if (!isNum(x[k])) missing.push(LABELS[k]); });
    if (missing.length) return { status: "insufficient", missing: missing };
    if (kcal <= 0) return { status: "insufficient", missing: ["energy above zero (needed for protein per 100 kcal)"] };
    var issues = plausibility ? plausibility(x) : [];
    if (issues.length) return { status: "inconsistent", issues: issues };
    var density = x.protein / kcal * 100;
    var vals = { proteinDensity: density, sugars: x.sugars, satFat: x.satFat, salt: x.salt, fibre: x.fibre };
    var sum = 0, rows = [];
    PARTS.forEach(function (p) {
      var pts = pointsFor(p, vals[p.key]);
      sum += pts;
      rows.push({ rule: p.label, value: r2(vals[p.key]) + " " + p.unit, points: r1(pts), max: p.max,
        rule_text: p.max + " points at " + p.full + " or " + (p.full > p.zero ? "more" : "less") + ", 0 points at " + p.zero + " or " + (p.full > p.zero ? "less" : "more") + ", linear between" });
    });
    var score = Math.round(sum), b = band(score);
    return { status: "ok", score: score, raw: r2(sum), band: b.word, level: b.level, rows: rows,
      formula: "sum of five parts = " + r2(sum) + ", rounded to " + score };
  }
  var api = { compute: compute, PARTS: PARTS, BANDS: BANDS, band: band };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.customScore = api; }
})(typeof window !== "undefined" ? window : globalThis);
