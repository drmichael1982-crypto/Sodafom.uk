import {
  channelVolume, claimAudioFocus, getCharacterProfile,
  selectCharacterVoice, subscribeAudioFocus, subscribeAudioSettings,
} from './audio-policy';

export type SpeechResult = 'finished' | 'cancelled' | 'muted' | 'unavailable' | 'error';
export interface NativeSpeech {
  speak(options: { text: string; characterId: string; role: string; rate: number; pitch: number; volume: number }): Promise<{ status?: string }>;
  stop(): Promise<unknown>;
}
export interface SpeechOptions {
  character?: string; native?: NativeSpeech | null;
  onBoundary?: (characterIndex: number) => void;
}
export interface SpeechPlayback { finished: Promise<SpeechResult>; stop: () => void }
let stopCurrent = () => {};
export function stopSpeech(): void { stopCurrent(); }

/** Preserve display text; remove formatting only from the spoken version. */
export function cleanSpeakableText(text: string): string {
  return text.replace(/\[PLAY:[^\]]+\]/g, ' ')
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, '$1')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/(\d)\s*[×*xX]\s*(\d)/g, '$1 times $2')
    .replace(/(\d)\s*÷\s*(\d)/g, '$1 divided by $2')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
    .replace(/(\d)\s*=\s*(\d)/g, '$1 equals $2')
    .replace(/(\d)\s*%/g, '$1 percent')
    .replace(/`([^`]+)`/g, '$1').replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*|__|~~/g, '').replace(/[>*_]/g, ' ')
    .replace(/\b[xX]{2,}\b/g, ' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\s+([,.!?;:])/g, '$1').replace(/([!?.,])\1{1,}/g, '$1')
    .replace(/\s{2,}/g, ' ').trim();
}
export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 600) {
    const prefix = remaining.slice(0, 600);
    const sentence = Math.max(prefix.lastIndexOf('. '), prefix.lastIndexOf('? '), prefix.lastIndexOf('! '));
    const end = sentence > 150 ? sentence + 2 : Math.max(prefix.lastIndexOf(' ') + 1, 1);
    const cut = end > 1 ? end : 600;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
/** One cancellable session owns voice loading, playback, native fallback and cleanup. */
export function speakAudio(text: string, options: SpeechOptions = {}): SpeechPlayback {
  stopCurrent();
  const profile = getCharacterProfile(options.character);
  const speakable = cleanSpeakableText(text);
  const immediate = (result: SpeechResult): SpeechPlayback => ({ finished: Promise.resolve(result), stop: () => {} });
  // Dogs are never passed to either human speech engine.
  if (profile.role === 'dog') return immediate('unavailable');
  if (!speakable) return immediate('finished');
  if (typeof window === 'undefined' || window.document.hidden) return immediate('unavailable');
  if (channelVolume('voice') === 0) return immediate('muted');

  let resolve!: (result: SpeechResult) => void;
  const finished = new Promise<SpeechResult>(done => { resolve = done; });
  let closed = false;
  let release = () => {};
  let offSettings = () => {};
  let clearVoiceWait = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  const synth = window.speechSynthesis;
  const native = options.native;
  let nativeStarted = false;
  const finish = (result: SpeechResult) => {
    if (closed) return;
    closed = true;
    clearTimeout(timer); clearVoiceWait(); offSettings();
    window.document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('pagehide', onPageHide);
    if (utterance) utterance.onend = utterance.onerror = utterance.onboundary = null;
    if (result !== 'finished') {
      try { synth?.cancel(); } catch { /* Browser may be shutting down. */ }
      if (nativeStarted) void native?.stop().catch(() => {});
    }
    release();
    if (stopCurrent === cancel) stopCurrent = () => {};
    resolve(result);
  };
  const cancel = () => finish('cancelled');
  const onHidden = () => { if (window.document.hidden) cancel(); };
  const onPageHide = () => cancel();
  stopCurrent = cancel;
  release = claimAudioFocus('voice', cancel);
  offSettings = subscribeAudioSettings(() => {
    if (channelVolume('voice') === 0) finish('muted');
    else if (utterance) utterance.volume = channelVolume('voice');
  });
  window.document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', onPageHide);
  const chunks = speechChunks(speakable);
  let chunkIndex = 0;
  let offset = 0;
  // Bounded watchdog: a failed engine must not leave the mic/music locked forever.
  const armWatchdog = () => {
    clearTimeout(timer);
    timer = setTimeout(() => finish('error'), 120000);
  };
  const browserChunk = () => {
    if (closed) return;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { finish('unavailable'); return; }
    const selection = selectCharacterVoice(profile.id, synth.getVoices());
    if (!selection.voice) { finish('unavailable'); return; }
    utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
    utterance.voice = selection.voice;
    utterance.lang = selection.voice.lang;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = channelVolume('voice');
    utterance.onboundary = event => { if (!closed) options.onBoundary?.(offset + event.charIndex); };
    utterance.onerror = () => finish('error');
    utterance.onend = () => {
      if (closed) return;
      offset += chunks[chunkIndex].length;
      chunkIndex++;
      if (chunkIndex === chunks.length) finish('finished'); else browserChunk();
    };
    armWatchdog();
    try { synth.speak(utterance); } catch { finish('error'); }
  };
  const startBrowser = () => {
    if (closed) return;
    if (!synth) { finish('unavailable'); return; }
    if (synth.getVoices().length) { browserChunk(); return; }
    let started = false;
    const startOnce = () => {
      if (closed || started) return;
      // A premature empty voiceschanged event should not consume the timer fallback.
      if (!synth.getVoices().length) return;
      started = true; clearVoiceWait(); browserChunk();
    };
    const waiting = setTimeout(() => {
      if (closed || started) return;
      started = true; clearVoiceWait(); browserChunk();
    }, 1000);
    synth.addEventListener('voiceschanged', startOnce);
    clearVoiceWait = () => { clearTimeout(waiting); synth.removeEventListener('voiceschanged', startOnce); };
  };
  const nativeChunk = () => {
    if (closed || !native) return;
    nativeStarted = true; armWatchdog();
    void native.speak({ text: chunks[chunkIndex], characterId: profile.id, role: profile.role,
      rate: profile.rate, pitch: profile.pitch, volume: channelVolume('voice') }).then(result => {
      if (closed) return;
      if (result.status === 'stopped' || result.status === 'replaced') { finish('cancelled'); return; }
      offset += chunks[chunkIndex].length; chunkIndex++;
      if (chunkIndex === chunks.length) finish('finished'); else nativeChunk();
    }).catch(() => {
      if (closed) return; // Never resurrect a cancelled utterance through a late fallback.
      // Retry only the failed chunk, never an already-read paragraph.
      void native.stop().catch(() => {}).finally(() => { if (!closed) startBrowser(); });
    });
  };
  if (native) nativeChunk(); else startBrowser();
  return { finished, stop: cancel };
}

export type ActionSound = 'tap' | 'success' | 'gentle-pop';
export type DogName = 'jessica' | 'sally' | 'daisy';
let effectsContext: AudioContext | undefined;
let effectsGeneration = 0;
const activeEffects = new Set<() => void>();
export function stopSoundEffects(): void {
  effectsGeneration++;
  [...activeEffects].forEach(stop => stop());
}
/** Optional, short procedural reactions. Never queued to surprise a child after teaching. */
export async function playActionSound(action: ActionSound | DogName, reaction: 'bark' | 'happy' = 'bark'): Promise<boolean> {
  if (typeof window === 'undefined' || window.document.hidden || channelVolume('effects') === 0) return false;
  const effectToken = effectsGeneration;
  const Constructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) return false;
  try {
    effectsContext ??= new Constructor();
    const context = effectsContext;
    if (context.state === 'suspended') await context.resume();
    if (effectToken !== effectsGeneration || channelVolume('effects') === 0 || window.document.hidden) return false;
    const gain = context.createGain();
    const nodes: OscillatorNode[] = [];
    const now = context.currentTime;
    const isDog = ['jessica', 'sally', 'daisy'].includes(action);
    const duration = isDog ? (reaction === 'happy' ? 0.22 : 0.32) : 0.16;
    const loudness = channelVolume('effects') * (isDog ? 0.18 : 0.15);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(loudness, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    gain.connect(context.destination);
    const pitch = action === 'jessica' ? 235 : action === 'sally' ? 185 : action === 'daisy' ? 280 : action === 'success' ? 660 : 510;
    // Low, brief harmonic "woof" reactions, not text-to-speech or human words.
    const frequencies = isDog ? [pitch, pitch * 2.8] : [pitch];
    for (const frequency of frequencies) {
      const oscillator = context.createOscillator();
      oscillator.type = isDog ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * (isDog ? 0.56 : 1.12), now + duration);
      oscillator.connect(gain); oscillator.start(now); oscillator.stop(now + duration); nodes.push(oscillator);
    }
    let cleaned = false;
    let settle!: (played: boolean) => void;
    const completed = new Promise<boolean>(resolve => { settle = resolve; });
    const cancelEffect = () => cleanup(false);
    const cleanup = (played = false) => {
      if (cleaned) return; cleaned = true;
      clearTimeout(timer); offSettings(); offFocus();
      window.document.removeEventListener('visibilitychange', hide);
      nodes.forEach(node => { try { node.stop(); } catch { /* Already ended. */ } node.disconnect(); });
      gain.disconnect(); activeEffects.delete(cancelEffect); settle(played);
    };
    const silenceIfNeeded = () => { if (channelVolume('effects') === 0) cleanup(); };
    const hide = () => { if (window.document.hidden) cleanup(); };
    const offSettings = subscribeAudioSettings(silenceIfNeeded);
    const offFocus = subscribeAudioFocus(silenceIfNeeded);
    const timer = setTimeout(() => cleanup(true), duration * 1000 + 30);
    activeEffects.add(cancelEffect);
    window.document.addEventListener('visibilitychange', hide);
    return completed;
  } catch { return false; }
}
