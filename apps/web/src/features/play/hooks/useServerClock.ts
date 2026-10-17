import { useCallback, useEffect, useRef, useState } from 'react';
import { bestOffset, type ClockSample } from '../lib/clock';

async function sampleFrom(url: string, headers?: Record<string, string>): Promise<ClockSample | null> {
  try {
    const sentAt = Date.now();
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store', headers });
    const receivedAt = Date.now();
    const d = res.headers.get('date');
    const serverDateMs = d ? Date.parse(d) : NaN;
    return Number.isFinite(serverDateMs) ? { sentAt, receivedAt, serverDateMs } : null;
  } catch {
    return null;
  }
}

/**
 * Estimates (serverTime - deviceTime) from HTTP Date headers (lowest-RTT sample wins) and
 * exposes now() = server-corrected time. Re-samples every 60s. Falls back to offset 0 if no
 * server answers; `synced` says whether we have a real estimate.
 */
export function useServerClock(): { now: () => number; offsetMs: number; synced: boolean } {
  const [offsetMs, setOffset] = useState(0);
  const [synced, setSynced] = useState(false);
  const samples = useRef<ClockSample[]>([]);

  const resample = useCallback(async () => {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
    const targets: [string, Record<string, string> | undefined][] = [];
    if (env.VITE_SUPABASE_URL) targets.push([`${env.VITE_SUPABASE_URL}/rest/v1/`, env.VITE_SUPABASE_ANON_KEY ? { apikey: env.VITE_SUPABASE_ANON_KEY } : undefined]);
    targets.push([`${window.location.origin}/`, undefined]);
    for (const [url, headers] of targets) {
      const batch: ClockSample[] = [];
      for (let i = 0; i < 3; i++) {
        const s = await sampleFrom(url, headers);
        if (s) batch.push(s);
      }
      if (batch.length) {
        samples.current = [...samples.current, ...batch].slice(-12);
        const o = bestOffset(samples.current);
        if (o !== null) { setOffset(o); setSynced(true); }
        return;
      }
    }
  }, []);

  useEffect(() => {
    void resample();
    const t = setInterval(() => void resample(), 60_000);
    return () => clearInterval(t);
  }, [resample]);

  const offsetRef = useRef(0);
  offsetRef.current = offsetMs;
  const now = useCallback(() => Date.now() + offsetRef.current, []);
  return { now, offsetMs, synced };
}

/** Re-render every `ms` (default 250 ms) so countdowns stay smooth. */
export function useTicker(ms = 250): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return n;
}
