import type { IStoragePort } from '../application/ports/IStoragePort';
import type { SelectionState } from '../domain/types';

const STORAGE_KEY = 'cortex-twister:selections-v2';

export class LocalStorageAdapter implements IStoragePort {
  load(): unknown {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  save(state: SelectionState): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }
}
