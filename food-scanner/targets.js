/* Personal targets (pure module). The user types their own numbers per 100 g; nothing is preset.
 * Each target evaluates to exactly one of: "met", "not met", "cannot check (field missing)".
 * This is a comparison of label numbers with the user's own numbers. It makes no health statement. */
(function (root) {
  "use strict";
  var MET = "met", NOT_MET = "not met", CANNOT = "cannot check (field missing)";

  // dir "min": value must be at least the target. dir "max": value must be at most the target.
  var DEFS = [
    { key: "protein", label: "Protein", dir: "min", unit: "g" },
    { key: "sugars", label: "Sugars", dir: "max", unit: "g" },
    { key: "satFat", label: "Saturated fat", dir: "max", unit: "g" },
    { key: "salt", label: "Salt", dir: "max", unit: "g" },
    { key: "fibre", label: "Fibre", dir: "min", unit: "g" },
    { key: "kcal", label: "Energy", dir: "max", unit: "kcal" }
  ];

  function isNum(v) { return typeof v === "number" && isFinite(v); }

  // Returns a finite number >= 0, or null when empty or not a valid number.
  function parseTarget(v) {
    if (isNum(v)) return v >= 0 ? v : null;
    if (typeof v !== "string") return null;
    var s = v.trim().replace(",", ".");
    if (s === "" || !/^\d*\.?\d+$|^\d+\.$/.test(s)) return null;
    var n = Number(s);
    return isFinite(n) && n >= 0 ? n : null;
  }

  // "palm oil, maltodextrin" -> ["palm oil", "maltodextrin"]. Lower-cased, trimmed, de-duplicated.
  function parseExclusions(str) {
    if (typeof str !== "string") return [];
    var seen = {}, out = [];
    str.split(/[,;\n]/).forEach(function (w) {
      var t = w.trim().replace(/\s+/g, " ").toLowerCase();
      if (t && !seen[t]) { seen[t] = true; out.push(t); }
    });
    return out;
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Whole-word, case-insensitive match. "palm oil" does not match "palmolein" or "palm oils".
  function containsWord(text, term) {
    var t = term.trim().replace(/\s+/g, " ");
    if (!t) return false;
    var body = escapeRe(t).replace(/ /g, "\\s+");
    var re = new RegExp("(^|[^\\p{L}\\p{N}])" + body + "($|[^\\p{L}\\p{N}])", "iu");
    return re.test(text);
  }

  function evalNumeric(def, target, value) {
    if (!isNum(value)) return CANNOT;
    if (def.dir === "min") return value >= target ? MET : NOT_MET;
    return value <= target ? MET : NOT_MET;
  }

  // targets: { protein, sugars, satFat, salt, fibre, kcal, exclude } (strings or numbers; empty = not set)
  // nutrition: { protein, sugars, satFat, salt, fibre, kcal } per 100 g, null when missing
  // ingredientText: string or null/empty when missing
  // Returns an array of { key, label, rule, outcome, value, unit } for the targets that are set, in a fixed order.
  function evaluate(targets, nutrition, ingredientText) {
    targets = targets || {}; nutrition = nutrition || {};
    var out = [];
    DEFS.forEach(function (def) {
      var t = parseTarget(targets[def.key]);
      if (t === null) return;
      var v = isNum(nutrition[def.key]) ? nutrition[def.key] : null;
      out.push({
        key: def.key, label: def.label, unit: def.unit, target: t,
        rule: def.label + (def.dir === "min" ? " at least " : " at most ") + t + " " + def.unit + " per 100 g",
        value: v, outcome: evalNumeric(def, t, v)
      });
    });
    var words = parseExclusions(targets.exclude);
    var hasText = typeof ingredientText === "string" && ingredientText.trim() !== "";
    words.forEach(function (w) {
      var outcome, found = null;
      if (!hasText) outcome = CANNOT;
      else { found = containsWord(ingredientText, w); outcome = found ? NOT_MET : MET; }
      out.push({ key: "exclude:" + w, label: "Excludes " + w, unit: null, target: w, rule: "Ingredients do not contain \"" + w + "\"", value: null, found: found, outcome: outcome });
    });
    return out;
  }

  var api = { DEFS: DEFS, MET: MET, NOT_MET: NOT_MET, CANNOT: CANNOT, parseTarget: parseTarget, parseExclusions: parseExclusions, containsWord: containsWord, evaluate: evaluate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.targets = api; }
})(typeof window !== "undefined" ? window : globalThis);
