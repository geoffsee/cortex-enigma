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

  it('leaves output unchanged when the negative prompt is empty or whitespace', () => {
    const base = { ...EMPTY_SELECTIONS, SUBJECT: 'cat' };
    expect(buildPrompt(base)).toBe('cat');
    expect(buildPrompt({ ...base, negative: '   ' })).toBe('cat');
  });

  it('appends the negative prompt on its own line when present', () => {
    expect(
      buildPrompt({ ...EMPTY_SELECTIONS, SUBJECT: 'cat', negative: 'blurry, text' }),
    ).toBe('cat\nNegative prompt: blurry, text');
  });

  it('emits only the negative prompt when there is no positive content', () => {
    expect(
      buildPrompt({ ...EMPTY_SELECTIONS, negative: 'watermark' }),
    ).toBe('Negative prompt: watermark');
  });
});
