import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, mode, ...rest]=process.argv;
const b=await chromium.launch({executablePath:undefined});
const pg=await b.newPage({viewport:{width:1920,height:1080}});
await pg.goto('file:///home/user/Claude-Code-Experiments/launch/brag-output/work/video.html');
await pg.evaluate(()=>document.fonts.ready);
await pg.waitForTimeout(500);
if(mode==='stills'){
  fs.mkdirSync('stills',{recursive:true});
  for(const t of rest.map(Number)){await pg.evaluate(t=>{render(t)},t);await pg.evaluate(()=>document.fonts.ready);await pg.screenshot({path:`stills/t${t.toFixed(2)}.png`});}
} else {
  const dur=21,fps=30,N=dur*fps;fs.mkdirSync('frames',{recursive:true});
  for(let i=0;i<N;i++){await pg.evaluate(t=>{render(t)},i/fps);await pg.screenshot({path:`frames/f${String(i).padStart(4,'0')}.png`});}
}
await b.close();
