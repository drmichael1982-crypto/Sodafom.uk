/** Explicit eight-second clip recorder with cancellable permission and unmount cleanup. */
import { useState, useRef, useEffect } from 'react';
import { useVoice, type ClipKey } from '@/lib/voice-context';
import { claimAudioFocus, registerAudioElement } from '@/lib/audio-policy';
import { startVoiceRecording, type RecordingHandle, type RecordingState } from '@/lib/speech-input';
interface Props { clipKey: ClipKey; label: string; prompt: string; onSaved?: () => void; compact?: boolean }
export default function VoiceRecorder({ clipKey, label, prompt, onSaved, compact = false }: Props) {
  const { childId, clips, saveClip, deleteClip } = useVoice();
  const existing = Object.hasOwn(clips, clipKey) ? clips[clipKey] : undefined;
  const [state, setState] = useState<RecordingState>('off');
  const [message, setMessage] = useState('Microphone off.');
  const [dataUrl, setDataUrl] = useState<string | null>(existing?.dataUrl ?? null);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(!!existing);
  const recording = useRef<RecordingHandle | undefined>(undefined);
  const reader = useRef<FileReader | undefined>(undefined);
  const stopPreview = useRef<() => void>(() => {});
  const mounted = useRef(true);
  const generation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    setDataUrl(existing?.dataUrl ?? null); setSaved(!!existing);
    setState('off'); setMessage('Microphone off.'); setPlaying(false);
    return () => {
      mounted.current = false; generation.current++;
      recording.current?.cancel(); stopPreview.current();
      if (reader.current?.readyState === FileReader.LOADING) reader.current.abort();
    };
  }, [childId, clipKey, existing]);
  const record = () => {
    generation.current++;
    const token = generation.current;
    recording.current?.cancel(); stopPreview.current();
    setSaved(false); setDataUrl(null);
    recording.current = startVoiceRecording({
      onState: (next, text) => { if (mounted.current && token === generation.current) { setState(next); setMessage(text); } },
      onBlob: blob => {
        if (!mounted.current || token !== generation.current) return;
        const fileReader = new FileReader(); reader.current = fileReader;
        fileReader.onload = () => { if (mounted.current && token === generation.current) setDataUrl(String(fileReader.result)); };
        fileReader.onerror = () => { if (mounted.current && token === generation.current) setMessage('The recording could not be read. Please try again.'); };
        fileReader.readAsDataURL(blob);
      },
    });
  };
  const preview = () => {
    stopPreview.current();
    if (!dataUrl) return;
    const audio = new Audio(dataUrl);
    let release = () => {};
    let unregister = () => {};
    let ended = false;
    const stop = () => {
      if (ended) return; ended = true;
      audio.onended = audio.onerror = null;
      audio.pause(); audio.removeAttribute('src'); audio.load();
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', stop);
      unregister(); release();
      if (mounted.current) setPlaying(false);
    };
    const hidden = () => { if (document.hidden) stop(); };
    release = claimAudioFocus('voice', stop);
    unregister = registerAudioElement(audio, 'voice');
    stopPreview.current = stop;
    audio.onended = audio.onerror = stop;
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', stop);
    setPlaying(true); void audio.play().catch(stop);
  };
  const busy = ['requesting', 'recording', 'processing'].includes(state);
  const buttonClass = 'min-h-11 rounded-xl border border-border px-3 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2';
  return <div className={compact ? 'flex flex-wrap items-center gap-2' : 'space-y-3 rounded-2xl border-2 border-border bg-card p-4'}>
    {!compact && <div><p className="font-bold">{label}</p><p className="text-sm">Say: “{prompt}”</p></div>}
    <p role="status" aria-live="polite" className="w-full text-sm">{message}</p>
    {state === 'requesting' && <button type="button" className={buttonClass} onClick={() => recording.current?.cancel()}>Cancel microphone request</button>}
    {state === 'recording' && <button type="button" aria-pressed="true" className={buttonClass} onClick={() => recording.current?.stop()}>Stop recording (maximum 8 seconds)</button>}
    {state === 'processing' && <button type="button" className={buttonClass} onClick={() => recording.current?.cancel()}>Cancel recording</button>}
    {!busy && <div className="flex flex-wrap gap-2">
      <button type="button" className={buttonClass} aria-label={`Record your voice for ${label}`} onClick={record}>{dataUrl ? 'Record again' : 'Record your voice'}</button>
      {dataUrl && <>
        <button type="button" className={buttonClass} onClick={playing ? () => stopPreview.current() : preview}>{playing ? 'Stop playback' : 'Play recording'}</button>
        {!saved && <button type="button" className={buttonClass} disabled={!childId} onClick={() => { stopPreview.current(); saveClip(clipKey, label, prompt, dataUrl); setSaved(true); onSaved?.(); }}>Save recording</button>}
        <button type="button" className={buttonClass} onClick={() => { generation.current++; stopPreview.current(); deleteClip(clipKey); setDataUrl(null); setSaved(false); }}>Delete recording</button>
      </>}
    </div>}
    {!compact && <p className="text-xs">Record only with permission. Your clip is saved on this device only when you press Save. Quiet mode removes optional effects, not your chosen reading voice.</p>}
  </div>;
}
