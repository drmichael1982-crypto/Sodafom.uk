/**
 * /parent-dashboard — Full progress dashboard for parents
 * Shows per-child: stars, games played, subject breakdown, 14-day chart, recent games
 */
import { useEffect, useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import {
  Star, BookOpen, FlaskConical, Calculator, Pencil, Trophy,
  TrendingUp, Calendar, Medal, RefreshCw, Mail, Printer,
  UserPlus, Flame, Award, ExternalLink,
} from 'lucide-react';
import { ParentTutorReport } from '@/components/ParentTutorReport';

const SUBJECT_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  maths:    { label: 'Maths',    color: 'bg-blue-100 text-blue-700 border-blue-200',    icon: Calculator },
  spelling: { label: 'Spelling', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Pencil },
  reading:  { label: 'Reading',  color: 'bg-green-100 text-green-700 border-green-200',  icon: BookOpen },
  science:  { label: 'Science',  color: 'bg-orange-100 text-orange-700 border-orange-200', icon: FlaskConical },
};

interface Child { id: number; name: string; age_group: string; total_stars: number; avatarEmoji?: string }
interface StreakInfo { currentStreak: number; maxStreak: number; starBalance: number }
interface DashData {
  child: Child;
  totalGames: number;
  badgeCount: number;
  subjects: { subject: string; games_played: number; stars: number }[];
  daily: { day: string; stars: number }[];
  recent: { game_slug: string; subject: string; stars_earned: number; score_pct: number; played_at: string }[];
}

function WeeklyReportButton() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API_PREFIX}/reports/weekly-email`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError('Could not send — try again');
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending || sent}
      title={error || (sent ? 'Report sent!' : 'Email weekly report')}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
        sent ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'
      } disabled:opacity-60`}
    >
      <Mail size={14} />
      {sent ? 'Sent!' : sending ? 'Sending…' : 'Email report'}
    </button>
  );
}

function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-muted hover:bg-muted/80 text-muted-foreground transition-all print:hidden"
      title="Print this report"
    >
      <Printer size={14} />
      Print
    </button>
  );
}


function StarBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{value}</span>
    </div>
  );
}

