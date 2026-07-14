import { describe, it, expect } from 'vitest';
import { ANALYTICS_EVENTS, emptyCounts } from '../domain/analyticsEvents';
import { capture, purge, normalizeCounts, totalEvents } from './usageSignal';

describe('usage signal gate', () => {
  it('does not increment when consent is unset', () => {
    const before = emptyCounts();
    const after = capture(before, 'unset', ANALYTICS_EVENTS.share);
    expect(after).toBe(before);
    expect(after[ANALYTICS_EVENTS.share]).toBe(0);
  });

  it('does not increment when consent is denied', () => {
    const before = emptyCounts();
    const after = capture(before, 'denied', ANALYTICS_EVENTS.expand);
    expect(after).toBe(before);
    expect(after[ANALYTICS_EVENTS.expand]).toBe(0);
  });

  it('increments only the captured event when consent is granted', () => {
    const after = capture(emptyCounts(), 'granted', ANALYTICS_EVENTS.axisSelect);
    expect(after[ANALYTICS_EVENTS.axisSelect]).toBe(1);
    expect(after[ANALYTICS_EVENTS.expand]).toBe(0);
  });

  it('accumulates repeated captures without mutating the input', () => {
    const first = capture(emptyCounts(), 'granted', ANALYTICS_EVENTS.share);
    const second = capture(first, 'granted', ANALYTICS_EVENTS.share);
    expect(second[ANALYTICS_EVENTS.share]).toBe(2);
    expect(first[ANALYTICS_EVENTS.share]).toBe(1);
  });
});

describe('usage signal purge', () => {
  it('resets every event to zero', () => {
    const populated = capture(emptyCounts(), 'granted', ANALYTICS_EVENTS.randomize);
    const cleared = purge();
    expect(totalEvents(cleared)).toBe(0);
    expect(totalEvents(populated)).toBe(1);
  });
});

describe('normalizeCounts', () => {
  it('seeds every known event and keeps valid values', () => {
    const counts = normalizeCounts({ [ANALYTICS_EVENTS.copyPrompt]: 5 });
    expect(counts[ANALYTICS_EVENTS.copyPrompt]).toBe(5);
    expect(counts[ANALYTICS_EVENTS.share]).toBe(0);
  });

  it('drops keys outside the fixed vocabulary', () => {
    const counts = normalizeCounts({ user_email: 3, [ANALYTICS_EVENTS.expand]: 2 });
    expect(counts).not.toHaveProperty('user_email');
    expect(counts[ANALYTICS_EVENTS.expand]).toBe(2);
  });
});

describe('totalEvents', () => {
  it('sums all event counts', () => {
    let counts = emptyCounts();
    counts = capture(counts, 'granted', ANALYTICS_EVENTS.share);
    counts = capture(counts, 'granted', ANALYTICS_EVENTS.expand);
    expect(totalEvents(counts)).toBe(2);
  });
});
