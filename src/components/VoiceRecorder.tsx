/**
 * VoiceRecorder — a bounded, explicitly saved personal voice-clip control.
 * A recording stays in memory for preview until the family chooses Save.
 */
import { useEffect, useRef, useState } from 'react';
import { Check, Mic, Play, RefreshCw, Square, Trash2, X } from 'lucide-react';
import { useVoice, type ClipKey } from '@/lib/voice-context';
import { channelVolume, claimAudioFocus, registerAudioElement } from '@/lib/audio-policy';
import { startVoiceRecording, type RecordingHandle, type RecordingState } from '@/lib/speech-input';

interface Props {
  clipKey: ClipKey;
  label: string;
  prompt: string;
  onSaved?: () => void;
  compact?: boolean;
}

type RecorderView = 'idle' | 'countdown' | 'requesting' | 'recording' | 'processing' | 'preview' | 'saved' | 'error';

const COUNTDOWN_SECS = 3;
const MAX_RECORD_SECS = 8;

export default function VoiceRecorder({ clipKey, label, prompt, onSaved, compact = false }: Props) {
  const { clips, saveClip, deleteClip } = useVoice();
  const existing = Object.hasOwn(clips, clipKey) ? clips[clipKey] : undefined;
  const existingDataUrl = existing?.dataUrl ?? null;
  const [view, setView] = useState<RecorderView>(existing ? 'saved' : 'idle');
  const [message, setMessage] = useState('Nothing is saved until you choose Save recording.');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [recordSecs, setRecordSecs] = useState(0);
  const [dataUrl, setDataUrl] = useState<string | null>(existingDataUrl);
  const [playing, setPlaying] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<RecordingHandle | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const awaitingBlobRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioReleaseRef = useRef<() => void>(() => {});
  const unregisterAudioRef = useRef<() => void>(() => {});
  const mountedRef = useRef(true);

  const clearTimers = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (secondsRef.current) clearInterval(secondsRef.current);
    countdownRef.current = null;
    secondsRef.current = null;
  };

  const stopPreview = () => {
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    unregisterAudioRef.current();
    unregisterAudioRef.current = () => {};
    audioReleaseRef.current();
    audioReleaseRef.current = () => {};
    if (mountedRef.current) setPlaying(false);
  };

  const restoreSavedClip = () => {
    clearTimers();
    setDataUrl(existing?.dataUrl ?? null);
    setView(existing ? 'saved' : 'idle');
    setMessage(existing
      ? 'Saved recording kept. Make a new recording only when you are ready to replace it.'
      : 'Nothing is saved until you choose Save recording.');
  };

  const receiveBlob = (blob: Blob) => {
    awaitingBlobRef.current = false;
    const reader = new FileReader();
    readerRef.current?.abort();
    readerRef.current = reader;
    reader.onerror = () => {
      if (!mountedRef.current || readerRef.current !== reader) return;
      setView(existing ? 'saved' : 'idle');
      setMessage('The recording could not be prepared. Your saved recording was not changed.');
    };
    reader.onload = () => {
      if (!mountedRef.current || readerRef.current !== reader || typeof reader.result !== 'string') return;
      setDataUrl(reader.result);
      setView('preview');
      setMessage('Preview only — this recording has not been saved.');
    };
    reader.readAsDataURL(blob);
  };

  const handleRecordingState = (state: RecordingState, nextMessage: string) => {
    setMessage(nextMessage);
    if (state === 'requesting') setView('requesting');
    if (state === 'recording') {
      setView('recording');
      setRecordSecs(0);
      if (secondsRef.current) clearInterval(secondsRef.current);
      secondsRef.current = setInterval(() => setRecordSecs(seconds => Math.min(MAX_RECORD_SECS, seconds + 1)), 1_000);
    }
    if (state === 'processing') {
      awaitingBlobRef.current = true;
      if (secondsRef.current) clearInterval(secondsRef.current);
      secondsRef.current = null;
      setView('processing');
    }
    if (state === 'error') {
      clearTimers();
      recordingRef.current = null;
      setView('error');
    }
    if (state === 'off') {
      clearTimers();
      recordingRef.current = null;
      // A successful blob follows this state; it moves into Preview in receiveBlob.
      if (!awaitingBlobRef.current) restoreSavedClip();
    }
  };

  const startRecording = () => {
    clearTimers();
    stopPreview();
    recordingRef.current?.cancel();
    awaitingBlobRef.current = false;
    recordingRef.current = startVoiceRecording({
      maxMs: MAX_RECORD_SECS * 1_000,
      // Base64 expands before the explicit local Save; stay under the context's ceiling.
      maxBytes: 1_400_000,
      onState: handleRecordingState,
      onBlob: receiveBlob,
    });
  };

  const startCountdown = () => {
    if (view === 'recording' || view === 'requesting' || view === 'processing') return;
    stopPreview();
    clearTimers();
    setView('countdown');
    setCountdown(COUNTDOWN_SECS);
    setMessage('Get ready. Recording will start only after this countdown.');
    let seconds = COUNTDOWN_SECS;
    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearTimers();
        startRecording();
      }
    }, 1_000);
  };

  const cancelRecording = () => {
    clearTimers();
    awaitingBlobRef.current = false;
    recordingRef.current?.cancel();
    recordingRef.current = null;
    restoreSavedClip();
  };

  const stopRecording = () => {
    recordingRef.current?.stop();
  };

  const playPreview = () => {
    if (!dataUrl) return;
    if (channelVolume('voice') === 0) {
      setMessage('Voice sound is muted in Reading and display settings. Turn voices on to play this preview.');
      return;
    }
    stopPreview();
    const audio = new Audio(dataUrl);
    audioRef.current = audio;
    const cleanup = () => stopPreview();
    audioReleaseRef.current = claimAudioFocus('voice', cleanup);
    unregisterAudioRef.current = registerAudioElement(audio, 'voice');
    audio.onended = cleanup;
    audio.onerror = () => {
      cleanup();
      if (mountedRef.current) setMessage('The preview could not play. Your saved recording was not changed.');
    };
    setPlaying(true);
    void audio.play().catch(() => {
      cleanup();
      if (mountedRef.current) setMessage('The preview could not play. Your saved recording was not changed.');
    });
  };

  const save = () => {
    if (!dataUrl) return;
    saveClip(clipKey, label, prompt, dataUrl);
    setView('saved');
    setMessage('Saved on this device. You can play it, replace it, or delete it.');
    onSaved?.();
  };

  const discard = () => {
    stopPreview();
    restoreSavedClip();
  };

  const remove = () => {
    cancelRecording();
    stopPreview();
    deleteClip(clipKey);
    setDataUrl(null);
    setView('idle');
    setMessage('Saved recording deleted from this device.');
  };

  useEffect(() => {
    recordingRef.current?.cancel();
    readerRef.current?.abort();
    clearTimers();
    setDataUrl(existingDataUrl);
    setView(existingDataUrl ? 'saved' : 'idle');
  }, [clipKey, existingDataUrl]);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.hidden) stopPreview();
    };
    document.addEventListener('visibilitychange', stopWhenHidden);
    window.addEventListener('pagehide', stopPreview);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      window.removeEventListener('pagehide', stopPreview);
    };
  }, []);

  useEffect(() => () => {
    mountedRef.current = false;
    clearTimers();
    recordingRef.current?.cancel();
    readerRef.current?.abort();
    stopPreview();
  }, []);

  const primaryLabel = view === 'saved' ? 'Record a replacement' : 'Record your voice';
  const canRecord = view === 'idle' || view === 'saved' || view === 'error';
  const showRecordButton = view === 'idle' || view === 'error';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" aria-label={`Voice recording for ${label}`}>
        {(view === 'saved' || view === 'preview') && dataUrl ? (
          <button onClick={playing ? stopPreview : playPreview} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label={playing ? `Stop ${label} preview` : `Play ${label} preview`}>
            {playing ? <Square size={11} /> : <Play size={12} />}
          </button>
        ) : null}
        {view === 'preview' ? (
          <>
            <button onClick={save} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90" aria-label={`Save ${label} recording`}><Check size={12} /></button>
            <button onClick={discard} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-secondary/10" aria-label={`Discard unsaved ${label} recording`}><X size={12} /></button>
          </>
        ) : null}
        {canRecord ? (
          <button onClick={startCountdown} className="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary/20 transition-colors" aria-label={`Record your voice for ${label}`}>
            <Mic size={12} />
          </button>
        ) : (
          <button onClick={cancelRecording} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-secondary/10" aria-label="Stop microphone">
            <Square size={11} />
          </button>
        )}
        {view === 'saved' ? (
          <button onClick={remove} className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-secondary/10 hover:text-secondary transition-colors" aria-label={`Delete ${label} recording`}>
            <Trash2 size={11} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section className="space-y-3" aria-label={`Voice recording for ${label}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{label}</p>
          <p className="text-muted-foreground text-xs mt-0.5 italic">“{prompt}”</p>
        </div>
        {view === 'saved' ? (
          <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0"><Check size={11} /> Saved</span>
        ) : null}
      </div>

      <p className={`text-xs rounded-xl px-3 py-2 ${view === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`} role={view === 'error' ? 'alert' : 'status'} aria-live="polite">
        {message}
      </p>

      {view === 'countdown' ? (
        <div className="text-center py-3 space-y-2">
          <p className="text-4xl font-black text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{countdown}</p>
          <button onClick={cancelRecording} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-bold hover:text-foreground"><X size={14} /> Cancel</button>
        </div>
      ) : null}

      {view === 'requesting' ? (
        <button onClick={cancelRecording} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-secondary/10"><X size={15} /> Cancel microphone</button>
      ) : null}

      {view === 'recording' ? (
        <div className="space-y-2">
          <p className="text-center text-secondary font-black text-sm">Recording… {recordSecs}s / {MAX_RECORD_SECS}s</p>
          <div className="flex gap-2">
            <button onClick={stopRecording} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90"><Square size={14} /> Stop recording</button>
            <button onClick={cancelRecording} className="px-3 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground" aria-label="Cancel recording"><X size={15} /></button>
          </div>
        </div>
      ) : null}

      {view === 'processing' ? <p className="text-center text-sm font-bold text-muted-foreground py-2">Preparing your recording…</p> : null}

      {view === 'preview' ? (
        <div className="space-y-2">
          <p className="text-center text-xs text-muted-foreground font-bold">Listen back before deciding whether to save it.</p>
          <div className="flex gap-2">
            <button onClick={playing ? stopPreview : playPreview} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20"><Play size={14} /> {playing ? 'Stop preview' : 'Play back'}</button>
            <button onClick={save} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90"><Check size={14} /> Save recording</button>
          </div>
          <button onClick={discard} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-muted-foreground text-xs hover:text-foreground"><RefreshCw size={12} /> Discard this unsaved recording</button>
        </div>
      ) : null}

      {view === 'saved' ? (
        <div className="flex gap-2">
          <button onClick={playing ? stopPreview : playPreview} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20"><Play size={14} /> {playing ? 'Stop preview' : 'Play back'}</button>
          <button onClick={startCountdown} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground" aria-label="Record a replacement"><RefreshCw size={14} /></button>
          <button onClick={remove} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-destructive" aria-label="Delete saved recording"><Trash2 size={14} /></button>
        </div>
      ) : null}

      {showRecordButton ? (
        <button onClick={startCountdown} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/10 text-secondary font-bold text-sm hover:bg-secondary/20 transition-colors border-2 border-dashed border-secondary/30">
          <Mic size={16} /> {primaryLabel}
        </button>
      ) : null}

      <p className="text-xs text-muted-foreground text-center">Recordings are only stored on this device after you choose Save recording.</p>
    </section>
  );
}
