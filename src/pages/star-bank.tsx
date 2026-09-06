import { useState, useEffect } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Star, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';

const siteUrl = 'https://sodafom.uk';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Child {
  id: number;
  name: string;
  totalStars: number;
  avatarEmoji: string | null;
  activeCharacterId: number | null;
}

interface Character {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  starCost: number;
  category: string;
  sortOrder: number;
  unlocked: boolean;
  active: boolean;
}

interface GameLevelRow {
  gameSlug: string;
  level: number;
  bestStars: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  hero: '🦸 Heroes',
  animal: '🐾 Animals',
  fantasy: '✨ Fantasy',
};

function StarBar({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < filled ? 'fill-accent text-accent' : 'fill-muted text-muted-foreground'}
        />
      ))}
    </span>
  );
}

// ── Star Bank Page ─────────────────────────────────────────────────────────────
export default function StarBankPage() {
  const { isAuthenticated } = useSession();
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [gameLevels, setGameLevels] = useState<GameLevelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load children list
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((data: Child[]) => {
        setChildren(data);
        if (data.length > 0) setActiveChildId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Load characters + game levels when active child changes
  useEffect(() => {
    if (!activeChildId) return;
    Promise.all([
      fetch(`${API_PREFIX}/rewards/characters?childId=${activeChildId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_PREFIX}/children/${activeChildId}/progress`, { credentials: 'include' }).then(r => r.ok ? r.json() : { recent: [] }),
    ]).then(([chars, prog]) => {
      setCharacters(chars as Character[]);
      // Build per-game best stars from recent activity
      const bySlug: Record<string, GameLevelRow> = {};
      if (prog?.recent) {
        for (const row of prog.recent as { gameSlug: string; starsEarned: number }[]) {
          if (!bySlug[row.gameSlug] || row.starsEarned > bySlug[row.gameSlug].bestStars) {
            bySlug[row.gameSlug] = { gameSlug: row.gameSlug, level: 1, bestStars: row.starsEarned };
          }
        }
      }
      setGameLevels(Object.values(bySlug));
    }).catch(() => {});
  }, [activeChildId]);

  const activeChild = children.find(c => c.id === activeChildId) ?? null;

  const handleUnlock = async (char: Character) => {
    if (!activeChild || char.unlocked || activeChild.totalStars < char.starCost) return;
    setUnlocking(char.id);
    try {
      const res = await fetch(`${API_PREFIX}/rewards/characters/${char.id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: activeChildId }),
      });
      if (res.ok) {
        setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, unlocked: true } : c));
        setChildren(prev => prev.map(c => c.id === activeChildId ? { ...c, totalStars: c.totalStars - char.starCost } : c));
        setToast(`🎉 ${char.name} unlocked!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch { /* ignore */ }
    setUnlocking(null);
  };

  const handleEquip = async (char: Character) => {
    if (!activeChild || !char.unlocked) return;
    try {
      await fetch(`${API_PREFIX}/rewards/characters/${char.id}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: activeChildId }),
      });
      setCharacters(prev => prev.map(c => ({ ...c, active: c.id === char.id })));
      setToast(`✅ ${char.name} is now your avatar!`);
      setTimeout(() => setToast(null), 2500);
    } catch { /* ignore */ }
  };

  // Group characters by category
  const byCategory = characters.reduce<Record<string, Character[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  // Stars progress toward next character
  const nextLocked = characters.filter(c => !c.unlocked).sort((a, b) => a.starCost - b.starCost)[0];
  const totalStars = activeChild?.totalStars ?? 0;
  const progressPct = nextLocked ? Math.min(100, Math.round((totalStars / nextLocked.starCost) * 100)) : 100;

  return (
    <>
      <Helmet>
        <title>Star Bank — Sodafom</title>
        <meta name="description" content="See your stars, unlock reward characters and track your game progress on Sodafom." />
        <link rel="canonical" href={`${siteUrl}/star-bank`} />
        <meta property="og:title" content="Star Bank — Sodafom" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
      </Helmet>

      <main className="min-h-screen bg-background pb-16">
        {/* Header banner */}
        <div className="hero-bg py-10 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="text-5xl mb-2">⭐</p>
            <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Star Bank
            </h1>
            <p className="text-white/80 text-sm font-semibold">Earn stars in games · Unlock characters · Show off your progress</p>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-6">

          {/* Not logged in */}
          {!isAuthenticated && (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔒</p>
              <h2 className="text-xl font-black text-foreground mb-2">Sign in to see your stars</h2>
              <p className="text-muted-foreground text-sm mb-6">Create a free account to save your progress and unlock reward characters.</p>
              <div className="flex justify-center gap-3">
                <Link to="/hub/login" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity">
                  Sign in
                </Link>
                <Link to="/hub/signup" className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-black text-sm hover:opacity-90 transition-opacity">
                  Sign up free
                </Link>
              </div>
            </div>
          )}

          {/* Loading */}
          {isAuthenticated && loading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}

          {/* Logged in content */}
          {isAuthenticated && !loading && (
            <>
              {/* Child switcher */}
              {children.length > 1 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setActiveChildId(child.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm border-2 transition-all ${
                        activeChildId === child.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-primary'
                      }`}
                    >
                      <span>{child.avatarEmoji ?? '⭐'}</span>
                      <span>{child.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No children */}
              {children.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">👶</p>
                  <p className="font-black text-foreground mb-2">No child profiles yet</p>
                  <Link to="/hub" className="text-primary font-bold text-sm underline">Go to My Hub to add a child</Link>
                </div>
              )}

              {activeChild && (
                <>
                  {/* Stars summary card */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="bg-card border-2 border-border rounded-2xl p-5 mb-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{activeChild.avatarEmoji ?? '⭐'}</span>
                        <div>
                          <p className="font-black text-foreground text-lg">{activeChild.name}</p>
                          <p className="text-muted-foreground text-xs">Total stars earned</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-accent">{totalStars.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-semibold">⭐ stars</p>
                      </div>
                    </div>

                    {/* Progress to next character */}
                    {nextLocked && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                          <span>Next unlock: {nextLocked.emoji} {nextLocked.name}</span>
                          <span>{totalStars} / {nextLocked.starCost} ⭐</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' as const }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progressPct}% there — keep playing!</p>
                      </div>
                    )}
                    {!nextLocked && characters.length > 0 && (
                      <p className="text-sm font-black text-green-600">🏆 All characters unlocked! You're a champion!</p>
                    )}
                  </motion.div>

                  {/* Game progress */}
                  {gameLevels.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                      className="bg-card border-2 border-border rounded-2xl p-5 mb-5 shadow-sm"
                    >
                      <h2 className="font-black text-foreground text-base mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                        🎮 Games played
                      </h2>
                      <div className="flex flex-col gap-2">
                        {gameLevels.slice(0, 10).map(g => (
                          <div key={g.gameSlug} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                            <div>
                              <p className="font-bold text-foreground text-sm capitalize">{g.gameSlug.replace(/-/g, ' ')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StarBar filled={g.bestStars} total={3} />
                              <Link
                                to={`/games/${g.gameSlug}`}
                                className="flex items-center gap-1 text-xs font-black text-primary hover:underline"
                              >
                                Play <ChevronRight size={12} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Characters by category */}
                  {Object.entries(byCategory)
                    .sort(([a], [b]) => (a === 'hero' ? -1 : b === 'hero' ? 1 : a.localeCompare(b)))
                    .map(([cat, chars], catIdx) => (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + catIdx * 0.08 }}
                        className="mb-5"
                      >
                        <h2 className="font-black text-foreground text-base mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                          {CATEGORY_LABELS[cat] ?? cat}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {chars.sort((a, b) => a.sortOrder - b.sortOrder).map(char => {
                            const canAfford = totalStars >= char.starCost;
                            const isUnlocking = unlocking === char.id;
                            return (
                              <motion.div
                                key={char.id}
                                whileHover={char.unlocked ? { scale: 1.03 } : canAfford ? { scale: 1.02 } : {}}
                                className={`relative bg-card border-2 rounded-2xl p-4 text-center shadow-sm transition-all ${
                                  char.active
                                    ? 'border-accent shadow-accent/20 shadow-md'
                                    : char.unlocked
                                    ? 'border-green-400'
                                    : canAfford
                                    ? 'border-primary cursor-pointer'
                                    : 'border-border opacity-70'
                                }`}
                              >
                                {/* Active badge */}
                                {char.active && (
                                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                    Active
                                  </span>
                                )}

                                <p className="text-4xl mb-1">{char.emoji}</p>
                                <p className="font-black text-foreground text-xs mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                                  {char.name}
                                </p>
                                <p className="text-muted-foreground text-[10px] leading-snug mb-2">{char.description}</p>

                                {/* Cost / status */}
                                <p className={`text-xs font-black mb-2 ${char.unlocked ? 'text-green-600' : canAfford ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {char.unlocked ? '✅ Unlocked' : `⭐ ${char.starCost} stars`}
                                </p>

                                {/* Action button */}
                                {char.unlocked ? (
                                  char.active ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-accent">
                                      <CheckCircle size={11} /> Equipped
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleEquip(char)}
                                      className="w-full py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:opacity-90 transition-opacity"
                                    >
                                      Equip
                                    </button>
                                  )
                                ) : canAfford ? (
                                  <button
                                    onClick={() => handleUnlock(char)}
                                    disabled={isUnlocking}
                                    className="w-full py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-black hover:opacity-90 transition-opacity disabled:opacity-60"
                                  >
                                    {isUnlocking ? 'Unlocking…' : 'Unlock now!'}
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                    <Lock size={10} /> {char.starCost - totalStars} more stars
                                  </span>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}

                  {/* CTA to play more */}
                  <div className="text-center mt-6">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity shadow-md"
                    >
                      <Star size={14} className="fill-accent text-accent" />
                      Play games to earn more stars
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border-2 border-accent rounded-2xl px-5 py-3 shadow-xl z-50 font-black text-foreground text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
