import type { IStoragePort } from '../application/ports/IStoragePort';
import type { SelectionState } from '../domain/types';
import {
  SCHEMA_VERSION,
  PersistedEnvelopeSchema,
} from './storageSchema';

const STORAGE_KEY = 'cortex-twister:selections-v2';

export class LocalStorageAdapter implements IStoragePort {
  load(): unknown {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const result = PersistedEnvelopeSchema.safeParse(parsed);
      if (result.success) return result.data.selections;
      // legacy bare-object fallback (written before schema versioning)
      return parsed as unknown;
    } catch {
      return null;
    }
  }

  save(state: SelectionState): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: SCHEMA_VERSION, selections: state }),
      );
    } catch {
      // ignore quota / privacy-mode errors
    }
  }

}
