import { describe, it, expect } from 'vitest';
import {
  clampIntensity,
  expansionProfile,
  DEFAULT_EXPANSION_INTENSITY,
  EXPANSION_INTENSITY_LABELS,
} from './expansionIntensity';

describe('clampIntensity', () => {
  it('passes through valid levels', () => {
    expect(clampIntensity(0)).toBe(0);
    expect(clampIntensity(1)).toBe(1);
    expect(clampIntensity(2)).toBe(2);
    expect(clampIntensity(3)).toBe(3);
  });

  it('clamps out-of-range values', () => {
    expect(clampIntensity(-5)).toBe(0);
    expect(clampIntensity(99)).toBe(3);
  });

  it('rounds fractional values', () => {
    expect(clampIntensity(1.4)).toBe(1);
    expect(clampIntensity(1.6)).toBe(2);
  });

  it('falls back to the default for non-finite input', () => {
    expect(clampIntensity(NaN)).toBe(DEFAULT_EXPANSION_INTENSITY);
    expect(clampIntensity(Infinity)).toBe(3);
  });
});

describe('expansionProfile', () => {
  it('returns null at preserve (skip-mode equivalent)', () => {
    expect(expansionProfile(0)).toBeNull();
  });

  it('grows budgets monotonically with intensity', () => {
    const subtle = expansionProfile(1)!;
    const moderate = expansionProfile(2)!;
    const elaborate = expansionProfile(3)!;
    expect(subtle.maxWords).toBeLessThan(moderate.maxWords);
    expect(moderate.maxWords).toBeLessThan(elaborate.maxWords);
    expect(subtle.maxTokens).toBeLessThan(moderate.maxTokens);
    expect(moderate.maxTokens).toBeLessThan(elaborate.maxTokens);
  });

  it('matches the shipped pre-dial budgets at elaborate', () => {
    expect(expansionProfile(3)).toEqual({ maxWords: 15, maxTokens: 30 });
  });
});

describe('EXPANSION_INTENSITY_LABELS', () => {
  it('labels every level', () => {
    expect(EXPANSION_INTENSITY_LABELS[0]).toBe('PRESERVE');
    expect(EXPANSION_INTENSITY_LABELS[3]).toBe('ELABORATE');
  });
});
