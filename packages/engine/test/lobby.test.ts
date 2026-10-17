import { describe, expect, it } from 'vitest';
import {
  advance,
  assignTeams,
  cancelGame,
  createGame,
  DEFAULT_CONFIG,
  hunterCountFor,
  joinGame,
  leaveGame,
  setRole,
  splitTeams,
  startCountdown,
  validateConfig,
} from '../src';
import { ARENA, CFG, MIN, SEC, T0, err, lobby, ok, withRoles } from './helpers';

describe('createGame / config', () => {
  it('creates a LOBBY game with the host as the only player', () => {
    const r = ok(createGame({ id: 'g', hostId: 'host', arena: ARENA }, T0));
    expect(r.state.status).toBe('LOBBY');
    expect(Object.keys(r.state.players)).toEqual(['host']);
    expect(r.state.players.host!.role).toBeNull();
    expect(r.events).toEqual([{ type: 'PLAYER_JOINED', at: T0, playerId: 'host' }]);
  });

  it('default config is valid', () => {
    expect(validateConfig(DEFAULT_CONFIG)).toEqual([]);
  });

  it.each([
    [{ minProximityPairs: 1 }, 'minProximityPairs'],
    [{ headStartMs: 10 * MIN, durationMs: 10 * MIN }, 'headStartMs'],
    [{ hunterRatio: 1 }, 'hunterRatio'],
    [{ durationMs: 0 }, 'durationMs'],
    [{ minPlayers: 1 }, 'minPlayers'],
    [{ maxPlayers: 1 }, 'maxPlayers'],
  ])('rejects invalid config %o', (config, field) => {
    const r = createGame({ id: 'g', hostId: 'h', arena: ARENA, config }, T0);
    err(r, 'INVALID_CONFIG');
    if (!r.ok) expect(r.message).toContain(field);
  });

  it('rejects an invalid arena', () => {
    err(createGame({ id: 'g', hostId: 'h', arena: { center: { lat: 91, lng: 0 }, radiusM: 100 } }, T0), 'INVALID_CONFIG');
    err(createGame({ id: 'g', hostId: 'h', arena: { center: ARENA.center, radiusM: 0 } }, T0), 'INVALID_CONFIG');
  });
});

describe('join / leave', () => {
  it('joins and rejects duplicates', () => {
    const s = lobby(['host']);
    const s2 = ok(joinGame(s, 'p2', T0 + SEC)).state;
    expect(Object.keys(s2.players).sort()).toEqual(['host', 'p2']);
    expect(s2.version).toBe(s.version + 1);
    err(joinGame(s2, 'p2', T0 + SEC), 'ALREADY_JOINED');
  });

  it('does not mutate the input state', () => {
    const s = lobby(['host']);
    const snapshot = JSON.stringify(s);
    ok(joinGame(s, 'p2', T0 + SEC));
    expect(JSON.stringify(s)).toBe(snapshot);
  });

  it('enforces maxPlayers', () => {
    const s = lobby(['a', 'b'], { ...CFG, maxPlayers: 2 });
    err(joinGame(s, 'c', T0 + SEC), 'GAME_FULL');
  });

  it('rejects joining after the lobby', () => {
    const s = ok(startCountdown(withRoles(['h'], ['r']), 'h', T0 + 5 * SEC)).state;
    err(joinGame(s, 'late', T0 + 6 * SEC), 'WRONG_STATUS');
  });

  it('host leaving the lobby transfers host to the earliest joiner', () => {
    const s = ok(leaveGame(lobby(['host', 'p2', 'p3']), 'host', T0 + 2 * SEC)).state;
    expect(s.hostId).toBe('p2');
    expect(s.players.host).toBeUndefined();
  });

  it('last player leaving the lobby cancels it', () => {
    const s = ok(leaveGame(lobby(['host']), 'host', T0 + SEC)).state;
    expect(s.status).toBe('CANCELLED');
  });

  it('non-player cannot leave', () => {
    err(leaveGame(lobby(), 'stranger', T0 + SEC), 'NOT_A_PLAYER');
  });
});

