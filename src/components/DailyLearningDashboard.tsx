import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, CheckCircle2, Gamepad2, GraduationCap, RefreshCw, Star } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useSession } from '@/lib/auth/auth-client';
import {
  ACHIEVEMENTS,
  DAILY_MAX_PAGES,
  DAILY_PAGE_SIZE,
  keepsakeKey,
  loadDailyHistory,
  mergeKeepsakes,
  readKeepsake,
  selectedChildId,
  summariseDay,
  type DailyHistory,
  type LearningKeepsake,
} from '@/lib/daily-learning';

const EMPTY_KEEPSAKE: LearningKeepsake = { version: 1, bestStreak: 0, earned: [] };
const PANEL = 'rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-7';
const ACTION = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background px-4 py-2 font-bold text-primary transition-colors hover:bg-primary/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary';

function ProfileNotice({ pending, signedIn }: { pending: boolean; signedIn: boolean }) {
  return (
    <section className={PANEL} aria-labelledby="daily-learning-title">
      <h2 id="daily-learning-title" className="text-2xl font-black text-foreground">Daily learning</h2>
      {pending ? (
        <p role="status" className="mt-3 text-muted-foreground">Opening your learning day…</p>
      ) : (
        <>
          <p className="my-3 text-muted-foreground">Your small steps matter. Ask a grown-up to {signedIn ? 'choose a saved learner profile' : 'sign in and choose a saved learner profile'} to see progress.</p>
          <Link to={signedIn ? '/hub' : '/hub/login'} className={ACTION}>
            {signedIn ? 'Choose a learner' : 'Grown-up sign-in'}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">You can take breaks whenever you need. Opening a page never counts as a completion.</p>
        </>
      )}
    </section>
  );
}

/**
 * Read-only dashboard for activity already saved to the selected child profile.
 * A profile ID from storage is never displayed until the owner-checked API has
 * returned the matching server profile.
 */
export default function DailyLearningDashboard() {
  const { user, isAuthenticated, isPending } = useSession();
  const accountId = typeof user?.id === 'string' ? user.id : '';
  const [childId, setChildId] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      let next: number | null = null;
      try {
        next = selectedChildId(window.localStorage);
      } catch {
        // Storage can be unavailable; the profile notice remains safe.
      }
      setChildId(previous => previous === next ? previous : next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'sodafom_active_child') sync();
    };

    sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', sync);
    };
  }, []);

  if (!isAuthenticated || !accountId || childId === null) {
    return <ProfileNotice pending={isPending} signedIn={isAuthenticated} />;
  }

  return <ChildDailyLearning key={`${accountId}:${childId}`} accountId={accountId} childId={childId} />;
}

