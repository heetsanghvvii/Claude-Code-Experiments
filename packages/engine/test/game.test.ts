import { describe, expect, it } from 'vitest';
import {
  acknowledgeTag,
  advance,
  confirmTagByProximity,
  evaluateProximity,
  leaveGame,
  phaseAt,
  selectSnapshotReadings,
  snapshotDue,
  submitTag,
  withdrawTag,
  DEFAULT_CONFIG,
} from '../src';
import type { GameState } from '../src';
import { ACTIVE_AT, CFG, ENDS_AT, RELEASE_AT, SEC, err, ok, reading, started } from './helpers';

const active = (s: GameState = started()) => ok(advance(s, ACTIVE_AT)).state;
const hunting = (s: GameState = started()) => ok(advance(s, RELEASE_AT)).state;
const tag = (s: GameState, id = 't1', runnerId = 'r1', at = RELEASE_AT + SEC, hunterId = 'h1') =>
  submitTag(s, { tagId: id, hunterId, runnerId }, at);

describe('state machine timing', () => {
  it('COUNTDOWN -> ACTIVE exactly at activeAt', () => {
    const s = started();
    expect(ok(advance(s, ACTIVE_AT - 1)).state.status).toBe('COUNTDOWN');
    const r = ok(advance(s, ACTIVE_AT));
    expect(r.state.status).toBe('ACTIVE');
    expect(r.events.map((e) => e.type)).toEqual(['GAME_STARTED']);
  });

  it('emits HUNTERS_RELEASED exactly once', () => {
    const s = active();
    const r = ok(advance(s, RELEASE_AT));
    expect(r.events.map((e) => e.type)).toEqual(['HUNTERS_RELEASED']);
    expect(ok(advance(r.state, RELEASE_AT + SEC)).events).toEqual([]);
  });

  it('a single late advance applies all due transitions in order', () => {
    const r = ok(advance(started(), ENDS_AT + 5 * SEC));
    expect(r.events.map((e) => e.type)).toEqual(['GAME_STARTED', 'HUNTERS_RELEASED', 'GAME_COMPLETED']);
    expect(r.state.winner).toBe('RUNNERS');
    expect(r.state.endedAt).toBe(ENDS_AT); // ends at the deadline, not when observed
  });

  it('advance is idempotent', () => {
    const r1 = ok(advance(started(), RELEASE_AT));
    const r2 = ok(advance(r1.state, RELEASE_AT));
    expect(r2.events).toEqual([]);
    expect(r2.state).toBe(r1.state);
  });

  it('phaseAt reports head start vs hunt', () => {
    const s = started();
    expect(phaseAt(s, ACTIVE_AT - 1)).toBe('COUNTDOWN');
    expect(phaseAt(s, ACTIVE_AT)).toBe('HEAD_START');
    expect(phaseAt(s, RELEASE_AT)).toBe('HUNT');
    expect(phaseAt(s, ENDS_AT)).toBe('FINISHED');
  });
});

