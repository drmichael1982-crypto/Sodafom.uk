import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock3, Mic, MicOff, Send, ShieldCheck, XCircle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak, stopTts } from '@/lib/voice-context';

type ChangeRequest = {
  id: number;
  instruction: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'blocked';
  plan: string;
  testSummary: string;
  status: string;
  createdAt: string | null;
};

export function FounderVoiceControl() {
  const [instruction, setInstruction] = useState('');
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Founder authentication confirmed. Tell Archie what you want prepared.');
  const recognitionRef = useRef<any>(null);

  const loadHistory = async () => {
    const response = await fetch(`${API_PREFIX}/admin/founder-changes`, { credentials: 'include' });
    if (!response.ok) return;
    const data = await response.json() as { changes?: ChangeRequest[] };
    setChanges(data.changes ?? []);
  };

  useEffect(() => {
    void loadHistory();
    return () => {
      try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
      stopTts();
    };
  }, []);

  const listen = () => {
    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('This browser does not provide speech recognition. Type the instruction instead.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? '';
      setInstruction(transcript.replace(/^archie[, ]*/i, ''));
      setMessage('I heard you. Review the wording, then ask me to prepare it.');
      ttsSpeak('I heard you. Please review the wording, then ask me to prepare it.');
    };
    recognition.onerror = () => setMessage('I could not hear that clearly. Try again or type the instruction.');
    recognition.onend = () => setListening(false);
    setListening(true);
    setMessage('Listening…');
    recognition.start();
  };

  const prepare = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!instruction.trim()) return;
    setBusy(true);
    setMessage('Running safety checks and preparing the change plan…');
    try {
      const response = await fetch(`${API_PREFIX}/admin/founder-changes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: instruction.trim() }),
      });
      const data = await response.json() as { change?: ChangeRequest; error?: string };
      if (!response.ok || !data.change) throw new Error(data.error ?? 'Could not prepare change');
      setChanges((current) => [data.change!, ...current]);
      setInstruction('');
      const spoken = data.change.status === 'blocked'
        ? `I blocked that request. ${data.change.plan}`
        : `I prepared the change safely. ${data.change.plan} Please review it before final approval.`;
      setMessage(spoken);
      ttsSpeak(spoken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not prepare change');
    } finally {
      setBusy(false);
    }
  };

  const decide = async (id: number, action: 'approve' | 'reject') => {
    setBusy(true);
    try {
      const response = await fetch(`${API_PREFIX}/admin/founder-changes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json() as { change?: ChangeRequest; error?: string };
      if (!response.ok || !data.change) throw new Error(data.error ?? 'Could not update request');
      setChanges((current) => current.map((change) => change.id === id ? data.change! : change));
      const nextMessage = action === 'approve'
        ? 'Approved for development. Nothing has been deployed; a tested code change and a final live-deployment approval are still required.'
        : 'The change request was rejected. Nothing was deployed.';
      setMessage(nextMessage);
      ttsSpeak(nextMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 shrink-0 text-blue-700" />
          <div>
            <h2 className="text-xl font-black text-slate-900">Founder Voice Control</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">Voice is only an input method. Your secure founder session is the authentication check.</p>
          </div>
        </div>
        <p aria-live="polite" className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-800 shadow-inner">Archie: {message}</p>
        <form onSubmit={prepare} className="mt-4 space-y-3">
          <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={500} rows={4} placeholder="Example: Add Pocket Money Chores to the homepage." className="w-full rounded-2xl border-2 border-blue-200 bg-white p-4 text-sm font-semibold outline-none focus:border-blue-500" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={listen} className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-black text-white ${listening ? 'bg-red-500' : 'bg-purple-600'}`}>
              {listening ? <MicOff /> : <Mic />} {listening ? 'Stop listening' : 'Speak to Archie'}
            </button>
            <button type="submit" disabled={busy || instruction.trim().length < 5} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-700 font-black text-white disabled:opacity-50">
              <Send /> Prepare safely
            </button>
          </div>
        </form>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 font-black text-slate-900"><Clock3 size={18} /> Audit history</h3>
        <div className="space-y-3">
          {changes.length === 0 && <p className="rounded-2xl border border-dashed p-5 text-sm text-slate-500">No founder change requests yet.</p>}
          {changes.map((change) => (
            <article key={change.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black text-slate-900">#{change.id} · {change.category}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${change.status === 'blocked' ? 'bg-red-100 text-red-700' : change.status === 'approved_for_development' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>{change.status.replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-800">“{change.instruction}”</p>
              <p className="mt-2 text-sm text-slate-600">{change.plan}</p>
              <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-slate-500">{change.status === 'blocked' ? <AlertTriangle className="shrink-0 text-red-500" size={16} /> : <CheckCircle className="shrink-0 text-green-600" size={16} />}{change.testSummary}</p>
              {change.status === 'prepared' && (
                <div className="mt-4 flex gap-2">
                  <button disabled={busy} onClick={() => decide(change.id, 'approve')} className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-xs font-black text-white"><CheckCircle size={15} /> Approve for development</button>
                  <button disabled={busy} onClick={() => decide(change.id, 'reject')} className="flex items-center gap-1 rounded-xl bg-slate-200 px-4 py-2 text-xs font-black text-slate-800"><XCircle size={15} /> Reject</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
