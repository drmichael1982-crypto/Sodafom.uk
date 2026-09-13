import { channelVolume, claimAudioFocus, subscribeAudioSettings } from './audio-policy';

export type SpeechResult = 'finished' | 'cancelled' | 'muted' | 'unavailable' | 'error';

export interface NativeSpeech {
  speak(options: { text: string }): Promise<{ status?: string }>;
  stop(): Promise<unknown>;
}

export interface SpeechPlayback {
  finished: Promise<SpeechResult>;
  stop: () => void;
}

export interface SpeechOptions {
  native?: NativeSpeech | null;
  onBoundary?: (characterIndex: number) => void;
}

const captionListeners = new Set<() => void>();
let caption = '';
let captionVersion = 0;

export function getSpeechCaption(): string {
  return caption;
}

export function subscribeSpeechCaption(listener: () => void): () => void {
  captionListeners.add(listener);
  return () => captionListeners.delete(listener);
}

export function clearSpeechCaption(): void {
  if (!caption) return;
  caption = '';
  captionVersion += 1;
  captionListeners.forEach(listener => listener());
}

function setSpeechCaption(text: string): number {
  // Captions are deliberately transient: never localStorage, never analytics,
  // never a provider request. Limit their in-memory footprint as well.
  caption = text.slice(0, 2_000);
  captionVersion += 1;
  captionListeners.forEach(listener => listener());
  return captionVersion;
}

function clearCaptionIfCurrent(version: number): void {
  if (version === captionVersion) clearSpeechCaption();
}

/** Preserve display text; remove formatting only from the spoken/caption text. */
export function cleanSpeakableText(text: string): string {
  return text
    .replace(/\[PLAY:[^\]]+\]/g, ' ')
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, '$1')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/(\d)\s*[×*xX]\s*(\d)/g, '$1 times $2')
    .replace(/(\d)\s*÷\s*(\d)/g, '$1 divided by $2')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
    .replace(/(\d)\s*=\s*(\d)/g, '$1 equals $2')
    .replace(/(\d)\s*%/g, '$1 percent')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*|__|~~/g, '')
    .replace(/[>*_]/g, ' ')
    .replace(/\b[xX]{2,}\b/g, ' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([!?.,])\1{1,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function speechChunks(text: string, limit = 480): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > limit) {
    const prefix = remaining.slice(0, limit);
    const sentence = Math.max(prefix.lastIndexOf('. '), prefix.lastIndexOf('? '), prefix.lastIndexOf('! '));
    const word = prefix.lastIndexOf(' ');
    const end = sentence > 120 ? sentence + 2 : word > 0 ? word + 1 : limit;
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function preferredVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const localEnglish = voices.filter(voice => voice.localService && /^en(?:[-_]|$)/i.test(voice.lang));
  const youthfulUk = localEnglish.find(voice => /^en[-_]gb$/i.test(voice.lang)
    && /\b(boy|young|child)\b/i.test(voice.name)
    && !/\b(female|girl|woman)\b/i.test(voice.name));
  return youthfulUk
    ?? localEnglish.find(voice => /^en[-_]gb$/i.test(voice.lang))
    ?? localEnglish[0]
    ?? voices.find(voice => /^en(?:[-_]|$)/i.test(voice.lang))
    ?? null;
}

let stopCurrentSpeech = () => {};

export function stopSpeech(): void {
  stopCurrentSpeech();
  clearSpeechCaption();
}

/**
 * One cancellable session owns voice loading, speech callbacks and focus.
 * It neither records audio nor sends text to an AI/provider service.
 */
