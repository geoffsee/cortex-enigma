import { z } from 'zod';
import { CATEGORIES } from '../domain/categories';

export const SCHEMA_VERSION = 1;
export const HISTORY_SCHEMA_VERSION = 1;

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
