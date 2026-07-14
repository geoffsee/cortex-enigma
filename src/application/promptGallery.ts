import {
  MAX_LINEAGE_DEPTH,
  type GalleryEntry,
  type GalleryLineageEntry,
} from '../infrastructure/storageSchema';

// The provenance chain a *new* entry should carry when it is published as a
// remix of `source`. Attribution is designed in from the start: publishing a
// remix appends the source itself onto the source's own ancestry, so the full
// "who derived this from whom" chain is preserved rather than bolted on later.
// Returns an empty chain for original (non-remixed) publishes.
export function buildLineage(source: GalleryEntry | null): GalleryLineageEntry[] {
  if (!source) return [];
  const chain: GalleryLineageEntry[] = [
    ...source.lineage,
    { id: source.id, title: source.title, author: source.author },
  ];
  return chain.slice(-MAX_LINEAGE_DEPTH);
}
