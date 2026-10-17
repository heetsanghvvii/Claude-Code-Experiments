import { expect } from 'vitest';
import { createGame, joinGame, setRole, startCountdown } from '../src';
import type { GameConfig, GameState, LocationReading, Result } from '../src';

export const T0 = 1_700_000_000_000;
export const SEC = 1000;
export const MIN = 60 * SEC;
export const ARENA = { center: { lat: 51.5074, lng: -0.1278 }, radiusM: 500 };

export const CFG: Partial<GameConfig> = {
  countdownMs: 10 * SEC,
  headStartMs: 1 * MIN,
  durationMs: 10 * MIN,
  snapshotIntervalMs: 1 * MIN,
  tagConfirmWindowMs: 30 * SEC,
  lobbyTimeoutMs: 30 * MIN,
};

export function ok(r: Result): Extract<Result, { ok: true }> {
  if (!r.ok) throw new Error(`expected ok, got ${r.error}: ${r.message}`);
  return r;
}

export function err(r: Result, code: string) {
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error).toBe(code);
}

export function lobby(players = ['host', 'p2', 'p3'], config: Partial<GameConfig> = CFG): GameState {
  let s = ok(createGame({ id: 'g1', hostId: players[0]!, arena: ARENA, config }, T0)).state;
  for (const p of players.slice(1)) s = ok(joinGame(s, p, T0 + SEC)).state;
  return s;
}

/** Lobby with explicit roles: `hunters` are hunters, the rest runners. */
export function withRoles(hunters: string[], runners: string[], config: Partial<GameConfig> = CFG): GameState {
  let s = lobby([...hunters, ...runners], config);
  for (const h of hunters) s = ok(setRole(s, hunters[0]!, h, 'HUNTER', T0 + 2 * SEC)).state;
  for (const r of runners) s = ok(setRole(s, hunters[0]!, r, 'RUNNER', T0 + 2 * SEC)).state;
  return s;
}

/** Countdown started at T0+5s. ACTIVE at T0+15s, hunters released at +75s, ends at +615s. */
export const START = T0 + 5 * SEC;
export const ACTIVE_AT = START + 10 * SEC;
export const RELEASE_AT = ACTIVE_AT + 1 * MIN;
export const ENDS_AT = ACTIVE_AT + 10 * MIN;

export function started(hunters = ['h1'], runners = ['r1', 'r2'], config: Partial<GameConfig> = CFG): GameState {
  return ok(startCountdown(withRoles(hunters, runners, config), hunters[0]!, START)).state;
}

/** Point `dM` metres north of the arena centre. */
export function north(dM: number) {
  return { lat: ARENA.center.lat + dM / 111_195, lng: ARENA.center.lng };
}

export function reading(playerId: string, at: number, dM = 0, accuracyM = 5): LocationReading {
  return { playerId, recordedAt: at, accuracyM, ...north(dM) };
}
