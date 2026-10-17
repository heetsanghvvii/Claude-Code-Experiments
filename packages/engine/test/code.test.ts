import { describe, expect, it } from 'vitest';
import { isValidGameCode, normalizeGameCode } from '../src';

describe('game codes', () => {
  it('normalizes case, spaces and dashes', () => {
    expect(normalizeGameCode(' ab3-x9k ')).toBe('AB3X9K');
  });
  it('accepts exactly 6 chars from the alphabet', () => {
    expect(isValidGameCode('AB3X9K')).toBe(true);
    expect(isValidGameCode('AB3X9')).toBe(false);
    expect(isValidGameCode('AB3X9KK')).toBe(false);
  });
  it('rejects ambiguous characters 0, O, 1, I', () => {
    for (const c of ['0', 'O', '1', 'I']) expect(isValidGameCode(`AB3X9${c}`)).toBe(false);
  });
});
