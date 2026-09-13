/**
 * Pure, parent-controlled reminder policy.
 *
 * This module deliberately has no browser, storage, network, scheduler, or
 * notification API dependency. It defines the contract a future, separately
 * approved delivery service must satisfy; importing it cannot send anything.
 */
export const REMINDER_TYPES = ['lessons', 'reading', 'homework', 'achievements', 'daily'] as const;

export type ReminderType = typeof REMINDER_TYPES[number];

export interface ReminderRule {
  enabled: boolean;
  time: string;
  days: number[];
}

export interface ReminderPreferences {
  version: 1;
  timeZone: string;
  maxPerDay: 1 | 2;
  quietStart: string;
  quietEnd: string;
  rules: Record<ReminderType, ReminderRule>;
}

export interface ReminderDelivery {
  id: string;
  date: string;
  at: number;
  types: ReminderType[];
  message: string;
}

export interface ReminderLedger {
  deliveries: ReminderDelivery[];
  lastAchievementId: string | null;
}

export const REMINDER_LABELS: Record<ReminderType, string> = {
  lessons: 'Lessons',
  reading: 'Reading',
  homework: 'Homework',
  achievements: 'Achievements',
  daily: 'Daily learning nudges',
};

export const REMINDER_COPY: Record<ReminderType, string> = {
  lessons: 'Ready for a little learning? Choose a lesson together when you feel ready.',
  reading: 'A little story time? Enjoy a page or two together, at your own pace.',
  homework: 'Have some homework? You could try one small step together.',
  achievements: 'There is something new to celebrate. Every little step in learning matters.',
  daily: 'Feeling curious? Explore something you enjoy today. Taking a break is fine too.',
};

const DAY_MS = 86_400_000;

export const REMINDER_GRACE_MINUTES = 10;
export const REMINDER_GAP_MS = 3_600_000;

export function defaultReminderPreferences(): ReminderPreferences {
  return {
    version: 1,
    timeZone: 'Europe/London',
    maxPerDay: 2,
    quietStart: '20:00',
    quietEnd: '08:00',
    rules: Object.fromEntries(REMINDER_TYPES.map((type) => [type, {
      enabled: false,
      time: type === 'reading' ? '18:00' : '16:00',
      days: [1, 2, 3, 4, 5],
    }])) as ReminderPreferences['rules'],
  };
}

export const emptyReminderLedger = (): ReminderLedger => ({ deliveries: [], lastAchievementId: null });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isClock = (value: unknown): value is string =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const minutesAt = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).every((key) => keys.includes(key));
}

/**
 * Strictly parse choices. Invalid or unknown settings never turn a reminder on.
 */
export function parseReminderPreferences(value: unknown): ReminderPreferences {
  if (!isRecord(value) || !hasOnlyKeys(value, ['version', 'timeZone', 'maxPerDay', 'quietStart', 'quietEnd', 'rules']) || value.version !== 1) {
    throw new Error('Reminder settings are invalid. Please reload and try again.');
  }

  if (typeof value.timeZone !== 'string' || value.timeZone.length > 80) {
    throw new Error('Choose a valid time zone.');
  }
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value.timeZone }).format();
  } catch {
    throw new Error('Choose a valid time zone, such as Europe/London.');
  }

  if (value.maxPerDay !== 1 && value.maxPerDay !== 2) {
    throw new Error('Choose a limit of one or two reminders.');
  }
  if (!isClock(value.quietStart) || !isClock(value.quietEnd) || value.quietStart === value.quietEnd) {
    throw new Error('Choose different, valid start and end times for quiet hours.');
  }
  if (!isRecord(value.rules) || !hasOnlyKeys(value.rules, REMINDER_TYPES)) {
    throw new Error('Choose valid reminder types.');
  }

  const rules = {} as ReminderPreferences['rules'];
  for (const type of REMINDER_TYPES) {
    const rule = value.rules[type];
    if (!isRecord(rule) || !hasOnlyKeys(rule, ['enabled', 'time', 'days']) || typeof rule.enabled !== 'boolean' || !isClock(rule.time)) {
      throw new Error(`Check the ${REMINDER_LABELS[type].toLowerCase()} settings.`);
    }
    const minute = minutesAt(rule.time);
    if (minute < 420 || minute >= 1200) {
      throw new Error('Reminder times must be between 07:00 and 19:59.');
    }
    if (!Array.isArray(rule.days) || rule.days.length > 7 || !rule.days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      || new Set(rule.days).size !== rule.days.length || (rule.enabled && rule.days.length === 0)) {
      throw new Error('Choose at least one day for each enabled reminder.');
    }
    if (rule.enabled && isQuiet(minute, value.quietStart, value.quietEnd)) {
      throw new Error(`${REMINDER_LABELS[type]} is set during quiet hours. Choose another time.`);
    }
    rules[type] = { enabled: rule.enabled, time: rule.time, days: [...rule.days] };
  }

  return {
    version: 1,
    timeZone: value.timeZone,
    maxPerDay: value.maxPerDay,
    quietStart: value.quietStart,
    quietEnd: value.quietEnd,
    rules,
  };
}

