/**
 * HubStatsBar — compact stats strip shown at the top of the hub dashboard.
 * Shows: total stars across all children, current streak, games played this week.
 * Fetches from existing /api/children and /api/children/:id/progress endpoints.
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Flame, Gamepad2, Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { API_PREFIX } from '@/lib/config';

interface StatsData {
  totalStars: number;
  streakDays: number;
  gamesThisWeek: number;
  badgeCount: number;
  topSubject: string | null;
}

export default function HubStatsBar() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    // Fetch children to sum up stars
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then(r => r.json())
      .then((children: { id: number; total_stars: number; name: string }[]) => {
        if (!Array.isArray(children) || children.length === 0) return;
        const totalStars = children.reduce((sum, c) => sum + (c.total_stars ?? 0), 0);

        // Fetch streak from first child's progress
        fetch(`${API_PREFIX}/children/${children[0].id}/progress?summary=1`, { credentials: 'include' })
          .then(r => r.ok ? r.json() : null)
          .then((prog: { streakDays?: number; gamesThisWeek?: number; badgeCount?: number; topSubject?: string } | null) => {
            setStats({
              totalStars,
              streakDays: prog?.streakDays ?? 0,
              gamesThisWeek: prog?.gamesThisWeek ?? 0,
              badgeCount: prog?.badgeCount ?? 0,
              topSubject: prog?.topSubject ?? null,
            });
          })
          .catch(() => {
            setStats({ totalStars, streakDays: 0, gamesThisWeek: 0, badgeCount: 0, topSubject: null });
          });
      })
      .catch(() => {/* silently ignore */});
  }, []);

  if (!stats) return null;

  const items = [
    {
      icon: <Star size={18} className="fill-accent text-accent" />,
      value: Number(stats.totalStars ?? 0).toLocaleString(),
      label: 'Total stars',
      href: '/star-bank',
      color: 'hover:bg-accent/10',
    },
    {
      icon: <Flame size={18} className="text-orange-500" />,
      value: stats.streakDays > 0 ? `${stats.streakDays} day${stats.streakDays !== 1 ? 's' : ''}` : '—',
      label: 'Current streak',
      href: '/hub',
      color: 'hover:bg-orange-50',
    },
    {
      icon: <Gamepad2 size={18} className="text-primary" />,
      value: stats.gamesThisWeek > 0 ? String(stats.gamesThisWeek) : '—',
      label: 'Games this week',
      href: '/parent-dashboard',
      color: 'hover:bg-primary/5',
    },
    {
      icon: <Trophy size={18} className="text-secondary" />,
      value: stats.badgeCount > 0 ? String(stats.badgeCount) : '—',
      label: 'Badges earned',
      href: '/badges',
      color: 'hover:bg-secondary/5',
    },
    ...(stats.topSubject ? [{
      icon: <TrendingUp size={18} className="text-green-600" />,
      value: stats.topSubject.charAt(0).toUpperCase() + stats.topSubject.slice(1),
      label: 'Top subject',
      href: `/subjects/${stats.topSubject}`,
      color: 'hover:bg-green-50',
    }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6"
      role="region"
      aria-label="Your stats at a glance"
    >
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.href}
          className={`flex items-center gap-3 p-3 rounded-2xl bg-card border border-border transition-all ${item.color} group`}
        >
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <div className="min-w-0">
            <div className="font-black text-foreground text-base leading-tight truncate">{item.value}</div>
            <div className="text-muted-foreground text-xs truncate">{item.label}</div>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}
