import { distanceM } from './geo';
import type { GameConfig, LocationReading, Millis, TagRequest } from './types';

export interface ProximityEvidence {
  /** Number of distinct (hunter, runner) reading pairs that were within tag radius. */
  closePairs: number;
  /** Total usable pairs considered (after accuracy/time filtering). */
  usablePairs: number;
  sufficient: boolean;
}

/**
 * Decides whether GPS readings corroborate a tag.
 *
 * Rules (conservative, to avoid false eliminations):
 * - readings flagged `isMocked`, with accuracy worse than `maxAccuracyM`, from the future, or outside the
 *   window [tag.createdAt - tagConfirmWindowMs, tag.createdAt + tagConfirmWindowMs] are ignored;
 * - each hunter reading is paired with the closest-in-time unused runner reading within
 *   `pairMaxSkewMs`; each reading is used at most once, so readings cannot be double-counted;
 * - a pair counts as close if the measured distance is <= tagRadiusM;
 * - at least `minProximityPairs` (>= 2) close pairs are required, so one reading never eliminates.
 */
export function evaluateProximity(
  tag: Pick<TagRequest, 'hunterId' | 'runnerId' | 'createdAt'>,
  readings: readonly LocationReading[],
  config: GameConfig,
  now: Millis,
): ProximityEvidence {
  const lo = tag.createdAt - config.tagConfirmWindowMs;
  const hi = Math.min(now, tag.createdAt + config.tagConfirmWindowMs);
  const usable = (r: LocationReading) =>
    r.isMocked !== true &&
    Number.isFinite(r.accuracyM) &&
    r.accuracyM >= 0 &&
    r.accuracyM <= config.maxAccuracyM &&
    r.recordedAt >= lo &&
    r.recordedAt <= hi;

  const byTime = (a: LocationReading, b: LocationReading) => a.recordedAt - b.recordedAt;
  const hunter = dedupeByTime(readings.filter((r) => r.playerId === tag.hunterId && usable(r))).sort(byTime);
  const runner = dedupeByTime(readings.filter((r) => r.playerId === tag.runnerId && usable(r))).sort(byTime);

  const used = new Set<number>();
  let usablePairs = 0;
  let closePairs = 0;
  for (const h of hunter) {
    let best = -1;
    let bestSkew = Infinity;
    runner.forEach((r, i) => {
      if (used.has(i)) return;
      const skew = Math.abs(r.recordedAt - h.recordedAt);
      if (skew <= config.pairMaxSkewMs && skew < bestSkew) {
        best = i;
        bestSkew = skew;
      }
    });
    if (best < 0) continue;
    used.add(best);
    usablePairs++;
    if (distanceM(h, runner[best]!) <= config.tagRadiusM) closePairs++;
  }
  const required = Math.max(2, config.minProximityPairs);
  return { closePairs, usablePairs, sufficient: closePairs >= required };
}

/** Duplicate submissions of the same reading (same timestamp) count once. */
function dedupeByTime(rs: LocationReading[]): LocationReading[] {
  const seen = new Map<number, LocationReading>();
  for (const r of rs) if (!seen.has(r.recordedAt)) seen.set(r.recordedAt, r);
  return [...seen.values()];
}
