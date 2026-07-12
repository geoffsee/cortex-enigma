import type { SelectionState } from './types';

// The comma-joined positive body, shared by every output dialect.
export function buildPositive(selections: SelectionState): string {
  const parts = [
    selections.foundation,
    selections.MEDIUM,
    selections.SUBJECT,
    selections.STYLE,
    selections.ELEMENTS,
    selections.HISTORY,
    selections.FUNCTION,
    selections.METHOD ? `made via ${selections.METHOD}` : '',
    selections.CONTEXT ? `in a ${selections.CONTEXT} context` : '',
  ].filter(Boolean);
  return parts.join(', ');
}

export function buildPrompt(selections: SelectionState): string {
  const positive = buildPositive(selections);
  const negative = selections.negative.trim();
  if (!negative) return positive;
  const suffix = `Negative prompt: ${negative}`;
  return positive ? `${positive}\n${suffix}` : suffix;
}
