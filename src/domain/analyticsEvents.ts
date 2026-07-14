// Anonymous usage-signal event vocabulary. React-free and browser-free so the
// same taxonomy can be referenced by capture code, the consent UI, and tests.
//
// Privacy contract: an event is nothing more than one of the fixed names below.
// No prompt text, selection values, identifiers, or free-form fields are ever
// attached — the signal is a per-name occurrence count and nothing else.

export const ANALYTICS_EVENTS = {
  axisSelect: 'axis_select',
  expand: 'expand',
  share: 'share',
  randomize: 'randomize',
  copyPrompt: 'copy_prompt',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const ANALYTICS_EVENT_NAMES: readonly AnalyticsEvent[] =
  Object.values(ANALYTICS_EVENTS);

export function isAnalyticsEvent(value: string): value is AnalyticsEvent {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(value);
}

export type AnalyticsCounts = Record<AnalyticsEvent, number>;

export function emptyCounts(): AnalyticsCounts {
  return ANALYTICS_EVENT_NAMES.reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {} as AnalyticsCounts);
}

// Human-readable description of each captured event, surfaced verbatim in the
// consent disclosure so the UI copy and the code can never drift apart.
export const ANALYTICS_EVENT_DESCRIPTIONS: Record<AnalyticsEvent, string> = {
  [ANALYTICS_EVENTS.axisSelect]: 'You picked a value on one of the prompt axes.',
  [ANALYTICS_EVENTS.expand]: 'You ran an LLM expansion of the foundation.',
  [ANALYTICS_EVENTS.share]: 'You copied a shareable config link.',
  [ANALYTICS_EVENTS.randomize]: 'You randomized the selections.',
  [ANALYTICS_EVENTS.copyPrompt]: 'You copied the composed prompt.',
};
