import { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectionState } from '../../core';
import type { DialectId } from '../../domain/promptDialects';
import {
  GALLERY_KEY,
  GALLERY_SCHEMA_VERSION,
  GalleryEnvelopeSchema,
  MAX_GALLERY_ENTRIES,
  type GalleryEntry,
} from '../../infrastructure/storageSchema';
import { buildLineage } from '../../application/promptGallery';

function loadFromStorage(): GalleryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    const result = GalleryEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return [];
    return result.data.entries;
  } catch {
    return [];
  }
}

function saveToStorage(entries: GalleryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      GALLERY_KEY,
      JSON.stringify({ version: GALLERY_SCHEMA_VERSION, entries }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export type PublishInput = {
  title: string;
  author: string;
  selections: SelectionState;
  dialect: DialectId;
  source: GalleryEntry | null;
};

export function usePromptGallery() {
  const [entries, setEntries] = useState<GalleryEntry[]>(() => loadFromStorage());
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    saveToStorage(entries);
  }, [entries]);

  const publish = useCallback(({ title, author, selections, dialect, source }: PublishInput) => {
    const now = Date.now();
    const entry: GalleryEntry = {
      id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || 'Untitled',
      author: author.trim() || 'anonymous',
      timestamp: now,
      selections,
      dialect,
      lineage: buildLineage(source),
    };
    setEntries(prev => [entry, ...prev].slice(0, MAX_GALLERY_ENTRIES));
    return entry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  return { entries, publish, deleteEntry };
}
