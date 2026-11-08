import * as store from './storage';

export const MAX_ATTEMPTS = 5;
export const COOLDOWN_MS = 10 * 60 * 1000;
export const HINT_AFTER_MS = 24 * 60 * 60 * 1000;
const CODE_LEN = 10;
// No 0/O, 1/I/L, 5/S, 8/B, 2/Z to avoid mix-ups.
const ALPHABET = 'ACDEFGHJKMNPQRTUVWXY3469';

// ---- small pure JS SHA-256 (no dependencies) ----
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(input: string): string {
  const bytes: number[] = [];
  const utf = unescape(encodeURIComponent(input));
  for (let i = 0; i < utf.length; i++) bytes.push(utf.charCodeAt(i));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  for (const v of [hi, lo]) for (let s = 24; s >= 0; s -= 8) bytes.push((v >>> s) & 0xff);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Array<number>(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) | 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

function randomInts(n: number): number[] {
  const out: number[] = [];
  const cr = (globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } }).crypto;
  if (cr?.getRandomValues) {
    return Array.from(cr.getRandomValues(new Uint32Array(n)));
  }
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 0x100000000));
  return out;
}

export function generateCode(): string {
  return randomInts(CODE_LEN).map((x) => ALPHABET[x % ALPHABET.length]).join('');
}

/** Show as XXXXX-XXXXX. */
export const formatCode = (code: string) => `${code.slice(0, 5)}-${code.slice(5)}`;

/** Uppercase and drop spaces/dashes so typing is forgiving. */
export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

const hashCode = (salt: string, code: string) => sha256(`${salt}:${code}`);

/** Creates a new backup code, stores only its salted hash, returns the plain code once. */
export async function createBackupCode(): Promise<string> {
  const code = generateCode();
  const salt = randomInts(4).map((x) => x.toString(16)).join('');
  await store.setBackup({ salt, hash: hashCode(salt, code), confirmed: false });
  return code;
}

export async function confirmBackupSaved() {
  const b = await store.getBackup();
  if (b) await store.setBackup({ ...b, confirmed: true });
}

export async function hasBackup() {
  return (await store.getBackup()) !== null;
}

export type CooldownInfo = { locked: boolean; msLeft: number; attemptsLeft: number };

export async function getCooldown(now: number = Date.now()): Promise<CooldownInfo> {
  let st = await store.getRescueState();
  if (st.until && now >= st.until) {
    st = { fails: 0, until: 0 };
    await store.setRescueState(st);
  }
  const locked = st.until > now;
  return { locked, msLeft: locked ? st.until - now : 0, attemptsLeft: Math.max(0, MAX_ATTEMPTS - st.fails) };
}

export type CheckResult = 'ok' | 'wrong' | 'cooldown' | 'nobackup';

export async function checkBackupCode(input: string): Promise<CheckResult> {
  const cd = await getCooldown();
  if (cd.locked) return 'cooldown';
  const b = await store.getBackup();
  if (!b) return 'nobackup';
  if (hashCode(b.salt, normalizeCode(input)) === b.hash) {
    await store.setRescueState({ fails: 0, until: 0 });
    return 'ok';
  }
  const fails = (await store.getRescueState()).fails + 1;
  if (fails >= MAX_ATTEMPTS) await store.setRescueState({ fails, until: Date.now() + COOLDOWN_MS });
  else await store.setRescueState({ fails, until: 0 });
  return fails >= MAX_ATTEMPTS ? 'cooldown' : 'wrong';
}

/** True when the lock has been on for 24h or more, so a stuck user gets a gentle nudge. */
export function shouldShowHint(on: boolean, lockSince: number | null, now: number = Date.now()) {
  return on && lockSince !== null && now - lockSince >= HINT_AFTER_MS;
}
