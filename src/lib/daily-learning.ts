/** Read-only daily learning projections. Never award stars or write activity sessions. */
export type LearningKind = 'lesson' | 'reading' | 'game' | 'activity';
export type LearningAge = '5-7' | '8-10' | '11-13';
export interface LearningChild { id: number; name: string; ageGroup: LearningAge | null; totalStars: number }
export interface LearningActivity {
  id: number;
  childId: number;
  title: string;
  kind: LearningKind;
  completedAt: string;
  stars: number;
}
export interface DailyHistory { child: LearningChild; activities: LearningActivity[]; partial: boolean }
export const DAILY_PAGE_SIZE = 100;
export const DAILY_MAX_PAGES = 20;
export const ACHIEVEMENTS = [
  { id: 'first-step', title: 'First step', description: 'Complete one saved activity.' },
  { id: 'reading-friend', title: 'Reading friend', description: 'Complete five saved reading activities.' },
  { id: 'star-collector', title: 'Star collector', description: 'Collect 25 saved stars, at your own pace.' },
] as const;
export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];
export interface LearningKeepsake { version: 1; bestStreak: number; earned: AchievementId[] }
const ACHIEVEMENT_IDS = new Set<string>(ACHIEVEMENTS.map(item => item.id));

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function positiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function count(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export function selectedChildId(storage: Pick<Storage, 'getItem'>): number | null {
  try {
    const raw: unknown = JSON.parse(storage.getItem('sodafom_active_child') || 'null');
    return record(raw) && positiveId(raw.id) ? raw.id : null;
  } catch { return null; }
}

/** The existing activity feed records games; explicit lesson/homework prefixes stay separate. */
export function activityKind(activityId: string, subject: string): LearningKind {
  const id = activityId.trim().toLowerCase();
  if (/^(homework|scan-homework)(?:[-:/]|$)/.test(id)) return 'activity';
  if (subject.trim().toLowerCase() === 'reading' || /^(reading|book)(?:[-:/]|$)/.test(id)) return 'reading';
  if (/^(lesson|tutor)(?:[-:/]|$)/.test(id)) return 'lesson';
  return 'game';
}

export function normaliseActivity(value: unknown, childId: number): LearningActivity | null {
  if (!record(value) || !positiveId(value.id) || value.childId !== childId) return null;
  if (typeof value.activityId !== 'string' || !value.activityId.trim() || typeof value.subject !== 'string') return null;
  // Database Dates arrive as ISO timestamps. Reject undated, ambiguous and impossible dates.
  if (typeof value.completedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value.completedAt)) return null;
  const timestamp = Date.parse(value.completedAt);
  if (!Number.isFinite(timestamp)) return null;
  const datePart = value.completedAt.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (year < 2000 || calendar.toISOString().slice(0, 10) !== datePart) return null;
  const title = typeof value.activityTitle === 'string' ? value.activityTitle.trim().slice(0, 160) : '';
  return {
    id: value.id, childId, title: title || 'Learning activity',
    kind: activityKind(value.activityId, value.subject),
    completedAt: new Date(timestamp).toISOString(), stars: Math.min(3, count(value.starsEarned)),
  };
}

function parsePage(value: unknown, childId: number) {
  if (!record(value) || !record(value.child) || value.child.id !== childId || !Array.isArray(value.recent) || value.recent.length > DAILY_PAGE_SIZE) {
    throw new Error('Daily progress returned an unexpected response. Please try again.');
  }
  const child = value.child;
  if (typeof child.name !== 'string' || !child.name.trim() || !Number.isSafeInteger(child.totalStars) || (child.totalStars as number) < 0) {
    throw new Error('Your saved profile could not be read. Please try again.');
  }
  const age = typeof child.ageGroup === 'string' ? child.ageGroup.replace('–', '-').trim() : '';
  if (value.nextCursor !== null && !positiveId(value.nextCursor)) throw new Error('Daily progress could not be read safely.');
  const profile: LearningChild = {
    id: childId, name: child.name.trim().slice(0, 80), totalStars: child.totalStars as number,
    ageGroup: age === '5-7' || age === '8-10' || age === '11-13' ? age : null,
  };
  return { child: profile, rows: value.recent, nextCursor: value.nextCursor as number | null };
}

