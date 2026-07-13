import type { IStoragePort, SelectionState } from '../core';
import { SCHEMA_VERSION, PersistedEnvelopeSchema } from './storageSchema';

export class UrlHashAdapter implements IStoragePort {
  load(): unknown {
    if (typeof window === 'undefined') return null;
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return null;
      const result = PersistedEnvelopeSchema.safeParse(JSON.parse(decodeURIComponent(hash)));
      if (!result.success) return null;
      return result.data.selections;
    } catch {
      return null;
    }
  }

  save(state: SelectionState): void {
    if (typeof window === 'undefined') return;
    try {
      const encoded = encodeURIComponent(
        JSON.stringify({ version: SCHEMA_VERSION, selections: state }),
      );
      window.history.replaceState(null, '', `#${encoded}`);
    } catch {
      // ignore errors
    }
  }
}
