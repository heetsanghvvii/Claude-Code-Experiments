import AsyncStorage from '@react-native-async-storage/async-storage';

const K = {
  token: 'brick.token',
  apps: 'brick.apps',
  onboarded: 'brick.onboarded',
  sessions: 'brick.sessions',
  emergency: 'brick.emergency',
};

export const MAX_EMERGENCY_PER_DAY = 2;
const MAX_SESSIONS = 500;

async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const getToken = () => AsyncStorage.getItem(K.token);
export const setToken = (t: string) => AsyncStorage.setItem(K.token, t);

export const getBlockedApps = () => getJson<string[]>(K.apps, []);
export const setBlockedApps = (ids: string[]) => AsyncStorage.setItem(K.apps, JSON.stringify(ids));

export const isOnboarded = async () => (await AsyncStorage.getItem(K.onboarded)) === '1';
export const setOnboarded = () => AsyncStorage.setItem(K.onboarded, '1');

// ---- sessions ----
export type Session = { start: number; end?: number };

export const dayKey = (t: number = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getSessions = () => getJson<Session[]>(K.sessions, []);
const saveSessions = (list: Session[]) =>
  AsyncStorage.setItem(K.sessions, JSON.stringify(list.slice(-MAX_SESSIONS)));

export async function startSession() {
  const list = await getSessions();
  if (list.length && list[list.length - 1].end === undefined) return; // already open
  list.push({ start: Date.now() });
  await saveSessions(list);
}

export async function endSession() {
  const list = await getSessions();
  const last = list[list.length - 1];
  if (last && last.end === undefined) {
    last.end = Date.now();
    await saveSessions(list);
  }
}

export type Stats = { todayMs: number; streak: number };

export function computeStats(list: Session[], now: number = Date.now()): Stats {
  const d0 = new Date(now);
  d0.setHours(0, 0, 0, 0);
  const dayStart = d0.getTime();
  let todayMs = 0;
  const days = new Set<string>();
  for (const s of list) {
    const end = s.end ?? now;
    if (end - s.start < 1000) continue;
    days.add(dayKey(s.start));
    todayMs += Math.max(0, end - Math.max(s.start, dayStart));
  }
  let streak = 0;
  const cur = new Date(now);
  if (!days.has(dayKey(cur.getTime()))) cur.setDate(cur.getDate() - 1);
  while (days.has(dayKey(cur.getTime()))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return { todayMs, streak };
}

// ---- emergency unlocks ----
export async function getEmergencyRemaining(): Promise<number> {
  const e = await getJson<{ day: string; used: number }>(K.emergency, { day: '', used: 0 });
  const used = e.day === dayKey() ? e.used : 0;
  return Math.max(0, MAX_EMERGENCY_PER_DAY - used);
}

/** Consumes one emergency unlock. Returns false if none left today. */
export async function useEmergencyUnlock(): Promise<boolean> {
  const e = await getJson<{ day: string; used: number }>(K.emergency, { day: '', used: 0 });
  const today = dayKey();
  const used = e.day === today ? e.used : 0;
  if (used >= MAX_EMERGENCY_PER_DAY) return false;
  await AsyncStorage.setItem(K.emergency, JSON.stringify({ day: today, used: used + 1 }));
  return true;
}

// ---- lock-out rescue ----
const R = {
  backup: 'brick.backup',
  rescue: 'brick.rescue',
  lockSince: 'brick.lockSince',
};

export type BackupRecord = { salt: string; hash: string; confirmed: boolean };
export type RescueState = { fails: number; until: number };

export const getBackup = () => getJson<BackupRecord | null>(R.backup, null);
export const setBackup = (b: BackupRecord) => AsyncStorage.setItem(R.backup, JSON.stringify(b));

export const getRescueState = () => getJson<RescueState>(R.rescue, { fails: 0, until: 0 });
export const setRescueState = (s: RescueState) => AsyncStorage.setItem(R.rescue, JSON.stringify(s));

export const getLockSince = () => getJson<number | null>(R.lockSince, null);
export const setLockSince = (t: number | null) =>
  t === null ? AsyncStorage.removeItem(R.lockSince) : AsyncStorage.setItem(R.lockSince, JSON.stringify(t));

// ---- weekly focus card (local only, nothing is sent unless the user taps Share) ----
export type Weekly = {
  /** Oldest first, 7 entries: [dayKey, focused ms]. Today is last. */
  days: { key: string; ms: number }[];
  lockDays: number;
  totalMs: number;
  streak: number;
};

export function computeWeekly(list: Session[], now: number = Date.now()): Weekly {
  const days: { key: string; ms: number; start: number; end: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const start = d.getTime();
    const e = new Date(d);
    e.setDate(e.getDate() + 1);
    days.push({ key: dayKey(start), ms: 0, start, end: Math.min(e.getTime(), now) });
  }
  for (const s of list) {
    const end = s.end ?? now;
    if (end - s.start < 1000) continue;
    for (const d of days) {
      const overlap = Math.min(end, d.end) - Math.max(s.start, d.start);
      if (overlap > 0) d.ms += overlap;
    }
  }
  const totalMs = days.reduce((a, d) => a + d.ms, 0);
  return {
    days: days.map(({ key, ms }) => ({ key, ms })),
    lockDays: days.filter((d) => d.ms >= 60000).length,
    totalMs,
    streak: computeStats(list, now).streak,
  };
}
