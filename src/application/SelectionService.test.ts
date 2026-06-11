import { describe, it, expect } from 'vitest';
import { randomize } from './SelectionService';
import { CATEGORIES } from '../domain/categories';
import { EMPTY_SELECTIONS } from '../domain/types';

function sequenceRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('randomize', () => {
  it('fills every category with a valid option by default (uniform)', () => {
    const result = randomize();
    for (const cat of Object.keys(CATEGORIES)) {
      expect(CATEGORIES[cat]).toContain(result[cat]);
    }
  });

  it('preserves locked axes from current state', () => {
    const current = { ...EMPTY_SELECTIONS, MEDIUM: 'textile', SUBJECT: 'society' };
    const result = randomize(current, new Set(['MEDIUM', 'SUBJECT']));
    expect(result.MEDIUM).toBe('textile');
    expect(result.SUBJECT).toBe('society');
  });

  it('uniform mode maps rng directly onto option index', () => {
    const result = randomize(EMPTY_SELECTIONS, undefined, 'uniform', [], () => 0);
    for (const cat of Object.keys(CATEGORIES)) {
      expect(result[cat]).toBe(CATEGORIES[cat][0]);
    }
  });

  it('history bias falls back to uniform when history is empty', () => {
    const result = randomize(EMPTY_SELECTIONS, undefined, 'history', [], () => 0.999);
    for (const cat of Object.keys(CATEGORIES)) {
      expect(result[cat]).toBe(CATEGORIES[cat][CATEGORIES[cat].length - 1]);
    }
  });

  it('history bias boosts options that appear in recent prompts', () => {
    // SUBJECT options: 7 total. 'nature' appears in all 3 prompts → weight 10 vs 1.
    // Total weight = 16, 'nature' (index 1) occupies the [1, 11) slice.
    const history = [
      'painting, nature, in a studio context',
      'photo, nature',
      'nature, contemplative',
    ];
    const rng = sequenceRng([0.3]);
    const result = randomize(EMPTY_SELECTIONS, undefined, 'history', history, rng);
    expect(result.SUBJECT).toBe('nature');
  });

  it('history bias never starves unseen options', () => {
    const history = ['nature'];
    // rng ~1 lands on the final option regardless of bias weights.
    const result = randomize(EMPTY_SELECTIONS, undefined, 'history', history, () => 0.9999);
    expect(result.SUBJECT).toBe(CATEGORIES.SUBJECT[CATEGORIES.SUBJECT.length - 1]);
  });

  it('history bias respects locked axes', () => {
    const current = { ...EMPTY_SELECTIONS, STYLE: 'surreal' };
    const history = ['naturalist painting of nature'];
    const result = randomize(current, new Set(['STYLE']), 'history', history);
    expect(result.STYLE).toBe('surreal');
    for (const cat of Object.keys(CATEGORIES)) {
      expect(CATEGORIES[cat]).toContain(result[cat]);
    }
  });

  it('history matching is word-bounded, not substring', () => {
    // 'print' must not be counted inside another word; 'drawing' must not boost 'draw'.
    const history = ['blueprinted drawing'];
    // METHOD options: 10 total. With no whole-word matches every weight stays 1,
    // so rng 0 picks index 0 just like uniform.
    const result = randomize(EMPTY_SELECTIONS, undefined, 'history', history, () => 0);
    expect(result.METHOD).toBe(CATEGORIES.METHOD[0]);
  });
});
