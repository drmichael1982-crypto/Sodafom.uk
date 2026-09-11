import { useEffect, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Camera, ImageOff, Mic, Send, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { API_PREFIX } from '@/lib/config';
import { getActiveChild } from '@/hooks/useChildAge';
import { ttsSpeak } from '@/lib/voice-context';
import { ArchieCharacter } from '@/components/ArchieCharacter';

function suggestedAge() {
  const group = getActiveChild()?.ageGroup;
  return group === '5-7' ? 6 : group === '11-13' ? 12 : 9;
}

export default function HomeworkHelperPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [age, setAge] = useState(suggestedAge);
  const [question, setQuestion] = useState('Please explain this homework one step at a time.');
  const [image, setImage] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const childName = getActiveChild()?.name || 'there';

  useEffect(() => {
    // A friendly spoken welcome; the character component provides the matching
    // lip/talking motion on screen.
    const greeting = `Hello ${childName}, I'm Archie. Can I help you do your homework?`;
    const timer = window.setTimeout(() => ttsSpeak(greeting), 450);
    return () => window.clearTimeout(timer);
  }, [childName]);

  const chooseImage = (file?: File) => {
    setError('');
    setAnswer('');
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setError('Please choose a clear photograph smaller than 6 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ''));
    reader.onerror = () => setError('That photograph could not be opened. Please try again.');
    reader.readAsDataURL(file);
  };

  const askArchie = async () => {
    if (!image || busy) return;
    setBusy(true);
    setError('');
    setAnswer('');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(`${API_PREFIX}/ai-teacher/read-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, age, mode: 'homework', question: question.trim() }),
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) throw new Error(text || 'Archie could not read that homework.');
      setAnswer(text);
      ttsSpeak(text);
    } catch (nextError) {
      setError(nextError instanceof Error && nextError.name === 'AbortError'
        ? 'The homework helper took too long. Please try one clear question in the photograph.'
        : nextError instanceof Error ? nextError.message : 'The homework helper is unavailable just now.');
    } finally {
      window.clearTimeout(timeoutId);
      setBusy(false);
    }
  };

  const clearImage = () => {
    setImage('');
    setAnswer('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <Helmet><title>Homework Helper — Sodafom</title></Helmet>
      <FeaturePageShell title="Homework Helper" subtitle="Photograph one question and Archie will explain it step by step." emoji="📸" accent="from-orange-500 via-amber-600 to-purple-900">
        <section className="relative mb-5 overflow-hidden rounded-[2rem] border-4 border-amber-200 bg-slate-900 px-5 py-4 text-white shadow-xl">
          <motion.div aria-hidden className="absolute left-7 top-3 h-4 w-16 rounded-full bg-yellow-200 blur-sm" animate={{ opacity: [0.35, 1, 0.45, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
          <motion.div aria-hidden className="absolute right-7 top-3 h-4 w-16 rounded-full bg-yellow-200 blur-sm" animate={{ opacity: [1, 0.4, 1, 0.55] }} transition={{ duration: 1.8, repeat: Infinity }} />
          <div className="relative flex items-center gap-3"><ArchieCharacter size={88} speaking /><div><h2 className="text-xl font-black">Hello {childName}, I&apos;m Archie!</h2><p className="mt-1 font-bold text-amber-100">Can I help you do your homework? Take a clear photo and we&apos;ll work it out together.</p></div><motion.span aria-label="Friendly dog barking" className="ml-auto text-5xl" animate={{ x: [0, -5, 4, 0], rotate: [0, -8, 8, 0] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 3 }}>🐶</motion.span></div>
        </section>
        <section className="mb-5 rounded-3xl border-4 border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-xl">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" /><div><h2 className="font-black">Photo privacy</h2><p className="mt-1 text-sm font-bold">Sodafom uses the photo to answer this request and does not save it to the Sodafom database. Avoid including faces, names or private information.</p></div></div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[2rem] border-4 border-white/70 bg-white p-5 text-sky-950 shadow-xl">
            <label className="font-black">Learner&apos;s age<select value={age} onChange={event => setAge(Number(event.target.value))} className="mt-1 min-h-12 w-full rounded-2xl border-2 border-orange-200 px-4 font-bold">{Array.from({ length: 9 }, (_, index) => index + 5).map(value => <option key={value} value={value}>Age {value}</option>)}</select></label>
            <label className="mt-4 block font-black">What help do you need?<textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-2xl border-2 border-orange-200 p-4 font-bold" /></label>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={event => chooseImage(event.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-black text-white shadow-lg"><Camera /> {image ? 'Choose a different photo' : 'Scan homework'}</button>
            <p className="mt-3 text-xs font-bold text-slate-500">The local helper is used first for typed questions. A homework photo needs the protected online image helper because local text matching cannot read a new photograph.</p>
          </section>

          <section className="flex min-h-80 flex-col rounded-[2rem] border-4 border-white/70 bg-slate-950/80 p-5 text-white shadow-xl">
            {image ? <img src={image} alt="Homework selected for Archie to explain" className="min-h-0 flex-1 rounded-2xl bg-white object-contain" /> : <div className="flex flex-1 flex-col items-center justify-center text-center"><Camera size={52} className="text-yellow-300" /><h2 className="mt-3 text-xl font-black">Your homework photo will appear here</h2><p className="mt-2 text-sm font-bold text-white/70">For the clearest result, photograph one question straight-on in good light.</p></div>}
            {image && <div className="mt-3 grid grid-cols-[1fr_auto] gap-2"><button type="button" disabled={busy} onClick={() => void askArchie()} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 font-black text-white disabled:opacity-60"><Send /> {busy ? 'Archie is looking…' : 'Explain this homework'}</button><button type="button" onClick={clearImage} aria-label="Remove homework photograph" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><ImageOff /></button></div>}
          </section>
        </div>

        {answer && <section className="mt-5 rounded-[2rem] border-4 border-green-200 bg-white p-5 text-sky-950 shadow-xl"><h2 className="text-2xl font-black">Archie&apos;s explanation</h2><p className="mt-3 whitespace-pre-wrap font-semibold leading-relaxed">{answer}</p><button type="button" onClick={() => ttsSpeak(answer)} className="mt-4 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-black text-white"><Volume2 /> Read aloud</button></section>}
        {error && <p role="alert" className="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</p>}
        <nav aria-label="Homework tools" className="mt-5 grid grid-cols-3 gap-3"><button type="button" onClick={() => inputRef.current?.click()} className="rounded-2xl bg-orange-500 p-3 font-black text-white"><Camera className="mx-auto mb-1" />Scan</button><button type="button" onClick={() => ttsSpeak('Tell me which question you would like help with.')} className="rounded-2xl bg-sky-600 p-3 font-black text-white"><Mic className="mx-auto mb-1" />Ask</button><button type="button" onClick={() => setQuestion('Please give me one small hint, then let me try.')} className="rounded-2xl bg-violet-600 p-3 font-black text-white"><Sparkles className="mx-auto mb-1" />Hint</button></nav>
      </FeaturePageShell>
    </>
  );
}
