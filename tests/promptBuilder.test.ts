import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../src/domain/promptBuilder';
import { EMPTY_SELECTIONS } from '../src/domain/types';

describe('buildPrompt', () => {
  it('returns an empty string when no selections are set', () => {
    expect(buildPrompt(EMPTY_SELECTIONS)).toBe('');
  });

  it('joins active selection fields with a comma separator', () => {
    const result = buildPrompt({
      ...EMPTY_SELECTIONS,
      foundation: 'sunrise lift',
      MEDIUM: 'tech house',
      SUBJECT: 'peak impact',
      STYLE: 'build',
    });
    expect(result).toBe('sunrise lift, tech house, peak impact, build');
  });

  it('prefixes METHOD with "made via"', () => {
    const result = buildPrompt({
      ...EMPTY_SELECTIONS,
      foundation: 'set',
      METHOD: 'harmonic blend',
    });
    expect(result).toBe('set, made via harmonic blend');
  });

  it('wraps CONTEXT with "in a ... context"', () => {
    const result = buildPrompt({
      ...EMPTY_SELECTIONS,
      foundation: 'set',
      CONTEXT: 'warehouse',
    });
    expect(result).toBe('set, in a warehouse context');
  });

  it('appends rich context segment when provided', () => {
    const result = buildPrompt(
      { ...EMPTY_SELECTIONS, foundation: 'set' },
      'DJ objective: peak',
    );
    expect(result).toBe('set, DJ rich context: DJ objective: peak');
  });

  it('omits empty optional richContext argument', () => {
    const result = buildPrompt({ ...EMPTY_SELECTIONS, foundation: 'set' });
    expect(result).toBe('set');
  });

  it('preserves field ordering: foundation, MEDIUM, SUBJECT, STYLE, ELEMENTS, HISTORY, FUNCTION, METHOD, CONTEXT', () => {
    const result = buildPrompt({
      foundation: 'fdn',
      MEDIUM: 'm',
      METHOD: 'meth',
      SUBJECT: 'subj',
      STYLE: 'st',
      ELEMENTS: 'el',
      FUNCTION: 'fn',
      CONTEXT: 'ctx',
      HISTORY: 'hist',
    });
    expect(result).toBe(
      'fdn, m, subj, st, el, hist, fn, made via meth, in a ctx context',
    );
  });
});
