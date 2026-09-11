import { useMemo, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { CalendarDays, PartyPopper, Save, Volume2 } from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { getActiveChild } from '@/hooks/useChildAge';
import { ttsSpeak } from '@/lib/voice-context';

const BIRTHDAY_KEY = 'sodafom_birthday_v1';

interface SavedBirthday { childName: string; date: string }

function loadBirthday(): SavedBirthday {
  try {
    const parsed = JSON.parse(localStorage.getItem(BIRTHDAY_KEY) || '{}') as Partial<SavedBirthday>;
    return { childName: parsed.childName || getActiveChild()?.name || 'Archie', date: parsed.date || '' };
  } catch {
    return { childName: getActiveChild()?.name || 'Archie', date: '' };
  }
}

function birthdayCountdown(dateText: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
  const [birthYear, month, day] = dateText.split('-').map(Number);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < start) next = new Date(today.getFullYear() + 1, month - 1, day);
  const days = Math.round((next.getTime() - start.getTime()) / 86_400_000);
  const nextAge = next.getFullYear() - birthYear;
  return { days, next, nextAge };
}

export default function BirthdayPage() {
  const initial = useMemo(loadBirthday, []);
  const [childName, setChildName] = useState(initial.childName);
  const [date, setDate] = useState(initial.date);
  const [saved, setSaved] = useState(Boolean(initial.date));
  const countdown = birthdayCountdown(date);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const next = { childName: childName.trim().slice(0, 50), date };
    localStorage.setItem(BIRTHDAY_KEY, JSON.stringify(next));
    setChildName(next.childName);
    setSaved(true);
    const message = countdown?.days === 0
      ? `Happy birthday ${next.childName}!`
      : `${next.childName}'s birthday countdown is ${countdown?.days ?? 0} days.`;
    ttsSpeak(message);
  };

  return (
    <>
      <Helmet><title>Birthday Countdown — Sodafom</title></Helmet>
      <FeaturePageShell title="Birthday Countdown" subtitle="A cheerful family countdown saved only on this device." emoji="🎂" accent="from-pink-500 via-fuchsia-600 to-purple-900">
        <section className="mb-5 rounded-[2rem] border-4 border-white/70 bg-white p-5 text-sky-950 shadow-xl">
          <form onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="font-black">Child&apos;s first name<input value={childName} onChange={event => { setChildName(event.target.value); setSaved(false); }} maxLength={50} required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-pink-200 px-4 font-bold" /></label>
              <label className="font-black">Birthday<input type="date" value={date} onChange={event => { setDate(event.target.value); setSaved(false); }} required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-pink-200 px-4 font-bold" /></label>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">This birthday is stored on this device. It is not added to the Sodafom account database.</p>
            <button type="submit" className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 font-black text-white shadow-lg"><Save /> Save birthday</button>
          </form>
        </section>

        {countdown && (
          <section className="rounded-[2rem] border-4 border-yellow-300 bg-gradient-to-br from-yellow-100 to-pink-100 p-7 text-center text-purple-950 shadow-2xl">
            <PartyPopper className="mx-auto text-pink-600" size={46} />
            <p className="mt-3 text-sm font-black uppercase tracking-widest text-pink-700">{saved ? 'Saved countdown' : 'Preview'}</p>
            <h2 className="mt-1 text-4xl font-black">{countdown.days === 0 ? 'Happy Birthday!' : `${countdown.days} days to go!`}</h2>
            <p className="mt-2 font-bold">{childName || 'Your child'} {countdown.days === 0 ? 'can celebrate with Archie today.' : `will turn ${countdown.nextAge} on ${countdown.next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`}</p>
            <button type="button" onClick={() => ttsSpeak(countdown.days === 0 ? `Happy birthday ${childName}!` : `${countdown.days} days until ${childName}'s birthday!`)} className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-purple-700 px-5 py-3 font-black text-white"><Volume2 /> Hear Archie</button>
          </section>
        )}

        {!countdown && <section className="rounded-[2rem] bg-white/95 p-6 text-center text-sky-950 shadow-xl"><CalendarDays className="mx-auto text-pink-600" size={42} /><h2 className="mt-3 text-xl font-black">Add a birthday to start the countdown</h2></section>}
      </FeaturePageShell>
    </>
  );
}
