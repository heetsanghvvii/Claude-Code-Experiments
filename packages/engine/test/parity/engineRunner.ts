/**
 * Runs a parity scenario against the pure engine.
 *
 * The engine is pure rules; the SQL RPC layer adds orchestration around it. This adapter
 * mirrors exactly that orchestration and nothing more:
 *  - membership check for `advance` (advance_game is members-only);
 *  - `location` acceptance by game/player status (record_location), then a proximity attempt for
 *    every PENDING tag involving that player, oldest first;
 *  - a proximity attempt right after a new tag is submitted (submit_tag);
 *  - snapshot release: on every successful call that ticks the server clock (all RPCs except the
 *    idempotent replay early-returns), release if `snapshotDue` on the time-advanced state, using
 *    `selectSnapshotReadings`. A failed call releases nothing (the SQL transaction rolls back).
 * Everything else (what is legal, when time transitions fire, what counts as evidence, who
 * wins) comes from the engine.
 */
import {
  acknowledgeTag,
  advance,
  assignTeams,
  cancelGame,
  confirmTagByProximity,
  createGame,
  joinGame,
  leaveGame,
  selectSnapshotReadings,
  setRole,
  snapshotDue,
  startCountdown,
  submitTag,
  withdrawTag,
} from '../../src';
import type { GameEvent, GameState, LocationReading, Millis, Result } from '../../src';
import { ARENA_CENTER, ARENA_RADIUS_M, positionOf } from './scenario';
import type { Observation, ObservedSnapshot, Scenario, Step, StepResult } from './scenario';

const T0: Millis = 1_700_000_000_000;
const SEED = 12345;

export function runEngine(sc: Scenario): Observation[] {
  let state: GameState | null = null;
  const readings: LocationReading[] = [];
  const snapshots: ObservedSnapshot[] = [];
  let lastSnapshotAt: Millis | null = null;
  const out: Observation[] = [];
  const rel = (t: Millis | null) => (t === null ? null : Math.round((t - T0) / 1000));

  for (const step of sc.steps) {
    const now = T0 + step.at * 1000;
    let result: StepResult;
    let events: GameEvent[] = [];

    if (step.do === 'create') {
      const r = createGame(
        {
          id: 'g',
          hostId: step.as,
          arena: { center: ARENA_CENTER, radiusM: ARENA_RADIUS_M },
          config: {
            durationMs: sc.config.durationS * 1000,
            headStartMs: sc.config.headStartS * 1000,
            snapshotIntervalMs: sc.config.snapshotIntervalS * 1000,
          },
        },
        now,
      );
      if (!r.ok) throw new Error(`create failed: ${r.error} ${r.message}`);
      state = r.state;
      events = r.events;
      result = { ok: true };
    } else {
      if (!state) throw new Error('first step must be create');
      const prev: GameState = state;
      const { r, replay, accepted } = apply(prev, step, now, readings);
      if (r.ok) {
        if (!replay) {
          // The SQL clock tick (_advance) runs before the command and may release a snapshot.
          const adv = advance(prev, now);
          const ticked = adv.ok ? adv.state : prev;
          if (snapshotDue(ticked, lastSnapshotAt, now)) {
            for (const rd of selectSnapshotReadings(ticked, readings.slice(0, readings.length - (accepted ? 1 : 0)), now))
              snapshots.push({ runner: rd.playerId, recordedAt: rel(rd.recordedAt)!, releasedAt: rel(now)! });
            lastSnapshotAt = now;
          }
        }
        state = r.state;
        events = r.events;
        result = { ok: true };
      } else {
        result = { ok: false, error: r.error };
      }
      if (step.do === 'location') result.accepted = r.ok;
    }

    const s = state;
    const players: Observation['players'] = {};
    for (const p of Object.values(s.players))
      players[p.id] = { role: p.role, status: p.status, eliminatedAt: rel(p.eliminatedAt) };
    const tags: Observation['tags'] = {};
    for (const t of Object.values(s.tags))
      tags[t.id] = {
        hunter: t.hunterId,
        runner: t.runnerId,
        status: t.status,
        confirmation: t.confirmation,
        createdAt: rel(t.createdAt)!,
        resolvedAt: rel(t.resolvedAt),
      };
    const ps = Object.values(s.players);
    out.push({
      result,
      status: s.status,
      winner: s.winner,
      endReason: s.endReason,
      host: s.hostId,
      huntersReleased: s.huntersReleased,
      times: {
        activeAt: rel(s.activeAt),
        huntersReleasedAt: rel(s.huntersReleasedAt),
        endsAt: rel(s.endsAt),
        endedAt: rel(s.endedAt),
      },
      roleCounts: {
        HUNTER: ps.filter((p) => p.role === 'HUNTER').length,
        RUNNER: ps.filter((p) => p.role === 'RUNNER').length,
        NONE: ps.filter((p) => p.role === null).length,
      },
      players,
      tags,
      snapshots: [...snapshots].sort((a, b) => a.releasedAt - b.releasedAt || a.runner.localeCompare(b.runner)),
      events: events.map(eventKey),
    });
  }
  return out;
}

