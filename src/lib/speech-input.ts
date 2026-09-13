/**
 * Explicit, single-shot browser microphone helpers. Browser recognition may
 * use the browser vendor's own service; this module does not upload or persist
 * transcripts, and it never starts a microphone without a user action.
 */
import { claimAudioFocus } from './audio-policy';

export type MicState = 'off' | 'requesting' | 'listening' | 'error';

export interface RecognitionResult {
  isFinal?: boolean;
  0?: { transcript: string };
}

export interface RecognitionEvent {
  resultIndex?: number;
  results: ArrayLike<RecognitionResult>;
}

export interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  abort(): void;
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
  lang?: string;
  timeoutMs?: number;
}

export function supportsSpeechInput(host: SpeechHost): boolean {
  return host.isSecureContext !== false && Boolean(host.SpeechRecognition || host.webkitSpeechRecognition);
}

export function microphoneError(code: string): string {
  if (['not-allowed', 'service-not-allowed', 'NotAllowedError', 'SecurityError'].includes(code)) {
    return 'Microphone permission was not allowed. Ask an adult to check browser settings, or use typing and buttons.';
  }
  if (['audio-capture', 'NotFoundError', 'NotReadableError'].includes(code)) {
    return 'No working microphone was found. Check the microphone connection, or use typing and buttons.';
  }
  if (code === 'no-speech') {
    return 'No clear speech was heard. Move away from background noise and try again, or use typing and buttons.';
  }
  if (code === 'network') {
    return 'The browser speech service is unavailable. Check your connection, or use typing and buttons.';
  }
  return 'Voice input stopped. You can try again, or use typing and buttons.';
}

/** Call only from a deliberate microphone-button action. Never retries a denial. */
export function startSpeechInput(
  options: ListenOptions,
  host: SpeechHost = typeof window === 'undefined' ? {} : window as unknown as SpeechHost,
): () => void {
  const Constructor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
  if (!supportsSpeechInput(host) || !Constructor) {
    options.onState('error', 'Voice input is unavailable here. Use a secure HTTPS page and a supported browser, or type and tap instead.');
    return () => {};
  }
  if (host.document?.hidden) {
    options.onState('off', 'Microphone off. Return to this page and tap the microphone.');
    return () => {};
  }
  let recognition: Recognition;
  try {
    recognition = new Constructor();
  } catch {
    options.onState('error', microphoneError('audio-capture'));
    return () => {};
  }

  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let release = () => {};
  const finish = (state: MicState = 'off', message = 'Microphone off.') => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    recognition.onstart = recognition.onend = recognition.onresult = recognition.onerror = null;
    host.document?.removeEventListener('visibilitychange', onVisibility);
    host.removeEventListener?.('pagehide', onPageHide);
    try { recognition.abort(); } catch { /* Some engines throw once already stopped. */ }
    release();
    options.onState(state, message);
  };
  const onVisibility = () => { if (host.document?.hidden) finish(); };
  const onPageHide = () => finish();

  recognition.lang = options.lang ?? 'en-GB';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => {
    if (!finished) options.onState('listening', 'Microphone on. Listening. Tap Stop to switch it off.');
  };
  recognition.onresult = event => {
    if (finished) return;
    for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (!result || result.isFinal === false) continue;
      const transcript = result[0]?.transcript?.trim();
      if (!transcript) continue;
      // Release the microphone before a caller can choose to respond aloud.
      finish();
      options.onTranscript(transcript);
      return;
    }
  };
  recognition.onerror = event => finish(
    event.error === 'aborted' ? 'off' : 'error',
    event.error === 'aborted' ? 'Microphone off.' : microphoneError(event.error),
  );
  recognition.onend = () => finish();
  release = claimAudioFocus('microphone', () => finish());
  host.document?.addEventListener('visibilitychange', onVisibility);
  host.addEventListener?.('pagehide', onPageHide);
  options.onState('requesting', 'Waiting for microphone permission. Tap Stop to cancel.');
  const timeout = Number.isFinite(options.timeoutMs) ? Math.max(1_000, Math.min(60_000, options.timeoutMs!)) : 12_000;
  timer = setTimeout(() => finish('off', 'Microphone off. No clear answer was received; try again or tap an answer.'), timeout);
  try {
    recognition.start();
  } catch {
    finish('error', microphoneError('audio-capture'));
  }
  return () => finish();
}

/** These constraints apply to clip recording, not necessarily browser recognition. */
export const RECORDING_CONSTRAINTS: MediaStreamConstraints = {
  video: false,
  audio: {
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true },
    channelCount: { ideal: 1 },
  },
};

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach(track => track.stop());
}

export function recordingMimeType(recorder: typeof MediaRecorder): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']
    .find(type => recorder.isTypeSupported(type));
}

