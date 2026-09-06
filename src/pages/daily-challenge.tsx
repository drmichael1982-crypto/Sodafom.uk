/**
 * /daily-challenge — One featured game per day with a 5-star bonus reward
 */
import React, { useEffect, useState, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '@/lib/auth/auth-client';
import { Star, Flame, Clock, Trophy, ChevronRight, Zap, CalendarDays } from 'lucide-react';

interface ChallengeData {
  game: { slug: string; title: string; subject: string };
  claimed: boolean;
  secondsLeft: number;
  date: string;
}

interface Child { id: number; name: string; total_stars: number }

interface ClaimHistory {
  date: string; // YYYY-MM-DD
  stars: number;
}

function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);

  React.useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1 font-mono text-lg font-black text-foreground">
      <Clock size={16} className="text-muted-foreground" />
      <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}

// 7-day streak calendar
function StreakCalendar({ history }: { history: ClaimHistory[] }) {
  const days: { key: string; label: string; claimed: boolean; stars: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = history.find(h => h.date === key);
    days.push({
      key,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      claimed: !!found,
      stars: found?.stars ?? 0,
    });
  }
  const streak = (() => {
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].claimed) count++;
      else break;
    }
    return count;
  })();

  return (
    <div className="bg-muted/40 rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
          <CalendarDays size={14} className="text-primary" /> Last 7 days
        </h3>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            <Flame size={12} /> {streak}-day streak!
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <motion.div
            key={d.key}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            title={d.claimed ? `${d.key}: +${d.stars}⭐ claimed` : `${d.key}: not claimed`}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
              d.claimed
                ? 'bg-primary/10 border-primary/30'
                : 'bg-background border-border opacity-50'
            }`}
          >
            <span className="text-[10px] font-bold text-muted-foreground">{d.label}</span>
            <span className="text-base">{d.claimed ? '⭐' : '○'}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const SUBJECT_COLORS: Record<string, string> = {
  maths: 'bg-blue-500',
  spelling: 'bg-purple-500',
  reading: 'bg-green-500',
  science: 'bg-orange-500',
};

export default function DailyChallengePage() {
  const { isAuthenticated } = useSession();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ stars: number; already: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);

  const loadChallenge = useCallback((childId?: number) => {
    const url = childId ? `${API_PREFIX}/daily-challenge?childId=${childId}` : `${API_PREFIX}/daily-challenge`;
    fetch(url, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setChallenge(d as ChallengeData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadChallenge();
    if (isAuthenticated) {
      fetch(`${API_PREFIX}/children`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          const kids = (d as { children?: Child[] }).children ?? [];
          setChildren(kids);
          if (kids.length) {
            setSelectedChild(kids[0].id);
            loadChallenge(kids[0].id);
            // Load claim history for first child
            fetch(`${API_PREFIX}/daily-challenge/history?childId=${kids[0].id}`, { credentials: 'include' })
              .then(r => r.json())
              .then(h => setClaimHistory((h as { history?: ClaimHistory[] }).history ?? []))
              .catch(() => {});
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, loadChallenge]);

  const handleClaim = async () => {
    if (!selectedChild || !challenge) return;
    setClaiming(true);
    try {
      const res = await fetch(`${API_PREFIX}/daily-challenge/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: selectedChild }),
      });
      const data = await res.json() as { stars: number; already_claimed: boolean };
      setClaimResult({ stars: data.stars, already: data.already_claimed });
      loadChallenge(selectedChild);
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const subjectColor = challenge ? (SUBJECT_COLORS[challenge.game.subject] ?? 'bg-primary') : 'bg-primary';

  return (
    <>
      <Helmet>
        <title>Daily Challenge — Sodafom | Earn 5 Bonus Stars Today</title>
        <meta name="description" content="Complete today's daily challenge game on Sodafom and earn 5 bonus stars! A new featured learning game every day for children aged 5–13." />
        <link rel="canonical" href="https://sodafom.uk/daily-challenge" />
        <meta property="og:title" content="Daily Challenge — Sodafom" />
        <meta property="og:description" content="Complete today's daily challenge game and earn 5 bonus stars! A new game every day for children aged 5–13." />
        <meta property="og:url" content="https://sodafom.uk/daily-challenge" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Daily Challenge — Sodafom" />
        <meta name="twitter:description" content="Complete today's daily challenge game and earn 5 bonus stars!" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sodafom.uk/daily-challenge#webpage',
          name: 'Daily Challenge — Sodafom',
          url: 'https://sodafom.uk/daily-challenge',
          description: 'Complete today\'s daily challenge game on Sodafom and earn 5 bonus stars!',
          isPartOf: { '@id': 'https://sodafom.uk/#website' },
          about: { '@id': 'https://sodafom.uk/#organization' },
        })}</script>
      </Helmet>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
            <Flame size={16} className="text-accent-foreground" />
            <span className="text-sm font-black text-foreground">Daily Challenge</span>
          </div>
          <h1 className="text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Today's Game
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete today's challenge to earn <strong className="text-primary">5 bonus stars!</strong>
          </p>
        </motion.div>

        {loading ? (
          <div className="bg-card rounded-3xl border-2 border-border p-10 animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
          </div>
        ) : challenge ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-sm"
          >
            {/* Game banner */}
            <div className={`${subjectColor} px-6 py-8 text-center`}>
              <div className="text-5xl mb-3">🎮</div>
              <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {challenge.game.title}
              </h2>
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                {challenge.game.subject}
              </span>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Bonus reward */}
              <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-2xl px-4 py-3">
                <Zap size={20} className="text-accent-foreground shrink-0" />
                <div>
                  <p className="text-sm font-black text-foreground">Bonus reward: 5 stars</p>
                  <p className="text-xs text-muted-foreground">Complete the game then claim your bonus below</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-between bg-muted rounded-2xl px-4 py-3">
                <span className="text-sm font-bold text-muted-foreground">New challenge in</span>
                <Countdown seconds={challenge.secondsLeft} />
              </div>

              {/* Streak calendar — shown when authenticated */}
              {isAuthenticated && (
                <StreakCalendar history={claimHistory} />
              )}

              {/* Child selector */}
              {isAuthenticated && children.length > 1 && (
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Claiming for</label>
                  <select
                    value={selectedChild ?? ''}
                    onChange={(e) => {
                      const id = parseInt(e.target.value, 10);
                      setSelectedChild(id);
                      loadChallenge(id);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-background text-foreground font-bold text-sm focus:outline-none focus:border-primary"
                  >
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  to={`/games/${challenge.game.slug}`}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                >
                  Play now <ChevronRight size={16} />
                </Link>

                {isAuthenticated && selectedChild && (
                  <AnimatePresence mode="wait">
                    {claimResult ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-2xl px-4 py-3 text-center font-black text-sm ${
                          claimResult.already
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/10 text-primary border border-primary/30'
                        }`}
                      >
                        {claimResult.already
                          ? '✓ Already claimed today — come back tomorrow!'
                          : `🎉 +${claimResult.stars} bonus stars claimed!`}
                      </motion.div>
                    ) : challenge.claimed ? (
                      <motion.div
                        key="claimed"
                        className="rounded-2xl px-4 py-3 text-center font-black text-sm bg-muted text-muted-foreground"
                      >
                        <Trophy size={14} className="inline mr-1" />
                        Bonus already claimed today
                      </motion.div>
                    ) : (
                      <motion.button
                        key="claim"
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-black text-sm hover:bg-primary/5 transition-colors disabled:opacity-60"
                      >
                        {claiming ? 'Claiming…' : '⭐ Claim 5 bonus stars'}
                      </motion.button>
                    )}
                  </AnimatePresence>
                )}

                {!isAuthenticated && (
                  <Link
                    to="/hub/login"
                    className="w-full py-3 rounded-2xl border-2 border-border text-muted-foreground font-bold text-sm hover:border-primary hover:text-primary transition-colors text-center"
                  >
                    Sign in to claim bonus stars
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Past challenges note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          A new challenge is set every day at midnight. Check back tomorrow!
        </p>
      </main>
    </>
  );
}
