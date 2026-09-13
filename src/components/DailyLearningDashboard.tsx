import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, CheckCircle2, Gamepad2, GraduationCap, RefreshCw, Star } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useSession } from '@/lib/auth/auth-client';
import {
  ACHIEVEMENTS, DAILY_MAX_PAGES, DAILY_PAGE_SIZE, keepsakeKey, loadDailyHistory,
  mergeKeepsakes, readKeepsake, selectedChildId, summariseDay,
  type DailyHistory, type LearningKeepsake,
} from '@/lib/daily-learning';

const EMPTY_KEEPSAKE: LearningKeepsake = { version: 1, bestStreak: 0, earned: [] };
const PANEL = 'mb-6 rounded-[2rem] border-4 border-white/80 bg-white p-5 text-sky-950 shadow-xl sm:p-7';
const ACTION = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-sky-700 bg-white px-4 py-2 font-bold text-sky-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-700';

function ProfileNotice({ pending, signedIn }: { pending: boolean; signedIn: boolean }) {
  return (
    <section id="daily-learning" className={PANEL} aria-labelledby="daily-learning-title">
      <h2 id="daily-learning-title" className="text-2xl font-black">Daily learning</h2>
      {pending ? <p role="status" className="mt-3">Opening your learning day…</p> : <>
        <p className="my-3">Your small steps matter. Ask a grown-up to {signedIn ? 'choose your saved child profile' : 'sign in and choose your saved child profile'} to see your own progress.</p>
        <Link to={signedIn ? '/hub' : '/hub/login'} className={ACTION}>{signedIn ? 'Choose my profile' : 'Grown-up sign-in'}</Link>
        <p className="mt-3 text-sm">You can still explore the activities below. Breaks are always welcome.</p>
      </>}
    </section>
  );
}

/** The key remounts all child-specific state when either the account or child changes. */
export default function DailyLearningDashboard() {
  const { user, isAuthenticated, isPending } = useSession();
  const [childId, setChildId] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => {
      let next: number | null = null;
      try { next = selectedChildId(window.localStorage); } catch { /* Storage may be disabled. */ }
      setChildId(previous => previous === next ? previous : next);
    };
    sync();
    const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === 'sodafom_active_child') sync(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    // Existing profile selection has no same-tab event; read only, without patching that feature.
    const timer = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
      window.clearInterval(timer);
    };
  }, []);
  if (!isAuthenticated || !user || childId === null) return <ProfileNotice pending={isPending} signedIn={isAuthenticated} />;
  return <ChildDailyLearning key={JSON.stringify([user.id, childId])} accountId={user.id} childId={childId} />;
}

