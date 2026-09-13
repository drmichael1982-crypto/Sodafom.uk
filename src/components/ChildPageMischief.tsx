import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';

/**
 * A deliberately non-interactive layer for occasional character jokes on
 * child-facing learning pages. It is never mounted on parent, billing,
 * checkout, admin or teacher routes.
 *
 * Every rendered element has `pointer-events: none`, is hidden from assistive
 * technology and has no event handlers. It can therefore never activate an
 * underlying action, including subscription cancellation.
 */

export type MischiefKind = 'archie-dash' | 'friend-peek' | 'button-buddy' | 'pretend-cancel';

const CHILD_EXACT_PATHS = new Set([
  '/',
  '/cartoon-mode',
  '/classic-home',
  '/ask-archie',
  '/chat',
  '/sodafom-bot',
  '/ai-teacher',
  '/cartoons',
  '/mock-exams',
  '/story-writer',
  '/daily-challenge',
  '/rewards',
  '/badges',
  '/star-bank',
  '/game-of-the-week',
  '/leaderboard',
  '/certificates',
  '/battle',
]);

const CHILD_PREFIXES = ['/games/', '/subjects/', '/battle/'];
const COOLDOWN_MS = 2 * 60 * 1000;
const STORAGE_KEY = 'sodafom:mischief:last-shown';

export function isChildLearningPath(pathname: string): boolean {
  return CHILD_EXACT_PATHS.has(pathname) || CHILD_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export function chooseMischief(pathname: string, random = Math.random): MischiefKind {
  const chance = random();

  // Game pages get two small extra gags. The red item is only a drawn prop,
  // never an HTML button and never connected to an account action.
  if (pathname.startsWith('/games/')) {
    if (chance < 0.3) return 'button-buddy';
    if (chance < 0.5) return 'pretend-cancel';
  }

  return chance < 0.75 ? 'archie-dash' : 'friend-peek';
}

export function shouldRenderMischief(isChildPage: boolean, prefersReducedMotion: boolean | null): boolean {
  return isChildPage && !prefersReducedMotion;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

function canShowMischief(now: number): boolean {
  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (storedValue === null) return true;

    const lastShown = Number(storedValue);
    return !Number.isFinite(lastShown) || now - lastShown >= COOLDOWN_MS;
  } catch {
    // Privacy settings may deny storage. In that case the single mount timer is
    // still one-off, so the experience remains restrained.
    return true;
  }
}

function recordMischief(now: number) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(now));
  } catch {
    // No persistent behaviour is required for this decorative feature.
  }
}

interface ChildPageMischiefProps {
  /** Used only by component tests; production uses a short, varied delay. */
  delayMs?: number;
  /** Used only by component tests to make the selected gag deterministic. */
  random?: () => number;
}

export default function ChildPageMischief({ delayMs, random }: ChildPageMischiefProps) {
  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [kind, setKind] = useState<MischiefKind | null>(null);

  const isChildPage = isChildLearningPath(pathname);
  const showDelay = useMemo(() => delayMs ?? 7000 + Math.round((random ?? Math.random)() * 6000), [delayMs, random]);

  useEffect(() => {
    setKind(null);

    // Reduced-motion users receive no surprise animation. Protected pages are
    // excluded before a timer is even created.
    if (!shouldRenderMischief(isChildPage, prefersReducedMotion) || document.visibilityState !== 'visible') return;
    if (!canShowMischief(Date.now())) return;

    const showTimer = window.setTimeout(() => {
      const now = Date.now();
      if (!canShowMischief(now)) return;

      recordMischief(now);
      setKind(chooseMischief(pathname, random));
    }, showDelay);

    return () => window.clearTimeout(showTimer);
  }, [isChildPage, pathname, prefersReducedMotion, random, showDelay]);

  useEffect(() => {
    if (!kind) return;
    const dismissTimer = window.setTimeout(() => setKind(null), kind === 'archie-dash' ? 4300 : 3600);
    return () => window.clearTimeout(dismissTimer);
  }, [kind]);

  if (!shouldRenderMischief(isChildPage, prefersReducedMotion)) return null;

  return (
    <AnimatePresence>
      {kind === 'archie-dash' && (
        <motion.div
          key="archie-dash"
          data-testid="mischief-archie-dash"
          aria-hidden="true"
          className="pointer-events-none fixed bottom-3 left-0 select-none"
          style={{ zIndex: 30 }}
          initial={{ x: '-13rem', rotate: -4, opacity: 0 }}
          animate={{ x: 'calc(100vw + 13rem)', rotate: [0, 4, -2, 0], opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 4.1, ease: 'linear' }}
        >
          <div className="relative">
            <ArchieCharacter size={110} />
            <span className="absolute -right-3 top-2 rotate-6 rounded-full bg-yellow-300 px-2 py-1 text-xs font-black text-amber-950 shadow">
              Zoom!
            </span>
          </div>
        </motion.div>
      )}

      {kind === 'friend-peek' && (
        <motion.div
          key="friend-peek"
          data-testid="mischief-friend-peek"
          aria-hidden="true"
          className="pointer-events-none fixed bottom-2 right-2 select-none"
          style={{ zIndex: 30 }}
          initial={{ x: '8rem', y: '4rem', opacity: 0 }}
          animate={{ x: [0, -10, 0], y: [0, -12, 0], rotate: [0, -8, 8, 0], opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3.4, ease: 'easeInOut' }}
        >
          <div className="relative">
            <ArchieCharacter character="bella" size={92} />
            <span className="absolute -left-2 top-0 rounded-full bg-white px-2 py-1 text-xs font-black text-purple-800 shadow">
              Hi!
            </span>
          </div>
        </motion.div>
      )}

      {kind === 'button-buddy' && (
        <motion.div
          key="button-buddy"
          data-testid="mischief-button-buddy"
          aria-hidden="true"
          className="pointer-events-none fixed bottom-4 right-4 select-none"
          style={{ zIndex: 30 }}
          initial={{ y: '9rem', opacity: 0 }}
          animate={{ y: [0, -7, 0], rotate: [0, 3, -3, 0], opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3.3, ease: 'easeInOut' }}
        >
          <div className="relative rounded-[1.5rem] border-4 border-blue-700 bg-blue-100 p-1 shadow-xl">
            <ArchieCharacter character="soda" size={74} />
            <span className="absolute -top-3 -left-7 rounded-full bg-white px-2 py-1 text-[11px] font-black text-blue-900 shadow">
              Your turn!
            </span>
          </div>
        </motion.div>
      )}

      {kind === 'pretend-cancel' && (
        <motion.div
          key="pretend-cancel"
          data-testid="mischief-pretend-cancel"
          aria-hidden="true"
          className="pointer-events-none fixed bottom-4 left-4 select-none"
          style={{ zIndex: 30 }}
          initial={{ x: '-9rem', opacity: 0 }}
          animate={{ x: [0, 8, 0], y: [0, -5, 0], opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3.4, ease: 'easeInOut' }}
        >
          <div className="relative flex items-end gap-1 rounded-2xl border-2 border-dashed border-rose-300 bg-white/95 p-2 shadow-lg">
            <ArchieCharacter size={66} />
            {/* This is intentionally a presentational div, not a button or link. */}
            <div className="mb-1 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white shadow">
              Cancel? (pretend!)
            </div>
            <span className="absolute -right-1 -top-3 rounded-full bg-yellow-300 px-2 py-1 text-[10px] font-black text-amber-950 shadow">
              Joke only
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
