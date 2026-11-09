const { chromium } = require('playwright'); const fs = require('fs');
const V = '/home/user/Claude-Code-Experiments/focusblock/marketing/assets/visual/';
const PRINT = /A6|A7|A4|sticker/;
(async () => {
  const list = JSON.parse(fs.readFileSync('assets.json')); const only = process.argv[2];
  const b = await chromium.launch();
  for (const a of list) {
    if (only && !a.name.includes(only)) continue;
    const scale = PRINT.test(a.name) ? 2 : 1;
    const p = await b.newPage({ viewport: { width: a.w, height: a.h }, deviceScaleFactor: scale });
    await p.goto('file://' + V + 'src/' + a.name + '.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const dir = PRINT.test(a.name) ? 'print/' : /^(S|C|R|ST|P1|REEL)/.test(a.name) ? 'ads/' : 'web/';
    fs.mkdirSync(V + dir, { recursive: true });
    await p.screenshot({ path: V + dir + a.name + '.png', omitBackground: a.name.includes('sticker') });
    await p.close();
  }
  await b.close();
})();
