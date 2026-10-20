// Environment loading. Tokens live in env only. No dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.resolve(here, '..', '.env');

let loaded = false;
export function loadEnv() {
  if (loaded) return;
  loaded = true;
  if (!fs.existsSync(envFile)) return;
  for (const raw of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Real environment wins over the file.
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnv();

// Live only when LIVE=1 and DRY_RUN was not explicitly set to true.
export function isLive() {
  const dry = String(process.env.DRY_RUN ?? 'true').toLowerCase();
  return process.env.LIVE === '1' && dry !== 'true' && dry !== '1' ? true : process.env.LIVE === '1' && process.env.DRY_RUN === undefined;
}

export function isDryRun() {
  return !isLive();
}

export function env(name, fallback) {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

// Require variables. In dry run, missing ones become placeholders so the
// request can still be printed. In live mode a missing one is a hard error.
export function requireEnv(names) {
  const out = {};
  const missing = [];
  for (const n of names) {
    const v = process.env[n];
    if (v === undefined || v === '') {
      missing.push(n);
      out[n] = `<${n}>`;
    } else out[n] = v;
  }
  if (missing.length && isLive()) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}. See integrations/.env.example.`);
  }
  return { values: out, missing };
}
