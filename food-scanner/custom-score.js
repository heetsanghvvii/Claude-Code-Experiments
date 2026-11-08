/* Custom composition score (prototype). This is NOT Nutri-Score and is not based on any official method.
 * The weights and caps below were chosen arbitrarily for this prototype. It has no health meaning.
 * It describes per-100g composition only: start at 100, subtract capped linear penalties for energy,
 * sugars, saturated fat and salt, add capped linear bonuses for fibre and protein, clamp to 0-100.
 * No estimation: any missing input means no score. */
(function (root) {
  "use strict";
  var PENALTIES = [
    { key: "energyKj", label: "Energy", unit: "kJ", cap: 2500, max: 25 },
    { key: "sugars", label: "Sugars", unit: "g", cap: 30, max: 25 },
    { key: "satFat", label: "Saturated fat", unit: "g", cap: 10, max: 25 },
    { key: "salt", label: "Salt", unit: "g", cap: 2.5, max: 25 }
  ];
  var BONUSES = [
    { key: "fibre", label: "Fibre", unit: "g", cap: 6, max: 10 },
    { key: "protein", label: "Protein", unit: "g", cap: 15, max: 10 }
  ];
  var LABELS = { energyKj: "energy (kJ per 100g)", sugars: "sugars (g per 100g)", satFat: "saturated fat (g per 100g)", salt: "salt or sodium (per 100g)", fibre: "fibre (g per 100g)", protein: "protein (g per 100g)" };
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function r1(v) { return Math.round(v * 10) / 10; }

  function compute(x, plausibility) {
    var all = PENALTIES.concat(BONUSES);
    var missing = all.filter(function (c) { return !isNum(x[c.key]); }).map(function (c) { return LABELS[c.key]; });
    if (missing.length) return { status: "insufficient", missing: missing };
    var issues = plausibility ? plausibility(x) : [];
    if (issues.length) return { status: "inconsistent", issues: issues };
    var score = 100, rows = [];
    PENALTIES.forEach(function (c) {
      var p = c.max * Math.min(x[c.key] / c.cap, 1);
      score -= p;
      rows.push({ side: "penalty", rule: c.label, value: x[c.key] + " " + c.unit, points: -r1(p), rule_text: "-" + c.max + " x min(value / " + c.cap + ", 1)" });
    });
    BONUSES.forEach(function (c) {
      var p = c.max * Math.min(x[c.key] / c.cap, 1);
      score += p;
      rows.push({ side: "bonus", rule: c.label, value: x[c.key] + " " + c.unit, points: r1(p), rule_text: "+" + c.max + " x min(value / " + c.cap + ", 1)" });
    });
    var clamped = Math.max(0, Math.min(100, score));
    return { status: "ok", score: Math.round(clamped), raw: r1(score), rows: rows, formula: "100 + bonuses - penalties = " + r1(score) + (clamped !== score ? " (clamped to " + clamped + ")" : "") };
  }
  var api = { compute: compute, PENALTIES: PENALTIES, BONUSES: BONUSES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.customScore = api; }
})(typeof window !== "undefined" ? window : globalThis);
