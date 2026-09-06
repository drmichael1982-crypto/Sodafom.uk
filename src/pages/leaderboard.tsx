/**
 * /leaderboard — Top 10 children by stars this week (opt-in only)
 */
import { useEffect, useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '@/lib/auth/auth-client';
import { Trophy, Star, RefreshCw, Shield, ChevronRight, Crown, Calculator, Pencil, BookOpen, FlaskConical, Sparkles } from 'lucide-react';

interface Entry {
  rank: number;
  firstName: string;
  avatar: string;
  weekStars: number;
  totalStars: number;
  subject?: string;
}

interface Child { id: number; name: string; leaderboard_opt_in?: number }

const RANK_STYLES = [
  'bg-accent text-accent-foreground border-accent/40',
  'bg-slate-100 text-slate-700 border-slate-200',
  'bg-orange-100 text-orange-700 border-orange-200',
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const SUBJECTS = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'maths', label: 'Maths', icon: Calculator },
  { key: 'spelling', label: 'Spelling', icon: Pencil },
  { key: 'reading', label: 'Reading', icon: BookOpen },
  { key: 'science', label: 'Science', icon: FlaskConical },
];

export default function LeaderboardPage() {
  const { isAuthenticated } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);
  const [activeSubject, setActiveSubject] = useState('all');
  const [timeMode, setTimeMode] = useState<'week' | 'alltime'>('week');

  const loadLeaderboard = () => {
    fetch(`${API_PREFIX}/leaderboard`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        const data = d as { entries: Entry[]; updatedAt: string };
        setEntries(data.entries ?? []);
        setUpdatedAt(data.updatedAt ?? '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaderboard();
    if (isAuthenticated) {
      fetch(`${API_PREFIX}/children`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => setChildren((d as { children?: Child[] }).children ?? []))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const toggleOptIn = async (childId: number, current: number) => {
    setToggling(childId);
    try {
      await fetch(`${API_PREFIX}/leaderboard/opt-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId, optIn: !current }),
      });
      setChildren((prev) =>
        prev.map((c) => c.id === childId ? { ...c, leaderboard_opt_in: current ? 0 : 1 } : c)
      );
      loadLeaderboard();
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  // Client-side filter by subject (entries may have subject field)
  const filteredEntries = entries
    .filter(e => activeSubject === 'all' || !e.subject || e.subject === activeSubject)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const displayStars = (e: Entry) => timeMode === 'week' ? e.weekStars : e.totalStars;

  return (
    <>
      <Helmet>
        <title>Leaderboard — Sodafom</title>
        <meta name="description" content="See the top learners on Sodafom this week. Opt in to show your child on the leaderboard." />
        <link rel="canonical" href="https://sodafom.uk/leaderboard" />
      </Helmet>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Top learners by stars earned
          </p>
          {updatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated {new Date(updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </motion.div>

        {/* Weekly / All-time toggle */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {(['week', 'alltime'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setTimeMode(mode)}
              className={`px-5 py-2 rounded-full text-sm font-black transition-all ${
                timeMode === mode
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {mode === 'week' ? 'This week' : 'All time'}
            </button>
          ))}
        </div>

        {/* Subject filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {SUBJECTS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSubject(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all shrink-0 ${
                activeSubject === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 bg-muted rounded-2xl px-4 py-3 mb-6">
          <Shield size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Only first names and emoji avatars are shown. Children only appear if a parent has opted them in below.
          </p>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw size={24} className="text-primary animate-spin" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-border p-10 text-center">
            <Crown size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-black text-foreground mb-2">No entries yet</h2>
            <p className="text-muted-foreground text-sm">
              Be the first! Opt your child in below and start earning stars.
            </p>
          </div>
        ) : (
          <>
            {/* ── Animated podium for top 3 ── */}
            {filteredEntries.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-8 px-2">
                {/* 2nd place */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' as const }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="text-3xl">{filteredEntries[1].avatar}</div>
                  <p className="font-black text-foreground text-sm text-center leading-tight">{filteredEntries[1].firstName}</p>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-accent fill-accent" />
                    <span className="text-xs font-black text-foreground">{displayStars(filteredEntries[1])}</span>
                  </div>
                  <div className="w-full rounded-t-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center py-4 shadow-md" style={{ height: 80 }}>
                    <span className="text-3xl">🥈</span>
                  </div>
                </motion.div>
                {/* 1st place */}
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.55, ease: 'easeOut' as const }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 0] }}
                    transition={{ delay: 1, duration: 0.6, repeat: 2 }}
                    className="text-3xl"
                  >
                    👑
                  </motion.div>
                  <div className="text-3xl">{filteredEntries[0].avatar}</div>
                  <p className="font-black text-foreground text-sm text-center leading-tight">{filteredEntries[0].firstName}</p>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-accent fill-accent" />
                    <span className="text-xs font-black text-foreground">{displayStars(filteredEntries[0])}</span>
                  </div>
                  <div className="w-full rounded-t-2xl bg-accent border-2 border-accent/60 flex items-center justify-center py-4 shadow-lg" style={{ height: 110 }}>
                    <span className="text-4xl">🥇</span>
                  </div>
                </motion.div>
                {/* 3rd place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' as const }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="text-3xl">{filteredEntries[2].avatar}</div>
                  <p className="font-black text-foreground text-sm text-center leading-tight">{filteredEntries[2].firstName}</p>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-accent fill-accent" />
                    <span className="text-xs font-black text-foreground">{displayStars(filteredEntries[2])}</span>
                  </div>
                  <div className="w-full rounded-t-2xl bg-orange-200 border-2 border-orange-300 flex items-center justify-center py-4 shadow-md" style={{ height: 60 }}>
                    <span className="text-3xl">🥉</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Full ranked list */}
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-3 mb-8">
                {filteredEntries.map((entry, i) => (
                  <motion.div
                    key={`${entry.rank}-${entry.firstName}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3 ${
                      i < 3 ? RANK_STYLES[i] : 'bg-card border-border'
                    }`}
                  >
                    {/* Rank badge */}
                    <div className="w-9 text-center shrink-0">
                      {i < 3 ? (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: i * 0.1 }}
                          className="text-2xl"
                        >
                          {RANK_MEDALS[i]}
                        </motion.span>
                      ) : (
                        <span className="text-sm font-black text-muted-foreground">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="text-2xl">{entry.avatar}</div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className="font-black text-foreground">{entry.firstName}</p>
                    </div>

                    {/* Stars */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star size={14} className="text-accent fill-accent" />
                        <span className="font-black text-foreground">{displayStars(entry)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{timeMode === 'week' ? 'this week' : 'all time'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}

        {/* Opt-in section */}
        {isAuthenticated && children.length > 0 && (
          <div className="bg-card rounded-3xl border-2 border-border p-6">
            <h2 className="text-lg font-black text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Leaderboard settings
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which children appear on the public leaderboard.
            </p>
            <div className="flex flex-col gap-3">
              {children.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                  <span className="font-bold text-foreground text-sm">{c.name}</span>
                  <button
                    onClick={() => toggleOptIn(c.id, c.leaderboard_opt_in ?? 0)}
                    disabled={toggling === c.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      c.leaderboard_opt_in ? 'bg-primary' : 'bg-muted-foreground/30'
                    } disabled:opacity-60`}
                    aria-label={`Toggle leaderboard for ${c.name}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        c.leaderboard_opt_in ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center mt-6">
            <Link
              to="/hub/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
            >
              Sign in to manage opt-in <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