/** Bounded, cursor-paginated history. No POST, rewards, AI, analytics or completion side effects. */
export async function loadDailyHistory(
  apiPrefix: string, childId: number, signal: AbortSignal, fetcher: typeof fetch = fetch,
): Promise<DailyHistory> {
  if (!positiveId(childId)) throw new Error('Choose a saved child profile first.');
  let cursor: number | null = null;
  let child: LearningChild | null = null;
  const unique = new Map<number, LearningActivity>();
  for (let page = 0; page < DAILY_MAX_PAGES; page++) {
    signal.throwIfAborted();
    const query = cursor === null ? 'view=daily' : `view=daily&beforeId=${cursor}`;
    const response = await fetcher(`${apiPrefix}/children/${childId}/progress?${query}`, {
      method: 'GET', credentials: 'include', cache: 'no-store', signal,
    });
    if (response.status === 401) throw new Error('Ask a grown-up to sign in again to see saved progress.');
    if (response.status === 403 || response.status === 404) throw new Error('Ask a grown-up to select a child profile belonging to this account.');
    if (!response.ok) throw new Error('Saved progress is unavailable right now. Nothing has been lost.');
    const data = parsePage(await response.json(), childId);
    signal.throwIfAborted();
    child ??= data.child;
    for (const row of data.rows) {
      const activity = normaliseActivity(row, childId);
      if (activity) unique.set(activity.id, activity);
    }
    if (data.nextCursor === null) return { child, activities: [...unique.values()], partial: false };
    if ((cursor !== null && data.nextCursor >= cursor) || data.rows.length === 0) throw new Error('Daily progress could not be read safely.');
    cursor = data.nextCursor;
  }
  return { child: child!, activities: [...unique.values()], partial: true };
}

/** Local calendar dates, not UTC slices: midnight and daylight-saving changes stay correct. */
export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function dayNumber(day: string): number {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date) / 86400000;
}
export function bestLearningStreak(days: string[]): number {
  const ordered = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);
  let best = 0, run = 0, previous = -Infinity;
  for (const day of ordered) {
    run = day === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}
export function keepsakeKey(accountId: string, childId: number): string {
  return `sodafom_daily_learning_v1:${encodeURIComponent(accountId)}:${childId}`;
}
export function readKeepsake(storage: Pick<Storage, 'getItem'>, key: string): LearningKeepsake {
  const empty: LearningKeepsake = { version: 1, bestStreak: 0, earned: [] };
  try {
    const value: unknown = JSON.parse(storage.getItem(key) || 'null');
    if (!record(value) || value.version !== 1) return empty;
    return {
      version: 1, bestStreak: count(value.bestStreak),
      earned: Array.isArray(value.earned) ? [...new Set(value.earned.filter((id): id is AchievementId => typeof id === 'string' && ACHIEVEMENT_IDS.has(id)))] : [],
    };
  } catch { return empty; }
}
export function mergeKeepsakes(a: LearningKeepsake, b: LearningKeepsake): LearningKeepsake {
  return { version: 1, bestStreak: Math.max(a.bestStreak, b.bestStreak), earned: [...new Set([...a.earned, ...b.earned])] };
}

export function summariseDay(history: DailyHistory, now: Date, saved: LearningKeepsake = { version: 1, bestStreak: 0, earned: [] }) {
  const valid = [...new Map(history.activities.filter(a => a.childId === history.child.id && Date.parse(a.completedAt) <= now.getTime()).map(a => [a.id, a])).values()];
  const todayKey = localDay(now);
  const today = valid.filter(a => localDay(new Date(a.completedAt)) === todayKey).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const days = valid.map(a => localDay(new Date(a.completedAt)));
  const readingCount = valid.filter(a => a.kind === 'reading').length;
  const earned: AchievementId[] = [];
  if (valid.length > 0) earned.push('first-step');
  if (readingCount >= 5) earned.push('reading-friend');
  if (history.child.totalStars >= 25) earned.push('star-collector');
  const keepsake = mergeKeepsakes(saved, { version: 1, bestStreak: bestLearningStreak(days), earned });
  const activeDays = new Set(days);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index, 12);
    return { day: localDay(date), label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }), learned: activeDays.has(localDay(date)) };
  });
  const target = history.child.ageGroup === '5-7' ? 1 : history.child.ageGroup === '11-13' ? 3 : 2;
  return {
    today, todayKey, week, keepsake, target,
    percent: Math.min(100, Math.round(today.length / target * 100)),
    todayStars: today.reduce((total, activity) => total + activity.stars, 0),
    lessons: today.filter(a => a.kind === 'lesson').length,
    reading: today.filter(a => a.kind === 'reading').length,
    games: today.filter(a => a.kind === 'game').length,
  };
}
