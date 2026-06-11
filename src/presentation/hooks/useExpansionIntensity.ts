import { useState, useCallback, useEffect } from 'react';
import {
  clampIntensity,
  DEFAULT_EXPANSION_INTENSITY,
  type ExpansionIntensity,
} from '../../domain/expansionIntensity';
import {
  INTENSITY_KEY,
  INTENSITY_SCHEMA_VERSION,
  IntensityEnvelopeSchema,
} from '../../infrastructure/storageSchema';

function loadFromStorage(): ExpansionIntensity {
  if (typeof window === 'undefined') return DEFAULT_EXPANSION_INTENSITY;
  try {
    const raw = window.localStorage.getItem(INTENSITY_KEY);
    if (!raw) return DEFAULT_EXPANSION_INTENSITY;
    const result = IntensityEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return DEFAULT_EXPANSION_INTENSITY;
    return clampIntensity(result.data.intensity);
  } catch {
    return DEFAULT_EXPANSION_INTENSITY;
  }
}

function saveToStorage(intensity: ExpansionIntensity): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      INTENSITY_KEY,
      JSON.stringify({ version: INTENSITY_SCHEMA_VERSION, intensity }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function useExpansionIntensity() {
  const [intensity, setIntensityState] = useState<ExpansionIntensity>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(intensity);
  }, [intensity]);

  const setIntensity = useCallback((value: number) => {
    setIntensityState(clampIntensity(value));
  }, []);

  return { intensity, setIntensity };
}
