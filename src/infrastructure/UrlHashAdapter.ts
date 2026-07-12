import type { IStoragePort } from '../application/ports/IStoragePort';
import type { SelectionState } from '../domain/types';
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
      window.history.replaceState(null, '', `#${this.encode(state)}`);
    } catch {
      // ignore errors
    }
  }

  // Full absolute URL that hydrates the given selections when opened.
  buildShareableUrl(state: SelectionState): string {
    if (typeof window === 'undefined') return '';
    const { origin, pathname, search } = window.location;
    return `${origin}${pathname}${search}#${this.encode(state)}`;
  }

  private encode(state: SelectionState): string {
    return encodeURIComponent(
      JSON.stringify({ version: SCHEMA_VERSION, selections: state }),
    );
  }
}