describe('team assignment', () => {
  it('hunterCountFor always leaves at least one of each', () => {
    expect(hunterCountFor(1, 0.25)).toBe(0);
    expect(hunterCountFor(2, 0.25)).toBe(1);
    expect(hunterCountFor(2, 0.9)).toBe(1);
    expect(hunterCountFor(8, 0.25)).toBe(2);
    expect(hunterCountFor(10, 0.99)).toBe(9);
  });

  it('splitTeams is deterministic per seed and independent of input order', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const x = splitTeams(ids, 0.25, 42);
    expect(splitTeams([...ids].reverse(), 0.25, 42)).toEqual(x);
    expect(x.hunters).toHaveLength(2);
    expect(x.runners).toHaveLength(6);
    expect([...x.hunters, ...x.runners].sort()).toEqual(ids);
  });

  it('different seeds produce different splits (across a sample)', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const outcomes = new Set(Array.from({ length: 20 }, (_, i) => splitTeams(ids, 0.25, i).hunters.join()));
    expect(outcomes.size).toBeGreaterThan(5);
  });

  it('only the host can assign teams, in the lobby, with enough players', () => {
    err(assignTeams(lobby(), 'p2', 1, T0 + 2 * SEC), 'NOT_HOST');
    err(assignTeams(lobby(['solo']), 'solo', 1, T0 + 2 * SEC), 'NOT_ENOUGH_PLAYERS');
    const r = ok(assignTeams(lobby(), 'host', 7, T0 + 2 * SEC));
    const roles = Object.values(r.state.players).map((p) => p.role);
    expect(roles.filter((x) => x === 'HUNTER')).toHaveLength(1);
    expect(roles.filter((x) => x === 'RUNNER')).toHaveLength(2);
    expect(r.events[0]!.type).toBe('TEAMS_ASSIGNED');
  });

  it('setRole lets the host override, and is a no-op when unchanged', () => {
    let s = ok(setRole(lobby(), 'host', 'p2', 'HUNTER', T0 + 2 * SEC)).state;
    expect(s.players.p2!.role).toBe('HUNTER');
    const again = ok(setRole(s, 'host', 'p2', 'HUNTER', T0 + 3 * SEC));
    expect(again.events).toEqual([]);
    expect(again.state).toBe(s);
    err(setRole(s, 'p2', 'p3', 'HUNTER', T0 + 3 * SEC), 'NOT_HOST');
    err(setRole(s, 'host', 'p3', 'GHOST' as never, T0 + 3 * SEC), 'INVALID_ROLE');
    s = ok(setRole(s, 'host', 'p2', 'RUNNER', T0 + 3 * SEC)).state;
    expect(s.players.p2!.role).toBe('RUNNER');
  });
});

describe('start countdown', () => {
  it('requires host, roles for everyone, and both teams', () => {
    err(startCountdown(lobby(), 'host', T0 + 5 * SEC), 'TEAMS_NOT_ASSIGNED');
    err(startCountdown(withRoles(['h'], ['r']), 'r', T0 + 5 * SEC), 'NOT_HOST');
    let allRunners = lobby(['a', 'b']);
    allRunners = ok(setRole(allRunners, 'a', 'a', 'RUNNER', T0 + 2 * SEC)).state;
    allRunners = ok(setRole(allRunners, 'a', 'b', 'RUNNER', T0 + 2 * SEC)).state;
    err(startCountdown(allRunners, 'a', T0 + 5 * SEC), 'TEAMS_NOT_ASSIGNED');
  });

  it('sets server-owned timestamps from config', () => {
    const now = T0 + 5 * SEC;
    const s = ok(startCountdown(withRoles(['h'], ['r']), 'h', now)).state;
    expect(s.status).toBe('COUNTDOWN');
    expect(s.activeAt).toBe(now + CFG.countdownMs!);
    expect(s.huntersReleasedAt).toBe(s.activeAt! + CFG.headStartMs!);
    expect(s.endsAt).toBe(s.activeAt! + CFG.durationMs!);
  });

  it('countdown of 0 goes straight to ACTIVE', () => {
    const s = ok(startCountdown(withRoles(['h'], ['r'], { ...CFG, countdownMs: 0 }), 'h', T0 + 5 * SEC)).state;
    expect(s.status).toBe('ACTIVE');
  });

  it('cannot start twice', () => {
    const s = ok(startCountdown(withRoles(['h'], ['r']), 'h', T0 + 5 * SEC)).state;
    err(startCountdown(s, 'h', T0 + 6 * SEC), 'WRONG_STATUS');
  });
});

describe('cancel and lobby timeout', () => {
  it('host can cancel in LOBBY or COUNTDOWN, not ACTIVE', () => {
    expect(ok(cancelGame(lobby(), 'host', T0 + SEC)).state.status).toBe('CANCELLED');
    err(cancelGame(lobby(), 'p2', T0 + SEC), 'NOT_HOST');
    const cd = ok(startCountdown(withRoles(['h'], ['r']), 'h', T0 + 5 * SEC)).state;
    expect(ok(cancelGame(cd, 'h', T0 + 6 * SEC)).state.status).toBe('CANCELLED');
    err(cancelGame(cd, 'h', T0 + 5 * SEC + CFG.countdownMs!), 'WRONG_STATUS');
  });

  it('lobby times out to CANCELLED', () => {
    const s = lobby();
    expect(ok(advance(s, T0 + CFG.lobbyTimeoutMs! - 1)).events).toEqual([]);
    const r = ok(advance(s, T0 + CFG.lobbyTimeoutMs!));
    expect(r.state.status).toBe('CANCELLED');
    expect(r.state.endReason).toBe('LOBBY_TIMEOUT');
  });

  it('a join after the lobby timeout fails', () => {
    err(joinGame(lobby(), 'late', T0 + CFG.lobbyTimeoutMs! + 1), 'GAME_FINISHED');
  });
});
