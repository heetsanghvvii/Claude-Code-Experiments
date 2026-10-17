import type { GameConfig } from './types';

const SEC = 1000;
const MIN = 60 * SEC;

export const DEFAULT_CONFIG: GameConfig = {
  countdownMs: 10 * SEC,
  headStartMs: 2 * MIN,
  durationMs: 20 * MIN,
  snapshotIntervalMs: 2 * MIN,
  tagRadiusM: 10,
  maxAccuracyM: 25,
  tagConfirmWindowMs: 60 * SEC,
  minProximityPairs: 2,
  pairMaxSkewMs: 5 * SEC,
  lobbyTimeoutMs: 30 * MIN,
  minPlayers: 2,
  maxPlayers: 20,
  hunterRatio: 0.25,
};

/** Returns a list of problems; empty means valid. */
export function validateConfig(c: GameConfig): string[] {
  const errs: string[] = [];
  const positive: (keyof GameConfig)[] = [
    'durationMs',
    'snapshotIntervalMs',
    'tagRadiusM',
    'maxAccuracyM',
    'tagConfirmWindowMs',
    'lobbyTimeoutMs',
  ];
  for (const k of positive) if (!(c[k] > 0)) errs.push(`${k} must be > 0`);
  if (!(c.countdownMs >= 0)) errs.push('countdownMs must be >= 0');
  if (!(c.headStartMs >= 0)) errs.push('headStartMs must be >= 0');
  if (!(c.pairMaxSkewMs >= 0)) errs.push('pairMaxSkewMs must be >= 0');
  if (c.headStartMs >= c.durationMs) errs.push('headStartMs must be < durationMs');
  if (!Number.isInteger(c.minProximityPairs) || c.minProximityPairs < 2)
    errs.push('minProximityPairs must be an integer >= 2 (one reading never eliminates)');
  if (!Number.isInteger(c.minPlayers) || c.minPlayers < 2) errs.push('minPlayers must be >= 2');
  if (!Number.isInteger(c.maxPlayers) || c.maxPlayers < c.minPlayers)
    errs.push('maxPlayers must be >= minPlayers');
  if (!(c.hunterRatio > 0 && c.hunterRatio < 1)) errs.push('hunterRatio must be in (0, 1)');
  return errs;
}
