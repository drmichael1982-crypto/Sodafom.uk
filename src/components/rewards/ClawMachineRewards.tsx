import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BookOpen, ChevronLeft, ChevronRight, Gift, RotateCcw, Sparkles } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useSession } from '@/lib/auth/auth-client';
import { clampClawPosition } from '@/lib/claw-machine';

interface Child {
  id: number;
  name: string;
  avatarEmoji?: string;
}

interface RewardCharacter {
  id: number;
  name: string;
  emoji: string;
  unlocked: boolean;
}

interface CollectionPrize {
  playToken: string;
  characterId: number;
  name: string;
  emoji: string;
  unlockedAt: string | null;
}

interface ClawMachineState {
  successfulLearningSessions: number;
  earnedTurns: number;
  usedTurns: number;
  availableTurns: number;
  sessionsTowardsNextTurn: number;
  sessionsUntilNextTurn: number;
  availablePrizeCount: number;
  collection: CollectionPrize[];
}

type Phase = 'idle' | 'claiming' | 'grabbing' | 'carrying' | 'dropping' | 'opening' | 'won';

const phaseMessage: Record<Phase, string> = {
  idle: 'Move the claw, then press Grab a Prize!',
  claiming: 'Protecting your learning-earned turn…',
  grabbing: 'Claw going down…',
  carrying: 'Great grab! Carrying your prize…',
  dropping: 'Into the prize chute…',
  opening: 'Opening your surprise…',
  won: 'Brilliant! Your prize is in your collection book.',
};

