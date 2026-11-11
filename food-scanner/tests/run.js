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
const bands = require("../bands.js");
const tg = require("../targets.js");
const val = require("../value.js");

// Macro Score v2. Hand-worked: protein 10 g, 400 kcal -> 2.5 g/100kcal -> 40*0.25 = 10; sugars 13.75 -> 20*(22.5-13.75)/17.5 = 10;
// satFat 3.25 -> 15*(5-3.25)/3.5 = 7.5; salt 0.9 -> 10*(1.5-0.9)/1.2 = 5; fibre 3 -> 15*0.5 = 7.5. Sum 40 -> Mid.
t("Macro Score: hand-worked case, bands, missing data", () => {
  const r = cs.compute({ kcal: 400, protein: 10, sugars: 13.75, satFat: 3.25, salt: 0.9, fibre: 3 });
  assert.strictEqual(r.status, "ok"); assert.strictEqual(r.score, 40); assert.deepStrictEqual(r.rows.map(x => x.points), [10, 10, 7.5, 5, 7.5]);
  assert.strictEqual(r.band, "Mid"); assert.strictEqual(r.level, "amber");
  assert.strictEqual(cs.compute({ kcal: 100, protein: 10, sugars: 5, satFat: 1.5, salt: 0.3, fibre: 6 }).score, 100);
  assert.strictEqual(cs.compute({ kcal: 100, protein: 0, sugars: 30, satFat: 9, salt: 3, fibre: 0 }).score, 0);
  assert.strictEqual(cs.compute({ energyKj: 1673.6, protein: 10, sugars: 13.75, satFat: 3.25, salt: 0.9, fibre: 3 }).score, 40); // kJ / 4.184 = 400 kcal
  assert.strictEqual(cs.compute({ kcal: 400, protein: 10, sugars: 1, satFat: 1, salt: 0.1, fibre: null }).status, "insufficient");
  const z = cs.compute({ kcal: 0, protein: 0, sugars: 0, satFat: 0, salt: 0, fibre: 0 }); assert.strictEqual(z.status, "insufficient");
  assert.strictEqual(cs.compute({ protein: 1, sugars: 1, satFat: 1, salt: 1, fibre: 1 }).status, "insufficient");
});
t("Macro Score band edges 70 / 69 / 40 / 39", () => {
  assert.strictEqual(cs.band(70).word, "High"); assert.strictEqual(cs.band(69).word, "Mid");
  assert.strictEqual(cs.band(40).word, "Mid"); assert.strictEqual(cs.band(39).word, "Low"); assert.strictEqual(cs.band(0).level, "red");
});
t("Parle-G Macro Score hand check (protein 7, 448 kcal, sugars 25.5, satFat 6.2, salt 0.74, fibre 0.7)", () => {
  const r = cs.compute({ kcal: 448, protein: 7, sugars: 25.5, satFat: 6.2, salt: 0.74, fibre: 0.7 });
  // density 7/448*100 = 1.5625 -> 40*0.15625 = 6.25; sugars 0; satFat 0; salt 10*(1.5-0.74)/1.2 = 6.333; fibre 15*0.7/6 = 1.75; sum 14.33 -> 14
  assert.strictEqual(r.score, 14); assert.strictEqual(r.band, "Low");
});

// bands.js boundaries
t("bands: sugars 5.0 Low, 5.1 Medium, 22.5 Medium, 22.6 High", () => {
  assert.strictEqual(bands.lmh("sugars", 5.0).word, "Low"); assert.strictEqual(bands.lmh("sugars", 5.1).word, "Medium");
  assert.strictEqual(bands.lmh("sugars", 22.5).word, "Medium"); assert.strictEqual(bands.lmh("sugars", 22.6).word, "High");
  assert.strictEqual(bands.lmh("sugars", 22.6).level, "red"); assert.strictEqual(bands.lmh("sugars", 0).level, "green");
});
t("bands: fat, saturated fat, salt boundaries and missing", () => {
  assert.strictEqual(bands.lmh("fat", 3.0).word, "Low"); assert.strictEqual(bands.lmh("fat", 17.5).word, "Medium"); assert.strictEqual(bands.lmh("fat", 17.6).word, "High");
  assert.strictEqual(bands.lmh("satFat", 1.5).word, "Low"); assert.strictEqual(bands.lmh("satFat", 5.0).word, "Medium"); assert.strictEqual(bands.lmh("satFat", 5.1).word, "High");
  assert.strictEqual(bands.lmh("salt", 0.3).word, "Low"); assert.strictEqual(bands.lmh("salt", 1.5).word, "Medium"); assert.strictEqual(bands.lmh("salt", 1.6).word, "High");
  assert.strictEqual(bands.lmh("salt", null), null); assert.strictEqual(bands.lmh("fat", undefined), null);
});
t("bands: protein share of energy and fibre claims", () => {
  assert.strictEqual(bands.protein(20, 400).word, "High protein"); // 80/400 = 0.20 exactly
  assert.strictEqual(bands.protein(19.9, 400).word, "Source of protein"); // 0.199
  assert.strictEqual(bands.protein(12, 400).word, "Source of protein"); // 48/400 = 0.12
  assert.strictEqual(bands.protein(11.9, 400), null);
  assert.strictEqual(bands.protein(null, 400), null); assert.strictEqual(bands.protein(20, null), null); assert.strictEqual(bands.protein(20, 0), null);
  assert.strictEqual(bands.fibre(6).word, "High fibre"); assert.strictEqual(bands.fibre(5.9).word, "Source of fibre");
  assert.strictEqual(bands.fibre(3).word, "Source of fibre"); assert.strictEqual(bands.fibre(2.9), null); assert.strictEqual(bands.fibre(null), null);
});

