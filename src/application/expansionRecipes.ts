import type { ExpansionIntensity } from '../domain/expansionIntensity';
import type { RandomizeBias } from './SelectionService';

// One-click bundles of the two shipped expansion controls: the
// Expansion-Intensity Dial (#72) and the Persona-Aware Randomize bias (#73).
// A recipe introduces no new state — it just sets both existing values at once.
export type ExpansionRecipe = {
  id: string;
  label: string;
  description: string;
  intensity: ExpansionIntensity;
  bias: RandomizeBias;
};

export const EXPANSION_RECIPES: readonly ExpansionRecipe[] = [
  {
    id: 'faithful',
    label: 'Faithful',
    description: 'Preserve your wording — no expansion, uniform randomize.',
    intensity: 0,
    bias: 'uniform',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Moderate expansion with uniform randomize.',
    intensity: 2,
    bias: 'uniform',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    description: 'Full elaboration with uniform randomize.',
    intensity: 3,
    bias: 'uniform',
  },
  {
    id: 'signature',
    label: 'Signature',
    description: 'Full elaboration biased toward your recent prompt history.',
    intensity: 3,
    bias: 'history',
  },
];

// Returns the recipe whose bundled values match the current controls, or null
// when the user has drifted to a combination no recipe defines. Lets the UI
// highlight the active recipe and makes selection fully reversible: picking a
// different recipe (or nudging either control) simply re-derives the match.
export function matchExpansionRecipe(
  intensity: ExpansionIntensity,
  bias: RandomizeBias,
): ExpansionRecipe | null {
  return EXPANSION_RECIPES.find(r => r.intensity === intensity && r.bias === bias) ?? null;
}