describe('tagging', () => {
  it('no tags during the head start', () => {
    err(tag(active(), 't1', 'r1', RELEASE_AT - 1), 'HEAD_START');
  });

  it('no tags before ACTIVE', () => {
    err(tag(started(), 't1', 'r1', ACTIVE_AT - 1), 'WRONG_STATUS');
  });

  it('a tag request alone never eliminates', () => {
    const s = ok(tag(hunting())).state;
    expect(s.tags.t1!.status).toBe('PENDING');
    expect(s.players.r1!.status).toBe('ACTIVE');
  });

  it('submitTag is idempotent on tag id', () => {
    const s = ok(tag(hunting())).state;
    const again = ok(tag(s));
    expect(again.events).toEqual([]);
    expect(again.state).toBe(s);
    err(tag(s, 't1', 'r2'), 'TAG_CONFLICT');
  });

  it('validates roles', () => {
    const s = hunting();
    err(submitTag(s, { tagId: 'x', hunterId: 'r1', runnerId: 'r2' }, RELEASE_AT + SEC), 'NOT_HUNTER');
    err(submitTag(s, { tagId: 'x', hunterId: 'h1', runnerId: 'h1' }, RELEASE_AT + SEC), 'NOT_RUNNER');
    err(submitTag(s, { tagId: 'x', hunterId: 'h1', runnerId: 'nobody' }, RELEASE_AT + SEC), 'NOT_RUNNER');
  });

  it('runner acknowledgement confirms and eliminates; repeat is a no-op', () => {
    const s = ok(tag(hunting())).state;
    const r = ok(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + 2 * SEC));
    expect(r.state.tags.t1!.status).toBe('CONFIRMED');
    expect(r.state.tags.t1!.confirmation).toBe('RUNNER_ACK');
    expect(r.state.players.r1!.status).toBe('ELIMINATED');
    expect(r.events.map((e) => e.type)).toEqual(['TAG_CONFIRMED', 'PLAYER_ELIMINATED']);
    const again = ok(acknowledgeTag(r.state, 't1', 'r1', RELEASE_AT + 3 * SEC));
    expect(again.events).toEqual([]);
  });

  it('only the tagged runner can acknowledge', () => {
    const s = ok(tag(hunting())).state;
    err(acknowledgeTag(s, 't1', 'r2', RELEASE_AT + 2 * SEC), 'NOT_RUNNER');
    err(acknowledgeTag(s, 'missing', 'r1', RELEASE_AT + 2 * SEC), 'TAG_NOT_FOUND');
  });

  it('eliminated runner cannot be tagged again; other pending tags on them are rejected', () => {
    let s = hunting(started(['h1', 'h2'], ['r1', 'r2']));
    s = ok(tag(s, 't1', 'r1', RELEASE_AT + SEC, 'h1')).state;
    s = ok(tag(s, 't2', 'r1', RELEASE_AT + SEC, 'h2')).state;
    const r = ok(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + 2 * SEC));
    expect(r.state.tags.t2!.status).toBe('REJECTED');
    err(tag(r.state, 't3', 'r1', RELEASE_AT + 3 * SEC), 'TARGET_NOT_ACTIVE');
  });

  it('pending tags expire after the confirm window', () => {
    const s = ok(tag(hunting())).state;
    const r = ok(advance(s, RELEASE_AT + SEC + CFG.tagConfirmWindowMs!));
    expect(r.state.tags.t1!.status).toBe('EXPIRED');
    expect(r.state.players.r1!.status).toBe('ACTIVE');
    err(acknowledgeTag(r.state, 't1', 'r1', RELEASE_AT + 40 * SEC), 'TAG_NOT_PENDING');
  });

  it('acknowledging after expiry fails even without an explicit advance', () => {
    const s = ok(tag(hunting())).state;
    err(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + SEC + CFG.tagConfirmWindowMs!), 'TAG_NOT_PENDING');
  });

  it('hunter can withdraw a pending tag', () => {
    const s = ok(tag(hunting())).state;
    err(withdrawTag(s, 't1', 'h2', RELEASE_AT + 2 * SEC), 'NOT_HUNTER');
    const r = ok(withdrawTag(s, 't1', 'h1', RELEASE_AT + 2 * SEC));
    expect(r.state.tags.t1!.status).toBe('REJECTED');
    expect(ok(withdrawTag(r.state, 't1', 'h1', RELEASE_AT + 3 * SEC)).events).toEqual([]);
  });
});

