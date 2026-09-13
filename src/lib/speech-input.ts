/** Browser recognition can use the browser vendor's online service. No app upload or transcript storage. */
import { claimAudioFocus } from './audio-policy';
export type MicState = 'off' | 'requesting' | 'listening' | 'error';
export interface RecognitionResult { isFinal?: boolean; 0?: { transcript: string } }
export interface RecognitionEvent { resultIndex?: number; results: ArrayLike<RecognitionResult> }
export interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  onstart: (() => void) | null; onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void; abort(): void;
}
export interface SpeechHost {
  isSecureContext?: boolean;
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
  document?: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
  addEventListener?: Window['addEventListener'];
  removeEventListener?: Window['removeEventListener'];
}
export interface ListenOptions {
  onState: (state: MicState, message: string) => void;
  onTranscript: (text: string) => void;
  lang?: string; timeoutMs?: number;
}
export function supportsSpeechInput(host: SpeechHost): boolean {
  return host.isSecureContext !== false && !!(host.SpeechRecognition || host.webkitSpeechRecognition);
}
export function microphoneError(code: string): string {
  if (['not-allowed', 'service-not-allowed', 'NotAllowedError', 'SecurityError'].includes(code)) return 'Microphone permission was not allowed. Ask an adult to check browser settings, or use typing and buttons.';
  if (['audio-capture', 'NotFoundError', 'NotReadableError'].includes(code)) return 'No working microphone was found. Check the microphone connection, or use typing and buttons.';
  if (code === 'no-speech') return 'No clear speech was heard. Move away from background noise and try again, or use typing and buttons.';
  if (code === 'network') return 'The browser speech service is unavailable. Check your connection, or use typing and buttons.';
  return 'Voice input stopped. You can try again, or use typing and buttons.';
}
/** Call only from a deliberate mic-button action. Never retries denied permissions. */
export function startSpeechInput(options: ListenOptions, host: SpeechHost = typeof window === 'undefined' ? {} : window as unknown as SpeechHost): () => void {
  const Constructor = host.SpeechRecognition || host.webkitSpeechRecognition;
  if (!supportsSpeechInput(host) || !Constructor) {
    options.onState('error', 'Voice input is unavailable here. Use a secure HTTPS page and a supported browser, or type and tap instead.');
    return () => {};
  }
  if (host.document?.hidden) { options.onState('off', 'Microphone off. Return to this page and tap the microphone.'); return () => {}; }
  let recognition: Recognition;
  try { recognition = new Constructor(); } catch { options.onState('error', microphoneError('audio-capture')); return () => {}; }
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let release = () => {};
  const finish = (state: MicState = 'off', message = 'Microphone off.') => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    recognition.onstart = recognition.onend = recognition.onresult = recognition.onerror = null;
    host.document?.removeEventListener('visibilitychange', onHidden);
    host.removeEventListener?.('pagehide', onPageHide);
    try { recognition.abort(); } catch { /* Already stopped. */ }
    release();
    options.onState(state, message);
  };
  const onHidden = () => { if (host.document?.hidden) finish(); };
  const onPageHide = () => finish();
  recognition.lang = options.lang || 'en-GB';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => { if (!finished) options.onState('listening', 'Microphone on. Listening. Tap Stop to switch it off.'); };
  recognition.onresult = event => {
    if (finished) return;
    for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
      const result = event.results[i];
      if (!result || result.isFinal === false) continue;
      const text = result[0]?.transcript?.trim();
      if (!text) continue;
      finish(); // Release microphone BEFORE a caller speaks its response.
      options.onTranscript(text);
      return;
    }
  };
  recognition.onerror = event => finish(event.error === 'aborted' ? 'off' : 'error', event.error === 'aborted' ? 'Microphone off.' : microphoneError(event.error));
  recognition.onend = () => finish();
  release = claimAudioFocus('microphone', () => finish());
  host.document?.addEventListener('visibilitychange', onHidden);
  host.addEventListener?.('pagehide', onPageHide);
  options.onState('requesting', 'Waiting for microphone permission. Tap Stop to cancel.');
  const duration = Number.isFinite(options.timeoutMs) ? Math.max(1000, Math.min(60000, options.timeoutMs!)) : 12000;
  timer = setTimeout(() => finish('off', 'Microphone off. No clear answer was received; try again or tap an answer.'), duration);
  try { recognition.start(); } catch { finish('error', microphoneError('audio-capture')); }
  return () => finish();
}
/** Noise controls apply to recordings, NOT necessarily the browser's recognition engine. */
export const RECORDING_CONSTRAINTS: MediaStreamConstraints = {
  video: false, audio: { echoCancellation: { ideal: true }, noiseSuppression: { ideal: true }, autoGainControl: { ideal: true }, channelCount: { ideal: 1 } },
};
export function stopMediaStream(stream: MediaStream | null | undefined): void { stream?.getTracks().forEach(track => track.stop()); }
export function recordingMimeType(recorder: typeof MediaRecorder): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find(type => recorder.isTypeSupported(type));
}

