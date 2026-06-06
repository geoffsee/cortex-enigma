import { useState, useCallback, useEffect } from 'react';
import type { SelectionState } from '../../domain/types';
import {
  TEMPLATES_SCHEMA_VERSION,
  TemplatesEnvelopeSchema,
  MAX_TEMPLATES,
  type TemplateRecord,
} from '../../infrastructure/storageSchema';

const TEMPLATES_KEY = 'cortex-enigma:preset-templates-v1';

function loadFromStorage(): TemplateRecord[] {
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

function saveToStorage(templates: TemplateRecord[]): void {
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

export function usePresetTemplates() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(templates);
  }, [templates]);

  const saveTemplate = useCallback((name: string, selections: SelectionState) => {
    const now = Date.now();
    const record: TemplateRecord = {
      id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'Untitled',
      selections,
      timestamp: now,
    };
    setTemplates(prev => [record, ...prev].slice(0, MAX_TEMPLATES));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  return { templates, saveTemplate, deleteTemplate };
}
