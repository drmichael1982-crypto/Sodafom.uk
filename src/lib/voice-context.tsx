/**
 * VoiceContext — manages the child's recorded voice clips.
 *
 * Each clip is stored as a base64 data-URL in localStorage keyed by:
 *   sodafom-voice-{childId}-{clipKey}
 *
 * clipKey examples:
 *   "welcome"        — played when the child opens the app
 *   "game-intro"     — generic game intro
 *   "well-done"      — praise after a correct answer
 *   "try-again"      — encouragement after a wrong answer
 *   "read:{text}"    — arbitrary text read-aloud (falls back to TTS)
 *
 * When no recording exists for a key, the system falls back to the
 * Web Speech API with a child-friendly voice (UK English, high pitch,
 * slow rate).
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface ArchieSpeechPluginApi {
  speak(options: { text: string }): Promise<{ status?: string }>;
  stop(): Promise<void>;
  isAvailable(): Promise<{ available: boolean }>;
}

// Capacitor 8 no longer reliably exposes custom plugins through
// window.Capacitor.Plugins. Register the native bridge explicitly so Android
// read-aloud does not silently fall back to the WebView speech API.
const ArchieSpeech = registerPlugin<ArchieSpeechPluginApi>('ArchieSpeech');

// ── Types ────────────────────────────────────────────────────────────────────
export type ClipKey =
  | 'welcome'
  | 'game-intro'
  | 'well-done'
  | 'try-again'
  | 'instructions'
  | string; // arbitrary read:{text} keys

export interface VoiceClip {
  key: ClipKey;
  label: string;       // human-readable label shown in the recorder UI
  prompt: string;      // what the child should say when recording
  dataUrl: string;     // base64 audio/webm or audio/ogg
  recordedAt: number;  // timestamp
}

interface VoiceContextValue {
  /** childId currently active (set by hub/profile) */
  childId: string | null;
  setChildId: (id: string | null) => void;

  /** All clips for the active child */
  clips: Record<ClipKey, VoiceClip>;

  /** Save a recorded clip */
  saveClip: (key: ClipKey, label: string, prompt: string, dataUrl: string) => void;

  /** Delete a clip (falls back to TTS) */
  deleteClip: (key: ClipKey) => void;

  /** Play a clip by key — uses recording if available, else TTS */
  speak: (key: ClipKey, fallbackText?: string) => void;

  /** Stop any currently playing audio */
  stop: () => void;

  /** Whether audio is currently playing */
  playing: boolean;
}

// ── Child-friendly TTS voice ─────────────────────────────────────────────────
function pickChildVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  // Prefer a youthful UK male voice when the browser exposes one.
  // Voice names differ by device, so this remains best-effort.
  const preferred = [
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && /(boy|young|male|child)/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && /(boy|young|male|child)/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];
  for (const test of preferred) {
    const match = voices.find(test);
    if (match) return match;
  }
  return voices[0] ?? null;
}

function cleanSpeakableText(text: string): string {
  return text
    // Game launch markers are visual controls, not spoken content.
    .replace(/\[PLAY:[^\]]+\]/g, ' ')
    // Preserve the label from Markdown links but never read the URL aloud.
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, '$1')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    // Convert maths symbols before removing display-only Markdown characters.
    .replace(/(\d)\s*[×*xX]\s*(\d)/g, '$1 times $2')
    .replace(/(\d)\s*÷\s*(\d)/g, '$1 divided by $2')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
    .replace(/(\d)\s*=\s*(\d)/g, '$1 equals $2')
    .replace(/(\d)\s*%/g, '$1 percent')
    // Strip Markdown / formatting noise that Android TTS otherwise announces.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*|__|~~/g, '')
    .replace(/[>*_]/g, ' ')
    // Remove placeholder/noise tokens such as XXX, but keep a single x in words.
    .replace(/\b[xX]{2,}\b/g, ' ')
    // Drop common emoji/decorative pictographs from the spoken version.
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([!?.,])\1{1,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getNativeArchieSpeech(): any | null {
  if (typeof window === 'undefined') return null;
  const plugin = Capacitor.isNativePlatform() ? ArchieSpeech : null;
  console.log('ArchieSpeech Plugin check:', {
    hasCapacitor: true,
    isNativePlatform: Capacitor.isNativePlatform(),
    hasArchieSpeech: !!plugin,
  });
  return plugin ?? null;
}

/**
 * Speak dynamic Archie text. On Android/Capacitor we prefer the native
 * TextToSpeech engine because speechSynthesis in WebView has been unreliable.
 * Falls back to the browser Web Speech API on desktop/web.
 */
function ttsSpeak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }

  const speakable = cleanSpeakableText(text);
  console.log('ttsSpeak starting:', { text, speakable });
  if (!speakable) {
    console.warn('ttsSpeak: Nothing speakable');
    onEnd?.();
    return;
  }

  const native = getNativeArchieSpeech();
  if (native?.speak) {
    console.info('ARCHIE_TTS_START', { engine: 'android-native' });
    native.speak({ text: speakable })
      .then((res: any) => {
        console.info('ARCHIE_TTS_SUCCESS', { engine: 'android-native', response: res });
        onEnd?.();
      })
      .catch((err: unknown) => {
        console.error('ARCHIE_TTS_ERROR', err);
        // If native speech fails, make one browser fallback attempt.
        browserTtsSpeak(speakable, onEnd);
      });
    return;
  }

  console.log('ttsSpeak: Falling back to browser TTS');
  browserTtsSpeak(speakable, onEnd);
}

