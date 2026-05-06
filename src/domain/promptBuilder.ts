import type { SelectionState } from './types';

export function buildPrompt(selections: SelectionState, richContext = ''): string {
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
    richContext ? `DJ rich context: ${richContext}` : '',
  ].filter(Boolean);
  return parts.join(', ');
}
