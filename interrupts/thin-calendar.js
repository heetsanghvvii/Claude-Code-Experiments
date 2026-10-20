#!/usr/bin/env node
// Checks whether the next 7 days are thin versus the weekly minimums in the playbook.
// Reads: queue/schedule.json, queue/approved/*.md, brand-brain/channel-playbooks.md
// Prints JSON: { thin: boolean, gaps: [...], warnings: [...], ... }
// Options: --days=7  --now=2026-01-01T00:00:00Z (for testing)  --root=<repo root>
// Missing or malformed files are handled: they become warnings, never crashes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, v = 'true'] = a.slice(2).split('='); return [k, v]; }));
const root = path.resolve(args.root || path.join(here, '..'));
const days = Number(args.days || 7);
const now = args.now ? new Date(args.now) : new Date();
const end = new Date(now.getTime() + days * 86400000);
const warnings = [];
const CHANNELS = ['instagram', 'youtube', 'linkedin'];

function readText(rel) {
  try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return null; }
}

// 1. Minimums from the playbook section "Weekly calendar minimum"
const minimums = {};
const playbook = readText('brand-brain/channel-playbooks.md');
if (playbook === null) warnings.push('brand-brain/channel-playbooks.md not found; minimums unknown.');
else {
  const m = playbook.match(/##\s*Weekly calendar minimum[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!m) warnings.push('No "Weekly calendar minimum" section in channel-playbooks.md.');
  else {
    for (const line of m[1].split('\n')) {
      const mm = line.match(/^\s*[-*]\s*([A-Za-z]+)\s*:\s*(.+)$/);
      if (!mm) continue;
      const ch = mm[1].toLowerCase();
      if (!CHANNELS.includes(ch)) continue;
      const num = mm[2].match(/^\s*(\d+)/);
      if (num) minimums[ch] = Number(num[1]);
      else warnings.push(`Minimum for ${ch} is not filled in yet ("${mm[2].trim()}").`);
    }
  }
}

// 2. Scheduled entries in the window
let schedule = [];
const schedRaw = readText('queue/schedule.json');
if (schedRaw === null) warnings.push('queue/schedule.json not found; treating as empty.');
else {
  try {
    const parsed = JSON.parse(schedRaw);
    schedule = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.entries) ? parsed.entries : []);
  } catch { warnings.push('queue/schedule.json is not valid JSON; treating as empty.'); }
}
const scheduledIds = new Set(schedule.map((e) => e.id));
const scheduled = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
for (const e of schedule) {
  const t = new Date(e.publish_at);
  if (Number.isNaN(t.getTime()) || t < now || t > end) continue;
  if (e.status === 'failed') continue;
  if (e.channel in scheduled) scheduled[e.channel]++;
}

// 3. Approved files not yet scheduled
const approvedUnscheduled = Object.fromEntries(CHANNELS.map((c) => [c, 0]));
try {
  for (const f of fs.readdirSync(path.join(root, 'queue/approved'))) {
    if (!f.endsWith('.md')) continue;
    const text = fs.readFileSync(path.join(root, 'queue/approved', f), 'utf8');
    const id = (text.match(/^id:\s*(.+)$/m) || [])[1]?.trim() || f.replace(/\.md$/, '');
    const ch = (text.match(/^channel:\s*(\w+)/m) || [])[1]?.toLowerCase();
    if (scheduledIds.has(id) || !(ch in approvedUnscheduled)) continue;
    approvedUnscheduled[ch]++;
  }
} catch { warnings.push('queue/approved not readable; treating as empty.'); }

// 4. Gaps
const gaps = [];
for (const ch of CHANNELS) {
  if (!(ch in minimums)) continue;
  const missing = Math.max(0, minimums[ch] - scheduled[ch] - approvedUnscheduled[ch]);
  if (missing > 0) {
    gaps.push({ channel: ch, required: minimums[ch], scheduled: scheduled[ch], approved_unscheduled: approvedUnscheduled[ch], missing });
  }
}

console.log(JSON.stringify({
  thin: gaps.length > 0,
  window: { from: now.toISOString(), to: end.toISOString(), days },
  gaps,
  scheduled,
  approved_unscheduled: approvedUnscheduled,
  minimums,
  warnings,
}, null, 2));
