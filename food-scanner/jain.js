/* Rule-based Jain screening aid. Screening aid only, not a certification.
 * Reads rules from jain-rules.js. Never says "Jain" or "Jain certified". */
(function (root) {
  "use strict";
  var RULES = (typeof module !== "undefined" && module.exports) ? require("./jain-rules.js") : root.FS.jainRules;
  var ING = (typeof module !== "undefined" && module.exports) ? require("./ingredients.js") : root.FS.ingredients;

  var RANK = { not_jain: 3, unknown: 2, ok: 1 };
  var compiled = null;

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function compile(rules) {
    var list = [];
    rules.groups.forEach(function (g) {
      g.terms.forEach(function (term) {
        var pat = esc(term.toLowerCase()).replace(/\s+/g, "\\s+");
        list.push({ term: term, group: g, re: new RegExp("(?<![a-z0-9])" + pat + "(?:s|es)?(?![a-z0-9])", "g") });
      });
    });
    return list;
  }

  function resolveCls(group, config) {
    if (group.cls === "honey") return config.honey === "unknown" ? "unknown" : "not_jain";
    return group.cls;
  }

  function baseCode(c) { return c.toLowerCase().replace(/\s*\([ivx]+\)\s*$/, ""); }

  function classifyText(text, opts) {
    var rules = opts.rules, config = opts.config;
    if (!compiled || compiled.rules !== rules) compiled = { rules: rules, list: compile(rules) };
    var s = text.toLowerCase();
    var hits = [];
    compiled.list.forEach(function (c) {
      c.re.lastIndex = 0;
      var m;
      while ((m = c.re.exec(s)) !== null) {
        hits.push({ start: m.index, end: m.index + m[0].length, len: c.term.length, cls: resolveCls(c.group, config), group: c.group, term: c.term });
        if (m[0].length === 0) c.re.lastIndex++;
      }
    });
    // drop hits fully inside a longer hit
    hits = hits.filter(function (h) {
      return !hits.some(function (o) { return o !== h && o.start <= h.start && o.end >= h.end && (o.end - o.start) > (h.end - h.start); });
    });
    // codes
    var codeRe = /\b(?:ins|e)\s*-?\s*(\d{3,4}[a-z]?)(?:\s*\(([ivx]+)\))?/gi, cm, codeHits = [];
    while ((cm = codeRe.exec(s)) !== null) {
      var code = cm[1].toLowerCase();
      if (rules.codes.not_jain[code]) codeHits.push({ cls: "not_jain", why: "E/INS " + code + ": " + rules.codes.not_jain[code] });
      else if (rules.codes.ok[code]) codeHits.push({ cls: "ok", why: "E/INS " + code + ": " + rules.codes.ok[code] });
      else codeHits.push({ cls: "unknown", why: "E/INS " + code + ": additive of unstated origin" });
    }
    var all = hits.map(function (h) {
      var why = h.cls === "not_jain" ? h.group.label + ' ("' + h.term + '")'
        : h.cls === "unknown" ? (h.group.reason ? h.group.reason + ' ("' + h.term + '")' : '"' + h.term + '"')
        : 'plant/dairy/mineral/synthetic ("' + h.term + '")';
      if (h.group.cls === "honey") why = "bee product, treated per honey setting (" + config.honey + ") (\"" + h.term + "\")";
      return { cls: h.cls, why: why, reason: h.group.reason || null };
    }).concat(codeHits.map(function (c) { return { cls: c.cls, why: c.why, reason: c.cls === "unknown" ? "origin unstated" : null }; }));

    if (!all.length) return { cls: "unknown", why: "not in the rule list, so origin cannot be judged", reason: "unrecognised" };
    // A code-only or word-only ok must not hide an unknown part, so the most restrictive wins.
    all.sort(function (a, b) { return RANK[b.cls] - RANK[a.cls]; });
    var top = all[0];
    return { cls: top.cls, why: top.why, reason: top.reason };
  }

  /* Overall analysis.
   * input: { text, confidence: "ok" | "low" | "unverified", confidenceNote, source }
   * opts: { rules, honey } */
  function analyse(input, opts) {
    opts = opts || {};
    var rules = opts.rules || RULES;
    var config = { honey: opts.honey || rules.config.honey };
    var parsed = ING.parse(input.text || "");
    var fc = {};
    rules.functionalClasses.forEach(function (f) { fc[f] = true; });

    var rows = [];
    parsed.items.forEach(function (it) {
      var lower = it.text.toLowerCase();
      var isParentClass = it.hasChildren && fc[lower];
      if (isParentClass) return; // children carry the classification
      var r = classifyText(it.text, { rules: rules, config: config });
      rows.push({ text: it.text, parent: it.parent, cls: r.cls, why: r.why, reason: r.reason });
    });

    var notJain = rows.filter(function (r) { return r.cls === "not_jain"; });
    var unknown = rows.filter(function (r) { return r.cls === "unknown"; });
    var statedUnknown = unknown.filter(function (r) { return r.reason !== "unrecognised"; });
    var traceNote = null;
    if (parsed.trace) {
      var tr = classifyText(parsed.trace, { rules: rules, config: config });
      if (tr.cls === "not_jain") traceNote = "The 'may contain / manufactured in' statement mentions something flagged as not Jain (" + tr.why + "). It was not counted in the verdict.";
    }

    var verdict, level, reasons = [];
    if (!rows.length) {
      verdict = "Cannot determine - no ingredient list"; level = "unknown";
    } else if (input.confidence === "low" || input.confidence === "unverified") {
      verdict = "Cannot determine - " + (input.confidence === "low" ? "low-confidence or incomplete text" : "text not confirmed as complete and correct");
      level = "unknown";
      reasons.push(input.confidenceNote || "Confirm the text matches the label to lift this.");
      if (notJain.length) reasons.push("Possible non-Jain ingredients seen in the unconfirmed text: " + notJain.map(function (r) { return r.text; }).join(", ") + ".");
    } else if (notJain.length) {
      verdict = "Not Jain: " + notJain.map(function (r) { return r.text; }).join(", "); level = "bad";
    } else if (unknown.length) {
      if (statedUnknown.length) {
        verdict = "Cannot determine - contains ingredients of unstated origin";
        reasons.push("Unstated origin or practice-dependent: " + statedUnknown.map(function (r) { return r.text; }).join(", ") + ".");
      } else {
        verdict = "Cannot determine - some ingredients are not in the rule list";
      }
      var unrec = unknown.filter(function (r) { return r.reason === "unrecognised"; });
      if (unrec.length && statedUnknown.length) reasons.push("Not in the rule list: " + unrec.map(function (r) { return r.text; }).join(", ") + ".");
      level = "unknown";
    } else {
      verdict = "No non-Jain ingredients detected"; level = "good";
      reasons.push("Every listed ingredient matched a plant, dairy, mineral or synthetic rule. This is not a certification.");
    }
    return { verdict: verdict, level: level, rows: rows, reasons: reasons, trace: parsed.trace, traceNote: traceNote, count: rows.length, source: input.source || null };
  }

  var api = { analyse: analyse, classifyText: classifyText, rules: RULES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.jain = api; }
})(typeof window !== "undefined" ? window : globalThis);
