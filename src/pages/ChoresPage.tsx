import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowLeft, CheckCircle2, Clock3, Coins, Edit3, Plus, ShieldCheck, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak } from '@/lib/voice-context';

type Child = { id: number; name: string; ageGroup: string; avatarEmoji?: string | null };
type Chore = { id: number; childId: number; title: string; valuePence: number; active: boolean };
type Completion = { id: number; choreId: number; status: string; completedAt: string; approvedAt?: string | null };

function ChoresScreen({ parentMode }: { parentMode: boolean }) {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<number | null>(null);
  const [chores, setChores] = useState<Chore[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('1.00');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch(`${API_PREFIX}/children`, { credentials: 'include' }).then(async (response) => {
      if (!response.ok) throw new Error('Please ask a parent to sign in first.');
      const rows = await response.json() as Child[];
      setChildren(rows);
      let storedId: number | null = null;
      try { storedId = Number(JSON.parse(localStorage.getItem('sodafom_active_child') || 'null')?.id) || null; } catch { /* ignore */ }
      setChildId(rows.some((child) => child.id === storedId) ? storedId : rows[0]?.id ?? null);
    }).catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load child profiles'));
  }, []);

  const load = async (selectedChildId: number) => {
    const response = await fetch(`${API_PREFIX}/chores?childId=${selectedChildId}`, { credentials: 'include' });
    const data = await response.json() as { chores?: Chore[]; completions?: Completion[]; error?: string };
    if (!response.ok) throw new Error(data.error ?? 'Could not load chores');
    setChores(data.chores ?? []);
    setCompletions(data.completions ?? []);
  };

  useEffect(() => {
    if (!childId) return;
    void load(childId).catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load chores'));
  }, [childId]);

  const selectedChild = children.find((child) => child.id === childId) ?? null;
  const waitingByChore = useMemo(() => new Set(completions.filter((item) => item.status === 'waiting_for_parent').map((item) => item.choreId)), [completions]);
  const approvedTotal = completions.filter((item) => item.status === 'approved').reduce((sum, item) => sum + (chores.find((chore) => chore.id === item.choreId)?.valuePence ?? 0), 0);

  const action = async (body: Record<string, unknown>, successMessage: string) => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API_PREFIX}/chores`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Could not update chores');
      if (childId) await load(childId);
      setMessage(successMessage);
      ttsSpeak(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update chores');
    } finally {
      setBusy(false);
    }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!childId) return;
    await action({ action: 'create', childId, title, valuePence: Math.round(Number(value) * 100) }, 'Chore added. Archie will show it on the child page.');
    setTitle('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-yellow-100 px-4 py-6 text-slate-900">
      <Helmet><title>{parentMode ? 'Manage Chores' : 'Pocket Money & Chores'} — Sodafom</title></Helmet>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button onClick={() => navigate(parentMode ? '/parent-dashboard' : '/')} className="flex min-h-11 items-center gap-2 rounded-full bg-blue-700 px-4 py-2 font-black text-white"><ArrowLeft size={18} /> Back</button>
          {!parentMode && <button onClick={() => navigate('/parent-dashboard/chores')} className="rounded-full bg-purple-600 px-4 py-2 text-sm font-black text-white">Parent controls</button>}
        </div>

        <section className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3"><Coins size={34} className="text-yellow-300" /><div><h1 className="text-3xl font-black">Pocket Money &amp; Chores</h1><p className="font-bold text-blue-50">Help at home, then let a parent approve the job.</p></div></div>
          <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm font-bold"><ShieldCheck className="mr-2 inline" size={18} />Sodafom takes £0 and 0% commission. Rewards are agreed and paid directly by parents.</div>
        </section>

        {children.length > 0 && <div className="my-5 flex gap-2 overflow-x-auto">{children.map((child) => <button key={child.id} onClick={() => setChildId(child.id)} className={`rounded-full border-2 px-4 py-2 font-black ${childId === child.id ? 'border-blue-700 bg-blue-700 text-white' : 'border-blue-200 bg-white'}`}>{child.avatarEmoji ?? '⭐'} {child.name}</button>)}</div>}
        {message && <p aria-live="polite" className="my-4 rounded-2xl border border-blue-200 bg-white p-4 font-bold text-blue-900">{message}</p>}

        {!selectedChild && <section className="mt-5 rounded-2xl bg-white p-6 text-center shadow"><p className="font-bold">A parent needs to sign in and create a child profile first.</p><button onClick={() => navigate('/hub/login')} className="mt-3 rounded-full bg-blue-700 px-5 py-2 font-black text-white">Parent sign in</button></section>}

        {selectedChild && parentMode && (
          <form onSubmit={create} className="mt-5 rounded-3xl border-2 border-purple-200 bg-white p-5 shadow">
            <h2 className="flex items-center gap-2 text-xl font-black"><Plus /> Add a chore for {selectedChild.name}</h2>
            <label className="mt-4 block text-sm font-black">Chore</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="e.g. Feed the dogs" className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 font-semibold" />
            <label className="mt-3 block text-sm font-black">Pocket-money value (£)</label>
            <input type="number" min="0" max="1000" step="0.01" value={value} onChange={(event) => setValue(event.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 font-semibold" />
            <button type="submit" disabled={busy || title.trim().length < 2} className="mt-4 w-full rounded-xl bg-purple-600 p-3 font-black text-white disabled:opacity-50">Add chore</button>
          </form>
        )}

        {selectedChild && (
          <section className="mt-5 space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">{parentMode ? 'Chores and approvals' : `${selectedChild.name}'s chores`}</h2><button onClick={() => ttsSpeak(`Choose a chore when you have finished it. Your parent will check it before the reward is counted.`)} className="rounded-full bg-yellow-300 p-3 text-blue-900" aria-label="Hear Archie explain chores"><Volume2 /></button></div>
            {chores.filter((chore) => chore.active).map((chore) => {
              const waiting = completions.find((item) => item.choreId === chore.id && item.status === 'waiting_for_parent');
              return <article key={chore.id} className="rounded-3xl border-2 border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black">{chore.title}</p><p className="font-black text-green-700">£{(chore.valuePence / 100).toFixed(2)}</p></div>{waiting ? <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800"><Clock3 size={14} /> Waiting for parent</span> : <CheckCircle2 className="text-blue-500" />}</div>
                {!parentMode && <button disabled={busy || waitingByChore.has(chore.id)} onClick={() => action({ action: 'complete', choreId: chore.id }, 'Great job! Archie has asked your parent to check it.')} className="mt-4 w-full rounded-xl bg-blue-600 p-3 font-black text-white disabled:bg-slate-300">{waiting ? 'Waiting for parent approval' : 'I finished this job'}</button>}
                {parentMode && waiting && <button disabled={busy} onClick={() => action({ action: 'approve', completionId: waiting.id }, 'Approved! The reward is now counted in the family tracker.')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 p-3 font-black text-white"><CheckCircle2 /> Parent approve</button>}
                {parentMode && <button disabled={busy} onClick={() => action({ action: 'update', choreId: chore.id, title: chore.title, valuePence: chore.valuePence, active: false }, 'Chore hidden.')} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 p-2 text-sm font-black"><Edit3 size={15} /> Hide chore</button>}
              </article>;
            })}
            {chores.filter((chore) => chore.active).length === 0 && <p className="rounded-2xl border border-dashed bg-white p-6 text-center font-bold text-slate-500">No chores yet.</p>}
            <p className="rounded-2xl bg-green-100 p-4 text-center font-black text-green-800">Approved family rewards tracked: £{(approvedTotal / 100).toFixed(2)}</p>
          </section>
        )}
      </div>
    </main>
  );
}

export default function ChoresPage() { return <ChoresScreen parentMode={false} />; }
export function ParentChoresPage() { return <ChoresScreen parentMode />; }
