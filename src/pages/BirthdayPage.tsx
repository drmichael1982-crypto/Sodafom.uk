import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  CakeSlice,
  CalendarDays,
  Gift,
  Music,
  Music2,
  PartyPopper,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import FeaturePageShell from '@/components/FeaturePageShell';
import { getActiveChild } from '@/hooks/useChildAge';
import { ttsSpeak } from '@/lib/voice-context';

const BIRTHDAY_KEY = 'sodafom_birthday_v1';
const BALLOONS = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈'];

interface SavedBirthday {
  childName: string;
  date: string;
}

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

function playPartyBeat(context: AudioContext, volume: number) {
  const now = context.currentTime;
  [261.63, 329.63, 392].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 1 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.08), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.08);
    oscillator.stop(now + 0.42 + index * 0.08);
  });
}

export default function BirthdayPage() {
  const initial = useMemo(loadBirthday, []);
  const [childName, setChildName] = useState(initial.childName);
  const [date, setDate] = useState(initial.date);
  const [saved, setSaved] = useState(Boolean(initial.date));
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.45);
  const [poppedBalloons, setPoppedBalloons] = useState<Set<number>>(() => new Set());
  const [candlesLit, setCandlesLit] = useState(true);
  const [danceMode, setDanceMode] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const musicVolumeRef = useRef(0.45);
  const countdown = birthdayCountdown(date);
  const balloonsLeft = BALLOONS.length - poppedBalloons.size;

  const stopMusic = () => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    setMusicPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (musicTimerRef.current !== null) window.clearInterval(musicTimerRef.current);
      void audioContextRef.current?.close();
    };
  }, []);

  const toggleMusic = async () => {
    if (musicPlaying) {
      stopMusic();
      return;
    }

    const context = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') await context.resume();
    playPartyBeat(context, musicVolumeRef.current);
    musicTimerRef.current = window.setInterval(() => playPartyBeat(context, musicVolumeRef.current), 1100);
    setMusicPlaying(true);
  };

  const changeMusicVolume = (value: number) => {
    const safeValue = Math.min(1, Math.max(0, value));
    musicVolumeRef.current = safeValue;
    setMusicVolume(safeValue);
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const next = { childName: childName.trim().slice(0, 50), date };
    localStorage.setItem(BIRTHDAY_KEY, JSON.stringify(next));
    setChildName(next.childName);
    setSaved(true);
    const message = countdown?.days === 0
      ? `Happy birthday ${next.childName}! Welcome to your birthday party room!`
      : `${next.childName}'s birthday countdown is ${countdown?.days ?? 0} days.`;
    ttsSpeak(message);
  };

  const popBalloon = (index: number) => {
    setPoppedBalloons(previous => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  };

  return (
    <>
      <Helmet><title>Birthday Party Room — Sodafom</title></Helmet>
      <FeaturePageShell title="Birthday Party Room" subtitle="Countdown, decorate, play and celebrate together." emoji="🎂" accent="from-pink-500 via-fuchsia-600 to-purple-900">
        <section className="relative mb-5 overflow-hidden rounded-[2rem] border-4 border-yellow-200 bg-gradient-to-br from-pink-100 via-yellow-50 to-cyan-100 p-5 text-center text-purple-950 shadow-2xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-2 flex justify-around text-3xl">
            <span className="animate-bounce motion-reduce:animate-none">🎈</span>
            <span className="animate-pulse motion-reduce:animate-none">🎉</span>
            <span className="animate-bounce motion-reduce:animate-none">🎁</span>
            <span className="animate-pulse motion-reduce:animate-none">⭐</span>
            <span className="animate-bounce motion-reduce:animate-none">🎈</span>
          </div>
          <PartyPopper className="mx-auto mt-9 text-pink-600" size={54} />
          <h2 className="mt-2 text-3xl font-black">Welcome to the party!</h2>
          <p className="mx-auto mt-2 max-w-2xl font-bold text-purple-800">Celebrate with the same Sodafom friends you already know. Decorations and party activities stay inside this room.</p>
        </section>

        <section className="mb-5 rounded-[2rem] border-4 border-white/70 bg-white p-5 text-sky-950 shadow-xl">
          <form onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="font-black">Child&apos;s first name<input value={childName} onChange={event => { setChildName(event.target.value); setSaved(false); }} maxLength={50} required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-pink-200 px-4 font-bold" /></label>
              <label className="font-black">Birthday<input type="date" value={date} onChange={event => { setDate(event.target.value); setSaved(false); }} required className="mt-1 min-h-12 w-full rounded-2xl border-2 border-pink-200 px-4 font-bold" /></label>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">This birthday is stored on this device. It is not added to the Sodafom account database.</p>
            <button type="submit" className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 font-black text-white shadow-lg active:scale-[0.99]"><Save /> Save birthday</button>
          </form>
        </section>

        {countdown && (
          <section className="mb-5 rounded-[2rem] border-4 border-yellow-300 bg-gradient-to-br from-yellow-100 to-pink-100 p-7 text-center text-purple-950 shadow-2xl">
            <PartyPopper className="mx-auto text-pink-600" size={46} />
            <p className="mt-3 text-sm font-black uppercase tracking-widest text-pink-700">{saved ? 'Saved countdown' : 'Preview'}</p>
            <h2 className="mt-1 text-4xl font-black">{countdown.days === 0 ? 'Happy Birthday!' : `${countdown.days} days to go!`}</h2>
            <p className="mt-2 font-bold">{childName || 'Your child'} {countdown.days === 0 ? 'can celebrate with Archie today.' : `will turn ${countdown.nextAge} on ${countdown.next.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`}</p>
            <button type="button" onClick={() => ttsSpeak(countdown.days === 0 ? `Happy birthday ${childName}!` : `${countdown.days} days until ${childName}'s birthday!`)} className="mx-auto mt-5 flex min-h-12 items-center gap-2 rounded-full bg-purple-700 px-5 py-3 font-black text-white active:scale-95"><Volume2 /> Hear Archie</button>
          </section>
        )}

        {!countdown && <section className="mb-5 rounded-[2rem] bg-white/95 p-6 text-center text-sky-950 shadow-xl"><CalendarDays className="mx-auto text-pink-600" size={42} /><h2 className="mt-3 text-xl font-black">Add a birthday to start the countdown</h2></section>}

        <section className="mb-5 rounded-[2rem] border-4 border-white bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 p-5 text-white shadow-2xl" aria-labelledby="party-music-heading">
          <div className="flex items-center gap-3">
            <Music2 size={34} />
            <div>
              <h2 id="party-music-heading" className="text-2xl font-black">Party music</h2>
              <p className="font-bold text-white/90">A gentle, original party beat made in your browser.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void toggleMusic()} aria-pressed={musicPlaying} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-purple-800 shadow-lg active:scale-95">
              {musicPlaying ? <><Pause /> Pause music</> : <><Play /> Play music</>}
            </button>
            <label className="flex min-h-12 flex-1 items-center gap-2 rounded-full bg-black/20 px-4 font-black" htmlFor="party-volume">
              {musicVolume === 0 ? <VolumeX /> : <Volume2 />}
              <span className="sr-only">Party music volume</span>
              <input id="party-volume" type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={event => changeMusicVolume(Number(event.target.value))} className="w-full" />
            </label>
          </div>
        </section>

        <section className="mb-5" aria-labelledby="party-games-heading">
          <div className="mb-3 flex items-center gap-2 text-white"><Gift size={30} /><h2 id="party-games-heading" className="text-2xl font-black">Party games</h2></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 p-5 text-center text-sky-950 shadow-xl">
              <h3 className="text-2xl font-black">Balloon Pop</h3>
              <p className="mt-1 font-bold">Tap every balloon. {balloonsLeft === 0 ? 'You popped them all!' : `${balloonsLeft} left.`}</p>
              <div className="mt-4 grid grid-cols-3 gap-3" aria-label="Balloons to pop">
                {BALLOONS.map((balloon, index) => {
                  const popped = poppedBalloons.has(index);
                  return (
                    <button key={index} type="button" onClick={() => popBalloon(index)} disabled={popped} aria-label={popped ? `Balloon ${index + 1} popped` : `Pop balloon ${index + 1}`} className="min-h-20 rounded-3xl bg-white/80 text-5xl shadow-md transition-transform active:scale-75 disabled:opacity-40 motion-reduce:transition-none">
                      {popped ? '✨' : balloon}
                    </button>
                  );
                })}
              </div>
              {balloonsLeft === 0 && <button type="button" onClick={() => setPoppedBalloons(new Set())} className="mx-auto mt-4 flex min-h-12 items-center gap-2 rounded-full bg-blue-800 px-5 py-3 font-black text-white"><RotateCcw /> Play again</button>}
            </article>

            <article className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-500 p-5 text-center text-purple-950 shadow-xl">
              <CakeSlice className="mx-auto text-pink-700" size={44} />
              <h3 className="mt-2 text-2xl font-black">Make a Wish</h3>
              <div className="my-4 text-6xl" role="img" aria-label={candlesLit ? 'Birthday cake with lit candles' : 'Birthday cake with candles blown out'}>{candlesLit ? '🎂' : '🍰'}</div>
              <p className="font-bold">{candlesLit ? 'Think of a happy wish, then blow out the candles.' : 'Great wish! The candles are out.'}</p>
              <button type="button" onClick={() => setCandlesLit(previous => !previous)} className="mt-4 min-h-12 rounded-full bg-pink-700 px-5 py-3 font-black text-white shadow-lg active:scale-95">
                {candlesLit ? 'Blow out candles' : 'Light candles again'}
              </button>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-600 p-6 text-center text-teal-950 shadow-2xl" aria-labelledby="party-activities-heading">
          <Sparkles className="mx-auto" size={44} />
          <h2 id="party-activities-heading" className="mt-2 text-2xl font-black">Party activities</h2>
          <p className="mt-2 font-bold">Try a freeze-dance round. Start dancing, then tap freeze and hold your funniest pose!</p>
          <button type="button" onClick={() => setDanceMode(previous => !previous)} aria-pressed={danceMode} className="mx-auto mt-4 flex min-h-14 items-center gap-2 rounded-full bg-teal-900 px-6 py-3 text-lg font-black text-white shadow-lg active:scale-95">
            <Music /> {danceMode ? 'FREEZE!' : 'Start dancing'}
          </button>
          <p className="mt-3 min-h-7 text-lg font-black" aria-live="polite">{danceMode ? 'Dance, dance, dance! 🎵' : 'Ready for freeze dance! ⭐'}</p>
        </section>
      </FeaturePageShell>
    </>
  );
}
