import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { stopTts, ttsSpeak } from '@/lib/voice-context';
import { speechChunks } from './scanner-core';

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

/** Push-to-talk only; typed input stays available on unsupported devices. */
export function useScannerSpeech(onTranscript: (text: string) => void) {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [offset, setOffset] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const speechId = useRef(0);
  const recognition = useRef<Recognition | null>(null);
  const micTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcript = useRef(onTranscript);
  transcript.current = onTranscript;

  const stopListening = useCallback(() => {
    if (micTimer.current) clearTimeout(micTimer.current);
    micTimer.current = null;
    const active = recognition.current;
    recognition.current = null;
    if (active) {
      active.onresult = null; active.onerror = null; active.onend = null;
      active.abort();
    }
    setListening(false);
  }, []);
  const stopSpeech = useCallback(() => {
    speechId.current += 1;
    stopTts(); setSpeaking(false); setOffset(null);
  }, []);

  const speak = useCallback((text: string) => {
    stopListening(); stopSpeech(); setMessage('');
    if (!text.trim()) return;
    const current = speechId.current;
    if (Capacitor.isNativePlatform()) {
      setSpeaking(true);
      ttsSpeak(text, () => { if (current === speechId.current) { setSpeaking(false); setOffset(null); } });
      return;
    }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setMessage('Read aloud is not available on this device. The words are still shown below.'); return;
    }
    const chunks = speechChunks(text);
    const next = (index: number) => {
      if (current !== speechId.current) return;
      const chunk = chunks[index];
      if (!chunk) { setSpeaking(false); setOffset(null); return; }
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = 'en-GB'; utterance.rate = 0.9; utterance.pitch = 1.15;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(item => item.lang === 'en-GB') ?? voices.find(item => item.lang.startsWith('en'));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { if (current === speechId.current) setSpeaking(true); };
      utterance.onboundary = event => {
        if (current === speechId.current && event.name === 'word') setOffset(chunk.start + event.charIndex);
      };
      utterance.onend = () => next(index + 1);
      utterance.onerror = () => {
        if (current !== speechId.current) return;
        setSpeaking(false); setOffset(null);
        setMessage('Read aloud stopped. Tap Read aloud to try again.');
      };
      window.speechSynthesis.speak(utterance);
    };
    next(0);
  }, [stopListening, stopSpeech]);

  const listen = useCallback(() => {
    if (recognition.current) { stopListening(); return; }
    stopSpeech(); setMessage('');
    const speechWindow = window as SpeechWindow;
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) { setMessage('This device does not support voice questions here. Please type your question below.'); return; }
    const active = new Constructor();
    recognition.current = active;
    active.lang = 'en-GB'; active.interimResults = false; active.continuous = false;
    active.onresult = event => {
      if (recognition.current !== active) return;
      const text = Array.from(event.results).map(result => result[0]?.transcript ?? '').join(' ').trim();
      stopListening();
      if (text) { transcript.current(text.slice(0, 500)); setMessage('Check your spoken question, then press the help button to send it.'); }
    };
    active.onerror = event => {
      if (recognition.current !== active) return;
      stopListening();
      setMessage(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission was not granted. You can type instead, or enable the microphone in browser settings.'
        : 'I could not hear a clear question. Try again or type it below.');
    };
    active.onend = () => { if (recognition.current === active) stopListening(); };
    try {
      active.start(); setListening(true);
      micTimer.current = setTimeout(() => { stopListening(); setMessage('The microphone is off. Tap it again when you are ready.'); }, 20000);
    } catch {
      stopListening(); setMessage('The microphone could not start. Please type your question instead.');
    }
  }, [stopListening, stopSpeech]);

  useEffect(() => {
    const stop = () => { stopSpeech(); stopListening(); };
    const hide = () => { if (document.hidden) stop(); };
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', hide);
    return () => {
      stop();
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [stopListening, stopSpeech]);
  return { speak, stopSpeech, listen, stopListening, speaking, listening, offset, message };
}
