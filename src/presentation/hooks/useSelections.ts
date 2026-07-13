import { useState, useEffect, useRef } from 'react';
import { EMPTY_SELECTIONS } from '../../core';
import type { SelectionState } from '../../core';
import { toggle, randomize as randomizeSelections, clear, validate } from '../../core';
import type { RandomizeBias } from '../../core';
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
  // NOTE: when a shared URL is opened, the hash state is immediately persisted to localStorage,
  // replacing whatever the recipient had saved — intentional for simplicity.
  useEffect(() => {
    if (!mounted) return;
    storageRef.current.save(selections);
    urlHashRef.current.save(selections);
  }, [selections, mounted]);

  const handleSelect = (category: string, value: string) =>
    setSelections(prev => toggle(prev, category, value));

  const handleFoundationChange = (value: string) =>
    setSelections(prev => ({ ...prev, foundation: value }));

  const handleNegativeChange = (value: string) =>
    setSelections(prev => ({ ...prev, negative: value }));

  const randomize = (lockedAxes?: ReadonlySet<string>, bias?: RandomizeBias, historyPrompts?: readonly string[]) =>
    setSelections(prev => randomizeSelections(prev, lockedAxes, bias, historyPrompts));

  const clearAll = () => setSelections(clear());

  const applySelections = (state: SelectionState) =>
    setSelections(validate(state));

  const getShareableUrl = () => urlHashRef.current.buildShareableUrl(selections);

  return { selections, handleSelect, handleFoundationChange, handleNegativeChange, randomize, clearAll, applySelections, getShareableUrl, mounted };
}
