/** Local, privacy-preserving controls for managed reading voice and microphone use. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import {
  DEFAULT_AUDIO_SETTINGS,
  getAudioSettings,
  stopForegroundAudio,
  subscribeAudioSettings,
  updateAudioSettings,
} from '@/lib/audio-policy';
import {
  clearSpeechCaption,
  getSpeechCaption,
  stopSpeech,
  subscribeSpeechCaption,
} from '@/lib/audio-runtime';
import { startSpeechInput, type MicState } from '@/lib/speech-input';

export default function AudioSettings() {
  const settings = useSyncExternalStore(subscribeAudioSettings, getAudioSettings, () => DEFAULT_AUDIO_SETTINGS);
  const caption = useSyncExternalStore(subscribeSpeechCaption, getSpeechCaption, () => '');
  const stopMicRef = useRef<() => void>(() => {});
  const [micState, setMicState] = useState<MicState>('off');
  const [micMessage, setMicMessage] = useState('Microphone is off.');

  const stopAll = () => {
    stopMicRef.current();
    stopMicRef.current = () => {};
    stopForegroundAudio();
    stopSpeech();
    clearSpeechCaption();
    setMicState('off');
    setMicMessage('Microphone off. Managed reading sound stopped.');
  };

  const startMicTest = () => {
    stopMicRef.current();
    stopMicRef.current = startSpeechInput({
      timeoutMs: 10_000,
      onState: (state, message) => {
        setMicState(state);
        setMicMessage(message);
      },
      onTranscript: () => {
        // A device check only: do not display, keep, or route a child's words.
        setMicState('off');
        setMicMessage('Microphone off. Test complete; no words were saved.');
      },
    });
  };

  useEffect(() => () => {
    stopMicRef.current();
    clearSpeechCaption();
  }, []);

  return (
    <section className="space-y-3 border-t border-border pt-3" aria-label="Sound, captions, and microphone settings">
      <div>
        <p className="font-bold text-xs text-foreground">Reading sound</p>
        <p className="text-xs text-muted-foreground">These controls stay on this device and never store reading text.</p>
      </div>

      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-border bg-muted/50 text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={settings.voices}
          onChange={event => updateAudioSettings({ voices: event.target.checked })}
          className="accent-primary"
        />
        {settings.voices ? <Volume2 size={16} className="shrink-0" /> : <VolumeX size={16} className="shrink-0" />}
        <span className="font-bold text-xs">Read-aloud voices</span>
      </label>

      <label className="block px-3 py-2.5 rounded-xl border-2 border-border bg-muted/50 text-foreground">
        <span className="flex justify-between gap-3 text-xs"><span className="font-bold">Voice volume</span><span>{Math.round(settings.voiceVolume * 100)}%</span></span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.voiceVolume}
          onChange={event => updateAudioSettings({ voiceVolume: Number(event.target.value) })}
          className="w-full mt-2 accent-primary"
          aria-label="Read-aloud voice volume"
        />
      </label>

      <label className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 border-border bg-muted/50 text-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={settings.quiet}
          onChange={event => updateAudioSettings({ quiet: event.target.checked })}
          className="mt-0.5 accent-primary"
        />
        <span><span className="block font-bold text-xs">Quiet reading</span><span className="block text-xs text-muted-foreground">Keeps managed read-aloud at a gentler volume. Optional effects stay off in this recovery.</span></span>
      </label>

      <button onClick={stopAll} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-secondary/10">
        <Square size={14} /> Stop reading and microphone
      </button>

      <div className="rounded-xl border-2 border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2"><p className="font-bold text-xs text-foreground">Read-aloud caption</p>{caption ? <button onClick={clearSpeechCaption} className="text-xs font-bold text-primary hover:underline">Clear caption</button> : null}</div>
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {caption || 'Captions appear here only while managed read-aloud is active. They are not saved.'}
        </p>
      </div>

      <div className="rounded-xl border-2 border-border p-3 space-y-2">
        <div className="flex items-center gap-2"><Mic size={15} className="text-primary" /><p className="font-bold text-xs text-foreground">Microphone check</p></div>
        <p className="text-xs text-muted-foreground">Start this only to test permission and your microphone. The app does not show, keep, or send the words; a browser may use its configured speech service.</p>
        <p className={`text-xs ${micState === 'error' ? 'text-destructive' : 'text-muted-foreground'}`} role={micState === 'error' ? 'alert' : 'status'} aria-live="polite">{micMessage}</p>
        {micState === 'requesting' || micState === 'listening' ? (
          <button onClick={() => { stopMicRef.current(); setMicState('off'); setMicMessage('Microphone off.'); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-secondary/10"><Square size={13} /> Stop microphone</button>
        ) : (
          <button onClick={startMicTest} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20"><Mic size={13} /> Test microphone</button>
        )}
      </div>
    </section>
  );
}
