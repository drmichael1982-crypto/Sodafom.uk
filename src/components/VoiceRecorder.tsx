/**
 * VoiceRecorder — lets a child record their voice for a specific clip key.
 *
 * Props:
 *   clipKey    — which clip to record (e.g. "well-done", "welcome")
 *   label      — human-readable name shown in the UI
 *   prompt     — what the child should say ("Say: Well done!")
 *   onSaved?   — callback after saving
 *   compact?   — smaller inline version for use inside game shells
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Trash2, Check, RefreshCw } from 'lucide-react';
import { useVoice, type ClipKey } from '@/lib/voice-context';

interface Props {
  clipKey: ClipKey;
  label: string;
  prompt: string;
  onSaved?: () => void;
  compact?: boolean;
}

type RecordState = 'idle' | 'countdown' | 'recording' | 'preview' | 'saved';

const COUNTDOWN_SECS = 3;
const MAX_RECORD_SECS = 8;

export default function VoiceRecorder({ clipKey, label, prompt, onSaved, compact = false }: Props) {
  const { clips, saveClip, deleteClip } = useVoice();
  const existing = Object.hasOwn(clips, clipKey) ? clips[clipKey as keyof typeof clips] : undefined;

  const [state, setState] = useState<RecordState>(existing ? 'saved' : 'idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);
  const [recordSecs, setRecordSecs] = useState(0);
  const [dataUrl, setDataUrl] = useState<string | null>(existing?.dataUrl ?? null);
  const [playing, setPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const captureBusyRef = useRef(false);

  // A permission prompt may resolve after navigation. Invalidate that request
  // and release all acquired devices, even when MediaRecorder construction fails.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Intentionally read at cleanup time to invalidate the latest permission request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generationRef.current++;
      captureBusyRef.current = false;
      if (timerRef.current !== null) clearInterval(timerRef.current);
      timerRef.current = null;
      const recorder = mediaRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        try { if (recorder.state !== 'inactive') recorder.stop(); } catch { /* Still release tracks. */ }
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      mediaRef.current = null;
      chunksRef.current = [];
      const reader = readerRef.current;
      if (reader) {
        reader.onloadend = null;
        reader.onerror = null;
        if (reader.readyState === 1) reader.abort();
      }
      readerRef.current = null;
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync if external clip changes
  useEffect(() => {
    if (existing) {
      setDataUrl(existing.dataUrl);
      setState('saved');
    }
  }, [existing]);

  const clearTimer = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startCountdown = () => {
    // Compact-mode buttons remain visible; repeated taps must not start streams.
    if (!mountedRef.current || captureBusyRef.current) return;
    captureBusyRef.current = true;
    setState('countdown');
    setCountdown(COUNTDOWN_SECS);
    let c = COUNTDOWN_SECS;
    timerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearTimer();
        void startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    const generation = ++generationRef.current;
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current || generation !== generationRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (mountedRef.current && generation === generationRef.current && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mr.onstop = () => {
        clearTimer();
        stream?.getTracks().forEach(track => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        if (mediaRef.current === mr) mediaRef.current = null;
        if (!mountedRef.current || generation !== generationRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || getSupportedMimeType() });
        chunksRef.current = [];
        const reader = new FileReader();
        readerRef.current = reader;
        reader.onloadend = () => {
          if (!mountedRef.current || generation !== generationRef.current) return;
          readerRef.current = null;
          captureBusyRef.current = false;
          if (typeof reader.result !== 'string') { setState('idle'); return; }
          setDataUrl(reader.result);
          setState('preview');
        };
        reader.readAsDataURL(blob);
      };
      mr.onerror = () => {
        clearTimer();
        stream?.getTracks().forEach(track => track.stop());
        mr.onstop = null;
        mr.ondataavailable = null;
        try { if (mr.state !== 'inactive') mr.stop(); } catch { /* Tracks are already stopped. */ }
        if (!mountedRef.current || generation !== generationRef.current) return;
        generationRef.current++;
        mediaRef.current = null;
        streamRef.current = null;
        chunksRef.current = [];
        captureBusyRef.current = false;
        setState('idle');
      };

      mr.start();
      setState('recording');
      setRecordSecs(0);
      let s = 0;
      timerRef.current = setInterval(() => {
        s++;
        setRecordSecs(s);
        if (s >= MAX_RECORD_SECS) stopRecording();
      }, 1000);
    } catch {
      stream?.getTracks().forEach(track => track.stop());
      if (!mountedRef.current || generation !== generationRef.current) return;
      clearTimer();
      streamRef.current = null;
      const mr = mediaRef.current;
      if (mr) {
        mr.onstop = null;
        mr.ondataavailable = null;
        mr.onerror = null;
        try { if (mr.state !== 'inactive') mr.stop(); } catch { /* Tracks are already stopped. */ }
      }
      mediaRef.current = null;
      chunksRef.current = [];
      captureBusyRef.current = false;
      setState('idle');
      alert('Microphone access is needed to record your voice. Please allow it in your settings.');
    }
  };

  const stopRecording = () => {
    clearTimer();
    const mr = mediaRef.current;
    try {
      if (mr && mr.state !== 'inactive') mr.stop();
    } catch {
      generationRef.current++;
      if (mr) { mr.onstop = null; mr.ondataavailable = null; }
      mediaRef.current = null;
      chunksRef.current = [];
      captureBusyRef.current = false;
      if (mountedRef.current) setState('idle');
    } finally {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const playPreview = () => {
    if (!dataUrl) return;
    audioRef.current?.pause();
    const audio = new Audio(dataUrl);
    audioRef.current = audio;
    setPlaying(true);
    audio.onended = () => { if (mountedRef.current) setPlaying(false); };
    audio.play().catch(() => { if (mountedRef.current) setPlaying(false); });
  };

  const stopPreview = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const save = () => {
    if (!dataUrl) return;
    saveClip(clipKey, label, prompt, dataUrl);
    setState('saved');
    onSaved?.();
  };

  const discard = () => {
    setDataUrl(null);
    setState('idle');
  };

  const remove = () => {
    deleteClip(clipKey);
    setDataUrl(null);
    setState('idle');
  };

  // Compact mode — just a small mic icon button
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {state === 'saved' ? (
          <>
            <button
              onClick={playPreview}
              className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              title={`Play your recorded voice for "${label}"`}
            >
              <Play size={12} />
            </button>
            <button
              onClick={remove}
              className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-secondary/10 hover:text-secondary transition-colors"
              title="Delete recording"
            >
              <Trash2 size={11} />
            </button>
          </>
        ) : (
          <button
            onClick={startCountdown}
            className="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary/20 transition-colors"
            title={`Record your voice for "${label}"`}
          >
            <Mic size={12} />
          </button>
        )}
      </div>
    );
  }

  // Full card mode
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            {label}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5 italic">"{prompt}"</p>
        </div>
        {state === 'saved' && (
          <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0">
            <Check size={11} /> Recorded
          </span>
        )}
      </div>

      {/* State machine UI */}
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startCountdown}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/10 text-secondary font-bold text-sm hover:bg-secondary/20 transition-colors border-2 border-dashed border-secondary/30"
          >
            <Mic size={16} />
            Tap to record your voice
          </motion.button>
        )}

        {state === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {countdown}
            </motion.div>
            <p className="text-muted-foreground text-xs font-bold">Get ready…</p>
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-3"
          >
            {/* Waveform animation */}
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-secondary"
                  animate={{ height: ['6px', `${12 + Math.random() * 16}px`, '6px'] }}
                  transition={{ repeat: Infinity, duration: 0.5 + i * 0.07, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <p className="text-secondary font-black text-sm">
              Recording… {recordSecs}s / {MAX_RECORD_SECS}s
            </p>
            <p className="text-muted-foreground text-xs italic">Say: "{prompt}"</p>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Square size={14} /> Stop recording
            </button>
          </motion.div>
        )}

        {state === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground text-center font-bold">Listen back — does it sound good?</p>
            <div className="flex gap-2">
              <button
                onClick={playing ? stopPreview : playPreview}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                <Play size={14} />
                {playing ? 'Playing…' : 'Play back'}
              </button>
              <button
                onClick={save}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Check size={14} /> Save it!
              </button>
            </div>
            <button
              onClick={discard}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <RefreshCw size={12} /> Record again
            </button>
          </motion.div>
        )}

        {state === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={playing ? stopPreview : playPreview}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
            >
              <Play size={14} />
              {playing ? 'Playing…' : 'Play back'}
            </button>
            <button
              onClick={() => { discard(); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm hover:text-secondary hover:bg-secondary/10 transition-colors"
              title="Re-record"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={remove}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm hover:text-secondary hover:bg-secondary/10 transition-colors"
              title="Delete recording"
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSupportedMimeType(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}
