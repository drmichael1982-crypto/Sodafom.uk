import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2, Clock3, PartyPopper, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';
import { useFamilyChores } from '@/hooks/useFamilyChores';
import { formatPocketMoney, markFamilyChoreComplete } from '@/lib/family-chores';
import { ttsSpeak } from '@/lib/voice-context';

export default function PocketMoneyPage() {
  const navigate = useNavigate();
  const { chores, updateChores } = useFamilyChores();
  const assigned = chores.filter(chore => chore.status === 'assigned');
  const waiting = chores.filter(chore => chore.status === 'waiting-for-parent');
  const approved = chores.filter(chore => chore.status === 'approved');
  const approvedTotal = approved.reduce((total, chore) => total + chore.rewardPence, 0);

  const markDone = (id: string, title: string) => {
    updateChores(current => markFamilyChoreComplete(current, id));
    ttsSpeak(`Great work! ${title} is now waiting for a parent to approve it.`);
  };

  return (
    <>
      <Helmet><title>Pocket Money &amp; Chores — Sodafom</title></Helmet>
      <FeaturePageShell title="Pocket Money & Chores" subtitle="Help at home, mark chores done, then wait for a parent." emoji="🧹" accent="from-lime-500 via-emerald-600 to-teal-900">
        <section className="mb-5 rounded-3xl border-4 border-yellow-200 bg-yellow-50 p-4 text-amber-950 shadow-xl">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="font-black">Family feature — no Sodafom fee</h2>
              <p className="mt-1 text-sm font-bold">Pocket money is agreed and paid directly by the parent. Sodafom never takes a fee, commission or percentage.</p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white p-3 text-sky-950 shadow"><p className="text-2xl font-black">{assigned.length}</p><p className="text-xs font-bold">To do</p></div>
          <div className="rounded-2xl bg-white p-3 text-amber-900 shadow"><p className="text-2xl font-black">{waiting.length}</p><p className="text-xs font-bold">Waiting</p></div>
          <div className="rounded-2xl bg-white p-3 text-emerald-900 shadow"><p className="text-2xl font-black">{formatPocketMoney(approvedTotal)}</p><p className="text-xs font-bold">Approved</p></div>
        </section>

        {chores.length === 0 && (
          <section className="rounded-[2rem] border-4 border-white/70 bg-white p-7 text-center text-sky-950 shadow-xl">
            <span className="text-6xl" aria-hidden="true">🧺</span>
            <h2 className="mt-3 text-2xl font-black">No chores yet</h2>
            <p className="mt-2 font-bold text-slate-600">A parent can add the first chore and choose its reward.</p>
            <button type="button" onClick={() => navigate('/pocket-money/setup')} className="mt-5 rounded-full bg-emerald-600 px-6 py-3 font-black text-white shadow-lg">Parent chore setup</button>
          </section>
        )}

        {assigned.length > 0 && (
          <section className="mb-5 rounded-[2rem] bg-white p-5 text-sky-950 shadow-xl">
            <h2 className="text-2xl font-black">My chores</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {assigned.map(chore => (
                <article key={chore.id} className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-emerald-700">For {chore.childName}</p><h3 className="mt-1 text-lg font-black">{chore.title}</h3></div><span className="rounded-full bg-yellow-300 px-3 py-1 font-black text-amber-950">{formatPocketMoney(chore.rewardPence)}</span></div>
                  <button type="button" onClick={() => markDone(chore.id, chore.title)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-black text-white shadow active:scale-95"><CheckCircle2 /> I have done it</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {waiting.length > 0 && (
          <section className="mb-5 rounded-[2rem] bg-amber-50 p-5 text-amber-950 shadow-xl">
            <h2 className="flex items-center gap-2 text-xl font-black"><Clock3 /> Waiting for parent approval</h2>
            <div className="mt-3 space-y-2">{waiting.map(chore => <div key={chore.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4"><div><p className="text-xs font-black text-amber-700">{chore.childName}</p><p className="font-black">{chore.title}</p></div><span className="font-black">{formatPocketMoney(chore.rewardPence)}</span></div>)}</div>
          </section>
        )}

        {approved.length > 0 && (
          <section className="rounded-[2rem] bg-emerald-950/80 p-5 text-white shadow-xl">
            <h2 className="flex items-center gap-2 text-xl font-black"><PartyPopper className="text-yellow-300" /> Parent approved</h2>
            <div className="mt-3 space-y-2">{approved.map(chore => <div key={chore.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-4"><div><p className="text-xs font-black text-emerald-200">{chore.childName}</p><p className="font-black">{chore.title}</p></div><span className="rounded-full bg-yellow-300 px-3 py-1 font-black text-emerald-950">{formatPocketMoney(chore.rewardPence)}</span></div>)}</div>
          </section>
        )}
      </FeaturePageShell>
    </>
  );
}
