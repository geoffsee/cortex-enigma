// Pure, browser-free business rules for the opt-in usage signal. The privacy
// contract lives here so it can be unit-tested in isolation: capture is gated on
// consent, declining/revoking purges stored counts, and untrusted persisted data
// is normalized to the fixed event vocabulary. The React hook (`useAnalytics`)
// is a thin wrapper that adds localStorage persistence and component state.

import {
  ANALYTICS_EVENT_NAMES,
  emptyCounts,
  isAnalyticsEvent,
  type AnalyticsEvent,
  type AnalyticsCounts,
} from '../domain/analyticsEvents';

export type AnalyticsConsent = 'unset' | 'granted' | 'denied';

export const DEFAULT_CONSENT: AnalyticsConsent = 'unset';

// Increment one event's count — but only when consent is 'granted'. Returns the
// unchanged input reference when gated, so callers can detect a no-op and skip
// both re-render and persistence.
export function capture(
  counts: AnalyticsCounts,
  consent: AnalyticsConsent,
  event: AnalyticsEvent,
): AnalyticsCounts {
  if (consent !== 'granted') return counts;
  return { ...counts, [event]: (counts[event] ?? 0) + 1 };
}

// Declining or revoking consent clears everything already captured.
export function purge(): AnalyticsCounts {
  return emptyCounts();
}

// Coerce an untrusted counts record into a fully-seeded AnalyticsCounts,
// dropping any keys outside the fixed event vocabulary.
export function normalizeCounts(raw: Record<string, number>): AnalyticsCounts {
  const base = emptyCounts();
  for (const [name, value] of Object.entries(raw)) {
    if (isAnalyticsEvent(name)) base[name] = value;
  }
  return base;
}

export function totalEvents(counts: AnalyticsCounts): number {
  return ANALYTICS_EVENT_NAMES.reduce((sum, name) => sum + (counts[name] ?? 0), 0);
}
