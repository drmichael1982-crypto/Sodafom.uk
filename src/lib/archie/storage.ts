import { useCallback, useSyncExternalStore } from 'react';
import { totalGameStars } from '@/lib/game-stars';

export type Settings = { childNickname?: string; year: number; sound: boolean; largeText: boolean; onlineHelp: boolean };
export type Activity = { id: string; kind: 'lesson' | 'book'; title: string; stars: number; date: string };
export type SavedData = { settings: Settings; activities: Activity[]; stickers: string[] };
const KEY = 'sodafom_archie_design_v1';
const PROGRESS_KEY = 'sodafom_archie_progress';
const DEFAULT: SavedData = { settings: { year: 4, sound: true, largeText: false, onlineHelp: false }, activities: [], stickers: [] };
let cachedSignature: string | undefined;
let cached = DEFAULT;
let memoryOnly = false;
const subscribers = new Set<() => void>();

type ActiveChildProfile = { id: string; name: string; ageGroup: string };

function activeChild(): ActiveChildProfile | null {
  try {
    const child = JSON.parse(localStorage.getItem('sodafom_active_child') || 'null') as Record<string, unknown> | null;
    const id = typeof child?.id === 'number' || typeof child?.id === 'string' ? String(child.id).trim() : '';
    if (!id) return null;
    return {
      id,
      name: typeof child?.name === 'string' ? child.name.trim().slice(0, 30) : '',
      ageGroup: typeof child?.ageGroup === 'string' ? child.ageGroup.replace('–', '-').trim() : '',
    };
  } catch { return null; }
}

function childProgressKey(childId: string): string {
  return `${PROGRESS_KEY}:${encodeURIComponent(childId)}`;
}

function settingsFrom(value: unknown): Settings {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    childNickname: typeof data.childNickname === 'string' ? data.childNickname.trim().slice(0, 30) : '',
    year: [1,2,3,4,5,6,7,8,9].includes(data.year as number) ? data.year as number : 4,
    sound: data.sound !== false,
    largeText: data.largeText === true,
    onlineHelp: data.onlineHelp === true,
  };
}

function defaultYearForAgeGroup(ageGroup: string): number {
  if (ageGroup === '5-7') return 2;
  if (ageGroup === '11-13') return 8;
  return 5;
}

function settingsForChild(value: unknown, child: ActiveChildProfile, shared: Settings): Settings {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const learner = data.settings && typeof data.settings === 'object'
    ? data.settings as Record<string, unknown>
    : {};
  return {
    sound: shared.sound,
    largeText: shared.largeText,
    onlineHelp: shared.onlineHelp,
    year: [1,2,3,4,5,6,7,8,9].includes(learner.year as number)
      ? learner.year as number
      : defaultYearForAgeGroup(child.ageGroup),
    childNickname: typeof learner.childNickname === 'string'
      ? learner.childNickname.trim().slice(0, 30)
      : child.name,
  };
}

function activitiesFrom(value: unknown): Activity[] {
  return Array.isArray(value) ? value.filter((v: Activity) => v && typeof v.id === 'string' && typeof v.title === 'string' && ['book','lesson'].includes(v.kind) && Number.isFinite(v.stars) && Number.isInteger(v.stars) && v.stars >= 0 && v.stars <= 3 && typeof v.date === 'string').slice(-5000) : [];
}

function stickersFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((s: unknown): s is string => typeof s === 'string') : [];
}

function parsedRecord(raw: string | null): Record<string, unknown> {
  const value = JSON.parse(raw || 'null');
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function read(): SavedData {
  if (memoryOnly) return cached;
  try {
    const child = activeChild();
    const childId = child?.id ?? null;
    const baseRaw = localStorage.getItem(KEY);
    const progressRaw = childId ? localStorage.getItem(childProgressKey(childId)) : null;
    const signature = `${childId ?? 'guest'}\u0000${baseRaw ?? ''}\u0000${progressRaw ?? ''}`;
    if (signature === cachedSignature) return cached;
    cachedSignature = signature;
    const base = parsedRecord(baseRaw);
    const progress = childId ? parsedRecord(progressRaw) : base;
    cached = {
      settings: child ? settingsForChild(progress, child, settingsFrom(base.settings)) : settingsFrom(base.settings),
      activities: activitiesFrom(progress.activities),
      stickers: stickersFrom(progress.stickers),
    };
  } catch { cached = DEFAULT; }
  return cached;
}
function subscribe(fn: () => void) {
  subscribers.add(fn);
  window.addEventListener('storage', fn);
  window.addEventListener('sodafom:active-child-changed', fn);
  return () => {
    subscribers.delete(fn);
    window.removeEventListener('storage', fn);
    window.removeEventListener('sodafom:active-child-changed', fn);
  };
}
export function updateSavedData(update: (previous: SavedData) => SavedData) {
  const next = update(read());
  cached = next;
  try {
    const childId = activeChild()?.id ?? null;
    if (childId) {
      const baseRaw = localStorage.getItem(KEY);
      const base = parsedRecord(baseRaw);
      const baseSettings = settingsFrom(base.settings);
      const progress = parsedRecord(localStorage.getItem(childProgressKey(childId)));
      localStorage.setItem(KEY, JSON.stringify({
        ...base,
        settings: {
          ...baseSettings,
          sound: next.settings.sound,
          largeText: next.settings.largeText,
          onlineHelp: next.settings.onlineHelp,
        },
        activities: activitiesFrom(base.activities),
        stickers: stickersFrom(base.stickers),
      }));
      localStorage.setItem(childProgressKey(childId), JSON.stringify({
        ...progress,
        settings: { year: next.settings.year, childNickname: next.settings.childNickname ?? '' },
        activities: next.activities,
        stickers: next.stickers,
      }));
    } else {
      localStorage.setItem(KEY, JSON.stringify(next));
    }
    cachedSignature = undefined;
  }
  catch { memoryOnly = true; }
  subscribers.forEach(fn => fn());
}
export function useArchieData() {
  const data = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const setSettings = useCallback((settings: Partial<Settings>) => updateSavedData(d => ({ ...d, settings: { ...d.settings, ...settings } })), []);
  const complete = useCallback((activity: Omit<Activity, 'date'>) => updateSavedData(d => d.activities.some(a => a.id === activity.id) ? d : { ...d, activities: [...d.activities, { ...activity, date: new Date().toISOString() }] }), []);
  return { ...data, setSettings, complete };
}
export function isSoundEnabled() { return read().settings.sound; }
export function readGameStars(): number {
  return totalGameStars();
}
