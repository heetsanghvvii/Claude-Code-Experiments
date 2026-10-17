import { DEFAULT_CONFIG, validateConfig } from './config';
import { isValidLatLng } from './geo';
import { evaluateProximity } from './tagging';
import { splitTeams } from './teams';
import type {
  Arena,
  EndReason,
  ErrorCode,
  GameConfig,
  GameEvent,
  GameState,
  LocationReading,
  Millis,
  Player,
  Result,
  Role,
  TagConfirmation,
  Winner,
} from './types';

// ---------- helpers ----------

const fail = (error: ErrorCode, message: string): Result => ({ ok: false, error, message });

export const isFinished = (s: GameState) => s.status === 'COMPLETED' || s.status === 'CANCELLED';

export const activePlayers = (s: GameState, role: Role): Player[] =>
  Object.values(s.players).filter((p) => p.role === role && p.status === 'ACTIVE');

/** Shallow-copies the parts of state we mutate so callers' objects are never changed. */
function draft(s: GameState): GameState {
  const players: Record<string, Player> = {};
  for (const [k, v] of Object.entries(s.players)) players[k] = { ...v };
  const tags: GameState['tags'] = {};
  for (const [k, v] of Object.entries(s.tags)) tags[k] = { ...v };
  return { ...s, config: { ...s.config }, arena: { ...s.arena, center: { ...s.arena.center } }, players, tags };
}

function complete(s: GameState, at: Millis, winner: Winner, reason: EndReason, ev: GameEvent[]) {
  expirePendingTags(s, at, ev);
  s.status = 'COMPLETED';
  s.winner = winner;
  s.endReason = reason;
  s.endedAt = at;
  ev.push({ type: 'GAME_COMPLETED', at, winner, reason });
}

function cancel(s: GameState, at: Millis, reason: EndReason, ev: GameEvent[]) {
  expirePendingTags(s, at, ev);
  s.status = 'CANCELLED';
  s.endReason = reason;
  s.endedAt = at;
  ev.push({ type: 'GAME_CANCELLED', at, reason });
}

function expirePendingTags(s: GameState, at: Millis, ev: GameEvent[]) {
  for (const t of Object.values(s.tags)) {
    if (t.status === 'PENDING') {
      t.status = 'EXPIRED';
      t.resolvedAt = at;
      ev.push({ type: 'TAG_EXPIRED', at, tagId: t.id });
    }
  }
}

/** Checks team-empty end conditions after a player change. Mutates `s`. */
function checkTeams(s: GameState, at: Millis, ev: GameEvent[]) {
  if (s.status !== 'COUNTDOWN' && s.status !== 'ACTIVE') return;
  const runners = activePlayers(s, 'RUNNER').length;
  const hunters = activePlayers(s, 'HUNTER').length;
  if (s.status === 'COUNTDOWN') {
    if (runners === 0 || hunters === 0) cancel(s, at, 'PLAYERS_LEFT', ev);
    return;
  }
  if (runners === 0) complete(s, at, 'HUNTERS', 'ALL_RUNNERS_ELIMINATED', ev);
  else if (hunters === 0) complete(s, at, 'RUNNERS', 'HUNTERS_FORFEIT', ev);
}

/**
 * Applies every time-based transition due at or before `now`, in chronological order.
 * Mutates the draft `s`, appending events.
 */
function applyTime(s: GameState, now: Millis, ev: GameEvent[]) {
  if (s.status === 'LOBBY' && now >= s.createdAt + s.config.lobbyTimeoutMs) {
    cancel(s, s.createdAt + s.config.lobbyTimeoutMs, 'LOBBY_TIMEOUT', ev);
    return;
  }
  if (s.status === 'COUNTDOWN' && s.activeAt !== null && now >= s.activeAt) {
    s.status = 'ACTIVE';
    ev.push({ type: 'GAME_STARTED', at: s.activeAt, huntersReleasedAt: s.huntersReleasedAt!, endsAt: s.endsAt! });
  }
  if (s.status !== 'ACTIVE') return;

  if (!s.huntersReleased && now >= s.huntersReleasedAt!) {
    s.huntersReleased = true;
    ev.push({ type: 'HUNTERS_RELEASED', at: s.huntersReleasedAt! });
  }

  // Pending tags expire only if their window closes before the deadline.
  const deadline = s.endsAt!;
  for (const t of Object.values(s.tags)) {
    const expiresAt = t.createdAt + s.config.tagConfirmWindowMs;
    if (t.status === 'PENDING' && now >= expiresAt && expiresAt < deadline) {
      t.status = 'EXPIRED';
      t.resolvedAt = expiresAt;
      ev.push({ type: 'TAG_EXPIRED', at: expiresAt, tagId: t.id });
    }
  }
  if (now >= deadline) {
    // Runners win if at least one remains when time expires (all-eliminated would already have ended the game).
    complete(s, deadline, 'RUNNERS', 'TIME_EXPIRED', ev);
  }
}

