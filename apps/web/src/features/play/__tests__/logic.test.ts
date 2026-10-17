import { describe, expect, it } from 'vitest';
import { bestOffset, fmtAgo, fmtDuration, sampleOffset } from '../lib/clock';
import { boundsState, circleRing, distanceM } from '../lib/geo';
import { computePhase } from '../lib/phase';
import { gradeAccuracy, MAX_READING_AGE_MS, pruneQueue, shouldEnqueue, type QueuedReading } from '../lib/queue';
import { latestSnapshots, toGame } from '../model';

const r = (ageMs: number, now = 100_000): QueuedReading => ({ lat: 0, lng: 0, accuracyM: 5, recordedAtMs: now - ageMs, isMocked: false });

describe('queue', () => {
  it('drops readings older than 25s and keeps order', () => {
    const q = pruneQueue([r(30_000), r(26_000), r(25_000), r(1_000)], 100_000);
    expect(q.map((x) => 100_000 - x.recordedAtMs)).toEqual([25_000, 1_000]);
    expect(MAX_READING_AGE_MS).toBe(25_000);
  });
  it('drops readings from the future beyond 5s skew', () => {
    expect(pruneQueue([r(-6_000), r(-4_000)], 100_000)).toHaveLength(1);
  });
  it('caps the length keeping the newest', () => {
    const many = Array.from({ length: 30 }, (_, i) => r(20_000 - i * 500));
    const q = pruneQueue(many, 100_000, 25_000, 20);
    expect(q).toHaveLength(20);
    expect(q[19]).toBe(many[29]);
  });
  it('throttles enqueue', () => {
    expect(shouldEnqueue(null, 0)).toBe(true);
    expect(shouldEnqueue(1000, 2000)).toBe(false);
    expect(shouldEnqueue(1000, 4600)).toBe(true);
  });
  it('grades accuracy', () => {
    expect(gradeAccuracy(10)).toBe('good');
    expect(gradeAccuracy(60)).toBe('weak');
    expect(gradeAccuracy(400)).toBe('hopeless');
  });
});

describe('clock', () => {
  it('computes offset when device is behind the server', () => {
    // server says 12:00:10.xx floor, device thinks 12:00:00, rtt 200ms
    const s = { sentAt: 0, receivedAt: 200, serverDateMs: 10_000 };
    const { offsetMs, rttMs } = sampleOffset(s);
    expect(rttMs).toBe(200);
    expect(offsetMs).toBe(10_000 + 500 + 100 - 200);
  });
  it('is ~0 for synced clocks within the 1s Date resolution', () => {
    const s = { sentAt: 5_000, receivedAt: 5_040, serverDateMs: 5_000 };
    expect(Math.abs(sampleOffset(s).offsetMs)).toBeLessThanOrEqual(500);
  });
  it('prefers the lowest-RTT sample', () => {
    const slow = { sentAt: 0, receivedAt: 2000, serverDateMs: 99_000 };
    const fast = { sentAt: 0, receivedAt: 20, serverDateMs: 1_000 };
    expect(bestOffset([slow, fast])).toBe(sampleOffset(fast).offsetMs);
    expect(bestOffset([])).toBeNull();
  });
  it('formats', () => {
    expect(fmtDuration(65_000)).toBe('1:05');
    expect(fmtDuration(3_661_000)).toBe('1:01:01');
    expect(fmtDuration(-5)).toBe('0:00');
    expect(fmtAgo(12_400)).toBe('12s ago');
    expect(fmtAgo(180_000)).toBe('3m ago');
  });
});

describe('geo', () => {
  it('distance ~111km per degree latitude', () => {
    expect(distanceM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeGreaterThan(110_500);
    expect(distanceM({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeLessThan(111_700);
    expect(distanceM({ lat: 10, lng: 10 }, { lat: 10, lng: 10 })).toBe(0);
  });
  it('bounds', () => {
    const c = { lat: 51.5, lng: -0.12 };
    const inside = boundsState({ lat: 51.5005, lng: -0.12 }, c, 100);
    expect(inside.inside).toBe(true);
    const out = boundsState({ lat: 51.502, lng: -0.12 }, c, 100);
    expect(out.inside).toBe(false);
    expect(out.outsideByM).toBeGreaterThan(100);
    expect(out.outsideByM).toBeLessThan(130);
  });
  it('circleRing is closed and at the right radius', () => {
    const c = { lat: 40, lng: -74 };
    const ring = circleRing(c, 250, 32);
    expect(ring[0]).toEqual(ring[32]);
    for (const [lng, lat] of ring) expect(Math.abs(distanceM({ lat, lng }, c) - 250)).toBeLessThan(1);
  });
});

describe('phase', () => {
  const base = { status: 'ACTIVE' as const, activeAt: 1000, huntersReleasedAt: 61_000, endsAt: 1_201_000, huntersReleased: false };
  it('countdown', () => {
    const p = computePhase({ ...base, status: 'COUNTDOWN' }, 400);
    expect(p.phase).toBe('COUNTDOWN');
    expect(p.phaseRemainingMs).toBe(600);
  });
  it('treats ACTIVE before active_at as countdown (clock skew safe)', () => {
    expect(computePhase(base, 500).phase).toBe('COUNTDOWN');
  });
  it('head start then hunt', () => {
    const h = computePhase(base, 31_000);
    expect(h.phase).toBe('HEAD_START');
    expect(h.phaseRemainingMs).toBe(30_000);
    expect(h.timeLeftMs).toBe(1_170_000);
    expect(computePhase(base, 61_000).phase).toBe('HUNT');
    expect(computePhase({ ...base, huntersReleased: true }, 2000).phase).toBe('HUNT');
  });
  it('ended', () => {
    expect(computePhase({ ...base, status: 'COMPLETED' as never }, 5).phase).toBe('ENDED');
  });
  it('ISO strings work', () => {
    const p = computePhase({ ...base, activeAt: '1970-01-01T00:00:01Z', huntersReleasedAt: '1970-01-01T00:01:01Z', endsAt: '1970-01-01T00:20:01Z' }, 31_000);
    expect(p.phase).toBe('HEAD_START');
  });
});

describe('model', () => {
  it('latestSnapshots keeps newest per runner', () => {
    const s = (playerId: string, releasedAtMs: number) => ({ playerId, lat: 0, lng: 0, accuracyM: 1, recordedAtMs: 0, releasedAtMs });
    const out = latestSnapshots([s('a', 1), s('a', 3), s('b', 2)]);
    expect(out.find((x) => x.playerId === 'a')!.releasedAtMs).toBe(3);
    expect(out).toHaveLength(2);
  });
  it('toGame reads snake_case rows', () => {
    const g = toGame({ id: 'g', status: 'ACTIVE', arena_lat: 1, arena_lng: 2, arena_radius_m: 80, active_at: 'x', hunters_released: true, max_accuracy_m: 30 });
    expect(g!.center).toEqual({ lat: 1, lng: 2 });
    expect(g!.radiusM).toBe(80);
    expect(g!.huntersReleased).toBe(true);
    expect(g!.maxAccuracyM).toBe(30);
  });
});
