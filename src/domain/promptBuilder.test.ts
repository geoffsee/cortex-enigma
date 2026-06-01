import { describe, it, expect } from 'vitest';
import { buildPrompt } from './promptBuilder';
import { EMPTY_SELECTIONS } from './types';

describe('buildPrompt', () => {
  it('returns empty string when all selections are empty', () => {
    expect(buildPrompt(EMPTY_SELECTIONS)).toBe('');
  });

  it('joins non-empty selections with commas', () => {
    expect(
      buildPrompt({
        ...EMPTY_SELECTIONS,
        foundation: 'a photo',
        MEDIUM: 'oil painting',
        SUBJECT: 'cat',
      }),
    ).toBe('a photo, oil painting, cat');
  });

  it('prefixes METHOD with "made via"', () => {
    expect(
      buildPrompt({ ...EMPTY_SELECTIONS, SUBJECT: 'cat', METHOD: 'AI' }),
    ).toBe('cat, made via AI');
  });

  it('prefixes CONTEXT with "in a" suffix', () => {
    expect(
      buildPrompt({ ...EMPTY_SELECTIONS, SUBJECT: 'cat', CONTEXT: 'gallery' }),
    ).toBe('cat, in a gallery context');
  });
});