/** Runs pending time transitions, then `fn` on the same draft. */
function run(prev: GameState, now: Millis, fn: (s: GameState, ev: GameEvent[]) => ErrorCode | [ErrorCode, string] | void): Result {
  const s = draft(prev);
  const ev: GameEvent[] = [];
  applyTime(s, now, ev);
  const err = fn(s, ev);
  if (err) {
    const [code, msg] = Array.isArray(err) ? err : [err, err];
    // Errors are all-or-nothing: the draft (including any time transitions) is discarded.
    // Callers persist `advance(state, now)` separately when they need time to move.
    return fail(code, msg);
  }
  if (ev.length === 0) return { ok: true, state: prev, events: [] };
  return { ok: true, state: { ...s, version: prev.version + 1 }, events: ev };
}

// ---------- commands ----------

export interface CreateGameInput {
  id: string;
  hostId: string;
  arena: Arena;
  config?: Partial<GameConfig>;
}

export function createGame(input: CreateGameInput, now: Millis): Result {
  const config: GameConfig = { ...DEFAULT_CONFIG, ...input.config };
  const errs = validateConfig(config);
  if (!isValidLatLng(input.arena.center)) errs.push('arena center is not a valid coordinate');
  if (!(input.arena.radiusM > 0)) errs.push('arena radiusM must be > 0');
  if (errs.length) return fail('INVALID_CONFIG', errs.join('; '));
  const state: GameState = {
    id: input.id,
    hostId: input.hostId,
    status: 'LOBBY',
    config,
    arena: { center: { ...input.arena.center }, radiusM: input.arena.radiusM },
    players: {
      [input.hostId]: { id: input.hostId, role: null, status: 'ACTIVE', joinedAt: now, eliminatedAt: null },
    },
    tags: {},
    createdAt: now,
    countdownStartedAt: null,
    activeAt: null,
    huntersReleasedAt: null,
    endsAt: null,
    endedAt: null,
    winner: null,
    endReason: null,
    huntersReleased: false,
    version: 1,
  };
  return { ok: true, state, events: [{ type: 'PLAYER_JOINED', at: now, playerId: input.hostId }] };
}

/** Applies due time transitions (countdown end, head start end, tag expiry, deadline, lobby timeout). */
export function advance(state: GameState, now: Millis): Result {
  if (isFinished(state)) return { ok: true, state, events: [] };
  return run(state, now, () => undefined);
}

export function joinGame(state: GameState, playerId: string, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.status !== 'LOBBY') return ['WRONG_STATUS', 'can only join in LOBBY'];
    if (s.players[playerId]) return 'ALREADY_JOINED';
    if (Object.keys(s.players).length >= s.config.maxPlayers) return 'GAME_FULL';
    s.players[playerId] = { id: playerId, role: null, status: 'ACTIVE', joinedAt: now, eliminatedAt: null };
    ev.push({ type: 'PLAYER_JOINED', at: now, playerId });
  });
}

export function leaveGame(state: GameState, playerId: string, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    const p = s.players[playerId];
    if (!p) return 'NOT_A_PLAYER';
    if (p.status === 'LEFT') return; // idempotent
    if (s.status === 'LOBBY') {
      delete s.players[playerId];
      ev.push({ type: 'PLAYER_LEFT', at: now, playerId });
      const remaining = Object.values(s.players).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
      if (remaining.length === 0) cancel(s, now, 'HOST_CANCELLED', ev);
      else if (s.hostId === playerId) s.hostId = remaining[0]!.id;
      return;
    }
    p.status = 'LEFT';
    ev.push({ type: 'PLAYER_LEFT', at: now, playerId });
    checkTeams(s, now, ev);
  });
}

/** Host randomly assigns teams. `seed` should come from a server-side random source. */
export function assignTeams(state: GameState, actorId: string, seed: number, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.status !== 'LOBBY') return 'WRONG_STATUS';
    if (actorId !== s.hostId) return 'NOT_HOST';
    const ids = Object.keys(s.players);
    if (ids.length < s.config.minPlayers) return 'NOT_ENOUGH_PLAYERS';
    const { hunters, runners } = splitTeams(ids, s.config.hunterRatio, seed);
    for (const id of hunters) s.players[id]!.role = 'HUNTER';
    for (const id of runners) s.players[id]!.role = 'RUNNER';
    ev.push({ type: 'TEAMS_ASSIGNED', at: now, hunters, runners });
  });
}