function ChildDailyLearning({ accountId, childId }: { accountId: string; childId: number }) {
  const [history, setHistory] = useState<DailyHistory | null>(null);
  const [keepsake, setKeepsake] = useState<LearningKeepsake>(EMPTY_KEEPSAKE);
  const [error, setError] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [imageAvailable, setImageAvailable] = useState(true);
  const key = keepsakeKey(accountId, childId);

  useEffect(() => {
    const onFocus = () => setRefresh(value => value + 1);
    const onVisible = () => { if (document.visibilityState === 'visible') onFocus(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 15_000);
    setHistory(null);
    setError('');
    void loadDailyHistory(API_PREFIX, childId, controller.signal).then(data => {
      if (!active) return;
      const moment = new Date();
      let saved = EMPTY_KEEPSAKE;
      try { saved = readKeepsake(window.localStorage, key); } catch { setStorageAvailable(false); }
      const next = summariseDay(data, moment, saved).keepsake;
      try {
        const combined = mergeKeepsakes(readKeepsake(window.localStorage, key), next);
        // Save only earned milestone IDs and the best streak, never names, scores or history.
        window.localStorage.setItem(key, JSON.stringify(combined));
        setKeepsake(combined);
        setStorageAvailable(true);
      } catch { setKeepsake(next); setStorageAvailable(false); }
      setNow(moment);
      setHistory(data);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(timedOut ? 'Progress took too long to load. Please try again; nothing has been lost.' : reason instanceof Error && !(reason instanceof TypeError) && !(reason instanceof SyntaxError) ? reason.message : 'Progress could not be loaded. Check your connection and try again.');
    }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [childId, key, refresh]);

  if (!history) return (
    <section id="daily-learning" className={PANEL} aria-labelledby="daily-learning-title" aria-busy={!error}>
      <h2 id="daily-learning-title" className="text-2xl font-black">Daily learning</h2>
      {error ? <><p role="alert" className="my-3">{error}</p><button type="button" className={ACTION} onClick={() => setRefresh(value => value + 1)}>Try again</button><Link className="ml-4 inline-flex min-h-12 items-center underline" to="/hub">Choose profile</Link></> : <p role="status" className="mt-3">Collecting your saved learning steps…</p>}
    </section>
  );

  const summary = summariseDay(history, now, keepsake);
  const { child } = history;
  const cards = [
    { title: 'Lessons', saved: summary.lessons, to: '/lesson-library', action: 'Choose a lesson', icon: GraduationCap, theme: 'bg-blue-50 border-blue-200', idea: child.ageGroup === '5-7' ? 'Try a little counting or listen to a new idea.' : 'Choose a subject you are curious about.' },
    { title: 'Reading', saved: summary.reading, to: '/reading', action: 'Choose some reading', icon: BookOpen, theme: 'bg-emerald-50 border-emerald-200', idea: child.ageGroup === '5-7' ? 'Share a few words or a story with a grown-up.' : 'Read something you enjoy, at your own pace.' },
    { title: 'Other games', saved: summary.games, to: '/classic-home', action: 'Choose a game', icon: Gamepad2, theme: 'bg-purple-50 border-purple-200', idea: 'Practise by playing. Trying matters more than a perfect score.' },
  ];

  return (
    <section id="daily-learning" className={PANEL} aria-labelledby="daily-learning-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {imageAvailable && <img src="/assets/images/archie-character-v2.png" alt="Archie, your learning friend" width={76} height={76} className="h-20 w-20 shrink-0 object-contain" onError={() => setImageAvailable(false)} />}
          <div className="min-w-0">
            <h2 id="daily-learning-title" className="break-words text-2xl font-black">Hello, {child.name}!</h2>
            <p className="font-bold">Your daily learning</p>
            <p className="text-sm">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}{child.ageGroup ? ` · Ages ${child.ageGroup.replace('-', '–')}` : ''}</p>
          </div>
        </div>
        <button type="button" className={ACTION} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} aria-hidden="true" /> Refresh progress</button>
      </div>
      <p className="my-4 rounded-xl bg-sky-50 p-3 font-semibold">{summary.today.length ? 'Look at the steps you have taken! A break is welcome whenever you need one.' : 'A little learning is enough. Pick something you enjoy, whenever you are ready.'}</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sky-50 p-4"><p className="text-3xl font-black">{history.partial ? 'At least ' : ''}{summary.today.length}</p><p>Activities saved today</p></div>
        <div className="rounded-2xl bg-purple-50 p-4"><p className="flex items-center gap-2 text-3xl font-black"><Star aria-hidden="true" size={26} />{child.totalStars}</p><p>Your saved star collection</p><p className="text-sm">{history.partial ? 'At least ' : ''}{summary.todayStars} saved today. No stars are spent here.</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-3xl font-black">{summary.keepsake.bestStreak} {summary.keepsake.bestStreak === 1 ? 'day' : 'days'}</p><p>Your best learning streak</p><p className="text-sm">Your best run stays. Days off never take it away.</p></div>
      </div>

      <div className="my-5">
        <label htmlFor="daily-learning-goal" className="block font-bold">A little aim for today: {summary.target} {summary.target === 1 ? 'activity' : 'activities'}</label>
        <progress id="daily-learning-goal" className="mt-2 h-5 w-full accent-sky-700" max={100} value={summary.percent} aria-valuetext={`${summary.today.length} saved activities; optional aim ${summary.target}`} />
        <p className="mt-1 text-sm">{summary.percent === 100 ? 'You reached this little aim. Well done for trying!' : 'This is an idea, not a must-do list. You can stop whenever you need.'}</p>
      </div>

      <h3 className="mb-3 text-xl font-black">Today’s choices</h3>
      <p className="mb-3 text-sm">Ideas for your day, not assigned lessons. Open an activity to choose its subject and level.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(card => <article key={card.title} className={`flex flex-col rounded-2xl border-2 p-4 ${card.theme}`}>
          <h4 className="flex items-center gap-2 text-lg font-black"><card.icon size={22} aria-hidden="true" />{card.title}</h4>
          <p className="my-2 font-bold">{history.partial ? 'At least ' : ''}{card.saved} saved today</p>
          <p className="mb-4 grow">{card.idea}</p>
          <Link className={ACTION} to={card.to}>{card.action}</Link>
        </article>)}
      </div>
      <p className="mt-3 text-sm">Reading includes saved reading games. A lesson, book or homework activity appears here only when it saves a completion to your child profile. Opening a page does not count as finishing.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-black">Your completed activities today</h3>
          {summary.today.length === 0 ? <p className="mt-3">No completions have been saved here today yet. Learning away from the app matters too.</p> : <>
            <ul className="mt-3 space-y-2">{summary.today.slice(0, 6).map(activity => <li key={activity.id} className="flex items-start gap-2 rounded-xl bg-sky-50 p-3"><CheckCircle2 size={20} className="mt-1 shrink-0" aria-hidden="true" /><span className="min-w-0 break-words"><strong>{activity.title}</strong><span className="block text-sm">{activity.stars} saved {activity.stars === 1 ? 'star' : 'stars'} · {new Date(activity.completedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></span></li>)}</ul>
            {summary.today.length > 6 && <details className="mt-3"><summary className="min-h-12 cursor-pointer py-3 font-bold underline">Show {summary.today.length - 6} more saved activities</summary><ul className="space-y-2">{summary.today.slice(6).map(activity => <li key={activity.id} className="break-words rounded-xl bg-sky-50 p-3">{activity.title} · {activity.stars} saved stars</li>)}</ul></details>}
          </>}
        </div>
        <div>
          <h3 className="text-xl font-black">Achievements at your pace</h3>
          <ul className="mt-3 space-y-2">{ACHIEVEMENTS.map(goal => {
            const earned = summary.keepsake.earned.includes(goal.id);
            return <li key={goal.id} className={`rounded-xl border-2 p-3 ${earned ? 'border-emerald-300 bg-emerald-50' : 'border-sky-100 bg-sky-50'}`}><p className="flex items-center gap-2 font-black"><Star size={18} aria-hidden="true" />{goal.title}</p><p className="text-sm">{goal.description}</p><p className="mt-1 font-bold">{earned ? 'You earned this!' : 'Ready whenever you are. No deadline.'}</p></li>;
          })}</ul>
        </div>
      </div>
      <h3 className="mb-3 mt-6 text-xl font-black">Your week, your pace</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-7">{summary.week.map(day => <li key={day.day} className={`rounded-xl p-3 text-center text-sm ${day.learned ? 'bg-emerald-100' : 'bg-sky-50'}`}><span className="block font-bold">{day.label}</span><span className="mt-1 block">{day.learned ? 'Learning saved' : 'Rest or learn'}</span></li>)}</ul>
      {history.partial && <p role="status" className="mt-4 rounded-xl border-2 border-sky-200 p-3">Showing up to the newest {DAILY_MAX_PAGES * DAILY_PAGE_SIZE} saved activities. Counts and this week may be incomplete; your star collection is the account total.</p>}
      <p className="mt-4 text-sm">Progress comes from your saved child profile. Best streaks and earned achievement labels are also kept on this device, separately for each account and child. Clearing device storage removes those local keepsakes, not your saved account activity.</p>
      {!storageAvailable && <p role="status" className="mt-2 text-sm">Device storage is unavailable. Progress still works, but local keepsakes cannot be retained here.</p>}
    </section>
  );
}
