import { describe, it, expect } from 'vitest';
import { buildAxisSweep } from './promptSweep';
import { CATEGORIES } from './categories';
import { EMPTY_SELECTIONS } from './types';

describe('buildAxisSweep', () => {
  it('emits one column per value of the chosen axis', () => {
    const columns = buildAxisSweep(EMPTY_SELECTIONS, 'MEDIUM');
    expect(columns.map(c => c.value)).toEqual(CATEGORIES.MEDIUM);
  });

  it('holds all other selections fixed while varying the swept axis', () => {
    const base = { ...EMPTY_SELECTIONS, foundation: 'a cat', SUBJECT: 'figure' };
    const columns = buildAxisSweep(base, 'STYLE');
    expect(columns).toHaveLength(CATEGORIES.STYLE.length);
    for (const column of columns) {
      expect(column.prompt).toBe(`a cat, figure, ${column.value}`);
    }
  });

  it('overrides an existing value on the swept axis', () => {
    const base = { ...EMPTY_SELECTIONS, STYLE: 'realist' };
    const columns = buildAxisSweep(base, 'STYLE');
    // Other selections are empty, so each prompt collapses to the swept STYLE value.
    expect(columns.map(c => c.prompt)).toEqual(CATEGORIES.STYLE);
  });
});
