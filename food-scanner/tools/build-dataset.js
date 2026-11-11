#!/usr/bin/env node
// Builds data/protein-india.json from Open Food Facts (ODbL). Dependency-free, Node 18+.
// Run: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node tools/build-dataset.js
// Options: --probe  (print live count per candidate tag, write nothing)
// Rate limit: one search call every 7 s (OFF allows 10 per minute).
'use strict';
const fs = require('fs');
const path = require('path');

const UA = 'FoodLabelChecker-prototype/0.1';
const BASE = 'https://world.openfoodfacts.org/api/v2/search';
const FIELDS = 'code,product_name,brands,quantity,product_quantity,categories_tags,nutriments';
const SLEEP_MS = 7000;
const MAX_PAGES_PER_TAG = 5;
const PAGE_SIZE = 100;
const RETRIES = 4;

// Key order matters: a product is kept in the first matching key only.
const CATEGORIES = [
  { key: 'protein-bars', label: 'Protein bars', tags: ['en:protein-bars', 'en:energy-bars'] },
  { key: 'protein-powders', label: 'Protein powders', tags: ['en:protein-powders', 'en:whey-protein', 'en:bodybuilding-supplements'] },
  { key: 'nut-butters', label: 'Nut butters', tags: ['en:peanut-butters', 'en:nut-butters', 'en:almond-butters'] },
  { key: 'muesli-oats', label: 'Muesli and oats', tags: ['en:mueslis', 'en:oat-flakes', 'en:rolled-oats', 'en:oats'] },
  { key: 'high-protein-snacks', label: 'High-protein snacks', tags: ['en:roasted-chickpeas', 'en:fox-nuts', 'en:protein-chips', 'en:high-protein-snacks'] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;
const failures = [];

async function search(params, label) {
  const url = BASE + '?' + new URLSearchParams({ countries_tags_en: 'india', ...params }).toString();
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const wait = lastCall + SLEEP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (res.ok) return await res.json();
      console.error(`[${label}] HTTP ${res.status} (attempt ${attempt}/${RETRIES})`);
    } catch (e) {
      console.error(`[${label}] ${e.message} (attempt ${attempt}/${RETRIES})`);
    }
    await sleep(10000 * attempt);
  }
  failures.push(label);
  return null;
}

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const r1 = (n) => (n === null ? null : Math.round(n * 10) / 10);

function mapProduct(p) {
  const n = p.nutriments || {};
  let kcal = num(n['energy-kcal_100g']);
  if (kcal === null) {
    const kj = num(n['energy-kj_100g']);
    if (kj !== null) kcal = kj / 4.184;
  }
  const pq = num(p.product_quantity);
  return {
    code: String(p.code || ''),
    name: String(p.product_name || '').trim(),
    brand: String(p.brands || '').split(',')[0].trim(),
    quantity: String(p.quantity || '').trim(),
    product_quantity_g: pq,
    energy_kcal_100g: r1(kcal),
    proteins_100g: num(n.proteins_100g),
    sugars_100g: num(n.sugars_100g),
    fat_100g: num(n.fat_100g),
    saturated_fat_100g: num(n['saturated-fat_100g']),
    salt_100g: num(n.salt_100g),
    fiber_100g: num(n.fiber_100g),
  };
}

async function main() {
  const probe = process.argv.includes('--probe');
  const seen = new Set();
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    source: 'Open Food Facts contributors, ODbL',
    source_url: 'https://world.openfoodfacts.org',
    categories: {},
  };
  const stats = { droppedNoName: 0, droppedImplausible: 0, droppedDuplicate: 0, perTag: {} };

  for (const cat of CATEGORIES) {
    const products = [];
    for (const tag of cat.tags) {
      if (probe) {
        const j = await search({ categories_tags: tag, page_size: 1, fields: 'code' }, `probe ${tag}`);
        console.log(tag, j ? j.count : 'FAILED');
        continue;
      }
      let fetched = 0;
      for (let page = 1; page <= MAX_PAGES_PER_TAG; page++) {
        const j = await search({ categories_tags: tag, fields: FIELDS, page_size: PAGE_SIZE, page }, `${tag} p${page}`);
        if (!j) break;
        const list = j.products || [];
        stats.perTag[tag] = { count: j.count, fetched: (fetched += list.length) };
        for (const raw of list) {
          const code = String(raw.code || '');
          if (!code || seen.has(code)) { if (code) stats.droppedDuplicate++; continue; }
          const p = mapProduct(raw);
          if (!p.name) { stats.droppedNoName++; continue; }
          if ((p.proteins_100g !== null && p.proteins_100g > 100) || (p.energy_kcal_100g !== null && p.energy_kcal_100g > 900)) {
            stats.droppedImplausible++; continue;
          }
          seen.add(code);
          products.push(p);
        }
        if (fetched >= (j.count || 0) || list.length < PAGE_SIZE) break;
      }
    }
    out.categories[cat.key] = { label: cat.label, tags: cat.tags, products };
  }
  if (probe) return;

  const file = path.join(__dirname, '..', 'data', 'protein-india.json');
  const text = JSON.stringify(out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log('wrote', file, (text.length / 1024).toFixed(1) + ' KB');
  for (const [k, v] of Object.entries(out.categories)) console.log(k, v.products.length);
  console.log('stats', JSON.stringify(stats));
  if (failures.length) console.log('FAILED requests (gave up after retries):', failures.join('; '));
  if (text.length > 400 * 1024) console.log('WARNING: file larger than 400 KB');
}

main().catch((e) => { console.error(e); process.exit(1); });
