// Namespace import: zod's `z` named export is a re-exported namespace that the
// Bun-based vitest runtime resolves to undefined; `import * as z` works in both
// the Vite build and tests.
import * as z from 'zod';
import { SCHEMA_VERSION, SelectionStateSchema } from './storageSchema';
import manifest from './galleryManifest.json';

export const GalleryEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  selections: SelectionStateSchema,
});

export type GalleryEntry = z.infer<typeof GalleryEntrySchema>;

export const GalleryManifestSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  entries: z.array(GalleryEntrySchema),
});

export function loadGalleryEntries(): GalleryEntry[] {
  const result = GalleryManifestSchema.safeParse(manifest);
  return result.success ? result.data.entries : [];
}