function ChildDailyLearning({ accountId, childId }: { accountId: string; childId: number }) {
  const [history, setHistory] = useState<DailyHistory | null>(null);
  const [keepsake, setKeepsake] = useState<LearningKeepsake>(EMPTY_KEEPSAKE);
  const [error, setError] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const key = keepsakeKey(accountId, childId);

  useEffect(() => {
    const onFocus = () => setRefresh(value => value + 1);
    const onVisible = () => {
      if (document.visibilityState === 'visible') onFocus();
    };
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(clock);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timedOut = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    setHistory(null);
    setError('');
    void loadDailyHistory(API_PREFIX, childId, controller.signal)
      .then(data => {
        if (!active) return;
        const moment = new Date();
        let saved = EMPTY_KEEPSAKE;
        try {
          saved = readKeepsake(window.localStorage, key);
        } catch {
          setStorageAvailable(false);
        }
        const next = summariseDay(data, moment, saved).keepsake;
        try {
          const combined = mergeKeepsakes(readKeepsake(window.localStorage, key), next);
          // Keep only earned labels and the best streak: never a child's name,
          // score, activity title, history, or other profile detail.
          window.localStorage.setItem(key, JSON.stringify(combined));
          setKeepsake(combined);
          setStorageAvailable(true);
        } catch {
          setKeepsake(next);
          setStorageAvailable(false);
        }
        setNow(moment);
        setHistory(data);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        if (timedOut) {
          setError('Progress took too long to load. Please try again; nothing has been lost.');
        } else if (reason instanceof Error && !(reason instanceof TypeError) && !(reason instanceof SyntaxError)) {
          setError(reason.message);
        } else {
          setError('Progress could not be loaded. Check your connection and try again.');
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [childId, key, refresh]);

  if (!history) {
    return (
      <section className={PANEL} aria-labelledby="daily-learning-title" aria-busy={!error}>
        <h2 id="daily-learning-title" className="text-2xl font-black text-foreground">Daily learning</h2>
        {error ? (
          <div className="mt-3">
            <p role="alert" className="text-muted-foreground">{error}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className={ACTION} onClick={() => setRefresh(value => value + 1)}>Try again</button>
              <Link to="/hub" className={ACTION}>Choose learner</Link>
            </div>
          </div>
        ) : <p role="status" className="mt-3 text-muted-foreground">Collecting your saved learning steps…</p>}
      </section>
    );
  }

  const summary = summariseDay(history, now, keepsake);
  const { child } = history;
  const cards = [
    {
      title: 'Lessons',
      saved: summary.lessons,
      to: '/subjects',
      action: 'Choose a subject',
      icon: GraduationCap,
      theme: 'border-blue-200 bg-blue-50',
      idea: child.ageGroup === '5-7' ? 'Try a little counting or listen to a new idea.' : 'Choose a subject you are curious about.',
    },
    {
      title: 'Reading',
      saved: summary.reading,
      to: '/subjects/reading',
      action: 'Choose reading',
      icon: BookOpen,
      theme: 'border-emerald-200 bg-emerald-50',
      idea: child.ageGroup === '5-7' ? 'Share a few words or a story with a grown-up.' : 'Read something you enjoy, at your own pace.',
    },
    {
      title: 'Games',
      saved: summary.games,
      to: '/games',
      action: 'Choose a game',
      icon: Gamepad2,
      theme: 'border-purple-200 bg-purple-50',
      idea: 'Practise by playing. Trying matters more than a perfect score.',
    },
  ];

  return (
    <section className={PANEL} aria-labelledby="daily-learning-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="daily-learning-title" className="break-words text-2xl font-black text-foreground">Hello, {child.name}!</h2>
          <p className="font-bold text-foreground">Your daily learning</p>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            {child.ageGroup ? ` · Ages ${child.ageGroup.replace('-', '–')}` : ''}
          </p>
        </div>
        <button type="button" className={ACTION} onClick={() => setRefresh(value => value + 1)}>
          <RefreshCw size={18} aria-hidden="true" /> Refresh progress
        </button>
      </div>

      <p className="my-4 rounded-2xl bg-primary/10 p-3 font-semibold text-foreground">
        {summary.today.length
          ? 'Look at the steps you have taken! A break is welcome whenever you need one.'
          : 'A little learning is enough. Pick something you enjoy, whenever you are ready.'}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-primary/10 p-4">
          <p className="text-3xl font-black text-foreground">{history.partial ? 'At least ' : ''}{summary.today.length}</p>
          <p className="text-muted-foreground">Activities saved today</p>
        </div>
        <div className="rounded-2xl bg-yellow-50 p-4">
          <p className="flex items-center gap-2 text-3xl font-black text-foreground"><Star aria-hidden="true" size={26} />{child.totalStars}</p>
          <p className="text-muted-foreground">Saved star collection</p>
          <p className="text-sm text-muted-foreground">{history.partial ? 'At least ' : ''}{summary.todayStars} saved today. No stars are spent here.</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-3xl font-black text-foreground">{summary.keepsake.bestStreak} {summary.keepsake.bestStreak === 1 ? 'day' : 'days'}</p>
          <p className="text-muted-foreground">Best learning streak</p>
          <p className="text-sm text-muted-foreground">Your best run stays. Days off never take it away.</p>
        </div>
      </div>

      <div className="my-5">
        <label htmlFor="daily-learning-goal" className="block font-bold text-foreground">A little aim for today: {summary.target} {summary.target === 1 ? 'activity' : 'activities'}</label>
        <progress id="daily-learning-goal" className="mt-2 h-5 w-full accent-primary" max={100} value={summary.percent} aria-valuetext={`${summary.today.length} saved activities; optional aim ${summary.target}`} />
        <p className="mt-1 text-sm text-muted-foreground">{summary.percent === 100 ? 'You reached this little aim. Well done for trying!' : 'This is an idea, not a must-do list. You can stop whenever you need.'}</p>
      </div>

      <h3 className="mb-1 text-xl font-black text-foreground">Today’s choices</h3>
      <p className="mb-3 text-sm text-muted-foreground">Ideas for your day, not assigned lessons. Open an activity to choose its subject and level.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map(card => (
          <article key={card.title} className={`flex flex-col rounded-2xl border-2 p-4 ${card.theme}`}>
            <h4 className="flex items-center gap-2 text-lg font-black text-foreground"><card.icon size={22} aria-hidden="true" />{card.title}</h4>
            <p className="my-2 font-bold text-foreground">{history.partial ? 'At least ' : ''}{card.saved} saved today</p>
            <p className="mb-4 grow text-muted-foreground">{card.idea}</p>
            <Link className={ACTION} to={card.to}>{card.action}</Link>
          </article>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Only activities that save a completion to this child profile appear here. Opening a lesson, book, or homework page does not count as finishing.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-black text-foreground">Completed activities today</h3>
          {summary.today.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No completions have been saved here today yet. Learning away from the app matters too.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {summary.today.slice(0, 6).map(activity => (
                <li key={activity.id} className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-foreground">
                  <CheckCircle2 size={20} className="mt-1 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 break-words"><strong>{activity.title}</strong><span className="block text-sm text-muted-foreground">{activity.stars} saved {activity.stars === 1 ? 'star' : 'stars'} · {new Date(activity.completedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">Achievements at your pace</h3>
          <ul className="mt-3 space-y-2">
            {ACHIEVEMENTS.map(goal => {
              const earned = summary.keepsake.earned.includes(goal.id);
              return (
                <li key={goal.id} className={`rounded-xl border-2 p-3 ${earned ? 'border-emerald-300 bg-emerald-50' : 'border-border bg-muted/30'}`}>
                  <p className="flex items-center gap-2 font-black text-foreground"><Star size={18} aria-hidden="true" />{goal.title}</p>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  <p className="mt-1 font-bold text-foreground">{earned ? 'You earned this!' : 'Ready whenever you are. No deadline.'}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <h3 className="mb-3 mt-6 text-xl font-black text-foreground">Your week, your pace</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-7">
        {summary.week.map(day => (
          <li key={day.day} className={`rounded-xl p-3 text-center text-sm ${day.learned ? 'bg-emerald-100 text-emerald-950' : 'bg-muted/50 text-foreground'}`}>
            <span className="block font-bold">{day.label}</span>
            <span className="mt-1 block">{day.learned ? 'Learning saved' : 'Rest or learn'}</span>
          </li>
        ))}
      </ul>
      {history.partial && <p role="status" className="mt-4 rounded-xl border-2 border-primary/30 p-3 text-sm text-muted-foreground">Showing up to the newest {DAILY_MAX_PAGES * DAILY_PAGE_SIZE} saved activities. Counts and this week may be incomplete; the star collection is the account total.</p>}
      <p className="mt-4 text-sm text-muted-foreground">Progress comes from the saved child profile. Best streaks and earned achievement labels are kept on this device, separately for each account and child. Clearing device storage removes those local keepsakes, not saved account activity.</p>
      {!storageAvailable && <p role="status" className="mt-2 text-sm text-muted-foreground">Device storage is unavailable. Progress still works, but local keepsakes cannot be retained here.</p>}
    </section>
  );
}
