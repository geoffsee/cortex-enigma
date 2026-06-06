import type { IStoragePort } from '../application/ports/IStoragePort';
import type { SelectionState } from '../domain/types';
import {
  SCHEMA_VERSION,
  TEMPLATES_SCHEMA_VERSION,
  PersistedEnvelopeSchema,
  TemplatesEnvelopeSchema,
  type TemplateRecord,
} from './storageSchema';

const STORAGE_KEY = 'cortex-twister:selections-v2';
const TEMPLATES_KEY = 'cortex-enigma:preset-templates-v1';

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

  loadTemplates(): TemplateRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(TEMPLATES_KEY);
      if (!raw) return [];
      const result = TemplatesEnvelopeSchema.safeParse(JSON.parse(raw));
      if (!result.success) return [];
      return result.data.templates;
    } catch {
      return [];
    }
  }

  saveTemplates(templates: TemplateRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        TEMPLATES_KEY,
        JSON.stringify({ version: TEMPLATES_SCHEMA_VERSION, templates }),
      );
    } catch {
      // ignore quota / privacy-mode errors
    }
  }
}
