import { useState, useEffect, useRef } from 'react';
import { EMPTY_SELECTIONS } from '../../domain/types';
import type { SelectionState } from '../../domain/types';
import { toggle, randomize as randomizeSelections, clear, validate } from '../../application/SelectionService';
import { LocalStorageAdapter } from '../../infrastructure/LocalStorageAdapter';

export function useSelections() {
  const storageRef = useRef(new LocalStorageAdapter());
  const [selections, setSelections] = useState<SelectionState>(() => ({ ...EMPTY_SELECTIONS }));
  const [mounted, setMounted] = useState(false);

  // Hydrate from storage on mount; also flags client-only sections as ready.
  useEffect(() => {
    setSelections(validate(storageRef.current.load()));
    setMounted(true);
  }, []);

  // Persist on every change; mounted guard prevents wiping storage before hydration.
  useEffect(() => {
    if (!mounted) return;
    storageRef.current.save(selections);
  }, [selections, mounted]);

  const handleSelect = (category: string, value: string) =>
    setSelections(prev => toggle(prev, category, value));

  const handleFoundationChange = (value: string) =>
    setSelections(prev => ({ ...prev, foundation: value }));

  const randomize = () => setSelections(randomizeSelections());

  const clearAll = () => setSelections(clear());

  return { selections, handleSelect, handleFoundationChange, randomize, clearAll, mounted };
}
