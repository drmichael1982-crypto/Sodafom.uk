/** Personal voice clips and the shared, cancellable read-aloud service. */
import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { cleanSpeakableText, speakAudio, stopSpeech, playActionSound, stopSoundEffects, type NativeSpeech, type SpeechOptions, type SpeechPlayback } from './audio-runtime';
import { channelVolume, claimAudioFocus, getCharacterProfile, registerAudioElement } from './audio-policy';

const ArchieSpeech = registerPlugin<NativeSpeech>('ArchieSpeech');
export type ClipKey = 'welcome' | 'game-intro' | 'well-done' | 'try-again' | 'instructions' | string;
export interface VoiceClip { key: ClipKey; label: string; prompt: string; dataUrl: string; recordedAt: number }
interface VoiceContextValue {
  childId: string | null; setChildId: (id: string | null) => void;
  clips: Record<ClipKey, VoiceClip>;
  saveClip: (key: ClipKey, label: string, prompt: string, dataUrl: string) => void;
  deleteClip: (key: ClipKey) => void;
  speak: (key: ClipKey, fallbackText?: string) => void;
  stop: () => void; playing: boolean;
}
function nativeSpeech(): NativeSpeech | null {
  // This plugin is Android-only. Never try an unavailable iOS custom plugin.
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' ? ArchieSpeech : null;
}
export function speakCharacter(character: string, text: string, options: Omit<SpeechOptions, 'character' | 'native'> = {}): SpeechPlayback {
  const profile = getCharacterProfile(character);
  if (profile.role === 'dog') {
    // Procedural dog sounds are optional effects, never human speech.
    const dog = profile.id as 'jessica' | 'sally' | 'daisy';
    let cancelled = false;
    return { finished: playActionSound(dog).then(played => cancelled ? 'cancelled' as const : played ? 'finished' as const : 'muted' as const), stop: () => { cancelled = true; stopSoundEffects(); } };
  }
  return speakAudio(text, { ...options, character, native: nativeSpeech() });
}
/** Sequential character turns. Owners can stop the whole sequence on page exit. */
export function speakCharacterDialogue(lines: readonly { character: string; text: string }[]): SpeechPlayback {
  let cancelled = false;
  let current: SpeechPlayback | undefined;
  const finished = (async () => {
    for (const line of lines) {
      if (cancelled) return 'cancelled' as const;
      current = speakCharacter(line.character, line.text);
      const result = await current.finished;
      if (cancelled || result === 'cancelled') return 'cancelled' as const;
      if (result === 'error' || result === 'unavailable') return result;
    }
    return 'finished' as const;
  })();
  return { finished, stop: () => { cancelled = true; current?.stop(); } };
}
/** Legacy API retained. Cancellation never runs an old "restart the mic" callback. */
export function ttsSpeak(text: string, onEnd?: () => void, character = 'archie'): () => void {
  const playback = speakCharacter(character, text);
  void playback.finished.then(result => { if (result !== 'cancelled') onEnd?.(); });
  return playback.stop;
}
export function stopTts(): void { stopSpeech(); }
export function speakText(text: string): void { ttsSpeak(text); }
export { cleanSpeakableText };
function storageKey(childId: string, clipKey: ClipKey) { return `sodafom-voice-${childId}-${clipKey}`; }
function loadClips(childId: string): Record<ClipKey, VoiceClip> {
  const result: Record<ClipKey, VoiceClip> = {};
  try {
    const prefix = `sodafom-voice-${childId}-`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (raw) Object.assign(result, { [key.slice(prefix.length)]: JSON.parse(raw) as VoiceClip });
    }
  } catch { /* Storage may be disabled. */ }
  return result;
}
const VoiceContext = createContext<VoiceContextValue>({
  childId: null, setChildId: () => {}, clips: {}, saveClip: () => {}, deleteClip: () => {},
  speak: () => {}, stop: () => {}, playing: false,
});
export function VoiceProvider({ children }: { children: ReactNode }) {
  const [childId, setChildIdState] = useState<string | null>(null);
  const [clips, setClips] = useState<Record<ClipKey, VoiceClip>>({});
  const [playing, setPlaying] = useState(false);
  const generation = useRef(0);
  const cancelOwned = useRef<() => void>(() => {});
  const stop = useCallback(() => {
    generation.current++;
    cancelOwned.current(); cancelOwned.current = () => {};
    setPlaying(false);
  }, []);
  useEffect(() => () => { generation.current++; cancelOwned.current(); }, []);
  const setChildId = useCallback((id: string | null) => {
    stop(); setChildIdState(id); setClips(id ? loadClips(id) : {});
  }, [stop]);
  const saveClip = useCallback((key: ClipKey, label: string, prompt: string, dataUrl: string) => {
    if (!childId) return;
    const clip: VoiceClip = { key, label, prompt, dataUrl, recordedAt: Date.now() };
    try { localStorage.setItem(storageKey(childId, key), JSON.stringify(clip)); } catch { /* Session remains usable. */ }
    setClips(previous => ({ ...previous, [key]: clip }));
  }, [childId]);
  const deleteClip = useCallback((key: ClipKey) => {
    if (!childId) return;
    try { localStorage.removeItem(storageKey(childId, key)); } catch { /* Storage unavailable. */ }
    setClips(previous => { const next = { ...previous }; Reflect.deleteProperty(next, key); return next; });
  }, [childId]);
  const speak = useCallback((key: ClipKey, fallbackText?: string) => {
    stop();
    if (channelVolume('voice') === 0) return;
    const token = generation.current;
    const current = () => generation.current === token;
    const readFallback = () => {
      if (!current()) return;
      setPlaying(true);
      const playback = speakCharacter('archie', fallbackText ?? key);
      cancelOwned.current = playback.stop;
      void playback.finished.then(() => { if (current()) setPlaying(false); });
    };
    const clip = Object.hasOwn(clips, key) ? clips[key] : undefined;
    if (!clip?.dataUrl) { readFallback(); return; }
    const audio = new Audio(clip.dataUrl);
    let ended = false;
    let release = () => {};
    let unregister = () => {};
    const cleanup = () => {
      if (ended) return;
      ended = true;
      audio.onended = audio.onerror = null;
      audio.pause(); audio.removeAttribute('src'); audio.load();
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', cancel);
      unregister(); release();
      if (current()) setPlaying(false);
    };
    const cancel = () => { cleanup(); };
    const onHidden = () => { if (document.hidden) cancel(); };
    const fallback = () => { if (ended || !current()) return; cleanup(); readFallback(); };
    release = claimAudioFocus('voice', cancel);
    unregister = registerAudioElement(audio, 'voice');
    cancelOwned.current = cancel;
    audio.onended = cleanup; audio.onerror = fallback;
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', cancel);
    setPlaying(true);
    void audio.play().catch(fallback);
  }, [clips, stop]);
  return <VoiceContext.Provider value={{ childId, setChildId, clips, saveClip, deleteClip, speak, stop, playing }}>{children}</VoiceContext.Provider>;
}
export function useVoice() { return useContext(VoiceContext); }
