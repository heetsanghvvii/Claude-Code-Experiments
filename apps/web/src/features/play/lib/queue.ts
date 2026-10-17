export interface QueuedReading {
  lat: number;
  lng: number;
  accuracyM: number;
  /** Device time of the fix, epoch ms (already corrected to server time by the caller). */
  recordedAtMs: number;
  isMocked: boolean;
}

/** Server rejects readings older than 30s; we drop at 25s so they never arrive stale. */
export const MAX_READING_AGE_MS = 25_000;
export const SEND_INTERVAL_MS = 4_000;
export const MAX_QUEUE = 20;

/** Drop readings older than maxAgeMs; keeps order; also caps length keeping the newest. */
export function pruneQueue(queue: QueuedReading[], nowMs: number, maxAgeMs = MAX_READING_AGE_MS, max = MAX_QUEUE): QueuedReading[] {
  const fresh = queue.filter((r) => nowMs - r.recordedAtMs <= maxAgeMs && r.recordedAtMs - nowMs <= 5_000);
  return fresh.length > max ? fresh.slice(fresh.length - max) : fresh;
}

/** Throttle: accept a fix only when at least minIntervalMs has passed since the last accepted one. */
export function shouldEnqueue(lastEnqueuedMs: number | null, nowMs: number, minIntervalMs = SEND_INTERVAL_MS - 500): boolean {
  return lastEnqueuedMs === null || nowMs - lastEnqueuedMs >= minIntervalMs;
}

/** Readings worse than this are useless even as context; do not send them. */
export const HOPELESS_ACCURACY_M = 150;

export type AccuracyGrade = 'good' | 'weak' | 'hopeless';
export function gradeAccuracy(accuracyM: number, maxAccuracyM = 25): AccuracyGrade {
  if (accuracyM > HOPELESS_ACCURACY_M) return 'hopeless';
  return accuracyM > maxAccuracyM ? 'weak' : 'good';
}
