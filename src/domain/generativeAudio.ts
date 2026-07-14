import { CATEGORIES } from './categories';
import { CATEGORY_NAMES } from './types';
import type { CategoryName, SelectionState } from './types';

// Deterministic mapping from a composition (the eight axes) to the parameters
// of an ambient generative soundscape. Refik Anadol's framing: sound is another
// variable of the same composition, not a decorative afterthought. Kept pure and
// browser-free so it can be unit-tested and reused headlessly; the Web Audio
// realisation lives in infrastructure/WebAudioAdapter.

export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface AudioVoice {
  axis: CategoryName;
  value: string;
  frequency: number;
  waveform: Waveform;
  gain: number;
}

export interface AudioScene {
  voices: AudioVoice[];
  rootFrequency: number;
  filterCutoff: number;
  tempo: number;
  intensity: number;
}

const SEMITONE_RATIO = 2 ** (1 / 12);
const DEFAULT_ROOT = 110; // A2
const PENTATONIC = [0, 3, 5, 7, 10]; // minor-pentatonic semitone offsets

const WAVEFORM_BY_AXIS: Record<CategoryName, Waveform> = {
  MEDIUM: 'sine',
  METHOD: 'triangle',
  SUBJECT: 'sine',
  STYLE: 'sawtooth',
  ELEMENTS: 'triangle',
  FUNCTION: 'square',
  CONTEXT: 'sine',
  HISTORY: 'triangle',
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function valueIndex(axis: CategoryName, value: string): number {
  return CATEGORIES[axis].indexOf(value);
}

// HISTORY sets the tonal centre: older periods sit lower, contemporary higher.
function deriveRoot(selections: SelectionState): number {
  const idx = valueIndex('HISTORY', selections.HISTORY);
  if (idx < 0) return DEFAULT_ROOT;
  const span = CATEGORIES.HISTORY.length - 1;
  const semitones = Math.round((idx / span) * 12) - 6;
  return round2(DEFAULT_ROOT * SEMITONE_RATIO ** semitones);
}

// ELEMENTS steers timbre brightness via the low-pass cutoff.
function deriveCutoff(selections: SelectionState): number {
  const idx = valueIndex('ELEMENTS', selections.ELEMENTS);
  if (idx < 0) return 2200;
  const span = CATEGORIES.ELEMENTS.length - 1;
  return Math.round(600 + (idx / span) * 5400);
}

// METHOD (falling back to FUNCTION) sets the amplitude pulse in BPM.
function deriveTempo(selections: SelectionState): number {
  const methodIdx = valueIndex('METHOD', selections.METHOD);
  const functionIdx = valueIndex('FUNCTION', selections.FUNCTION);
  const idx = methodIdx >= 0 ? methodIdx : functionIdx;
  if (idx < 0) return 90;
  return 60 + idx * 8;
}

export function deriveAudioScene(selections: SelectionState): AudioScene {
  const rootFrequency = deriveRoot(selections);
  const filterCutoff = deriveCutoff(selections);
  const tempo = deriveTempo(selections);

  const voices: AudioVoice[] = [];
  CATEGORY_NAMES.forEach((axis, axisPos) => {
    const value = selections[axis];
    if (!value) return;
    const idx = Math.max(0, valueIndex(axis, value));
    const step = PENTATONIC[idx % PENTATONIC.length];
    const octave = 12 * Math.floor(idx / PENTATONIC.length);
    const frequency = round2(rootFrequency * SEMITONE_RATIO ** (step + octave + axisPos));
    voices.push({
      axis,
      value,
      frequency,
      waveform: WAVEFORM_BY_AXIS[axis],
      gain: round2(0.16 - axisPos * 0.008),
    });
  });

  const intensity = round2(voices.length / CATEGORY_NAMES.length);
  return { voices, rootFrequency, filterCutoff, tempo, intensity };
}