/** Host manually overrides one player's role in the lobby. */
export function setRole(state: GameState, actorId: string, playerId: string, role: Role, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.status !== 'LOBBY') return 'WRONG_STATUS';
    if (actorId !== s.hostId) return 'NOT_HOST';
    if (role !== 'HUNTER' && role !== 'RUNNER') return 'INVALID_ROLE';
    const p = s.players[playerId];
    if (!p) return 'NOT_A_PLAYER';
    if (p.role === role) return;
    p.role = role;
    ev.push({ type: 'ROLE_SET', at: now, playerId, role });
  });
}

export function startCountdown(state: GameState, actorId: string, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.status !== 'LOBBY') return 'WRONG_STATUS';
    if (actorId !== s.hostId) return 'NOT_HOST';
    const players = Object.values(s.players);
    if (players.length < s.config.minPlayers) return 'NOT_ENOUGH_PLAYERS';
    if (players.some((p) => p.role === null)) return 'TEAMS_NOT_ASSIGNED';
    if (!players.some((p) => p.role === 'HUNTER') || !players.some((p) => p.role === 'RUNNER'))
      return ['TEAMS_NOT_ASSIGNED', 'need at least one hunter and one runner'];
    s.status = 'COUNTDOWN';
    s.countdownStartedAt = now;
    s.activeAt = now + s.config.countdownMs;
    s.huntersReleasedAt = s.activeAt + s.config.headStartMs;
    s.endsAt = s.activeAt + s.config.durationMs;
    ev.push({ type: 'COUNTDOWN_STARTED', at: now, activeAt: s.activeAt });
    applyTime(s, now, ev); // countdownMs may be 0
  });
}

export function cancelGame(state: GameState, actorId: string, now: Millis): Result {
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (actorId !== s.hostId) return 'NOT_HOST';
    if (s.status === 'ACTIVE') return ['WRONG_STATUS', 'an ACTIVE game ends by its rules, not by cancel'];
    cancel(s, now, 'HOST_CANCELLED', ev);
  });
}

export interface SubmitTagInput {
  tagId: string;
  hunterId: string;
  runnerId: string;
}

/** Hunter claims a tag. Idempotent on `tagId`. Never eliminates by itself. */
export function submitTag(state: GameState, input: SubmitTagInput, now: Millis): Result {
  const existing = state.tags[input.tagId];
  if (existing) {
    if (existing.hunterId === input.hunterId && existing.runnerId === input.runnerId)
      return { ok: true, state, events: [] };
    return fail('TAG_CONFLICT', 'tag id reused with different players');
  }
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.status !== 'ACTIVE') return 'WRONG_STATUS';
    if (now < s.huntersReleasedAt!) return 'HEAD_START';
    const h = s.players[input.hunterId];
    if (!h || h.role !== 'HUNTER' || h.status !== 'ACTIVE') return 'NOT_HUNTER';
    const r = s.players[input.runnerId];
    if (!r || r.role !== 'RUNNER') return 'NOT_RUNNER';
    if (r.status !== 'ACTIVE') return 'TARGET_NOT_ACTIVE';
    s.tags[input.tagId] = {
      id: input.tagId,
      hunterId: input.hunterId,
      runnerId: input.runnerId,
      createdAt: now,
      status: 'PENDING',
      resolvedAt: null,
      confirmation: null,
    };
    ev.push({ type: 'TAG_REQUESTED', at: now, tagId: input.tagId, hunterId: input.hunterId, runnerId: input.runnerId });
  });
}

function confirmInto(s: GameState, tagId: string, via: TagConfirmation, now: Millis, ev: GameEvent[]) {
  const t = s.tags[tagId]!;
  t.status = 'CONFIRMED';
  t.resolvedAt = now;
  t.confirmation = via;
  ev.push({ type: 'TAG_CONFIRMED', at: now, tagId, via });
  const r = s.players[t.runnerId]!;
  if (r.status === 'ACTIVE') {
    r.status = 'ELIMINATED';
    r.eliminatedAt = now;
    ev.push({ type: 'PLAYER_ELIMINATED', at: now, playerId: r.id, tagId });
  }
  // Other pending tags on the same runner are now moot.
  for (const other of Object.values(s.tags)) {
    if (other.id !== tagId && other.runnerId === t.runnerId && other.status === 'PENDING') {
      other.status = 'REJECTED';
      other.resolvedAt = now;
      ev.push({ type: 'TAG_REJECTED', at: now, tagId: other.id });
    }
  }
  checkTeams(s, now, ev);
}