// targets.js
t("targets: at least comparator (met / not met / missing, boundary)", () => {
  const ev = (v) => tg.evaluate({ protein: "20" }, { protein: v }, "x")[0].outcome;
  assert.strictEqual(ev(20), "met"); assert.strictEqual(ev(25), "met"); assert.strictEqual(ev(19.99), "not met");
  assert.strictEqual(ev(null), "cannot check (field missing)"); assert.strictEqual(ev(undefined), "cannot check (field missing)");
});
t("targets: at most comparator (met / not met / missing, boundary)", () => {
  const ev = (k, v, tv) => tg.evaluate({ [k]: tv }, { [k]: v }, "x")[0].outcome;
  assert.strictEqual(ev("sugars", 5, "5"), "met"); assert.strictEqual(ev("sugars", 5.01, "5"), "not met"); assert.strictEqual(ev("sugars", 0, "5"), "met");
  assert.strictEqual(ev("sugars", null, "5"), "cannot check (field missing)");
  assert.strictEqual(ev("satFat", 3, "3"), "met"); assert.strictEqual(ev("salt", 1.2, "1"), "not met"); assert.strictEqual(ev("kcal", 400, "400"), "met");
  assert.strictEqual(ev("kcal", 401, "400"), "not met"); assert.strictEqual(ev("fibre", 5, "5"), "met"); assert.strictEqual(ev("fibre", 4.9, "5"), "not met");
});
t("targets: empty or invalid targets are not evaluated; zero is a valid target", () => {
  assert.strictEqual(tg.evaluate({ protein: "", sugars: "abc", salt: "-1" }, {}, "").length, 0);
  assert.strictEqual(tg.evaluate({ sugars: "0" }, { sugars: 0 }, "x")[0].outcome, "met");
  assert.strictEqual(tg.evaluate({ protein: "12,5" }, { protein: 12.5 }, "x")[0].outcome, "met");
});
t("targets: ingredient exclusions are whole-word and case-insensitive", () => {
  const ev = (term, text) => tg.evaluate({ exclude: term }, {}, text)[0].outcome;
  assert.strictEqual(ev("palm oil", "Wheat flour, Refined Palm Oil, salt"), "not met");
  assert.strictEqual(ev("palm oil", "Wheat flour, PALM OIL (12%), salt"), "not met");
  assert.strictEqual(ev("palm oil", "Wheat flour, palmolein, salt"), "met");
  assert.strictEqual(ev("palmolein", "Wheat flour, palmolein, salt"), "not met");
  assert.strictEqual(ev("palm", "Wheat flour, palm oil"), "not met"); // typed word "palm" is a whole word here
  assert.strictEqual(ev("oil", "Sugar, soyabean oils"), "met");
  assert.strictEqual(ev("palm oil", "Wheat flour,  palm   oil"), "not met");
  assert.strictEqual(ev("sugar", "Sugarcane juice"), "met");
});
t("targets: missing ingredient text gives cannot check; list parsing", () => {
  assert.strictEqual(tg.evaluate({ exclude: "palm oil" }, {}, "")[0].outcome, "cannot check (field missing)");
  assert.strictEqual(tg.evaluate({ exclude: "palm oil" }, {}, null)[0].outcome, "cannot check (field missing)");
  assert.strictEqual(tg.evaluate({ exclude: "palm oil" }, {}, "   ")[0].outcome, "cannot check (field missing)");
  assert.deepStrictEqual(tg.parseExclusions(" Palm Oil, maltodextrin ,, palm oil"), ["palm oil", "maltodextrin"]);
  assert.strictEqual(tg.evaluate({ exclude: "palm oil, maltodextrin" }, {}, "palm oil").length, 2);
});

