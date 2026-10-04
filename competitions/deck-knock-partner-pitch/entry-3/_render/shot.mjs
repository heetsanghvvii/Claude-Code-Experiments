import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('file:///home/user/Claude-Code-Experiments/competitions/deck-knock-partner-pitch/entry-3/brand/brand-guidelines.html'); await p.waitForTimeout(800);
await p.screenshot({ path: '/home/user/Claude-Code-Experiments/competitions/deck-knock-partner-pitch/entry-3/_render/guide.png', fullPage: true }); await b.close();
