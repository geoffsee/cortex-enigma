import { describe, expect, it } from 'vitest';
import { buildDJRichContext } from '../src/application/buildDJRichContext';
import { EMPTY_SELECTIONS } from '../src/domain/types';

function parseContext(output: string): Record<string, string> {
  const parts = output.split(' | ');
  const result: Record<string, string> = {};
  for (const part of parts) {
    const idx = part.indexOf(':');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

describe('buildDJRichContext', () => {
  it('produces a pipe-separated string with the seven expected segments', () => {
    const output = buildDJRichContext(EMPTY_SELECTIONS);
    expect(output.split(' | ')).toHaveLength(7);
  });

  it('reports objective "warmup" for empty selections and empty foundation', () => {
    const parsed = parseContext(buildDJRichContext(EMPTY_SELECTIONS));
    expect(parsed['DJ objective']).toBe('warmup');
  });

  it('reports objective "rain" whenever the foundation contains a trigger keyword', () => {
    for (const word of ['rain', 'drop', 'festival', 'banger', 'club', 'peak']) {
      const parsed = parseContext(
        buildDJRichContext({ ...EMPTY_SELECTIONS, foundation: word }),
      );
      expect(parsed['DJ objective'], `for foundation="${word}"`).toBe('rain');
    }
  });

  it('matches the foundation trigger case-insensitively', () => {
    const parsed = parseContext(
      buildDJRichContext({ ...EMPTY_SELECTIONS, foundation: 'RAIN' }),
    );
    expect(parsed['DJ objective']).toBe('rain');
  });

  it('reports objective "build" when 4-5 categories are active and no rain trigger is set', () => {
    const parsed = parseContext(
      buildDJRichContext({
        ...EMPTY_SELECTIONS,
        foundation: 'sunset',
        MEDIUM: 'tech house',
        SUBJECT: 'hands up',
        STYLE: 'build',
        ELEMENTS: 'sub pressure',
      }),
    );
    expect(parsed['DJ objective']).toBe('build');
  });

  it('reports objective "peak" when 6+ categories are active and no rain trigger is set', () => {
    const parsed = parseContext(
      buildDJRichContext({
        ...EMPTY_SELECTIONS,
        foundation: 'sunset',
        MEDIUM: 'tech house',
        SUBJECT: 'hands up',
        STYLE: 'build',
        ELEMENTS: 'sub pressure',
        FUNCTION: 'push energy',
        HISTORY: 'detroit techno',
      }),
    );
    expect(parsed['DJ objective']).toBe('peak');
  });

  it('uses transition intent "rainDrop" with aggressive phrasing when objective is rain', () => {
    const output = buildDJRichContext({
      ...EMPTY_SELECTIONS,
      foundation: 'rain',
    });
    expect(output).toContain('Transition intent: rainDrop');
    expect(output).toContain('aggressive build-to-drop phrasing');
    expect(parseContext(output)['Signals']).toMatch(/^rainDrop,/);
  });

  it('uses safe continuation transition intent when objective is not rain', () => {
    const output = buildDJRichContext(EMPTY_SELECTIONS);
    expect(output).toContain('Transition intent: safeContinuation with harmonic blend');
    expect(parseContext(output)['Signals']).toMatch(/^safeContinuation,/);
  });

  it('reports drop fatigue of 1 by default and 2 when 6+ categories are active', () => {
    const low = parseContext(buildDJRichContext(EMPTY_SELECTIONS));
    expect(low['Drop fatigue']).toBe('1/5');

    const high = parseContext(
      buildDJRichContext({
        ...EMPTY_SELECTIONS,
        foundation: 'sunset',
        MEDIUM: 'tech house',
        SUBJECT: 'hands up',
        STYLE: 'build',
        ELEMENTS: 'sub pressure',
        FUNCTION: 'push energy',
        HISTORY: 'detroit techno',
      }),
    );
    expect(high['Drop fatigue']).toBe('2/5');
  });

  it('clamps crowd heat and risk appetite within the 1–5 range', () => {
    const parsed = parseContext(buildDJRichContext(EMPTY_SELECTIONS));
    const heat = Number(parsed['Crowd heat'].split('/')[0]);
    const risk = Number(parsed['Risk appetite'].split('/')[0]);
    expect(heat).toBeGreaterThanOrEqual(1);
    expect(heat).toBeLessThanOrEqual(5);
    expect(risk).toBeGreaterThanOrEqual(1);
    expect(risk).toBeLessThanOrEqual(5);
  });

  it('reports "unset" in the Signals notes when MEDIUM / STYLE / METHOD are empty', () => {
    const parsed = parseContext(buildDJRichContext(EMPTY_SELECTIONS));
    expect(parsed['Signals']).toContain('medium=unset');
    expect(parsed['Signals']).toContain('style=unset');
    expect(parsed['Signals']).toContain('method=unset');
  });

  it('echoes selected MEDIUM / STYLE / METHOD values inside Signals', () => {
    const parsed = parseContext(
      buildDJRichContext({
        ...EMPTY_SELECTIONS,
        MEDIUM: 'tech house',
        STYLE: 'peak',
        METHOD: 'harmonic blend',
      }),
    );
    expect(parsed['Signals']).toContain('medium=tech house');
    expect(parsed['Signals']).toContain('style=peak');
    expect(parsed['Signals']).toContain('method=harmonic blend');
  });

  it('always declares set posture as "performing"', () => {
    const parsed = parseContext(buildDJRichContext(EMPTY_SELECTIONS));
    expect(parsed['Set posture']).toBe('performing');
  });
});