export type RecordingState = 'off' | 'requesting' | 'recording' | 'processing' | 'error';

export interface RecordingHost {
  isSecureContext?: boolean;
  navigator?: { mediaDevices?: Pick<MediaDevices, 'getUserMedia'> };
  MediaRecorder?: typeof MediaRecorder;
  document?: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
  addEventListener?: Window['addEventListener'];
  removeEventListener?: Window['removeEventListener'];
}

export interface RecordingHandle {
  stop: () => void;
  cancel: () => void;
}

/**
 * Bounded, explicit clip recording. A late permission resolution after Cancel
 * is immediately stopped; a clip is returned only to the caller, which must
 * require a separate Save action before any device-local persistence.
 */
export function startVoiceRecording(
  options: {
    onState: (state: RecordingState, message: string) => void;
    onBlob: (blob: Blob) => void;
    maxMs?: number;
    maxBytes?: number;
  },
  host: RecordingHost = typeof window === 'undefined' ? {} : window,
): RecordingHandle {
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
    clearTimeout(timer);
    clearTimeout(stopTimer);
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      try { if (recorder.state !== 'inactive') recorder.stop(); } catch { /* Already stopped. */ }
    }
    stopMediaStream(stream);
    host.document?.removeEventListener('visibilitychange', onVisibility);
    host.removeEventListener?.('pagehide', cancel);
    release();
    options.onState(state, message);
  };
  const cancel = () => finish();
  const onVisibility = () => { if (host.document?.hidden) cancel(); };
  const stop = () => {
    if (closed) return;
    if (!recorder || recorder.state !== 'recording') {
      if (!recorder) cancel();
      return;
    }
    clearTimeout(timer);
    options.onState('processing', 'Microphone off. Preparing your recording.');
    stopTimer = setTimeout(() => finish('error', 'The recording could not finish. Please try again.'), 3_000);
    try {
      // Keep the stream alive until MediaRecorder supplies its final chunk.
      recorder.stop();
    } catch {
      finish('error', microphoneError('audio-capture'));
    }
  };

  if (host.isSecureContext === false || !host.navigator?.mediaDevices?.getUserMedia || !host.MediaRecorder) {
    finish('error', 'Recording is unavailable here. Use a secure HTTPS page and a supported browser.');
    return { stop, cancel };
  }
  if (host.document?.hidden) {
    finish();
    return { stop, cancel };
  }

  release = claimAudioFocus('microphone', cancel);
  host.document?.addEventListener('visibilitychange', onVisibility);
  host.addEventListener?.('pagehide', cancel);
  options.onState('requesting', 'Waiting for microphone permission. Tap Cancel to switch it off.');
  // A browser permission prompt cannot be aborted, so safely close a late stream below.
  timer = setTimeout(() => finish('off', 'Microphone request cancelled. Tap Record to try again.'), 30_000);
  try {
    void host.navigator.mediaDevices.getUserMedia(RECORDING_CONSTRAINTS).then(acquired => {
      if (closed) {
        stopMediaStream(acquired);
        return;
      }
      stream = acquired;
      clearTimeout(timer);
      try {
        const Constructor = host.MediaRecorder!;
        const mimeType = recordingMimeType(Constructor);
        recorder = mimeType ? new Constructor(stream, { mimeType }) : new Constructor(stream);
        recorder.ondataavailable = event => {
          if (!closed && event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => finish('error', microphoneError('audio-capture'));
        recorder.onstop = () => {
          if (closed) return;
          const blob = new Blob(chunks, { type: recorder?.mimeType || chunks[0]?.type || 'application/octet-stream' });
          const maxBytes = Number.isFinite(options.maxBytes) ? Math.max(1, Math.min(2_000_000, options.maxBytes!)) : 1_500_000;
          if (!blob.size || blob.size > maxBytes) {
            finish('error', blob.size ? 'The recording is too large. Please keep it short and try again.' : 'No audio was recorded. Please try again.');
            return;
          }
          finish('off', 'Microphone off. Your recording is ready to preview.');
          options.onBlob(blob);
        };
        recorder.start();
        options.onState('recording', 'Microphone on. Recording your clip. Tap Stop when you finish.');
        const maxMs = Number.isFinite(options.maxMs) ? Math.max(1_000, Math.min(8_000, options.maxMs!)) : 8_000;
        timer = setTimeout(stop, maxMs);
      } catch {
        finish('error', microphoneError('audio-capture'));
      }
    }).catch(error => {
      if (!closed) finish('error', microphoneError(error instanceof Error ? error.name : 'audio-capture'));
    });
  } catch {
    finish('error', microphoneError('audio-capture'));
  }
  return { stop, cancel };
}
