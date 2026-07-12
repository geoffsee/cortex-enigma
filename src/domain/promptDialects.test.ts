import { describe, it, expect } from 'vitest';
import { renderPrompt, isDialectId, DEFAULT_DIALECT } from './promptDialects';
import { buildPrompt } from './promptBuilder';
import { EMPTY_SELECTIONS } from './types';

const base = {
  ...EMPTY_SELECTIONS,
  foundation: 'a photo',
  MEDIUM: 'painting',
  SUBJECT: 'figure',
};

describe('renderPrompt', () => {
  it('standard dialect is byte-identical to buildPrompt', () => {
    const withNegative = { ...base, negative: 'blurry, text' };
    expect(renderPrompt(base, 'standard')).toBe(buildPrompt(base));
    expect(renderPrompt(withNegative, 'standard')).toBe(buildPrompt(withNegative));
  });

  it('standard is the default dialect', () => {
    expect(DEFAULT_DIALECT).toBe('standard');
  });

  it('midjourney emits negatives as a --no parameter', () => {
    expect(renderPrompt({ ...base, negative: 'blurry, text' }, 'midjourney')).toBe(
      'a photo, painting, figure --no blurry, text',
    );
  });

  it('midjourney omits --no when there is no negative', () => {
    expect(renderPrompt(base, 'midjourney')).toBe('a photo, painting, figure');
  });

  it('midjourney emits only --no when there is no positive content', () => {
    expect(renderPrompt({ ...EMPTY_SELECTIONS, negative: 'watermark' }, 'midjourney')).toBe(
      '--no watermark',
    );
  });

  it('natural dialect capitalizes and ends the sentence with a period', () => {
    expect(renderPrompt(base, 'natural')).toBe('A photo, painting, figure.');
  });

  it('natural dialect appends an Avoid clause for negatives', () => {
    expect(renderPrompt({ ...base, negative: 'blurry' }, 'natural')).toBe(
      'A photo, painting, figure. Avoid blurry.',
    );
  });

  it('natural dialect emits only the Avoid clause without positive content', () => {
    expect(renderPrompt({ ...EMPTY_SELECTIONS, negative: 'watermark' }, 'natural')).toBe(
      'Avoid watermark.',
    );
  });
});

describe('isDialectId', () => {
  it('accepts known dialects and rejects unknown values', () => {
    expect(isDialectId('standard')).toBe(true);
    expect(isDialectId('midjourney')).toBe(true);
    expect(isDialectId('natural')).toBe(true);
    expect(isDialectId('sdxl')).toBe(false);
    expect(isDialectId('')).toBe(false);
  });
});
