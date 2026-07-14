import { describe, it, expect } from 'vitest';
import { serializeConfig, parseConfig } from './configTransfer';
import { SCHEMA_VERSION } from './storageSchema';
import { DEFAULT_DIALECT } from '../domain/promptDialects';
import { CATEGORIES } from '../domain/categories';
import { EMPTY_SELECTIONS } from '../domain/types';

describe('serializeConfig / parseConfig', () => {
  it('round-trips the selection state through a versioned envelope', () => {
    const selections = {
      ...EMPTY_SELECTIONS,
      MEDIUM: CATEGORIES.MEDIUM[0],
      SUBJECT: CATEGORIES.SUBJECT[0],
      foundation: 'a misty harbor',
    };
    const json = serializeConfig(selections);
    expect(JSON.parse(json).version).toBe(SCHEMA_VERSION);
    const result = parseConfig(json);
    expect(result).toEqual({ ok: true, selections, dialect: DEFAULT_DIALECT });
  });

  it('round-trips the selected dialect through the envelope', () => {
    const selections = { ...EMPTY_SELECTIONS, foundation: 'a misty harbor' };
    const json = serializeConfig(selections, 'midjourney');
    expect(JSON.parse(json).dialect).toBe('midjourney');
    const result = parseConfig(json);
    expect(result).toEqual({ ok: true, selections, dialect: 'midjourney' });
  });

  it('falls back to the default dialect when the envelope omits it (legacy link)', () => {
    const json = JSON.stringify({ version: SCHEMA_VERSION, selections: EMPTY_SELECTIONS });
    const result = parseConfig(json);
    expect(result).toEqual({ ok: true, selections: EMPTY_SELECTIONS, dialect: DEFAULT_DIALECT });
  });

  it('falls back to the default dialect when the stored dialect is unknown', () => {
    const json = JSON.stringify({
      version: SCHEMA_VERSION,
      selections: EMPTY_SELECTIONS,
      dialect: 'dall-e-42',
    });
    const result = parseConfig(json);
    expect(result).toEqual({ ok: true, selections: EMPTY_SELECTIONS, dialect: DEFAULT_DIALECT });
  });

  it('round-trips a negative prompt under the current schema version', () => {
    const selections = {
      ...EMPTY_SELECTIONS,
      foundation: 'a misty harbor',
      negative: 'blurry, text, watermark',
    };
    const result = parseConfig(serializeConfig(selections));
    expect(result).toEqual({ ok: true, selections, dialect: DEFAULT_DIALECT });
  });

  it('imports a v1 config that predates the negative field, defaulting it to empty', () => {
    const legacy = { ...EMPTY_SELECTIONS } as Record<string, unknown>;
    delete legacy.negative;
    const json = JSON.stringify({ version: SCHEMA_VERSION, selections: legacy });
    const result = parseConfig(json);
    expect(result).toEqual({
      ok: true,
      selections: { ...EMPTY_SELECTIONS, negative: '' },
      dialect: DEFAULT_DIALECT,
    });
  });

  it('rejects text that is not JSON', () => {
    const result = parseConfig('not json at all');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/config file/i);
  });

  it('rejects JSON that is not an object', () => {
    expect(parseConfig('42').ok).toBe(false);
    expect(parseConfig('"hello"').ok).toBe(false);
    expect(parseConfig('null').ok).toBe(false);
  });

  it('rejects a payload from a newer schema version with a distinct message', () => {
    const json = JSON.stringify({
      version: SCHEMA_VERSION + 1,
      selections: EMPTY_SELECTIONS,
    });
    const result = parseConfig(json);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/newer version/i);
  });

  it('rejects an envelope missing the version field', () => {
    const result = parseConfig(JSON.stringify({ selections: EMPTY_SELECTIONS }));
    expect(result.ok).toBe(false);
  });

  it('rejects selections with values outside the known categories', () => {
    const json = JSON.stringify({
      version: SCHEMA_VERSION,
      selections: { ...EMPTY_SELECTIONS, MEDIUM: 'NOT_A_REAL_OPTION' },
    });
    expect(parseConfig(json).ok).toBe(false);
  });

  it('rejects an envelope with missing selection keys', () => {
    const json = JSON.stringify({
      version: SCHEMA_VERSION,
      selections: { MEDIUM: '' },
    });
    expect(parseConfig(json).ok).toBe(false);
  });
});
