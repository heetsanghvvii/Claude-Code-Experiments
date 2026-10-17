// Server RPCs raise 'CODE: message'. Map known codes to player-facing text.
const MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: 'Please sign in again.',
  GAME_NOT_FOUND: 'No live game with that code.',
  GAME_FULL: 'That game is full.',
  GAME_FINISHED: 'That game has already ended.',
  WRONG_STATUS: 'That is not possible at this stage of the game.',
  NOT_HOST: 'Only the host can do that.',
  NOT_A_PLAYER: 'You are not in this game.',
  NOT_ENOUGH_PLAYERS: 'You need at least 2 players.',
  TEAMS_NOT_ASSIGNED: 'Every player needs a team, with at least one hunter and one runner.',
  INVALID_CONFIG: 'Those game settings are not valid.',
  HEAD_START: 'Runners still have their head start.',
};

export function errorCode(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : '';
  const m = /^([A-Z_]+)(?::|$)/.exec(msg);
  return m ? m[1]! : null;
}

export function friendlyError(e: unknown): string {
  const code = errorCode(e);
  if (code && MESSAGES[code]) return MESSAGES[code]!;
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e && 'message' in e) return String((e as { message: unknown }).message);
  return 'Something went wrong.';
}