// value.js
t("value: protein per 100 kcal known case and missing/zero energy", () => {
  assert.strictEqual(val.proteinPer100kcal(20, 400).value, 5); assert.strictEqual(val.proteinPer100kcal(7, 462).value, 1.5);
  assert.strictEqual(val.proteinPer100kcal(10, 300).value, 3.3);
  assert.strictEqual(val.proteinPer100kcal(10, 0).status, "insufficient"); assert.strictEqual(val.proteinPer100kcal(10, null).status, "insufficient");
  assert.strictEqual(val.proteinPer100kcal(null, 300).status, "insufficient"); assert.strictEqual(val.proteinPer100kcal(0, 300).value, 0);
});
t("value: protein per Rs 100 known case and missing inputs", () => {
  // 20 g/100 g, 200 g pack -> 40 g protein; Rs 80 -> 40/80*100 = 50
  const r = val.proteinPerRs100(20, 200, 80); assert.strictEqual(r.status, "ok"); assert.strictEqual(r.value, 50); assert.strictEqual(r.packProtein, 40);
  assert.strictEqual(val.proteinPerRs100(7, 50, 10).value, 35); assert.strictEqual(val.proteinPerRs100(7, 55, 30).value, 12.8);
  assert.strictEqual(val.proteinPerRs100(20, null, 80).status, "insufficient"); assert.strictEqual(val.proteinPerRs100(20, 200, null).status, "insufficient");
  assert.strictEqual(val.proteinPerRs100(20, 200, 0).status, "insufficient"); assert.strictEqual(val.proteinPerRs100(null, 200, 80).status, "insufficient");
  assert.strictEqual(val.proteinPerRs100(20, 0, 80).status, "insufficient");
});
t("value: pack weight grams only, ml ignored", () => {
  assert.strictEqual(val.packGrams("250", "g", "250 g").grams, 250); assert.strictEqual(val.packGrams(250, undefined, "250 g").grams, 250);
  assert.strictEqual(val.packGrams(500, "ml", "500 ml").grams, null); assert.strictEqual(val.packGrams(500, "ml", "500 ml").reason, "ml");
  assert.strictEqual(val.packGrams(undefined, undefined, "250 g").grams, null); assert.strictEqual(val.packGrams(250, undefined, undefined).grams, null);
});
t("value: ranking, ties, nulls", () => {
  const P = (code, pro, kcal) => ({ code, proteins_100g: pro, energy_kcal_100g: kcal });
  const list = [P("1", 20, 400), P("2", 30, 400), P("3", 15, 400), P("4", 15, 400), P("5", 20, null), P("6", null, 300), P("7", 5, 0)];
  const rk = val.rankCategory(list);
  assert.deepStrictEqual(rk.rows.map(r => r.product.code), ["2", "1", "3", "4"]); assert.strictEqual(rk.leftOut, 3); assert.strictEqual(rk.total, 7);
  assert.deepStrictEqual(val.position(list, 4), { rank: 3, of: 5, tiedWith: 0 });  // 4 g per 100 kcal: below 7.5 and 5, above 3.75
  assert.deepStrictEqual(val.position(list, 3.75), { rank: 3, of: 5, tiedWith: 2 }); // ties both
  assert.deepStrictEqual(val.position(list, 100), { rank: 1, of: 5, tiedWith: 0 });
  assert.deepStrictEqual(val.position(list, 0.1), { rank: 5, of: 5, tiedWith: 0 });
  assert.deepStrictEqual(val.position(list, 5, "1"), { rank: 2, of: 4, tiedWith: 0 }); // own barcode excluded from the others
  assert.strictEqual(val.position(list, null), null); assert.strictEqual(val.position([], 5).of, 1);
  assert.strictEqual(val.ordinal(1), "1st"); assert.strictEqual(val.ordinal(12), "12th"); assert.strictEqual(val.ordinal(22), "22nd"); assert.strictEqual(val.ordinal(113), "113th");
});
t("value: category matching and MRP ranking", () => {
  const cats = { a: { label: "A", tags: ["en:x", "en:y"] }, b: { label: "B", tags: ["en:z"] } };
  assert.deepStrictEqual(val.matchCategories(["en:q", "en:y"], cats), ["a"]); assert.deepStrictEqual(val.matchCategories([], cats), []); assert.deepStrictEqual(val.matchCategories(undefined, cats), []);
  const m = val.rankMrp([{ protein_100g: 10, pack_g: 100, mrp_inr: 50 }, { protein_100g: 20, pack_g: 100, mrp_inr: 50 }, { protein_100g: 20, pack_g: null, mrp_inr: 50 }]);
  assert.deepStrictEqual(m.rows.map(r => r.value), [40, 20]); assert.strictEqual(m.skipped, 1);
});
const fixture = require("./fixtures/protein-india.sample.json");
t("fixture: schema and ranking of TEST data", () => {
  const c = fixture.categories["protein-bars"], rk = val.rankCategory(c.products);
  assert.strictEqual(rk.rows[0].product.name, "TEST Bar B (fixture)"); assert.strictEqual(rk.leftOut, 3);
});
console.log("\n" + n + " tests passed");
