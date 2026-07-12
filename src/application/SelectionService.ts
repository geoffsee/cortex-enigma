import { CATEGORIES } from '../domain/categories';
import { EMPTY_SELECTIONS } from '../domain/types';
import type { SelectionState } from '../domain/types';

export function toggle(state: SelectionState, category: string, value: string): SelectionState {
  return { ...state, [category]: state[category] === value ? '' : value };
}

export type RandomizeBias = 'uniform' | 'history';

// Each appearance of an option in a recent history prompt adds this much
// weight on top of the base weight of 1 every option always carries.
const HISTORY_BOOST = 3;

function historyWeights(options: readonly string[], historyPrompts: readonly string[]): number[] {
  return options.map(option => {
    const pattern = new RegExp(`\\b${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    let hits = 0;
    for (const prompt of historyPrompts) {
      if (pattern.test(prompt)) hits++;
    }
    return 1 + hits * HISTORY_BOOST;
  });
}

function weightedPick(options: readonly string[], weights: readonly number[], rng: () => number): string {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let threshold = rng() * total;
  for (let i = 0; i < options.length; i++) {
    threshold -= weights[i];
    if (threshold < 0) return options[i];
  }
  return options[options.length - 1];
}

export function randomize(
  currentState: SelectionState = EMPTY_SELECTIONS,
  lockedAxes?: ReadonlySet<string>,
  bias: RandomizeBias = 'uniform',
  historyPrompts: readonly string[] = [],
  rng: () => number = Math.random,
): SelectionState {
  const result: SelectionState = { ...EMPTY_SELECTIONS };
  const useHistory = bias === 'history' && historyPrompts.length > 0;
  for (const cat of Object.keys(CATEGORIES)) {
    if (lockedAxes?.has(cat)) {
      result[cat] = currentState[cat];
    } else {
      const options = CATEGORIES[cat];
      result[cat] = useHistory
        ? weightedPick(options, historyWeights(options, historyPrompts), rng)
        : options[Math.floor(rng() * options.length)];
    }
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
      if (key === 'foundation' || key === 'negative') {
        result[key] = value;
      } else if (value === '' || CATEGORIES[key]?.includes(value)) {
        result[key] = value;
      }
    }
  }
  return result;
}
