export type ExpansionIntensity = 0 | 1 | 2 | 3;

export const EXPANSION_INTENSITY_MIN = 0;
export const EXPANSION_INTENSITY_MAX = 3;

// Default matches the shipped pre-dial behavior (full elaboration).
export const DEFAULT_EXPANSION_INTENSITY: ExpansionIntensity = 3;

export const EXPANSION_INTENSITY_LABELS: Record<ExpansionIntensity, string> = {
  0: 'PRESERVE',
  1: 'SUBTLE',
  2: 'MODERATE',
  3: 'ELABORATE',
};

export type ExpansionProfile = {
  maxWords: number;
  maxTokens: number;
};

export function clampIntensity(value: number): ExpansionIntensity {
  if (!Number.isFinite(value)) return DEFAULT_EXPANSION_INTENSITY;
  const rounded = Math.round(value);
  if (rounded <= EXPANSION_INTENSITY_MIN) return 0;
  if (rounded >= EXPANSION_INTENSITY_MAX) return 3;
  return rounded as ExpansionIntensity;
}

// null means preserve: skip LLM expansion entirely (identical to skip mode).
export function expansionProfile(intensity: ExpansionIntensity): ExpansionProfile | null {
  switch (intensity) {
    case 0:
      return null;
    case 1:
      return { maxWords: 5, maxTokens: 12 };
    case 2:
      return { maxWords: 10, maxTokens: 20 };
    case 3:
      return { maxWords: 15, maxTokens: 30 };
  }
}
