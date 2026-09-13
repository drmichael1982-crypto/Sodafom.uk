import { describe, expect, it } from 'vitest';
import {
  defaultReminderPreferences,
  emptyReminderLedger,
  parseReminderPreferences,
  planReminder,
  type ReminderLedger,
  type ReminderPreferences,
} from '@/lib/reminder-policy';

// Monday 14 September 2026, 16:00 in Europe/London.
const DUE_TIME = new Date('2026-09-14T15:00:00.000Z');

function oneDueLesson(): ReminderPreferences {
  const preferences = defaultReminderPreferences();
  preferences.rules.lessons = { enabled: true, time: '16:00', days: [1] };
  return preferences;
}

describe('parent reminder policy', () => {
  it('starts with every reminder switched off', () => {
    const preferences = defaultReminderPreferences();

    expect(Object.values(preferences.rules).every((rule) => !rule.enabled)).toBe(true);
    expect(preferences.maxPerDay).toBe(2);
  });

  it('rejects unknown values instead of making a malformed setting opt in', () => {
    const invalid = { ...defaultReminderPreferences(), unreviewed: true };

    expect(() => parseReminderPreferences(invalid)).toThrow('Reminder settings are invalid');
  });

  it('does not allow an enabled reminder during quiet time', () => {
    const preferences = oneDueLesson();
    preferences.quietStart = '15:00';

    expect(() => parseReminderPreferences(preferences)).toThrow('quiet hours');
  });

  it('combines due categories but never performs delivery itself', () => {
    const preferences = oneDueLesson();
    preferences.rules.daily = { enabled: true, time: '16:00', days: [1] };

    const plan = planReminder(preferences, emptyReminderLedger(), DUE_TIME);

    expect(plan?.notification.types).toEqual(['lessons', 'daily']);
    expect(plan?.notification.message).toContain('Ready for a little learning?');
    expect(plan?.nextLedger.deliveries).toHaveLength(1);
  });

  it('skips missed times and keeps an hour between any future deliveries', () => {
    const preferences = oneDueLesson();
    const missed = new Date('2026-09-14T15:10:00.000Z');
    const recent: ReminderLedger = {
      deliveries: [{
        id: 'earlier',
        date: '2026-09-14',
        at: DUE_TIME.getTime() - 30 * 60_000,
        types: ['daily'],
        message: 'Earlier reminder',
      }],
      lastAchievementId: null,
    };

    expect(planReminder(preferences, emptyReminderLedger(), missed)).toBeNull();
    expect(planReminder(preferences, recent, DUE_TIME)).toBeNull();
  });
});
