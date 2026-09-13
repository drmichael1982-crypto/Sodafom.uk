import { useState, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Archive, Check, ChevronLeft, CircleDollarSign, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { useFamilyChores } from '@/hooks/useFamilyChores';
import {
  SAFE_CHORE_IDEAS,
  approveFamilyChore,
  approvedRewardSummary,
  archiveFamilyChore,
  createFamilyChore,
  formatFamilyReward,
  returnFamilyChore,
  type RewardKind,
} from '@/lib/family-chores';

function ParentChoresInner() {
  const { chores, updateChores } = useFamilyChores();
  const [title, setTitle] = useState('');
  const [rewardKind, setRewardKind] = useState<RewardKind>('points');
  const [rewardValue, setRewardValue] = useState('5');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const waiting = chores.filter(chore => chore.status === 'waiting-for-parent');
  const visible = chores.filter(chore => chore.status !== 'archived');
  const totals = approvedRewardSummary(chores);

  const addChore = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const chore = createFamilyChore({ title, rewardKind, rewardValue, safetyConfirmed });
      updateChores(current => [chore, ...current]);
      setTitle('');
      setSafetyConfirmed(false);
      setMessage('A safe family chore has been added to this browser.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The chore could not be added.');
    }
  };

  const changeRewardKind = (nextKind: RewardKind) => {
    setRewardKind(nextKind);
    setRewardValue(nextKind === 'points' ? '5' : '0.50');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-100 via-white to-emerald-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <Helmet><title>Family Chore Controls — Sodafom</title><meta name="robots" content="noindex" /></Helmet>
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Parent chore controls navigation">
          <Link to="/parent-dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-blue-700 bg-white px-4 py-2 font-black text-blue-950 shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><ChevronLeft size={18} aria-hidden="true" /> Parent dashboard</Link>
          <Link to="/chores" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-purple-700 bg-white px-4 py-2 font-black text-purple-950 shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-600">Child view</Link>
        </nav>

        <header className="mt-5 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-violet-800 via-purple-700 to-pink-600 p-6 text-center text-white shadow-2xl sm:p-9">
          <ShieldCheck className="mx-auto text-yellow-300" size={42} aria-hidden="true" />
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Grown-up chore controls</h1>
          <p className="mx-auto mt-3 max-w-2xl font-bold text-white/95">Choose small, child-safe tasks and check work before any family reward is recorded.</p>
        </header>

        <section className="mt-5 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm" aria-label="Safety and payment notice">
          <div className="flex gap-3"><CircleDollarSign className="mt-0.5 shrink-0" aria-hidden="true" /><div><p className="font-black">Not a payment service</p><p className="mt-1 text-sm font-semibold">This screen is protected by Sodafom’s existing sign-in and stores a small family tracker only in this browser. No money is held, moved, or paid by Sodafom; adults handle any pocket money directly. Do not use this as a bank or security record.</p></div></div>
        </section>

        <p aria-live="polite" className="sr-only">{message || error}</p>

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Approved family reward summary">
          <div className="rounded-3xl border-2 border-blue-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-black text-blue-800">{totals.approvedCount}</p><p className="mt-1 text-sm font-bold text-slate-600">Approved chores</p></div>
          <div className="rounded-3xl border-2 border-emerald-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-black text-emerald-800">{totals.points}</p><p className="mt-1 text-sm font-bold text-slate-600">Chore points only</p></div>
          <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm"><p className="text-3xl font-black text-amber-800">{formatFamilyReward({ kind: 'pocket-money', points: 0, pence: totals.pocketMoneyPence })}</p><p className="mt-1 text-sm font-bold text-slate-600">Pocket-money notes</p></div>
        </section>

        <form onSubmit={addChore} className="mt-6 rounded-[2rem] border-4 border-white bg-white p-5 shadow-xl sm:p-7">
          <div className="flex items-start gap-3"><Sparkles className="mt-0.5 text-purple-700" aria-hidden="true" /><div><h2 className="text-2xl font-black text-blue-950">Add a safe chore</h2><p className="mt-1 text-sm font-semibold text-slate-600">Keep tasks short, kind and suitable for the child. Avoid heat, sharp items, chemicals, roads, heavy lifting and private tasks.</p></div></div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Safe chore ideas">{SAFE_CHORE_IDEAS.map(idea => <button key={idea} type="button" onClick={() => { setTitle(idea); setSafetyConfirmed(false); }} className="rounded-full border-2 border-purple-200 bg-purple-50 px-3 py-2 text-sm font-black text-purple-900 transition hover:bg-purple-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-600">{idea}</button>)}</div>
          <label className="mt-5 block font-black text-blue-950" htmlFor="family-chore-title">Chore name<input id="family-chore-title" value={title} onChange={event => { setTitle(event.target.value); setSafetyConfirmed(false); }} required minLength={2} maxLength={80} placeholder="For example: Put books back on the shelf" className="mt-2 min-h-12 w-full rounded-2xl border-2 border-sky-200 px-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-200" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="font-black text-blue-950" htmlFor="family-chore-reward-kind">Reward type<select id="family-chore-reward-kind" value={rewardKind} onChange={event => changeRewardKind(event.target.value as RewardKind)} className="mt-2 min-h-12 w-full rounded-2xl border-2 border-sky-200 bg-white px-4 font-bold text-slate-900"><option value="points">Chore points (not game stars)</option><option value="pocket-money">Pocket-money note (not a payment)</option></select></label><label className="font-black text-blue-950" htmlFor="family-chore-reward-value">{rewardKind === 'points' ? 'Whole chore points (0–100)' : 'Pocket-money note (£0.00–£50.00)'}<input id="family-chore-reward-value" value={rewardValue} onChange={event => setRewardValue(event.target.value)} inputMode={rewardKind === 'points' ? 'numeric' : 'decimal'} maxLength={6} className="mt-2 min-h-12 w-full rounded-2xl border-2 border-sky-200 px-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-200" /></label></div>
          <label className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-950"><input type="checkbox" checked={safetyConfirmed} onChange={event => setSafetyConfirmed(event.target.checked)} className="mt-1 h-5 w-5" required /> <span>I am a grown-up and confirm this task is safe, suitable and supervised where needed.</span></label>
          {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 font-bold text-red-800">{error}</p>}
          {message && <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-3 font-bold text-emerald-800">{message}</p>}
          <button type="submit" className="mt-5 min-h-14 w-full rounded-2xl bg-purple-700 px-4 py-3 font-black text-white shadow-lg transition hover:bg-purple-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-600">Add this family chore</button>
        </form>

        <section className="mt-6 rounded-[2rem] border-4 border-amber-300 bg-amber-50 p-5 shadow-xl">
          <h2 className="text-2xl font-black text-amber-950">Waiting for your check ({waiting.length})</h2>
          <p className="mt-1 font-semibold text-amber-900">A reward only counts after you choose Approve. Returning a chore records nothing.</p>
          {waiting.length === 0 ? <p className="mt-4 rounded-2xl bg-white p-4 font-semibold text-slate-600">Nothing is waiting right now.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{waiting.map(chore => <article key={chore.id} className="rounded-3xl bg-white p-4 shadow"><h3 className="text-xl font-black text-blue-950">{chore.title}</h3><p className="mt-1 font-bold text-emerald-700">{formatFamilyReward(chore.reward)}{chore.reward.kind === 'pocket-money' ? ' pocket-money note' : ''}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { updateChores(current => approveFamilyChore(current, chore.id)); setMessage('Approved once in this device-local family tracker.'); }} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><Check size={18} aria-hidden="true" /> Approve</button><button type="button" onClick={() => { updateChores(current => returnFamilyChore(current, chore.id, 'Please have another go with a grown-up.')); setMessage('Sent back for another try. No reward was recorded.'); }} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-amber-200 px-3 font-black text-amber-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-600"><RotateCcw size={18} aria-hidden="true" /> Try again</button></div></article>)}</div>}
        </section>

        <section className="mt-6 rounded-[2rem] border-4 border-white bg-white p-5 shadow-xl">
          <h2 className="text-2xl font-black text-blue-950">Family chore list</h2>
          {visible.length === 0 ? <p className="mt-4 font-semibold text-slate-600">No chores have been added yet.</p> : <div className="mt-4 space-y-3">{visible.map(chore => <article key={chore.id} className="flex flex-col justify-between gap-3 rounded-3xl border-2 border-sky-100 p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-wide text-sky-700">{chore.status.replaceAll('-', ' ')}</p><h3 className="text-xl font-black text-blue-950">{chore.title}</h3><p className="mt-1 font-bold text-emerald-700">{formatFamilyReward(chore.reward)}{chore.reward.kind === 'pocket-money' ? ' pocket-money note' : ''}</p></div>{chore.status !== 'waiting-for-parent' && <button type="button" onClick={() => { updateChores(current => archiveFamilyChore(current, chore.id)); setMessage('The chore is hidden from the child list. Pending reviews are never hidden.'); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 font-black text-slate-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-600"><Archive size={17} aria-hidden="true" /> Archive</button>}</article>)}</div>}
        </section>
      </div>
    </main>
  );
}

export default function ParentChoresPage() {
  return <ProtectedRoute redirectTo="/hub/login"><ParentChoresInner /></ProtectedRoute>;
}
