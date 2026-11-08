// Renders every view of scene.html to PNG with headless Chromium (three.js, WebGL via SwiftShader).
// Usage (from anywhere):  node product/renders/tools/render.mjs [view ...]
// Needs: playwright (npm), network access to unpkg.com for three.js.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '', 'playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');           // product/
const outDir = path.resolve(here, '..');               // product/renders/
const types = { '.html': 'text/html', '.stl': 'model/stl', '.json': 'application/json', '.mjs': 'text/javascript' };

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const all = {
  threequarter: 'nope_threequarter.png',
  top: 'nope_top.png',
  bottom: 'nope_bottom.png',
  exploded: 'nope_exploded.png',
  section: 'nope_section.png',
  nest: 'nope_nest_wall.png',
  photo: 'nope_photo_match.png',
};
const views = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(all);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const v of views) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  page.on('console', m => { if (m.type() === 'error') console.log(v, 'console:', m.text()); });
  const url = `http://localhost:${port}/renders/tools/scene.html?view=${v}`;
  await page.goto(url);
  await page.waitForFunction(() => window.__done || window.__err, null, { timeout: 180000 });
  const err = await page.evaluate(() => window.__err);
  if (err) { console.log(v, 'ERROR', err); await page.close(); continue; }
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.writeFileSync(path.join(outDir, all[v]), Buffer.from(data.split(',')[1], 'base64'));
  console.log('wrote', all[v]);
  await page.close();
}
await browser.close();
server.close();
