/** Personal voice clips plus the shared, cancellable read-aloud service. */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { channelVolume, claimAudioFocus, registerAudioElement } from './audio-policy';
import { cleanSpeakableText, speakAudio, stopSpeech, type NativeSpeech, type SpeechPlayback } from './audio-runtime';

const ArchieSpeech = registerPlugin<NativeSpeech>('ArchieSpeech');
const MAX_CLIP_DATA_URL_LENGTH = 2_000_000;
const AUDIO_DATA_URL = /^data:audio\/[a-z0-9.+-]+(?:;[^,]+)?;base64,[a-z0-9+/=]+$/i;

export type ClipKey = 'welcome' | 'game-intro' | 'well-done' | 'try-again' | 'instructions' | string;

export interface VoiceClip {
  key: ClipKey;
  label: string;
  prompt: string;
  dataUrl: string;
  recordedAt: number;
}

interface VoiceContextValue {
  childId: string | null;
  setChildId: (id: string | null) => void;
  clips: Record<ClipKey, VoiceClip>;
  saveClip: (key: ClipKey, label: string, prompt: string, dataUrl: string) => void;
  deleteClip: (key: ClipKey) => void;
  speak: (key: ClipKey, fallbackText?: string) => void;
  stop: () => void;
  playing: boolean;
}

function nativeSpeech(): NativeSpeech | null {
  // Keep the existing Android bridge as an optional local engine. Web/iOS uses
  // the browser fallback; no AI speech service is introduced here.
  if (typeof window === 'undefined') return null;
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' ? ArchieSpeech : null;
}

/** Legacy API retained for existing reading controls. Stop never runs a stale completion callback. */
export function ttsSpeak(text: string, onEnd?: () => void): () => void {
  const playback = speakAudio(text, { native: nativeSpeech() });
  void playback.finished.then(result => {
    if (result !== 'cancelled') onEnd?.();
  });
  return playback.stop;
}

export function stopTts(): void {
  stopSpeech();
}

export { cleanSpeakableText };

function storageKey(childId: string, clipKey: ClipKey): string {
  return `sodafom-voice-${childId}-${clipKey}`;
}

function isSafeClip(value: unknown): value is VoiceClip {
  if (!value || typeof value !== 'object') return false;
  const clip = value as Partial<VoiceClip>;
  return typeof clip.key === 'string'
    && typeof clip.label === 'string'
    && typeof clip.prompt === 'string'
    && typeof clip.recordedAt === 'number'
    && typeof clip.dataUrl === 'string'
    && clip.dataUrl.length <= MAX_CLIP_DATA_URL_LENGTH
    && AUDIO_DATA_URL.test(clip.dataUrl);
}

function loadClips(childId: string): Record<ClipKey, VoiceClip> {
  const clips: Record<ClipKey, VoiceClip> = {};
  try {
    const prefix = `sodafom-voice-${childId}-`;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const clip = JSON.parse(raw) as unknown;
        if (isSafeClip(clip)) clips[key.slice(prefix.length)] = clip;
      } catch {
        // A malformed local clip is ignored rather than played or reported.
      }
    }
  } catch {
    // Storage may be unavailable in private mode; read-aloud remains available.
  }
  return clips;
}

const VoiceContext = createContext<VoiceContextValue>({
  childId: null,
  setChildId: () => {},
  clips: {},
  saveClip: () => {},
  deleteClip: () => {},
  speak: () => {},
  stop: () => {},
  playing: false,
});

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [childId, setChildIdState] = useState<string | null>(null);
  const [clips, setClips] = useState<Record<ClipKey, VoiceClip>>({});
  const [playing, setPlaying] = useState(false);
  const generation = useRef(0);
  const cancelOwned = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    generation.current += 1;
    cancelOwned.current();
    cancelOwned.current = () => {};
    stopSpeech();
    setPlaying(false);
  }, []);

  useEffect(() => () => {
    generation.current += 1;
    cancelOwned.current();
    stopSpeech();
  }, []);

  const setChildId = useCallback((id: string | null) => {
    stop();
    setChildIdState(id);
    setClips(id ? loadClips(id) : {});
  }, [stop]);

  const saveClip = useCallback((key: ClipKey, label: string, prompt: string, dataUrl: string) => {
    if (!childId || dataUrl.length > MAX_CLIP_DATA_URL_LENGTH || !AUDIO_DATA_URL.test(dataUrl)) return;
    const clip: VoiceClip = { key, label, prompt, dataUrl, recordedAt: Date.now() };
    try {
      // An explicit Save is the only persistence path for a child's recording.
      localStorage.setItem(storageKey(childId, key), JSON.stringify(clip));
    } catch {
      // The preview remains usable for this page even if storage is unavailable.
    }
    setClips(previous => ({ ...previous, [key]: clip }));
  }, [childId]);

  const deleteClip = useCallback((key: ClipKey) => {
    if (!childId) return;
    try {
      localStorage.removeItem(storageKey(childId, key));
    } catch {
      // State still clears if storage was already unavailable.
    }
    setClips(previous => {
      const next = { ...previous };
      Reflect.deleteProperty(next, key);
      return next;
    });
  }, [childId]);

  const speak = useCallback((key: ClipKey, fallbackText?: string) => {
    stop();
    if (channelVolume('voice') === 0) return;
    const token = generation.current;
    const isCurrent = () => generation.current === token;
    const readFallback = () => {
      if (!isCurrent()) return;
      setPlaying(true);
      const playback: SpeechPlayback = speakAudio(fallbackText ?? key, { native: nativeSpeech() });
      cancelOwned.current = playback.stop;
      void playback.finished.then(() => { if (isCurrent()) setPlaying(false); });
    };
    const clip = Object.hasOwn(clips, key) ? clips[key] : undefined;
    if (!clip?.dataUrl) {
      readFallback();
      return;
    }

    const audio = new Audio(clip.dataUrl);
    let ended = false;
    let release = () => {};
    let unregister = () => {};
    const cleanup = () => {
      if (ended) return;
      ended = true;
      audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', cancel);
      unregister();
      release();
      if (isCurrent()) setPlaying(false);
    };
    const cancel = () => cleanup();
    const onVisibility = () => { if (document.hidden) cancel(); };
    const fallback = () => {
      if (ended || !isCurrent()) return;
      cleanup();
      readFallback();
    };
    release = claimAudioFocus('voice', cancel);
    unregister = registerAudioElement(audio, 'voice');
    cancelOwned.current = cancel;
    audio.onended = cleanup;
    audio.onerror = fallback;
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', cancel);
    setPlaying(true);
    void audio.play().catch(fallback);
  }, [clips, stop]);

  return <VoiceContext.Provider value={{ childId, setChildId, clips, saveClip, deleteClip, speak, stop, playing }}>
    {children}
  </VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  return useContext(VoiceContext);
}

/** Convenience for existing dynamic read-aloud controls. */
export function speakText(text: string): void {
  ttsSpeak(text);
}
