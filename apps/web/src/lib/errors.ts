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
  CODE_EXHAUSTED: 'Could not make a game code. Try again.',
  HEAD_START: 'Runners still have their head start.',
};

function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e && 'message' in e) return String((e as { message: unknown }).message);
  return typeof e === 'string' ? e : '';
}

export function errorCode(e: unknown): string | null {
  const m = /^([A-Z_]+)(?::|$)/.exec(messageOf(e));
  return m ? m[1]! : null;
}

export function friendlyError(e: unknown): string {
  const code = errorCode(e);
  if (code && MESSAGES[code]) return MESSAGES[code]!;
  const msg = messageOf(e);
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return 'No connection. Check your signal and try again.';
  return msg || 'Something went wrong.';
}
