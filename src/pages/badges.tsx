/**
 * /badges — Achievement badges page
 * Shows all badges with earned/locked state for the active child.
 */
import React, { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Lock, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { Link } from 'react-router';
import { RARITY_COLOURS } from '@/lib/badges';

interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
}

interface BadgeStats {
  gamesPlayed: number;
  totalStars: number;
  currentStreak: number;
  maxStreak: number;
  perfectGames: number;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'milestone', label: '🏅 Milestones' },
  { id: 'stars', label: '⭐ Stars' },
  { id: 'streak', label: '🔥 Streaks' },
  { id: 'subject', label: '📚 Subjects' },
  { id: 'social', label: '🤝 Social' },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.04 } } };

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const colours = RARITY_COLOURS[badge.rarity];
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={`relative rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-2 transition-all
        ${badge.earned ? `${colours.bg} ${colours.border}` : 'bg-muted/40 border-border opacity-60 grayscale'}`}
    >
      {/* Rarity label */}
      <span className={`absolute top-2 right-2 text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full ${colours.bg} ${colours.text} border ${colours.border}`}>
        {colours.label}
      </span>

      {/* Emoji / lock */}
      <div className="text-4xl mt-1">
        {badge.earned ? badge.emoji : <Lock size={28} className="text-muted-foreground mx-auto" />}
      </div>

      <div>
        <p className="font-black text-foreground text-sm leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          {badge.name}
        </p>
        <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{badge.desc}</p>
      </div>

      {badge.earned && (
        <span className="text-[10px] font-black text-green-700 bg-green-100 border border-green-300 rounded-full px-2 py-0.5">
          ✓ Earned
        </span>
      )}
    </motion.div>
  );
}

function BadgesContent() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');

  React.useEffect(() => {
    const raw = localStorage.getItem('sodafom_active_child');
    if (!raw) { setError('No active child selected. Go to the Hub to select a learner.'); setLoading(false); return; }
    const child = JSON.parse(raw) as { id: string };

    fetch(`${API_PREFIX}/badges?childId=${child.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: { badges: Badge[]; stats: BadgeStats }) => {
        setBadges(data.badges);
        setStats(data.stats);
      })
      .catch(() => setError('Failed to load badges'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = badges
    .filter(b => activeCategory === 'all' || b.category === activeCategory)
    .filter(b => showEarned === 'all' || (showEarned === 'earned' ? b.earned : !b.earned));

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <>
      <Helmet>
        <title>Achievement Badges — Sodafom | Earn Rewards for Learning</title>
        <meta name="description" content="Unlock 22 achievement badges by playing games, building streaks, and earning stars on Sodafom. Milestones, subject badges, and more." />
        <link rel="canonical" href="https://sodafom.uk/badges" />
        <meta property="og:title" content="Achievement Badges — Sodafom" />
        <meta property="og:description" content="Unlock 22 achievement badges by playing games, building streaks, and earning stars on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/badges" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Achievement Badges — Sodafom" />
        <meta name="twitter:description" content="Unlock 22 achievement badges by playing games, building streaks, and earning stars on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/badges#webpage',
          name: 'Achievement Badges — Sodafom',
          url: 'https://sodafom.uk/badges',
          description: 'Unlock 22 achievement badges by playing games, building streaks, and earning stars on Sodafom.',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <Link to="/hub" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
            ← Back to Hub
          </Link>

          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Achievement Badges
                </h1>
                {!loading && badges.length > 0 && (
                  <p className="text-muted-foreground text-sm font-bold">
                    {earnedCount} of {badges.length} earned
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats strip */}
          {stats && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Games played', value: stats.gamesPlayed, emoji: '🎮' },
                { label: 'Stars earned', value: stats.totalStars, emoji: '⭐' },
                { label: 'Best streak', value: `${stats.maxStreak}d`, emoji: '🔥' },
                { label: 'Perfect games', value: stats.perfectGames, emoji: '💎' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-xl font-black text-foreground">{value}</p>
                  <p className="text-muted-foreground text-xs font-bold">{label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Progress bar */}
          {badges.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="mb-6">
              <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{earnedCount}/{badges.length}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${badges.length ? (earnedCount / badges.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* How to earn explainer */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.12 }}
            className="mb-8 rounded-2xl border border-border bg-muted/50 p-5">
            <p className="font-black text-foreground text-sm mb-3">How to earn badges</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { emoji: '🎮', text: 'Play games — earn stars and unlock milestone badges' },
                { emoji: '🔥', text: 'Build a daily streak — log in and play every day' },
                { emoji: '💎', text: 'Score 3 stars on a game — earn Perfect Game badges' },
                { emoji: '📚', text: 'Play across all subjects — unlock Subject Explorer badges' },
              ].map(tip => (
                <div key={tip.text} className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">{tip.emoji}</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat: { id: string; label: string }) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors border
                  ${activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Earned/locked toggle */}
          <div className="flex gap-2 mb-6">
            {(['all', 'earned', 'locked'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setShowEarned(opt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors
                  ${showEarned === opt ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center">
              <p className="text-destructive font-bold text-sm">{error}</p>
              <Link to="/hub" className="mt-3 inline-block text-primary font-black text-sm underline">Go to Hub</Link>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {/* Badge grid */}
          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <ChevronDown size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No badges match this filter.</p>
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  {filtered.map((badge, i) => (
                    <BadgeCard key={badge.id} badge={badge} index={i} />
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function BadgesPage() {
  return (
    <ProtectedRoute>
      <BadgesContent />
    </ProtectedRoute>
  );
}
