import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { BookOpen, Mic, Send, Square, Trash2, Volume2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { getActiveChild } from '@/hooks/useChildAge';
import { API_PREFIX } from '@/lib/config';
import ScannerCapture from './ScannerCapture';
import { readingWords, requestScan, wordAtOffset, type ScannerMode } from './scanner-core';
import { useScannerSpeech } from './useScannerSpeech';

function suggestedAge(group?: string) {
  return group === '5-7' ? 6 : group === '11-13' ? 12 : 9;
}

export default function ScannerWorkspace({ mode }: { mode: ScannerMode }) {
  const reading = mode === 'reading';
  const title = reading ? 'Scan Reading Book' : 'Scan Homework';
  const activeChild = getActiveChild();
  const canUseOnlinePhotoHelp = Boolean(activeChild?.id);
  const age = suggestedAge(activeChild?.ageGroup);
  const [photo, setPhoto] = useState('');
  const [question, setQuestion] = useState('');
  const [pageText, setPageText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [speechTarget, setSpeechTarget] = useState<'page' | 'help'>('page');
  const [characterAvailable, setCharacterAvailable] = useState(true);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const reduceMotion = useReducedMotion();
  const voice = useScannerSpeech(setQuestion);
  const { stopSpeech, stopListening } = voice;
  const words = useMemo(() => readingWords(pageText), [pageText]);
  const activeWord = speechTarget === 'page' && voice.offset !== null ? wordAtOffset(pageText, voice.offset) : null;

  const cancel = useCallback(() => {
    generation.current += 1;
    request.current?.abort(); request.current = null;
    setBusy(false); stopSpeech(); stopListening();
  }, [stopListening, stopSpeech]);

  const reset = () => {
    cancel(); setPhoto(''); setPageText(''); setExplanation(''); setQuestion(''); setError('');
  };
  useEffect(() => {
    // Browser history, app switching and BFCache must not leave a photographed
    // page or its extracted text waiting in the current page state.
    const clearSensitiveState = () => {
      cancel(); setPhoto(''); setPageText(''); setExplanation(''); setQuestion('');
    };
    const onVisibilityChange = () => { if (document.hidden) clearSensitiveState(); };
    window.addEventListener('pagehide', clearSensitiveState);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      generation.current += 1;
      request.current?.abort();
      window.removeEventListener('pagehide', clearSensitiveState);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [cancel]);

  const ask = async (task: 'transcribe' | 'help') => {
    if (!photo || request.current) return;
    if (!activeChild?.id) {
      setError('Please ask a parent to sign in and choose the learner before using the protected photo helper.');
      return;
    }
    stopSpeech(); stopListening(); setError('');
    const controller = new AbortController();
    request.current = controller;
    const current = ++generation.current;
    setBusy(true);
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 55000);
    try {
      const text = await requestScan(`${API_PREFIX}/ai-teacher/read-page`, {
        image: photo, childId: activeChild.id, mode, task,
        question: question.trim() || (reading ? 'Help me understand this page.' : 'Please give me one small hint, then let me try.'),
        previousExplanation: explanation.slice(0, 2500),
      }, controller.signal);
      if (current !== generation.current) return;
      if (reading && task === 'transcribe') setPageText(text);
      else setExplanation(text);
    } catch (nextError) {
      if (current !== generation.current) return;
      setError(timedOut
        ? 'That took too long. Please try one smaller, clearer section of the page.'
        : nextError instanceof Error ? nextError.message : 'The photo helper is unavailable. Please try again.');
    } finally {
      window.clearTimeout(timeout);
      if (current === generation.current) { request.current = null; setBusy(false); }
    }
  };

  const readAloud = (target: 'page' | 'help') => {
    setSpeechTarget(target);
    voice.speak(target === 'page' ? pageText : explanation);
  };
  const button = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2';
  const panel = 'rounded-3xl border-2 border-sky-100 bg-white p-5 text-slate-900 shadow-lg';

  return <>
    <Helmet><title>{title} — Sodafom</title></Helmet>
    <FeaturePageShell title={title} subtitle={reading ? 'Read a real page with Archie and ask about tricky words.' : 'Work through your homework with hints, small steps and time to try.'} emoji="" accent="from-sky-600 via-violet-700 to-indigo-950" backTo={reading ? '/reading' : '/'}>
      <section className={`${panel} mb-5 flex items-center gap-4`}>
        {characterAvailable && <motion.img src="/assets/images/archie-character-v2.png" alt="Archie, your learning helper" className="h-28 w-24 shrink-0 object-contain" onError={() => setCharacterAvailable(false)} animate={!reduceMotion && voice.speaking ? { rotate: [0, -1, 0, 1, 0] } : { rotate: 0 }} transition={{ duration: 2.5, repeat: voice.speaking && !reduceMotion ? Infinity : 0 }} />}
        <div><h2 className="text-xl font-black">Let&apos;s work together</h2><p className="mt-2 leading-relaxed">{reading ? 'Choose one book page. We can read it together, practise a word, or talk about the story.' : 'Photograph one question. I will help you understand the method, then you can try the next step.'}</p></div>
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className={`${panel} space-y-4`}>
          <p className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed"><strong>Learning level:</strong> the selected learner&apos;s parent-managed profile sets an age-{age} starting point. The protected server checks that profile again before it can read a page.</p>
          <ScannerCapture onPhoto={value => { reset(); setPhoto(value); }} onError={setError} onStart={reset} />
          <p className="text-sm leading-relaxed text-slate-600">Choose a clear JPG, PNG or WebP photo under 6 MB. Keep faces, names and private information out of the picture.</p>
          {photo && <div className="space-y-3">
            <img src={photo} alt={reading ? 'Book page selected for reading' : 'Homework selected for help'} className="max-h-96 w-full rounded-xl border object-contain" />
            <button type="button" onClick={reset} className={`${button} border-2 border-slate-300 text-slate-800`}><Trash2 aria-hidden />Remove photo and answers</button>
          </div>}
          <p className="rounded-xl bg-sky-50 p-3 text-sm leading-relaxed">The photo is sent only when you press a help button. It is resized to remove photo metadata first, then checked against the signed-in parent&apos;s selected learner and the AI voucher rules. This scanner does not save photos, page text or questions in browser storage.</p>
          {!canUseOnlinePhotoHelp && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">A parent needs to sign in and choose this learner before any photo can be sent for online help. You can still remove the photo at any time.</p>}
        </section>
        <section className={`${panel} space-y-4`} aria-busy={busy}>
          <h2 className="text-xl font-black">{reading ? 'Read and ask for help' : 'Tell Archie where you are stuck'}</h2>
          {reading && <button type="button" disabled={!photo || busy || !canUseOnlinePhotoHelp} onClick={() => void ask('transcribe')} className={`${button} w-full bg-emerald-700 text-white`}><BookOpen aria-hidden />Scan the page text</button>}
          <label className="block font-bold">{reading ? 'Your question about this page' : 'Your question or your attempt'}
            <textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={500} rows={4} placeholder={reading ? 'What does this word mean?' : 'Tell me what to try first, or check my attempt.'} className="mt-2 w-full rounded-xl border-2 border-sky-200 p-3 font-normal leading-relaxed" />
          </label>
          <button type="button" disabled={busy} onClick={voice.listen} aria-pressed={voice.listening} className={`${button} ${voice.listening ? 'bg-rose-700' : 'bg-violet-700'} text-white`}><Mic aria-hidden />{voice.listening ? 'Stop microphone' : 'Speak my question'}</button>
          <p className="text-sm leading-relaxed text-slate-600">The microphone listens only after you press it. Your device may use its speech service. Check the words above before sending.</p>
          {voice.listening && <p role="status" className="font-bold text-rose-800">Listening. Tell Archie what you need help with.</p>}
          {voice.message && <p role="status" className="rounded-xl bg-violet-50 p-3 text-sm">{voice.message}</p>}
          <button type="button" disabled={!photo || busy || !canUseOnlinePhotoHelp || (reading && !question.trim())} onClick={() => void ask('help')} className={`${button} w-full bg-sky-700 text-white`}><Send aria-hidden />{reading ? 'Help with my question' : explanation ? 'Check my attempt / next hint' : 'Guide me step by step'}</button>
          {!reading && <p className="text-sm text-slate-600">Try Archie&apos;s hint, then type or speak your attempt above for the next step.</p>}
          {busy && <div role="status" className="space-y-2"><p>Archie is checking this part of the page…</p><button type="button" onClick={cancel} className={`${button} border-2 border-slate-300`}>Cancel request</button></div>}
          {error && <p role="alert" className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 font-bold text-rose-800">{error}</p>}
        </section>
      </div>
      {pageText && <section className={`${panel} mt-5`}>
        <h2 className="text-2xl font-black">Your page text</h2>
        <p className="mt-2 text-sm text-slate-600">Check these words against your photo. Tap a tricky word to put it in your question. Highlighting appears when your device provides word timings.</p>
        <div className="my-4 flex flex-wrap gap-3"><button type="button" onClick={() => readAloud('page')} className={`${button} bg-emerald-700 text-white`}><Volume2 aria-hidden />Read page aloud</button><button type="button" onClick={voice.stopSpeech} className={`${button} border-2 border-slate-300`}><Square aria-hidden />Stop reading</button></div>
        <p className="whitespace-pre-wrap text-xl leading-loose" aria-label="Scanned reading text">{words.map((word, index) => <span key={word.start}>{pageText.slice(index ? words[index - 1].end : 0, word.start)}<button type="button" onClick={() => { voice.stopSpeech(); setQuestion(`Help me say and understand "${word.text}" on this page.`); }} className={`rounded px-0.5 text-left focus-visible:outline focus-visible:outline-2 ${activeWord?.start === word.start ? 'bg-yellow-200 text-slate-950 underline decoration-2' : 'hover:bg-sky-100'}`} aria-label={`Ask about ${word.text}`}>{word.text}</button>{index === words.length - 1 ? pageText.slice(word.end) : ''}</span>)}</p>
      </section>}
      {explanation && <section className={`${panel} mt-5`}>
        <h2 className="text-2xl font-black">{reading ? 'Archie’s reading help' : 'Archie’s next step'}</h2>
        <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed">{explanation}</p>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => readAloud('help')} className={`${button} bg-sky-700 text-white`}><Volume2 aria-hidden />Read help aloud</button><button type="button" onClick={voice.stopSpeech} className={`${button} border-2 border-slate-300`}><Square aria-hidden />Stop reading</button></div>
      </section>}
    </FeaturePageShell>
  </>;
}
