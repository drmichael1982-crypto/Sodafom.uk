/**
 * Small shared policy for foreground audio. It deliberately has no microphone,
 * recording, network, AI, or child-profile behaviour: it only remembers the
 * family's local accessibility preferences and coordinates one foreground
 * voice-or-microphone session at a time.
 */
export type AudioChannel = 'voice' | 'music' | 'effects';

export interface AudioSettings {
  voices: boolean;
  quiet: boolean;
  voiceVolume: number;
}

export const DEFAULT_AUDIO_SETTINGS: Readonly<AudioSettings> = Object.freeze({
  voices: true,
  quiet: false,
  voiceVolume: 0.85,
});

const SETTINGS_KEY = 'sodafom-audio-settings-v1';
const settingListeners = new Set<() => void>();
let cachedSettings: Readonly<AudioSettings> | undefined;

export function normaliseAudioSettings(input: unknown): Readonly<AudioSettings> {
  const value = input && typeof input === 'object' ? input as Partial<AudioSettings> : {};
  const voiceVolume = typeof value.voiceVolume === 'number' && Number.isFinite(value.voiceVolume)
    ? Math.min(1, Math.max(0, value.voiceVolume))
    : DEFAULT_AUDIO_SETTINGS.voiceVolume;
  return Object.freeze({
    voices: typeof value.voices === 'boolean' ? value.voices : DEFAULT_AUDIO_SETTINGS.voices,
    quiet: typeof value.quiet === 'boolean' ? value.quiet : DEFAULT_AUDIO_SETTINGS.quiet,
    voiceVolume,
  });
}

export function getAudioSettings(): Readonly<AudioSettings> {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  if (!cachedSettings) {
    try {
      cachedSettings = normaliseAudioSettings(JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? 'null'));
    } catch {
      cachedSettings = DEFAULT_AUDIO_SETTINGS;
    }
  }
  return cachedSettings;
}

export function updateAudioSettings(patch: Partial<AudioSettings>): void {
  cachedSettings = normaliseAudioSettings({ ...getAudioSettings(), ...patch });
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(cachedSettings));
    } catch {
      // Private browsing or a full device must not disable accessibility controls.
    }
  }
  settingListeners.forEach(listener => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== SETTINGS_KEY && event.key !== null) return;
  cachedSettings = undefined;
  settingListeners.forEach(listener => listener());
}

export function subscribeAudioSettings(listener: () => void): () => void {
  if (settingListeners.size === 0 && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  settingListeners.add(listener);
  return () => {
    settingListeners.delete(listener);
    if (settingListeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

export type AudioFocus = 'voice' | 'microphone' | null;
let focus: { kind: Exclude<AudioFocus, null>; cancel: () => void } | null = null;
const focusListeners = new Set<() => void>();

function notifyFocusListeners(): void {
  focusListeners.forEach(listener => listener());
}

export function getAudioFocus(): AudioFocus {
  return focus?.kind ?? null;
}

export function subscribeAudioFocus(listener: () => void): () => void {
  focusListeners.add(listener);
  return () => focusListeners.delete(listener);
}

/** A new voice or microphone action always stops the old foreground action. */
export function claimAudioFocus(kind: Exclude<AudioFocus, null>, cancel: () => void): () => void {
  const previous = focus;
  const owner = { kind, cancel };
  focus = owner;
  try {
    previous?.cancel();
  } finally {
    notifyFocusListeners();
  }
  return () => {
    if (focus !== owner) return;
    focus = null;
    notifyFocusListeners();
  };
}

export function stopForegroundAudio(): void {
  const owner = focus;
  owner?.cancel();
  // A well-behaved owner releases itself; still clear focus if a browser API
  // has already stopped and its callback did not run.
  if (focus === owner) {
    focus = null;
    notifyFocusListeners();
  }
}

export function channelVolume(channel: AudioChannel, settings = getAudioSettings(), active = getAudioFocus()): number {
  if (channel === 'voice') return settings.voices ? (settings.quiet ? Math.min(settings.voiceVolume, 0.5) : settings.voiceVolume) : 0;
  // Optional music/effects are never allowed to mask a reading voice or a live mic.
  void active;
  return 0;
}

/** Apply the shared voice volume to an explicitly controlled audio element only. */
export function registerAudioElement(audio: HTMLMediaElement, channel: AudioChannel): () => void {
  const originalVolume = audio.volume;
  const apply = () => { audio.volume = channelVolume(channel); };
  const offSettings = subscribeAudioSettings(apply);
  const offFocus = subscribeAudioFocus(apply);
  apply();
  return () => {
    offSettings();
    offFocus();
    audio.volume = originalVolume;
  };
}
