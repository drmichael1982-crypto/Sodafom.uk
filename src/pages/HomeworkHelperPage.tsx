import { useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Camera, ImageOff, Send, ShieldCheck, Volume2 } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { API_PREFIX } from '@/lib/config';
import { getActiveChild } from '@/hooks/useChildAge';
import { ttsSpeak } from '@/lib/voice-context';

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
        <section className="mb-5 rounded-3xl border-4 border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-xl">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" /><div><h2 className="font-black">Photo privacy</h2><p className="mt-1 text-sm font-bold">Sodafom uses the photo to answer this request and does not save it to the Sodafom database. Avoid including faces, names or private information.</p></div></div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[2rem] border-4 border-white/70 bg-white p-5 text-sky-950 shadow-xl">
            <label className="font-black">Learner&apos;s age<select value={age} onChange={event => setAge(Number(event.target.value))} className="mt-1 min-h-12 w-full rounded-2xl border-2 border-orange-200 px-4 font-bold">{Array.from({ length: 9 }, (_, index) => index + 5).map(value => <option key={value} value={value}>Age {value}</option>)}</select></label>
            <label className="mt-4 block font-black">What help do you need?<textarea value={question} onChange={event => setQuestion(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-2xl border-2 border-orange-200 p-4 font-bold" /></label>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={event => chooseImage(event.target.files?.[0])} />
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 font-black text-white shadow-lg"><Camera /> {image ? 'Choose a different photo' : 'Photograph homework'}</button>
            <p className="mt-3 text-xs font-bold text-slate-500">The local helper is used first for typed questions. A homework photo needs the protected online image helper because local text matching cannot read a new photograph.</p>
          </section>

          <section className="flex min-h-80 flex-col rounded-[2rem] border-4 border-white/70 bg-slate-950/80 p-5 text-white shadow-xl">
            {image ? <img src={image} alt="Homework selected for Archie to explain" className="min-h-0 flex-1 rounded-2xl bg-white object-contain" /> : <div className="flex flex-1 flex-col items-center justify-center text-center"><Camera size={52} className="text-yellow-300" /><h2 className="mt-3 text-xl font-black">Your homework photo will appear here</h2><p className="mt-2 text-sm font-bold text-white/70">For the clearest result, photograph one question straight-on in good light.</p></div>}
            {image && <div className="mt-3 grid grid-cols-[1fr_auto] gap-2"><button type="button" disabled={busy} onClick={() => void askArchie()} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 font-black text-white disabled:opacity-60"><Send /> {busy ? 'Archie is looking…' : 'Explain this homework'}</button><button type="button" onClick={clearImage} aria-label="Remove homework photograph" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><ImageOff /></button></div>}
          </section>
        </div>

        {answer && <section className="mt-5 rounded-[2rem] border-4 border-green-200 bg-white p-5 text-sky-950 shadow-xl"><h2 className="text-2xl font-black">Archie&apos;s explanation</h2><p className="mt-3 whitespace-pre-wrap font-semibold leading-relaxed">{answer}</p><button type="button" onClick={() => ttsSpeak(answer)} className="mt-4 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-black text-white"><Volume2 /> Read aloud</button></section>}
        {error && <p role="alert" className="mt-5 rounded-2xl border-2 border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</p>}
      </FeaturePageShell>
    </>
  );
}
