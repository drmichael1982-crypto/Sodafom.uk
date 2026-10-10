import { useCallback, useSyncExternalStore } from 'react';

export type Settings = { childNickname?: string; year: number; sound: boolean; largeText: boolean; onlineHelp: boolean };
export type Activity = { id: string; kind: 'lesson' | 'book'; title: string; stars: number; date: string; profileId?: string };
export type SavedData = { settings: Settings; activities: Activity[]; stickers: string[] };
const KEY = 'sodafom_archie_design_v1';
const LOCAL_PROFILE_KEY = 'sodafom_archie_local_profile_v1';
const GAME_STARS_KEY = 'sodafom_game_stars';
const SCOPED_GAME_STARS_PREFIX = 'sodafom_game_stars:profile:';
const SCOPED_STICKERS_PREFIX = 'sodafom_archie_stickers:profile:';
const DEFAULT: SavedData = { settings: { year: 4, sound: true, largeText: false, onlineHelp: false }, activities: [], stickers: [] };
let cachedRaw: string | null | undefined;
let cached = DEFAULT;
let memoryOnly = false;
let memoryProfileId = 'device-memory';
let cachedProfileId: string | undefined;
const subscribers = new Set<() => void>();

export type ProgressProfile = { id: string; name: string; source: 'active-child' | 'local-profile' };

function safeProfilePart(value: unknown): string {
  return encodeURIComponent(String(value).trim().slice(0, 80));
}

export function currentProgressProfile(): ProgressProfile {
  if (typeof window === 'undefined') return { id: 'device-server', name: 'this learner', source: 'local-profile' };
  try {
    const active = JSON.parse(localStorage.getItem('sodafom_active_child') || 'null') as { id?: unknown; name?: unknown } | null;
    if ((typeof active?.id === 'number' || typeof active?.id === 'string') && String(active.id).trim()) {
      return {
        id: `child:${safeProfilePart(active.id)}`,
        name: typeof active.name === 'string' && active.name.trim() ? active.name.trim().slice(0, 30) : 'selected learner',
        source: 'active-child',
      };
    }
  } catch { /* use the local preview profile */ }
  try {
    let id = localStorage.getItem(LOCAL_PROFILE_KEY)?.trim();
    if (!id) {
      id = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(LOCAL_PROFILE_KEY, id);
    }
    return { id: `local:${safeProfilePart(id)}`, name: 'local learner', source: 'local-profile' };
  } catch {
    return { id: `local:${memoryProfileId}`, name: 'local learner', source: 'local-profile' };
  }
}

export function scopedGameStarsKey(profile = currentProgressProfile()): string {
  return `${SCOPED_GAME_STARS_PREFIX}${profile.id}`;
}

export function scopedStickersKey(profile = currentProgressProfile()): string {
  return `${SCOPED_STICKERS_PREFIX}${profile.id}`;
}

function parseStickers(raw: string | null): string[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? [...new Set(parsed.filter((sticker): sticker is string => typeof sticker === 'string'))] : [];
  } catch { return []; }
}

export function readScopedStickers(profile = currentProgressProfile()): string[] {
  if (typeof window === 'undefined') return [];
  return parseStickers(localStorage.getItem(scopedStickersKey(profile)));
}

export function claimScopedSticker(stickerId: string, profile = currentProgressProfile()): void {
  if (typeof window === 'undefined' || !stickerId.trim()) return;
  const stickers = readScopedStickers(profile);
  if (stickers.includes(stickerId)) return;
  try { localStorage.setItem(scopedStickersKey(profile), JSON.stringify([...stickers, stickerId])); }
  catch { return; }
  cachedRaw = undefined;
  subscribers.forEach(fn => fn());
}

function parseGameStars(raw: string | null): Record<string, number> {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, number] => {
      const stars = entry[1];
      return typeof stars === 'number' && Number.isInteger(stars) && stars >= 0 && stars <= 3;
    }));
  } catch { return {}; }
}

export function readScopedGameStars(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  return parseGameStars(localStorage.getItem(scopedGameStarsKey()));
}

export function readLegacyGameStars(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  return parseGameStars(localStorage.getItem(GAME_STARS_KEY));
}

export function recordScopedGameStars(gameId: string, stars: number): void {
  if (typeof window === 'undefined' || !Number.isInteger(stars) || stars < 0 || stars > 3) return;
  const key = scopedGameStarsKey();
  const saved = readScopedGameStars();
  if ((saved[gameId] ?? 0) >= stars) return;
  try { localStorage.setItem(key, JSON.stringify({ ...saved, [gameId]: stars })); }
  catch { /* progress remains usable when storage is unavailable */ }
}
function read(): SavedData {
  if (memoryOnly) return cached;
  try {
    const profileId = currentProgressProfile().id;
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw && profileId === cachedProfileId) return cached;
    cachedRaw = raw;
    cachedProfileId = profileId;
    const data = JSON.parse(raw || 'null');
    cached = data ? {
      settings: { childNickname: typeof data.settings?.childNickname === 'string' ? data.settings.childNickname.trim().slice(0,30) : '', year: [1,2,3,4,5,6,7,8,9].includes(data.settings?.year) ? data.settings.year : 4,
        sound: data.settings?.sound !== false, largeText: data.settings?.largeText === true, onlineHelp: data.settings?.onlineHelp === true },
      activities: Array.isArray(data.activities) ? data.activities.filter((v: Activity) => v && typeof v.id === 'string' && typeof v.title === 'string' && ['book','lesson'].includes(v.kind) && Number.isFinite(v.stars) && Number.isInteger(v.stars) && v.stars >= 0 && v.stars <= 3 && typeof v.date === 'string' && (v.profileId === undefined || typeof v.profileId === 'string')).slice(-5000) : [],
      stickers: Array.isArray(data.stickers) ? data.stickers.filter((s: unknown) => typeof s === 'string') : [],
    } : DEFAULT;
  } catch { cached = DEFAULT; }
  return cached;
}
function subscribe(fn: () => void) {
  subscribers.add(fn);
  window.addEventListener('storage', fn);
  window.addEventListener('sodafom:active-child-changed', fn);
  return () => { subscribers.delete(fn); window.removeEventListener('storage', fn); window.removeEventListener('sodafom:active-child-changed', fn); };
}
export function updateSavedData(update: (previous: SavedData) => SavedData) {
  cached = update(read());
  try { cachedRaw = JSON.stringify(cached); localStorage.setItem(KEY, cachedRaw); }
  catch { memoryOnly = true; }
  subscribers.forEach(fn => fn());
}
export function useArchieData() {
  const data = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const progressProfile = currentProgressProfile();
  const activities = data.activities.filter(activity => activity.profileId === progressProfile.id);
  const legacyActivities = data.activities.filter(activity => !activity.profileId);
  const stickers = readScopedStickers(progressProfile);
  const setSettings = useCallback((settings: Partial<Settings>) => updateSavedData(d => ({ ...d, settings: { ...d.settings, ...settings } })), []);
  const complete = useCallback((activity: Omit<Activity, 'date' | 'profileId'>) => {
    const profileId = currentProgressProfile().id;
    updateSavedData(d => d.activities.some(a => a.id === activity.id && a.profileId === profileId) ? d : { ...d, activities: [...d.activities, { ...activity, profileId, date: new Date().toISOString() }] });
  }, []);
  return { ...data, activities, legacyActivities, legacyStickers: data.stickers, stickers, progressProfile, setSettings, complete };
}
export function isSoundEnabled() { return read().settings.sound; }
export function readGameStars(): number {
  return Object.values(readScopedGameStars()).reduce((sum, stars) => sum + stars, 0);
}
