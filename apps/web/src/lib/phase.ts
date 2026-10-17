import type { GameRow } from './types';

export type ClientPhase = 'LOBBY' | 'COUNTDOWN' | 'HEAD_START' | 'HUNT' | 'FINISHED';

/** Display-only phase from server timestamps. The server decides the real transitions. */
export function clientPhase(g: GameRow, now: number = Date.now()): { phase: ClientPhase; msLeft: number | null } {
  if (g.status === 'COMPLETED' || g.status === 'CANCELLED') return { phase: 'FINISHED', msLeft: null };
  if (g.status === 'LOBBY' || !g.active_at) return { phase: 'LOBBY', msLeft: null };
  const active = Date.parse(g.active_at);
  const released = Date.parse(g.hunters_released_at ?? g.active_at);
  const ends = Date.parse(g.ends_at ?? g.active_at);
  if (now < active) return { phase: 'COUNTDOWN', msLeft: active - now };
  if (now < released) return { phase: 'HEAD_START', msLeft: released - now };
  if (now < ends) return { phase: 'HUNT', msLeft: ends - now };
  return { phase: 'FINISHED', msLeft: 0 };
}

export function formatMs(ms: number | null): string {
  if (ms === null) return '';
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
