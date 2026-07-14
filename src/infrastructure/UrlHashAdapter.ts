import type { IStoragePort, SelectionState } from '../core';
import { DEFAULT_DIALECT } from '../domain/promptDialects';
import type { DialectId } from '../domain/promptDialects';
import { SCHEMA_VERSION, PersistedEnvelopeSchema } from './storageSchema';

export interface ShareableConfig {
  selections: SelectionState;
  dialect: DialectId;
}

export class UrlHashAdapter implements IStoragePort {
  // IStoragePort contract: return selections only (shared hydration path with
  // LocalStorageAdapter). Use loadConfig() when the dialect is also needed.
  load(): unknown {
    return this.loadConfig()?.selections ?? null;
  }

  // Full shareable payload, including the target model dialect.
  loadConfig(): ShareableConfig | null {
    if (typeof window === 'undefined') return null;
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return null;
      const result = PersistedEnvelopeSchema.safeParse(JSON.parse(decodeURIComponent(hash)));
      if (!result.success) return null;
      return { selections: result.data.selections, dialect: result.data.dialect };
    } catch {
      return null;
    }
  }

  save(state: SelectionState, dialect: DialectId = DEFAULT_DIALECT): void {
    if (typeof window === 'undefined') return;
    try {
      window.history.replaceState(null, '', `#${this.encode(state, dialect)}`);
    } catch {
      // ignore errors
    }
  }

  // Full absolute URL that hydrates the given selections and dialect when opened.
  buildShareableUrl(state: SelectionState, dialect: DialectId = DEFAULT_DIALECT): string {
    if (typeof window === 'undefined') return '';
    const { origin, pathname, search } = window.location;
    return `${origin}${pathname}${search}#${this.encode(state, dialect)}`;
  }

  private encode(state: SelectionState, dialect: DialectId): string {
    return encodeURIComponent(
      JSON.stringify({ version: SCHEMA_VERSION, selections: state, dialect }),
    );
  }
}
