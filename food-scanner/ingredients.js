/* Heuristic ingredient list parser. Splits on commas/semicolons, flattens bracketed sub-ingredients,
 * strips percentages. It is a heuristic: always show the parsed result to the user. */
(function (root) {
  "use strict";

  function normalise(text) {
    var t = String(text || "").replace(/[\r\n\t]+/g, " ").replace(/[\[{]/g, "(").replace(/[\]}]/g, ")").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
    t = t.replace(/\(\s*[ivx]{1,4}\s*\)/gi, ""); // INS subtype such as 503(ii)
    var m = t.match(/ingredients?\s*[:\-]/i);
    if (m) t = t.slice(m.index + m[0].length);
    return t.trim();
  }

  function cutTrace(t) {
    var m = t.match(/\b(may contain|may also contain|allergen information|allergen advice|manufactured (?:in|on)|processed in|produced in|packed in)\b/i);
    if (!m) return { main: t, trace: null };
    return { main: t.slice(0, m.index), trace: t.slice(m.index).trim() };
  }

  function splitTop(s, seps) {
    var out = [], depth = 0, cur = "";
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "(") depth++;
      if (c === ")") depth = Math.max(0, depth - 1);
      if (depth === 0 && seps.indexOf(c) >= 0) { out.push(cur); cur = ""; } else cur += c;
    }
    out.push(cur);
    return out;
  }

  function clean(s) {
    return s.replace(/\d+(?:[.,]\d+)?\s*%/g, " ").replace(/\b(min|max|approx|approximately)\.?\b/gi, " ")
      .replace(/^\s*(and|&|contains)\s+/i, " ").replace(/[*†‡]/g, " ").replace(/\s+/g, " ").replace(/^[\s.:\-]+|[\s.:\-]+$/g, "").trim();
  }

  var CODE_ONLY = /^(?:(?:ins|e)\s*-?\s*)?\d{3,4}[a-z]?(?:\s*\([ivx]+\))?$/i;

  function parseSegment(seg, inBracket, parentName) {
    var res = [];
    seg = seg.replace(/^[^(:]*?:\s*(?=[^()]*(?:[,(]|$))/, function (m) { return inBracket ? m : ""; }); // drop headings like "NOODLES:"
    // find first bracket group at depth 0
    var open = seg.indexOf("(");
    if (open < 0) { var n = clean(seg); if (n) res.push({ text: n, parent: parentName || null }); return res; }
    var depth = 0, close = -1;
    for (var i = open; i < seg.length; i++) { if (seg[i] === "(") depth++; if (seg[i] === ")") { depth--; if (depth === 0) { close = i; break; } } }
    if (close < 0) close = seg.length;
    var before = clean(seg.slice(0, open)), inner = seg.slice(open + 1, close), after = seg.slice(close + 1);
    if (before) res.push({ text: before, parent: parentName || null, hasChildren: true });
    var kids = splitTop(inner, [",", ";", "&"]);
    kids.forEach(function (k) {
      var kc = clean(k);
      if (!kc) return;
      if (/^\d{3,4}[a-z]?(\s*\([ivx]+\))?$/i.test(kc)) kc = "INS " + kc; // bare number inside brackets = INS code
      parseSegment(kc, true, before || parentName).forEach(function (r) { res.push(r); });
    });
    var rest = clean(after);
    if (rest) parseSegment(rest, inBracket, parentName).forEach(function (r) { res.push(r); });
    return res;
  }

  function parse(text) {
    var t = normalise(text);
    var cut = cutTrace(t);
    var segs = splitTop(cut.main, [",", ";"]);
    var items = [], seen = {};
    segs.forEach(function (s) {
      parseSegment(s, false, null).forEach(function (r) {
        var key = r.text.toLowerCase();
        if (!r.text || seen[key]) return;
        seen[key] = true;
        items.push(r);
      });
    });
    return { items: items, trace: cut.trace, hadHeading: /ingredients?\s*[:\-]/i.test(String(text || "")) };
  }

  var api = { parse: parse, CODE_ONLY: CODE_ONLY };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else { root.FS = root.FS || {}; root.FS.ingredients = api; }
})(typeof window !== "undefined" ? window : globalThis);
