import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1920,height:1080}});
await pg.goto('file:///home/user/Claude-Code-Experiments/launch/brag-output/work/video.html');
await pg.evaluate(()=>render(4.4));
console.log(await pg.evaluate(()=>[getComputedStyle(document.getElementById('ledgerblk')).display,document.getElementById('ledgerblk').style.opacity, document.getElementById('hero').style.opacity]));
await b.close();
