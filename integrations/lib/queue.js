// Read a queue markdown file (front matter + sections) and parse CLI args.
import fs from 'node:fs';

export function parseQueueFile(file) {
  if (!file) throw new Error('Missing queue file path argument.');
  if (!fs.existsSync(file)) throw new Error(`Queue file not found: ${file}`);
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i < 1) continue;
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const sections = {};
  let cur = null;
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^#\s+(.+?)\s*$/);
    if (h) { cur = h[1].toUpperCase(); sections[cur] = []; } else if (cur) sections[cur].push(line);
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].join('\n').trim();
  return {
    meta,
    sections,
    hook: sections['HOOK'] || '',
    body: sections['BODY / CAPTION'] || sections['BODY'] || sections['CAPTION'] || '',
    hashtags: sections['HASHTAGS'] || '',
    cta: sections['CTA'] || '',
  };
}

// Caption = body + hashtags (the hook is expected to be the first line of the body already).
export function buildCaption(q) {
  return [q.body, q.hashtags].filter(Boolean).join('\n\n').trim();
}

export function parseArgs(argv = process.argv.slice(2)) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      flags[k] = v === undefined ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true) : v;
    } else positional.push(a);
  }
  return { positional, flags };
}

// Fail a publish early if the file is not approved content for this channel.
export function assertChannel(q, channel) {
  if (q.meta.channel && q.meta.channel !== channel) {
    throw new Error(`Queue file channel is "${q.meta.channel}" but this script publishes "${channel}".`);
  }
}
