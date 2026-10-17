import { parseTime } from './clock';
import type { GameView } from '../model';

export type Phase = 'LOBBY' | 'COUNTDOWN' | 'HEAD_START' | 'HUNT' | 'ENDED';

export interface PhaseInfo {
  phase: Phase;
  /** ms until the current phase ends (COUNTDOWN->start, HEAD_START->release); null otherwise. */
  phaseRemainingMs: number | null;
  /** ms until the game's hard deadline; null before ACTIVE. */
  timeLeftMs: number | null;
  huntersReleased: boolean;
}

/** Pure: derive the phase from the server's timestamps and a server-corrected "now". */
export function computePhase(g: Pick<GameView, 'status' | 'activeAt' | 'huntersReleasedAt' | 'endsAt' | 'huntersReleased'>, serverNow: number): PhaseInfo {
  const activeAt = parseTime(g.activeAt);
  const releaseAt = parseTime(g.huntersReleasedAt);
  const endsAt = parseTime(g.endsAt);
  if (g.status === 'COMPLETED' || g.status === 'CANCELLED') return { phase: 'ENDED', phaseRemainingMs: null, timeLeftMs: 0, huntersReleased: g.huntersReleased };
  if (g.status === 'LOBBY') return { phase: 'LOBBY', phaseRemainingMs: null, timeLeftMs: null, huntersReleased: false };
  if (g.status === 'COUNTDOWN' || (activeAt != null && serverNow < activeAt)) {
    return { phase: 'COUNTDOWN', phaseRemainingMs: activeAt != null ? Math.max(0, activeAt - serverNow) : null, timeLeftMs: null, huntersReleased: false };
  }
  const timeLeftMs = endsAt != null ? Math.max(0, endsAt - serverNow) : null;
  const released = g.huntersReleased || (releaseAt != null && serverNow >= releaseAt);
  if (!released) return { phase: 'HEAD_START', phaseRemainingMs: releaseAt != null ? Math.max(0, releaseAt - serverNow) : null, timeLeftMs, huntersReleased: false };
  return { phase: 'HUNT', phaseRemainingMs: null, timeLeftMs, huntersReleased: true };
}
