import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Check, RotateCcw, Trash2, UserRoundPlus } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { getActiveChild } from '@/hooks/useChildAge';
import { useFamilyChores } from '@/hooks/useFamilyChores';
import {
  approveFamilyChore,
  createFamilyChore,
  formatPocketMoney,
  removeFamilyChore,
  returnFamilyChore,
} from '@/lib/family-chores';

const SUGGESTIONS = ['Tidy bedroom', 'Set the table', 'Feed the pets', 'Help with cleaning', 'Help wash the car'];

function ParentChoresInner() {
  const { chores, updateChores } = useFamilyChores();
  const [childName, setChildName] = useState(() => getActiveChild()?.name || 'Archie');
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('1.00');
  const [error, setError] = useState('');

  const addChore = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const chore = createFamilyChore({ childName, title, rewardPounds: Number(reward) });
      updateChores(current => [chore, ...current]);
      setTitle('');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'The chore could not be added.');
    }
  };

  const waiting = chores.filter(chore => chore.status === 'waiting-for-parent');
  const active = chores.filter(chore => chore.status !== 'approved');
  const approved = chores.filter(chore => chore.status === 'approved');

  return (
    <>
      <Helmet><title>Parent Chore Setup — Sodafom</title><meta name="robots" content="noindex" /></Helmet>
      <FeaturePageShell title="Parent Chore Setup" subtitle="Create chores, choose rewards and approve completed jobs." emoji="👨‍👩‍👧" accent="from-teal-500 via-cyan-700 to-blue-950">
        <section className="mb-5 rounded-3xl border-4 border-yellow-200 bg-yellow-50 p-4 text-amber-950 shadow-xl">
          <h2 className="font-black">Sodafom does not handle the money</h2>
          <p className="mt-1 text-sm font-bold">This is only a family tracker. Parents choose and pay rewards directly. Sodafom takes no fee or percentage.</p>
        </section>

        <form onSubmit={addChore} className="mb-6 rounded-[2rem] border-4 border-white/70 bg-white p-5 text-sky-950 shadow-xl">
          <h2 className="flex items-center gap-2 text-2xl font-black"><UserRoundPlus className="text-teal-600" /> Add a chore</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="font-black">Child name<input value={childName} onChange={event => setChildName(event.target.value)} maxLength={50} required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-sky-200 px-4 font-bold" /></label>
            <label className="font-black">Reward (£)<input type="number" value={reward} onChange={event => setReward(event.target.value)} min="0" max="1000" step="0.01" required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-sky-200 px-4 font-bold" /></label>
          </div>
          <label className="mt-4 block font-black">Chore<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} required placeholder="For example: feed the pets" className="mt-1 min-h-12 w-full rounded-2xl border-2 border-sky-200 px-4 font-bold" /></label>
          <div className="mt-3 flex flex-wrap gap-2">{SUGGESTIONS.map(suggestion => <button key={suggestion} type="button" onClick={() => setTitle(suggestion)} className="rounded-full bg-sky-100 px-3 py-2 text-xs font-black text-sky-900">{suggestion}</button>)}</div>
          {error && <p role="alert" className="mt-3 rounded-2xl bg-red-50 p-3 font-bold text-red-700">{error}</p>}
          <button type="submit" className="mt-4 min-h-14 w-full rounded-2xl bg-teal-600 font-black text-white shadow-lg active:scale-[0.99]">Add chore for {childName || 'child'}</button>
        </form>

        {waiting.length > 0 && (
          <section className="mb-6 rounded-[2rem] border-4 border-yellow-300 bg-yellow-50 p-5 text-amber-950 shadow-xl">
            <h2 className="text-2xl font-black">Waiting for your approval</h2>
            <div className="mt-4 space-y-3">{waiting.map(chore => <article key={chore.id} className="rounded-3xl bg-white p-4 shadow"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-amber-700">{chore.childName} marked this done</p><h3 className="text-lg font-black">{chore.title}</h3></div><span className="font-black">{formatPocketMoney(chore.rewardPence)}</span></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => updateChores(current => approveFamilyChore(current, chore.id))} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 font-black text-white"><Check size={19} /> Approve</button><button type="button" onClick={() => updateChores(current => returnFamilyChore(current, chore.id))} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-200 px-3 font-black"><RotateCcw size={19} /> Try again</button></div></article>)}</div>
          </section>
        )}

        <section className="rounded-[2rem] bg-white p-5 text-sky-950 shadow-xl">
          <h2 className="text-2xl font-black">Family chore list</h2>
          {active.length === 0 && approved.length === 0 ? <p className="mt-3 font-bold text-slate-600">No chores have been added yet.</p> : <div className="mt-4 space-y-2">{chores.map(chore => <div key={chore.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-sky-100 p-3"><div><p className="text-xs font-black uppercase text-sky-700">{chore.childName} · {chore.status.replaceAll('-', ' ')}</p><p className="font-black">{chore.title}</p><p className="text-sm font-bold text-emerald-700">{formatPocketMoney(chore.rewardPence)}</p></div><button type="button" onClick={() => updateChores(current => removeFamilyChore(current, chore.id))} aria-label={`Remove ${chore.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700"><Trash2 size={19} /></button></div>)}</div>}
        </section>
      </FeaturePageShell>
    </>
  );
}

export default function ParentChoresPage() {
  return <ProtectedRoute redirectTo="/hub/login"><ParentChoresInner /></ProtectedRoute>;
}