/** The tagged runner acknowledges the tag. Idempotent. */
export function acknowledgeTag(state: GameState, tagId: string, runnerId: string, now: Millis): Result {
  const t = state.tags[tagId];
  if (!t) return fail('TAG_NOT_FOUND', 'no such tag');
  if (t.runnerId !== runnerId) return fail('NOT_RUNNER', 'only the tagged runner can acknowledge');
  if (t.status === 'CONFIRMED') return { ok: true, state, events: [] };
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    if (s.tags[tagId]!.status !== 'PENDING') return 'TAG_NOT_PENDING';
    confirmInto(s, tagId, 'RUNNER_ACK', now, ev);
  });
}

/** Server-side GPS corroboration. Requires multiple close reading pairs. Idempotent. */
export function confirmTagByProximity(
  state: GameState,
  tagId: string,
  readings: readonly LocationReading[],
  now: Millis,
): Result {
  const t = state.tags[tagId];
  if (!t) return fail('TAG_NOT_FOUND', 'no such tag');
  if (t.status === 'CONFIRMED') return { ok: true, state, events: [] };
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    const tag = s.tags[tagId]!;
    if (tag.status !== 'PENDING') return 'TAG_NOT_PENDING';
    const evidence = evaluateProximity(tag, readings, s.config, now);
    if (!evidence.sufficient)
      return ['INSUFFICIENT_EVIDENCE', `${evidence.closePairs}/${s.config.minProximityPairs} close pairs`];
    confirmInto(s, tagId, 'PROXIMITY', now, ev);
  });
}

/** Hunter withdraws a pending tag. Idempotent for already-rejected tags. */
export function withdrawTag(state: GameState, tagId: string, hunterId: string, now: Millis): Result {
  const t = state.tags[tagId];
  if (!t) return fail('TAG_NOT_FOUND', 'no such tag');
  if (t.hunterId !== hunterId) return fail('NOT_HUNTER', 'only the tagging hunter can withdraw');
  if (t.status === 'REJECTED') return { ok: true, state, events: [] };
  if (isFinished(state)) return fail('GAME_FINISHED', 'game is over');
  return run(state, now, (s, ev) => {
    if (isFinished(s)) return 'GAME_FINISHED';
    const tag = s.tags[tagId]!;
    if (tag.status !== 'PENDING') return 'TAG_NOT_PENDING';
    tag.status = 'REJECTED';
    tag.resolvedAt = now;
    ev.push({ type: 'TAG_REJECTED', at: now, tagId });
  });
}

// ---------- queries ----------

export type Phase = 'LOBBY' | 'COUNTDOWN' | 'HEAD_START' | 'HUNT' | 'FINISHED';

export function phaseAt(s: GameState, now: Millis): Phase {
  if (isFinished(s)) return 'FINISHED';
  if (s.status === 'LOBBY') return 'LOBBY';
  if (s.activeAt === null || now < s.activeAt) return 'COUNTDOWN';
  if (now >= s.endsAt!) return 'FINISHED';
  return now < s.huntersReleasedAt! ? 'HEAD_START' : 'HUNT';
}

/** Snapshot release times are fixed: huntersReleasedAt + k * interval, strictly before endsAt. */
export function snapshotDue(s: GameState, lastReleasedAt: Millis | null, now: Millis): boolean {
  if (s.status !== 'ACTIVE' || s.huntersReleasedAt === null || now < s.huntersReleasedAt || now >= s.endsAt!)
    return false;
  if (lastReleasedAt === null) return true;
  return now - lastReleasedAt >= s.config.snapshotIntervalMs;
}

/** Latest usable reading per active runner, for a snapshot. Stale or inaccurate readings are skipped. */
export function selectSnapshotReadings(
  s: GameState,
  readings: readonly LocationReading[],
  now: Millis,
  maxAgeMs: Millis = s.config.snapshotIntervalMs,
): LocationReading[] {
  const runners = new Set(activePlayers(s, 'RUNNER').map((p) => p.id));
  const latest = new Map<string, LocationReading>();
  for (const r of readings) {
    if (!runners.has(r.playerId)) continue;
    if (r.recordedAt > now || now - r.recordedAt > maxAgeMs) continue;
    if (!(r.accuracyM >= 0)) continue;
    const cur = latest.get(r.playerId);
    if (!cur || r.recordedAt > cur.recordedAt) latest.set(r.playerId, r);
  }
  return [...latest.values()].sort((a, b) => a.playerId.localeCompare(b.playerId));
}
