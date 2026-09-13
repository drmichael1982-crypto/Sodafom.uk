/** Admin-owned page availability catalogue. This is not an authorisation system. */
export type FeatureState = 'on' | 'off' | 'testing' | 'coming_soon';
type Definition = {
  id: string; label: string; description: string; paths: readonly string[];
  connected: boolean; critical: boolean; unavailableState?: FeatureState;
};
export const FEATURES = [
  { id: 'learning', label: 'Learning', description: 'Lesson and subject pages. Already-open activities may finish.', paths: ['/lessons', '/lesson-library', '/tutor', '/teacher-mode', '/subjects'], connected: true, critical: true },
  { id: 'games', label: 'Games', description: 'Game pages, game islands and battles. Saved scores are not deleted.', paths: ['/games', '/game-islands', '/battle', '/daily-challenge', '/game-of-the-week'], connected: true, critical: true },
  { id: 'reading', label: 'Reading', description: 'Reading and story pages, kept separate from other subjects.', paths: ['/reading', '/stories', '/subjects/reading'], connected: true, critical: true },
  { id: 'homework', label: 'Homework', description: 'Homework helper and scanner pages. Saved work is not deleted.', paths: ['/homework-helper', '/homework-tools'], connected: true, critical: true },
  { id: 'ask_archie', label: 'Ask Archie AI', description: 'A global switch needs the Local AI and OpenAI routing integration. This panel does not change AI routing or credits.', paths: [], connected: false, critical: true, unavailableState: 'testing' },
  { id: 'voice', label: 'Voice', description: 'A global switch needs the voice service integration. Existing voice and microphone settings remain unchanged.', paths: [], connected: false, critical: true, unavailableState: 'testing' },
  { id: 'cinema', label: 'Cinema', description: 'The existing Archie theatre entry page. Media already playing is not stopped.', paths: ['/archie-theatre'], connected: true, critical: false },
  { id: 'sticker_books', label: 'Sticker books', description: 'No connected sticker-book route was found in this master snapshot. Its feature agent must connect it first.', paths: [], connected: false, critical: false, unavailableState: 'coming_soon' },
  { id: 'rewards', label: 'Rewards', description: 'Reward, badge, certificate and star-bank pages. Earning and saving rewards are unchanged.', paths: ['/rewards', '/badges', '/certificates', '/star-bank'], connected: true, critical: false },
  { id: 'shop', label: 'Shop', description: 'The existing Sodafom shop entry page only. Checkout, subscriptions, cancellations and payments are unchanged.', paths: ['/sodafom-shop'], connected: true, critical: false },
  { id: 'notifications', label: 'Notifications', description: 'A global switch needs delivery-service integration. Parent preferences and unsubscribe controls remain available.', paths: [], connected: false, critical: true, unavailableState: 'testing' },
  { id: 'parent', label: 'Parent', description: 'Parent report pages. Account, subscription and chore-approval controls remain available.', paths: ['/parent-area', '/parent-dashboard'], connected: true, critical: true },
  { id: 'teacher', label: 'Teacher', description: 'Teacher Hub pages. Teacher sign-in and saved pupil records are unchanged.', paths: ['/teacher-hub'], connected: true, critical: true },
] as const satisfies readonly Definition[];
export type FeatureId = typeof FEATURES[number]['id'];
export type FeatureDefinition = typeof FEATURES[number];
export type FeatureSnapshot = { revision: number; states: Record<FeatureId, FeatureState> };
export type StoredSettings = Record<string, unknown>;
export type FeatureChange = { action: 'set-feature-control'; key: FeatureId; enabled: boolean; revision: number; confirmed: boolean };
export class FeatureControlError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const validRevision = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) < Number.MAX_SAFE_INTEGER;
export function defaultSettings(): StoredSettings {
  return Object.fromEntries(FEATURES.filter(feature => feature.connected).map(feature => [feature.id, true]));
}
export function buildSnapshot(settings: unknown, revision: unknown): FeatureSnapshot {
  if (!isRecord(settings) || !validRevision(revision)) throw new Error('Feature settings unavailable');
  const states = {} as Record<FeatureId, FeatureState>;
  for (const feature of FEATURES) {
    if (!feature.connected) { states[feature.id] = feature.unavailableState; continue; }
    const enabled = Object.hasOwn(settings, feature.id) ? settings[feature.id] : true;
    if (typeof enabled !== 'boolean') throw new Error('Feature settings unavailable');
    states[feature.id] = enabled ? 'on' : 'off';
  }
  return { revision, states };
}
export function readSnapshot(value: unknown): FeatureSnapshot {
  if (!isRecord(value) || !validRevision(value.revision) || !isRecord(value.states)) throw new Error('Feature settings unavailable');
  const states = {} as Record<FeatureId, FeatureState>;
  for (const feature of FEATURES) {
    const state = value.states[feature.id];
    if (feature.connected ? state !== 'on' && state !== 'off' : state !== feature.unavailableState) throw new Error('Feature settings unavailable');
    states[feature.id] = state as FeatureState;
  }
  return { revision: value.revision, states };
}
export function validateChange(value: unknown, snapshot: FeatureSnapshot): FeatureChange {
  const keys = new Set(['action', 'key', 'enabled', 'revision', 'confirmed']);
  if (!isRecord(value) || Object.keys(value).some(key => !keys.has(key)) || value.action !== 'set-feature-control' || typeof value.key !== 'string' || typeof value.enabled !== 'boolean' || typeof value.confirmed !== 'boolean' || !validRevision(value.revision)) {
    throw new FeatureControlError(400, 'Choose a valid feature and setting.');
  }
  const feature = FEATURES.find(item => item.id === value.key);
  if (!feature?.connected) throw new FeatureControlError(400, 'This control is not connected yet.');
  if (value.revision !== snapshot.revision) throw new FeatureControlError(409, 'Settings changed in another window. Reload before trying again.');
  if (!value.enabled && feature.critical && snapshot.states[feature.id] === 'on' && !value.confirmed) throw new FeatureControlError(409, 'Please confirm before turning off this key feature.');
  return value as FeatureChange;
}
export function prepareChange(settings: StoredSettings, revision: number, value: unknown) {
  const current = buildSnapshot(settings, revision);
  const change = validateChange(value, current);
  const changed = current.states[change.key] !== (change.enabled ? 'on' : 'off');
  const next = { ...settings, [change.key]: change.enabled };
  return { changed, settings: next, snapshot: buildSnapshot(next, revision + (changed ? 1 : 0)) };
}
const PROTECTED_PATHS = ['/admin', '/admin-panel', '/hub', '/auth', '/login', '/subscribe', '/checkout', '/notifications', '/teacher-hub/login', '/teacher-hub/register', '/teacher-hub/logout', '/teacher-hub/settings', '/teacher-hub/forgot-password', '/teacher-hub/reset-password', '/parent-dashboard/chores', '/parent-dashboard/settings', '/parent-dashboard/subscription', '/parent-area/settings', '/parent-area/subscription'];
const matches = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
export function featureForPath(pathname: string): FeatureDefinition | undefined {
  let path: string;
  try { path = decodeURIComponent(pathname.split(/[?#]/, 1)[0]).toLowerCase().replace(/\/+$/, '') || '/'; }
  catch { return undefined; }
  if (PROTECTED_PATHS.some(prefix => matches(path, prefix))) return undefined;
  // Longest match keeps Reading independent of the wider /subjects control.
  return FEATURES.flatMap(feature => feature.paths.map(prefix => ({ feature, prefix })))
    .filter(item => matches(path, item.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0]?.feature;
}
export const STATUS_LABELS: Record<FeatureState, string> = { on: 'On', off: 'Off', testing: 'Testing', coming_soon: 'Coming soon' };
