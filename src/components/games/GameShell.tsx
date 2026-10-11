import CompletionScene from '@/components/CompletionScene';
import AppScreenPager from '@/components/AppScreenPager';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Star, Trophy, RotateCcw, Home, Zap, LogIn, LogOut, User, X, Award, Gift, MessageCircle } from 'lucide-react';
import { useNavigate, Link } from "react-router";
import { Helmet } from '@dr.pogodin/react-helmet';
import { useSession, signOut } from '@/lib/auth/auth-client';
import PaywallGate from './PaywallGate';
import ShareBar from '@/components/ShareBar';
import ActiveChildBanner from './ActiveChildBanner';
import CertificateModal from './CertificateModal';
import ConfettiCanvas from './ConfettiCanvas';
import { useCountUp } from '@/hooks/useCountUp';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useProgression } from '@/contexts/ProgressionContext';
export { useChildAge } from '@/hooks/useChildAge';
export type { AgeGroup } from '@/hooks/useChildAge';
import { getActiveChild } from '@/hooks/useChildAge';
import { API_PREFIX, ARCHIE_PREVIEW } from '@/lib/config';
import { isSoundEnabled, recordScopedGameStars, useArchieData } from '@/lib/archie/storage';
import { isGameForYear } from '@/lib/archie/game-age';
import { games as gamesContent } from 'virtual:content';
import SceneArtwork, { sceneForSubject } from '@/components/SceneArtwork';
import '@/pages/archie/sodafom-polish.css';
import { puzzleThemeStyle } from '@/lib/archie/puzzle-theme';

export interface GameResult {
  score: number; // 0–100
  correct: number;
  total: number;
  stars: number; // 0–3
  maxScore?: number; // optional — defaults to 100 if not provided
  durationSeconds?: number; // optional — GameShell fills it in if not provided
}

export interface GameShellControls {
  /** Record a round while retaining the game’s own between-set screen. */
  recordCompletion: (result: GameResult) => void;
}

interface GameShellProps {
  title: string;
  /** Stable catalogue/route ID used by progress, history and parent reports. */
  gameSlug?: string;
  emoji: string;
  subject: 'maths' | 'spelling' | 'reading' | 'science' | 'art';
  ageGroups: string[];
  children: (onComplete: (result: GameResult) => void, controls: GameShellControls) => React.ReactNode;
  currentQuestion?: string;
  currentOptions?: string[];
}

const subjectColors: Record<string, { bg: string; text: string; light: string }> = {
  maths:   { bg: 'bg-accent',     text: 'text-accent-foreground',     light: 'bg-amber-50' },
  spelling:{ bg: 'bg-secondary',  text: 'text-secondary-foreground',  light: 'bg-red-50'   },
  reading: { bg: 'bg-primary',    text: 'text-primary-foreground',    light: 'bg-green-50' },
  science: { bg: 'bg-blue-600',   text: 'text-white',                 light: 'bg-blue-50'  },
  art:     { bg: 'bg-pink-500',   text: 'text-white',                 light: 'bg-pink-50'  },
};

const ageConfig: Record<string, { badge: string; icon: string }> = {
  '4–6':  { badge: 'bg-pink-400 text-white',         icon: '🌟' },
  '5–7':  { badge: 'bg-yellow-400 text-yellow-900',  icon: '⭐' },
  '8–10': { badge: 'bg-blue-500 text-white',          icon: '🚀' },
  '11–13':{ badge: 'bg-purple-600 text-white',        icon: '🏆' },
};

function calcStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= 50) return 1;
  return 0;
}

