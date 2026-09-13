/** Parent-controlled reminders. No AI, marketing, penalties or child data in copy. */
export const REMINDER_TYPES = ['lessons', 'reading', 'homework', 'achievements', 'daily'] as const;
export type ReminderType = typeof REMINDER_TYPES[number];
export interface ReminderRule { enabled: boolean; time: string; days: number[] }
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
  lessons: 'Lessons', reading: 'Reading', homework: 'Homework',
  achievements: 'Achievements', daily: 'Daily learning nudges',
};
export const REMINDER_COPY: Record<ReminderType, string> = {
  lessons: 'Ready for a little learning? Choose a lesson together when you feel ready.',
  reading: 'A little story time? Enjoy a page or two together, at your own pace.',
  homework: 'Have some homework? You could try one small step together.',
  achievements: 'There is something new to celebrate. Every little step in learning matters.',
  daily: 'Feeling curious? Explore something you enjoy today. Taking a break is fine too.',
};
const DAY = 86_400_000;
export const REMINDER_GRACE_MINUTES = 10;
export const REMINDER_GAP_MS = 3_600_000;
export function defaultReminderPreferences(): ReminderPreferences {
  return {
    version: 1, timeZone: 'Europe/London', maxPerDay: 2,
    quietStart: '20:00', quietEnd: '08:00',
    rules: Object.fromEntries(REMINDER_TYPES.map(type => [type, {
      enabled: false, time: type === 'reading' ? '18:00' : '16:00', days: [1, 2, 3, 4, 5],
    }])) as ReminderPreferences['rules'],
  };
}
export const emptyReminderLedger = (): ReminderLedger => ({ deliveries: [], lastAchievementId: null });
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const clock = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const minuteOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
function onlyKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).every(key => keys.includes(key));
}
/** Strict writes; corrupt or unknown stored settings must never become opt-in. */
export function parseReminderPreferences(value: unknown): ReminderPreferences {
  if (!record(value) || !onlyKeys(value, ['version', 'timeZone', 'maxPerDay', 'quietStart', 'quietEnd', 'rules']) || value.version !== 1) {
    throw new Error('Reminder settings are invalid. Please reload and try again.');
  }
  if (typeof value.timeZone !== 'string' || value.timeZone.length > 80) throw new Error('Choose a valid time zone.');
  try { new Intl.DateTimeFormat('en-GB', { timeZone: value.timeZone }).format(); }
  catch { throw new Error('Choose a valid time zone, such as Europe/London.'); }
  if (value.maxPerDay !== 1 && value.maxPerDay !== 2) throw new Error('Choose a limit of one or two reminders.');
  if (!clock(value.quietStart) || !clock(value.quietEnd) || value.quietStart === value.quietEnd) {
    throw new Error('Choose different, valid start and end times for quiet hours.');
  }
  if (!record(value.rules) || !onlyKeys(value.rules, [...REMINDER_TYPES])) throw new Error('Choose valid reminder types.');
  const rules = {} as ReminderPreferences['rules'];
  for (const type of REMINDER_TYPES) {
    const rule = value.rules[type];
    if (!record(rule) || !onlyKeys(rule, ['enabled', 'time', 'days']) || typeof rule.enabled !== 'boolean' || !clock(rule.time)) {
      throw new Error(`Check the ${REMINDER_LABELS[type].toLowerCase()} settings.`);
    }
    const minute = minuteOf(rule.time);
    if (minute < 420 || minute >= 1200) throw new Error('Reminder times must be between 07:00 and 19:59.');
    if (!Array.isArray(rule.days) || rule.days.length > 7 || !rule.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)
        || new Set(rule.days).size !== rule.days.length || (rule.enabled && rule.days.length === 0)) {
      throw new Error('Choose at least one day for each enabled reminder.');
    }
    if (rule.enabled && isQuiet(minute, value.quietStart, value.quietEnd)) {
      throw new Error(`${REMINDER_LABELS[type]} is set during quiet hours. Choose another time.`);
    }
    rules[type] = { enabled: rule.enabled, time: rule.time, days: [...rule.days] as number[] };
  }
  return { version: 1, timeZone: value.timeZone, maxPerDay: value.maxPerDay, quietStart: value.quietStart, quietEnd: value.quietEnd, rules };
}
export function isQuiet(minute: number, start: string, end: string): boolean {
  const a = minuteOf(start), b = minuteOf(end);
  return a > b ? minute >= a || minute < b : minute >= a && minute < b;
}
export function localReminderTime(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    minute: Number(get('hour')) * 60 + Number(get('minute')),
  };
}
/** Corrupt rate-limit state must fail closed, not reset counters and resend. */
export function parseReminderLedger(value: unknown): ReminderLedger {
  if (!record(value) || !Array.isArray(value.deliveries) || value.deliveries.length > 10
      || !(value.lastAchievementId === null || typeof value.lastAchievementId === 'string')) throw new Error('Invalid reminder history.');
  for (const event of value.deliveries) {
    if (!record(event) || typeof event.id !== 'string' || typeof event.date !== 'string'
        || !/^\d{4}-\d{2}-\d{2}$/.test(event.date) || typeof event.at !== 'number' || !Number.isFinite(event.at)
        || typeof event.message !== 'string' || !Array.isArray(event.types) || event.types.length === 0
        || !event.types.every(type => REMINDER_TYPES.includes(type as ReminderType))) throw new Error('Invalid reminder history.');
  }
  return value as unknown as ReminderLedger;
}
/** Pure selection: the server must persist nextLedger atomically BEFORE delivery. */
export function planReminder(
  settings: ReminderPreferences, history: ReminderLedger, now: Date,
  achievementId: string | null = null,
): { notification: ReminderDelivery; nextLedger: ReminderLedger } | null {
  const prefs = parseReminderPreferences(settings);
  const ledger = parseReminderLedger(history);
  const at = now.getTime();
  if (!Number.isFinite(at)) return null;
  const local = localReminderTime(now, prefs.timeZone);
  if (local.minute < 420 || local.minute >= 1200 || isQuiet(local.minute, prefs.quietStart, prefs.quietEnd)) return null;
  // Keep 48 hours: bounds storage and guards timezone/date changes. Future dates fail closed.
  if (ledger.deliveries.some(event => event.at > at)) return null;
  const recent = ledger.deliveries.filter(event => at - event.at < 2 * DAY);
  const lastDay = recent.filter(event => at - event.at < DAY);
  if (lastDay.length >= prefs.maxPerDay || recent.some(event => at - event.at < REMINDER_GAP_MS)) return null;
  const types = REMINDER_TYPES.filter(type => {
    const rule = prefs.rules[type];
    const age = local.minute - minuteOf(rule.time);
    if (!rule.enabled || !rule.days.includes(local.day) || age < 0 || age >= REMINDER_GRACE_MINUTES) return false;
    if (recent.some(event => event.date === local.date && event.types.includes(type))) return false;
    return type !== 'achievements' || !!achievementId && achievementId !== ledger.lastAchievementId;
  });
  if (!types.length) return null;
  const notification: ReminderDelivery = {
    id: `${local.date}:${types.join('+')}`, date: local.date, at, types,
    message: types.map(type => REMINDER_COPY[type]).join(' '),
  };
  return { notification, nextLedger: {
    deliveries: [...recent, notification],
    lastAchievementId: types.includes('achievements') ? achievementId : ledger.lastAchievementId,
  } };
}
