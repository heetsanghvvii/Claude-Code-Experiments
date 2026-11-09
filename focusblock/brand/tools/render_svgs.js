// node render_svgs.js out.png in.svg size [transparent]
const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2]));
  const b = await chromium.launch();
  for (const j of jobs) {
    const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(j.in, 'utf8');
    await p.setContent(`<html><body style="margin:0;background:${j.bg||'transparent'}"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="display:block;width:${j.w}px;height:${j.h}px"></body></html>`);
    await p.waitForTimeout(50);
    await p.screenshot({ path: j.out, omitBackground: !j.bg });
    await p.close();
  }
  await b.close();
})();