export type RecordingState = 'off' | 'requesting' | 'recording' | 'processing' | 'error';
export interface RecordingHost {
  isSecureContext?: boolean;
  navigator?: { mediaDevices?: Pick<MediaDevices, 'getUserMedia'> };
  MediaRecorder?: typeof MediaRecorder;
  document?: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
  addEventListener?: Window['addEventListener']; removeEventListener?: Window['removeEventListener'];
}
export interface RecordingHandle { stop: () => void; cancel: () => void }
/** Bounded, explicit clip recording. A permission prompt resolving after Cancel is safely discarded. */
export function startVoiceRecording(options: {
  onState: (state: RecordingState, message: string) => void;
  onBlob: (blob: Blob) => void;
  maxMs?: number;
}, host: RecordingHost = typeof window === 'undefined' ? {} : window): RecordingHandle {
  let closed = false;
  let stream: MediaStream | undefined;
  let recorder: MediaRecorder | undefined;
  let release = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopTimer: ReturnType<typeof setTimeout> | undefined;
  const chunks: Blob[] = [];
  const finish = (state: RecordingState = 'off', message = 'Microphone off.') => {
    if (closed) return;
    closed = true;
    clearTimeout(timer); clearTimeout(stopTimer);
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      try { if (recorder.state !== 'inactive') recorder.stop(); } catch { /* Already stopped. */ }
    }
    stopMediaStream(stream); release();
    host.document?.removeEventListener('visibilitychange', onHidden);
    host.removeEventListener?.('pagehide', cancel);
    options.onState(state, message);
  };
  const cancel = () => finish();
  const onHidden = () => { if (host.document?.hidden) cancel(); };
  const stop = () => {
    if (closed) return;
    if (!recorder || recorder.state !== 'recording') { if (!recorder) cancel(); return; }
    clearTimeout(timer);
    options.onState('processing', 'Microphone off. Preparing your recording.');
    stopTimer = setTimeout(() => finish('error', 'The recording could not finish. Please try again.'), 3000);
    try { recorder.stop(); stopMediaStream(stream); } catch { finish('error', microphoneError('audio-capture')); }
  };
  if (host.isSecureContext === false || !host.navigator?.mediaDevices?.getUserMedia || !host.MediaRecorder) {
    finish('error', 'Recording is unavailable here. Use a secure HTTPS page and a supported browser.');
    return { stop, cancel };
  }
  if (host.document?.hidden) { finish(); return { stop, cancel }; }
  release = claimAudioFocus('microphone', cancel);
  host.document?.addEventListener('visibilitychange', onHidden);
  host.addEventListener?.('pagehide', cancel);
  options.onState('requesting', 'Waiting for microphone permission. Tap Cancel to switch it off.');
  // The permission request itself cannot be aborted; late streams are stopped below.
  timer = setTimeout(() => finish('off', 'Microphone request cancelled. Tap Record to try again.'), 30000);
  try {
    void host.navigator.mediaDevices.getUserMedia(RECORDING_CONSTRAINTS).then(acquired => {
      if (closed) { stopMediaStream(acquired); return; }
      stream = acquired;
      clearTimeout(timer);
      try {
        const Constructor = host.MediaRecorder!;
        const mimeType = recordingMimeType(Constructor);
        recorder = mimeType ? new Constructor(stream, { mimeType }) : new Constructor(stream);
        recorder.ondataavailable = event => { if (!closed && event.data.size > 0) chunks.push(event.data); };
        recorder.onerror = () => finish('error', microphoneError('audio-capture'));
        recorder.onstop = () => {
          if (closed) return;
          const blob = new Blob(chunks, { type: recorder?.mimeType || chunks[0]?.type || 'application/octet-stream' });
          finish(blob.size ? 'off' : 'error', blob.size ? 'Microphone off. Your recording is ready to preview.' : 'No audio was recorded. Please try again.');
          if (blob.size) options.onBlob(blob);
        };
        recorder.start();
        options.onState('recording', 'Microphone on. Recording your clip. Tap Stop when you finish.');
        const duration = Number.isFinite(options.maxMs) ? Math.max(1000, Math.min(8000, options.maxMs!)) : 8000;
        timer = setTimeout(stop, duration);
      } catch { finish('error', microphoneError('audio-capture')); }
    }).catch(error => { if (!closed) finish('error', microphoneError(error instanceof Error ? error.name : 'audio-capture')); });
  } catch { finish('error', microphoneError('audio-capture')); }
  return { stop, cancel };
}
