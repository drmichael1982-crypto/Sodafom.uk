import { useCallback, useSyncExternalStore } from 'react';

export type Settings = { childNickname?: string; year: number; sound: boolean; largeText: boolean; onlineHelp: boolean };
export type Activity = { id: string; kind: 'lesson' | 'book'; title: string; stars: number; date: string; profileId?: string };
export type SavedData = { settings: Settings; activities: Activity[]; stickers: string[] };
export type ProgressProfile = { id: string; name: string; source: 'active-child' | 'local-profile' };

const KEY = 'sodafom_archie_design_v1';
const PROGRESS_KEY = 'sodafom_archie_progress';
const LOCAL_PROFILE_KEY = 'sodafom_archie_local_profile_v1';
const GAME_STARS_KEY = 'sodafom_game_stars';
const SCOPED_GAME_STARS_PREFIX = 'sodafom_game_stars:profile:';
const LEGACY_SCOPED_STICKERS_PREFIX = 'sodafom_archie_stickers:profile:';
const SCOPED_LEARNER_SETTINGS_PREFIX = 'sodafom_archie_settings:profile:';
const DEFAULT: SavedData = { settings: { year: 4, sound: true, largeText: false, onlineHelp: false }, activities: [], stickers: [] };

let cachedSignature: string | undefined;
let cached = DEFAULT;
let memoryOnly = false;
let memoryProfileId = 'device-memory';
const subscribers = new Set<() => void>();

function safeProfilePart(value: unknown): string {
  return encodeURIComponent(String(value).trim().slice(0, 80));
}

function activeChildId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const child = JSON.parse(localStorage.getItem('sodafom_active_child') || 'null') as Record<string, unknown> | null;
    const id = typeof child?.id === 'number' || typeof child?.id === 'string' ? String(child.id).trim() : '';
    return id || null;
  } catch { return null; }
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

function childProgressKey(childId: string): string {
  return `${PROGRESS_KEY}:${safeProfilePart(childId)}`;
}

function progressKeyForProfile(profile: ProgressProfile): string | null {
  return profile.source === 'active-child' ? `${PROGRESS_KEY}:${profile.id.slice('child:'.length)}` : null;
}

export function scopedGameStarsKey(profile = currentProgressProfile()): string {
  return `${SCOPED_GAME_STARS_PREFIX}${profile.id}`;
}

/** Retained only to read the previous branch format during non-destructive migration. */
export function scopedStickersKey(profile = currentProgressProfile()): string {
  return `${LEGACY_SCOPED_STICKERS_PREFIX}${profile.id}`;
}

export function scopedLearnerSettingsKey(profile = currentProgressProfile()): string {
  return `${SCOPED_LEARNER_SETTINGS_PREFIX}${profile.id}`;
}

type LearnerSettings = Pick<Settings, 'childNickname' | 'year'>;

function settingsFrom(value: unknown): Settings {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    childNickname: typeof data.childNickname === 'string' ? data.childNickname.trim().slice(0, 30) : '',
    year: [1,2,3,4,5,6,7,8,9].includes(Number(data.year)) ? Number(data.year) : 4,
    sound: data.sound !== false,
    largeText: data.largeText === true,
    onlineHelp: data.onlineHelp === true,
  };
}

function parseLearnerSettings(raw: string | null): LearnerSettings | null {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const value = parsed as { childNickname?: unknown; year?: unknown };
    if (![1,2,3,4,5,6,7,8,9].includes(Number(value.year))) return null;
    return {
      childNickname: typeof value.childNickname === 'string' ? value.childNickname.trim().slice(0, 30) : '',
      year: Number(value.year),
    };
  } catch { return null; }
}

export function readScopedLearnerSettings(profile = currentProgressProfile()): LearnerSettings | null {
  if (typeof window === 'undefined') return null;
  return parseLearnerSettings(localStorage.getItem(scopedLearnerSettingsKey(profile)));
}

function activitiesFrom(value: unknown): Activity[] {
  return Array.isArray(value) ? value.filter((v: Activity) => v && typeof v.id === 'string' && typeof v.title === 'string' && ['book','lesson'].includes(v.kind) && Number.isFinite(v.stars) && Number.isInteger(v.stars) && v.stars >= 0 && v.stars <= 3 && typeof v.date === 'string' && (v.profileId === undefined || typeof v.profileId === 'string')).slice(-5000) : [];
}

function stickersFrom(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((sticker): sticker is string => typeof sticker === 'string'))] : [];
}

function parsedRecord(raw: string | null): Record<string, unknown> {
  const value = JSON.parse(raw || 'null');
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readProfileProgress(profile: ProgressProfile, base: Record<string, unknown>): Pick<SavedData, 'activities' | 'stickers'> {
  const progressKey = progressKeyForProfile(profile);
  if (!progressKey) return { activities: activitiesFrom(base.activities), stickers: stickersFrom(base.stickers) };
  const progressRaw = localStorage.getItem(progressKey);
  if (progressRaw !== null) {
    const progress = parsedRecord(progressRaw);
    return { activities: activitiesFrom(progress.activities), stickers: stickersFrom(progress.stickers) };
  }

  // Read the earlier improvement-branch format until the learner next saves progress.
  // Nothing is copied, guessed or deleted merely by opening the app.
  return {
    activities: activitiesFrom(base.activities).filter(activity => activity.profileId === profile.id),
    stickers: stickersFrom(JSON.parse(localStorage.getItem(scopedStickersKey(profile)) || '[]')),
  };
}

export function readScopedStickers(profile = currentProgressProfile()): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const base = parsedRecord(localStorage.getItem(KEY));
    return readProfileProgress(profile, base).stickers;
  } catch { return []; }
}

