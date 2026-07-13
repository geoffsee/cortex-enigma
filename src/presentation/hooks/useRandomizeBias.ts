import { useState, useEffect } from 'react';
import type { RandomizeBias } from '../../application/SelectionService';
import {
  RANDOMIZE_BIAS_KEY,
  RANDOMIZE_BIAS_SCHEMA_VERSION,
  RandomizeBiasEnvelopeSchema,
} from '../../infrastructure/storageSchema';

const DEFAULT_RANDOMIZE_BIAS: RandomizeBias = 'uniform';

function loadFromStorage(): RandomizeBias {
  if (typeof window === 'undefined') return DEFAULT_RANDOMIZE_BIAS;
  try {
    const raw = window.localStorage.getItem(RANDOMIZE_BIAS_KEY);
    if (!raw) return DEFAULT_RANDOMIZE_BIAS;
    const result = RandomizeBiasEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return DEFAULT_RANDOMIZE_BIAS;
    return result.data.bias;
  } catch {
    return DEFAULT_RANDOMIZE_BIAS;
  }
}

function saveToStorage(bias: RandomizeBias): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      RANDOMIZE_BIAS_KEY,
      JSON.stringify({ version: RANDOMIZE_BIAS_SCHEMA_VERSION, bias }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function useRandomizeBias() {
  const [randomizeBias, setRandomizeBiasState] = useState<RandomizeBias>(DEFAULT_RANDOMIZE_BIAS);
  const [mounted, setMounted] = useState(false);

  // Hydrate from storage after mount so SSR markup (default bias) matches the first render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRandomizeBiasState(loadFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveToStorage(randomizeBias);
  }, [randomizeBias, mounted]);

  return { randomizeBias, setRandomizeBias: setRandomizeBiasState };
}
