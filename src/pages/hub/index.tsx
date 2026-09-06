import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from 'motion/react';
import { useSession, LogoutButton } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { useSubscription } from '@/hooks/useSubscription';
import { setActiveChild, type AgeGroup } from '@/hooks/useChildAge';
import { Plus, Trash2, BookOpen, Calculator, Pencil, TrendingUp, ChevronRight, Users, Award, Star, Sparkles, Play, Bell, Trophy, Zap, RotateCcw, CreditCard } from 'lucide-react';
import StreakBadge from '@/components/StreakTracker';
import PushNotificationBanner from '@/components/PushNotificationBanner';
import ArchieDailyTip from '@/components/ArchieDailyTip';
import CancelSubscriptionButton from '@/components/CancelSubscriptionButton';
import ChildSwitcher from '@/components/ChildSwitcher';
import HubStatsBar from '@/components/HubStatsBar';
import { games as _games } from 'virtual:content';
import { API_PREFIX } from '@/lib/config';

type WeeklyChallenge = { gameId: string; title: string; emoji: string; tagline: string; prize: string };
const games = _games as typeof _games & { weeklyChallenge?: WeeklyChallenge };

// ── Weekly goal progress card ─────────────────────────────────────────────────
const WEEKLY_GOAL = 5; // games per week target

