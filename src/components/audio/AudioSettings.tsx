import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEFAULT_AUDIO_SETTINGS, getAudioSettings, subscribeAudioSettings, updateAudioSettings, type AudioSettings as Settings } from '@/lib/audio-policy';
import { playActionSound } from '@/lib/audio-runtime';
import { startSpeechInput, type MicState } from '@/lib/speech-input';

/** Inline controls inside the existing accessibility panel: no new floating icons. */
export default function AudioSettings() {
  const settings = useSyncExternalStore(subscribeAudioSettings, getAudioSettings, () => DEFAULT_AUDIO_SETTINGS);
  const [mic, setMic] = useState<MicState>('off');
  const [message, setMessage] = useState('Microphone off.');
  const stopMic = useRef<() => void>(() => {});
  useEffect(() => () => stopMic.current(), []);
  const flags: { key: 'voices' | 'music' | 'effects' | 'quiet'; label: string }[] = [
    { key: 'voices', label: 'Teaching and reading voices' }, { key: 'music', label: 'Background music' },
    { key: 'effects', label: 'Optional sound effects' }, { key: 'quiet', label: 'Quiet / reduced sensory audio' },
  ];
  const volumes: { key: 'voiceVolume' | 'musicVolume' | 'effectsVolume'; label: string }[] = [
    { key: 'voiceVolume', label: 'Voice volume' }, { key: 'musicVolume', label: 'Music volume' }, { key: 'effectsVolume', label: 'Effects volume' },
  ];
  return <fieldset className="mt-3 space-y-3 border-t border-border pt-3 text-xs">
    <legend className="px-1 font-bold">Voices and sound</legend>
    {flags.map(({ key, label }) => <label key={key} className="flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={settings[key]} onChange={event => updateAudioSettings({ [key]: event.target.checked } as Partial<Settings>)} />
      <span>{label}</span>
    </label>)}
    {volumes.map(({ key, label }) => <label key={key} className="block">
      <span>{label}: {Math.round(settings[key] * 100)}%</span>
      <input className="block min-h-11 w-full" type="range" min="0" max="100" value={Math.round(settings[key] * 100)} onChange={event => updateAudioSettings({ [key]: Number(event.target.value) / 100 })} />
    </label>)}
    <p>Quiet mode stops optional music and effects but keeps reading voices available. Music and effects stay silent while shared voice or microphone audio is active.</p>
    <button type="button" className="min-h-11 rounded-lg border px-3 py-2" onClick={() => { void playActionSound('gentle-pop'); }}>Test gentle sound</button>
    <p>Character voices currently use device fallbacks. Exact child and teacher voices need approved voice assets and listening checks.</p>
    <div className="flex flex-wrap gap-2" aria-label="Optional dog sound previews">
      {(['jessica', 'sally', 'daisy'] as const).map(dog => <button type="button" key={dog} className="min-h-11 rounded-lg border px-2 py-1" onClick={() => { void playActionSound(dog); }}>Hear {dog[0].toUpperCase() + dog.slice(1)}</button>)}
    </div>
    <p>The browser may send speech to its own recognition service. This test does not save your words. Use typing or buttons instead whenever you prefer.</p>
    <button type="button" aria-pressed={mic === 'requesting' || mic === 'listening'} className="min-h-11 rounded-lg border px-3 py-2" onClick={() => {
      if (mic === 'requesting' || mic === 'listening') { stopMic.current(); return; }
      stopMic.current = startSpeechInput({ onState: (state, text) => { setMic(state); setMessage(text); }, onTranscript: text => setMessage(`Microphone off. Heard: ${text}`) });
    }}>{mic === 'requesting' || mic === 'listening' ? 'Stop microphone' : 'Test microphone'}</button>
    <p role="status" aria-live="polite">{message}</p>
  </fieldset>;
}
