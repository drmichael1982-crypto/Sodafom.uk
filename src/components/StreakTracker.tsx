/**
 * StreakTracker
 *
 * Tracks daily login/play streaks in localStorage.
 * Shows a flame badge + streak count. Used on homepage and hub.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';

const STREAK_KEY = 'sodafom_streak';
const LAST_VISIT_KEY = 'sodafom_last_visit';
const LONGEST_KEY = 'sodafom_longest_streak';

interface StreakData {
  count: number;
  lastVisit: string; // ISO date string YYYY-MM-DD
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [isNew, setIsNew] = useState(false); // true if streak just incremented today

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const today = todayStr();
    const yesterday = yesterdayStr();

    let data: StreakData = { count: 0, lastVisit: '' };
    try {
      const raw = localStorage.getItem(STREAK_KEY);
      if (raw) data = JSON.parse(raw) as StreakData;
    } catch { /* ignore */ }

    const lastVisit = localStorage.getItem(LAST_VISIT_KEY) ?? data.lastVisit;
    const prevLongest = parseInt(localStorage.getItem(LONGEST_KEY) ?? '0', 10);

    let newCount = data.count;
    if (lastVisit === today) {
      // Already visited today — just show current streak
      setStreak(data.count);
    } else if (lastVisit === yesterday) {
      // Visited yesterday — extend streak
      newCount = data.count + 1;
      const updated: StreakData = { count: newCount, lastVisit: today };
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      localStorage.setItem(LAST_VISIT_KEY, today);
      setStreak(newCount);
      setIsNew(true);
    } else {
      // Gap — reset streak to 1
      newCount = 1;
      const updated: StreakData = { count: 1, lastVisit: today };
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      localStorage.setItem(LAST_VISIT_KEY, today);
      setStreak(1);
      if (lastVisit !== '') setIsNew(true);
    }

    // Update longest streak
    const newLongest = Math.max(prevLongest, newCount);
    localStorage.setItem(LONGEST_KEY, String(newLongest));
    setLongest(newLongest);
  }, []);

  return { streak, longest, isNew };
}

interface StreakBadgeProps {
  /** 'compact' = small inline badge; 'card' = larger card widget */
  variant?: 'compact' | 'card';
}

export default function StreakBadge({ variant = 'compact' }: StreakBadgeProps) {
  const { streak, longest, isNew } = useStreak();

  if (streak === 0) return null;

  const flameColor =
    streak >= 30 ? 'text-purple-500' :
    streak >= 14 ? 'text-red-500' :
    streak >= 7  ? 'text-orange-500' :
    streak >= 3  ? 'text-yellow-500' :
    'text-orange-400';

  const label =
    streak >= 30 ? '🔥 Legendary!' :
    streak >= 14 ? '🔥 On fire!' :
    streak >= 7  ? '🔥 Hot streak!' :
    streak >= 3  ? '🔥 Keep it up!' :
    'Day streak';

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200"
      >
        <motion.div
          animate={isNew ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Flame size={16} className={flameColor} fill="currentColor" />
        </motion.div>
        <span className="font-black text-sm text-orange-700">{streak}</span>
        <span className="text-xs font-semibold text-orange-600 hidden sm:inline">day streak</span>
      </motion.div>
    );
  }

  // Card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-4"
    >
      <div className="flex items-center gap-4 mb-3">
        <motion.div
          animate={isNew ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : { scale: [1, 1.05, 1] }}
          transition={isNew ? { duration: 0.7, delay: 0.2 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          className="shrink-0"
        >
          <Flame size={40} className={flameColor} fill="currentColor" />
        </motion.div>
        <div className="flex-1">
          <p className="font-black text-2xl text-orange-700 leading-none">{streak} day{streak !== 1 ? 's' : ''}</p>
          <p className="text-sm font-bold text-orange-600 mt-0.5">{label}</p>
          {isNew && (
            <AnimatePresence>
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-green-600 font-bold mt-1"
              >
                ✅ Streak extended today!
              </motion.p>
            </AnimatePresence>
          )}
        </div>
        {/* Longest streak badge */}
        {longest > 0 && (
          <div className="shrink-0 text-center bg-white/70 rounded-xl px-3 py-2 border border-orange-200">
            <p className="text-xs text-muted-foreground font-bold leading-tight">Best</p>
            <p className="font-black text-lg text-orange-700 leading-none">{longest}</p>
            <p className="text-xs text-muted-foreground font-bold leading-tight">days</p>
          </div>
        )}
      </div>
      {/* Mini day dots — last 7 days */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-semibold">Last 7 days</p>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const active = i >= 7 - Math.min(streak, 7);
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 h-4 rounded-full border-2 ${active ? 'bg-orange-400 border-orange-500' : 'bg-muted border-border'}`}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
