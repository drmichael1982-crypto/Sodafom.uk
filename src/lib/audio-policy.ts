/** Shared audio policy. No microphone access, network requests, or transcript storage. */
export type AudioChannel = 'voice' | 'music' | 'effects';
export interface AudioSettings {
  voices: boolean; music: boolean; effects: boolean; quiet: boolean;
  voiceVolume: number; musicVolume: number; effectsVolume: number;
}
export const DEFAULT_AUDIO_SETTINGS: Readonly<AudioSettings> = Object.freeze({
  voices: true, music: false, effects: false, quiet: false,
  voiceVolume: 0.85, musicVolume: 0.15, effectsVolume: 0.18,
});
const KEY = 'sodafom-audio-settings-v1';
const listeners = new Set<() => void>();
let cached: Readonly<AudioSettings> | undefined;
export function normaliseAudioSettings(input: unknown): Readonly<AudioSettings> {
  const value = input && typeof input === 'object' ? input as Partial<AudioSettings> : {};
  const flag = (key: 'voices' | 'music' | 'effects' | 'quiet') => typeof value[key] === 'boolean' ? value[key]! : DEFAULT_AUDIO_SETTINGS[key];
  const volume = (key: 'voiceVolume' | 'musicVolume' | 'effectsVolume') => typeof value[key] === 'number' && Number.isFinite(value[key]) ? Math.min(1, Math.max(0, value[key]!)) : DEFAULT_AUDIO_SETTINGS[key];
  return Object.freeze({ voices: flag('voices'), music: flag('music'), effects: flag('effects'), quiet: flag('quiet'),
    voiceVolume: volume('voiceVolume'), musicVolume: volume('musicVolume'), effectsVolume: volume('effectsVolume') });
}
export function getAudioSettings(): Readonly<AudioSettings> {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  if (!cached) {
    try { cached = normaliseAudioSettings(JSON.parse(window.localStorage.getItem(KEY) || 'null')); }
    catch { cached = DEFAULT_AUDIO_SETTINGS; }
  }
  return cached;
}
export function updateAudioSettings(patch: Partial<AudioSettings>): void {
  cached = normaliseAudioSettings({ ...getAudioSettings(), ...patch });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cached));
    // Preserve the old screen's sound switch, including when Quiet mode is on.
    window.localStorage.setItem('sodafom_sound_enabled', String(cached.effects && !cached.quiet));
  } catch { /* Private browsing/storage restrictions must not break controls. */ }
  listeners.forEach(listener => listener());
}
function storageChanged(event: StorageEvent) {
  if (event.key !== KEY && event.key !== null) return;
  cached = undefined;
  listeners.forEach(listener => listener());
}
export function subscribeAudioSettings(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== 'undefined') window.addEventListener('storage', storageChanged);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', storageChanged);
  };
}

export type AudioFocus = 'voice' | 'microphone' | null;
let focus: { kind: Exclude<AudioFocus, null>; cancel: () => void } | null = null;
const focusListeners = new Set<() => void>();
export function getAudioFocus(): AudioFocus { return focus?.kind ?? null; }
export function subscribeAudioFocus(listener: () => void): () => void {
  focusListeners.add(listener);
  return () => { focusListeners.delete(listener); };
}
/** One foreground owner: teaching never speaks over a live microphone. */
export function claimAudioFocus(kind: Exclude<AudioFocus, null>, cancel: () => void): () => void {
  const previous = focus;
  const owner = { kind, cancel };
  focus = owner;
  try { previous?.cancel(); } finally { focusListeners.forEach(listener => listener()); }
  return () => {
    if (focus !== owner) return;
    focus = null;
    focusListeners.forEach(listener => listener());
  };
}
export function stopForegroundAudio(): void { focus?.cancel(); }
export function channelVolume(channel: AudioChannel, settings = getAudioSettings(), active = getAudioFocus()): number {
  if (channel === 'voice') return settings.voices ? settings.voiceVolume : 0;
  if (settings.quiet || active !== null) return 0; // No SFX/music masking reading or listening.
  if (channel === 'music') return settings.music ? Math.min(settings.musicVolume, 0.35) : 0;
  return settings.effects ? Math.min(settings.effectsVolume, 0.3) : 0;
}
/** Opt-in mixer for existing audio elements. Does not hijack unrelated video/player controls. */
export function registerAudioElement(audio: HTMLMediaElement, channel: AudioChannel): () => void {
  const originalVolume = audio.volume;
  const apply = () => { audio.volume = channelVolume(channel); };
  const offSettings = subscribeAudioSettings(apply);
  const offFocus = subscribeAudioFocus(apply);
  apply();
  return () => { offSettings(); offFocus(); audio.volume = originalVolume; };
}

