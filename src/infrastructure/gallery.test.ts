import { describe, it, expect } from 'vitest';
import { loadGalleryEntries, GalleryManifestSchema } from './gallery';
import { SelectionStateSchema, SCHEMA_VERSION } from './storageSchema';
import { EMPTY_SELECTIONS } from '../domain/types';

describe('loadGalleryEntries', () => {
  it('returns a non-empty list of curated entries from the manifest', () => {
    expect(loadGalleryEntries().length).toBeGreaterThan(0);
  });

  it('produces entries whose selections satisfy the shared selection-state schema', () => {
    for (const entry of loadGalleryEntries()) {
      expect(SelectionStateSchema.safeParse(entry.selections).success).toBe(true);
    }
  });

  it('has unique entry ids', () => {
    const ids = loadGalleryEntries().map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('GalleryManifestSchema', () => {
  it('rejects a manifest with a mismatched schema version', () => {
    const result = GalleryManifestSchema.safeParse({
      version: SCHEMA_VERSION + 1,
      entries: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects entries with selections outside the known categories', () => {
    const result = GalleryManifestSchema.safeParse({
      version: SCHEMA_VERSION,
      entries: [
        {
          id: 'bad',
          title: 'Bad',
          description: '',
          selections: { ...EMPTY_SELECTIONS, MEDIUM: 'NOT_A_REAL_OPTION' },
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
