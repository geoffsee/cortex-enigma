import { useState, useEffect, useRef } from 'react';
import { EMPTY_SELECTIONS } from '../../domain/types';
import type { SelectionState } from '../../domain/types';
import { toggle, randomize as randomizeSelections, clear, validate } from '../../application/SelectionService';
import { LocalStorageAdapter } from '../../infrastructure/LocalStorageAdapter';
import { UrlHashAdapter } from '../../infrastructure/UrlHashAdapter';

export function useSelections() {
  const storageRef = useRef(new LocalStorageAdapter());
  const urlHashRef = useRef(new UrlHashAdapter());
  const [selections, setSelections] = useState<SelectionState>(() => ({ ...EMPTY_SELECTIONS }));
  const [mounted, setMounted] = useState(false);

  // Hydrate from URL hash first; fall back to localStorage, then defaults.
  useEffect(() => {
    const fromHash = urlHashRef.current.load();
    const state = fromHash !== null
      ? validate(fromHash)
      : validate(storageRef.current.load());
    setSelections(state);
    setMounted(true);
  }, []);

  // Persist to localStorage and URL hash on every change; mounted guard prevents wiping before hydration.
  useEffect(() => {
    if (!mounted) return;
    storageRef.current.save(selections);
    urlHashRef.current.save(selections);
  }, [selections, mounted]);

  const handleSelect = (category: string, value: string) =>
    setSelections(prev => toggle(prev, category, value));

  const handleFoundationChange = (value: string) =>
    setSelections(prev => ({ ...prev, foundation: value }));

  const randomize = () => setSelections(randomizeSelections());

  const clearAll = () => setSelections(clear());

  return { selections, handleSelect, handleFoundationChange, randomize, clearAll, mounted };
}