function makePlayToken(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {}
  return `claw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function pendingKey(childId: number) {
  return `sodafom-claw-pending-${childId}`;
}

function readPendingToken(childId: number): string | null {
  try {
    return localStorage.getItem(pendingKey(childId));
  } catch {
    return null;
  }
}

function rememberPendingToken(childId: number, token: string) {
  try {
    localStorage.setItem(pendingKey(childId), token);
  } catch {}
}

function clearPendingToken(childId: number) {
  try {
    localStorage.removeItem(pendingKey(childId));
  } catch {}
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export default function ClawMachineRewards() {
  const sessionData = useSession();
  const reducedMotion = useReducedMotion();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [characters, setCharacters] = useState<RewardCharacter[]>([]);
  const [claw, setClaw] = useState<ClawMachineState | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [clawX, setClawX] = useState(50);
  const [prize, setPrize] = useState<CollectionPrize | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [networkRetryProtected, setNetworkRetryProtected] = useState(false);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? null,
    [children, selectedChildId],
  );

  const loadClawState = useCallback(async (childId: number, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`${API_PREFIX}/rewards/characters?childId=${childId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Rewards could not be loaded.');
      const data = await response.json() as {
        characters?: RewardCharacter[];
        clawMachine?: ClawMachineState | null;
      };
      setCharacters(data.characters ?? []);
      setClaw(data.clawMachine ?? null);
      setMessage(data.clawMachine ? null : 'The claw machine is having a rest. Your learning rewards are safe.');
      setNetworkRetryProtected(Boolean(readPendingToken(childId)));
    } catch {
      setMessage('The claw machine could not connect. Your turns have not been changed.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionData?.user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_PREFIX}/children`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('children unavailable')))
      .then((data: { children?: Child[] }) => {
        if (cancelled) return;
        const nextChildren = data.children ?? [];
        setChildren(nextChildren);
        setSelectedChildId((current) => current ?? nextChildren[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('The claw machine could not load a child profile.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionData?.user]);

  useEffect(() => {
    if (!selectedChildId) return;
    setPrize(null);
    setPhase('idle');
    void loadClawState(selectedChildId);
  }, [selectedChildId, loadClawState]);

  if (!sessionData?.user) return null;

  const moveClaw = (delta: number) => {
    if (playing) return;
    setClawX((current) => clampClawPosition(current + delta));
  };

  const animateWin = async (wonPrize: CollectionPrize) => {
    setPrize(wonPrize);
    if (reducedMotion) {
      setPhase('won');
      return;
    }
    setPhase('grabbing');
    await sleep(550);
    setPhase('carrying');
    await sleep(650);
    setPhase('dropping');
    await sleep(500);
    setPhase('opening');
    await sleep(550);
    setPhase('won');
  };

  const play = async () => {
    if (!selectedChildId || !claw || playing || claw.availableTurns <= 0 || claw.availablePrizeCount <= 0) return;

    setPlaying(true);
    setMessage(null);
    setPrize(null);
    setPhase('claiming');

    // If a previous request lost its response during a connection drop, reuse
    // the same token. The server will return the original prize without spending
    // another turn.
    const existingPending = readPendingToken(selectedChildId);
    const playToken = existingPending ?? makePlayToken();
    rememberPendingToken(selectedChildId, playToken);
    setNetworkRetryProtected(Boolean(existingPending));

    let responseReceived = false;
    try {
      const response = await fetch(`${API_PREFIX}/rewards/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          childId: selectedChildId,
          source: 'claw',
          playToken,
        }),
      });
      responseReceived = true;
      const data = await response.json() as {
        error?: string;
        code?: string;
        prize?: { characterId: number; name: string; emoji: string; unlockedAt?: string | null };
        clawMachine?: ClawMachineState;
      };

      // An HTTP response tells us the server reached a definite outcome. Only an
      // ambiguous network failure keeps the retry token.
      clearPendingToken(selectedChildId);
      setNetworkRetryProtected(false);

      if (!response.ok || !data.prize || !data.clawMachine) {
        setPhase('idle');
        setClaw(data.clawMachine ?? claw);
        setMessage(data.error ?? 'That turn could not start. Your turn was not used.');
        return;
      }

      setClaw(data.clawMachine);
      const wonPrize: CollectionPrize = {
        playToken,
        characterId: Number(data.prize.characterId),
        name: data.prize.name,
        emoji: data.prize.emoji,
        unlockedAt: data.prize.unlockedAt ?? new Date().toISOString(),
      };
      await animateWin(wonPrize);
      await loadClawState(selectedChildId, false);
      window.dispatchEvent(new CustomEvent('sodafom:rewards-updated', {
        detail: { childId: selectedChildId, characterId: wonPrize.characterId },
      }));
    } catch {
      setPhase('idle');
      if (!responseReceived) {
        setNetworkRetryProtected(true);
        setMessage('The connection dropped. Tap “Try protected turn” — the same turn will be checked safely, not spent twice.');
      } else {
        clearPendingToken(selectedChildId);
        setNetworkRetryProtected(false);
        setMessage('The claw machine could not finish. Your saved rewards are still safe.');
      }
    } finally {
      setPlaying(false);
    }
  };

  const resetCelebration = () => {
    setPrize(null);
    setPhase('idle');
  };

  const availablePreview = characters.filter((character) => !character.unlocked).slice(0, 8);
  const noTurns = !claw || claw.availableTurns <= 0;
  const collectionComplete = Boolean(claw && claw.availablePrizeCount <= 0);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-4 sm:px-6" aria-labelledby="claw-machine-title">
      <div className="overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-card shadow-xl">
        <div className="bg-gradient-to-r from-primary/15 via-accent/15 to-secondary/15 px-5 py-6 text-center sm:px-8">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm" aria-hidden="true">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <h2 id="claw-machine-title" className="text-2xl font-black text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
            Learning Reward Claw Machine
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-muted-foreground sm:text-base">
            Complete learning to earn turns. Every usable turn wins a digital reward for your collection — no money and no empty grabs.
          </p>
        </div>

        {children.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 border-b border-border px-4 py-4" aria-label="Choose child for claw rewards">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                disabled={playing}
                onClick={() => setSelectedChildId(child.id)}
                className={`min-h-11 rounded-full px-4 py-2 text-sm font-black transition ${selectedChildId === child.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'}`}
              >
                <span aria-hidden="true">{child.avatarEmoji ?? '⭐'} </span>{child.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center font-bold text-muted-foreground" role="status">Loading learning rewards…</div>
        ) : !selectedChild ? (
          <div className="p-10 text-center">
            <p className="font-black text-foreground">Add a child profile to start earning claw turns.</p>
          </div>
        ) : (
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.3fr_0.9fr] lg:p-8">
            <div>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-center">
                  <p className="text-3xl font-black text-primary">{claw?.availableTurns ?? 0}</p>
                  <p className="text-xs font-black text-foreground">Turns ready</p>
                </div>
                <div className="rounded-2xl bg-accent/10 p-3 text-center">
                  <p className="text-3xl font-black text-foreground">{claw?.earnedTurns ?? 0}</p>
                  <p className="text-xs font-black text-foreground">Turns earned</p>
                </div>
                <div className="rounded-2xl bg-secondary/10 p-3 text-center">
                  <p className="text-3xl font-black text-foreground">{claw?.successfulLearningSessions ?? 0}</p>
                  <p className="text-xs font-black text-foreground">Learning wins</p>
                </div>
                <div className="rounded-2xl bg-muted p-3 text-center">
                  <p className="text-3xl font-black text-foreground">{claw?.collection.length ?? 0}</p>
                  <p className="text-xs font-black text-foreground">Claw prizes</p>
                </div>
              </div>

              <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border-4 border-primary/50 bg-gradient-to-b from-sky-100 via-cyan-50 to-indigo-100 p-4 shadow-inner sm:min-h-[460px] sm:p-6">
                <div className="absolute inset-x-5 top-4 h-3 rounded-full bg-slate-700/80" aria-hidden="true" />

                <motion.div
                  className="absolute top-5 z-20 -translate-x-1/2"
                  animate={{
                    left: phase === 'carrying' || phase === 'dropping' ? '78%' : `${clawX}%`,
                    y: phase === 'grabbing' ? 125 : phase === 'dropping' ? 205 : 0,
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeInOut' }}
                  aria-hidden="true"
                >
                  <div className="mx-auto h-16 w-2 rounded-full bg-slate-600" />
                  <div className="relative mx-auto h-14 w-16">
                    <div className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 rounded-b-full border-4 border-slate-700 border-t-0" />
                    <div className="absolute left-1 top-5 h-8 w-4 rotate-[25deg] rounded-b-full border-b-4 border-l-4 border-slate-700" />
                    <div className="absolute right-1 top-5 h-8 w-4 -rotate-[25deg] rounded-b-full border-b-4 border-r-4 border-slate-700" />
                  </div>
                </motion.div>

                <div className="absolute inset-x-5 bottom-20 flex min-h-28 flex-wrap items-end justify-center gap-2 rounded-3xl border-2 border-white/70 bg-white/45 p-4 sm:gap-4" aria-label="Prizes inside the machine">
                  {availablePreview.length > 0 ? availablePreview.map((character, index) => (
                    <motion.div
                      key={character.id}
                      className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-card text-4xl shadow-md sm:h-20 sm:w-20 sm:text-5xl"
                      animate={reducedMotion ? undefined : { y: [0, index % 2 ? -4 : -2, 0] }}
                      transition={{ duration: 2 + (index % 3) * 0.3, repeat: Infinity }}
                      title={character.name}
                    >
                      {character.emoji}
                    </motion.div>
                  )) : (
                    <div className="rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-black text-slate-700">
                      Collection complete!
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 right-4 flex h-16 w-28 items-center justify-center rounded-t-2xl border-4 border-slate-700 bg-slate-800 text-xs font-black text-white sm:h-20 sm:w-36">
                  PRIZE CHUTE
                </div>

                <AnimatePresence>
                  {prize && (phase === 'dropping' || phase === 'opening' || phase === 'won') && (
                    <motion.div
                      key={`${prize.playToken}-${phase}`}
                      className="absolute bottom-8 right-12 z-30 flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-accent text-5xl shadow-2xl sm:right-20"
                      initial={reducedMotion ? false : { y: -130, scale: 0.65, rotate: -8 }}
                      animate={{ y: 0, scale: phase === 'opening' || phase === 'won' ? 1.15 : 1, rotate: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.45 }}
                      aria-hidden="true"
                    >
                      {phase === 'dropping' ? '🎁' : prize.emoji}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => moveClaw(-12)}
                  disabled={playing}
                  className="flex min-h-14 min-w-16 items-center justify-center rounded-2xl border-2 border-primary/30 bg-card text-primary shadow-sm transition hover:scale-105 disabled:opacity-40"
                  aria-label="Move claw left"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={() => void play()}
                  disabled={playing || noTurns || collectionComplete || !claw}
                  className="min-h-14 flex-1 rounded-2xl bg-primary px-4 py-3 text-base font-black text-primary-foreground shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-sm"
                >
                  {playing ? 'Claw is moving…' : networkRetryProtected ? 'Try protected turn' : 'Grab a Prize'}
                </button>
                <button
                  type="button"
                  onClick={() => moveClaw(12)}
                  disabled={playing}
                  className="flex min-h-14 min-w-16 items-center justify-center rounded-2xl border-2 border-primary/30 bg-card text-primary shadow-sm transition hover:scale-105 disabled:opacity-40"
                  aria-label="Move claw right"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>

              <div className="mt-3 min-h-12 text-center" aria-live="polite">
                <p className="font-black text-foreground">{phaseMessage[phase]}</p>
                {message && <p className="mt-1 text-sm font-semibold text-muted-foreground">{message}</p>}
                {!message && noTurns && claw && (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {claw.sessionsUntilNextTurn} more successful learning {claw.sessionsUntilNextTurn === 1 ? 'session' : 'sessions'} earns the next turn.
                  </p>
                )}
                {!message && collectionComplete && (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">You have collected every available reward. Your unused turns stay safe.</p>
                )}
              </div>

              {phase === 'won' && prize && (
                <div className="mt-3 flex justify-center">
                  <button type="button" onClick={resetCelebration} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-black text-foreground">
                    <RotateCcw className="h-4 w-4" /> Back to machine
                  </button>
                </div>
              )}
            </div>

            <aside className="rounded-[2rem] border-2 border-border bg-muted/30 p-5 sm:p-6" aria-labelledby="claw-collection-title">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 id="claw-collection-title" className="text-xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Prize Collection Book</h3>
                  <p className="text-xs font-semibold text-muted-foreground">Rewards won by {selectedChild.name}</p>
                </div>
              </div>

              {claw?.collection.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  {claw.collection.map((item, index) => (
                    <motion.div
                      key={`${item.playToken}-${item.characterId}`}
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.3) }}
                      className="rounded-2xl border-2 border-border bg-card p-3 text-center shadow-sm"
                    >
                      <div className="text-4xl" aria-hidden="true">{item.emoji}</div>
                      <p className="mt-1 text-xs font-black text-foreground">{item.name}</p>
                      <p className="mt-1 text-[10px] font-bold text-muted-foreground">In your collection</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-black text-foreground">Your first claw prize will appear here.</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">Keep learning to earn a turn.</p>
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-card p-4 text-sm">
                <p className="font-black text-foreground">How turns work</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
                  Every 3 successful learning sessions earns 1 claw turn. Turns cannot be bought and prizes have no cash value. Connection retries reuse the same protected turn.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
