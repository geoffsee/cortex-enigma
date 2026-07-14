import type { SelectionState } from '../core';
import { DEFAULT_DIALECT } from '../domain/promptDialects';
import type { DialectId } from '../domain/promptDialects';
import { SCHEMA_VERSION, PersistedEnvelopeSchema } from './storageSchema';

export const EXPORT_FILENAME = 'cortex-enigma-config.json';

export function serializeConfig(
  selections: SelectionState,
  dialect: DialectId = DEFAULT_DIALECT,
): string {
  return JSON.stringify({ version: SCHEMA_VERSION, selections, dialect }, null, 2);
}

export type ImportResult =
  | { ok: true; selections: SelectionState; dialect: DialectId }
  | { ok: false; error: string };

export function parseConfig(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error:
        "That doesn't look like a config file. Make sure you selected or pasted the entire exported file.",
    };
  }
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: "This file isn't a Cortex Enigma config." };
  }
  const version = (raw as Record<string, unknown>).version;
  if (typeof version === 'number' && version > SCHEMA_VERSION) {
    return {
      ok: false,
      error:
        'This config was exported by a newer version of Cortex Enigma and can\'t be imported here. Refresh the page to update, then try again.',
    };
  }
  const result = PersistedEnvelopeSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      error:
        "This file isn't a valid Cortex Enigma config. It may be incomplete, edited, or from a different app.",
    };
  }
  return { ok: true, selections: result.data.selections, dialect: result.data.dialect };
}
