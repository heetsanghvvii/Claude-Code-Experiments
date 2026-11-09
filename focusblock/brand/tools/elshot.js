// node elshot.js page.html scale out1.png#sel1 out2.png#sel2 ...
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [,, file, scale, ...jobs] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1900, height: 1000 }, deviceScaleFactor: +scale });
  await p.goto('file://' + path.resolve(file));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300); await p.evaluate(() => { document.body.style.background = 'transparent'; });
  for (const j of jobs) { const [out, sel] = j.split('#'); await p.locator('#' + sel).screenshot({ path: out, omitBackground: true }); console.log('wrote', out); }
  await b.close();
})();