function MiniChart({ daily }: { daily: { day: string; stars: number }[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  // Fill last 14 days
  const days: { key: string; label: string; shortLabel: string; stars: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = daily.find((x) => x.day.slice(0, 10) === key);
    days.push({
      key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      shortLabel: d.toLocaleDateString('en-GB', { day: 'numeric' }),
      stars: found ? Number(found.stars) : 0,
    });
  }
  if (!days.some(d => d.stars > 0)) {
    return <p className="text-xs text-muted-foreground text-center py-4">No activity yet this fortnight.</p>;
  }
  const max = Math.max(...days.map((d) => d.stars), 1);
  const totalStars = days.reduce((s, d) => s + d.stars, 0);
  const activeDays = days.filter(d => d.stars > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-bold">
        <span>{activeDays} active day{activeDays !== 1 ? 's' : ''}</span>
        <span>⭐ {totalStars} total</span>
      </div>
      <div className="relative flex items-end gap-1 h-24 bg-muted/30 rounded-2xl px-3 pt-2 pb-5">
        {days.map((d, i) => (
          <div
            key={d.key}
            className="flex-1 flex flex-col items-center relative group"
            onMouseEnter={() => setHovered(d.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div
              initial={{ height: 3 }}
              animate={{ height: Math.max(3, (d.stars / max) * 56) }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className={`w-full rounded-t transition-colors ${
                hovered === d.key ? 'bg-primary' : i >= 7 ? 'bg-primary/80' : 'bg-primary/40'
              }`}
            />
            {/* Tooltip */}
            {hovered === d.key && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
                {d.label}: {d.stars}⭐
              </div>
            )}
          </div>
        ))}
        {/* X-axis labels */}
        <div className="absolute bottom-1 left-3 right-3 flex justify-between">
          <span className="text-[9px] text-muted-foreground">{days[0].shortLabel}</span>
          <span className="text-[9px] text-muted-foreground">{days[6].shortLabel}</span>
          <span className="text-[9px] text-primary font-black">Today</span>
        </div>
      </div>
    </div>
  );
}

function ChildStreakBadge({ childId }: { childId: number }) {
  const [streak, setStreak] = useState<StreakInfo | null>(null);

  useEffect(() => {
    fetch(`${API_PREFIX}/streak?childId=${childId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStreak(d as StreakInfo))
      .catch(() => {});
  }, [childId]);

  if (!streak || streak.currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black">
      <Flame size={12} className="text-orange-500" />
      {streak.currentStreak}-day streak
    </div>
  );
}

function FamilySummaryCard({ children }: { children: Child[] }) {
  const totalStars = children.reduce((s, c) => s + (c.total_stars ?? 0), 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border-2 border-primary/20 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Family overview
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Award size={14} className="text-primary" />
          {children.length} learner{children.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl p-4 text-center border border-border">
          <div className="text-2xl font-black text-foreground flex items-center justify-center gap-1">
            <Star size={18} className="text-accent fill-accent" />
            {totalStars.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total stars</div>
        </div>
        <div className="bg-card rounded-2xl p-4 text-center border border-border">
          <div className="text-2xl font-black text-foreground">{children.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Learners</div>
        </div>
        <div className="bg-card rounded-2xl p-4 text-center border border-border col-span-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {children.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <span className="text-lg">{c.avatarEmoji ?? '🦁'}</span>
                <span>{c.name}</span>
                <span className="text-xs text-accent font-black">⭐{c.total_stars}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


function ChildCard({ childId }: { childId: number }) {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_PREFIX}/parent/dashboard?childId=${childId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d as DashData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [childId]);

  if (loading) return (
    <div className="bg-card rounded-3xl border-2 border-border p-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-32 mb-4" />
      <div className="h-4 bg-muted rounded w-full mb-2" />
      <div className="h-4 bg-muted rounded w-3/4" />
    </div>
  );
  if (!data) return null;

  const { child, totalGames, badgeCount, subjects, daily, recent } = data;
  const maxSubjectStars = Math.max(...subjects.map((s) => Number(s.stars)), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="bg-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xl shrink-0">
            {child.avatarEmoji ?? '🦁'}
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {child.name}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-primary-foreground/70 text-sm">Age group: {child.age_group}</p>
              <ChildStreakBadge childId={childId} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star size={18} className="text-accent fill-accent" />
            <span className="text-2xl font-black text-primary-foreground">{child.total_stars}</span>
          </div>
          <p className="text-primary-foreground/70 text-xs">total stars</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* 1-to-1 Child Tutor Report */}
        <ParentTutorReport />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: 'Games played', value: totalGames },
            { icon: Medal, label: 'Badges earned', value: badgeCount },
            { icon: Star, label: 'Total stars', value: child.total_stars },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-muted rounded-2xl p-3 text-center">
              <Icon size={18} className="text-primary mx-auto mb-1" />
              <div className="text-xl font-black text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* 14-day chart */}
        <div>
          <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary" /> Stars — last 14 days
          </h3>
          <MiniChart daily={daily} />
        </div>

        {/* Subject breakdown */}
        {subjects.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-primary" /> Subject breakdown
            </h3>
            <div className="flex flex-col gap-3">
              {subjects.map((s) => {
                const meta = SUBJECT_META[s.subject] ?? { label: s.subject, color: 'bg-muted text-foreground border-border', icon: BookOpen };
                const Icon = meta.icon;
                return (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                        <Icon size={10} /> {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{s.games_played} games</span>
                    </div>
                    <StarBar value={Number(s.stars)} max={maxSubjectStars} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent games */}
        {recent.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" /> Recent games
            </h3>
            <div className="flex flex-col gap-2">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-muted rounded-xl px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-foreground capitalize">
                      {r.game_slug.replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{r.subject}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, si) => (
                      <Star
                        key={si}
                        size={14}
                        className={si < r.stars_earned ? 'text-accent fill-accent' : 'text-muted-foreground/30'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subjects.length === 0 && recent.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No games played yet.</p>
            <Link to="/games" className="text-primary font-bold text-sm hover:underline mt-1 inline-block">
              Browse games →
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Link
            to={`/hub/child/${childId}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <TrendingUp size={12} className="text-primary" /> Full progress
          </Link>
          <Link
            to="/certificates"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <Award size={12} className="text-primary" /> Certificate
          </Link>
          <Link
            to="/badges"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <Medal size={12} className="text-primary" /> Badges
          </Link>
          <Link
            to="/games"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <ExternalLink size={12} /> Play games
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ParentDashboardInner() {
  const { user } = useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadChildren() {
    console.log('ParentDashboard: Loading children data...');
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        console.log('ParentDashboard: Data loaded', d);
        setChildren((d as { children?: Child[] }).children ?? []);
      })
      .catch(err => {
        console.error('ParentDashboard: Load failed', err);
        setError(err.message || 'Failed to load children profiles.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadChildren(); }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-destructive mb-4">Connection Error</h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); loadChildren(); }}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg"
        >
          Try again
        </button>
        <Link to="/" className="block mt-6 text-sm font-bold text-muted-foreground hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Parent Dashboard — Sodafom</title>
        <meta name="description" content="Track your child's learning progress on Sodafom — stars earned, games played, subject breakdown and more." />
        <link rel="canonical" href="https://sodafom.uk/parent-dashboard" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Progress Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Parent'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/hub"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              ← Hub
            </Link>
            <WeeklyReportButton />
            <PrintReportButton />
            <Link
              to="/hub"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
            >
              <UserPlus size={14} /> Add child
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="text-primary animate-spin" />
          </div>
        )}

        {!loading && children.length === 0 && (
          <div className="bg-card rounded-3xl border-2 border-border p-10 text-center">
            <Trophy size={40} className="text-primary mx-auto mb-4" />
            <h2 className="text-xl font-black text-foreground mb-2">No children added yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Add a child profile to start tracking their progress.</p>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
            >
              <UserPlus size={14} /> Add child in Hub
            </Link>
          </div>
        )}

        {!loading && children.length > 0 && (
          <>
            <FamilySummaryCard children={children} />
            <div className="flex flex-col gap-8">
              {children.map((c) => (
                <ChildCard key={c.id} childId={c.id} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function ParentDashboardPage() {
  return (
    <ProtectedRoute redirectTo="/hub/login">
      <ParentDashboardInner />
    </ProtectedRoute>
  );
}
