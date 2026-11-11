#!/usr/bin/env node
/*
 * build-seed.js : builds data/seed-mrp.json from the brands' own public product pages.
 *
 * Run (proxied environment):
 *   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node food-scanner/tools/build-seed.js
 * Optional: SEED_CACHE_DIR=<dir> caches fetched bodies so re-runs do not hit the sites again.
 *
 * Dependency-free, Node 18+. Rules baked in:
 *  - fetches /robots.txt first per host and skips any path it disallows for "*";
 *  - a host that answers robots.txt with a bot challenge (HTTP 403 / "Just a moment") is NOT scraped;
 *  - at most one request per 2 seconds per host and at most MAX_REQ_PER_HOST requests per host per run;
 *  - never estimates a value: anything not shown on the page is null.
 *
 * Sources per brand:
 *  - pintola.in, www.yogabars.in : Shopify /products.json (title, variants, price, compare_at_price,
 *    grams, barcode) plus the product page HTML for nutrition text.
 *  - thewholetruthfoods.com : product page HTML (schema.org JSON-LD and the embedded page data:
 *    per-variant price, compare_at_price, net weight "N x W", nutrition table with its serving size).
 *  - www.muscleblaze.com : attempted; robots.txt is behind a Cloudflare challenge, so it is skipped.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UA = "FoodLabelChecker-prototype/0.1";
const DELAY_MS = 2000;
const MAX_REQ_PER_HOST = 45;
const CHECKED = "2026-11-11";
const OUT = path.join(__dirname, "..", "data", "seed-mrp.json");
const CACHE_DIR = process.env.SEED_CACHE_DIR || "";

/* ------------------------------------------------------------------ */
/* OVERRIDES: hand-checked corrections. Each entry is matched by       */
/* "<source_url>|<name>" and patches only the listed fields. Put the   */
/* page URL you checked by eye beside each one.                        */
/* ------------------------------------------------------------------ */
const OVERRIDES = {
  // key: "<source_url>|<row name>" : { fields..., why: "..." }
  // Shopify "grams" is a shipping weight and disagrees with the weight the brand prints in the
  // product title on the page; the title is what the brand states to shoppers, so it wins here.
  "https://www.yogabars.in/products/power-up-coffee-crush-butter-20g-protein-bar-70g|Power Up Coffee Crush Butter 20g Protein Bar 70g":
    { pack_g: 70, why: "page title says 70g (single bar; the 5-pack page says 350g); Shopify grams field said 350" },
  "https://www.yogabars.in/products/dark-chocolate-cranberry-muesli-450g|Dark Chocolate & Cranberry Muesli 450g":
    { pack_g: 450, why: "page title says 450g; Shopify grams field said 400" },
  "https://www.yogabars.in/products/classic-protein-date-minis|Classic Protein Date Minis - 200g - 10 pcs - Pack of 1":
    { pack_g: 200, why: "page title says 200g - 10 pcs; Shopify grams field said 480 for every pack size" },
  "https://www.yogabars.in/products/choco-dipped-protein-date-minis|Choco Dipped Protein Date Minis - 200g - 10pcs - Pack of 1":
    { pack_g: 200, why: "page title says 200g - 10pcs; Shopify grams field said 480 for every pack size" },
};

/* ---------------------------- fetching ----------------------------- */
const hostState = {};   // host -> { last: ms, count: n, robots: null|{allowed(path)}, blocked: bool }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function cacheKey(url) { return crypto.createHash("sha1").update(url).digest("hex"); }

async function rawGet(url) {
  const u = new URL(url);
  const st = (hostState[u.host] = hostState[u.host] || { last: 0, count: 0, robots: null, blocked: false });
  if (CACHE_DIR) {
    const f = path.join(CACHE_DIR, cacheKey(url));
    if (fs.existsSync(f)) return { status: 200, body: fs.readFileSync(f, "utf8"), cached: true };
  }
  if (st.count >= MAX_REQ_PER_HOST) throw new Error("request cap reached for " + u.host);
  const wait = st.last + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  st.last = Date.now(); st.count++;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "*/*" }, redirect: "follow" });
  const body = await res.text();
  if (CACHE_DIR && res.status === 200) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(CACHE_DIR, cacheKey(url)), body);
  }
  return { status: res.status, body };
}

