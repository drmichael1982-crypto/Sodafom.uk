import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useParams, Link } from "react-router";
import { motion } from 'motion/react';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { ArrowLeft, Calculator, BookOpen, Pencil, Clock, Star, TrendingUp, Zap, Award } from 'lucide-react';

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ sessions }: { sessions: { starsEarned: number }[] }) {
  const last14 = sessions.slice(-14);
  if (last14.length < 2) return null;
  const max = Math.max(...last14.map(s => s.starsEarned), 1);
  const w = 200, h = 40, pad = 4;
  const pts = last14.map((s, i) => {
    const x = pad + (i / (last14.length - 1)) * (w - pad * 2);
    const y = h - pad - (s.starsEarned / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {last14.map((s, i) => {
        const x = pad + (i / (last14.length - 1)) * (w - pad * 2);
        const y = h - pad - (s.starsEarned / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill="hsl(var(--primary))" />;
      })}
    </svg>
  );
}

// ── Star display helpers ──────────────────────────────────────────────────────
function StarRow({
  count,
  max = 3,
  size = 16
}: {
  count: number;
  max?: number;
  size?: number;
}) {
  return <span className="inline-flex items-center gap-0.5">
      {Array.from({
      length: max
    }).map((_, i) => <Star key={i} size={size} className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 fill-muted-foreground/10'} />)}
    </span>;
}

// ── Types ────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────
interface ActivitySession {
  id: number;
  subject: string;
  activityId: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  durationSeconds: number;
  starsEarned: number;
  completedAt: string;
}
interface ProgressSummary {
  id: number;
  subject: string;
  weekStart: string;
  totalSessions: number;
  avgScore: string;
  totalMinutes: number;
}
interface Child {
  id: number;
  name: string;
  ageGroup: string;
  avatarEmoji: string;
}

// ── Config ───────────────────────────────────────────────────────────────────
const SUBJECT_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  label: string;
  emoji: string;
}> = {
  maths: {
    icon: <Calculator size={18} />,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Maths',
    emoji: '🔢'
  },
  spelling: {
    icon: <Pencil size={18} />,
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    label: 'Spelling',
    emoji: '🔤'
  },
  reading: {
    icon: <BookOpen size={18} />,
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    label: 'Reading',
    emoji: '📖'
  }
};
const AGE_LABELS: Record<string, string> = {
  '5-7': '⭐ Ages 5–7',
  '8-10': '🚀 Ages 8–10',
  '11-13': '🏆 Ages 11–12'
};
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16
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
      staggerChildren: 0.06
    }
  }
} as const;

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({
  score,
  max
}: {
  score: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round(score / max * 100) : 0;
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{
        width: 0
      }} animate={{
        width: `${pct}%`
      }} transition={{
        duration: 0.6,
        ease: 'easeOut' as const
      }} className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{pct}%</span>
    </div>;
}

// ── Recent badges strip ───────────────────────────────────────────────────────

// ── 14-day activity heatmap ───────────────────────────────────────────────────
function ActivityHeatmap({ sessions }: { sessions: ActivitySession[] }) {
  // Build last 14 days
  const days: { key: string; label: string; dayLabel: string; count: number; stars: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const daySessions = sessions.filter(s => s.completedAt.slice(0, 10) === key);
    days.push({
      key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayLabel: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      count: daySessions.length,
      stars: daySessions.reduce((a, s) => a + s.starsEarned, 0),
    });
  }

  const hasActivity = days.some(d => d.count > 0);
  if (!hasActivity) return null;

  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-primary" />
        <p className="font-black text-foreground text-sm">Activity — last 14 days</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const intensity = d.count === 0 ? 0 : Math.ceil((d.count / maxCount) * 4);
          const bg =
            intensity === 0 ? 'bg-muted' :
            intensity === 1 ? 'bg-primary/20' :
            intensity === 2 ? 'bg-primary/40' :
            intensity === 3 ? 'bg-primary/70' : 'bg-primary';
          const textColor = intensity >= 3 ? 'text-primary-foreground' : 'text-foreground';
          return (
            <motion.div
              key={d.key}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              title={d.count > 0 ? `${d.dayLabel}: ${d.count} game${d.count !== 1 ? 's' : ''}, ⭐${d.stars}` : d.dayLabel}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl ${bg} transition-all`}
            >
              <span className="text-[9px] font-bold text-muted-foreground">{d.label}</span>
              <span className={`text-xs font-black ${d.count > 0 ? textColor : 'text-muted-foreground/40'}`}>
                {d.count > 0 ? d.count : '·'}
              </span>
              {d.stars > 0 && (
                <span className="text-[9px] font-bold text-yellow-500">⭐{d.stars}</span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`w-3 h-3 rounded-sm ${
            i === 0 ? 'bg-muted' :
            i === 1 ? 'bg-primary/20' :
            i === 2 ? 'bg-primary/40' :
            i === 3 ? 'bg-primary/70' : 'bg-primary'
          }`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </motion.div>
  );
}

// ── Subject progress bar chart ────────────────────────────────────────────────
function SubjectProgressChart({ sessions }: { sessions: ActivitySession[] }) {
  const subjects = Object.keys(SUBJECT_CONFIG);

  // Aggregate per subject: total stars, sessions count, avg score %
  const stats = subjects.map(subject => {
    const subSessions = sessions.filter(s => s.subject === subject);
    const totalStars = subSessions.reduce((a, s) => a + s.starsEarned, 0);
    const totalScore = subSessions.reduce((a, s) => a + (s.maxScore > 0 ? s.score / s.maxScore : 0), 0);
    const avgPct = subSessions.length > 0 ? Math.round((totalScore / subSessions.length) * 100) : 0;
    return { subject, count: subSessions.length, totalStars, avgPct };
  }).filter(s => s.count > 0);

  if (stats.length === 0) return null;

  const maxStars = Math.max(...stats.map(s => s.totalStars), 1);

  return (
    <motion.div
      variants={fadeUp}
      className="bg-card rounded-2xl border border-border p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-primary" />
        <p className="font-black text-foreground text-sm">Stars by subject</p>
      </div>
      <div className="flex flex-col gap-3">
        {stats.map(({ subject, count, totalStars, avgPct }) => {
          const cfg = SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG];
          const barPct = Math.round((totalStars / maxStars) * 100);
          const barColor =
            subject === 'maths'    ? 'bg-amber-400' :
            subject === 'spelling' ? 'bg-red-400' :
            subject === 'reading'  ? 'bg-green-500' : 'bg-primary';
          return (
            <div key={subject} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-foreground">{cfg.label}</span>
                  <span className="text-xs text-muted-foreground font-bold">
                    ⭐ {totalStars} · {count} game{count !== 1 ? 's' : ''} · avg {avgPct}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.1 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function RecentBadgesStrip({ childId }: { childId: number }) {
  const [badges, setBadges] = useState<{ id: string; emoji: string; name: string; rarity: string }[]>([]);

  useEffect(() => {
    fetch(`${API_PREFIX}/badges?childId=${childId}`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { badges: { id: string; emoji: string; name: string; rarity: string; earned: boolean }[] }) => {
        setBadges((d.badges ?? []).filter(b => b.earned).slice(0, 6));
      })
      .catch(() => { /* silent */ });
  }, [childId]);

  return (
    <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Award size={16} className="text-yellow-500" />
        <p className="font-black text-foreground text-sm">Recent badges</p>
        <Link to="/badges" className="ml-auto text-xs text-primary font-bold hover:underline">View all</Link>
      </div>
      {badges.length === 0
        ? <p className="text-muted-foreground text-xs">No badges earned yet — keep playing!</p>
        : (
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <div key={b.id} title={b.name} className="w-10 h-10 rounded-xl bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center text-xl" aria-label={b.name}>
                {b.emoji}
              </div>
            ))}
          </div>
        )
      }
    </motion.div>
  );
}

// ── Subject summary card ──────────────────────────────────────────────────────
function SubjectSummaryCard({
  subject,
  summaries,
  sessions
}: {
  subject: string;
  summaries: ProgressSummary[];
  sessions: ActivitySession[];
}) {
  const cfg = (Object.hasOwn(SUBJECT_CONFIG, subject) ? SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG] : undefined) ?? SUBJECT_CONFIG['maths'];
  const subjectSessions = sessions.filter(s => s.subject === subject);
  const subjectSummaries = summaries.filter(s => s.subject === subject);
  const latestSummary = subjectSummaries[0];
  const avgScore = subjectSessions.length > 0 ? Math.round(subjectSessions.reduce((a, s) => a + (s.maxScore > 0 ? s.score / s.maxScore * 100 : 0), 0) / subjectSessions.length) : 0;
  const totalMins = subjectSessions.reduce((a, s) => a + Math.round(s.durationSeconds / 60), 0);
  return <motion.div variants={fadeUp} className={`rounded-2xl border-2 p-5 ${cfg.bg}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 ${cfg.color}`}>
          {cfg.icon}
        </div>
        <div>
          <h3 className={`font-black text-base ${cfg.color}`} style={{
          fontFamily: 'var(--font-heading)'
        }}>
            {cfg.emoji} {cfg.label}
          </h3>
          <p className="text-xs text-muted-foreground">{subjectSessions.length} sessions</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <div className={`text-2xl font-black ${cfg.color}`}>{avgScore}%</div>
          <div className="text-xs text-muted-foreground font-bold">Avg score</div>
        </div>
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <div className={`text-2xl font-black ${cfg.color}`}>{totalMins}</div>
          <div className="text-xs text-muted-foreground font-bold">Minutes</div>
        </div>
      </div>
      {latestSummary && <div className="mt-3 text-xs text-muted-foreground font-bold">
          This week: {latestSummary.totalSessions} sessions · {latestSummary.totalMinutes} min
        </div>}
    </motion.div>;
}

// ── Main component ────────────────────────────────────────────────────────────
function ChildProgressView() {
  const {
    childId
  } = useParams<{
    childId: string;
  }>();
  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [summaries, setSummaries] = useState<ProgressSummary[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string>('all');
  useEffect(() => {
    if (!childId) return;
    Promise.all([fetch(`${API_PREFIX}/children`, {
      credentials: 'include'
    }).then(r => r.json()), fetch(`${API_PREFIX}/children/${childId}/progress`, {
      credentials: 'include'
    }).then(r => r.json())]).then(([childrenData, progressData]) => {
      const found = Array.isArray(childrenData) ? childrenData.find((c: Child) => c.id === parseInt(childId)) : null;
      setChild(found ?? null);
      setSessions(progressData.recent ?? []);
      setSummaries(progressData.summaries ?? []);
      setTotalStars(progressData.totalStars ?? 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [childId]);
  const filteredSessions = activeSubject === 'all' ? sessions : sessions.filter(s => s.subject === activeSubject);
  const totalSessions = sessions.length;
  const totalMins = sessions.reduce((a, s) => a + Math.round(s.durationSeconds / 60), 0);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📊</div>
          <p className="text-muted-foreground font-bold">Loading progress…</p>
        </div>
      </div>;
  }
  if (!child) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-black text-foreground mb-2">Learner not found</h2>
          <Link to="/hub" className="text-primary font-bold hover:underline">← Back to Hub</Link>
        </div>
      </div>;
  }
  return <>
      <Helmet>
        <title>{child.name}'s Progress — Sodafom Hub</title>
        <meta name="description" content={`Track ${child.name}'s learning progress across Maths, Spelling, and Reading on Sodafom.`} />
        <link rel="canonical" href={`https://sodafom.com/hub/child/${child.id}`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
            <Link to="/hub" className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              {child.avatarEmoji}
            </div>
            <div>
              <h1 className="font-black text-xl leading-tight" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                {child.name}'s Progress
              </h1>
              <p className="text-primary-foreground/60 text-xs">{AGE_LABELS[child.ageGroup] ?? child.ageGroup}</p>
            </div>
            {/* Star total badge in header */}
            <div className="ml-auto flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-3 py-1.5">
              <Star size={14} className="text-yellow-300 fill-yellow-300" />
              <span className="font-black text-yellow-200 text-sm">{totalStars}</span>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Overall stats */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[{
            icon: <Zap size={20} />,
            label: 'Total sessions',
            value: totalSessions,
            color: 'bg-primary/10 text-primary'
          }, {
            icon: <Star size={20} />,
            label: 'Stars earned',
            value: totalStars,
            color: 'bg-yellow-100 text-yellow-600'
          }, {
            icon: <Clock size={20} />,
            label: 'Total time',
            value: `${totalMins} min`,
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

          {/* Star history sparkline + recent badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Sparkline card */}
            <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-primary" />
                <p className="font-black text-foreground text-sm">Stars per session (last 14)</p>
              </div>
              {sessions.length >= 2
                ? <Sparkline sessions={sessions} />
                : <p className="text-muted-foreground text-xs">Play more games to see your trend.</p>
              }
            </motion.div>

            {/* Recent badges */}
            <RecentBadgesStrip childId={child.id} />
          </div>

          {/* 14-day activity heatmap */}
          <ActivityHeatmap sessions={sessions} />

          {/* Subject progress bar chart */}
          <SubjectProgressChart sessions={sessions} />

          {/* Subject summaries */}
          <h2 className="text-xl font-black text-foreground mb-4" style={{
          fontFamily: 'var(--font-heading)'
        }}>
            Subject overview
          </h2>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {Object.keys(SUBJECT_CONFIG).map(subject => <SubjectSummaryCard key={subject} subject={subject} summaries={summaries} sessions={sessions} />)}
          </motion.div>

          {/* Activity history */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black text-foreground" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                Recent activity
              </h2>
              {/* Star legend */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {[{
                stars: 3,
                label: '90%+'
              }, {
                stars: 2,
                label: '75–89%'
              }, {
                stars: 1,
                label: '50–74%'
              }, {
                stars: 0,
                label: 'Under 50%'
              }].map(tier => <span key={tier.stars} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <StarRow count={tier.stars} size={11} />
                    <span>{tier.label}</span>
                  </span>)}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', ...Object.keys(SUBJECT_CONFIG)].map(s => <button key={s} onClick={() => setActiveSubject(s)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${activeSubject === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary/40'}`}>
                  {s === 'all' ? '🎮 All' : `${(Object.hasOwn(SUBJECT_CONFIG, s) ? SUBJECT_CONFIG[s as keyof typeof SUBJECT_CONFIG] : undefined)?.emoji ?? ''} ${(Object.hasOwn(SUBJECT_CONFIG, s) ? SUBJECT_CONFIG[s as keyof typeof SUBJECT_CONFIG] : undefined)?.label ?? s}`}
                </button>)}
            </div>
          </div>

          {filteredSessions.length === 0 ? <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed border-border">
              <div className="text-5xl mb-3">🎮</div>
              <h3 className="font-black text-foreground mb-1">No activity yet</h3>
              <p className="text-muted-foreground text-sm">
                {activeSubject === 'all' ? `${child.name} hasn't completed any activities yet.` : `No ${(Object.hasOwn(SUBJECT_CONFIG, activeSubject) ? SUBJECT_CONFIG[activeSubject as keyof typeof SUBJECT_CONFIG] : undefined)?.label ?? activeSubject} sessions recorded yet.`}
              </p>
            </div> : <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {filteredSessions.map(session => {
            const cfg = (Object.hasOwn(SUBJECT_CONFIG, session.subject) ? SUBJECT_CONFIG[session.subject as keyof typeof SUBJECT_CONFIG] : undefined) ?? SUBJECT_CONFIG['maths'];
            const pct = session.maxScore > 0 ? Math.round(session.score / session.maxScore * 100) : 0;
            const date = new Date(session.completedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const mins = Math.round(session.durationSeconds / 60);
            return <motion.div key={session.id} variants={fadeUp} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground text-sm truncate">{session.activityTitle}</span>
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <ScoreBar score={session.score} max={session.maxScore} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-foreground text-sm">{pct}%</div>
                      <StarRow count={session.starsEarned} size={13} />
                      <div className="text-xs text-muted-foreground mt-0.5">{mins > 0 ? `${mins} min` : date}</div>
                    </div>
                  </motion.div>;
          })}
            </motion.div>}

          {/* Empty state encouragement */}
          {sessions.length === 0 && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }} className="mt-10 bg-primary/5 rounded-3xl border-2 border-primary/20 p-8 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <h3 className="text-xl font-black text-foreground mb-2" style={{
            fontFamily: 'var(--font-heading)'
          }}>
                Ready to start learning?
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                Once {child.name} completes activities on Sodafom, their progress will appear here.
              </p>
              <Link to="/games" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity">
                <TrendingUp size={16} />
                Explore games
              </Link>
            </motion.div>}
        </div>
      </main>
    </>;
}
export default function ChildProgressPage() {
  return <ProtectedRoute redirectTo="/hub/login">
      <ChildProgressView />
    </ProtectedRoute>;
}