function browserTtsSpeak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) {
    console.warn('ARCHIE_TTS_UNAVAILABLE');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-GB';
  // A natural, gentle pace. Avoid artificially extreme pitch, which can sound robotic.
  utt.rate = 0.94;
  utt.pitch = 1.24;
  utt.volume = 1;

  const speakNow = () => {
    const voice = pickChildVoice();
    if (voice) utt.voice = voice;
    utt.onend = () => {
      console.info('ARCHIE_TTS_SUCCESS', { engine: 'browser' });
      onEnd?.();
    };
    utt.onerror = (err) => {
      console.error('ARCHIE_TTS_ERROR', err);
      onEnd?.();
    };
    console.info('ARCHIE_TTS_START', { engine: 'browser', voice: voice?.name ?? 'default' });
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    let fired = false;
    const fallbackTimer = window.setTimeout(() => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.onvoiceschanged = null;
      speakNow();
    }, 700);
    window.speechSynthesis.onvoiceschanged = () => {
      if (fired) return;
      fired = true;
      window.clearTimeout(fallbackTimer);
      window.speechSynthesis.onvoiceschanged = null;
      speakNow();
    };
  } else {
    speakNow();
  }
}

function stopTts() {
  if (typeof window === 'undefined') return;
  const native = getNativeArchieSpeech();
  if (native?.stop) {
    native.stop().catch((err: unknown) => console.warn('ARCHIE_TTS_STOP native error', err));
  }
  window.speechSynthesis?.cancel();
  console.info('ARCHIE_TTS_STOP');
}

// ── Storage helpers ──────────────────────────────────────────────────────────
function storageKey(childId: string, clipKey: ClipKey) {
  return `sodafom-voice-${childId}-${clipKey}`;
}

function loadClips(childId: string): Record<ClipKey, VoiceClip> {
  const result: Record<ClipKey, VoiceClip> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`sodafom-voice-${childId}-`)) {
        const clipKey = k.replace(`sodafom-voice-${childId}-`, '');
        const raw = localStorage.getItem(k);
      if (raw) Object.assign(result, { [clipKey]: JSON.parse(raw) as VoiceClip });
      }
    }
  } catch {}
  return result;
}

// ── Context ──────────────────────────────────────────────────────────────────
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setChildId = useCallback((id: string | null) => {
    setChildIdState(id);
    setClips(id ? loadClips(id) : {});
  }, []);

  const saveClip = useCallback(
    (key: ClipKey, label: string, prompt: string, dataUrl: string) => {
      if (!childId) return;
      const clip: VoiceClip = { key, label, prompt, dataUrl, recordedAt: Date.now() };
      try {
        localStorage.setItem(storageKey(childId, key), JSON.stringify(clip));
      } catch {}
      setClips((prev) => ({ ...prev, [key]: clip }));
    },
    [childId]
  );

  const deleteClip = useCallback(
    (key: ClipKey) => {
      if (!childId) return;
      try {
        localStorage.removeItem(storageKey(childId, key));
      } catch {}
      setClips((prev) => {
        const next = { ...prev };
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        Reflect.deleteProperty(next, key);
        return next;
      });
    },
    [childId]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopTts();
    setPlaying(false);
  }, []);

  const speak = useCallback(
    (key: ClipKey, fallbackText?: string) => {
      stop();
      const clip = Object.hasOwn(clips, key) ? clips[key as keyof typeof clips] : undefined;
      if (clip?.dataUrl) {
        // Play recorded audio
        const audio = new Audio(clip.dataUrl);
        audioRef.current = audio;
        setPlaying(true);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          // Fallback to TTS if audio fails
          setPlaying(true);
          ttsSpeak(fallbackText ?? key, () => setPlaying(false));
        };
        audio.play().catch(() => {
          setPlaying(true);
          ttsSpeak(fallbackText ?? key, () => setPlaying(false));
        });
      } else {
        // No recording — use TTS
        const text = fallbackText ?? key;
        setPlaying(true);
        ttsSpeak(text, () => setPlaying(false));
      }
    },
    [clips, stop]
  );

  return (
    <VoiceContext.Provider
      value={{ childId, setChildId, clips, saveClip, deleteClip, speak, stop, playing }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  return useContext(VoiceContext);
}

/** Convenience: speak arbitrary text (uses TTS always — for dynamic content) */
export function speakText(text: string) {
  ttsSpeak(text);
}

/** Export ttsSpeak for use outside React */
export { ttsSpeak, stopTts, cleanSpeakableText };
