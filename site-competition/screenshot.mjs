// Usage: node screenshot.mjs  -> screenshots every entry-*/index.html at desktop and mobile widths.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.argv[2] || '.');
const out = resolve(root, 'screenshots');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const report = [];
for (const dir of readdirSync(root).filter(d => d.startsWith('entry-')).sort()) {
  const file = resolve(root, dir, 'index.html');
  if (!existsSync(file)) { report.push({ entry: dir, error: 'missing index.html' }); continue; }
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + file, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errors.push(String(e)));
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    await page.screenshot({ path: `${out}/${dir}-${name}-fold.png` });
    await page.screenshot({ path: `${out}/${dir}-${name}-full.png`, fullPage: true });
    report.push({ entry: dir, view: name, horizontal_overflow: overflow, errors });
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
