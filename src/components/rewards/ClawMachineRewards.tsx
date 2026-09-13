import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Gift, Sparkles, Trophy } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useSession } from '@/lib/auth/auth-client';
import {
  CLAW_PRIZES,
  CLAW_STARS_PER_TURN,
  ClawProgress,
  awardClawPrize,
  availableClawTurns,
  chooseClawPrize,
  createInitialClawProgress,
  normaliseClawProgress,
  syncClawProgress,
} from '@/lib/claw-rewards';

interface Child {
  id: number;
  name: string;
  avatarEmoji: string;
  totalStars: number;
}

const STORAGE_PREFIX = 'sodafom:claw-machine:v1:';

type MachinePhase = 'ready' | 'dropping' | 'opening' | 'won';

function storageKey(childId: number) {
  return `${STORAGE_PREFIX}${childId}`;
}

function loadProgress(child: Child): ClawProgress {
  if (typeof window === 'undefined') return createInitialClawProgress(child.totalStars);
  try {
    const raw = window.localStorage.getItem(storageKey(child.id));
    if (!raw) return createInitialClawProgress(child.totalStars);
    return normaliseClawProgress(JSON.parse(raw), child.totalStars);
  } catch {
    return createInitialClawProgress(child.totalStars);
  }
}

function persistProgress(childId: number, progress: ClawProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(childId), JSON.stringify(progress));
  } catch {
    // Storage can be unavailable in strict/private browser modes. The game still works for this session.
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ClawMachineRewards() {
  const sessionData = useSession();
  const reduceMotion = useReducedMotion();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [progress, setProgress] = useState<ClawProgress | null>(null);
  const [clawPosition, setClawPosition] = useState(1);
  const [phase, setPhase] = useState<MachinePhase>('ready');
  const [wonPrizeId, setWonPrizeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!sessionData?.user) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load children');
        return response.json() as Promise<{ children?: Child[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const kids = data.children ?? [];
        setChildren(kids);
        setSelectedChildId((current) => current && kids.some((kid) => kid.id === current) ? current : kids[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [sessionData?.user]);

  const selectedChild = children.find((child) => child.id === selectedChildId) ?? null;

  useEffect(() => {
    if (!selectedChild) {
      setProgress(null);
      return;
    }
    const next = loadProgress(selectedChild);
    setProgress(next);
    persistProgress(selectedChild.id, next);
    setPhase('ready');
    setWonPrizeId(null);
    setClawPosition(1);
  }, [selectedChild?.id]);

  useEffect(() => {
    if (!selectedChild || !progress) return;
    const synced = syncClawProgress(progress, selectedChild.totalStars);
    if (
      synced.lastKnownStars !== progress.lastKnownStars ||
      synced.starRemainder !== progress.starRemainder ||
      synced.earnedTurns !== progress.earnedTurns
    ) {
      setProgress(synced);
      persistProgress(selectedChild.id, synced);
    }
  }, [selectedChild?.totalStars, selectedChild?.id]);

  const turns = progress ? availableClawTurns(progress) : 0;
  const wonPrize = wonPrizeId ? CLAW_PRIZES.find((prize) => prize.id === wonPrizeId) ?? null : null;
  const collectedCount = progress ? Object.keys(progress.collection).filter((id) => (progress.collection[id] ?? 0) > 0).length : 0;
  const collection = useMemo(
    () => CLAW_PRIZES.map((prize) => ({ prize, count: progress?.collection[prize.id] ?? 0 })),
    [progress],
  );

  const moveClaw = (direction: -1 | 1) => {
    if (phase !== 'ready') return;
    setClawPosition((current) => Math.min(2, Math.max(0, current + direction)));
  };

  const play = async () => {
    if (!selectedChild || !progress || turns <= 0 || phase !== 'ready') return;

    const playNumber = progress.spentTurns + 1;
    const prize = chooseClawPrize(selectedChild.id, playNumber, progress.collection);
    const next = awardClawPrize(progress, prize);

    setPhase('dropping');
    setWonPrizeId(null);
    await delay(reduceMotion ? 80 : 650);
    setWonPrizeId(prize.id);
    setPhase('opening');
    await delay(reduceMotion ? 80 : 650);

    setProgress(next);
    persistProgress(selectedChild.id, next);
    setPhase('won');
  };

  const resetForNextTurn = () => {
    setWonPrizeId(null);
    setPhase('ready');
  };

  if (!sessionData?.user || (children.length === 0 && !loading && !loadError)) return null;

  return (
    <section aria-labelledby="claw-machine-heading" className="border-t border-border bg-gradient-to-b from-background to-primary/5 pb-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent-foreground mb-2">
              <Sparkles size={14} /> Learning reward
            </div>
            <h2 id="claw-machine-heading" className="text-2xl sm:text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Archie&apos;s Learning Claw Machine
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Every {CLAW_STARS_PER_TURN} stars learned earns a turn. Every turn wins a virtual prize for the collection book — no purchases and no real-world prizes.
            </p>
          </div>
          {selectedChild && progress && (
            <div className="rounded-2xl border-2 border-accent/40 bg-accent/10 px-4 py-3 text-center min-w-32">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Turns ready</p>
              <p className="text-3xl font-black text-foreground">{turns}</p>
              <p className="text-xs text-muted-foreground">🎟️ earned by learning</p>
            </div>
          )}
        </div>

        {children.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-5" aria-label="Choose child for claw machine">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`min-h-11 px-4 py-2 rounded-2xl border-2 text-sm font-black transition-colors ${selectedChildId === child.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40'}`}
              >
                {child.avatarEmoji} {child.name}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="rounded-3xl border-2 border-border bg-card p-8 text-center text-muted-foreground font-bold">Loading the claw machine…</div>
        )}

        {loadError && !loading && (
          <div className="rounded-3xl border-2 border-border bg-card p-8 text-center">
            <p className="font-black text-foreground">The claw machine could not load right now.</p>
            <p className="text-sm text-muted-foreground mt-1">Your normal rewards are still safe. Try again after reconnecting.</p>
          </div>
        )}

        {selectedChild && progress && !loading && !loadError && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-primary/30 bg-gradient-to-b from-sky-100 via-white to-accent/10 shadow-xl">
                <div className="flex items-center justify-between gap-3 bg-primary px-5 py-3 text-primary-foreground">
                  <div className="font-black" style={{ fontFamily: 'var(--font-heading)' }}>Prize Grabber</div>
                  <div className="text-xs font-bold rounded-full bg-white/15 px-3 py-1">{selectedChild.name} • {turns} turn{turns === 1 ? '' : 's'}</div>
                </div>

                <div className="relative h-80 sm:h-96 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-3 bg-foreground/10" />
                  <motion.div
                    className="absolute top-0 z-20 flex flex-col items-center"
                    animate={{ left: `${[18, 50, 82][clawPosition]}%`, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <div className="w-1.5 h-20 bg-foreground/40" />
                    <motion.div
                      className="text-5xl drop-shadow-md select-none"
                      aria-hidden="true"
                      animate={phase === 'dropping' ? { y: reduceMotion ? 30 : 155 } : { y: 0 }}
                      transition={{ duration: reduceMotion ? 0.08 : 0.55, ease: 'easeInOut' }}
                    >
                      🦾
                    </motion.div>
                  </motion.div>

                  <div className="absolute inset-x-5 bottom-6 grid grid-cols-4 sm:grid-cols-8 gap-2 items-end" aria-hidden="true">
                    {CLAW_PRIZES.map((prize, index) => (
                      <motion.div
                        key={prize.id}
                        className="aspect-square rounded-full border-2 border-white/80 shadow-md bg-gradient-to-br from-white to-accent/30 flex items-center justify-center text-2xl sm:text-3xl"
                        animate={reduceMotion ? undefined : { y: [0, -(index % 3) * 2, 0], rotate: [0, index % 2 ? 2 : -2, 0] }}
                        transition={{ duration: 2.2 + (index % 3) * 0.2, repeat: Infinity, repeatDelay: 1 }}
                      >
                        {prize.emoji}
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {(phase === 'opening' || phase === 'won') && wonPrize && (
                      <motion.div
                        className="absolute inset-0 z-30 flex items-center justify-center bg-background/85 backdrop-blur-sm p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          initial={reduceMotion ? false : { scale: 0.5, rotate: -8 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="max-w-sm w-full rounded-3xl border-4 border-accent bg-card p-6 text-center shadow-2xl"
                        >
                          <div className="text-7xl mb-3">{phase === 'opening' ? '🎁' : wonPrize.emoji}</div>
                          {phase === 'opening' ? (
                            <p className="font-black text-xl text-foreground">Opening your prize…</p>
                          ) : (
                            <>
                              <p className="text-xs font-black uppercase tracking-widest text-accent-foreground">You won!</p>
                              <h3 className="text-2xl font-black text-foreground mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{wonPrize.name}</h3>
                              <p className="text-sm text-muted-foreground mt-2">{wonPrize.description}</p>
                              <p className="text-xs font-bold text-primary mt-3">Added to {selectedChild.name}&apos;s collection book ✓</p>
                              <button type="button" onClick={resetForNextTurn} className="mt-5 min-h-12 w-full rounded-2xl bg-primary text-primary-foreground font-black hover:opacity-90 active:scale-95 transition-all">
                                {turns > 0 ? 'Play another turn' : 'Back to collection'}
                              </button>
                            </>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t-2 border-primary/20 bg-card p-4">
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <button type="button" onClick={() => moveClaw(-1)} disabled={phase !== 'ready' || clawPosition === 0} className="min-h-12 rounded-2xl border-2 border-border bg-background font-black flex items-center justify-center gap-1 disabled:opacity-40 hover:border-primary/50" aria-label="Move claw left">
                      <ChevronLeft size={20} /> Left
                    </button>
                    <button type="button" onClick={play} disabled={phase !== 'ready' || turns <= 0} className="min-h-12 rounded-2xl bg-accent text-accent-foreground font-black shadow-md disabled:opacity-40 hover:brightness-95 active:scale-95 transition-all" aria-label="Drop claw">
                      {phase === 'ready' ? 'DROP' : '…'}
                    </button>
                    <button type="button" onClick={() => moveClaw(1)} disabled={phase !== 'ready' || clawPosition === 2} className="min-h-12 rounded-2xl border-2 border-border bg-background font-black flex items-center justify-center gap-1 disabled:opacity-40 hover:border-primary/50" aria-label="Move claw right">
                      Right <ChevronRight size={20} />
                    </button>
                  </div>
                  {turns <= 0 && phase === 'ready' && (
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      Keep learning — {CLAW_STARS_PER_TURN - progress.starRemainder} more star{CLAW_STARS_PER_TURN - progress.starRemainder === 1 ? '' : 's'} earns the next turn.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="h-full rounded-3xl border-2 border-border bg-card p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center"><Gift size={19} className="text-accent-foreground" /></div>
                    <div>
                      <h3 className="font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Prize collection book</h3>
                      <p className="text-xs text-muted-foreground">{collectedCount} of {CLAW_PRIZES.length} prizes discovered</p>
                    </div>
                  </div>
                  {collectedCount === CLAW_PRIZES.length && <Trophy size={22} className="text-accent-foreground" aria-label="Collection complete" />}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {collection.map(({ prize, count }) => {
                    const owned = count > 0;
                    return (
                      <div key={prize.id} className={`relative rounded-2xl border-2 p-3 text-center min-h-28 flex flex-col items-center justify-center ${owned ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/50'}`}>
                        {count > 1 && <span className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground text-xs font-black px-2 py-0.5">×{count}</span>}
                        <div className={`text-4xl ${owned ? '' : 'grayscale opacity-25'}`}>{owned ? prize.emoji : '❓'}</div>
                        <p className={`text-xs font-black mt-1 ${owned ? 'text-foreground' : 'text-muted-foreground'}`}>{owned ? prize.name : 'Mystery prize'}</p>
                        {owned && <p className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground mt-0.5">{prize.rarity}</p>}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl bg-muted p-3 text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Fair play:</strong> every turn wins a prize, and the machine gives unseen prizes first so children can build the full collection before duplicates appear.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
