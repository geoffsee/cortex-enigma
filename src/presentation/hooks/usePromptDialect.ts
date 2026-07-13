import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_DIALECT, isDialectId, type DialectId } from '../../domain/promptDialects';
import {
  DIALECT_KEY,
  DIALECT_SCHEMA_VERSION,
  DialectEnvelopeSchema,
} from '../../infrastructure/storageSchema';

function loadFromStorage(): DialectId {
  if (typeof window === 'undefined') return DEFAULT_DIALECT;
  try {
    const raw = window.localStorage.getItem(DIALECT_KEY);
    if (!raw) return DEFAULT_DIALECT;
    const result = DialectEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success || !isDialectId(result.data.dialect)) return DEFAULT_DIALECT;
    return result.data.dialect;
  } catch {
    return DEFAULT_DIALECT;
  }
}

function saveToStorage(dialect: DialectId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      DIALECT_KEY,
      JSON.stringify({ version: DIALECT_SCHEMA_VERSION, dialect }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function usePromptDialect() {
  const [dialect, setDialectState] = useState<DialectId>(DEFAULT_DIALECT);
  const [mounted, setMounted] = useState(false);

  // Hydrate after mount so SSR markup (default dialect) matches the first render;
  // reading storage in the initializer would desync server/client hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount hydration
    setDialectState(loadFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveToStorage(dialect);
  }, [dialect, mounted]);

  const setDialect = useCallback((value: string) => {
    setDialectState(isDialectId(value) ? value : DEFAULT_DIALECT);
  }, []);

  return { dialect, setDialect };
}
