import type { SelectionState } from '../domain/types';

export function buildDJRichContext(selections: SelectionState): string {
  const activeSelectionCount = Object.entries(selections).filter(
    ([key, value]) => key !== 'foundation' && Boolean(value)
  ).length;
  const foundation = selections.foundation.toLowerCase();
  const energy = scoreBand(activeSelectionCount, 1, 5);
  const engagement = scoreBand(activeSelectionCount + (selections.STYLE ? 1 : 0), 1, 5);
  const riskAppetite = scoreBand(activeSelectionCount + (selections.METHOD ? 1 : 0), 1, 5);
  const dropFatigue = activeSelectionCount >= 6 ? 2 : 1;
  const objective = detectObjective(foundation, activeSelectionCount);
  const transitionIntent =
    objective === 'rain' ? 'rainDrop' : objective === 'peak' ? 'peakMoment' : 'safeContinuation';
  const averageHeat = Math.round((((energy + engagement + scoreBand(activeSelectionCount, 1, 5)) / 3) * 10)) / 10;

  const notes = `medium=${selections.MEDIUM || 'unset'} style=${selections.STYLE || 'unset'} method=${selections.METHOD || 'unset'}`;
  return [
    `DJ objective: ${objective}`,
    `Crowd heat: ${averageHeat}/5`,
    `Risk appetite: ${riskAppetite}/5`,
    `Drop fatigue: ${dropFatigue}/5`,
    objective === 'rain'
      ? 'Transition intent: rainDrop, aggressive build-to-drop phrasing.'
      : 'Transition intent: safeContinuation with harmonic blend.',
    `Set posture: performing`,
    `Signals: ${transitionIntent}, ${notes}`,
  ].join(' | ');
}

function scoreBand(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function detectObjective(foundation: string, activeSelectionCount: number) {
  if (/(rain|drop|festival|banger|club|peak)/.test(foundation)) return 'rain';
  if (activeSelectionCount >= 6) return 'peak';
  if (activeSelectionCount >= 4) return 'build';
  return 'warmup';
}
