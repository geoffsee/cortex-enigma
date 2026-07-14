// Namespace import (not `import { z }`): zod 3.25 re-exports `z` as a namespace
// binding, which Vite/Vitest's ESM interop resolves to `undefined`. The star
// import exposes the same builders (`z.object`, `z.enum`, …) reliably.
import * as z from 'zod';
import { CATEGORIES } from '../core';
import { DEFAULT_DIALECT, PROMPT_DIALECTS } from '../domain/promptDialects';
import type { DialectId } from '../domain/promptDialects';

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
  // Optional with a default so v1 configs exported before the negative-prompt
  // layer still import cleanly under the same schema version.
  negative: z.string().default(''),
});

const DIALECT_IDS = PROMPT_DIALECTS.map(d => d.id) as [DialectId, ...DialectId[]];

// Optional with a fallback so permalinks/exports written before the dialect
// layer (or carrying an unknown dialect) still load, defaulting to standard.
const dialectValue = z.enum(DIALECT_IDS).catch(DEFAULT_DIALECT);

export const PersistedEnvelopeSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  selections: SelectionStateSchema,
  dialect: dialectValue,
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

export const INTENSITY_SCHEMA_VERSION = 1;
export const INTENSITY_KEY = 'cortex-enigma:expansion-intensity-v1';

export const IntensityEnvelopeSchema = z.object({
  version: z.literal(INTENSITY_SCHEMA_VERSION),
  intensity: z.number().int().min(0).max(3),
});

export const RANDOMIZE_BIAS_SCHEMA_VERSION = 1;
export const RANDOMIZE_BIAS_KEY = 'cortex-enigma:randomize-bias-v1';

export const RandomizeBiasEnvelopeSchema = z.object({
  version: z.literal(RANDOMIZE_BIAS_SCHEMA_VERSION),
  bias: z.enum(['uniform', 'history']),
});

export const DIALECT_SCHEMA_VERSION = 1;
export const DIALECT_KEY = 'cortex-enigma:prompt-dialect-v1';

export const DialectEnvelopeSchema = z.object({
  version: z.literal(DIALECT_SCHEMA_VERSION),
  dialect: z.string(),
});
