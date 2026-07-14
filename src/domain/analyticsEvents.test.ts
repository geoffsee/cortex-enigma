import { describe, it, expect } from 'vitest';
import {
  ANALYTICS_EVENTS,
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENT_DESCRIPTIONS,
  isAnalyticsEvent,
  emptyCounts,
} from './analyticsEvents';

describe('analytics event vocabulary', () => {
  it('covers the required core actions', () => {
    expect(ANALYTICS_EVENT_NAMES).toContain(ANALYTICS_EVENTS.axisSelect);
    expect(ANALYTICS_EVENT_NAMES).toContain(ANALYTICS_EVENTS.expand);
    expect(ANALYTICS_EVENT_NAMES).toContain(ANALYTICS_EVENTS.share);
  });

  it('has unique event names', () => {
    expect(new Set(ANALYTICS_EVENT_NAMES).size).toBe(ANALYTICS_EVENT_NAMES.length);
  });

  it('uses only snake_case names free of PII-like tokens', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      expect(name).toMatch(/^[a-z_]+$/);
    }
  });

  it('describes every event for the consent disclosure', () => {
    for (const name of ANALYTICS_EVENT_NAMES) {
      expect(ANALYTICS_EVENT_DESCRIPTIONS[name]).toBeTruthy();
    }
  });

  it('recognizes known names and rejects unknown ones', () => {
    expect(isAnalyticsEvent(ANALYTICS_EVENTS.share)).toBe(true);
    expect(isAnalyticsEvent('user_email')).toBe(false);
    expect(isAnalyticsEvent('')).toBe(false);
  });

  it('seeds a zeroed count for every event', () => {
    const counts = emptyCounts();
    expect(Object.keys(counts).sort()).toEqual([...ANALYTICS_EVENT_NAMES].sort());
    for (const name of ANALYTICS_EVENT_NAMES) {
      expect(counts[name]).toBe(0);
    }
  });
});