export default function GameShell({ title, gameSlug: canonicalGameSlug, emoji, subject, ageGroups, children, currentQuestion, currentOptions }: GameShellProps) {
  // Preserve existing saved game IDs; the new title has a typographic apostrophe.
  const gameSlug = canonicalGameSlug ?? (title === 'Archie’s Adventure Trail' ? 'archie-adventure-trail' : title.toLowerCase().replace(/\s+/g, '-'));
  const navigate = useNavigate();
  const { session } = useSession();
  const { setGameContext, clearGameContext, openArchie } = useArchieContext();
  const { recordGameCompletion } = useProgression();
  const { settings } = useArchieData();
  const blocked = ARCHIE_PREVIEW && !isGameForYear(settings.year, ageGroups);
  const playable = useRef(!blocked);
  playable.current = !blocked;
  const isLoggedIn = !!session?.user;
  const [rewardOpen,setRewardOpen]=useState(false);
  const closeReward=useCallback(()=>setRewardOpen(false),[]);
  const [result, setResult] = useState<GameResult | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const resultFocusOriginRef = useRef<Element | null>(null);
  const gameTitleRef = useRef<HTMLHeadingElement>(null);
  const replayFocusOriginRef = useRef<Element | null>(null);
  const handleGamePanelMount = useCallback((panel: HTMLDivElement | null) => {
    if (!panel) return;
    const origin = replayFocusOriginRef.current;
    replayFocusOriginRef.current = null;
    if (origin && !origin.isConnected && document.activeElement === document.body && !document.querySelector('dialog[open]')) {
      // Cancel inherited smooth scrolling so the new focus stays in view.
      gameTitleRef.current?.focus({ preventScroll: true });
      gameTitleRef.current?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
    }
  }, []);
  const [key, setKey] = useState(0);
  const [newBadges, setNewBadges] = useState<{ id: string; emoji: string; name: string; rarity: string }[]>([]);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const cfg = (Object.hasOwn(subjectColors, subject) ? subjectColors[subject as keyof typeof subjectColors] : undefined) ?? subjectColors['maths'];

  // Legacy daily challenges belong to the account app, not device-only preview practice.
  useEffect(() => {
    if (ARCHIE_PREVIEW || blocked) return;
    const slug = gameSlug;
    fetch(`${API_PREFIX}/daily-challenge`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { game: { slug: string }; claimed: boolean }) => {
        if (d.game?.slug === slug) {
          setIsDailyChallenge(true);
          setDailyClaimed(d.claimed);
        }
      })
      .catch(() => { /* silent */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  // Update Archie context when game info changes
  useEffect(() => {
    if (blocked) { clearGameContext(); return; }
    setGameContext(title, subject, currentQuestion, currentOptions);
    return () => clearGameContext();
  }, [blocked, title, subject, currentQuestion, currentOptions, setGameContext, clearGameContext]);

  // Record this game as last-played on mount
  useEffect(() => {
    if (blocked) { setResult(null); return; }
    try {
      const slug = gameSlug;
      const id = `game-${slug}`;
      localStorage.setItem('sodafom_last_played', JSON.stringify({ id, title, emoji, slug, subject }));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  const handleComplete = (r: GameResult) => {
    if (!playable.current) return;
    const focused = document.activeElement;
    resultFocusOriginRef.current = gameAreaRef.current?.contains(focused) ? focused : null;
    setResult(recordCompletion(r));
  };

  const recordCompletion = (r: GameResult): GameResult => {
    // A retired game's delayed callback cannot record progress after an age guard.
    if (!playable.current) return r;
    // Keep raw points for account progress, but show the same percentage and
    // stars locally that the account API derives from score / maxScore.
    const rawMaxScore = typeof r.maxScore === 'number' && Number.isFinite(r.maxScore) && r.maxScore > 0
      ? r.maxScore
      : 100;
    const percentage = Math.round(Math.max(0, Math.min(100, (r.score / rawMaxScore) * 100)));
    const stars = calcStars(percentage);
    const durationSeconds = r.durationSeconds ?? Math.round((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = Date.now();

    // Record progression
    const slug = gameSlug;
    recordGameCompletion(subject, slug);
    if(r.total>0)setRewardOpen(true);

    recordScopedGameStars(`game-${gameSlug}`, stars);

    const activeChild = getActiveChild();
    if (!ARCHIE_PREVIEW && activeChild?.id) {
      // ── Save game play to DB (progress, stars, leaderboard) ──────────────
      fetch(`${API_PREFIX}/children/${activeChild.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          activityId: gameSlug,
          activityTitle: title,
          subject,
          score: r.score,
          maxScore: r.maxScore,
          durationSeconds,
        }),
      }).catch(() => { /* silent — progress save is non-critical */ });

      // ── Check for newly earned badges and trigger reward email ────────────
      fetch(`${API_PREFIX}/rewards/check-badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId: activeChild.id }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.newBadges?.length) {
            setNewBadges(data.newBadges);
          }
        })
        .catch(() => { /* silent — rewards are non-critical */ });
    }
    return { ...r, score: percentage, stars, durationSeconds };
  };

  const handleReplay = () => {
    const focused = document.activeElement;
    replayFocusOriginRef.current = gameAreaRef.current?.contains(focused) ? focused : null;
    setRewardOpen(false);
    setResult(null);
    setKey(k => k + 1);
    startTimeRef.current = Date.now();
  };

  if (blocked) return <main className="archie-game-shell soda-game-shell min-h-screen bg-background p-6 flex items-center justify-center">
    <section className="max-w-md rounded-2xl border-2 border-blue-200 bg-white p-6 text-center text-blue-950">
      <h1 className="text-2xl font-black mb-3">Let’s find a game for your year</h1>
      <p className="mb-4">{title} has a different age range. Your learning year is Year {settings.year}. Choose one of your games to keep exploring.</p>
      <Link to="/games" className="min-h-12 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Choose a game for my year</Link>
    </section>
  </main>;

  const subjectGames = gamesContent.games.filter((game) => game.subject === subject && (!ARCHIE_PREVIEW || isGameForYear(settings.year, game.ageGroups)));
  const currentGameIndex = subjectGames.findIndex((game) => game.title === title);
  const nextGame = subjectGames.length > 1
    ? subjectGames[(currentGameIndex >= 0 ? currentGameIndex + 1 : 0) % subjectGames.length]
    : null;

  const gameContent = (
    <div style={puzzleThemeStyle(title, subject)} className="archie-game-shell soda-game-shell puzzle-themed min-h-screen bg-background flex flex-col">
      {rewardOpen&&<CompletionScene kind={subject==='reading'||subject==='spelling'?'words':subject} onClose={closeReward}/>}
      <Helmet>
        <title>{title} — Sodafom Games</title>
        <meta name="description" content={`Play ${title} on Sodafom — a fun educational game for children ages ${ageGroups.join(', ')}.`} />
        <link rel="canonical" href="https://sodafom.uk/games" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <ActiveChildBanner />

      {/* Header bar */}
      <div className={`game-title-bar ${cfg.bg} ${cfg.text} px-2 sm:px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 shadow-md`}>
        <div className="flex items-center gap-1 sm:gap-2">
          <button aria-label="Back to games" onClick={() => navigate('/games')} className="min-h-11 min-w-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm opacity-80 hover:opacity-100 transition-opacity">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Games</span>
          </button>
          <button
            aria-label="Exit game and return home"
            onClick={() => navigate('/')}
            className="min-h-11 min-w-11 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xs font-black"
            title="Exit to home"
          >
            <X size={14} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
        <div className="min-w-0 flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="shrink-0 text-xl sm:text-2xl">{emoji}</span>
          <h1 ref={gameTitleRef} tabIndex={-1} className="break-words text-center font-black text-sm sm:text-lg rounded-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-current" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Age badges — desktop only */}
          {ageGroups.map(ag => {
            const ac = Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined;
            return (
              <span key={ag} className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${ac?.badge ?? 'bg-muted text-muted-foreground'}`}>
                {ac?.icon} {ag}
              </span>
            );
          })}
          {/* Login / Logout key */}
          {ARCHIE_PREVIEW ? <Link to="/parents" className="min-h-11 min-w-11 flex items-center justify-center px-3 py-2 rounded-xl bg-white/20 text-xs font-black" title="Learning settings"><User size={16} /><span className="sr-only">Learning settings</span></Link> : isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/hub"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xs font-black"
                title="My Hub"
              >
                <User size={14} />
                <span className="hidden sm:inline">My Hub</span>
              </Link>
              <button
                onClick={() => signOut().then(() => navigate('/hub/login'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xs font-black"
                title="Log out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/hub/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-xs font-black"
              title="Log in"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          )}
        </div>
      </div>

      <div role="group" aria-label="Game help" className="game-help-bar flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50 px-3 sm:px-4 py-2">
        <p className="text-sm font-bold text-blue-950">Need a hint?</p>
        <button type="button" onClick={() => openArchie()} className="min-h-11 flex items-center gap-2 rounded-xl border-2 border-blue-300 bg-white px-4 py-2 font-black text-blue-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          <MessageCircle size={20} aria-hidden="true" /> Ask Archie
        </button>
      </div>

      <section className="game-scene-banner" aria-label="Your learning adventure"><div className="game-scene-copy"><strong>Archie is here to help</strong><p>Take your time. Try a clue, ask for a hint and celebrate each small step.</p></div><SceneArtwork scene={sceneForSubject(subject,title)} title={title} compact/></section>

      {/* Game area */}
      <div ref={gameAreaRef} className="game-app-area flex-1 flex flex-col pb-6">
        <AnimatePresence mode="wait">
          {result
            ? <ResultScreen key="result" result={result} focusOrigin={resultFocusOriginRef.current} onReplay={handleReplay} onHome={() => navigate('/')} gameTitle={title} subject={subject} nextGame={nextGame ? { title: nextGame.title, route: `/games/${nextGame.slug}` } : null} isDailyChallenge={isDailyChallenge} dailyClaimed={dailyClaimed} isLoggedIn={isLoggedIn} navigate={navigate} />
            : <motion.div ref={handleGamePanelMount} key={`game-${key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <AppScreenPager>{children(handleComplete, { recordCompletion })}</AppScreenPager>
              </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* New badge notification popup */}
      <AnimatePresence>
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-card border-2 border-yellow-400 rounded-2xl shadow-2xl p-5 text-center">
              <p className="text-3xl mb-1">🏆</p>
              <p className="font-black text-foreground text-base mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                Badge{newBadges.length > 1 ? 's' : ''} Unlocked!
              </p>
              <div className="flex flex-wrap justify-center gap-2 my-2">
                {newBadges.map(b => (
                  <span key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-300 text-sm font-black text-yellow-800">
                    <span>{b.emoji}</span> {b.name}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mb-3">A reward email is on its way! 🎉</p>
              <button
                onClick={() => setNewBadges([])}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
              >
                Awesome!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <PaywallGate gameTitle={title} gameEmoji={emoji} subject={subject}>
      {gameContent}
    </PaywallGate>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────────

export function ResultScreen({
  result, focusOrigin, onReplay, onHome, gameTitle, subject, nextGame, isDailyChallenge = false, dailyClaimed = false, isLoggedIn = false, navigate,
}: {
  result: GameResult;
  focusOrigin?: Element | null;
  onReplay: () => void;
  onHome: () => void;
  gameTitle: string;
  subject: string;
  nextGame: { title: string; route: string } | null;
  isDailyChallenge?: boolean;
  dailyClaimed?: boolean;
  isLoggedIn?: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { level, gamesRemainingForNextLevel } = useProgression();
  const [showCert, setShowCert] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [starsRevealed, setStarsRevealed] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const animatedScore = useCountUp(result.score, 1000, 400);

  useEffect(() => {
    // Replace lost game focus without interrupting a surviving control or open dialog.
    if (focusOrigin && !focusOrigin.isConnected && document.activeElement === document.body && !document.querySelector('dialog[open]')) {
      headingRef.current?.focus();
    }
  }, [focusOrigin]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stagger star reveals
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setStarsRevealed(i), i * 280));
    }

    // Respect children who prefer less movement.
    if (result.stars >= 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timers.push(setTimeout(() => setConfettiActive(true), 900));
      timers.push(setTimeout(() => setConfettiActive(false), result.stars === 3 ? 4500 : 2800));
    }

    // 3-star banner
    if (result.stars === 3) {
      timers.push(setTimeout(() => setBannerVisible(true), 1100));
    }

    // Web Audio tone sequence
    try {
      if (!isSoundEnabled()) throw new Error('Sound is turned off');
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const notes = result.stars === 3 ? [523, 659, 784, 1047]
        : result.stars === 2 ? [523, 659, 784]
        : result.stars === 1 ? [523, 659]
        : [330];
      notes.forEach((freq, i) => {
        timers.push(setTimeout(() => {
          try {
            if (!isSoundEnabled()) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.35);
          } catch { /* audio blocked */ }
        }, 900 + i * 160));
      });
    } catch { /* audio not available */ }

    return () => {
      timers.forEach(clearTimeout);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [result.stars]);

  const headlineMap: Record<number, string> = {
    3: '🎉 Amazing exploring!',
    2: '🌟 Great job!',
    1: '👍 Good try!',
    0: '💪 Keep practising!',
  };
  const headline = headlineMap[result.stars] ?? headlineMap[0];

  // High-contrast subject banners. The maths gold keeps the established
  // palette but uses navy text; the darker literacy gradients use white.
  const gradientStyle: Record<string, React.CSSProperties> = {
    maths:    { background: 'linear-gradient(135deg, #facc15, #fde68a)', color: '#172554' },
    spelling: { background: 'linear-gradient(135deg, #be123c, #881337)', color: '#ffffff' },
    reading:  { background: 'linear-gradient(135deg, #166534, #14532d)', color: '#ffffff' },
  };
  const bannerStyle = gradientStyle[subject] ?? gradientStyle['reading'];

  return (
    <>
      <ConfettiCanvas active={confettiActive} mode="burst" intensity={result.stars === 3 ? 1 : 0.55} />

      <CertificateModal open={showCert} onClose={() => setShowCert(false)} gameTitle={gameTitle} subject={subject} stars={result.stars} />

      <motion.div
        data-result-screen
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="flex-1 flex items-center justify-center px-4 pt-4 pb-44 sm:p-6 sm:pb-36 focus-within:!opacity-100 [&_*:focus-within]:!opacity-100"
      >
        <div className="max-w-md w-full">

          {/* 3-star celebration banner */}
          <AnimatePresence>
            {bannerVisible && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-4 rounded-2xl text-center py-3 px-5 shadow-lg"
                style={bannerStyle}
              >
                <p className="font-black text-lg tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                  ⭐ Three stars earned! ⭐
                </p>
                <p className="text-sm opacity-90 font-bold">{result.score===100?'You got every question right!':'Your practice earned three stars!'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main card */}
          <div className="bg-card rounded-3xl shadow-2xl border-2 border-border p-6 sm:p-8 text-center relative overflow-hidden">

            {/* Subtle shimmer for 3 stars */}
            {result.stars === 3 && (
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-5 motion-reduce:hidden"
                style={bannerStyle}
                animate={{ opacity: [0.05, 0.12, 0.05] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              />
            )}

            {/* Headline */}
            <motion.h2
              ref={headingRef}
              data-reward-return
              tabIndex={-1}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl sm:text-3xl font-black text-foreground mb-4 rounded-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {headline}
            </motion.h2>

            {/* Stars */}
            <div className="flex justify-center gap-2 sm:gap-3 my-5">
              {[1, 2, 3].map(s => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={starsRevealed >= s
                    ? { scale: [0, 1.4, 1], rotate: [-45, 15, 0], opacity: 1 }
                    : { scale: 0, rotate: -45, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <Star
                    size={52}
                    className={s <= result.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                  />
                </motion.div>
              ))}
            </div>

            {/* Animated score counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="bg-muted rounded-2xl p-4 mb-5"
            >
              <div aria-hidden="true" className="text-5xl font-black text-primary mb-1 tabular-nums">
                {animatedScore}%
              </div>
              <span className="sr-only">Final score: {result.score}%</span>
              <div className="text-muted-foreground text-sm font-bold">
                {result.correct} correct out of {result.total} questions
              </div>
            </motion.div>

            {/* Stars earned badge */}
            {result.stars > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm font-bold text-yellow-800"
              >
                <Trophy size={16} />
                You earned {result.stars} star{result.stars !== 1 ? 's' : ''}!
                {result.score === 100 && <span className="ml-1 text-yellow-900">🏆 All correct!</span>}
              </motion.div>
            )}

            {/* Streak hint for 3 stars */}
            {result.stars === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-2.5 mb-4 text-xs font-bold text-blue-950"
              >
                <Zap size={13} /> Well done for practising. Come back whenever you are ready.
              </motion.div>
            )}

            {/* Certificate button for 2+ stars */}
            {result.stars >= 2 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCert(true)}
                className="relative z-20 w-full flex min-h-12 touch-manipulation cursor-pointer items-center justify-center gap-2 py-3 rounded-xl font-black mb-4 shadow-md hover:shadow-lg transition-shadow"
                style={bannerStyle}
              >
                🏆 View Certificate
              </motion.button>
            )}

            {/* Daily Challenge bonus claim */}
            {isDailyChallenge && !dailyClaimed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                className="w-full flex items-center gap-3 bg-accent/10 border-2 border-accent/40 rounded-xl p-3 mb-4"
              >
                <span className="text-2xl">🔥</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm">Today's Daily Challenge!</p>
                  <p className="text-xs text-muted-foreground">Claim your 5 bonus stars</p>
                </div>
                <button
                  onClick={() => navigate('/daily-challenge')}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-black text-xs hover:opacity-90 transition-opacity shrink-0"
                >
                  Claim ⭐×5
                </button>
              </motion.div>
            )}
            {isDailyChallenge && dailyClaimed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                className="w-full flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 text-xs font-bold text-primary"
              >
                🔥 Daily Challenge complete — bonus stars already claimed!
              </motion.div>
            )}

            {/* Get Started CTA — shown to logged-out users */}
            {!isLoggedIn && !ARCHIE_PREVIEW && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/hub/signup')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white mb-3 shadow-lg"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))' }}
              >
                <Zap size={16} className="fill-white" />
                Get Started — Save Your Progress!
              </motion.button>
            )}

            {/* Save to Rewards — shown to logged-in users */}
            {isLoggedIn && result.stars > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="flex gap-2 mb-3"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/certificates')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-sm bg-yellow-50 border-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 transition-colors"
                >
                  <Award size={15} />
                  My Certificates
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/star-bank')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-sm bg-primary/10 border-2 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Gift size={15} />
                  My Rewards
                </motion.button>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="mb-3 rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-sky-900">
              <p className="font-black">Level {level}</p>
              <p className="text-xs font-bold">
                {gamesRemainingForNextLevel === 10
                  ? `Level ${Math.max(1, level - 1)} complete — your next level is ready!`
                  : `${gamesRemainingForNextLevel} game${gamesRemainingForNextLevel === 1 ? '' : 's'} until Level ${level + 1}`}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReplay}
                className="relative z-20 flex-1 min-h-12 touch-manipulation cursor-pointer items-center justify-center gap-2 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-sm"
              >
                <RotateCcw size={16} /> Play another round
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onHome}
                className="relative z-20 flex-1 min-h-12 touch-manipulation cursor-pointer items-center justify-center gap-2 py-3 rounded-xl font-bold bg-muted text-foreground border border-border"
              >
                <Home size={16} /> Home
              </motion.button>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (nextGame) {
                  navigate(nextGame.route);
                  window.scrollTo({ top: 0, behavior: 'auto' });
                } else {
                  navigate(`/games?cat=${encodeURIComponent(subject)}`);
                }
              }}
              className="relative z-20 mt-3 w-full flex min-h-14 touch-manipulation cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground font-black shadow-md"
            >
              {nextGame ? `Play Next: ${nextGame.title}` : 'Choose Next Game'} <ArrowRight size={18} />
            </motion.button>

            {/* Share nudge */}
            <div className="mt-5 pt-5 border-t border-border">
              <ShareBar
                url="https://sodafom.uk"
                text="My child just played a learning game on Sodafom — fun maths, spelling & reading for kids! 🎮"
                label="Enjoyed it? Share Sodafom"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

�M:