describe('GPS proximity evidence', () => {
  const t = { hunterId: 'h1', runnerId: 'r1', createdAt: RELEASE_AT };
  const cfg = { ...DEFAULT_CONFIG, ...CFG };
  const now = RELEASE_AT + 20 * SEC;

  it('one close pair is never enough', () => {
    const ev = evaluateProximity(t, [reading('h1', RELEASE_AT, 0), reading('r1', RELEASE_AT, 3)], cfg, now);
    expect(ev.closePairs).toBe(1);
    expect(ev.sufficient).toBe(false);
  });

  it('two independent close pairs are enough', () => {
    const rs = [
      reading('h1', RELEASE_AT, 0),
      reading('r1', RELEASE_AT + 1000, 3),
      reading('h1', RELEASE_AT + 10_000, 0),
      reading('r1', RELEASE_AT + 10_500, 4),
    ];
    expect(evaluateProximity(t, rs, cfg, now)).toEqual({ closePairs: 2, usablePairs: 2, sufficient: true });
  });

  it('duplicate readings cannot be double-counted', () => {
    const h = reading('h1', RELEASE_AT, 0);
    const r = reading('r1', RELEASE_AT, 2);
    const ev = evaluateProximity(t, [h, h, h, r, r, r], cfg, now);
    expect(ev.closePairs).toBe(1);
    expect(ev.sufficient).toBe(false);
  });

  it('one runner reading cannot pair with many hunter readings', () => {
    const rs = [reading('h1', RELEASE_AT, 0), reading('h1', RELEASE_AT + 1000, 0), reading('r1', RELEASE_AT + 500, 1)];
    expect(evaluateProximity(t, rs, cfg, now).closePairs).toBe(1);
  });

  // Each case has two pairs that would otherwise be close; one bad property must stop them counting.
  const twoPairs = (mod: (r: ReturnType<typeof reading>, i: number) => ReturnType<typeof reading>) =>
    [
      reading('h1', RELEASE_AT, 0),
      reading('r1', RELEASE_AT, 2),
      reading('h1', RELEASE_AT + 10_000, 0),
      reading('r1', RELEASE_AT + 10_000, 2),
    ].map(mod);

  it('baseline: the unmodified readings are sufficient', () => {
    expect(evaluateProximity(t, twoPairs((r) => r), cfg, now).sufficient).toBe(true);
  });

  it.each([
    ['inaccurate runner readings', (r: ReturnType<typeof reading>) => (r.playerId === 'r1' ? { ...r, accuracyM: 80 } : r)],
    ['NaN accuracy', (r: ReturnType<typeof reading>) => (r.playerId === 'r1' ? { ...r, accuracyM: NaN } : r)],
    ['runner too far away', (r: ReturnType<typeof reading>) => (r.playerId === 'r1' ? { ...reading('r1', r.recordedAt, 50) } : r)],
    ['time skew over pairMaxSkewMs', (r: ReturnType<typeof reading>) => (r.playerId === 'r1' ? { ...r, recordedAt: r.recordedAt + 5_001 } : r)],
    ['future readings', (r: ReturnType<typeof reading>) => ({ ...r, recordedAt: r.recordedAt + 60_000 })],
    ['readings before the window', (r: ReturnType<typeof reading>) => ({ ...r, recordedAt: r.recordedAt - 60_000 })],
    ['mocked hunter readings', (r: ReturnType<typeof reading>) => (r.playerId === 'h1' ? { ...r, isMocked: true } : r)],
    ['mocked runner readings', (r: ReturnType<typeof reading>) => (r.playerId === 'r1' ? { ...r, isMocked: true } : r)],
  ])('rejects evidence with %s', (_name, mod) => {
    const ev = evaluateProximity(t, twoPairs(mod), cfg, now);
    expect(ev.sufficient).toBe(false);
  });

  it('readings from other players are ignored', () => {
    const rs = [reading('h1', RELEASE_AT, 0), reading('r2', RELEASE_AT, 0), reading('h1', RELEASE_AT + 9000, 0), reading('r2', RELEASE_AT + 9000, 0)];
    expect(evaluateProximity(t, rs, cfg, now).usablePairs).toBe(0);
  });

  it('confirmTagByProximity eliminates only with sufficient evidence', () => {
    const s = ok(tag(hunting(), 't1', 'r1', RELEASE_AT)).state;
    const one = [reading('h1', RELEASE_AT, 0), reading('r1', RELEASE_AT, 2)];
    err(confirmTagByProximity(s, 't1', one, RELEASE_AT + 5 * SEC), 'INSUFFICIENT_EVIDENCE');
    const two = [...one, reading('h1', RELEASE_AT + 8000, 0), reading('r1', RELEASE_AT + 8000, 2)];
    const r = ok(confirmTagByProximity(s, 't1', two, RELEASE_AT + 10 * SEC));
    expect(r.state.tags.t1!.confirmation).toBe('PROXIMITY');
    expect(r.state.players.r1!.status).toBe('ELIMINATED');
    expect(ok(confirmTagByProximity(r.state, 't1', two, RELEASE_AT + 11 * SEC)).events).toEqual([]);
  });
});

describe('win conditions', () => {
  it('hunters win when the last runner is eliminated before the deadline', () => {
    let s = ok(tag(hunting(), 't1', 'r1')).state;
    s = ok(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + 2 * SEC)).state;
    expect(s.status).toBe('ACTIVE');
    s = ok(tag(s, 't2', 'r2', RELEASE_AT + 3 * SEC)).state;
    const r = ok(acknowledgeTag(s, 't2', 'r2', RELEASE_AT + 4 * SEC));
    expect(r.state.status).toBe('COMPLETED');
    expect(r.state.winner).toBe('HUNTERS');
    expect(r.state.endReason).toBe('ALL_RUNNERS_ELIMINATED');
    expect(r.events.at(-1)!.type).toBe('GAME_COMPLETED');
  });

  it('runners win if one remains at expiry', () => {
    let s = ok(tag(hunting(), 't1', 'r1')).state;
    s = ok(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + 2 * SEC)).state;
    const r = ok(advance(s, ENDS_AT));
    expect(r.state.winner).toBe('RUNNERS');
    expect(r.state.endReason).toBe('TIME_EXPIRED');
  });

  it('the deadline is hard: confirmation at or after endsAt is rejected', () => {
    const s = ok(tag(hunting(), 't1', 'r1', ENDS_AT - 10 * SEC)).state;
    err(acknowledgeTag(s, 't1', 'r1', ENDS_AT), 'GAME_FINISHED');
    // 1 ms before the deadline the same confirmation still counts.
    expect(ok(acknowledgeTag(s, 't1', 'r1', ENDS_AT - 1)).state.players.r1!.status).toBe('ELIMINATED');
  });

  it('pending tags are expired when the game completes', () => {
    const s = ok(tag(hunting(), 't1', 'r1', ENDS_AT - 10 * SEC)).state;
    const r = ok(advance(s, ENDS_AT));
    expect(r.state.tags.t1!.status).toBe('EXPIRED');
    expect(r.state.players.r1!.status).toBe('ACTIVE');
  });

  it('all runners leaving ends the game for hunters; all hunters leaving forfeits', () => {
    let s = hunting();
    s = ok(leaveGame(s, 'r1', RELEASE_AT + SEC)).state;
    const r = ok(leaveGame(s, 'r2', RELEASE_AT + 2 * SEC));
    expect(r.state.winner).toBe('HUNTERS');
    const f = ok(leaveGame(hunting(), 'h1', RELEASE_AT + SEC));
    expect(f.state.winner).toBe('RUNNERS');
    expect(f.state.endReason).toBe('HUNTERS_FORFEIT');
  });

  it('a team emptying during COUNTDOWN cancels instead of completing', () => {
    const r = ok(leaveGame(started(), 'h1', ACTIVE_AT - SEC));
    expect(r.state.status).toBe('CANCELLED');
    expect(r.state.winner).toBeNull();
  });

  it('an eliminated runner who leaves stays ELIMINATED (the elimination is never erased)', () => {
    const s = ok(acknowledgeTag(ok(tag(hunting())).state, 't1', 'r1', RELEASE_AT + 2 * SEC)).state;
    const r = ok(leaveGame(s, 'r1', RELEASE_AT + 3 * SEC));
    expect(r.events).toEqual([]);
    expect(r.state.players.r1!.status).toBe('ELIMINATED');
    expect(r.state.players.r1!.eliminatedAt).toBe(RELEASE_AT + 2 * SEC);
  });
});

