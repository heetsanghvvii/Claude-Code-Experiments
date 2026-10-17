export interface ClockSample {
  /** Client time when the request was sent / response received (epoch ms). */
  sentAt: number;
  receivedAt: number;
  /** Server time from the `Date` header, epoch ms, 1 s resolution (floor). */
  serverDateMs: number;
}

/**
 * serverNow = clientNow + offset. `Date` headers are floored to whole seconds so the
 * true server time lies in [D, D+1s); we take the middle and assume symmetric latency.
 */
export function sampleOffset(s: ClockSample): { offsetMs: number; rttMs: number } {
  const rttMs = Math.max(0, s.receivedAt - s.sentAt);
  const serverAtReceive = s.serverDateMs + 500 + rttMs / 2;
  return { offsetMs: serverAtReceive - s.receivedAt, rttMs };
}

/** Pick the offset from the lowest-RTT sample (least network noise). */
export function bestOffset(samples: ClockSample[]): number | null {
  let best: { offsetMs: number; rttMs: number } | null = null;
  for (const s of samples) {
    const o = sampleOffset(s);
    if (!best || o.rttMs < best.rttMs) best = o;
  }
  return best ? best.offsetMs : null;
}

export const serverNowMs = (clientNowMs: number, offsetMs: number) => clientNowMs + offsetMs;

export function parseTime(v: unknown): number | null {
  if (v == null) return null;
  const t = typeof v === 'number' ? v : Date.parse(String(v));
  return Number.isFinite(t) ? t : null;
}

export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function fmtAgo(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 90) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}
