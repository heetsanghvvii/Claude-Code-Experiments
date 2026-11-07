/* Prototype calculation of the official Nutri-Score algorithm (2023 version),
 * general foods only. Not an official label, not medical advice.
 * No estimation: if any required input is missing, no score is produced. */
(function (root) {
  "use strict";

  var salt = [];
  for (var i = 1; i <= 20; i++) salt.push(Math.round(i * 2) / 10); // 0.2 .. 4.0 g

  // A value earns 1 point for each threshold it is STRICTLY greater than.
  var THRESHOLDS = {
    energy: [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350],           // kJ, max 10
    sugars: [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51],        // g, max 15
    satFat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],                                       // g, max 10
    salt: salt,                                                                     // g, max 20
    protein: [2.4, 4.8, 7.2, 9.6, 12, 14, 17],                                     // g, max 7
    fibre: [3.0, 4.1, 5.2, 6.3, 7.4]                                               // g, max 5
  };
  var FVL = [{ gt: 80, pts: 5 }, { gt: 60, pts: 2 }, { gt: 40, pts: 1 }];          // %, max 5

  var GRADES = [
    { grade: "A", max: 0 }, { grade: "B", max: 2 }, { grade: "C", max: 10 },
    { grade: "D", max: 18 }, { grade: "E", max: Infinity }
  ];

  var REQUIRED = [
    { key: "energyKj", label: "energy (kJ per 100g)" },
    { key: "sugars", label: "sugars (g per 100g)" },
    { key: "satFat", label: "saturated fat (g per 100g)" },
    { key: "salt", label: "salt or sodium (per 100g)" },
    { key: "fibre", label: "fibre (g per 100g)" },
    { key: "protein", label: "protein (g per 100g)" },
    { key: "fvl", label: "fruit/vegetables/legumes percentage" }
  ];

  function pts(value, list) {
    var n = 0;
    for (var i = 0; i < list.length; i++) if (value > list[i]) n++;
    return n;
  }
  function isNum(v) { return typeof v === "number" && isFinite(v); }

  function plausibility(x) {
    var issues = [];
    ["energyKj", "sugars", "satFat", "salt", "fibre", "protein", "fvl", "fat", "carbs"].forEach(function (k) {
      if (isNum(x[k]) && x[k] < 0) issues.push(k + " is negative");
    });
    if (isNum(x.energyKj) && x.energyKj > 3900) issues.push("energy " + x.energyKj + " kJ/100g is above the physical maximum (about 3700)");
    ["sugars", "satFat", "salt", "fibre", "protein", "fvl", "fat", "carbs"].forEach(function (k) {
      if (isNum(x[k]) && x[k] > 100) issues.push(k + " " + x[k] + " g/100g is above 100");
    });
    if (isNum(x.satFat) && isNum(x.fat) && x.satFat > x.fat + 0.1) issues.push("saturated fat is greater than total fat");
    if (isNum(x.sugars) && isNum(x.carbs) && x.sugars > x.carbs + 0.1) issues.push("sugars are greater than total carbohydrates");
    return issues;
  }

  function compute(x) {
    var missing = REQUIRED.filter(function (r) { return !isNum(x[r.key]); }).map(function (r) { return r.label; });
    if (missing.length) return { status: "insufficient", missing: missing };
    var issues = plausibility(x);
    if (issues.length) return { status: "inconsistent", issues: issues };

    var e = pts(x.energyKj, THRESHOLDS.energy);
    var su = pts(x.sugars, THRESHOLDS.sugars);
    var sf = pts(x.satFat, THRESHOLDS.satFat);
    var sa = pts(x.salt, THRESHOLDS.salt);
    var N = e + su + sf + sa;

    var pr = pts(x.protein, THRESHOLDS.protein);
    var fi = pts(x.fibre, THRESHOLDS.fibre);
    var fv = 0;
    for (var i = 0; i < FVL.length; i++) if (x.fvl > FVL[i].gt) { fv = FVL[i].pts; break; }

    var countProtein = N < 11; // 2023 general case: no exception, protein never counts at N >= 11
    var P = fi + fv + (countProtein ? pr : 0);
    var score = N - P;
    var grade = GRADES.filter(function (g) { return score <= g.max; })[0].grade;

    var rows = [
      { side: "negative", rule: "Energy", value: x.energyKj + " kJ", points: e, max: 10, counted: true, rule_text: "+1 for each step above 335 kJ (steps of 335 up to 3350)" },
      { side: "negative", rule: "Sugars", value: x.sugars + " g", points: su, max: 15, counted: true, rule_text: "+1 for each step above 3.4 g (up to 51 g)" },
      { side: "negative", rule: "Saturated fat", value: x.satFat + " g", points: sf, max: 10, counted: true, rule_text: "+1 for each 1 g above 1 g (up to 10 g)" },
      { side: "negative", rule: "Salt", value: x.salt + " g", points: sa, max: 20, counted: true, rule_text: "+1 for each 0.2 g above 0.2 g (up to 4 g)" },
      { side: "positive", rule: "Fibre", value: x.fibre + " g", points: fi, max: 5, counted: true, rule_text: "+1 above each of 3.0, 4.1, 5.2, 6.3, 7.4 g" },
      { side: "positive", rule: "Fruit, vegetables, legumes", value: x.fvl + " %", points: fv, max: 5, counted: true, rule_text: "1 point above 40%, 2 above 60%, 5 above 80%" },
      { side: "positive", rule: "Protein", value: x.protein + " g", points: pr, max: 7, counted: countProtein, rule_text: "+1 above each of 2.4, 4.8, 7.2, 9.6, 12, 14, 17 g" +
          (countProtein ? "" : " (NOT counted: negative points are 11 or more; no exception in the 2023 general case)") }
    ];
    return {
      status: "ok", score: score, grade: grade, negative: N, positive: P,
      proteinCounted: countProtein, rows: rows,
      formula: "score = negative points (" + N + ") - positive points (" + P + ") = " + score,
      bands: "A: 0 or less, B: 1 to 2, C: 3 to 10, D: 11 to 18, E: 19 or more"
    };
  }

  var api = { compute: compute, THRESHOLDS: THRESHOLDS, REQUIRED: REQUIRED, plausibility: plausibility };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.nutriscore = api; }
})(typeof window !== "undefined" ? window : globalThis);
