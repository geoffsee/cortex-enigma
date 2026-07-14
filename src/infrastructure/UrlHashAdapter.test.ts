// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { UrlHashAdapter } from './UrlHashAdapter';
import { DEFAULT_DIALECT } from '../domain/promptDialects';
import { EMPTY_SELECTIONS } from '../domain/types';

describe('UrlHashAdapter dialect-aware permalinks', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('round-trips selections and dialect through the shareable URL hash', () => {
    const adapter = new UrlHashAdapter();
    const selections = { ...EMPTY_SELECTIONS, foundation: 'a neon skyline' };

    const url = adapter.buildShareableUrl(selections, 'midjourney');
    window.location.hash = new URL(url).hash;

    expect(adapter.loadConfig()).toEqual({ selections, dialect: 'midjourney' });
  });

  it('persists the dialect via save() and reloads it', () => {
    const adapter = new UrlHashAdapter();
    const selections = { ...EMPTY_SELECTIONS, foundation: 'a quiet forest' };

    adapter.save(selections, 'natural');

    expect(adapter.loadConfig()).toEqual({ selections, dialect: 'natural' });
  });

  it('defaults the dialect when an existing link carries no dialect', () => {
    const adapter = new UrlHashAdapter();
    const legacyHash = encodeURIComponent(
      JSON.stringify({ version: 1, selections: EMPTY_SELECTIONS }),
    );
    window.location.hash = `#${legacyHash}`;

    expect(adapter.loadConfig()).toEqual({
      selections: EMPTY_SELECTIONS,
      dialect: DEFAULT_DIALECT,
    });
  });

  it('returns only selections through the IStoragePort load() contract', () => {
    const adapter = new UrlHashAdapter();
    const selections = { ...EMPTY_SELECTIONS, foundation: 'a still life' };
    adapter.save(selections, 'midjourney');

    expect(adapter.load()).toEqual(selections);
  });
});
