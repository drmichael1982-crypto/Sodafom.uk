import { describe, expect, it } from 'vitest';
import {
  beforeIdFromQuery,
  childIdFromDailyParam,
  isDailyProgressView,
} from './daily-progress-query';

describe('daily progress query validation', () => {
  it('requires the exact opt-in daily view', () => {
    expect(isDailyProgressView('daily')).toBe(true);
    expect(isDailyProgressView(['daily'])).toBe(false);
    expect(isDailyProgressView('summary')).toBe(false);
  });

  it('accepts only positive, bounded child identifiers', () => {
    expect(childIdFromDailyParam('4')).toBe(4);
    expect(childIdFromDailyParam('0')).toBeNull();
    expect(childIdFromDailyParam('4x')).toBeNull();
    expect(childIdFromDailyParam(['4', '5'])).toBeNull();
    expect(childIdFromDailyParam(['4'])).toBeNull();
  });

  it('keeps omitted cursors distinct from invalid cursors', () => {
    expect(beforeIdFromQuery(undefined)).toBeUndefined();
    expect(beforeIdFromQuery('120')).toBe(120);
    expect(beforeIdFromQuery('0')).toBeNull();
    expect(beforeIdFromQuery(['120'])).toBeNull();
  });
});
