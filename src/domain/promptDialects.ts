import type { SelectionState } from './types';
import { buildPositive, buildPrompt } from './promptBuilder';

// Alternate output syntaxes for target image models. The default ('standard')
// delegates to buildPrompt so the shipped output path stays byte-identical.
export type DialectId = 'standard' | 'midjourney' | 'natural';

export interface PromptDialect {
  id: DialectId;
  label: string;
  description: string;
}

export const DEFAULT_DIALECT: DialectId = 'standard';

export const PROMPT_DIALECTS: readonly PromptDialect[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Comma-separated tags with a "Negative prompt:" line (Automatic1111 / SD-style).',
  },
  {
    id: 'midjourney',
    label: 'Midjourney',
    description: 'Positive phrase followed by a --no parameter for excluded terms.',
  },
  {
    id: 'natural',
    label: 'Natural language',
    description: 'A prose sentence for description-driven models; negatives listed as things to avoid.',
  },
];

const DIALECT_IDS = new Set<string>(PROMPT_DIALECTS.map(d => d.id));

export function isDialectId(value: string): value is DialectId {
  return DIALECT_IDS.has(value);
}

export function dialectDescription(dialect: DialectId): string {
  return PROMPT_DIALECTS.find(d => d.id === dialect)?.description ?? '';
}

function renderMidjourney(selections: SelectionState): string {
  const positive = buildPositive(selections);
  const negative = selections.negative.trim();
  if (!negative) return positive;
  const exclude = `--no ${negative}`;
  return positive ? `${positive} ${exclude}` : exclude;
}

function renderNatural(selections: SelectionState): string {
  const positive = buildPositive(selections);
  const negative = selections.negative.trim();
  const sentence = positive ? `${positive.charAt(0).toUpperCase()}${positive.slice(1)}.` : '';
  if (!negative) return sentence;
  const avoid = `Avoid ${negative}.`;
  return sentence ? `${sentence} ${avoid}` : avoid;
}

export function renderPrompt(selections: SelectionState, dialect: DialectId): string {
  switch (dialect) {
    case 'standard':
      return buildPrompt(selections);
    case 'midjourney':
      return renderMidjourney(selections);
    case 'natural':
      return renderNatural(selections);
  }
}
