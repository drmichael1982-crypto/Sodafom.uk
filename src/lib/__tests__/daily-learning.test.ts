import { describe, expect, it, vi } from 'vitest';
import {
  activityKind,
  bestLearningStreak,
  keepsakeKey,
  loadDailyHistory,
  mergeKeepsakes,
  normaliseActivity,
  readKeepsake,
  selectedChildId,
  summariseDay,
  type LearningChild,
} from '../daily-learning';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function response(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

function activity(id: number, childId: number, completedAt: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    childId,
    activityId: 'game-number-pop',
    activityTitle: `Activity ${id}`,
    subject: 'maths',
    completedAt,
    starsEarned: 2,
    ...overrides,
  };
}

const child: LearningChild = { id: 4, name: 'Learner', ageGroup: '5-7', totalStars: 25 };

describe('daily learning read-only model', () => {
  it('uses only a valid selected child ID and account/child-scoped keepsake keys', () => {
    const storage = new MemoryStorage();
    storage.setItem('sodafom_active_child', JSON.stringify({ id: 4 }));
    expect(selectedChildId(storage)).toBe(4);
    storage.setItem('sodafom_active_child', JSON.stringify({ id: 0 }));
    expect(selectedChildId(storage)).toBeNull();

    expect(keepsakeKey('account-a', 4)).not.toBe(keepsakeKey('account-b', 4));
    expect(keepsakeKey('account-a', 4)).not.toBe(keepsakeKey('account-a', 5));
  });

  it('classifies saved activities without treating homework as a game', () => {
    expect(activityKind('lesson-maths', 'maths')).toBe('lesson');
    expect(activityKind('book-story', 'maths')).toBe('reading');
    expect(activityKind('anything', 'reading')).toBe('reading');
    expect(activityKind('homework-scan', 'maths')).toBe('activity');
    expect(activityKind('number-pop', 'maths')).toBe('game');
  });

  it('normalises only same-child, dated saved activity rows', () => {
    const timestamp = '2026-09-13T09:30:00.000Z';
    expect(normaliseActivity(activity(9, 4, timestamp, { activityTitle: '  Number Pop  ' }), 4)).toMatchObject({
      id: 9,
      childId: 4,
      title: 'Number Pop',
      kind: 'game',
      stars: 2,
    });
    expect(normaliseActivity(activity(9, 5, timestamp), 4)).toBeNull();
    expect(normaliseActivity(activity(9, 4, 'not-a-date'), 4)).toBeNull();
    expect(normaliseActivity(activity(9, 4, timestamp, { starsEarned: 99 }), 4)).toMatchObject({ stars: 3 });
  });

  it('retains only safe, non-expiring local keepsakes', () => {
    const storage = new MemoryStorage();
    storage.setItem('keep', JSON.stringify({ version: 1, bestStreak: 3, earned: ['first-step', 'wrong-id', 'first-step'] }));
    expect(readKeepsake(storage, 'keep')).toEqual({ version: 1, bestStreak: 3, earned: ['first-step'] });
    expect(mergeKeepsakes(
      { version: 1, bestStreak: 7, earned: ['first-step'] },
      { version: 1, bestStreak: 2, earned: ['reading-friend'] },
    )).toEqual({ version: 1, bestStreak: 7, earned: ['first-step', 'reading-friend'] });
  });

  it('calculates best streaks from local calendar-day strings without penalties', () => {
    expect(bestLearningStreak(['2026-03-28', '2026-03-29', '2026-03-30', '2026-04-02', '2026-04-02'])).toBe(3);
    expect(bestLearningStreak([])).toBe(0);
  });

  it('summarises only the selected child’s past/current activities and keeps goals optional', () => {
    const now = new Date(2026, 8, 13, 12, 0, 0);
    const history = {
      child,
      partial: false,
      activities: [
        { id: 1, childId: 4, title: 'Reading', kind: 'reading' as const, completedAt: new Date(2026, 8, 13, 9).toISOString(), stars: 0 },
        { id: 2, childId: 4, title: 'Future game', kind: 'game' as const, completedAt: new Date(2026, 8, 14, 9).toISOString(), stars: 3 },
        { id: 3, childId: 5, title: 'Other learner', kind: 'game' as const, completedAt: new Date(2026, 8, 13, 8).toISOString(), stars: 3 },
      ],
    };

    const summary = summariseDay(history, now, { version: 1, bestStreak: 9, earned: [] });
    expect(summary.today).toHaveLength(1);
    expect(summary.todayStars).toBe(0);
    expect(summary.target).toBe(1);
    expect(summary.percent).toBe(100);
    expect(summary.keepsake.bestStreak).toBe(9);
    expect(summary.keepsake.earned).toEqual(expect.arrayContaining(['first-step', 'star-collector']));
  });

  it('loads bounded, paginated, deduplicated history with no-store requests', async () => {
    const fetcherMock = vi.fn(async (url: RequestInfo | URL) => {
      if (String(url).includes('beforeId=2')) {
        return response({
          child,
          recent: [activity(2, 4, '2026-09-13T09:00:00Z'), activity(1, 4, '2026-09-12T09:00:00Z')],
          nextCursor: null,
        });
      }
      return response({
        child,
        recent: [activity(3, 4, '2026-09-13T10:00:00Z'), activity(2, 4, '2026-09-13T09:00:00Z')],
        nextCursor: 2,
      });
    });
    const fetcher = fetcherMock as unknown as typeof fetch;

    const history = await loadDailyHistory('/api', 4, new AbortController().signal, fetcher);
    expect(history).toMatchObject({ child: { id: 4, name: 'Learner' }, partial: false });
    expect(history.activities.map(item => item.id).sort()).toEqual([1, 2, 3]);
    expect(fetcherMock).toHaveBeenCalledTimes(2);
    expect(fetcherMock.mock.calls[0]).toEqual([
      '/api/children/4/progress?view=daily',
      expect.objectContaining({ method: 'GET', cache: 'no-store', credentials: 'include' }),
    ]);
  });

  it('gives safe account and pagination errors', async () => {
    const inaccessible = vi.fn(async () => response({}, 404)) as unknown as typeof fetch;
    await expect(loadDailyHistory('/api', 4, new AbortController().signal, inaccessible)).rejects.toThrow('select a child profile belonging to this account');

    const looping = vi.fn(async () => response({ child, recent: [activity(2, 4, '2026-09-13T09:00:00Z')], nextCursor: 2 })) as unknown as typeof fetch;
    await expect(loadDailyHistory('/api', 4, new AbortController().signal, looping)).rejects.toThrow('could not be read safely');
  });
});
