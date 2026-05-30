import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clear,
  randomize,
  toggle,
  validate,
} from '../src/application/SelectionService';
import { CATEGORIES } from '../src/domain/categories';
import { CATEGORY_NAMES, EMPTY_SELECTIONS } from '../src/domain/types';

describe('SelectionService.toggle', () => {
  it('sets a category value when previously empty', () => {
    const next = toggle(EMPTY_SELECTIONS, 'MEDIUM', 'tech house');
    expect(next.MEDIUM).toBe('tech house');
  });

  it('clears the category when the same value is toggled again', () => {
    const once = toggle(EMPTY_SELECTIONS, 'MEDIUM', 'tech house');
    const twice = toggle(once, 'MEDIUM', 'tech house');
    expect(twice.MEDIUM).toBe('');
  });

  it('replaces the category value when a different value is selected', () => {
    const first = toggle(EMPTY_SELECTIONS, 'MEDIUM', 'tech house');
    const second = toggle(first, 'MEDIUM', 'melodic techno');
    expect(second.MEDIUM).toBe('melodic techno');
  });

  it('does not mutate the input state', () => {
    const input = { ...EMPTY_SELECTIONS };
    const snapshot = JSON.stringify(input);
    toggle(input, 'STYLE', 'peak');
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('leaves unrelated categories untouched', () => {
    const base = { ...EMPTY_SELECTIONS, STYLE: 'peak' };
    const next = toggle(base, 'MEDIUM', 'tech house');
    expect(next.STYLE).toBe('peak');
  });
});

describe('SelectionService.clear', () => {
  it('returns a state equal to EMPTY_SELECTIONS', () => {
    expect(clear()).toEqual(EMPTY_SELECTIONS);
  });

  it('returns a new object reference', () => {
    expect(clear()).not.toBe(EMPTY_SELECTIONS);
  });
});

describe('SelectionService.randomize', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picks a valid option from each category', () => {
    const result = randomize();
    for (const cat of CATEGORY_NAMES) {
      expect(CATEGORIES[cat]).toContain(result[cat]);
    }
  });

  it('leaves the foundation field empty (categories do not include foundation)', () => {
    const result = randomize();
    expect(result.foundation).toBe('');
  });

  it('selects the first option of every category when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = randomize();
    for (const cat of CATEGORY_NAMES) {
      expect(result[cat]).toBe(CATEGORIES[cat][0]);
    }
  });

  it('selects the last option of every category when Math.random returns near 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    const result = randomize();
    for (const cat of CATEGORY_NAMES) {
      const options = CATEGORIES[cat];
      expect(result[cat]).toBe(options[options.length - 1]);
    }
  });
});

describe('SelectionService.validate', () => {
  it('returns empty selections for null/undefined input', () => {
    expect(validate(null)).toEqual(EMPTY_SELECTIONS);
    expect(validate(undefined)).toEqual(EMPTY_SELECTIONS);
  });

  it('returns empty selections for non-object input', () => {
    expect(validate('not an object')).toEqual(EMPTY_SELECTIONS);
    expect(validate(42)).toEqual(EMPTY_SELECTIONS);
  });

  it('accepts a valid SelectionState payload', () => {
    const payload = {
      foundation: 'sunrise',
      MEDIUM: 'tech house',
      METHOD: 'harmonic blend',
      SUBJECT: 'peak impact',
      STYLE: 'build',
      ELEMENTS: 'sub pressure',
      FUNCTION: 'push energy',
      CONTEXT: 'warehouse',
      HISTORY: 'detroit techno',
    };
    expect(validate(payload)).toEqual(payload);
  });

  it('drops unknown category values', () => {
    const result = validate({
      MEDIUM: 'not-a-real-genre',
      STYLE: 'peak',
    });
    expect(result.MEDIUM).toBe('');
    expect(result.STYLE).toBe('peak');
  });

  it('keeps any string for the free-form foundation field', () => {
    const result = validate({ foundation: 'whatever user typed' });
    expect(result.foundation).toBe('whatever user typed');
  });

  it('ignores non-string values', () => {
    const result = validate({ MEDIUM: 123, STYLE: { not: 'a string' } });
    expect(result.MEDIUM).toBe('');
    expect(result.STYLE).toBe('');
  });

  it('ignores extraneous keys', () => {
    const result = validate({ MEDIUM: 'tech house', extra: 'ignored' });
    expect(result).not.toHaveProperty('extra');
    expect(result.MEDIUM).toBe('tech house');
  });

  it('accepts an explicit empty string for a category', () => {
    const result = validate({ MEDIUM: '' });
    expect(result.MEDIUM).toBe('');
  });
});