export type VoiceRole = 'child-boy' | 'child-girl' | 'adult-woman' | 'adult-man' | 'unassigned' | 'dog';
export interface CharacterVoiceProfile { id: string; role: VoiceRole; rate: number; pitch: number; voiceURI?: string }
// Only Archie and the family dogs' roles are verified in this task. Do not guess
// the ages/genders/species of the legacy cast from their names or illustrations.
const profiles = new Map<string, CharacterVoiceProfile>([
  ['archie', { id: 'archie', role: 'child-boy', rate: 0.94, pitch: 1.24 }],
  ...['jessica', 'sally', 'daisy'].map(id => [id, { id, role: 'dog' as const, rate: 1, pitch: 1 }] as const),
]);
const pinned = new Map<string, string>();
export function characterId(name: string): string { return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function getCharacterProfile(name = 'archie'): CharacterVoiceProfile {
  const id = characterId(name) || 'archie';
  return profiles.get(id) ?? { id, role: 'unassigned', rate: 0.94, pitch: 1 };
}
/** Call with reviewed cast metadata, never AI-inferred gender/age or a cloned child voice. */
export function configureCharacterVoice(profile: CharacterVoiceProfile): void {
  const id = characterId(profile.id);
  if (!id || !['child-boy', 'child-girl', 'adult-woman', 'adult-man', 'unassigned', 'dog'].includes(profile.role)) throw new Error('Invalid character voice profile');
  if (!Number.isFinite(profile.rate) || !Number.isFinite(profile.pitch)) throw new Error('Invalid voice settings');
  if (['jessica', 'sally', 'daisy'].includes(id) && profile.role !== 'dog') throw new Error('Family dogs must not use human speech');
  profiles.set(id, { ...profile, id, rate: Math.min(1.2, Math.max(0.7, profile.rate)), pitch: Math.min(1.5, Math.max(0.7, profile.pitch)) });
  pinned.delete(id);
}
export function voiceMatchesRole(name: string, role: VoiceRole): boolean {
  // Word boundaries are essential: "female" must NEVER match "male".
  if (role === 'child-boy') return /\b(boy|child|young)\b/i.test(name) && !/\b(female|girl|woman)\b/i.test(name);
  if (role === 'child-girl') return /\b(girl|child|young)\b/i.test(name) && !/\b(male|boy|man)\b/i.test(name);
  if (role === 'adult-woman') return /\b(female|woman)\b/i.test(name) && !/\b(child|girl|young)\b/i.test(name);
  if (role === 'adult-man') return /\b(male|man)\b/i.test(name) && !/\b(child|boy|young)\b/i.test(name);
  return false;
}
export interface VoiceSelection { voice: SpeechSynthesisVoice | null; quality: 'configured' | 'device-fallback' | 'unavailable' | 'dog' }
export function selectCharacterVoice(name: string, voices: readonly SpeechSynthesisVoice[]): VoiceSelection {
  const profile = getCharacterProfile(name);
  if (profile.role === 'dog') return { voice: null, quality: 'dog' };
  const storageKey = `sodafom-character-voice-v1:${profile.id}`;
  let uri = profile.voiceURI || pinned.get(profile.id);
  if (!uri) { try { uri = window.localStorage.getItem(storageKey) || undefined; } catch { /* SSR/private mode. */ } }
  // A missing pinned voice must not silently become a different character.
  if (uri) {
    const voice = voices.find(item => item.voiceURI === uri && item.localService) ?? null;
    return { voice, quality: voice ? (profile.voiceURI ? 'configured' : 'device-fallback') : 'unavailable' };
  }
  const candidates = voices.filter(voice => voice.localService && /^en(?:-|_|$)/i.test(voice.lang))
    .sort((a, b) => Number(voiceMatchesRole(b.name, profile.role)) - Number(voiceMatchesRole(a.name, profile.role))
      || Number(/^en[-_]gb$/i.test(b.lang)) - Number(/^en[-_]gb$/i.test(a.lang)) || a.voiceURI.localeCompare(b.voiceURI));
  const voice = candidates[0] ?? null;
  if (voice) {
    pinned.set(profile.id, voice.voiceURI);
    try { window.localStorage.setItem(storageKey, voice.voiceURI); } catch { /* Session pin still works. */ }
  }
  // OS metadata has no reliable age/gender field. A fallback is NOT an approved child voice.
  return { voice, quality: voice ? 'device-fallback' : 'unavailable' };
}
