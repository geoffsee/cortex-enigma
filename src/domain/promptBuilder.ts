import type { SelectionState } from './types';

export function buildPrompt(selections: SelectionState): string {
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
  const positive = parts.join(', ');
  const negative = selections.negative.trim();
  if (!negative) return positive;
  const suffix = `Negative prompt: ${negative}`;
  return positive ? `${positive}\n${suffix}` : suffix;
}