export function isQuiet(minute: number, start: string, end: string): boolean {
  const startMinute = minutesAt(start);
  const endMinute = minutesAt(end);
  return startMinute > endMinute
    ? minute >= startMinute || minute < endMinute
    : minute >= startMinute && minute < endMinute;
}

export function localReminderTime(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    minute: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Corrupt rate-limit state fails closed rather than resetting counters. */
export function parseReminderLedger(value: unknown): ReminderLedger {
  if (!isRecord(value) || !Array.isArray(value.deliveries) || value.deliveries.length > 10
    || !(value.lastAchievementId === null || typeof value.lastAchievementId === 'string')) {
    throw new Error('Invalid reminder history.');
  }

  for (const event of value.deliveries) {
    if (!isRecord(event) || typeof event.id !== 'string' || typeof event.date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test(event.date) || typeof event.at !== 'number' || !Number.isFinite(event.at)
      || typeof event.message !== 'string' || !Array.isArray(event.types) || event.types.length === 0
      || !event.types.every((type) => REMINDER_TYPES.includes(type as ReminderType))) {
      throw new Error('Invalid reminder history.');
    }
  }

  return value as unknown as ReminderLedger;
}

/**
 * Pure selection contract for a future approved scheduler. The caller must
 * atomically persist `nextLedger` before delivery; this function never delivers.
 */
export function planReminder(
  settings: ReminderPreferences,
  history: ReminderLedger,
  now: Date,
  achievementId: string | null = null,
): { notification: ReminderDelivery; nextLedger: ReminderLedger } | null {
  const preferences = parseReminderPreferences(settings);
  const ledger = parseReminderLedger(history);
  const at = now.getTime();
  if (!Number.isFinite(at)) return null;

  const local = localReminderTime(now, preferences.timeZone);
  if (local.minute < 420 || local.minute >= 1200 || isQuiet(local.minute, preferences.quietStart, preferences.quietEnd)) {
    return null;
  }

  if (ledger.deliveries.some((event) => event.at > at)) return null;
  const recent = ledger.deliveries.filter((event) => at - event.at < 2 * DAY_MS);
  const inLastDay = recent.filter((event) => at - event.at < DAY_MS);
  if (inLastDay.length >= preferences.maxPerDay || recent.some((event) => at - event.at < REMINDER_GAP_MS)) {
    return null;
  }

  const types = REMINDER_TYPES.filter((type) => {
    const rule = preferences.rules[type];
    const age = local.minute - minutesAt(rule.time);
    if (!rule.enabled || !rule.days.includes(local.day) || age < 0 || age >= REMINDER_GRACE_MINUTES) return false;
    if (recent.some((event) => event.date === local.date && event.types.includes(type))) return false;
    return type !== 'achievements' || (!!achievementId && achievementId !== ledger.lastAchievementId);
  });
  if (types.length === 0) return null;

  const notification: ReminderDelivery = {
    id: `${local.date}:${types.join('+')}`,
    date: local.date,
    at,
    types,
    message: types.map((type) => REMINDER_COPY[type]).join(' '),
  };

  return {
    notification,
    nextLedger: {
      deliveries: [...recent, notification],
      lastAchievementId: types.includes('achievements') ? achievementId : ledger.lastAchievementId,
    },
  };
}
