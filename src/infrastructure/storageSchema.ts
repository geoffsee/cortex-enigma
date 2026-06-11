// Namespace import: zod's `z` named export is a re-exported namespace that the
// Bun-based vitest runtime resolves to undefined; `import * as z` works in both
// the Vite build and tests.
import * as z from 'zod';
import { CATEGORIES } from '../domain/categories';

export const SCHEMA_VERSION = 1;
export const HISTORY_SCHEMA_VERSION = 1;
export const TEMPLATES_SCHEMA_VERSION = 1;
export const MAX_TEMPLATES = 20;
export const TEMPLATES_KEY = 'cortex-enigma:preset-templates-v1';

const categoryValue = (options: string[]) =>
  z.string().refine(v => v === '' || options.includes(v));

export const SelectionStateSchema = z.object({
  MEDIUM: categoryValue(CATEGORIES.MEDIUM),
  METHOD: categoryValue(CATEGORIES.METHOD),
  SUBJECT: categoryValue(CATEGORIES.SUBJECT),
  STYLE: categoryValue(CATEGORIES.STYLE),
  ELEMENTS: categoryValue(CATEGORIES.ELEMENTS),
  FUNCTION: categoryValue(CATEGORIES.FUNCTION),
  CONTEXT: categoryValue(CATEGORIES.CONTEXT),
  HISTORY: categoryValue(CATEGORIES.HISTORY),
  foundation: z.string(),
});

export const PersistedEnvelopeSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  selections: SelectionStateSchema,
});

export const HistoryEntrySchema = z.object({
  id: z.string(),
  prompt: z.string(),
  timestamp: z.number(),
});

export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const HistoryEnvelopeSchema = z.object({
  version: z.literal(HISTORY_SCHEMA_VERSION),
  entries: z.array(HistoryEntrySchema),
});

export const TemplateRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  selections: SelectionStateSchema,
  timestamp: z.number(),
});

export type TemplateRecord = z.infer<typeof TemplateRecordSchema>;

export const TemplatesEnvelopeSchema = z.object({
  version: z.literal(TEMPLATES_SCHEMA_VERSION),
  templates: z.array(TemplateRecordSchema),
});
