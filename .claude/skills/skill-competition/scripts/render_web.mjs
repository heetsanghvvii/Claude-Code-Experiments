// Usage: node screenshot.mjs  -> screenshots every entry-*/index.html at desktop and mobile widths.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const root = resolve(process.argv[2] || '.');
const out = resolve(root, 'screenshots');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
// Chromium here does not trust the egress proxy's CA, so Google Fonts would fall back to system fonts.
// Fetch them with curl (which uses the configured CA bundle, verification on) and hand them to the page.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
async function routeFonts(page) {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, async route => {
    const url = route.request().url();
    try {
      const body = execFileSync('curl', ['-sSL', '--max-time', '20', '-A', UA, url], { maxBuffer: 20 * 1024 * 1024 });
      const type = url.includes('googleapis') ? 'text/css' : 'font/woff2';
      await route.fulfill({ status: 200, body, headers: { 'content-type': type, 'access-control-allow-origin': '*' } });
    } catch { await route.abort(); }
  });
}
const report = [];
for (const dir of readdirSync(root).filter(d => d.startsWith('entry-')).sort()) {
  const file = resolve(root, dir, 'index.html');
  if (!existsSync(file)) { report.push({ entry: dir, error: 'missing index.html' }); continue; }
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await routeFonts(page);
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
