// node siteshot.js width out.png [full] [query] [scale]
const { chromium } = require('playwright');
(async () => {
  const [,, w, out, full, q, scale] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +w < 800 ? 800 : 860 }, deviceScaleFactor: +(scale || 1), isMobile: +w < 800, hasTouch: +w < 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/Claude-Code-Experiments/focusblock/landing/index.html' + (q || ''));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1300);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await p.screenshot({ path: out, fullPage: full === '1' });
  console.log('overflowX', ov, 'height', await p.evaluate(() => document.body.scrollHeight), errs.join(' | '));
  await b.close();
})();