function eventKey(e: GameEvent): string {
  const subject = 'playerId' in e ? e.playerId : 'tagId' in e ? e.tagId : undefined;
  return subject === undefined ? e.type : `${e.type}:${subject}`;
}

function chain(first: Result, then: (s: GameState) => Result | null): Result {
  if (!first.ok) return first;
  const second = then(first.state);
  if (!second || !second.ok) return first;
  return { ok: true, state: second.state, events: [...first.events, ...second.events] };
}

function apply(
  prev: GameState,
  step: Step,
  now: Millis,
  readings: LocationReading[],
): { r: Result; replay: boolean; accepted: boolean } {
  const tag = 'tag' in step ? prev.tags[step.tag] : undefined;
  switch (step.do) {
    case 'join':
      return { r: joinGame(prev, step.as, now), replay: false, accepted: false };
    case 'leave':
      return { r: leaveGame(prev, step.as, now), replay: false, accepted: false };
    case 'assignTeams':
      return { r: assignTeams(prev, step.as, SEED, now), replay: false, accepted: false };
    case 'setRole':
      return { r: setRole(prev, step.as, step.player, step.role, now), replay: false, accepted: false };
    case 'start':
      return { r: startCountdown(prev, step.as, now), replay: false, accepted: false };
    case 'cancel':
      return { r: cancelGame(prev, step.as, now), replay: false, accepted: false };
    case 'advance':
      if (!prev.players[step.as]) return { r: { ok: false, error: 'NOT_A_PLAYER', message: '' }, replay: false, accepted: false };
      return { r: advance(prev, now), replay: false, accepted: false };
    case 'tag': {
      const replay = !!tag;
      const r = chain(submitTag(prev, { tagId: step.tag, hunterId: step.as, runnerId: step.runner }, now), (s) =>
        replay ? null : confirmTagByProximity(s, step.tag, readings, now),
      );
      return { r, replay, accepted: false };
    }
    case 'ack':
      return {
        r: acknowledgeTag(prev, step.tag, step.as, now),
        replay: !!tag && tag.runnerId === step.as && tag.status === 'CONFIRMED',
        accepted: false,
      };
    case 'withdraw':
      return {
        r: withdrawTag(prev, step.tag, step.as, now),
        replay: !!tag && tag.hunterId === step.as && tag.status === 'REJECTED',
        accepted: false,
      };
    case 'location': {
      // record_location: tick, then require ACTIVE game and ACTIVE player.
      const adv = advance(prev, now);
      if (!adv.ok) return { r: adv, replay: false, accepted: false };
      let s = adv.state;
      const events = [...adv.events];
      if (s.status !== 'ACTIVE') return { r: { ok: false, error: 'WRONG_STATUS', message: '' }, replay: false, accepted: false };
      if (s.players[step.as]?.status !== 'ACTIVE')
        return { r: { ok: false, error: 'NOT_A_PLAYER', message: '' }, replay: false, accepted: false };
      readings.push({
        playerId: step.as,
        ...positionOf(step),
        accuracyM: step.accuracyM ?? 5,
        recordedAt: now - (step.ago ?? 0) * 1000,
        isMocked: step.mocked ?? false,
      });
      const pending = Object.values(s.tags)
        .filter((t) => t.status === 'PENDING' && (t.hunterId === step.as || t.runnerId === step.as))
        .sort((a, b) => a.createdAt - b.createdAt);
      for (const t of pending) {
        if (s.tags[t.id]!.status !== 'PENDING') continue;
        const c = confirmTagByProximity(s, t.id, readings, now);
        if (c.ok) {
          s = c.state;
          events.push(...c.events);
        }
      }
      const changed = events.length > 0;
      return {
        r: { ok: true, state: changed ? { ...s, version: prev.version + 1 } : prev, events },
        replay: false,
        accepted: true,
      };
    }
    case 'create':
      throw new Error('create only as first step');
  }
}
