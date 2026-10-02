import { useCallback, useSyncExternalStore } from 'react';

export type Settings = { year: number; sound: boolean; largeText: boolean };
export type Activity = { id: string; kind: 'lesson' | 'book'; title: string; stars: number; date: string };
export type SavedData = { settings: Settings; activities: Activity[]; stickers: string[] };
const KEY = 'sodafom_archie_design_v1';
const DEFAULT: SavedData = { settings: { year: 4, sound: true, largeText: false }, activities: [], stickers: [] };
let cachedRaw: string | null | undefined;
let cached = DEFAULT;
let memoryOnly = false;
const subscribers = new Set<() => void>();
function read(): SavedData {
  if (memoryOnly) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    const data = JSON.parse(raw || 'null');
    cached = data ? {
      settings: { year: [1,2,3,4,5,6].includes(data.settings?.year) ? data.settings.year : 4,
        sound: data.settings?.sound !== false, largeText: data.settings?.largeText === true },
      activities: Array.isArray(data.activities) ? data.activities.filter((v: Activity) => v && typeof v.id === 'string' && typeof v.title === 'string' && ['book','lesson'].includes(v.kind) && Number.isFinite(v.stars) && typeof v.date === 'string').slice(-500) : [],
      stickers: Array.isArray(data.stickers) ? data.stickers.filter((s: unknown) => typeof s === 'string') : [],
    } : DEFAULT;
  } catch { cached = DEFAULT; }
  return cached;
}
function subscribe(fn: () => void) {
  subscribers.add(fn);
  window.addEventListener('storage', fn);
  return () => { subscribers.delete(fn); window.removeEventListener('storage', fn); };
}
export function updateSavedData(update: (previous: SavedData) => SavedData) {
  cached = update(read());
  try { cachedRaw = JSON.stringify(cached); localStorage.setItem(KEY, cachedRaw); }
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
  try { return Object.values(JSON.parse(localStorage.getItem('sodafom_game_stars') || '{}')).reduce<number>((sum, n) => sum + (typeof n === 'number' && Number.isFinite(n) ? Math.max(0,Math.min(n,3)) : 0), 0); }
  catch { return 0; }
}
