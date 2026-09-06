/**
 * /hub/progress — Parent progress dashboard
 * Shows a per-child progress overview: stars, subjects, recent activity,
 * and a weekly report card for each learner.
 */
import { useEffect, useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ProtectedRoute, useSession, LogoutButton } from '@/lib/auth/auth-client';
import { ArrowLeft, Star, TrendingUp, BookOpen, Calculator, Pencil, Award, ChevronRight, Sparkles, BarChart3, CalendarDays } from 'lucide-react';
import StreakFreezeButton from '@/components/StreakFreezeButton';

// ── 14-day star bar chart ─────────────────────────────────────────────────────
function StarBarChart({ activity }: { activity: ActivityEntry[] }) {
  const days: { label: string; stars: number; key: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayStars = activity
      .filter(a => a.playedAt.slice(0, 10) === key)
      .reduce((s, a) => s + a.stars, 0);
    days.push({
      key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      stars: dayStars,
    });
  }
  const max = Math.max(...days.map(d => d.stars), 1);
  const totalThisWeek = days.slice(7).reduce((s, d) => s + d.stars, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
          <BarChart3 size={14} className="text-primary" /> 14-day star chart
        </h3>
        <span className="text-xs font-bold text-muted-foreground">⭐ {totalThisWeek} this week</span>
      </div>
      <div className="flex items-end gap-1 h-20 bg-muted/40 rounded-2xl px-3 py-2">
        {days.map((d, i) => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <motion.div
              initial={{ height: 3 }}
              animate={{ height: Math.max(3, (d.stars / max) * 56) }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className={`w-full rounded-t ${i >= 7 ? 'bg-primary' : 'bg-primary/40'}`}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.label}: {d.stars}⭐
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-muted-foreground">{days[0].label}</span>
        <span className="text-[10px] text-muted-foreground font-bold text-primary">Today</span>
      </div>
    </div>
  );
}

// ── 30-day activity heatmap ───────────────────────────────────────────────────
function ActivityHeatmap({ activity }: { activity: ActivityEntry[] }) {
  const cells: { key: string; count: number; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = activity.filter(a => a.playedAt.slice(0, 10) === key).length;
    cells.push({ key, count, label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) });
  }
  const maxCount = Math.max(...cells.map(c => c.count), 1);

  function heatColor(count: number) {
    if (count === 0) return 'bg-muted border border-border';
    const intensity = count / maxCount;
    if (intensity < 0.33) return 'bg-primary/30';
    if (intensity < 0.66) return 'bg-primary/60';
    return 'bg-primary';
  }

  return (
    <div>
      <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 mb-3">
        <CalendarDays size={14} className="text-primary" /> 30-day activity
      </h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {cells.map(c => (
          <div
            key={c.key}
            title={`${c.label}: ${c.count} game${c.count !== 1 ? 's' : ''}`}
            className={`aspect-square rounded-sm cursor-default transition-all hover:scale-110 ${heatColor(c.count)}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {['bg-muted border border-border', 'bg-primary/30', 'bg-primary/60', 'bg-primary'].map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
interface Child {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
  totalStars: number;
  createdAt: string;
}

interface ActivityEntry {
  id: number;
  gameId: string;
  gameName: string;
  subject: string;
  score: number;
  stars: number;
  playedAt: string;
}

interface ChildProgress {
  child: Child;
  activity: ActivityEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  maths:   { icon: <Calculator size={14} />, label: 'Maths',   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  spelling:{ icon: <Pencil size={14} />,     label: 'Spelling', color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  reading: { icon: <BookOpen size={14} />,   label: 'Reading',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
};

const AGE_LABELS: Record<string, string> = { '5-7': 'Ages 5–7', '8-10': 'Ages 8–10', '11-13': 'Ages 11–13' };

function StarRow({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={13} className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} />
      ))}
    </span>
  );
}

function subjectBreakdown(activity: ActivityEntry[]) {
  const map: Record<string, { plays: number; stars: number; bestScore: number }> = {};
  for (const a of activity) {
    const s = a.subject ?? 'other';
    if (!map[s]) map[s] = { plays: 0, stars: 0, bestScore: 0 };
    map[s].plays++;
    map[s].stars += a.stars;
    if (a.score > map[s].bestScore) map[s].bestScore = a.score;
  }
  return map;
}

function weeklyActivity(activity: ActivityEntry[]) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return activity.filter(a => now - new Date(a.playedAt).getTime() < weekMs);
}

// ── Subject mastery donut rings ───────────────────────────────────────────────
function DonutRing({
  pct, strokeColor, emoji, label, plays,
}: { pct: number; strokeColor: string; emoji: React.ReactNode; label: string; plays: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted" />
          <motion.circle
            cx="32" cy="32" r={r} fill="none" stroke={strokeColor} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">{emoji}</span>
        </div>
      </div>
      <p className="text-xs font-black text-foreground text-center leading-tight">{label}</p>
      <p className="text-xs text-muted-foreground font-bold">{Math.round(pct)}%</p>
      <p className="text-xs text-muted-foreground">{plays} game{plays !== 1 ? 's' : ''}</p>
    </div>
  );
}

function MasteryRings({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) return null;
  // Use CSS variable values resolved at runtime for SVG stroke (SVG doesn't support Tailwind classes on stroke)
  const subjects = [
    { key: 'maths',    label: 'Maths',    emoji: '🔢', cssVar: '--primary' },
    { key: 'spelling', label: 'Spelling', emoji: '✏️', cssVar: '--secondary' },
    { key: 'reading',  label: 'Reading',  emoji: '📖', cssVar: '--accent' },
    { key: 'science',  label: 'Science',  emoji: '🔬', cssVar: '--primary' },
  ];

  const rings = subjects.map(s => {
    const plays = activity.filter(a => (a.subject ?? 'other') === s.key);
    if (plays.length === 0) return null;
    const totalStars = plays.reduce((acc, a) => acc + a.stars, 0);
    const maxPossible = plays.length * 3;
    const pct = maxPossible > 0 ? Math.round((totalStars / maxPossible) * 100) : 0;
    return { ...s, pct, playCount: plays.length };
  }).filter(Boolean) as { key: string; label: string; emoji: string; cssVar: string; pct: number; playCount: number }[];

  if (rings.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-black text-foreground mb-3">Subject mastery</h3>
      <div className="flex justify-around flex-wrap gap-4">
        {rings.map(r => (
          <DonutRing
            key={r.key}
            pct={r.pct}
            strokeColor={`hsl(var(${r.cssVar}))`}
            emoji={r.emoji}
            label={r.label}
            plays={r.playCount}
          />
        ))}
      </div>
    </div>
  );
}

// ── Child progress card ───────────────────────────────────────────────────────
function ChildProgressCard({ data }: { data: ChildProgress }) {
  const { child, activity } = data;
  const breakdown = subjectBreakdown(activity);
  const thisWeek = weeklyActivity(activity);
  const weekStars = thisWeek.reduce((s, a) => s + a.stars, 0);
  const recentGames = [...activity].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()).slice(0, 5);
  const totalPlays = activity.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl border-2 border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl shrink-0">
          {child.avatarEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-xl leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {child.name}
          </h2>
          <p className="text-primary-foreground/70 text-sm">{AGE_LABELS[child.ageGroup] ?? child.ageGroup}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black">{child.totalStars}</div>
          <div className="text-primary-foreground/70 text-xs font-bold">total stars</div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Weekly snapshot */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'This week', value: thisWeek.length, sub: 'games played', emoji: '🎮' },
            { label: 'Stars this week', value: weekStars, sub: 'stars earned', emoji: '⭐' },
            { label: 'All time', value: totalPlays, sub: 'total games', emoji: '🏆' },
          ].map(({ label, value, sub, emoji }) => (
            <div key={label} className="bg-muted/50 rounded-2xl p-3 text-center border border-border">
              <div className="text-xl mb-0.5">{emoji}</div>
              <div className="text-xl font-black text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground font-bold leading-tight">{sub}</div>
            </div>
          ))}
        </div>

        {/* 14-day star chart */}
        <StarBarChart activity={activity} />

        {/* 30-day heatmap */}
        <ActivityHeatmap activity={activity} />

        {/* Subject mastery rings */}
        <MasteryRings activity={activity} />

        {/* Subject breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div>
            <h3 className="text-sm font-black text-foreground mb-2">Subject breakdown</h3>
            <div className="space-y-2">
              {Object.entries(breakdown).map(([subj, stats]) => {
                const meta = SUBJECT_META[subj] ?? SUBJECT_META.reading;
                const avgStars = stats.plays > 0 ? stats.stars / stats.plays : 0;
                return (
                  <div key={subj} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${meta.bg}`}>
                    <span className={`${meta.color} shrink-0`}>{meta.icon}</span>
                    <span className={`font-black text-sm ${meta.color} flex-1`}>{meta.label}</span>
                    <span className="text-xs text-muted-foreground font-bold">{stats.plays} games</span>
                    <StarRow count={Math.round(avgStars)} />
                    <span className="text-xs font-bold text-muted-foreground">avg</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recentGames.length > 0 ? (
          <div>
            <h3 className="text-sm font-black text-foreground mb-2">Recent games</h3>
            <div className="space-y-1.5">
              {recentGames.map(a => {
                const meta = SUBJECT_META[a.subject] ?? SUBJECT_META.reading;
                const date = new Date(a.playedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                return (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                    <span className={`${meta.color} shrink-0`}>{meta.icon}</span>
                    <span className="flex-1 text-sm font-bold text-foreground truncate">{a.gameName}</span>
                    <StarRow count={a.stars} />
                    <span className="text-xs text-muted-foreground font-bold shrink-0">{date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm font-bold">
            No games played yet — <Link to={`/games?age=${child.ageGroup}`} className="text-primary hover:underline">browse games</Link>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          <Link
            to={`/games?age=${child.ageGroup}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
          >
            🎮 Play games
          </Link>
          <Link
            to={`/hub/child/${child.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <TrendingUp size={14} /> Full report
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ProgressDashboard() {
  const { user } = useSession();
  const [progressData, setProgressData] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    async function load() {
      try {
        const childRes = await fetch(`${API_PREFIX}/children`, { credentials: 'include' });
        const children: Child[] = await childRes.json();
        if (!Array.isArray(children)) { setLoading(false); return; }

        const all = await Promise.all(
          children.map(async (child) => {
            try {
              const actRes = await fetch(`${API_PREFIX}/teacher/students/${child.id}`, { credentials: 'include' });
              if (!actRes.ok) return { child, activity: [] };
              const data = await actRes.json() as { activity?: ActivityEntry[] };
              return { child, activity: data.activity ?? [] };
            } catch {
              return { child, activity: [] };
            }
          })
        );
        setProgressData(all);
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalStars = progressData.reduce((s, d) => s + d.child.totalStars, 0);
  const totalPlays = progressData.reduce((s, d) => s + d.activity.length, 0);
  const weekPlays  = progressData.reduce((s, d) => s + weeklyActivity(d.activity).length, 0);

  return (
    <>
      <Helmet>
        <title>Progress Dashboard — Sodafom</title>
        <meta name="description" content="Track your children's learning progress across Maths, Spelling, and Reading." />
        <link rel="canonical" href="https://sodafom.uk/hub/progress" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link to="/hub" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors">
                <ArrowLeft size={14} /> Hub
              </Link>
              <div>
                <p className="font-black text-sm leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Progress Dashboard
                </p>
                <p className="text-primary-foreground/60 text-xs">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/referral" className="px-3 py-1.5 rounded-lg bg-accent/30 hover:bg-accent/50 text-sm font-bold transition-colors">
                🎁 Refer a friend
              </Link>
              <Link to="/certificates" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors">
                🏆 Certificates
              </Link>
              <LogoutButton className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors text-primary-foreground">
                Sign out
              </LogoutButton>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-7 text-primary-foreground flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  📊 Progress Report
                </h1>
                <p className="text-primary-foreground/75 text-sm">
                  Hi {firstName}! Here's how all your learners are doing this week.
                </p>
              </div>
              <div className="flex gap-3 text-center shrink-0">
                {[
                  { value: progressData.length, label: 'Learners' },
                  { value: weekPlays, label: 'This week' },
                  { value: totalStars, label: 'Total stars' },
                  { value: totalPlays, label: 'All games' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-white/15 rounded-2xl px-4 py-2.5">
                    <div className="text-xl font-black">{value}</div>
                    <div className="text-xs text-primary-foreground/70 font-bold">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="text-4xl animate-bounce mb-3">📊</div>
              <p className="text-muted-foreground font-bold">Loading progress data…</p>
            </div>
          )}

          {/* No children */}
          {!loading && progressData.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">👶</div>
              <h2 className="text-xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                No learners added yet
              </h2>
              <p className="text-muted-foreground mb-6">Add a child in the Hub to start tracking their progress.</p>
              <Link to="/hub" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity">
                Go to Hub <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {/* Progress cards */}
          {!loading && progressData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {progressData.map(d => (
                <ChildProgressCard key={d.child.id} data={d} />
              ))}
            </div>
          )}

          {/* Streak freeze cards — one per child */}
          {!loading && progressData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.map(d => (
                <StreakFreezeButton key={d.child.id} childId={String(d.child.id)} />
              ))}
            </div>
          )}

          {/* Weekly tips */}
          {!loading && progressData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 bg-accent/10 border border-accent/30 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-accent-foreground" />
                <h2 className="font-black text-foreground text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                  Tips for this week
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { emoji: '🔥', title: 'Keep the streak going', desc: 'Even 10 minutes a day builds lasting habits. Try to log in every day this week!' },
                  { emoji: '⭐', title: 'Aim for 3 stars', desc: 'Encourage your child to replay games they scored 1–2 stars on to improve their score.' },
                  { emoji: '🏆', title: 'Celebrate wins', desc: 'Print a certificate when they earn 3 stars on a game — it motivates them to keep going!' },
                ].map(tip => (
                  <div key={tip.title} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="text-2xl mb-2">{tip.emoji}</div>
                    <p className="font-black text-foreground text-sm mb-1">{tip.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                <Link to="/certificates" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity">
                  <Award size={14} /> Print a certificate
                </Link>
                <Link to="/badges" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors">
                  🏆 Achievement badges
                </Link>
                <Link to="/referral" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors">
                  🎁 Refer a friend — earn rewards
                </Link>
                <Link to="/blog" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors">
                  <BookOpen size={14} /> Learning tips blog
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

export default function HubProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressDashboard />
    </ProtectedRoute>
  );
}
