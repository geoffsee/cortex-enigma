import type { SelectionState } from "../domain/types";

export const DJ_CATEGORY_LABELS: Record<string, string> = {
  MEDIUM: "Deck A Genre",
  METHOD: "Transition Method",
  SUBJECT: "Crowd Intent",
  STYLE: "Set Objective",
  ELEMENTS: "FX Palette",
  FUNCTION: "Performance Goal",
  CONTEXT: "Venue Context",
  HISTORY: "Reference Era",
};

export type DJTelemetry = {
  objective: string;
  transitionIntent: string;
  crowdHeat: number;
  risk: number;
  dropFatigue: number;
  recommendation: string;
};

export function deriveDJTelemetry(selections: SelectionState): DJTelemetry {
  const activeCount = Object.values(selections).filter(Boolean).length;
  const objective = selections.STYLE || inferObjective(activeCount, selections.foundation);
  const transitionIntent = selections.METHOD || (objective === "rain" ? "quick cut" : "harmonic blend");
  const crowdHeat = clamp(Math.round(((activeCount + (objective === "peak" || objective === "rain" ? 2 : 0)) / 10) * 5), 1, 5);
  const risk = clamp(Math.round(((activeCount + (transitionIntent.includes("cut") ? 2 : 0)) / 10) * 5), 1, 5);
  const dropFatigue = clamp(5 - crowdHeat + (objective === "rain" ? 1 : 0), 1, 5);
  const recommendation =
    objective === "rain"
      ? "Trigger rainDrop transition on next phrase boundary."
      : objective === "peak"
        ? "Stage an energyLift with 16-bar build."
        : "Hold groove and prep harmonic blend.";

  return { objective, transitionIntent, crowdHeat, risk, dropFatigue, recommendation };
}

function inferObjective(activeCount: number, foundation: string) {
  const lower = foundation.toLowerCase();
  if (/(rain|drop|peak|festival)/.test(lower)) return "rain";
  if (activeCount >= 6) return "peak";
  if (activeCount >= 4) return "build";
  return "warmup";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
