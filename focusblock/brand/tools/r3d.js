// node r3d.js out.png "query"
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const jobs = process.argv.slice(2);
  for (let i = 0; i < jobs.length; i += 2) {
    const out = jobs[i], qs = jobs[i+1];
    const q = new URLSearchParams(qs);
    const p = await b.newPage({ viewport: { width: +q.get('w')||1600, height: +q.get('h')||1200 } });
    p.on('console', m => console.log('console:', m.text()));
    p.on('pageerror', e => console.log('err:', e.message));
    await p.goto('http://localhost:8765/render.html?' + qs);
    await p.waitForFunction(() => window.__done, null, { timeout: 120000 });
    await p.screenshot({ path: out, omitBackground: true });
    await p.close();
    console.log('wrote', out);
  }
  await b.close();
})();
