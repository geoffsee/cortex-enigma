import { CATEGORIES } from './categories';
import { buildPrompt } from './promptBuilder';
import type { CategoryName, SelectionState } from './types';

export type SweepColumn = {
  value: string;
  prompt: string;
};

// Emit one prompt per value of the chosen axis, holding all other selections fixed.
export function buildAxisSweep(selections: SelectionState, axis: CategoryName): SweepColumn[] {
  const values = CATEGORIES[axis] ?? [];
  return values.map(value => ({
    value,
    prompt: buildPrompt({ ...selections, [axis]: value }),
  }));
}
