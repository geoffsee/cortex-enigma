import { describe, it, expect } from 'vitest';
import { deriveAudioScene } from './generativeAudio';
import { EMPTY_SELECTIONS } from './types';

describe('deriveAudioScene', () => {
  it('produces no voices and neutral defaults for an empty composition', () => {
    const scene = deriveAudioScene(EMPTY_SELECTIONS);
    expect(scene.voices).toEqual([]);
    expect(scene.intensity).toBe(0);
    expect(scene.rootFrequency).toBe(110);
    expect(scene.filterCutoff).toBe(2200);
    expect(scene.tempo).toBe(90);
  });

  it('emits one voice per active axis', () => {
    const scene = deriveAudioScene({
      ...EMPTY_SELECTIONS,
      MEDIUM: 'painting',
      STYLE: 'surreal',
      HISTORY: 'modern',
    });
    expect(scene.voices.map(v => v.axis)).toEqual(['MEDIUM', 'STYLE', 'HISTORY']);
    expect(scene.intensity).toBe(round2(3 / 8));
  });

  it('is deterministic — identical selections yield identical scenes', () => {
    const selections = { ...EMPTY_SELECTIONS, MEDIUM: 'sculpture', ELEMENTS: 'atmospheric' };
    expect(deriveAudioScene(selections)).toEqual(deriveAudioScene(selections));
  });

  it('keeps every voice gain positive and audible', () => {
    const full = {
      ...EMPTY_SELECTIONS,
      MEDIUM: 'hybrid',
      METHOD: 'project',
      SUBJECT: 'society',
      STYLE: 'surreal',
      ELEMENTS: 'planar',
      FUNCTION: 'critical',
      CONTEXT: 'environmental',
      HISTORY: 'contemporary',
    };
    const scene = deriveAudioScene(full);
    expect(scene.voices).toHaveLength(8);
    for (const voice of scene.voices) {
      expect(voice.gain).toBeGreaterThan(0);
      expect(voice.frequency).toBeGreaterThan(0);
    }
  });

  it('lowers the root for older periods and raises it for newer ones', () => {
    const ancient = deriveAudioScene({ ...EMPTY_SELECTIONS, HISTORY: 'prehistoric' });
    const modern = deriveAudioScene({ ...EMPTY_SELECTIONS, HISTORY: 'contemporary' });
    expect(ancient.rootFrequency).toBeLessThan(110);
    expect(modern.rootFrequency).toBeGreaterThan(110);
  });

  it('brightens the cutoff as ELEMENTS moves toward hard-edged values', () => {
    const soft = deriveAudioScene({ ...EMPTY_SELECTIONS, ELEMENTS: 'geometric' });
    const airy = deriveAudioScene({ ...EMPTY_SELECTIONS, ELEMENTS: 'planar' });
    expect(airy.filterCutoff).toBeGreaterThan(soft.filterCutoff);
  });
});

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
