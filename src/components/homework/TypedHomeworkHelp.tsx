import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Send } from 'lucide-react';
import { askArchie, friendlyArchieError, type ArchieReply } from '@/lib/archie-routing';
import { ArchieRoutingError } from '@/lib/archie-routing-core';
import { localHomeworkHelp } from './homework-help';

const button = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2';

export default function TypedHomeworkHelp() {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<ArchieReply | null>(null);
  const [hint, setHint] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    request.current?.abort();
    request.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const ask = async (wantHint: boolean) => {
    const originalQuestion = question.trim();
    if (!originalQuestion || request.current) return;
    setReply(null); setError(''); setNotice(''); setHint(wantHint);
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    timeout.current = setTimeout(() => {
      if (request.current !== controller) return;
      stop(); setBusy(false);
      setError('That took too long. Your question is still here. Please try again.');
    }, 15000);
    try {
      const localHint = localHomeworkHelp(originalQuestion, wantHint);
      if (!localHint) {
        if (wantHint) throw new Error('NO_HOMEWORK_HINT');
        throw new ArchieRoutingError('FALLBACK_DISABLED');
      }
      const answer = await askArchie({
        messages: [{ role: 'user', content: originalQuestion }],
        localHint,
        allowOpenAiFallback: false,
        signal: controller.signal,
      });
      if (request.current !== controller) return;
      if (!answer.text.trim()) throw new ArchieRoutingError('INVALID_RESPONSE');
      setReply(answer);
    } catch (nextError) {
      if (request.current !== controller) return;
      setError(nextError instanceof Error && nextError.message === 'NO_HOMEWORK_HINT'
        ? 'I have not got a useful hint for that question yet. Your question is still here. Try Ask Archie, or ask a grown-up to help.'
        : friendlyArchieError(nextError));
    } finally {
      if (request.current === controller) { stop(); setBusy(false); }
    }
  };

  return <section aria-labelledby="typed-homework-title" aria-busy={busy} className="mb-5 space-y-4 rounded-3xl border-2 border-sky-100 bg-white p-5 text-slate-900 shadow-lg">
    <h2 id="typed-homework-title" className="text-xl font-black">Type a homework question</h2>
    <p className="leading-relaxed">You can ask without taking a photo. Start with one question, such as “Please explain 7 × 8 with a simple example.”</p>
    <form onSubmit={event => { event.preventDefault(); void ask(false); }} className="space-y-4">
      <label htmlFor="typed-homework-question" className="block font-bold">Your homework question</label>
      <textarea id="typed-homework-question" value={question} onChange={event => {
        stop(); setBusy(false); setReply(null); setError(''); setNotice(''); setQuestion(event.target.value);
      }} maxLength={500} rows={3} placeholder="What would you like help with?" className="w-full rounded-xl border-2 border-sky-200 p-3 leading-relaxed" />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy || !question.trim()} className={`${button} bg-sky-700 text-white`}><Send aria-hidden />Ask Archie</button>
        <button type="button" disabled={busy || !question.trim()} onClick={() => void ask(true)} className={`${button} border-2 border-violet-700 text-violet-800`}><Lightbulb aria-hidden />Give me a hint</button>
      </div>
    </form>
    <p className="text-sm leading-relaxed text-slate-600">Typed help uses Local AI. No AI vouchers are spent. If Archie does not know, he will tell you. Keep names and private details out of your question.</p>
    {busy && <div role="status" className="space-y-2"><p>Archie is thinking about your question…</p><button type="button" onClick={() => {
      stop(); setBusy(false); setNotice('Your question was stopped. You can ask again when you are ready.');
    }} className={`${button} border-2 border-slate-300`}>Cancel typed question</button></div>}
    {notice && <p role="status" className="rounded-xl bg-sky-50 p-3">{notice}</p>}
    {error && <div role="alert" className="space-y-3 rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-rose-800"><p className="font-bold">{error}</p><button type="button" onClick={() => void ask(hint)} className={`${button} border-2 border-rose-300`}>Try again</button></div>}
    <div aria-live="polite" aria-atomic="true">
      {reply && <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-lg font-black">{hint ? 'Archie’s hint' : 'Archie’s homework help'}</h3>
        <p className="text-sm font-bold text-emerald-800">Local AI · No vouchers used</p>
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{reply.text}</p>
      </div>}
    </div>
  </section>;
}