describe('completed result is immutable', () => {
  const finished = () => ok(advance(started(), ENDS_AT)).state;

  it('every mutating command fails with GAME_FINISHED', () => {
    const s = finished();
    err(tag(s, 'new'), 'GAME_FINISHED');
    err(leaveGame(s, 'r1', ENDS_AT + 1), 'GAME_FINISHED');
  });

  it('advance on a finished game returns the same object', () => {
    const s = finished();
    const r = ok(advance(s, ENDS_AT + 60 * SEC));
    expect(r.state).toBe(s);
    expect(r.events).toEqual([]);
  });

  it('replaying a confirmed tag after completion is still an idempotent no-op', () => {
    let s = ok(tag(hunting(), 't1', 'r1')).state;
    s = ok(acknowledgeTag(s, 't1', 'r1', RELEASE_AT + 2 * SEC)).state;
    s = ok(tag(s, 't2', 'r2', RELEASE_AT + 3 * SEC)).state;
    s = ok(acknowledgeTag(s, 't2', 'r2', RELEASE_AT + 4 * SEC)).state;
    expect(s.status).toBe('COMPLETED');
    const before = JSON.stringify(s);
    expect(ok(acknowledgeTag(s, 't2', 'r2', RELEASE_AT + 5 * SEC)).events).toEqual([]);
    expect(ok(tag(s, 't2', 'r2', RELEASE_AT + 5 * SEC)).events).toEqual([]);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('snapshots', () => {
  it('no snapshot is due during the head start or after the end', () => {
    const s = active();
    expect(snapshotDue(s, null, RELEASE_AT - 1)).toBe(false);
    expect(snapshotDue(s, null, RELEASE_AT)).toBe(true);
    expect(snapshotDue(s, RELEASE_AT, RELEASE_AT + CFG.snapshotIntervalMs! - 1)).toBe(false);
    expect(snapshotDue(s, RELEASE_AT, RELEASE_AT + CFG.snapshotIntervalMs!)).toBe(true);
    expect(snapshotDue(s, null, ENDS_AT)).toBe(false);
  });

  it('selects the latest fresh reading per active runner only', () => {
    let s = ok(tag(hunting(), 't1', 'r2')).state;
    s = ok(acknowledgeTag(s, 't1', 'r2', RELEASE_AT + 2 * SEC)).state; // r2 eliminated
    const now = RELEASE_AT + 30 * SEC;
    const picked = selectSnapshotReadings(s, [
      reading('r1', now - 20 * SEC, 1),
      reading('r1', now - 5 * SEC, 2),
      reading('r1', now + 5 * SEC, 3), // future: ignored
      reading('r2', now - 1 * SEC, 4), // eliminated
      reading('h1', now - 1 * SEC, 5), // hunter
    ], now);
    expect(picked).toHaveLength(1);
    expect(picked[0]!.recordedAt).toBe(now - 5 * SEC);
  });

  it('skips stale readings', () => {
    const s = hunting();
    const now = RELEASE_AT + 10 * 60 * SEC;
    expect(selectSnapshotReadings(s, [reading('r1', now - 2 * 60 * SEC)], now)).toEqual([]);
  });
});