export function claimScopedSticker(stickerId: string, profile = currentProgressProfile()): void {
  if (typeof window === 'undefined' || !stickerId.trim()) return;
  if (profile.id === currentProgressProfile().id) {
    updateSavedData(data => data.stickers.includes(stickerId) ? data : { ...data, stickers: [...data.stickers, stickerId] });
    return;
  }
  const progressKey = progressKeyForProfile(profile);
  if (!progressKey) return;
  try {
    const base = parsedRecord(localStorage.getItem(KEY));
    const progress = readProfileProgress(profile, base);
    if (progress.stickers.includes(stickerId)) return;
    localStorage.setItem(progressKey, JSON.stringify({ ...progress, stickers: [...progress.stickers, stickerId] }));
  } catch { return; }
  cachedSignature = undefined;
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
    const profile = currentProgressProfile();
    const baseRaw = localStorage.getItem(KEY);
    const profileProgressKey = progressKeyForProfile(profile);
    const progressRaw = profileProgressKey ? localStorage.getItem(profileProgressKey) : null;
    const learnerRaw = localStorage.getItem(scopedLearnerSettingsKey(profile));
    const legacyStickerRaw = localStorage.getItem(scopedStickersKey(profile));
    const signature = `${profile.id}\u0000${baseRaw ?? ''}\u0000${progressRaw ?? ''}\u0000${learnerRaw ?? ''}\u0000${legacyStickerRaw ?? ''}`;
    if (signature === cachedSignature) return cached;
    cachedSignature = signature;
    const base = parsedRecord(baseRaw);
    const baseSettings = settingsFrom(base.settings);
    const learnerSettings = parseLearnerSettings(learnerRaw);
    const progress = readProfileProgress(profile, base);
    cached = {
      settings: {
        ...baseSettings,
        childNickname: learnerSettings?.childNickname ?? baseSettings.childNickname,
        year: learnerSettings?.year ?? baseSettings.year,
      },
      ...progress,
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
  const previous = read();
  const next = update(previous);
  try {
    const profile = currentProgressProfile();
    if (next.settings.year !== previous.settings.year || next.settings.childNickname !== previous.settings.childNickname) {
      localStorage.setItem(scopedLearnerSettingsKey(profile), JSON.stringify({
        childNickname: (next.settings.childNickname ?? '').trim().slice(0, 30),
        year: [1,2,3,4,5,6,7,8,9].includes(next.settings.year) ? next.settings.year : previous.settings.year,
      }));
    }

    const base = parsedRecord(localStorage.getItem(KEY));
    const legacySettings = settingsFrom(base.settings);
    const persistedSettings: Settings = {
      childNickname: legacySettings.childNickname,
      year: legacySettings.year,
      sound: next.settings.sound,
      largeText: next.settings.largeText,
      onlineHelp: next.settings.onlineHelp,
    };
    const childId = activeChildId();
    if (childId) {
      localStorage.setItem(KEY, JSON.stringify({
        ...base,
        settings: persistedSettings,
        activities: activitiesFrom(base.activities),
        stickers: stickersFrom(base.stickers),
      }));
      localStorage.setItem(childProgressKey(childId), JSON.stringify({
        activities: activitiesFrom(next.activities),
        stickers: stickersFrom(next.stickers),
      }));
    } else {
      localStorage.setItem(KEY, JSON.stringify({
        ...base,
        settings: persistedSettings,
        activities: activitiesFrom(next.activities),
        stickers: stickersFrom(next.stickers),
      }));
    }
    cachedSignature = undefined;
  } catch { memoryOnly = true; }
  subscribers.forEach(fn => fn());
}

function setCurrentSettings(settings: Partial<Settings>) {
  if (Object.prototype.hasOwnProperty.call(settings, 'year') || Object.prototype.hasOwnProperty.call(settings, 'childNickname')) {
    const current = read().settings;
    const year = settings.year ?? current.year;
    try {
      localStorage.setItem(scopedLearnerSettingsKey(), JSON.stringify({
        childNickname: (settings.childNickname ?? current.childNickname ?? '').trim().slice(0, 30),
        year: [1,2,3,4,5,6,7,8,9].includes(year) ? year : current.year,
      }));
      cachedSignature = undefined;
    } catch { memoryOnly = true; }
  }
  updateSavedData(data => ({ ...data, settings: { ...data.settings, ...settings } }));
}

export function useArchieData() {
  const data = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const progressProfile = currentProgressProfile();
  let legacyActivities: Activity[] = [];
  let legacyStickers: string[] = [];
  if (progressProfile.source === 'active-child' && typeof window !== 'undefined') {
    try {
      const base = parsedRecord(localStorage.getItem(KEY));
      legacyActivities = activitiesFrom(base.activities).filter(activity => !activity.profileId);
      legacyStickers = stickersFrom(base.stickers);
    } catch { /* keep empty legacy views */ }
  }
  const hasLearnerSettings = readScopedLearnerSettings(progressProfile) !== null;
  const setSettings = useCallback((settings: Partial<Settings>) => setCurrentSettings(settings), []);
  const complete = useCallback((activity: Omit<Activity, 'date' | 'profileId'>) => {
    updateSavedData(d => d.activities.some(a => a.id === activity.id) ? d : { ...d, activities: [...d.activities, { ...activity, date: new Date().toISOString() }] });
  }, []);
  return { ...data, legacyActivities, legacyStickers, progressProfile, hasLearnerSettings, setSettings, complete };
}

export function isSoundEnabled() { return read().settings.sound; }
export function readGameStars(): number {
  return Object.values(readScopedGameStars()).reduce((sum, stars) => sum + stars, 0);
}
