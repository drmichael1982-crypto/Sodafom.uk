import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2, Clock3, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useFamilyChores } from '@/hooks/useFamilyChores';
import { formatFamilyReward, submitFamilyChore, type FamilyChore } from '@/lib/family-chores';

function choreStatus(chore: FamilyChore): { label: string; className: string } {
  switch (chore.status) {
    case 'waiting-for-parent': return { label: 'Waiting for a grown-up to check', className: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'approved': return { label: 'Checked by a grown-up', className: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'needs-another-try': return { label: 'Have another go', className: 'bg-sky-100 text-sky-900 border-sky-300' };
    default: return { label: 'Ready when you are', className: 'bg-purple-100 text-purple-900 border-purple-300' };
  }
}

export default function ChoresPage() {
  const { chores, updateChores } = useFamilyChores();
  const [message, setMessage] = useState('');
  const visibleChores = chores.filter(chore => chore.status !== 'archived');

  const submit = (chore: FamilyChore) => {
    updateChores(current => submitFamilyChore(current, chore.id));
    setMessage('Well done for helping. Your chore is waiting for a grown-up to check. No reward has been recorded yet.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-emerald-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <Helmet><title>Family Chores — Sodafom</title><meta name="robots" content="noindex" /></Helmet>
      <div className="mx-auto max-w-5xl">
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Family chores navigation">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-blue-700 bg-white px-4 py-2 font-black text-blue-950 shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            <Home size={18} aria-hidden="true" /> Home
          </Link>
          <Link to="/parent-dashboard/chores" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-purple-700 bg-white px-4 py-2 font-black text-purple-950 shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-purple-600">
            <ShieldCheck size={18} aria-hidden="true" /> Grown-up controls
          </Link>
        </nav>

        <header className="mt-5 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 p-6 text-center text-white shadow-2xl sm:p-9">
          <Sparkles className="mx-auto text-yellow-300" size={42} aria-hidden="true" />
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Family chores</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-white/95 sm:text-lg">Small jobs, kind encouragement, and a grown-up check at the end.</p>
        </header>

        <section className="mt-5 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm" aria-label="Family tracker notice">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0" aria-hidden="true" /><div><p className="font-black">Family tracker only</p><p className="mt-1 text-sm font-semibold">Sodafom does not hold, send, or collect money. A pocket-money amount is only a note for a grown-up to handle directly. Chore points are not game stars.</p></div></div>
        </section>

        <p aria-live="polite" className="sr-only">{message}</p>

        {visibleChores.length === 0 ? (
          <section className="mt-6 rounded-[2rem] border-4 border-dashed border-sky-300 bg-white p-8 text-center shadow-sm">
            <p className="text-5xl" aria-hidden="true">🧺</p>
            <h2 className="mt-3 text-2xl font-black text-blue-950">No chores just yet</h2>
            <p className="mx-auto mt-2 max-w-lg font-semibold text-slate-600">Ask a grown-up to choose a small, safe home task together.</p>
          </section>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="Your chores">
            {visibleChores.map(chore => {
              const status = choreStatus(chore);
              const canSubmit = chore.status === 'ready' || chore.status === 'needs-another-try';
              return (
                <article key={chore.id} className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-xl">
                  <span className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-black ${status.className}`}>
                    {chore.status === 'approved' ? <CheckCircle2 size={16} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />} {status.label}
                  </span>
                  <h2 className="mt-4 text-2xl font-black text-blue-950">{chore.title}</h2>
                  <p className="mt-2 font-bold text-emerald-700">{formatFamilyReward(chore.reward)}{chore.reward.kind === 'pocket-money' ? ' pocket-money note' : ''}</p>
                  {chore.status === 'waiting-for-parent' && <p className="mt-3 text-sm font-semibold text-slate-600">A reward is not recorded until a grown-up checks the job.</p>}
                  {chore.status === 'approved' && <p className="mt-3 text-sm font-semibold text-emerald-800">Great helping! Your grown-up has recorded this family reward once.</p>}
                  {chore.status === 'needs-another-try' && <p className="mt-3 text-sm font-semibold text-sky-800">{chore.parentNote || 'Please have another go with a grown-up if you need help.'}</p>}
                  {canSubmit && <button type="button" onClick={() => submit(chore)} className="mt-5 min-h-12 w-full rounded-2xl bg-blue-700 px-4 py-3 font-black text-white shadow transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{chore.status === 'needs-another-try' ? 'I tried again — please check' : 'I finished this job'}</button>}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