// ── Personal Best trophy card ─────────────────────────────────────────────────
const SUBJECT_PB_META: Record<string, { label: string; emoji: string; colour: string; bg: string }> = {
  maths:   { label: 'Maths',   emoji: '🔢', colour: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  spelling:{ label: 'Spelling',emoji: '✏️', colour: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  reading: { label: 'Reading', emoji: '📖', colour: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  science: { label: 'Science', emoji: '🔬', colour: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
};

function PersonalBestCard() {
  const [pbData, setPbData] = useState<Record<string, { stars: number; gameName: string }>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sodafom_game_stars');
      if (!raw) return;
      const starMap: Record<string, number> = JSON.parse(raw) as Record<string, number>;
      // Map game slug keys back to subjects using games content
      const subjectBest: Record<string, { stars: number; gameName: string }> = {};
      for (const game of games.games) {
        const key = `game-${game.title.toLowerCase().replace(/\s+/g, '-')}`;
        const stars = starMap[key] ?? 0;
        if (stars > 0) {
          const subj = game.subject;
          if (!subjectBest[subj] || stars > subjectBest[subj].stars) {
            subjectBest[subj] = { stars, gameName: game.title };
          }
        }
      }
      setPbData(subjectBest);
    } catch { /* ignore */ }
  }, []);

  const entries = Object.entries(pbData);
  if (entries.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-accent/20 to-yellow-100 border-b border-border px-6 py-3 flex items-center gap-2">
          <Trophy size={16} className="text-accent" />
          <span className="font-black text-foreground text-sm">Personal Bests</span>
          <span className="ml-auto text-muted-foreground text-xs font-bold">Your highest star scores</span>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(SUBJECT_PB_META).map(([subj, meta]) => {
            const pb = pbData[subj];
            return (
              <div key={subj} className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 ${pb ? meta.bg : 'bg-muted/30 border-border opacity-50'}`}>
                <span className="text-2xl">{meta.emoji}</span>
                <p className={`text-xs font-black ${pb ? meta.colour : 'text-muted-foreground'}`}>{meta.label}</p>
                {pb ? (
                  <>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(s => (
                        <Star key={s} size={12} className={s <= pb.stars ? 'text-accent fill-accent' : 'text-muted-foreground'} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-bold text-center leading-tight truncate w-full text-center">{pb.gameName}</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground font-bold">Not played yet</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function WeeklyGoalCard() {
  const [gamesThisWeek, setGamesThisWeek] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((children: { id: number }[]) => {
        if (!Array.isArray(children) || !children.length) return;
        return fetch(`${API_PREFIX}/children/${children[0].id}/progress?summary=1`, { credentials: 'include' });
      })
      .then(r => (r && r.ok) ? r.json() : null)
      .then((prog: { gamesThisWeek?: number } | null) => {
        if (prog?.gamesThisWeek !== undefined) setGamesThisWeek(prog.gamesThisWeek);
      })
      .catch(() => {});
  }, []);

  if (gamesThisWeek === null) return null;

  const pct = Math.min(100, Math.round((gamesThisWeek / WEEKLY_GOAL) * 100));
  const done = gamesThisWeek >= WEEKLY_GOAL;

  // SVG ring params
  const R = 36, CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`mb-6 rounded-2xl border-2 overflow-hidden ${done ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}
    >
      <div className={`px-5 py-3 border-b border-border flex items-center gap-2 ${done ? 'bg-primary/10' : 'bg-muted/30'}`}>
        <span className="text-lg">{done ? '🏆' : '🎯'}</span>
        <p className="font-black text-foreground text-sm">Weekly Challenge</p>
        <span className={`ml-auto text-xs font-black px-2.5 py-1 rounded-full ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {done ? 'Complete!' : `${pct}%`}
        </span>
      </div>
      <div className="px-5 py-4 flex items-center gap-5">
        {/* SVG progress ring */}
        <div className="relative shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88">
            {/* Track */}
            <circle cx="44" cy="44" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            {/* Progress */}
            <motion.circle
              cx="44" cy="44" r={R}
              fill="none"
              stroke={done ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              initial={{ strokeDashoffset: CIRC }}
              animate={{ strokeDashoffset: CIRC - dash }}
              transition={{ duration: 1, ease: 'easeOut' as const }}
              transform="rotate(-90 44 44)"
            />
          </svg>
          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground leading-none">{gamesThisWeek}</span>
            <span className="text-xs text-muted-foreground font-bold">/{WEEKLY_GOAL}</span>
          </div>
        </div>
        {/* Text */}
        <div className="flex-1">
          <p className="font-black text-foreground text-sm mb-1">
            {done ? '🌟 Goal smashed!' : `${WEEKLY_GOAL - gamesThisWeek} game${WEEKLY_GOAL - gamesThisWeek !== 1 ? 's' : ''} to go!`}
          </p>
          <p className="text-xs text-muted-foreground font-bold mb-3">
            {done ? 'Amazing work this week — you\'re a star!' : `Play ${WEEKLY_GOAL} games this week to complete the challenge.`}
          </p>
          {/* Mini game dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.25 }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                  i < gamesThisWeek
                    ? 'bg-accent border-accent text-accent-foreground'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {i < gamesThisWeek ? '⭐' : ''}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Notification unread count hook ───────────────────────────────────────────
function useUnreadNotifications() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    fetch(`${API_PREFIX}/notifications`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        try {
          const lastRead = localStorage.getItem('sodafom_notif_read_at');
          const lastReadDate = lastRead ? new Date(lastRead) : null;
          const unread = (data.notifications ?? []).filter((n: { createdAt: string }) =>
            !lastReadDate || new Date(n.createdAt) > lastReadDate
          ).length;
          setCount(unread);
        } catch { setCount(data.unreadCount ?? 0); }
      })
      .catch(() => {});
  }, []);
  return count;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Child {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  createdAt: string;
}

// ── Config ───────────────────────────────────────────────────────────────────
const AGE_GROUPS = [{
  value: '5-7',
  label: 'Ages 5–7',
  icon: '⭐',
  color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
}, {
  value: '8-10',
  label: 'Ages 8–10',
  icon: '🚀',
  color: 'bg-blue-100 border-blue-300 text-blue-800'
}, {
  value: '11-13',
  label: 'Ages 11–12',
  icon: '🏆',
  color: 'bg-purple-100 border-purple-300 text-purple-800'
}];
const AVATARS = ['⭐', '🦁', '🐼', '🦊', '🐸', '🦋', '🐬', '🦄', '🐧', '🦉'];
const SUBJECT_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  label: string;
}> = {
  maths: {
    icon: <Calculator size={16} />,
    color: 'text-amber-600 bg-amber-50',
    label: 'Maths'
  },
  spelling: {
    icon: <Pencil size={16} />,
    color: 'text-red-600 bg-red-50',
    label: 'Spelling'
  },
  reading: {
    icon: <BookOpen size={16} />,
    color: 'text-green-600 bg-green-50',
    label: 'Reading'
  }
};
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const
    }
  }
} as const;
const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07
    }
  }
} as const;

// ── Add Child Modal ───────────────────────────────────────────────────────────
function AddChildModal({
  onClose,
  onAdded
}: {
  onClose: () => void;
  onAdded: (c: Child) => void;
}) {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('5-7');
  const [avatarEmoji, setAvatarEmoji] = useState('⭐');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          ageGroup,
          avatarEmoji
        }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error(await res.text());
      const child = await res.json();
      onAdded(child);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div initial={{
      opacity: 0,
      scale: 0.92
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.92
    }} transition={{
      duration: 0.2
    }} className="bg-card rounded-3xl p-8 w-full max-w-md shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-black text-foreground mb-6" style={{
        fontFamily: 'var(--font-heading)'
      }}>
          Add a learner
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-5">
          {/* Avatar picker */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Choose an avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(em => <button key={em} type="button" onClick={() => setAvatarEmoji(em)} className={`w-10 h-10 rounded-full text-xl flex items-center justify-center border-2 transition-all ${avatarEmoji === em ? 'border-primary bg-primary/10 scale-110' : 'border-border bg-muted'}`}>{em}</button>)}
            </div>
          </div>
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amara" className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary font-bold" />
          </div>
          {/* Age group */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">Age group</label>
            <div className="flex gap-2">
              {AGE_GROUPS.map(ag => <button key={ag.value} type="button" onClick={() => setAgeGroup(ag.value)} className={`flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all ${ageGroup === ag.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-foreground'}`}>
                  {ag.icon} {ag.label}
                </button>)}
            </div>
          </div>
          {error && <p className="text-destructive text-sm font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-border font-bold text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Adding…' : 'Add learner'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>;
}

// ── Child Card ────────────────────────────────────────────────────────────────
function ChildCard({
  child,
  onDelete
}: {
  child: Child;
  onDelete: (id: number) => void;
}) {
  const ag = AGE_GROUPS.find(a => a.value === child.ageGroup) ?? AGE_GROUPS[0];
  return <motion.div variants={fadeUp} whileHover={{
    y: -4,
    scale: 1.01
  }} className="bg-card rounded-2xl border-2 border-border shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-primary p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl shrink-0">
          {child.avatarEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-primary-foreground text-lg truncate" style={{
          fontFamily: 'var(--font-heading)'
        }}>
            {child.name}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${ag.color}`}>
            {ag.icon} {ag.label}
          </span>
        </div>
        <button onClick={() => onDelete(child.id)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground transition-colors" title="Remove learner">
          <Trash2 size={14} />
        </button>
      </div>
      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Stars earned */}
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-0.5">
            {Array.from({
            length: 3
          }).map((_, i) => <Star key={i} size={14} className={i < Math.min(child.totalStars, 3) ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-200 fill-yellow-100'} />)}
          </div>
          <span className="text-yellow-700 font-black text-sm">{child.totalStars}</span>
          <span className="text-yellow-600 text-xs font-bold">stars earned</span>
        </div>
        <div className="flex gap-2">
          {Object.entries(SUBJECT_CONFIG).map(([key, cfg]) => <span key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>)}
        </div>
        <Link to={`/hub/child/${child.id}`} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-black text-sm transition-colors">
          <TrendingUp size={16} />
          View progress
          <ChevronRight size={14} />
        </Link>
        <Link
          to={`/games?age=${child.ageGroup}`}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted/40 text-muted-foreground font-bold text-sm transition-colors"
        >
          🎮 Browse {ag.label} games
        </Link>
        <button
          onClick={() => {
            setActiveChild({ id: child.id, name: child.name, ageGroup: child.ageGroup as AgeGroup, avatarEmoji: child.avatarEmoji });
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
        >
          <Play size={16} />
          Play as {child.name.split(' ')[0]}
        </button>
      </div>
    </motion.div>;
}

// ── Daily Challenge Card ───────────────────────────────────────────────────────
function DailyChallengeCard() {
  const [game, setGame] = useState<{ slug: string; title: string; subject: string } | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    fetch(`${API_PREFIX}/daily-challenge`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { game: { slug: string; title: string; subject: string }; claimed: boolean; secondsLeft: number }) => {
        setGame(d.game);
        setClaimed(d.claimed);
        setSecondsLeft(d.secondsLeft);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!secondsLeft) return;
    const t = setInterval(() => setSecondsLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (!game) return null;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-primary/30 shadow-sm">
      <div className="bg-primary px-6 py-3 flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="font-black text-primary-foreground text-sm">Daily Challenge</span>
        {secondsLeft > 0 && (
          <span className="ml-auto font-mono text-xs text-primary-foreground/70 font-bold">
            {pad(h)}:{pad(m)}:{pad(s)} left
          </span>
        )}
      </div>
      <div className="bg-card px-6 py-4 flex items-center gap-4">
        <div className="text-4xl">🎮</div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-foreground text-base leading-tight">{game.title}</p>
          <p className="text-muted-foreground text-xs capitalize mt-0.5">{game.subject} · 5 bonus stars</p>
          {claimed && <p className="text-primary text-xs font-bold mt-1">✓ Bonus claimed today!</p>}
        </div>
        <Link
          to={`/games/${game.slug}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm hover:opacity-90 transition-opacity shrink-0"
        >
          <Zap size={14} /> Play
        </Link>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function HubDashboard() {
  const navigate = useNavigate();
  const {
    user
  } = useSession();
  const { subscribed, loading: subLoading, plan } = useSubscription();
  const unreadNotifs = useUnreadNotifications();

  // Redirect unsubscribed users to subscribe — demos are on /demo, not /hub
  useEffect(() => {
    if (!subLoading && !subscribed) {
      navigate('/subscribe', { replace: true });
    }
  }, [subscribed, subLoading, navigate]);

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeChildId, setActiveChildIdState] = useState<number | null>(() => {
    try { const s = localStorage.getItem('sodafom_active_child'); return s ? JSON.parse(s).id : null; } catch { return null; }
  });

  // Last-played game from localStorage
  const [lastPlayed, setLastPlayed] = useState<{ id: string; title: string; emoji: string; slug: string; subject: string } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sodafom_last_played');
      if (raw) setLastPlayed(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const loadChildren = useCallback(async () => {
    try {
      const response = await fetch(`${API_PREFIX}/children`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Could not load learners (${response.status})`);
      const data = await response.json();
      const list: Child[] = Array.isArray(data) ? data : [];
      setChildren(list);
      setActiveChildIdState(current => current ?? list[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren().catch(() => setLoading(false));
  }, [loadChildren]);
  const handleDelete = async (id: number) => {
    if (!confirm('Remove this learner?')) return;
    await fetch(`${API_PREFIX}/children/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    setChildren(prev => prev.filter(c => c.id !== id));
  };
  const handleAdded = (child: Child) => {
    // Show the returned learner immediately, then reload the authoritative
    // server list. This keeps the counter, switcher and learner cards in sync.
    setChildren(prev => prev.some(existing => existing.id === child.id) ? prev : [...prev, child]);
    setActiveChildIdState(child.id);
    setShowAdd(false);
    loadChildren().catch(() => {});
  };
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  return <>
      <Helmet>
        <title>Parent & Teacher Hub — Sodafom</title>
        <meta name="description" content="Track your child's learning progress across Maths, Spelling, and Reading on Sodafom." />
        <link rel="canonical" href="https://sodafom.com/hub" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 overflow-hidden">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-lg">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-black text-sm leading-tight" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                  Welcome back, {firstName}!
                </p>
                <p className="text-primary-foreground/60 text-xs">{user?.email}</p>
              </div>
              <StreakBadge variant="compact" />
              {children.length > 0 && (
                <ChildSwitcher
                  children={children}
                  activeChildId={activeChildId}
                  onAddChild={() => setShowAdd(true)}
                />
              )}
            </div>
              <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              <Link to="/badges" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  <Trophy size={14} />
                  Badges
                </Link>
              <Link to="/hub/notifications" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5 relative">
                  <Bell size={14} />
                  Alerts
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center">
                      {unreadNotifs > 9 ? '9+' : unreadNotifs}
                    </span>
                  )}
                </Link>
              <Link to="/hub/subscription" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  <CreditCard size={14} />
                  Plan
                </Link>
              <Link to="/rewards" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Rewards
                </Link>
              <Link to="/hub/progress" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  📊 Progress
                </Link>
              <Link to="/parent-dashboard" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  📈 Full Dashboard
                </Link>
              <Link to="/daily-challenge" className="px-3 py-1.5 rounded-lg bg-accent/30 hover:bg-accent/50 text-sm font-bold transition-colors flex items-center gap-1.5">
                  🔥 Daily Challenge
                </Link>
              <Link to="/referral" className="px-3 py-1.5 rounded-lg bg-accent/30 hover:bg-accent/50 text-sm font-bold transition-colors flex items-center gap-1.5">
                  🎁 Refer
                </Link>
              <Link to="/certificates" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  🏆 Certificates
                </Link>
              <Link to="/voice-studio" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors flex items-center gap-1.5">
                  🎙️ Voice Studio
                </Link>
              <Link to="/" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors">
                ← Home
              </Link>
              <LogoutButton className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors text-primary-foreground">
                Sign out
              </LogoutButton>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Hero banner */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                  Parent & Teacher Hub
                </h1>
                <p className="text-primary-foreground/75 text-sm leading-relaxed max-w-lg">
                  Track every learner's progress across Maths, Spelling, and Reading. Add children or students, view their activity history, and celebrate their wins.
                </p>
              </div>
              <div className="flex gap-4 text-center shrink-0">
                <div className="bg-white/15 rounded-2xl px-5 py-3">
                  <div className="text-2xl font-black">{children.length}</div>
                  <div className="text-xs text-primary-foreground/70 font-bold">Learners</div>
                </div>
                <div className="bg-white/15 rounded-2xl px-5 py-3">
                  <div className="text-2xl font-black">3</div>
                  <div className="text-xs text-primary-foreground/70 font-bold">Subjects</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats row */}
          <HubStatsBar />

          {/* Learner stats row */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[{
            icon: <Users size={20} />,
            label: 'Learners added',
            value: children.length,
            color: 'bg-primary/10 text-primary'
          }, {
            icon: <BookOpen size={20} />,
            label: 'Subjects tracked',
            value: 3,
            color: 'bg-accent/20 text-accent-foreground'
          }, {
            icon: <Award size={20} />,
            label: 'Age groups',
            value: 3,
            color: 'bg-secondary/10 text-secondary'
          }].map(stat => <motion.div key={stat.label} variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-bold">{stat.label}</div>
                </div>
              </motion.div>)}
          </motion.div>

          {/* Archie daily tip */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <ArchieDailyTip />
          </motion.div>

          {/* Weekly goal progress card */}
          <WeeklyGoalCard />

          {/* Daily Challenge card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <DailyChallengeCard />
          </motion.div>

          {/* Weekly Challenge */}
          {games.weeklyChallenge && (() => {
            const wc = games.weeklyChallenge;
            const GAME_ROUTES: Record<string, string> = {
              'game-mental-maths-sprint': '/games/mental-maths-sprint',
              'game-number-pop': '/games/number-pop',
              'game-spelling-bee': '/games/spelling-bee',
              'game-times-table-race': '/games/times-table-race',
              'game-word-wizard': '/games/word-wizard',
              'game-geography-quiz': '/games/geography-quiz',
              'game-fraction-pizza': '/games/fraction-pizza',
              'game-number-puzzle': '/games/number-puzzle',
            };
            const route = GAME_ROUTES[wc.gameId] ?? '/games';
            return (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
                <div className="rounded-2xl overflow-hidden border-2 border-accent/40 shadow-sm">
                  <div className="bg-accent px-6 py-3 flex items-center gap-2">
                    <Trophy size={16} className="text-accent-foreground" />
                    <span className="font-black text-accent-foreground text-sm">Weekly Challenge</span>
                    <span className="ml-auto text-accent-foreground/70 text-xs font-bold">Resets every Monday</span>
                  </div>
                  <div className="bg-card px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.12, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
                      className="text-5xl select-none shrink-0"
                    >
                      {wc.emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-foreground text-xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {wc.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-1">{wc.tagline}</p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-accent-foreground bg-accent/15 rounded-full px-3 py-1 w-fit">
                        <Star size={11} className="fill-current text-accent" />
                        {wc.prize}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(route)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-black text-sm shadow-md hover:opacity-90 transition-opacity shrink-0"
                    >
                      <Zap size={15} /> Play Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Continue where you left off */}
          {lastPlayed && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
              <div className="bg-card rounded-2xl border-2 border-primary/30 overflow-hidden shadow-sm">
                <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center gap-2">
                  <RotateCcw size={15} className="text-primary" />
                  <span className="font-black text-foreground text-sm">Continue where you left off</span>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 border-2 border-primary/20">
                    {lastPlayed.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-base leading-tight truncate">{lastPlayed.title}</p>
                    <p className="text-muted-foreground text-xs font-semibold capitalize mt-0.5">{lastPlayed.subject} game</p>
                  </div>
                  <Link
                    to={`/games/${lastPlayed.slug}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Play size={14} className="fill-current" /> Play
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Today's Quick Picks */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="bg-primary/10 border-b border-border px-6 py-3 flex items-center gap-2">
                <Play size={15} className="text-primary" />
                <span className="font-black text-foreground text-sm">Today's quick picks</span>
                <span className="ml-auto text-muted-foreground text-xs font-bold">Jump straight in</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { emoji: '⚡', title: 'Mental Maths Sprint', slug: 'mental-maths-sprint', color: 'bg-amber-50 border-amber-200 hover:border-amber-400' },
                  { emoji: '🔤', title: 'Spelling Bee', slug: 'spelling-bee', color: 'bg-red-50 border-red-200 hover:border-red-400' },
                  { emoji: '📖', title: 'Reading Quest', slug: 'reading-quest', color: 'bg-green-50 border-green-200 hover:border-green-400' },
                  { emoji: '🔬', title: 'Science Lab', slug: 'science-lab', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
                ].map(game => (
                  <Link
                    key={game.slug}
                    to={`/games/${game.slug}`}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${game.color}`}
                  >
                    <span className="text-3xl">{game.emoji}</span>
                    <span className="font-black text-foreground text-xs text-center leading-tight">{game.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Streak counter widget */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <h2 className="text-lg font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              🔥 Your streak
            </h2>
            <StreakBadge variant="card" />
          </motion.div>

          {/* Personal Best trophy card */}
          <PersonalBestCard />

          {/* Recommended for you */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="font-black text-foreground text-sm">Recommended for you</span>
                <span className="ml-auto text-muted-foreground text-xs font-bold">Based on your activity</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { emoji: '⚡', title: 'Times Tables Challenge', slug: 'times-tables-challenge', subject: 'maths', reason: 'Boost your maths speed' },
                  { emoji: '🔤', title: 'Word Scramble', slug: 'word-scramble', subject: 'spelling', reason: 'Practise spelling' },
                  { emoji: '🔬', title: 'Science Lab', slug: 'science-lab', subject: 'science', reason: 'Explore science' },
                ].map(game => (
                  <Link
                    key={game.slug}
                    to={`/games/${game.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                      {game.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-foreground text-sm leading-tight truncate">{game.title}</p>
                      <p className="text-muted-foreground text-xs">{game.reason}</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Learners section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Your learners
            </h2>
            <motion.button whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-sm hover:opacity-90 transition-opacity">
              <Plus size={16} />
              Add learner
            </motion.button>
          </div>

          {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="bg-card rounded-2xl border border-border h-52 animate-pulse" />)}
            </div> : children.length === 0 ? <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-black text-foreground mb-2">No learners yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Add your first child or student to start tracking their progress.</p>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black">
                <Plus size={16} /> Add your first learner
              </button>
            </motion.div> : <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {children.map(child => <ChildCard key={child.id} child={child} onDelete={handleDelete} />)}
              {/* Add more card */}
              <motion.button variants={fadeUp} whileHover={{
            scale: 1.02
          }} onClick={() => setShowAdd(true)} className="rounded-2xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground hover:text-foreground transition-colors min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-sm">Add another learner</span>
              </motion.button>
            </motion.div>}

          {/* Tips section */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[{
            icon: '📊',
            title: 'Track progress',
            desc: 'View session history, scores, and time spent per subject for each learner.'
          }, {
            icon: '🎯',
            title: 'Spot strengths',
            desc: 'See which subjects your learner excels in and where they need more practice.'
          }, {
            icon: '🏆',
            title: 'Celebrate wins',
            desc: 'Every completed activity earns a score — watch the averages climb over time.'
          }].map(tip => <div key={tip.title} className="bg-card rounded-2xl border border-border p-6 text-center">
                <div className="text-4xl mb-3">{tip.icon}</div>
                <h3 className="font-black text-foreground mb-1" style={{
              fontFamily: 'var(--font-heading)'
            }}>{tip.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{tip.desc}</p>
              </div>)}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showAdd && <AddChildModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      </AnimatePresence>
      <PushNotificationBanner />
    </>;
}
export default function HubPage() {
  return <ProtectedRoute redirectTo="/hub/login">
      <HubDashboard />
    </ProtectedRoute>;
}
