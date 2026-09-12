import { useCallback, useEffect, useRef, useState } from 'react';

interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; abort(): void;
}
interface Options { active: boolean; speaking: boolean; onTranscript: (text: string) => void; onStatus: (text: string) => void }

/** Opt-in conversational turn-taking. Not full-duplex: recognition is suspended
 * while Archie speaks. No getUserMedia recording or stored audio is created.
 * The browser's speech service may process speech remotely. */
export function useLessonConversation(options: Options) {
  const [enabled, setEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const latest = useRef(options); latest.current = options;
  const permission = useRef(false);
  const recognizer = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const live = useRef(true);
  const failures = useRef(0);
  const startRef = useRef<() => void>(() => {});

  const suspend = useCallback(() => {
    if (timer.current) clearTimeout(timer.current); timer.current = null;
    const current = recognizer.current; recognizer.current = null;
    if (current) {
      current.onstart = current.onresult = current.onerror = current.onend = null;
      try { current.abort(); } catch { /* Already stopped. */ }
    }
    if (live.current) setListening(false);
  }, []);
  const disable = useCallback(() => {
    permission.current = false; suspend();
    if (live.current) { setEnabled(false); latest.current.onStatus('Voice off. Tap Voice to start a conversation.'); }
  }, [suspend]);

  const start = useCallback(() => {
    const state = latest.current;
    if (!live.current || !permission.current || recognizer.current || !state.active || state.speaking || document.visibilityState !== 'visible') return;
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SpeechRecognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!SpeechRecognition) { disable(); state.onStatus('Voice recognition is not available here. Please type or tap an answer.'); return; }
    const rec = new SpeechRecognition(); recognizer.current = rec;
    rec.lang = 'en-GB'; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => { if (recognizer.current !== rec) return; setListening(true); latest.current.onStatus('Listening — speak your answer, ask for a hint, or say stop.'); };
    rec.onresult = event => {
      if (recognizer.current !== rec || latest.current.speaking || !permission.current) return;
      const result = event.results?.[event.resultIndex ?? 0];
      const text = typeof result?.[0]?.transcript === 'string' ? result[0].transcript.trim().slice(0,1000) : '';
      if (!text) return;
      failures.current = 0;
      if (/^(stop|stop listening|microphone off|voice off)[.!?]?$/i.test(text)) { disable(); return; }
      suspend(); latest.current.onTranscript(text);
      timer.current = setTimeout(() => startRef.current(), 700);
    };
    rec.onerror = event => {
      if (recognizer.current !== rec) return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        disable(); latest.current.onStatus('Microphone unavailable or permission blocked. You can still type or tap.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted' && ++failures.current >= 3) {
        disable(); latest.current.onStatus('Voice is having trouble connecting. Tap Voice to retry, or use the answer buttons.');
      }
    };
    rec.onend = () => {
      if (recognizer.current !== rec) return;
      recognizer.current = null; setListening(false);
      if (permission.current) timer.current = setTimeout(() => startRef.current(), 900);
    };
    try { rec.start(); } catch { disable(); latest.current.onStatus('Unable to start voice. Please tap Voice to try again.'); }
  }, [disable,suspend]);
  startRef.current = start;
  const enable = useCallback(() => {
    if (!latest.current.active) { latest.current.onStatus('Resume the lesson before enabling Voice.'); return; }
    permission.current = true; failures.current = 0; setEnabled(true); startRef.current();
  }, []);
  useEffect(() => {
    if (!options.active) { disable(); return; }
    if (options.speaking) { suspend(); if (permission.current) latest.current.onStatus('Archie is speaking. Listening resumes afterwards.'); return; }
    if (permission.current) timer.current = setTimeout(start, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [options.active, options.speaking, start, suspend, disable]);
  useEffect(() => {
    live.current = true;
    const onVisibility = () => { if (document.visibilityState !== 'visible') disable(); };
    document.addEventListener('visibilitychange',onVisibility);
    return () => { live.current = false; permission.current = false; suspend(); document.removeEventListener('visibilitychange',onVisibility); };
  },[disable,suspend]);
  return { enabled, listening, enable, disable, suspend, toggle: enabled ? disable : enable };
}
