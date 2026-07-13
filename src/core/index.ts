// Public API of the headless prompt-composition package.
//
// The domain (`src/domain`) and application (`src/application`) layers are
// React-free and browser-free. This barrel is their single entry point so the
// exact same logic can be consumed by the browser app and by non-React
// surfaces such as the CLI in `cli/`. Consumers should import from here rather
// than reaching into individual domain/application modules.

export type { CategoryName, SelectionState } from '../domain/types';
export { CATEGORY_NAMES, EMPTY_SELECTIONS } from '../domain/types';

export { CATEGORIES, CATEGORY_TOOLTIPS } from '../domain/categories';

export { buildPrompt } from '../domain/promptBuilder';

export type { DiffSegment } from '../domain/promptDiff';
export { wordBoundaryDiff } from '../domain/promptDiff';

export type { ExpansionIntensity, ExpansionProfile } from '../domain/expansionIntensity';
export {
  EXPANSION_INTENSITY_MIN,
  EXPANSION_INTENSITY_MAX,
  DEFAULT_EXPANSION_INTENSITY,
  EXPANSION_INTENSITY_LABELS,
  clampIntensity,
  expansionProfile,
} from '../domain/expansionIntensity';

export type { RandomizeBias } from '../application/SelectionService';
export { toggle, randomize, clear, validate } from '../application/SelectionService';

export type { ILLMPort } from '../application/ports/ILLMPort';
export type { IStoragePort } from '../application/ports/IStoragePort';
