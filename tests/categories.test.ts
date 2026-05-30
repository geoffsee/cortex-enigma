import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../src/domain/categories';
import { CATEGORY_NAMES } from '../src/domain/types';

describe('CATEGORIES constant', () => {
  it('exposes a key for every CategoryName', () => {
    for (const name of CATEGORY_NAMES) {
      expect(CATEGORIES, `missing category ${name}`).toHaveProperty(name);
    }
  });

  it('contains at least one option per category', () => {
    for (const name of CATEGORY_NAMES) {
      expect(CATEGORIES[name].length).toBeGreaterThan(0);
    }
  });

  it('has only non-empty string options', () => {
    for (const name of CATEGORY_NAMES) {
      for (const value of CATEGORIES[name]) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it('does not duplicate options within a category', () => {
    for (const name of CATEGORY_NAMES) {
      const options = CATEGORIES[name];
      expect(new Set(options).size).toBe(options.length);
    }
  });
});
