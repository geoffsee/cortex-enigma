import { useState, useCallback, useEffect } from 'react';
import {
  HISTORY_SCHEMA_VERSION,
  HistoryEnvelopeSchema,
  type HistoryEntry,
} from '../../infrastructure/storageSchema';

const HISTORY_KEY = 'cortex-enigma:prompt-history-v1';
const MAX_ENTRIES = 20;

function loadFromStorage(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const result = HistoryEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return [];
    return result.data.entries;
  } catch {
    return [];
  }
}

function saveToStorage(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({ version: HISTORY_SCHEMA_VERSION, entries }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function usePromptHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(entries);
  }, [entries]);

  const addEntry = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    setEntries(prev => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        timestamp: Date.now(),
      };
      return [entry, ...prev].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, addEntry, clearHistory };
}
