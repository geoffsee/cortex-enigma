import { useState, useEffect, useCallback, useRef } from 'react';
import { emptyCounts, type AnalyticsEvent, type AnalyticsCounts } from '../../core';
import {
  capture as captureEvent,
  purge,
  normalizeCounts,
  totalEvents as computeTotal,
  DEFAULT_CONSENT,
  type AnalyticsConsent,
} from '../../application/usageSignal';
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_CONSENT_SCHEMA_VERSION,
  AnalyticsConsentEnvelopeSchema,
  ANALYTICS_EVENTS_KEY,
  ANALYTICS_EVENTS_SCHEMA_VERSION,
  AnalyticsEventsEnvelopeSchema,
} from '../../infrastructure/storageSchema';

export type { AnalyticsConsent };

function loadConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const result = AnalyticsConsentEnvelopeSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data.consent : DEFAULT_CONSENT;
  } catch {
    return DEFAULT_CONSENT;
  }
}

function saveConsent(consent: AnalyticsConsent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ANALYTICS_CONSENT_KEY,
      JSON.stringify({ version: ANALYTICS_CONSENT_SCHEMA_VERSION, consent }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function loadCounts(): AnalyticsCounts {
  if (typeof window === 'undefined') return emptyCounts();
  try {
    const raw = window.localStorage.getItem(ANALYTICS_EVENTS_KEY);
    if (!raw) return emptyCounts();
    const result = AnalyticsEventsEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return emptyCounts();
    return normalizeCounts(result.data.counts);
  } catch {
    return emptyCounts();
  }
}

function saveCounts(counts: AnalyticsCounts): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ANALYTICS_EVENTS_KEY,
      JSON.stringify({ version: ANALYTICS_EVENTS_SCHEMA_VERSION, counts }),
    );
  } catch {
    // ignore quota / privacy-mode errors
  }
}

/**
 * Opt-in, anonymous usage signal. Captured events are aggregate per-name counts
 * held on-device only — there is no network transport, so nothing leaves the
 * browser before or after opt-in. Capture is a no-op unless consent is
 * 'granted', which keeps the tool fully functional for users who decline. All
 * gate/purge/increment rules live in `application/usageSignal`; this hook only
 * wires them to React state and localStorage.
 */
export function useAnalytics() {
  const [consent, setConsentState] = useState<AnalyticsConsent>(DEFAULT_CONSENT);
  const [counts, setCounts] = useState<AnalyticsCounts>(emptyCounts);
  const [mounted, setMounted] = useState(false);

  // Mirror consent for the capture callback so it reads the latest value
  // without being recreated (and re-wired into consumers) on every change.
  const consentRef = useRef<AnalyticsConsent>(DEFAULT_CONSENT);

  // Hydrate after mount so SSR markup (no banner, empty counts) matches the
  // first client render before the persisted state is applied.
  useEffect(() => {
    const stored = loadConsent();
    consentRef.current = stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentState(stored);
    setCounts(loadCounts());
    setMounted(true);
  }, []);

  // Persist counts after they commit, never inside a state updater — a discarded
  // or double-invoked updater must not write to localStorage. Gated on `mounted`
  // so the pre-hydration empty state can't clobber stored counts.
  useEffect(() => {
    if (!mounted) return;
    saveCounts(counts);
  }, [counts, mounted]);

  const setConsent = useCallback((next: AnalyticsConsent) => {
    consentRef.current = next;
    setConsentState(next);
    saveConsent(next);
    // Revoking consent purges anything already captured; the effect above then
    // persists the cleared counts.
    if (next !== 'granted') setCounts(purge());
  }, []);

  const capture = useCallback((event: AnalyticsEvent) => {
    setCounts(prev => captureEvent(prev, consentRef.current, event));
  }, []);

  const totalEvents = computeTotal(counts);

  return { consent, setConsent, capture, counts, totalEvents, mounted };
}
