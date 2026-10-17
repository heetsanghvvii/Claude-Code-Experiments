/** Same alphabet as the server (`games.code` check constraint): no 0/O/1/I. */
export const GAME_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const GAME_CODE_LENGTH = 6;

/** Uppercases, strips whitespace and dashes. Does not validate. */
export function normalizeGameCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '');
}

export function isValidGameCode(code: string): boolean {
  return (
    code.length === GAME_CODE_LENGTH && [...code].every((c) => GAME_CODE_ALPHABET.includes(c))
  );
}