export function speakAudio(text: string, options: SpeechOptions = {}): SpeechPlayback {
  stopCurrentSpeech();
  const spoken = cleanSpeakableText(text);
  const captionToken = spoken ? setSpeechCaption(spoken) : captionVersion;
  const immediate = (result: SpeechResult): SpeechPlayback => ({ finished: Promise.resolve(result), stop: () => {} });
  if (!spoken) return immediate('finished');
  if (typeof window === 'undefined' || window.document.hidden) {
    clearCaptionIfCurrent(captionToken);
    return immediate('unavailable');
  }
  if (channelVolume('voice') === 0) {
    clearCaptionIfCurrent(captionToken);
    return immediate('muted');
  }

  let resolve!: (result: SpeechResult) => void;
  const finished = new Promise<SpeechResult>(done => { resolve = done; });
  const synth = window.speechSynthesis;
  const chunks = speechChunks(spoken);
  let chunkIndex = 0;
  let offset = 0;
  let closed = false;
  let nativeStarted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let release = () => {};
  let unsubscribe = () => {};
  let clearVoiceWait = () => {};

  const finish = (result: SpeechResult) => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    clearVoiceWait();
    unsubscribe();
    window.document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', cancel);
    if (utterance) utterance.onend = utterance.onerror = utterance.onboundary = null;
    if (result !== 'finished') {
      try { synth?.cancel(); } catch { /* Browser may already be closing. */ }
      if (nativeStarted) void options.native?.stop().catch(() => {});
    }
    release();
    if (stopCurrentSpeech === cancel) stopCurrentSpeech = () => {};
    clearCaptionIfCurrent(captionToken);
    resolve(result);
  };
  const cancel = () => finish('cancelled');
  const onVisibility = () => { if (window.document.hidden) cancel(); };
  const armWatchdog = () => {
    clearTimeout(timer);
    timer = setTimeout(() => finish('error'), 120_000);
  };
  const browserChunk = () => {
    if (closed) return;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      finish('unavailable');
      return;
    }
    utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
    const voice = preferredVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-GB';
    }
    utterance.rate = 0.94;
    utterance.pitch = 1.18;
    utterance.volume = channelVolume('voice');
    utterance.onboundary = event => { if (!closed) options.onBoundary?.(offset + event.charIndex); };
    utterance.onerror = () => finish('error');
    utterance.onend = () => {
      if (closed) return;
      offset += chunks[chunkIndex].length;
      chunkIndex += 1;
      if (chunkIndex === chunks.length) finish('finished');
      else browserChunk();
    };
    armWatchdog();
    try { synth.speak(utterance); } catch { finish('error'); }
  };
  const startBrowser = () => {
    if (closed) return;
    if (!synth) {
      finish('unavailable');
      return;
    }
    if (synth.getVoices().length) {
      browserChunk();
      return;
    }
    let started = false;
    const startOnce = () => {
      if (closed || started || !synth.getVoices().length) return;
      started = true;
      clearVoiceWait();
      browserChunk();
    };
    const waiting = setTimeout(() => {
      if (closed || started) return;
      started = true;
      clearVoiceWait();
      browserChunk();
    }, 1_000);
    synth.addEventListener('voiceschanged', startOnce);
    clearVoiceWait = () => {
      clearTimeout(waiting);
      synth.removeEventListener('voiceschanged', startOnce);
    };
  };
  const nativeChunk = () => {
    if (closed || !options.native) return;
    nativeStarted = true;
    armWatchdog();
    void options.native.speak({ text: chunks[chunkIndex] }).then(result => {
      if (closed) return;
      if (result.status === 'stopped' || result.status === 'replaced') {
        finish('cancelled');
        return;
      }
      offset += chunks[chunkIndex].length;
      chunkIndex += 1;
      if (chunkIndex === chunks.length) finish('finished');
      else nativeChunk();
    }).catch(() => {
      if (closed) return;
      // A native failure falls back only for the unread chunk and never after Stop.
      void options.native?.stop().catch(() => {}).finally(() => { if (!closed) startBrowser(); });
    });
  };

  stopCurrentSpeech = cancel;
  release = claimAudioFocus('voice', cancel);
  unsubscribe = subscribeAudioSettings(() => {
    const volume = channelVolume('voice');
    if (volume === 0) finish('muted');
    else if (utterance) utterance.volume = volume;
  });
  window.document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', cancel);
  if (options.native) nativeChunk();
  else startBrowser();
  return { finished, stop: cancel };
}
