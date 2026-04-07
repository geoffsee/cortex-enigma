import { CATEGORIES } from '../domain/categories';
import { EMPTY_SELECTIONS } from '../domain/types';
import type { SelectionState } from '../domain/types';

export function toggle(state: SelectionState, category: string, value: string): SelectionState {
  return { ...state, [category]: state[category] === value ? '' : value };
}

export function randomize(): SelectionState {
  const result: SelectionState = { ...EMPTY_SELECTIONS };
  for (const cat of Object.keys(CATEGORIES)) {
    const options = CATEGORIES[cat];
    result[cat] = options[Math.floor(Math.random() * options.length)];
  }
  return result;
}

export function clear(): SelectionState {
  return { ...EMPTY_SELECTIONS };
}

export function validate(raw: unknown): SelectionState {
  const result: SelectionState = { ...EMPTY_SELECTIONS };
  if (!raw || typeof raw !== 'object') return result;
  const parsed = raw as Record<string, unknown>;
  for (const key of Object.keys(EMPTY_SELECTIONS)) {
    const value = parsed[key];
    if (typeof value === 'string') {
      if (key === 'foundation') {
        result[key] = value;
      } else if (value === '' || CATEGORIES[key]?.includes(value)) {
        result[key] = value;
      }
    }
  }
  return result;
}
