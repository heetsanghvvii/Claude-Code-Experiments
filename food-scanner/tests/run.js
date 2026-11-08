/* Run: node food-scanner/tests/run.js */
const assert = require("assert");
const ns = require("../nutriscore.js");
const jain = require("../jain.js");
const ING = require("../ingredients.js");
let n = 0;
function t(name, fn) { fn(); n++; console.log("ok -", name); }

// Nutri-Score (2023) reference values taken from Open Food Facts' own 2023 computation (see README).
t("Parle-G scores 21 / E", () => {
  const r = ns.compute({ energyKj: 1894, sugars: 25.5, satFat: 6.2, salt: 0.74, fibre: 0.7, protein: 7, fvl: 0, fat: 11.8, carbs: 78.4 });
  assert.strictEqual(r.status, "ok"); assert.strictEqual(r.score, 21); assert.strictEqual(r.grade, "E");
  assert.strictEqual(r.proteinCounted, false);
  assert.deepStrictEqual(r.rows.slice(0, 4).map(x => x.points), [5, 7, 6, 3]);
});
t("missing inputs listed, no score", () => {
  const r = ns.compute({ energyKj: 100, sugars: 1, satFat: null, salt: 0.1, fibre: null, protein: 2, fvl: null });
  assert.strictEqual(r.status, "insufficient"); assert.strictEqual(r.missing.length, 3); assert.strictEqual(r.score, undefined);
});
t("implausible data blocked", () => {
  const r = ns.compute({ energyKj: 2064, sugars: 37, satFat: 7.7, salt: 295, fibre: 1, protein: 4.7, fvl: 0, fat: 19.9, carbs: 73.4 });
  assert.strictEqual(r.status, "inconsistent");
});
t("zero input is grade A at 0", () => {
  const r = ns.compute({ energyKj: 0, sugars: 0, satFat: 0, salt: 0, fibre: 0, protein: 0, fvl: 0 });
  assert.strictEqual(r.score, 0); assert.strictEqual(r.grade, "A");
});
t("threshold is strictly greater", () => {
  assert.strictEqual(ns.compute({ energyKj: 335, sugars: 3.4, satFat: 1, salt: 0.2, fibre: 0, protein: 0, fvl: 0 }).score, 0);
  assert.strictEqual(ns.compute({ energyKj: 336, sugars: 0, satFat: 0, salt: 0, fibre: 0, protein: 0, fvl: 0 }).score, 1);
});
t("protein counted only when N<11; never at N>=11, even with fvl > 80", () => {
  const a = ns.compute({ energyKj: 1000, sugars: 5, satFat: 1, salt: 0.1, fibre: 0, protein: 20, fvl: 0 });
  assert.strictEqual(a.proteinCounted, true);
  const b = ns.compute({ energyKj: 1200, sugars: 15, satFat: 5, salt: 0.1, fibre: 0, protein: 20, fvl: 85 });
  assert.strictEqual(b.proteinCounted, false); assert.strictEqual(b.negative, 11);
  assert.strictEqual(b.score, 6); assert.strictEqual(b.grade, "C");
});

// Jain
const ok = { confidence: "ok" };
t("gelatin => Not Jain", () => {
  const r = jain.analyse(Object.assign({ text: "Sugar, Glucose Syrup, Gelatin, Citric Acid (E330), Colour (E120)" }, ok));
  assert.ok(r.verdict.startsWith("Not Jain:"), r.verdict); assert.ok(/Gelatin/.test(r.verdict));
});
t("ambiguous => Cannot determine, unstated origin", () => {
  const r = jain.analyse(Object.assign({ text: "Wheat flour, sugar, emulsifier (E471), natural flavouring" }, ok));
  assert.strictEqual(r.verdict, "Cannot determine - contains ingredients of unstated origin");
});
t("lecithin without source unknown, soy lecithin ok", () => {
  assert.strictEqual(jain.analyse(Object.assign({ text: "Sugar, lecithin" }, ok)).level, "unknown");
  assert.strictEqual(jain.analyse(Object.assign({ text: "Sugar, soy lecithin" }, ok)).level, "good");
});
t("plain list => No non-Jain ingredients detected", () => {
  const r = jain.analyse(Object.assign({ text: "Refined wheat flour (maida) 68%, sugar, refined palm oil, iodised salt, raising agents [INS 503(ii), 500(ii)]" }, ok));
  assert.strictEqual(r.verdict, "No non-Jain ingredients detected");
});
t("root vegetables flagged, eggplant not", () => {
  assert.ok(jain.analyse(Object.assign({ text: "Rice, onion powder, potato starch" }, ok)).verdict.startsWith("Not Jain"));
  assert.strictEqual(jain.analyse(Object.assign({ text: "Eggplant, salt" }, ok)).level, "unknown"); // eggplant not in list => unrecognised, never "Not Jain"
});
t("honey configurable", () => {
  assert.ok(jain.analyse(Object.assign({ text: "Oats, honey" }, ok), { honey: "not_jain" }).verdict.startsWith("Not Jain"));
  assert.ok(jain.analyse(Object.assign({ text: "Oats, honey" }, ok), { honey: "unknown" }).verdict.startsWith("Cannot determine"));
});
t("low-confidence OCR never gives a verdict", () => {
  const r = jain.analyse({ text: "Sugar, gelatin", confidence: "low" });
  assert.ok(r.verdict.startsWith("Cannot determine"));
});
t("empty => Cannot determine", () => {
  assert.ok(jain.analyse({ text: "", confidence: "ok" }).verdict.startsWith("Cannot determine"));
});
t("alcohol flagged", () => {
  assert.ok(jain.analyse(Object.assign({ text: "Sugar, rum, cocoa" }, ok)).verdict.startsWith("Not Jain"));
});
t("parser strips percentages and brackets", () => {
  const p = ING.parse("Ingredients: Wheat flour (68%), Sugar, Spices (cumin, chilli) 2%.");
  assert.deepStrictEqual(p.items.map(i => i.text), ["Wheat flour", "Sugar", "Spices", "cumin", "chilli"]);
});
const cs = require("../custom-score.js");
t("custom score: known case and missing data", () => {
  const r = cs.compute({ energyKj: 1250, sugars: 15, satFat: 5, salt: 1.25, fibre: 3, protein: 7.5 }, ns.plausibility);
  assert.strictEqual(r.status, "ok"); assert.strictEqual(r.raw, 100 - 12.5 - 12.5 - 12.5 - 12.5 + 5 + 5); assert.strictEqual(r.score, 60);
  assert.strictEqual(cs.compute({ energyKj: 1, sugars: 1, satFat: 1, salt: 1, fibre: null, protein: 1 }).status, "insufficient");
  assert.strictEqual(cs.compute({ energyKj: 0, sugars: 0, satFat: 0, salt: 0, fibre: 20, protein: 50 }).score, 100);
});
console.log("\n" + n + " tests passed");
