import { describe, it, expect } from 'vitest';
import { buildLineage } from './promptGallery';
import { MAX_LINEAGE_DEPTH, type GalleryEntry } from '../infrastructure/storageSchema';
import { EMPTY_SELECTIONS } from '../domain/types';
import { DEFAULT_DIALECT } from '../domain/promptDialects';

function makeEntry(overrides: Partial<GalleryEntry> = {}): GalleryEntry {
  return {
    id: 'id-1',
    title: 'Misty Harbor',
    author: 'anon',
    timestamp: 0,
    selections: { ...EMPTY_SELECTIONS },
    dialect: DEFAULT_DIALECT,
    lineage: [],
    ...overrides,
  };
}

describe('buildLineage', () => {
  it('returns an empty chain for an original publish (no source)', () => {
    expect(buildLineage(null)).toEqual([]);
  });

  it('records the source as the sole ancestor when it has no lineage', () => {
    const source = makeEntry({ id: 'a', title: 'A', author: 'alice' });
    expect(buildLineage(source)).toEqual([{ id: 'a', title: 'A', author: 'alice' }]);
  });

  it('preserves the full provenance chain across successive remixes', () => {
    const source = makeEntry({
      id: 'b',
      title: 'B',
      author: 'bob',
      lineage: [{ id: 'a', title: 'A', author: 'alice' }],
    });
    expect(buildLineage(source)).toEqual([
      { id: 'a', title: 'A', author: 'alice' },
      { id: 'b', title: 'B', author: 'bob' },
    ]);
  });

  it('caps the chain at MAX_LINEAGE_DEPTH, keeping the most recent ancestors', () => {
    const deep = Array.from({ length: MAX_LINEAGE_DEPTH }, (_, i) => ({
      id: `n${i}`,
      title: `N${i}`,
      author: 'x',
    }));
    const source = makeEntry({ id: 'tail', title: 'Tail', author: 'z', lineage: deep });
    const result = buildLineage(source);
    expect(result).toHaveLength(MAX_LINEAGE_DEPTH);
    expect(result[result.length - 1]).toEqual({ id: 'tail', title: 'Tail', author: 'z' });
    expect(result[0]).toEqual({ id: 'n1', title: 'N1', author: 'x' });
  });
});