function parseRobots(text) {
  const groups = []; let cur = null, lastWasUA = false;
  for (let line of text.split(/\r?\n/)) {
    line = line.replace(/#.*$/, "").trim(); if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!lastWasUA) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastWasUA = true; }
    else if ((k === "allow" || k === "disallow") && cur) { cur.rules.push({ allow: k === "allow", pat: v }); lastWasUA = false; }
    else lastWasUA = false;
  }
  const star = groups.filter((g) => g.agents.includes("*")).flatMap((g) => g.rules);
  const toRe = (p) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
  return {
    allowed(p) {
      let best = null;
      for (const r of star) {
        if (!r.pat) continue;
        if (toRe(r.pat).test(p)) {
          if (!best || r.pat.length > best.pat.length || (r.pat.length === best.pat.length && r.allow)) best = r;
        }
      }
      return !best || best.allow;
    },
  };
}

async function initHost(host) {
  const st = (hostState[host] = hostState[host] || { last: 0, count: 0, robots: null, blocked: false });
  if (st.robots || st.blocked) return st;
  const r = await rawGet("https://" + host + "/robots.txt");
  if (r.status !== 200 || /Just a moment|cf_chl_opt|challenge-platform/i.test(r.body)) {
    st.blocked = true; st.blockedWhy = "robots.txt returned HTTP " + r.status + (/Just a moment/i.test(r.body) ? " (Cloudflare bot challenge)" : "");
  } else st.robots = parseRobots(r.body);
  return st;
}

async function get(url) {
  const u = new URL(url);
  const st = await initHost(u.host);
  if (st.blocked) throw new Error("host blocked: " + st.blockedWhy);
  if (!st.robots.allowed(u.pathname + u.search)) throw new Error("disallowed by robots.txt: " + u.pathname);
  const r = await rawGet(url);
  if (r.status !== 200) throw new Error("HTTP " + r.status + " for " + url);
  return r.body;
}

/* ----------------------------- helpers ----------------------------- */
const stripHtml = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const num = (x) => (x == null || x === "" ? null : Number(x));
const toG = (v, unit) => { v = Number(v); unit = unit.toLowerCase(); return unit === "kg" ? v * 1000 : v; };
const round = (x, d) => (x == null ? null : Math.round(x * Math.pow(10, d)) / Math.pow(10, d));

const rows = [];
const skipped = [];     // { brand, what, why }
const warnings = [];
const stats = { perServing: 0, imageOnly: 0 };

function skip(brand, what, why) { skipped.push({ brand, what, why }); }

/* ------------------- nutrition from page text (Shopify) ------------------- */
function nutritionFromText(text) {
  // Needs an explicit nutrition heading with Energy/Calories and Protein values next to it.
  const i = text.search(/nutrition(al)?\s+(information|facts|value|table)/i);
  if (i < 0) return null;
  const seg = text.slice(i, i + 900);
  const kcal = seg.match(/(?:energy|calories)[^0-9]{0,20}([\d.]+)\s*kcal/i);
  const prot = seg.match(/protein[^0-9]{0,20}([\d.]+)\s*g/i);
  if (!kcal || !prot) return null;
  let basis = null, serving = null;
  if (/per\s*100\s*g/i.test(seg)) basis = "100";
  else { const s = seg.match(/serving size[^0-9]{0,15}([\d.]+)\s*g/i); if (s) { basis = "serving"; serving = Number(s[1]); } }
  if (!basis) return null;
  return { kcal: Number(kcal[1]), protein: Number(prot[1]), basis, serving };
}
function per100(n) {
  if (!n) return null;
  if (n.basis === "100") return { protein: round(n.protein, 1), kcal: round(n.kcal, 1), derived: null };
  return { protein: round((n.protein / n.serving) * 100, 1), kcal: round((n.kcal / n.serving) * 100, 1), derived: "derived from per-serving (serving " + n.serving + " g)" };
}

/* --------------------------- Shopify brands --------------------------- */
function packFromVariant(v) {
  const title = (v.title || "").trim();
  if (/combo/i.test(title)) return { skip: "combo variant (" + title + ")" };
  if (/\*\s*\d/.test(title)) return { skip: "multi-pack variant (" + title + ")" };
  const x = title.match(/\bx\s*(\d+)\b/i);
  if (x && Number(x[1]) > 1) return { skip: "multi-pack variant of the same item (" + title + ")" };
  const pk = title.match(/^pack of (\d+)$/i);
  if (pk && Number(pk[1]) > 1 && !/bar|wafer/i.test(title)) return { skip: "multi-pack variant of the same item (" + title + ")" };
  let g = null;
  const paren = title.match(/\(\s*([\d.]+)\s*(kg|gm|g)\s*\)/i);
  if (paren) g = toG(paren[1], paren[2] === "gm" ? "g" : paren[2]);
  else {
    const t = title.match(/([\d.]+)\s*(kg|gm|g)\b/i);
    if (t) g = toG(t[1], t[2] === "gm" ? "g" : t[2]);
  }
  const grams = v.grams > 0 ? v.grams : null;
  if (g != null) {
    const note = grams != null && Math.abs(grams - g) > 0.5 ? "variant title says " + g + " g, Shopify grams field says " + grams + "; used title" : null;
    return { pack_g: g, note };
  }
  if (grams != null) return { pack_g: grams, note: null };
  return { skip: "pack weight not stated on the listing" };
}

function pintolaCategory(p) {
  const t = (p.product_type || "").toLowerCase();
  if (/butter/.test(t)) return "nut-butters";
  if (/muesli|museli|oats/.test(t)) return "muesli-oats";
  return null;
}
function yogabarCategory(p) {
  const h = p.handle;
  if (/variety|combo|crunch-box|lil-treats|chocolate-edit|shake|smoothie|oat-milk|oat-drink|creatine|energy-bar|^(roasted-salted-pistachios|california-almonds|pumpkin-seeds|sunflower-seeds)/.test(h)) return { skip: "excluded (variety/combo/liquid/energy bar/plain nuts or seeds/supplement other than protein)" };
  if (/date-minis/.test(h)) return { cat: "high-protein-snacks" };
  if (/protein-bar|wafer-bars|protein-minis/.test(h)) return { cat: "protein-bars" };
  if (/whey|yeast-protein|plant-?protein|proclean/.test(h)) return { cat: "protein-powders" };
  if (/oats|muesli/.test(h)) return { cat: "muesli-oats" };
  if (/peanut-butter/.test(h)) return { cat: "nut-butters" };
  return { skip: "not a protein-relevant category" };
}

async function shopifyBrand(cfg) {
  const brand = cfg.brand;
  let list;
  try { list = JSON.parse(await get("https://" + cfg.host + "/products.json?limit=250")).products; }
  catch (e) { skip(brand, "all products", "products.json not usable: " + e.message); return; }
  for (const p of list) {
    const c = cfg.classify(p);
    const cat = c && c.cat ? c.cat : (typeof c === "string" ? c : null);
    if (!cat) { skip(brand, p.title, (c && c.skip) || "not a protein-relevant category (type: " + (p.product_type || "none") + ")"); continue; }
    const url = "https://" + cfg.host + "/products/" + p.handle;
    let nut = null, nutNote = null;
    const jsBarcode = {};   // variant id -> barcode, from /products/<handle>.js (products.json omits barcodes)
    try {
      let html, text;
      if (cfg.useJs) {
        // One request per product: the .js endpoint carries barcodes and the description text.
        const j = JSON.parse(await get(url + ".js"));
        for (const jv of j.variants || []) if (jv.barcode) jsBarcode[jv.id] = String(jv.barcode);
        html = j.description || ""; text = stripHtml(html);
      } else { html = await get(url); text = stripHtml(html); }
      const n = nutritionFromText(text);
      if (n) nut = per100(n);
      else if (/nutrition(al)?[^"]{0,60}(label|information|ingredients)|nutrition-label|nutritional-information/i.test(html)) { nutNote = "nutrition only in image"; stats.imageOnly++; }
      else { nutNote = "nutrition not in page text (no machine-readable table; not read from images)"; stats.imageOnly++; }
    } catch (e) { nutNote = "product page not fetched: " + e.message; }
    for (const v of p.variants) {
      let pk = packFromVariant(v);
      const vt = (v.title || "").trim();
      // Fallback: weight written in the product title (e.g. "... 500g") when the variant gives none.
      const tw = p.title.match(/(?:^|[\s(])([\d.]+)\s*(kg|gm|g)\b(?!\s*protein)/i);
      if (pk.skip && /weight not stated/.test(pk.skip) && tw) pk = { pack_g: toG(tw[1], tw[2].toLowerCase() === "gm" ? "g" : tw[2]), note: "pack weight taken from product title" };
      else if (!pk.skip && tw && (/^default title$/i.test(vt) || p.variants.length === 1 || /pack of 1$/i.test(vt)) && Math.abs(toG(tw[1], tw[2].toLowerCase() === "gm" ? "g" : tw[2]) - pk.pack_g) > 0.5) {
        warnings.push("weight mismatch, needs manual check: " + p.title + " title says " + tw[1] + tw[2] + ", pack_g " + pk.pack_g + " (" + "https://" + cfg.host + "/products/" + p.handle + ")");
      }
      const label = vt && !/^default title$/i.test(vt) ? p.title + " - " + vt : p.title;
      if (pk.skip) { skip(brand, label, pk.skip); continue; }
      const price = num(v.price), cmp = num(v.compare_at_price);
      const notes = [];
      if (pk.note) notes.push(pk.note);
      if (nut) { if (nut.derived) { notes.push(nut.derived); stats.perServing++; } }
      else if (nutNote) notes.push(nutNote);
      rows.push({
        name: label, brand, category: cat, pack_g: pk.pack_g,
        mrp_inr: cmp && cmp > 0 ? cmp : null, price_inr: price,
        protein_100g: nut ? nut.protein : null, energy_kcal_100g: nut ? nut.kcal : null,
        barcode: v.barcode ? String(v.barcode) : (jsBarcode[v.id] || null),
        source_url: url, checked: CHECKED, note: notes.length ? notes.join("; ") : null,
      });
      if (!(cmp > 0)) rows[rows.length - 1]._noMrp = true;
    }
  }
}

/* ----------------------------- The Whole Truth ----------------------------- */
// Handles taken from https://thewholetruthfoods.com/sitemap.xml and /llmFeed.json (public).
// Combo, personalised, party, assorted, merch and kids pages are not listed here on purpose.
const TWT = [
  ["protein-powders", ["light-cocoa-24g-whey-protein-isolate-concentrate", "cold-coffee-24g-whey-protein-isolate-concentrate", "unflavored-26g-whey-protein-isolate-concentrate", "unflavoured-30-g-pure-whey-protein-isolate", "cold-coffee-15g-protein-powder", "ragi-cocoa-15g-protein-powder", "mango-milkshake-24g-protein-powder", "pista-badaam-24g-protein-powder", "strawberry-milkshake-24g-protein-powder", "double-cocoa-25g-plant-protein", "pista-badaam-24g-plant-protein", "unflavoured-30g-plant-protein"]],
  ["nut-butters", ["crunchy-dark-chocolate-peanut-butter-925-single", "crunchy-peanut-butter-with-dates-925-single", "creamy-chocolate-peanut-butter", "creamy-unsweetened-peanut-butter-6", "creamy-unsweetened-peanut-butter-7", "hazelnut-almond-butter"]],
  ["muesli-oats", ["choco-fruit-crunch-muesli-350g-3", "no-added-sugar-5-grain-muesli-350g-2", "nuts-fruits-seeds-muesli-350g-2"]],
  ["protein-bars", ["high-protein-double-cocoa-box-of-5", "high-protein-peanut-cocoa-box-of-5", "high-protein-coffee-cocoa-box-of-5", "hazelnut-cocoa-pro-box-of-5", "double-cocoa", "coffee-cocoa", "peanut-cocoa", "coconut-cocoa", "lemon-cranberry-box-of-6", "cranberry-raisin-protein-bars-box-of-8", "walnut-fudge-protein-bars", "almond-millet-cocoa-protein-bars", "hazelnut-millet-protein-bars", "mocha-millet-protein-bars-box-of-8", "subko-tiramisu-protein-bars-box-of-5"]],
];
const TWT_SKIPPED_BY_DESIGN = [
  ["Personalised Box packs (all sizes), All in One boxes, Everyone Party packs, Assorted dark cocoa packs, Sampler packs", "variety or combo packs whose nutrition differs by item"],
  ["Kids protein blocks and snackbars, Food Drink milk-mixes, dark cocoa bars, Badaaaam bars, fudge bars, Diwali boxes, frother, tin, tote, T-shirt", "not protein-product categories in this seed, or merch"],
  ["Super Saver 1.5 kg muesli packs and 750 g muesli variants", "not fetched (request cap); the 350 g pages are included"],
  ["Remaining single-bar and multi-box duplicates (e.g. Box of 10 variants of pages already listed)", "variants are covered on the page's own variant list where the page offers them"],
];

function unesc(h) { return h.replace(/\\"/g, '"').replace(/\\\\/g, "\\"); }
function twtParse(html, handle) {
  const h = unesc(html);
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch (e) { return null; } }).find((j) => j && j["@type"] === "Product");
  const start = h.indexOf('"medusaProduct":{"id"');
  if (start < 0 || !ld) return null;
  const region = h.slice(start, start + 140000);
  const re = /\{"id":"([^"]+)","title":"([^"]*)","sku":"([^"]+)","barcode":([^,]*),"ean":([^,]*),/g;
  const starts = []; let m;
  while ((m = re.exec(region))) starts.push({ i: m.index, id: m[1], title: m[2], sku: m[3], barcode: m[4], ean: m[5] });
  // keep only variants whose sku is one of this product's JSON-LD offers
  const offerSkus = new Set((Array.isArray(ld.offers) ? ld.offers : [ld.offers]).map((o) => o.sku));
  const variants = [];
  for (let k = 0; k < starts.length; k++) {
    if (!offerSkus.has(starts[k].sku)) continue;
    const chunk = region.slice(starts[k].i, k + 1 < starts.length ? starts[k + 1].i : starts[k].i + 20000);
    const w = chunk.match(/"product_weight_info":"([^"]*)"/);
    const price = chunk.match(/"calculated_amount":([\d.]+)/);
    const cmp = chunk.match(/"compare_at_price":([\d.]+|null)/);
    const gtin = chunk.match(/"gtin":("([^"]*)"|null)/);
    const cleanBarcode = (x) => (x && x !== "null" ? x.replace(/"/g, "") : null);
    variants.push({
      sku: starts[k].sku, title: starts[k].title.trim(), weightInfo: w ? w[1] : null,
      price: price ? Number(price[1]) : null, compare: cmp && cmp[1] !== "null" ? Number(cmp[1]) : null,
      barcode: cleanBarcode(starts[k].barcode) || cleanBarcode(starts[k].ean) || (gtin ? cleanBarcode(gtin[2] ? '"' + gtin[2] + '"' : null) : null),
    });
  }
  // nutrition table: first block on the page belongs to the main product
  const q = h.indexOf('"nutritional_fact_details"');
  let nutrition = null;
  if (q >= 0) {
    const blk = h.slice(q, q + 4000);
    const e = blk.match(/"key":"\s*(?:energy|calories)\s*","value":"\s*([\d.]+)\s*kcal\s*"/i);
    const p = blk.match(/"key":"\s*protein\s*","value":"\s*([\d.]+)\s*g\s*"/i);
    const d = blk.match(/"description":"([^"]*)"/);
    nutrition = { kcal: e ? Number(e[1]) : null, protein: p ? Number(p[1]) : null, desc: d ? d[1].replace(/\\n/g, " ").trim() : "" };
  }
  return { ld, variants, nutrition };
}
function twtWeight(info) {
  const m = (info || "").match(/^\s*(?:(\d+)\s*x\s*)?([\d.]+)\s*(kg|g)\s*$/i);
  return m ? (m[1] ? Number(m[1]) : 1) * toG(m[2], m[3]) : null;
}

async function twtBrand() {
  const brand = "The Whole Truth";
  for (const [cat, handles] of TWT) {
    for (const handle of handles) {
      const url = "https://thewholetruthfoods.com/products/" + handle;
      let parsed;
      try { parsed = twtParse(await get(url), handle); } catch (e) { skip(brand, handle, "page not fetched: " + e.message); continue; }
      if (!parsed || !parsed.variants.length) { skip(brand, handle, "page data could not be parsed"); continue; }
      let n = null, nutNote = null;
      const nt = parsed.nutrition;
      if (nt && nt.kcal != null && nt.protein != null) {
        const per = /per\s*100\s*g/i.test(nt.desc);
        const sv = nt.desc.match(/\(\s*([\d.]+)\s*g\s*\)/) || nt.desc.match(/serving size[^0-9]{0,20}([\d.]+)\s*g/i);
        if (per) n = per100({ kcal: nt.kcal, protein: nt.protein, basis: "100" });
        else if (sv) n = per100({ kcal: nt.kcal, protein: nt.protein, basis: "serving", serving: Number(sv[1]) });
        else nutNote = "nutrition table has no serving size or per-100 g basis on page";
      } else nutNote = "nutrition table not on page";
      for (const v of parsed.variants) {
        const label = parsed.ld.name + (v.title && !/^default option/i.test(v.title) ? " - " + v.title : "");
        const g = twtWeight(v.weightInfo);
        if (g == null) { skip(brand, label, "net weight not stated as N x W (" + v.weightInfo + ")"); continue; }
        const notes = [];
        if (n) { if (n.derived) { notes.push(n.derived); stats.perServing++; } } else if (nutNote) notes.push(nutNote);
        rows.push({
          name: label, brand, category: cat, pack_g: g,
          mrp_inr: v.compare && v.compare > 0 ? v.compare : null, price_inr: v.price,
          protein_100g: n ? n.protein : null, energy_kcal_100g: n ? n.kcal : null,
          barcode: v.barcode, source_url: url, checked: CHECKED, note: notes.length ? notes.join("; ") : null,
        });
        if (!(v.compare > 0)) rows[rows.length - 1]._noMrp = true;
      }
    }
  }
}

/* ------------------------------ run + gate ------------------------------ */
function applyOverrides() {
  for (const r of rows) {
    const o = OVERRIDES[r.source_url + "|" + r.name];
    if (!o) continue;
    for (const k of Object.keys(o)) if (k !== "why") r[k] = o[k];
    r.note = [r.note, "hand-checked: " + o.why].filter(Boolean).join("; ");
  }
}

function gate(r) {
  const bad = [];
  if (!(r.pack_g > 0)) bad.push("pack_g");
  if (r.price_inr != null && !(r.price_inr > 0)) bad.push("price");
  if (r.mrp_inr != null && !(r.mrp_inr > 0)) bad.push("mrp");
  if (r.mrp_inr != null && r.price_inr != null && r.mrp_inr < r.price_inr) bad.push("mrp<price");
  if (r.protein_100g != null && !(r.protein_100g >= 0 && r.protein_100g <= 100)) bad.push("protein range");
  if (r.energy_kcal_100g != null && !(r.energy_kcal_100g >= 0 && r.energy_kcal_100g <= 900)) bad.push("kcal range");
  if (r.protein_100g != null && r.energy_kcal_100g != null && r.protein_100g * 4 > r.energy_kcal_100g * 1.05 + 2) bad.push("protein*4 > kcal");
  if ((r.protein_100g == null) !== (r.energy_kcal_100g == null)) bad.push("only one of protein/kcal present");
  return bad;
}

async function main() {
  const brands = [
    () => shopifyBrand({ host: "pintola.in", brand: "Pintola", classify: pintolaCategory, useJs: true }),
    () => shopifyBrand({ host: "www.yogabars.in", brand: "Yogabar", classify: yogabarCategory }),
    () => twtBrand(),
  ];
  // MuscleBlaze: attempt robots.txt only; a bot challenge means we do not scrape.
  try { await initHost("www.muscleblaze.com"); } catch (e) { /* recorded below */ }
  const mb = hostState["www.muscleblaze.com"];
  if (mb && mb.blocked) skip("MuscleBlaze", "entire site", "not scraped: " + mb.blockedWhy + "; robots.txt could not be read, so permission cannot be confirmed");
  for (const b of brands) { try { await b(); } catch (e) { warnings.push("brand run failed: " + e.message); } }

  applyOverrides();
  const kept = [];
  for (const r of rows) {
    const bad = gate(r);
    if (bad.length) { skip(r.brand, r.name, "failed quality gate: " + bad.join(", ")); continue; }
    delete r._noMrp;
    kept.push(r);
  }
  const order = ["protein-bars", "protein-powders", "nut-butters", "muesli-oats", "high-protein-snacks"];
  kept.sort((a, b) => a.brand.localeCompare(b.brand) || order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name));
  const keys = ["name", "brand", "category", "pack_g", "mrp_inr", "price_inr", "protein_100g", "energy_kcal_100g", "barcode", "source_url", "checked", "note"];
  const out = kept.map((r) => { const o = {}; keys.forEach((k) => (o[k] = r[k] === undefined ? null : r[k])); return o; });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  console.log("rows written:", out.length);
  console.log("per-serving conversions:", stats.perServing, "| image-only/no-text nutrition rows (before variants):", stats.imageOnly, "pages");
  for (const h of Object.keys(hostState)) console.log("requests", h, hostState[h].count);
  console.log("skipped:", skipped.length);
  if (process.env.SEED_VERBOSE) {
    console.log("SKIPPED " + JSON.stringify(skipped));
    console.log("WARNINGS " + JSON.stringify(warnings));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

module.exports = { parseRobots, packFromVariant, nutritionFromText, per100, twtParse, twtWeight, gate, OVERRIDES, TWT_SKIPPED_BY_DESIGN, skipped, warnings };
