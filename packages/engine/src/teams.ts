import { mulberry32, shuffle } from './rng';

/** Number of hunters for n players: round(n * ratio), clamped so both teams have >= 1. */
export function hunterCountFor(n: number, ratio: number): number {
  if (n < 2) return 0;
  return Math.min(n - 1, Math.max(1, Math.round(n * ratio)));
}

/**
 * Splits players into hunters and runners. Sorting before the shuffle makes the
 * result depend only on the set of ids and the seed, not on input order.
 */
export function splitTeams(
  playerIds: readonly string[],
  ratio: number,
  seed: number,
): { hunters: string[]; runners: string[] } {
  const ids = [...new Set(playerIds)].sort();
  const shuffled = shuffle(ids, mulberry32(seed));
  const h = hunterCountFor(ids.length, ratio);
  return { hunters: shuffled.slice(0, h).sort(), runners: shuffled.slice(h).sort() };
}
