import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Star, Zap, Play, Lock, Swords, X, ChevronRight, MessageCircle, Key, CheckCircle2, AlertCircle, Loader2, UserPlus, XCircle, Crown, CreditCard, Search, Shuffle, LogIn, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { ArchieCharacter } from '../components/ArchieCharacter';
import { useNavigate, useSearchParams, Link } from "react-router";
import { signIn, signUp, useSession } from '@/lib/auth/auth-client';
import { games as _games } from 'virtual:content';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak } from '@/lib/voice-context';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

type WeeklyChallenge = { gameId: string; title: string; emoji: string; tagline: string; prize: string };
const games = _games as typeof _games & { weeklyChallenge?: WeeklyChallenge };
import { isDemoGameId, useSubscription } from '@/hooks/useSubscription';

// Map game id → route path
const GAME_ROUTES: Record<string, string> = {
  'game-number-pop': '/games/number-pop',
  'game-times-table-race': '/games/times-table-race',
  'game-fraction-pizza': '/games/fraction-pizza',
  'game-word-scramble':              '/games/word-scramble',
  'game-times-tables-challenge':     '/games/times-tables-challenge',
  'game-sentence-scramble':          '/games/sentence-scramble',
  'game-shape-sorter': '/games/shape-sorter',
  'game-word-wizard': '/games/word-wizard',
  'game-spelling-bee': '/games/spelling-bee',
  'game-tricky-words': '/games/tricky-word-hunt',
  'game-story-builder': '/games/story-builder',
  'game-phonics-parrot': '/games/phonics-parrot',
  'game-reading-quest': '/games/reading-quest',
  'game-word-search': '/games/word-search',
  'game-crossword': '/games/crossword',
  'game-sudoku': '/games/sudoku',
  'game-colour-book': '/games/colour-book',
  'game-alphabet-explorer': '/games/alphabet-explorer',
  'game-times-tables-reader': '/games/times-tables-reader',
  'game-number-bonds':        '/games/number-bonds',
  'game-sentence-builder':    '/games/sentence-builder',
  'game-animal-kingdom':      '/games/animal-kingdom',
  'game-nature-explorer':     '/games/nature-explorer',
  'game-science-lab':         '/games/science-lab',
  'game-animal-habitats':     '/games/animal-habitats',
  'game-geography-quiz':      '/games/geography-quiz',
  'game-mental-maths-sprint': '/games/mental-maths-sprint',
  'game-colour-learn':        '/games/colour-learn',
  'game-number-puzzle':       '/games/number-puzzle',
  // 30 new maths games
  'game-maths-bingo':         '/games/maths-bingo',
  'game-coin-counter':        '/games/coin-counter',
  'game-odd-even':            '/games/odd-even',
  'game-place-value':         '/games/place-value',
  'game-multiplication-grid': '/games/multiplication-grid',
  'game-geography-uk':        '/games/geography-uk',
  'game-synonyms-antonyms':   '/games/synonyms-antonyms',
  'game-division-dash':       '/games/division-dash',
  'game-number-line':         '/games/number-line',
  'game-maths-mystery':       '/games/maths-mystery',
  'game-pattern-maker':       '/games/pattern-maker',
  'game-angle-explorer':      '/games/angle-explorer',
  'game-perimeter-quest':     '/games/perimeter-quest',
  'game-area-adventure':      '/games/area-adventure',
  'game-data-detective':      '/games/data-detective',
  'game-fraction-match':      '/games/fraction-match',
  'game-speed-tables':        '/games/speed-tables',
  'game-rounding-rocket':     '/games/rounding-rocket',
  'game-negative-numbers':    '/games/negative-numbers',
  'game-coordinates-grid':    '/games/coordinates-grid',
  'game-symmetry-studio':     '/games/symmetry-studio',
  'game-time-teller':         '/games/time-teller',
  'game-maths-word-problems': '/games/maths-word-problems',
  'game-ordering-numbers':    '/games/ordering-numbers',
  'game-missing-numbers':     '/games/missing-numbers',
  'game-maths-snap':          '/games/maths-snap',
  'game-ratio-recipe':        '/games/ratio-recipe',
  'game-prime-numbers':       '/games/prime-numbers',
  'game-algebra-quest':       '/games/algebra-quest',
  'game-maths-challenge':     '/games/maths-challenge',
  // 30 new spelling games
  'game-letter-sounds':       '/games/letter-sounds',
  'game-rhyme-time':          '/games/rhyme-time',
  'game-syllable-split':      '/games/syllable-split',
  'game-prefix-power':        '/games/prefix-power',
  'game-suffix-quest':        '/games/suffix-quest',
  'game-homophones':          '/games/homophones',
  'game-compound-words':      '/games/compound-words',
  'game-spelling-challenge':  '/games/spelling-challenge',
  'game-word-families':       '/games/word-families',
  'game-missing-letters':     '/games/missing-letters',
  'game-anagram-attack':      '/games/anagram-attack',
  'game-silent-letters':      '/games/silent-letters',
  'game-double-letters':      '/games/double-letters',
  'game-vowel-sounds':        '/games/vowel-sounds',
  'game-spelling-snap':       '/games/spelling-snap',
  'game-word-builder':        '/games/word-builder',
  'game-dictionary-dash':     '/games/dictionary-dash',
  'game-contraction-station': '/games/contraction-station',
  'game-plural-rules':        '/games/plural-rules',
  'game-word-match':          '/games/word-match',
  'game-spelling-race':       '/games/spelling-race',
  // 30 new reading games
  'game-comprehension-quest': '/games/comprehension-quest',
  'game-story-sequence':      '/games/story-sequence',
  'game-reading-detective':   '/games/reading-detective',
  'game-punctuation-patrol':  '/games/punctuation-patrol',
  'game-grammar-garage':      '/games/grammar-garage',
  'game-noun-spotter':        '/games/noun-spotter',
  'game-verb-volcano':        '/games/verb-volcano',
  'game-adjective-adventure': '/games/adjective-adventure',
  'game-synonym-swap':        '/games/synonym-swap',
  'game-antonym-arena':       '/games/antonym-arena',
  'game-reading-speed':       '/games/reading-speed',
  'game-poetry-corner':       '/games/poetry-corner',
  'game-text-types':          '/games/text-types',
  'game-reading-map':         '/games/reading-map',
  'game-word-meaning':        '/games/word-meaning',
  'game-speech-marks':        '/games/speech-marks',
  'game-connectives-bridge':  '/games/connectives-bridge',
  'game-reading-fluency':     '/games/reading-fluency',
  'game-book-review':         '/games/book-review',
  'game-reading-bingo':       '/games/reading-bingo',
  'game-story-map':           '/games/story-map',
  'game-reading-challenge':   '/games/reading-challenge',
  // 30 new science games
  'game-human-body':          '/games/human-body',
  'game-money-maths':         '/games/money-maths',
  'game-parts-of-speech':     '/games/parts-of-speech',
  'game-telling-time':        '/games/telling-time',
  'game-solar-system':        '/games/solar-system',
  'game-food-chains':         '/games/food-chains',
  'game-states-of-matter':    '/games/states-of-matter',
  'game-forces-lab':          '/games/forces-lab',
  'game-electricity-circuit': '/games/electricity-circuit',
  'game-plant-parts':         '/games/plant-parts',
  'game-life-cycles':         '/games/life-cycles',
  'game-weather-watch':       '/games/weather-watch',
  'game-rock-detective':      '/games/rock-detective',
  'game-light-shadows':       '/games/light-shadows',
  'game-sound-science':       '/games/sound-science',
  'game-materials-sort':      '/games/materials-sort',
  'game-skeleton-builder':    '/games/skeleton-builder',
  'game-healthy-eating':      '/games/healthy-eating',
  'game-microhabitats':       '/games/microhabitats',
  'game-magnets-magic':       '/games/magnets-magic',
  'game-water-cycle':         '/games/water-cycle',
  'game-classification-keys': '/games/classification-keys',
  'game-earth-space':         '/games/earth-space',
  'game-evolution-explorer':  '/games/evolution-explorer',
  'game-science-quiz':        '/games/science-quiz',
};
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

// ── Age filter options ───────────────────────────────────────────────────────
const AGE_ALL = 'All ages';

// Individual year bands with icons and colours
const AGE_YEARS: Array<{
  label: string;
  display: string;
  icon: string;
  emoji: string;
  badge: string;
  groups: string[]; // which ageGroups in content this year maps to
}> = [
  { label: '4–5',  display: 'Age 4–5',  icon: '🌱', emoji: '🌱', badge: 'bg-pink-300 text-pink-900',   groups: ['4–6'] },
  { label: '5–6',  display: 'Age 5–6',  icon: '🌟', emoji: '🌟', badge: 'bg-pink-400 text-white',      groups: ['4–6', '5–7'] },
  { label: '6–7',  display: 'Age 6–7',  icon: '⭐', emoji: '⭐', badge: 'bg-yellow-400 text-yellow-900', groups: ['5–7'] },
  { label: '7–8',  display: 'Age 7–8',  icon: '🚀', emoji: '🚀', badge: 'bg-orange-400 text-white',    groups: ['5–7', '8–10'] },
  { label: '8–9',  display: 'Age 8–9',  icon: '🎯', emoji: '🎯', badge: 'bg-blue-400 text-white',      groups: ['8–10'] },
  { label: '9–10', display: 'Age 9–10', icon: '🔥', emoji: '🔥', badge: 'bg-blue-500 text-white',      groups: ['8–10'] },
  { label: '10–11',display: 'Age 10–11',icon: '⚡', emoji: '⚡', badge: 'bg-indigo-500 text-white',    groups: ['8–10', '11–13'] },
  { label: '11–12',display: 'Age 11–12',icon: '🏆', emoji: '🏆', badge: 'bg-purple-500 text-white',    groups: ['11–13'] },
  { label: '12–13',display: 'Age 12–13',icon: '🎓', emoji: '🎓', badge: 'bg-purple-700 text-white',    groups: ['11–13'] },
];

const _AGE_OPTIONS = [AGE_ALL, ...AGE_YEARS.map((a) => a.label)];
void _AGE_OPTIONS;

// Legacy ageConfig kept for game card badges
const ageConfig: Record<string, { badge: string; icon: string }> = {
  '4–6':  { badge: 'bg-pink-400 text-white',        icon: '🌟' },
  '5–7':  { badge: 'bg-yellow-400 text-yellow-900', icon: '⭐' },
  '8–10': { badge: 'bg-blue-500 text-white',         icon: '🚀' },
  '11–13':{ badge: 'bg-purple-600 text-white',       icon: '🏆' },
};

// ── Subject colour config ────────────────────────────────────────────────────
const subjectConfig: Record<string, {
  border: string;
  headerBg: string;
  iconBg: string;
  diffBg: string;
  gradFrom: string;
  gradTo: string;
  ring: string;
  label: string;
  subjectEmoji: string;
}> = {
  maths: {
    border: 'border-amber-300',
    headerBg: 'bg-amber-400',
    iconBg: 'bg-amber-100',
    diffBg: 'bg-amber-50',
    gradFrom: '#F59E0B',
    gradTo: '#D97706',
    ring: 'ring-amber-300',
    label: 'Maths',
    subjectEmoji: '🔢',
  },
  spelling: {
    border: 'border-red-300',
    headerBg: 'bg-red-500',
    iconBg: 'bg-red-100',
    diffBg: 'bg-red-50',
    gradFrom: '#EF4444',
    gradTo: '#DC2626',
    ring: 'ring-red-300',
    label: 'Spelling',
    subjectEmoji: '🔤',
  },
  reading: {
    border: 'border-green-300',
    headerBg: 'bg-green-500',
    iconBg: 'bg-green-100',
    diffBg: 'bg-green-50',
    gradFrom: '#22C55E',
    gradTo: '#16A34A',
    ring: 'ring-green-300',
    label: 'Reading',
    subjectEmoji: '📖',
  },
  stories: {
    border: 'border-teal-300',
    headerBg: 'bg-teal-500',
    iconBg: 'bg-teal-100',
    diffBg: 'bg-teal-50',
    gradFrom: '#14B8A6',
    gradTo: '#0D9488',
    ring: 'ring-teal-300',
    label: 'Stories',
    subjectEmoji: '📜',
  },
  science: {
    border: 'border-blue-300',
    headerBg: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    diffBg: 'bg-blue-50',
    gradFrom: '#3B82F6',
    gradTo: '#2563EB',
    ring: 'ring-blue-300',
    label: 'Science',
    subjectEmoji: '🔬',
  },
  art: {
    border: 'border-pink-300',
    headerBg: 'bg-pink-500',
    iconBg: 'bg-pink-100',
    diffBg: 'bg-pink-50',
    gradFrom: '#EC4899',
    gradTo: '#DB2777',
    ring: 'ring-pink-300',
    label: 'Art',
    subjectEmoji: '🎨',
  },
};
const difficultyConfig: Record<string, string> = {
  Easy: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Hard: 'bg-red-100 text-red-800 border-red-200'
};

// ── Read-aloud hook ──────────────────────────────────────────────────────────
function useReadAloud() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const speak = (id: string, text: string) => {
    if (speakingId === id) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    ttsSpeak(text, () => setSpeakingId(null));
  };
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);
  return {
    speak,
    speakingId
  };
}

// ── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const
    }
  }
} as const;
const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
} as const;
const cardAnim = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 220,
      damping: 22
    }
  }
} as const;

// Decorative dot positions — static chrome, not content data
const dotPositions = [{
  top: '10%',
  left: '8%'
}, {
  top: '24%',
  left: '23%'
}, {
  top: '38%',
  left: '53%'
}, {
  top: '52%',
  left: '68%'
}, {
  top: '66%',
  left: '38%'
}, {
  top: '80%',
  left: '83%'
}];
// Archie's speech bubble cycles through app-explaining tips
const ARCHIE_TIPS = [
  '🎓 Sodafom is a fun learning app for kids aged 5–13 — play games, earn stars and grow smarter every day!',
  '🔢 Practice maths, spelling, reading and science through games that make learning feel like play!',
  '⭐ Earn stars on every game, unlock badges and track your progress as you level up!',
  '🔊 Every game talks to you — tap the speaker to hear instructions read aloud!',
  '🏆 Challenge friends in Battle Mode and see who can get the top score!',
  '🎯 Games are sorted by age — from 4 all the way to 13 — so the challenge is always just right!',
];
// Accepts: "5-7" | "8-10" | "11-13" (from hub/homepage) or exact year-band
// labels like "5–6", "6–7" etc. (from direct URL). Returns AGE_ALL if unknown.
function resolveAgeParam(raw: string | null): string {
  if (!raw) return AGE_ALL;
  const normalised = raw.replace('–', '-').trim(); // normalise en-dash → hyphen
  // Exact year-band match (e.g. "5-6" → "5–6")
  const exactMatch = AGE_YEARS.find(
    (a) => a.label.replace('–', '-') === normalised
  );
  if (exactMatch) return exactMatch.label;
  // Broad group match: pick the first year band whose groups include this group
  const broadMap: Record<string, string> = {
    '5-7': '5–6',   // first band in the 5–7 group
    '8-10': '8–9',  // first band in the 8–10 group
    '11-13': '11–12', // first band in the 11–13 group
  };
  if (Object.hasOwn(broadMap, normalised)) {
    const entry = Object.entries(broadMap).find(([k]) => k === normalised);
    return entry ? entry[1] : AGE_ALL;
  }
  return AGE_ALL;
}

export type GameEntry = {
  id: string;
  title: string;
  emoji: string;
  subject: string;
  slug: string;
  ageGroups: string[];
};

// ── Surprise Me button ────────────────────────────────────────────────────────
function SurpriseMeButton({
  games,
  selectedCat,
  selectedAge,
  ageYears,
  ageAll,
}: {
  games: GameEntry[];
  selectedCat: string;
  selectedAge: string;
  ageYears: typeof AGE_YEARS;
  ageAll: string;
}) {
  const navigate = useNavigate();
  const [popping, setPopping] = useState(false);

  function pickRandom() {
    let pool = [...games];
    // Filter by active subject
    if (selectedCat !== ageAll && selectedCat !== 'cat-all') {
      const cat = selectedCat.replace('cat-', '');
      pool = pool.filter(g => g.subject === cat);
    }
    // Filter by active age
    if (selectedAge !== ageAll) {
      const band = ageYears.find(a => a.label === selectedAge);
      if (band) pool = pool.filter(g => band.groups.some(grp => g.ageGroups.includes(grp)));
    }
    if (!pool.length) pool = games;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const slug = pick.slug ?? pick.id.replace('game-', '');
    setPopping(true);
    setTimeout(() => {
      setPopping(false);
      navigate(`/games/${slug}`);
    }, 400);
  }

  return (
    <motion.button
      onClick={pickRandom}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      animate={popping ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -8, 8, -4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-black text-sm shadow-md hover:shadow-lg transition-shadow"
      aria-label="Pick a random game"
    >
      <Shuffle size={15} />
      Surprise me!
    </motion.button>
  );
}

// ── Archie site-intro speech ─────────────────────────────────────────────────
const ARCHIE_INTRO_LINES = [
  "Hi! I'm Archie, and welcome to Sodafom!",
  "Sodafom is a fun learning platform for children aged 5 to 13.",
  "We have over 118 games covering maths, spelling, reading, and science.",
  "Play games, earn stars, unlock badges, and track your progress!",
  "Every game has read-aloud support — just tap the speaker icon.",
  "You can sign up for a free 7-day trial, or enter an access code if you have one.",
  "Let's start learning through play — pick a game and let's go!",
].join(' ');

// ── Inline Auth Modal ─────────────────────────────────────────────────────────
type AuthMode = 'login' | 'signup';

function AuthModal({ mode: initialMode, onClose, onSuccess }: {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      if (mode === 'login') {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message ?? 'Login failed');
      } else {
        const res = await signUp.email({ email, password, name: name || email.split('@')[0] });
        if (res.error) throw new Error(res.error.message ?? 'Sign up failed');
      }
      setStatus('idle');
      onSuccess();
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      // Friendly error mapping
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setErrorMsg('Email or password is incorrect — please try again.');
      } else if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('already')) {
        setErrorMsg('An account with that email already exists. Try logging in instead.');
      } else if (msg.toLowerCase().includes('weak') || msg.toLowerCase().includes('password')) {
        setErrorMsg('Password must be at least 8 characters.');
      } else {
        setErrorMsg(msg);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-card rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-4 border-primary/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hero-bg px-6 pt-6 pb-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" aria-label="Close">
            <X size={22} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <ArchieCharacter size={48} className="drop-shadow-lg" />
            <div>
              <h2 className="text-white font-black text-xl hero-title-shadow leading-tight">
                {mode === 'login' ? 'Welcome back!' : 'Join Sodafom!'}
              </h2>
              <p className="text-white/80 text-xs font-semibold">
                {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-black text-foreground mb-1.5">Your name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-black text-foreground mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 rounded-xl border-2 border-border bg-background py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-black text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPw ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                className="w-full pr-10 pl-4 rounded-xl border-2 border-border bg-background py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-destructive text-xs font-bold leading-snug">{errorMsg}</p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl font-black text-sm bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 size={16} className="animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
            ) : mode === 'login' ? (
              <><LogIn size={16} /> Sign In</>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </motion.button>

          {/* Toggle mode */}
          <p className="text-center text-xs text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); setStatus('idle'); }}
              className="text-primary font-black hover:underline">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          {mode === 'login' && (
            <p className="text-center text-xs text-muted-foreground -mt-2">
              <Link to="/hub/forgot-password" onClick={onClose} className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                Forgot password?
              </Link>
            </p>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Live Activity Ticker (scrolling social proof) ────────────────────────────
const LIVE_EVENTS = [
  { name: 'Aisha', stars: 3, game: 'Times Tables Challenge' },
  { name: 'Oliver', stars: 2, game: 'Spelling Bee' },
  { name: 'Priya', stars: 3, game: 'Fraction Pizza' },
  { name: 'Noah', stars: 1, game: 'Word Scramble' },
  { name: 'Isla', stars: 3, game: 'Animal Habitats' },
  { name: 'Ethan', stars: 2, game: 'Telling the Time' },
  { name: 'Amara', stars: 3, game: 'Money Maths' },
  { name: 'Luca', stars: 3, game: 'UK Geography' },
  { name: 'Sofia', stars: 2, game: 'Number Bonds' },
  { name: 'James', stars: 3, game: 'Mental Maths Sprint' },
  { name: 'Zara', stars: 3, game: 'Synonyms & Antonyms' },
  { name: 'Harry', stars: 2, game: 'Place Value' },
];

function LiveActivityTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % LIVE_EVENTS.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const ev = LIVE_EVENTS[idx];
  const stars = '⭐'.repeat(ev.stars);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 max-w-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <AnimatePresence mode="wait">
          {visible && (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-bold text-foreground"
            >
              {stars} <span className="font-black">{ev.name}</span> just earned {ev.stars} star{ev.stars !== 1 ? 's' : ''} in <span className="font-black">{ev.game}</span>!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Hero Game Carousel — featured games auto-rotate, filtered by subject ──────
// All games available in the hero, keyed by subject
const HERO_GAMES_BY_SUBJECT: Record<string, Array<{ slug: string; title: string; emoji: string; subject: string; tagline: string; gradFrom: string; gradTo: string }>> = {
  maths: [
    { slug: 'times-table-race',    title: 'Times Table Race',    emoji: '🏎️', subject: 'Maths',   tagline: 'Race through your times tables!',       gradFrom: '#F59E0B', gradTo: '#D97706' },
    { slug: 'number-pop',          title: 'Number Pop',          emoji: '🔢', subject: 'Maths',   tagline: 'Pop the right numbers fast!',            gradFrom: '#F97316', gradTo: '#EA580C' },
    { slug: 'fraction-pizza',      title: 'Fraction Pizza',      emoji: '🍕', subject: 'Maths',   tagline: 'Slice fractions with pizza!',            gradFrom: '#EAB308', gradTo: '#CA8A04' },
    { slug: 'mental-maths-sprint', title: 'Mental Maths Sprint', emoji: '⚡', subject: 'Maths',   tagline: 'Sprint through mental maths!',           gradFrom: '#F59E0B', gradTo: '#B45309' },
    { slug: 'coin-counter',        title: 'Coin Counter',        emoji: '💰', subject: 'Maths',   tagline: 'Count UK coins & make change!',          gradFrom: '#16A34A', gradTo: '#15803D' },
  ],
  spelling: [
    { slug: 'spelling-bee',        title: 'Spelling Bee',        emoji: '🐝', subject: 'Spelling', tagline: 'Spell your way to the top!',            gradFrom: '#EF4444', gradTo: '#DC2626' },
    { slug: 'word-wizard',         title: 'Word Wizard',         emoji: '🧙', subject: 'Spelling', tagline: 'Cast spells with perfect spelling!',    gradFrom: '#EC4899', gradTo: '#DB2777' },
    { slug: 'phonics-parrot',      title: 'Phonics Parrot',      emoji: '🦜', subject: 'Spelling', tagline: 'Learn phonics with Polly Parrot!',      gradFrom: '#F43F5E', gradTo: '#E11D48' },
    { slug: 'word-scramble',       title: 'Word Scramble',       emoji: '🔀', subject: 'Spelling', tagline: 'Unscramble the letters!',               gradFrom: '#EF4444', gradTo: '#B91C1C' },
    { slug: 'anagram-attack',      title: 'Anagram Attack',      emoji: '💥', subject: 'Spelling', tagline: 'Crack the anagram challenge!',          gradFrom: '#DC2626', gradTo: '#991B1B' },
  ],
  reading: [
    { slug: 'reading-quest',       title: 'Reading Quest',       emoji: '📖', subject: 'Reading', tagline: 'Go on a reading adventure!',            gradFrom: '#22C55E', gradTo: '#16A34A' },
    { slug: 'story-builder',       title: 'Story Builder',       emoji: '📝', subject: 'Reading', tagline: 'Build amazing stories!',                gradFrom: '#10B981', gradTo: '#059669' },
    { slug: 'comprehension-quest', title: 'Comprehension Quest', emoji: '🔍', subject: 'Reading', tagline: 'Read, think and answer!',               gradFrom: '#34D399', gradTo: '#10B981' },
    { slug: 'word-search',         title: 'Word Search',         emoji: '🔎', subject: 'Reading', tagline: 'Find the hidden words!',                gradFrom: '#22C55E', gradTo: '#15803D' },
    { slug: 'sentence-scramble',   title: 'Sentence Scramble',   emoji: '📜', subject: 'Reading', tagline: 'Put the sentences in order!',           gradFrom: '#16A34A', gradTo: '#166534' },
  ],
  science: [
    { slug: 'animal-habitats',     title: 'Animal Habitats',     emoji: '🌍', subject: 'Science', tagline: 'Match animals to their homes!',         gradFrom: '#3B82F6', gradTo: '#2563EB' },
    { slug: 'science-lab',         title: 'Science Lab',         emoji: '🔬', subject: 'Science', tagline: 'Run cool experiments!',                 gradFrom: '#6366F1', gradTo: '#4F46E5' },
    { slug: 'nature-explorer',     title: 'Nature Explorer',     emoji: '🌿', subject: 'Science', tagline: 'Explore the natural world!',            gradFrom: '#0EA5E9', gradTo: '#0284C7' },
    { slug: 'animal-kingdom',      title: 'Animal Kingdom',      emoji: '🦁', subject: 'Science', tagline: 'Discover the animal kingdom!',          gradFrom: '#3B82F6', gradTo: '#1D4ED8' },
    { slug: 'geography-quiz',      title: 'Geography Quiz',      emoji: '🗺️', subject: 'Science', tagline: 'Test your world knowledge!',            gradFrom: '#0EA5E9', gradTo: '#0369A1' },
  ],
};

// Default "all subjects" rotation
const HERO_FEATURED_DEFAULT = [
  HERO_GAMES_BY_SUBJECT.maths[0],
  HERO_GAMES_BY_SUBJECT.spelling[0],
  HERO_GAMES_BY_SUBJECT.reading[0],
  HERO_GAMES_BY_SUBJECT.science[0],
];

function HeroGameCarousel({
  onPlayGame,
  activeSubject,
}: {
  onPlayGame: (slug: string) => void;
  activeSubject: string | null;
}) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const games = activeSubject
    ? (HERO_GAMES_BY_SUBJECT[activeSubject] ?? HERO_FEATURED_DEFAULT)
    : HERO_FEATURED_DEFAULT;

  // Reset to first slide and restart timer whenever subject changes
  React.useEffect(() => {
    setActive(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(i => (i + 1) % games.length), 3200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubject]);

  const game = games[active] ?? games[0];

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      {/* TV frame */}
      <div className="relative w-full">
        {/* TV outer shell */}
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white" style={{ minHeight: '240px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSubject ?? 'all'}-${active}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' as const }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
              style={{ background: `linear-gradient(135deg, ${game.gradFrom}, ${game.gradTo})` }}
            >
              {/* Subject pill */}
              <span className="px-3 py-1 rounded-full bg-white/25 text-white text-xs font-black backdrop-blur-sm">
                {game.subject}
              </span>
              {/* Emoji */}
              <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                className="text-7xl leading-none select-none"
              >
                {game.emoji}
              </motion.div>
              {/* Title */}
              <div>
                <p className="text-white font-black text-xl leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {game.title}
                </p>
                <p className="text-white/80 text-sm font-bold mt-1">{game.tagline}</p>
              </div>
              {/* Play button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlayGame(game.slug)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white font-black text-sm shadow-lg"
                style={{ color: game.gradFrom }}
              >
                <Play size={14} fill="currentColor" />
                Play now
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subject label strip below the TV */}
        {activeSubject && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-sm border border-white/30">
              Showing {activeSubject.charAt(0).toUpperCase() + activeSubject.slice(1)} games · {active + 1} of {games.length}
            </span>
          </motion.div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2">
        {games.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Show game ${i + 1}`}
            className={`rounded-full transition-all ${i === active ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Label */}
      {!activeSubject && (
        <p className="text-white/60 text-xs font-bold">Featured games · {active + 1} of {games.length}</p>
      )}
    </div>
  );
}

// Optional prop: when rendered from the homepage icon picker, initialCat
// pre-filters the grid to that subject without needing a URL param change.
export default function GamesPage({ initialCat, initialAge }: { initialCat?: string; initialAge?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAge, setSelectedAge] = useState(() => {
    if (initialAge) return initialAge;
    return resolveAgeParam(searchParams.get('age'));
  });
  const [selectedCat, setSelectedCat] = useState(() => {
    // initialCat (from homepage icon picker) takes priority over URL param
    if (initialCat) return `cat-${initialCat}`;
    return searchParams.get('cat') ? `cat-${searchParams.get('cat')}` : 'cat-all';
  });
  const [starsFilter, setStarsFilter] = useState<'all' | 'played' | 'unplayed' | '3stars'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'popular'>('default');
  const [showPlayableOnly, setShowPlayableOnly] = useState(false);
  // Hero carousel subject — null = all subjects rotating, string = filtered to that subject
  // If initialCat was passed from the homepage picker, pre-select it in the carousel too
  const [heroSubject, setHeroSubject] = useState<string | null>(initialCat ?? null);

  // Simulated play-count data — top games by popularity (seeded, deterministic)
  const POPULAR_GAME_IDS = [
    'game-times-table-race', 'game-spelling-bee', 'game-number-pop',
    'game-word-wizard', 'game-fraction-pizza', 'game-telling-time',
    'game-money-maths', 'game-animal-habitats', 'game-phonics-parrot',
    'game-mental-maths-sprint',
  ];
  const [searchQuery, setSearchQuery] = useState('');

  // ── Auth modal state ────────────────────────────────────────────────────────
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);
  const { isAuthenticated } = useSession();

  // ── Archie speaking state ───────────────────────────────────────────────────
  const [archieSpeaking, setArchieSpeaking] = useState(false);

  // ── Recently played (from localStorage) ────────────────────────────────────
  const [recentlyPlayed, setRecentlyPlayed] = useState<{ id: string; title: string; emoji: string; slug: string; subject: string }[]>([]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('sodafom_game_stars');
      if (!raw) return;
      const map: Record<string, number> = JSON.parse(raw);
      // Map played game IDs back to game data
      const playedSlugs = Object.keys(map).map(k => k.replace('game-', ''));
      const matched = (games.games as { id: string; title: string; emoji: string; slug: string; subject: string }[])
        .filter(g => playedSlugs.includes(g.slug))
        .slice(0, 6);
      setRecentlyPlayed(matched);
    } catch { /* ignore */ }
  }, []);

  // ── Archie tip cycling ──────────────────────────────────────────────────────
  const [archieTipIdx, setArchieTipIdx] = useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setArchieTipIdx(i => (i + 1) % ARCHIE_TIPS.length), 4500);
    return () => clearInterval(t);
  }, []);

  // ── Pricing modal ───────────────────────────────────────────────────────────
  const [showPricing, setShowPricing] = useState(false);

  // ── Cancel subscription flow ────────────────────────────────────────────────
  const [cancelStep, setCancelStep] = useState<'idle' | 'confirm' | 'loading' | 'done' | 'error'>('idle');
  const [cancelMsg, setCancelMsg] = useState('');

  async function handleCancelSubscription() {
    setCancelStep('loading');
    try {
      const res = await fetch(`${API_PREFIX}/subscription/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User cancelled from games page' }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        setCancelStep('done');
        setCancelMsg(data.message ?? 'Your subscription has been cancelled. Access continues until the end of your billing period.');
        setTimeout(() => { setCancelStep('idle'); window.location.reload(); }, 3500);
      } else {
        setCancelStep('error');
        setCancelMsg(data.error ?? 'Could not cancel — please try again or contact support.');
      }
    } catch {
      setCancelStep('error');
      setCancelMsg('Something went wrong. Please try again.');
    }
  }

  // ── Access code pill state ──────────────────────────────────────────────────
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [codeMsg, setCodeMsg] = useState('');
  const codeInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (codeOpen) setTimeout(() => codeInputRef.current?.focus(), 80);
  }, [codeOpen]);

  async function handleRedeemCode() {
    if (!codeValue.trim()) return;
    setCodeStatus('loading');
    try {
      const res = await fetch(`${API_PREFIX}/promo/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeValue.trim() }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string; requiresAuth?: boolean; validCode?: string };
      if (res.ok && data.success) {
        setCodeStatus('success');
        setCodeMsg(data.message ?? '🎉 Access granted! Enjoy all games!');
        setTimeout(() => { setCodeOpen(false); setCodeStatus('idle'); setCodeValue(''); setCodeMsg(''); window.location.reload(); }, 2200);
      } else if (data.requiresAuth) {
        // Valid code but not logged in — send to signup with code pre-filled
        setCodeStatus('success');
        setCodeMsg('✅ Valid code! Taking you to sign up…');
        setTimeout(() => { navigate(`/hub/signup?code=${encodeURIComponent(data.validCode ?? codeValue.trim())}`); }, 1200);
      } else {
        setCodeStatus('error');
        setCodeMsg(data.error ?? data.message ?? 'That code didn\'t work — please try again.');
      }
    } catch {
      setCodeStatus('error');
      setCodeMsg('Something went wrong — please try again.');
    }
  }

  // Read earned stars from localStorage
  const [earnedStars, setEarnedStars] = useState<Record<string, number>>({});
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('sodafom_game_stars');
      if (raw) setEarnedStars(JSON.parse(raw) as Record<string, number>);
    } catch { /* ignore */ }
  }, []);

  // Keep URL in sync when filters change
  function handleAgeChange(age: string) {
    setSelectedAge(age);
    const params = new URLSearchParams(searchParams);
    if (age === AGE_ALL) {
      params.delete('age');
    } else {
      params.set('age', age.replace('–', '-'));
    }
    setSearchParams(params, { replace: true });
  }

  function handleCatChange(catId: string, opts?: { scrollToGrid?: boolean; playableOnly?: boolean }) {
    setSelectedCat(catId);
    if (opts?.playableOnly !== undefined) {
      setShowPlayableOnly(Boolean(opts.playableOnly));
    }
    const params = new URLSearchParams(searchParams);
    const raw = catId.replace('cat-', '');
    if (raw === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', raw);
    }
    setSearchParams(params, { replace: true });
    if (opts?.scrollToGrid) {
      // Small delay so the filter state updates first, then scroll
      setTimeout(() => {
        const el = document.getElementById('games-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  // Sync state if URL changes externally (e.g. browser back/forward)
  React.useEffect(() => {
    setSelectedAge(resolveAgeParam(searchParams.get('age')));
    const cat = searchParams.get('cat');
    setSelectedCat(cat ? `cat-${cat}` : 'cat-all');
  }, [searchParams]);
  const {
    speak,
    speakingId
  } = useReadAloud();
  const navigate = useNavigate();
  const {
    subscribed
  } = useSubscription();

  const [researchMode, setResearchMode] = useState(() => {
    if (OPEN_TESTING_MODE) return true;
    if (typeof window === 'undefined') return false;
    const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
    return isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true';
  });

  React.useEffect(() => {
    const handleResearchChange = () => {
      const isFreeAccess = localStorage.getItem('sodafom_free_access') === 'true';
      setResearchMode(OPEN_TESTING_MODE || isFreeAccess || localStorage.getItem('sodafom_research_mode') === 'true');
    };
    window.addEventListener('sodafom_research_mode_change', handleResearchChange);
    return () => window.removeEventListener('sodafom_research_mode_change', handleResearchChange);
  }, []);

  const isGameVisible = (game: typeof games.games[number]) => {
    let ageOk = selectedAge === AGE_ALL;
    if (!ageOk) {
      const yearBand = AGE_YEARS.find((a) => a.label === selectedAge);
      if (yearBand) {
        ageOk = yearBand.groups.some((g) => game.ageGroups.includes(g));
      }
    }
    const catId = selectedCat.replace('cat-', '');
    const catOk = selectedCat === 'cat-all' || game.subject === catId;
    const stars = earnedStars[game.id] ?? 0;
    const starsOk =
      starsFilter === 'all'      ? true :
      starsFilter === 'played'   ? stars > 0 :
      starsFilter === 'unplayed' ? stars === 0 :
      starsFilter === '3stars'   ? stars >= 3 : true;
    const q = searchQuery.trim().toLowerCase();
    const searchOk = q === '' || game.title.toLowerCase().includes(q) || game.subject.toLowerCase().includes(q);
    const diffOk = difficultyFilter === 'all' || ('difficulty' in game && game.difficulty === difficultyFilter);
    // When "playable only" mode is on (triggered by subject pill), hide locked games
    const playableOk = !showPlayableOnly || subscribed || isDemoGameId(game.id);
    return ageOk && catOk && starsOk && searchOk && diffOk && playableOk;
  };

  // Random game — picks from currently visible games
  const handleRandomGame = useCallback(() => {
    const visible = games.games.filter(isGameVisible);
    if (visible.length === 0) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    const route = GAME_ROUTES[pick.id];
    if (route) navigate(route);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAge, selectedCat, starsFilter, searchQuery, earnedStars, navigate]);

  const visibleCount = games.games.filter(isGameVisible).length;
  const visibleGames = games.games
    .filter(isGameVisible)
    .sort((a, b) => {
      if (sortBy !== 'popular') return 0;
      const ai = POPULAR_GAME_IDS.indexOf(a.id);
      const bi = POPULAR_GAME_IDS.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  return <>
      <Helmet>
        <title>Games & Activities — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Play maths, spelling, and reading games on Sodafom. Fun, age-appropriate activities for children aged 5–13 with read-aloud support." />
        <link rel="canonical" href={`${siteUrl}/games`} />
        <meta property="og:title" content="Games & Activities — Sodafom" />
        <meta property="og:description" content="Fun learning games for children ages 5–13. Maths, spelling, reading and stories." />
        <meta property="og:url" content={`${siteUrl}/games`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Games & Activities — Sodafom" />
        <meta name="twitter:description" content="Fun learning games for children ages 5–13. Maths, spelling, reading and stories." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${siteUrl}/games#webpage`,
          name: 'Games & Activities — Sodafom',
          url: `${siteUrl}/games`,
          description: 'Fun learning games for children ages 5–13. Maths, spelling, reading and stories.',
          isPartOf: {
            '@id': `${siteUrl}/#website`
          },
          about: {
            '@id': `${siteUrl}/#organization`
          }
        })}</script>
      </Helmet>

      <main>
        {/* ── RAINBOW HERO ── */}
        <section className="hero-bg relative overflow-hidden">

          {/* Sky decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Cloud left */}
            <svg className="absolute top-6 left-6 opacity-75" width="130" height="55" viewBox="0 0 130 55" fill="white">
              <ellipse cx="65" cy="38" rx="58" ry="20" />
              <ellipse cx="38" cy="30" rx="30" ry="20" />
              <ellipse cx="92" cy="27" rx="32" ry="20" />
            </svg>
            {/* Cloud right */}
            <svg className="absolute top-8 right-10 opacity-65" width="100" height="44" viewBox="0 0 100 44" fill="white">
              <ellipse cx="50" cy="30" rx="44" ry="16" />
              <ellipse cx="28" cy="24" rx="24" ry="16" />
              <ellipse cx="72" cy="22" rx="26" ry="16" />
            </svg>
            {/* Rainbow arc — top-right */}
            <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '55%', height: '280px' }} viewBox="0 0 500 280" preserveAspectRatio="xMaxYMin meet">
              {[{ r: 340, cls: 'rb-red' }, { r: 318, cls: 'rb-orange' }, { r: 296, cls: 'rb-yellow' }, { r: 274, cls: 'rb-green' }, { r: 252, cls: 'rb-blue' }, { r: 230, cls: 'rb-purple' }].map(b => (
                <circle key={b.r} cx="500" cy="280" r={b.r} fill="none" className={b.cls} strokeWidth="20" opacity="0.85" />
              ))}
            </svg>
            {/* Grass strip */}
            <svg className="absolute bottom-0 left-0 right-0 w-full" style={{ height: '48px' }} viewBox="0 0 1200 48" preserveAspectRatio="none">
              <path className="hero-grass-a" d="M0,30 Q150,8 300,26 Q450,42 600,22 Q750,8 900,28 Q1050,42 1200,24 L1200,48 L0,48 Z" opacity="0.6" />
              <path className="hero-grass-b" d="M0,38 Q200,18 400,34 Q600,46 800,30 Q1000,15 1200,36 L1200,48 L0,48 Z" opacity="0.85" />
            </svg>
          </div>

          {/* Floating stars */}
          {[{ top: '8%', left: '3%', size: 22, delay: 0 }, { top: '18%', left: '18%', size: 16, delay: 0.3 }, { top: '6%', right: '22%', size: 20, delay: 0.6 }, { top: '30%', right: '6%', size: 14, delay: 0.9 }, { top: '55%', left: '2%', size: 18, delay: 0.2 }, { top: '65%', right: '4%', size: 16, delay: 0.5 }].map((s, i) => (
            <motion.div key={i} className="absolute pointer-events-none z-10" style={{ top: s.top, left: (s as { left?: string }).left, right: (s as { right?: string }).right }}
              animate={{ y: [0, -10, 0], rotate: [0, 20, -20, 0] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: s.delay, ease: 'easeInOut' as const }}>
              <Star size={s.size} className="fill-accent text-accent drop-shadow-md" />
            </motion.div>
          ))}

          {/* Ages badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute top-4 right-4 z-20 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white bg-accent">
            <span className="text-accent-foreground font-black text-xs leading-none">Ages</span>
            <span className="text-accent-foreground font-black text-sm leading-none">5–12</span>
          </motion.div>

          {/* Main content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
              <h1 className="text-5xl sm:text-6xl font-black leading-tight text-accent hero-title-shadow" style={{ fontFamily: 'var(--font-heading)' }}>
                {games.hero.headline}
              </h1>
              <p className="text-xl font-black text-white mt-1 hero-sub-shadow">{games.hero.tagline}</p>
            </motion.div>

            {/* Three-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* LEFT — subject icon pills */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col gap-2.5">
                {[
                  { icon: '🔢', label: 'Maths games',    sub: 'Numbers, times tables & logic',   gradFrom: '#F59E0B', gradTo: '#D97706', cat: 'maths',    playSlug: 'times-table-race' },
                  { icon: '🔤', label: 'Spelling games',  sub: 'Words, phonics & vocabulary',     gradFrom: '#EF4444', gradTo: '#DC2626', cat: 'spelling', playSlug: 'spelling-bee' },
                  { icon: '📖', label: 'Reading games',   sub: 'Comprehension & fluency',         gradFrom: '#22C55E', gradTo: '#16A34A', cat: 'reading',  playSlug: 'reading-quest' },
                  { icon: '🔬', label: 'Science games',   sub: 'Nature, experiments & facts',     gradFrom: '#3B82F6', gradTo: '#2563EB', cat: 'science',  playSlug: 'animal-habitats' },
                  { icon: '⭐', label: 'Stars & rewards', sub: 'Earn stars, unlock badges',       gradFrom: '#FFD700', gradTo: '#F59E0B', cat: null,       playSlug: null },
                ].map((f, i) => (
                  <motion.div key={f.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}>
                    {f.cat ? (
                      <button
                        onClick={() => {
                          // Navigate directly to the featured game for this subject
                          if (f.playSlug) {
                            navigate(`/games/${f.playSlug}`);
                          } else {
                            // Fallback: filter the grid
                            const next = heroSubject === f.cat ? null : f.cat;
                            setHeroSubject(next);
                            handleCatChange(`cat-${f.cat}`, { scrollToGrid: true, playableOnly: true });
                          }
                        }}
                        className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all cursor-pointer text-left relative ${heroSubject === f.cat ? 'ring-4 ring-white ring-offset-2 ring-offset-transparent scale-105' : ''}`}
                        style={{ background: `linear-gradient(135deg, ${f.gradFrom}, ${f.gradTo})` }}
                      >
                        <span className="text-2xl shrink-0 w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">{f.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-black text-sm leading-tight">{f.label}</p>
                          <p className="text-white/80 text-xs leading-tight">{f.sub}</p>
                        </div>
                        {heroSubject === f.cat ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                          >
                            <span className="text-xs" style={{ color: f.gradFrom }}>✓</span>
                          </motion.span>
                        ) : (
                          <Play size={14} className="text-white/90 shrink-0 fill-white/90" />
                        )}
                      </button>
                    ) : (
                      <Link to="/rewards"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${f.gradFrom}, ${f.gradTo})` }}
                      >
                        <span className="text-2xl shrink-0 w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center">{f.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-black text-sm leading-tight">{f.label}</p>
                          <p className="text-white/80 text-xs leading-tight">{f.sub}</p>
                        </div>
                      </Link>
                    )}
                  </motion.div>
                ))}
                <div className="mt-1 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/30 hero-glass">
                  <p className="text-white text-xs leading-relaxed font-semibold">
                    <span className="text-accent font-black">{games.games.length} games</span> across 4 subjects — tap a pill to jump straight to that subject!
                  </p>
                </div>

                {/* ── Gold Access Code pill ── */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setCodeOpen(o => !o); setCodeStatus('idle'); setCodeMsg(''); }}
                    className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer text-left border-2 bg-accent border-accent/60"
                  >
                    <span className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
                      <Key size={20} className="text-accent-foreground" />
                    </span>
                    <div className="flex-1">
                      <p className="text-accent-foreground font-black text-sm leading-tight">Have an access code?</p>
                      <p className="text-accent-foreground/70 text-xs leading-tight">Enter it here to unlock all games</p>
                    </div>
                    <motion.span
                      animate={{ rotate: codeOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} className="text-accent-foreground/80 shrink-0" />
                    </motion.span>
                  </motion.button>

                  {/* Expandable code input */}
                  <AnimatePresence>
                    {codeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 rounded-2xl p-4 shadow-xl border-2 border-accent/40 bg-card"
                      >
                        {codeStatus === 'success' ? (
                          <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                            <CheckCircle2 size={18} className="shrink-0 text-green-500" />
                            <span>{codeMsg}</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-foreground font-black text-sm mb-2">Enter your access code</p>
                            <div className="flex gap-2">
                              <input
                                ref={codeInputRef}
                                type="text"
                                value={codeValue}
                                onChange={e => { setCodeValue(e.target.value); setCodeStatus('idle'); setCodeMsg(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleRedeemCode()}
                                placeholder="Enter code"
                                maxLength={12}
                                className="flex-1 rounded-xl border-2 border-accent bg-accent/10 px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent tracking-widest uppercase"
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRedeemCode}
                                disabled={codeStatus === 'loading' || !codeValue.trim()}
                                className="px-4 py-2 rounded-xl font-black text-sm bg-accent text-accent-foreground shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 hover:bg-accent/90 transition-colors"
                              >
                                {codeStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                                {codeStatus === 'loading' ? 'Checking…' : 'Unlock'}
                              </motion.button>
                            </div>
                            {codeStatus === 'error' && (
                              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1.5 text-destructive text-xs font-bold">
                                <AlertCircle size={13} /> {codeMsg}
                              </motion.p>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>

              {/* CENTRE — animated game preview carousel */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col items-center gap-4">
                <HeroGameCarousel onPlayGame={(slug) => navigate(`/games/${slug}`)} activeSubject={heroSubject} />

                {/* CTAs */}
                {!researchMode && (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link to="/subscribe" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-base shadow-lg hover:scale-105 active:scale-95 transition-transform bg-accent text-accent-foreground">
                      <Zap size={18} />
                      Start 7-Day Free Trial
                    </Link>
                    <Link to="/demo" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-base text-white border-2 border-white/50 hover:bg-white/20 transition-all">
                      <Star size={16} className="fill-accent text-accent" />
                      Try Free Demo
                      <ChevronRight size={18} />
                    </Link>
                    <p className="text-white/70 text-xs text-center">7 days free · then £1/month · cancel anytime</p>
                  </div>
                )}
                {researchMode && (
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-base shadow-lg bg-green-500 text-white">
                      <ShieldCheck size={18} />
                      Research Mode Active
                    </div>
                    <p className="text-white/80 text-sm text-center font-bold">All 127 games are currently unlocked for testing.</p>
                  </div>
                )}
              </motion.div>

              {/* RIGHT — Archie mascot + action buttons */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col items-center gap-3">

                {/* Archie bouncing with gold glow — tap to SPEAK */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="relative cursor-pointer"
                  onClick={() => {
                    if (archieSpeaking) {
                      window.speechSynthesis?.cancel();
                      setArchieSpeaking(false);
                      return;
                    }
                    setArchieSpeaking(true);
                    ttsSpeak(ARCHIE_INTRO_LINES, () => setArchieSpeaking(false));
                  }}
                  title={archieSpeaking ? 'Tap to stop Archie' : 'Tap Archie to hear about Sodafom!'}
                >
                  {/* Orbiting subject bubbles */}
                  {[
                    { emoji: '🔢', label: 'Maths',    angle: 0,   radius: 100, dur: 8  },
                    { emoji: '✏️', label: 'Spelling', angle: 90,  radius: 100, dur: 10 },
                    { emoji: '📖', label: 'Reading',  angle: 180, radius: 100, dur: 9  },
                    { emoji: '🔬', label: 'Science',  angle: 270, radius: 100, dur: 11 },
                  ].map((b) => (
                    <motion.div
                      key={b.label}
                      className="absolute z-20 pointer-events-none"
                      style={{ top: '50%', left: '50%' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: b.dur, repeat: Infinity, ease: 'linear' as const }}
                    >
                      <motion.div
                        style={{ x: b.radius, y: -10 }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: b.dur, repeat: Infinity, ease: 'linear' as const }}
                        className="w-10 h-10 rounded-full bg-white/90 shadow-md flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                      >
                        <span className="text-base leading-none">{b.emoji}</span>
                        <span className="text-[8px] font-black text-foreground leading-none mt-0.5">{b.label}</span>
                      </motion.div>
                    </motion.div>
                  ))}
                  <motion.div
                    animate={{ scale: archieSpeaking ? [1, 1.25, 1] : [1, 1.12, 1], opacity: archieSpeaking ? [0.7, 0.2, 0.7] : [0.5, 0.15, 0.5] }}
                    transition={{ duration: archieSpeaking ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                    className="absolute -inset-4 rounded-full bg-accent pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: archieSpeaking ? [1, 1.18, 1] : [1, 1.08, 1], opacity: archieSpeaking ? [0.5, 0.1, 0.5] : [0.35, 0.08, 0.35] }}
                    transition={{ duration: archieSpeaking ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.4 }}
                    className="absolute -inset-2 rounded-full bg-accent pointer-events-none"
                  />
                  <ArchieCharacter size={160} className="relative z-10 drop-shadow-2xl" />
                </motion.div>

                {/* Archie label */}
                <div className="text-center">
                  <p className="text-white font-black text-lg hero-sub-shadow leading-tight">Hi, I'm Archie! 👋</p>
                  <p className="text-white/80 text-xs font-semibold mt-0.5">
                    {archieSpeaking ? '🔊 Tap me to stop…' : 'Tap me to hear about Sodafom!'}
                  </p>
                </div>

                {/* Archie cycling tip bubble */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={archieTipIdx}
                    initial={{ opacity: 0, scale: 0.92, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="relative bg-card rounded-2xl px-4 py-3 shadow-lg w-full max-w-[220px] border-2 border-accent/30"
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '12px solid hsl(var(--card))' }} />
                    <p className="text-foreground text-xs font-bold text-center leading-snug">
                      {ARCHIE_TIPS[archieTipIdx]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* ── 3 uniform pill-cards matching left column style ── */}
                <div className="flex flex-col gap-2.5 w-full max-w-[220px]">

                  {/* 1 — Ask Archie (primary green) */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
                    <Link to="/ask-archie"
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-primary hover:scale-105 hover:shadow-lg active:scale-95 transition-all w-full"
                    >
                      <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-white/30 overflow-hidden">
                        <ArchieCharacter size={36} />
                      </span>
                      <div className="flex-1">
                        <p className="text-primary-foreground font-black text-sm leading-tight">Ask Archie</p>
                        <p className="text-primary-foreground/75 text-xs leading-tight">AI learning helper</p>
                      </div>
                      <ChevronRight size={14} className="text-primary-foreground/70 shrink-0" />
                    </Link>
                  </motion.div>

                  {/* 2 — Login (shown when not authenticated) */}
                  {!isAuthenticated && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.43 }}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setAuthModal('login')}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-primary/90 hover:bg-primary hover:shadow-lg transition-all w-full border-2 border-primary/60"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
                          <LogIn size={20} className="text-primary-foreground" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-primary-foreground font-black text-sm leading-tight">Log In</p>
                          <p className="text-primary-foreground/75 text-xs leading-tight">Access your account</p>
                        </div>
                        <ChevronRight size={14} className="text-primary-foreground/70 shrink-0" />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* 3 — Sign Up / See Prices (accent gold) */}
                  {!isAuthenticated && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.51 }}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setAuthModal('signup')}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-accent hover:shadow-lg transition-all w-full border-2 border-accent/60"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
                          <UserPlus size={20} className="text-accent-foreground" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-accent-foreground font-black text-sm leading-tight">Sign Up Free</p>
                          <p className="text-accent-foreground/75 text-xs leading-tight">7-day free trial</p>
                        </div>
                        <ChevronRight size={14} className="text-accent-foreground/70 shrink-0" />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Hub link when authenticated */}
                  {isAuthenticated && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.43 }}>
                      <Link to="/hub"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-primary hover:shadow-lg transition-all w-full border-2 border-primary/60"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
                          <Star size={20} className="text-primary-foreground fill-current" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-primary-foreground font-black text-sm leading-tight">My Hub</p>
                          <p className="text-primary-foreground/75 text-xs leading-tight">Stars, badges & progress</p>
                        </div>
                        <ChevronRight size={14} className="text-primary-foreground/70 shrink-0" />
                      </Link>
                    </motion.div>
                  )}

                  {/* See Prices pill — always visible */}
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: isAuthenticated ? 0.43 : 0.59 }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowPricing(true)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-secondary hover:shadow-lg transition-all w-full border-2 border-secondary/60"
                    >
                      <span className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
                        <Crown size={20} className="text-white" />
                      </span>
                      <div className="flex-1 text-left">
                        <p className="text-white font-black text-sm leading-tight">See Prices</p>
                        <p className="text-white/75 text-xs leading-tight">From £1/month</p>
                      </div>
                      <ChevronRight size={14} className="text-white/70 shrink-0" />
                    </motion.button>
                  </motion.div>

                  {/* 3 — Cancel Subscription (destructive red, only when subscribed) */}
                  {subscribed && cancelStep === 'idle' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.51 }}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setCancelStep('confirm')}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-md bg-destructive hover:shadow-lg transition-all w-full border-2 border-destructive/60"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
                          <XCircle size={20} className="text-destructive-foreground" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-destructive-foreground font-black text-sm leading-tight">Cancel Subscription</p>
                          <p className="text-destructive-foreground/75 text-xs leading-tight">Stops bank payment too</p>
                        </div>
                        <ChevronRight size={14} className="text-destructive-foreground/70 shrink-0" />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Cancel confirm step */}
                  {subscribed && cancelStep === 'confirm' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-card border-2 border-destructive/40 p-3 shadow-xl"
                    >
                      <p className="text-foreground font-black text-xs text-center mb-2 leading-snug">
                        ⚠️ This cancels your subscription <span className="text-destructive">and stops your bank payment</span>. You keep access until the end of your billing period.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setCancelStep('idle')}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                          Keep it
                        </button>
                        <button onClick={handleCancelSubscription}
                          className="flex-1 py-2 rounded-xl text-xs font-black bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                          Yes, cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Cancel loading */}
                  {cancelStep === 'loading' && (
                    <div className="flex items-center justify-center gap-2 py-3 text-white text-xs font-bold">
                      <Loader2 size={14} className="animate-spin" /> Cancelling…
                    </div>
                  )}

                  {/* Cancel done */}
                  {cancelStep === 'done' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-2xl bg-card border-2 border-green-400 p-3 text-center">
                      <CheckCircle2 size={18} className="text-green-500 mx-auto mb-1" />
                      <p className="text-foreground text-xs font-bold leading-snug">{cancelMsg}</p>
                    </motion.div>
                  )}

                  {/* Cancel error */}
                  {cancelStep === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-2xl bg-card border-2 border-destructive/40 p-3 text-center">
                      <p className="text-destructive text-xs font-bold leading-snug">{cancelMsg}</p>
                      <button onClick={() => setCancelStep('idle')} className="mt-1 text-xs text-muted-foreground underline">Dismiss</button>
                    </motion.div>
                  )}

                </div>
              </motion.div>

            </div>
          </div>

          {/* Trust strip */}
          <div className="hero-dark-strip relative z-10 border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: '🎮', title: `${games.games.length} fun games`, sub: 'Always growing' },
                  { icon: '🔊', title: 'Read-aloud on every game', sub: 'Tap to hear instructions' },
                  { icon: '⭐', title: 'Earn stars & badges', sub: 'Celebrate every win' },
                  { icon: '🔒', title: 'Safe for kids', sub: 'No ads, no data sharing' },
                ].map(b => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <p className="text-white font-black text-xs leading-tight">{b.title}</p>
                      <p className="text-white/65 text-xs leading-tight mt-0.5">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WEEKLY CHALLENGE BANNER ── */}
        {games.weeklyChallenge && (() => {
          const wc = games.weeklyChallenge;
          const route = GAME_ROUTES[wc.gameId];
          return (
            <section className="bg-accent py-5 border-b-4 border-accent/60">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                  variants={fadeUp} initial="hidden" animate="visible"
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/20 rounded-2xl px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                      className="text-4xl select-none"
                    >
                      {wc.emoji}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/30 text-accent-foreground text-xs font-black">
                          🏆 Weekly Challenge
                        </span>
                      </div>
                      <p className="font-black text-accent-foreground text-lg leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {wc.title}
                      </p>
                      <p className="text-accent-foreground/80 text-sm">{wc.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                    <p className="text-accent-foreground/70 text-xs font-bold text-center sm:text-right max-w-[200px]">{wc.prize}</p>
                    {route && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(route)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-foreground text-accent font-black text-sm shadow-md hover:opacity-90 transition-opacity"
                      >
                        <Play size={14} className="fill-current" /> Play Challenge
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })()}

        {/* ── FILTERS ── */}
        <section id="games-grid" className="bg-muted py-6 sticky top-[64px] md:top-[80px] z-30 border-b border-border shadow-sm">
          <div className="max-w-6xl mx-auto px-4 flex flex-col gap-4">
            {/* Game of the Week featured card */}
            {(() => {
              const allGames = games.games as { id: string; title: string; emoji: string; subject: string; slug: string }[];
              if (!allGames.length) return null;
              const now = new Date();
              const startOfYear = new Date(now.getFullYear(), 0, 1);
              const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
              const gotw = allGames[weekNum % allGames.length];
              const slug = gotw.slug ?? gotw.id.replace('game-', '');
              const subjectEmojis: Record<string, string> = { maths: '🔢', spelling: '🔤', reading: '📖', science: '🔬', art: '🎨' };
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' as const }}
                  className="relative rounded-2xl overflow-hidden border-2 border-accent/50 bg-gradient-to-r from-accent/10 via-background to-primary/10 p-4 sm:p-5 flex items-center gap-4"
                >
                  <div className="absolute top-2 right-3 text-xs font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/30">
                    ⭐ Game of the Week
                  </div>
                  <span className="text-5xl shrink-0">{gotw.emoji}</span>
                  <div className="flex-1 min-w-0 pr-20">
                    <div className="font-black text-foreground text-lg leading-tight truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {gotw.title}
                    </div>
                    <div className="text-muted-foreground text-sm capitalize flex items-center gap-1.5 mt-0.5">
                      <span>{subjectEmojis[gotw.subject] ?? '🎮'}</span>
                      <span>{gotw.subject}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/games/${slug}`}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-md"
                    >
                      Play now
                    </Link>
                    <Link
                      to="/game-of-the-week"
                      className="hidden sm:flex px-3 py-2 rounded-xl border border-border text-foreground font-bold text-sm hover:border-primary/40 transition-colors"
                    >
                      Learn more
                    </Link>
                  </div>
                </motion.div>
              );
            })()}

            {/* Battle CTA + Surprise Me */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <SurpriseMeButton
                games={games.games as GameEntry[]}
                selectedCat={selectedCat}
                selectedAge={selectedAge}
                ageYears={AGE_YEARS}
                ageAll={AGE_ALL}
              />
              <Link
                to="/battle"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-black text-sm hover:opacity-90 transition-opacity shadow-sm"
              >
                <Swords size={15} /> Challenge a Friend
              </Link>
            </div>

            {/* Age filter label */}
            <div className="text-center">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-2">
                Filter by your child's age
              </p>
            </div>

            {/* Age filter — individual year bands with icons */}
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by age">
              {/* All ages button */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAgeChange(AGE_ALL)}
                aria-pressed={selectedAge === AGE_ALL}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                  selectedAge === AGE_ALL
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-foreground border-border hover:border-primary/50'
                }`}
              >
                <span>🌈</span>
                <span>All ages</span>
              </motion.button>

              {/* Individual year buttons */}
              {AGE_YEARS.map((yr) => {
                const isActive = selectedAge === yr.label;
                // Count games visible for this age band
                const count = games.games.filter(g =>
                  yr.groups.some(grp => g.ageGroups.includes(grp))
                ).length;
                return (
                  <motion.button
                    key={yr.label}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAgeChange(yr.label)}
                    aria-pressed={isActive}
                    title={`${yr.display} — ${count} games`}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl font-bold text-xs border-2 transition-all min-w-[60px] ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/30'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg leading-none">{yr.emoji}</span>
                    <span>{yr.label}</span>
                    <span className={`text-[10px] leading-none font-normal ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {count} games
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {/* Subject/category filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {games.categories.map(cat => {
              const isActive = selectedCat === cat.id;
              // Count games in this category
              const catSubject = cat.id.replace('cat-', '');
              const catCount = cat.id === 'cat-all'
                ? games.games.length
                : games.games.filter(g => g.subject === catSubject).length;
              return <motion.button key={cat.id} whileHover={{
                scale: 1.06
              }} whileTap={{
                scale: 0.95
              }} onClick={() => { handleCatChange(cat.id, { playableOnly: false }); setShowPlayableOnly(false); }} className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${isActive ? 'bg-accent text-accent-foreground border-accent shadow-md' : 'bg-card text-foreground border-border hover:border-accent/50'}`}>
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30 text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{catCount}</span>
                  </motion.button>;
            })}
            </div>
            {/* Stars / progress filter */}
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by progress">
              {([
                { id: 'all',      label: 'All games',    emoji: '🎮' },
                { id: 'unplayed', label: 'Not played',   emoji: '🆕' },
                { id: 'played',   label: 'Played',       emoji: '✅' },
                { id: '3stars',   label: '3 stars ⭐⭐⭐', emoji: '🏆' },
              ] as const).map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStarsFilter(opt.id)}
                  aria-pressed={starsFilter === opt.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                    starsFilter === opt.id
                      ? 'bg-yellow-400 text-yellow-900 border-yellow-400 shadow-md'
                      : 'bg-card text-foreground border-border hover:border-yellow-300'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Sort bar */}
            <div className="flex items-center justify-center gap-2" role="group" aria-label="Sort games">
              <span className="text-xs font-bold text-muted-foreground">Sort:</span>
              {([
                { id: 'default', label: 'Default',      emoji: '📋' },
                { id: 'popular', label: 'Most Popular',  emoji: '🔥' },
              ] as const).map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy(opt.id)}
                  aria-pressed={sortBy === opt.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                    sortBy === opt.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center justify-center gap-2" role="group" aria-label="Filter by difficulty">
              <span className="text-xs font-bold text-muted-foreground">Difficulty:</span>
              {([
                { id: 'all',    label: 'All',    emoji: '🎮' },
                { id: 'Easy',   label: 'Easy',   emoji: '🟢' },
                { id: 'Medium', label: 'Medium', emoji: '🟡' },
                { id: 'Hard',   label: 'Hard',   emoji: '🔴' },
              ] as const).map(opt => (
                <motion.button
                  key={opt.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficultyFilter(opt.id)}
                  aria-pressed={difficultyFilter === opt.id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${
                    difficultyFilter === opt.id
                      ? 'bg-secondary text-white border-secondary shadow-md'
                      : 'bg-card text-foreground border-border hover:border-secondary/40'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Live Activity ticker */}
            <LiveActivityTicker />

            {/* Recently Played strip */}
            {recentlyPlayed.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Recently played</p>
                <div className="flex gap-2 flex-wrap">
                  {recentlyPlayed.map(g => (
                    <Link
                      key={g.id}
                      to={`/games/${g.slug}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold text-foreground"
                    >
                      <span>{g.emoji}</span>
                      <span>{g.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Search bar + Random game button */}
            <div className="flex gap-2 items-center max-w-xl mx-auto w-full">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search games by name or subject…"
                  aria-label="Search games"
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-border bg-card text-foreground text-sm font-semibold placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.06, rotate: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRandomGame}
                title="Play a random game!"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm bg-primary text-primary-foreground border-2 border-primary shadow-sm hover:shadow-md transition-all shrink-0"
              >
                <Shuffle size={16} />
                <span className="hidden sm:inline">Random!</span>
              </motion.button>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-16 bg-muted/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <p className="text-primary font-bold text-sm mb-2 uppercase tracking-wide">Simple to start</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                How Sodafom works
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  emoji: '🎮',
                  title: 'Pick a game',
                  desc: 'Browse 118 games across Maths, Spelling, Reading and Science. Filter by age or subject.',
                  color: 'bg-blue-100 border-blue-300 text-blue-800',
                  connector: true,
                },
                {
                  step: '2',
                  emoji: '⭐',
                  title: 'Play & earn stars',
                  desc: 'Complete games to earn stars. Score 3 stars for a perfect game and unlock achievement badges.',
                  color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
                  connector: true,
                },
                {
                  step: '3',
                  emoji: '📈',
                  title: 'Track progress',
                  desc: 'Parents see every game played, stars earned, and streaks from the Hub dashboard.',
                  color: 'bg-green-100 border-green-300 text-green-800',
                  connector: false,
                },
              ].map((item, i) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.12 }}
                    className={`w-full rounded-3xl border-2 p-6 flex flex-col items-center gap-3 ${item.color}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center font-black text-lg shadow-sm">
                      {item.step}
                    </div>
                    <div className="text-4xl">{item.emoji}</div>
                    <h3 className="font-black text-lg leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed opacity-85">{item.desc}</p>
                  </motion.div>
                  {/* Connector arrow — hidden on mobile */}
                  {item.connector && (
                    <div className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center">
                      <ChevronRight size={22} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.4 }}
              className="text-center mt-8"
            >
              <button
                onClick={() => setShowPricing(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black text-base hover:opacity-90 transition-opacity shadow-md"
              >
                Start free — 7 days free <ChevronRight size={18} />
              </button>
              <p className="text-muted-foreground text-xs mt-2">No card required · Cancel anytime</p>
            </motion.div>
          </div>
        </section>

        {/* ── PARENT TRUST SECTION ── */}
        <section className="py-12 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
            >
              {[
                { emoji: '🔒', label: 'GDPR compliant', sub: 'Your data is safe' },
                { emoji: '📚', label: 'UK curriculum aligned', sub: 'KS1, KS2 & KS3' },
                { emoji: '🚫', label: 'Zero adverts', sub: 'No distractions' },
                { emoji: '👶', label: 'Safe for children', sub: 'No external links' },
                { emoji: '🏆', label: '118 games', sub: 'Always growing' },
                { emoji: '⭐', label: '7-day free trial', sub: 'No card needed' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-2xl px-4 py-2.5"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-black text-foreground leading-tight">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── GAME GRID ── */}
        <section className="py-14 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ── NEW THIS WEEK strip ── */}
            {(() => {
              const newGames = games.games.filter((g: { isNew?: boolean; slug: string }) => g.isNew);
              if (!newGames.length) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-5 py-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary text-primary-foreground text-xs font-black px-2.5 py-1 rounded-full">✨ New this week</span>
                    <span className="text-xs text-muted-foreground font-bold">{newGames.length} new game{newGames.length !== 1 ? 's' : ''} added!</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newGames.map((g: { slug: string; emoji: string; title: string; subject: string }) => {
                      const href = GAME_ROUTES[`game-${g.slug}` as keyof typeof GAME_ROUTES] ?? `/games/${g.slug}`;
                      return (
                        <Link
                          key={g.slug}
                          to={href}
                          className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5 text-sm font-bold text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <span>{g.emoji}</span>
                          <span>{g.title}</span>
                          <span className="text-xs text-muted-foreground capitalize">· {g.subject}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}

            {/* Result count + clear filters */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              {/* Playable-only banner */}
              {showPlayableOnly && !subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-800 text-sm font-bold"
                >
                  <span>
                    {selectedCat === 'cat-maths' ? '🔢' : selectedCat === 'cat-spelling' ? '🔤' : selectedCat === 'cat-reading' ? '📖' : '🔬'}{' '}
                    Showing {selectedCat === 'cat-maths' ? 'maths' : selectedCat === 'cat-spelling' ? 'spelling' : selectedCat === 'cat-reading' ? 'reading' : 'science'} games you can play right now — <span className="font-black">free games only</span>
                  </span>
                  <button onClick={() => setShowPlayableOnly(false)} className="text-xs font-black underline hover:no-underline shrink-0">Show all</button>
                </motion.div>
              )}
              {showPlayableOnly && subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-green-50 border-2 border-green-300 text-green-800 text-sm font-bold"
                >
                  <span>
                    {selectedCat === 'cat-maths' ? '🔢' : selectedCat === 'cat-spelling' ? '🔤' : selectedCat === 'cat-reading' ? '📖' : '🔬'}{' '}
                    Showing all {selectedCat === 'cat-maths' ? 'maths' : selectedCat === 'cat-spelling' ? 'spelling' : selectedCat === 'cat-reading' ? 'reading' : 'science'} games — <span className="font-black">all unlocked!</span> ⭐
                  </span>
                  <button onClick={() => setShowPlayableOnly(false)} className="text-xs font-black underline hover:no-underline shrink-0">Show all subjects</button>
                </motion.div>
              )}
              <motion.p key={`${selectedAge}-${selectedCat}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm font-bold">
                {visibleGames.length === 0 ? 'No games match — try a different filter!' : `Showing ${visibleGames.length} of ${games.games.length} games`}
              </motion.p>
              {(selectedAge !== AGE_ALL || selectedCat !== 'cat-all' || starsFilter !== 'all' || difficultyFilter !== 'all' || searchQuery !== '') && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { handleAgeChange(AGE_ALL); handleCatChange('cat-all', { playableOnly: false }); setStarsFilter('all'); setSearchQuery(''); setShowPlayableOnly(false); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary hover:text-white transition-all"
                >
                  <X size={11} /> Clear filters
                </motion.button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`${selectedAge}-${selectedCat}-${sortBy}`} variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleGames.map((game, gameIndex) => {
                const cfg = subjectConfig[game.subject] ?? subjectConfig['maths'];
                const isSpeaking = speakingId === game.id;
                const isDemo = isDemoGameId(game.id);
                const isLocked = !Boolean(subscribed) && !isDemo && !researchMode;
                const popularRank = POPULAR_GAME_IDS.indexOf(game.id);
                const isTopPopular = sortBy === 'popular' && popularRank >= 0 && gameIndex < 5;
                return <motion.div key={game.id} variants={cardAnim} whileHover={{
                  scale: 1.02,
                  y: -4
                }} className={`rounded-2xl overflow-hidden border-2 shadow-sm flex flex-col ${cfg.border} relative`}>
                      {/* Free / Locked badge */}
                      {isDemo && <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black shadow-md">
                          <Star size={10} className="fill-current" /> Free
                        </div>}
                      {(!isDemo && isLocked) ? <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/80 text-background text-xs font-black shadow-md">
                          <Lock size={10} /> Premium
                        </div> : (null as any)}
                      {/* NEW badge */}
                      {'isNew' in game && game.isNew && !isTopPopular && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-white text-xs font-black shadow-md animate-pulse">
                          ✨ New
                        </div>
                      )}
                      {/* Most Popular badge — top 5 when sorted by popular */}
                      {isTopPopular && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-black shadow-md">
                          🔥 #{gameIndex + 1} Popular
                        </div>
                      )}

                      {/* Card header — subject-coloured banner with logo circle */}
                      <div
                        className={`relative h-40 rounded-t-2xl overflow-hidden flex flex-col items-center justify-center gap-2 ${isLocked ? 'opacity-75' : ''}`}
                        style={{ background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})` }}
                      >
                        {/* Decorative bubbles */}
                        {dotPositions.map((pos, di) => (
                          <motion.div key={di} className="absolute w-10 h-10 rounded-full bg-white/10" style={{ top: pos.top, left: pos.left }}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2.5 + di * 0.3, repeat: Infinity, delay: di * 0.25, ease: 'easeInOut' as const }} />
                        ))}

                        {/* Subject label pill — top-left */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm border border-white/40">
                          <span className="text-xs">{cfg.subjectEmoji}</span>
                          <span className="text-white text-xs font-black">{cfg.label}</span>
                        </div>

                        {/* Central logo circle */}
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                          className="relative z-10"
                        >
                          {/* Outer glow ring */}
                          <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
                            className="absolute -inset-3 rounded-full bg-white/30 pointer-events-none"
                          />
                          {/* Archie mascot circle */}
                          <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white/60 relative overflow-hidden">
                            <ArchieCharacter size={72} className="relative z-10" />
                            {/* Game emoji badge — bottom-right corner */}
                            <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white/80 z-20">
                              <span className="text-sm leading-none select-none">{game.emoji}</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Locked overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none z-20">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <Lock size={20} className="text-foreground" />
                            </div>
                          </div>
                        )}
                        {/* Play hover overlay */}
                        {!isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/25 pointer-events-none z-20">
                            <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                              <Play size={26} className="text-primary ml-1" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="bg-card p-5 flex flex-col gap-3 flex-1">
                        {/* Title + read-aloud — audio icon always shown */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-foreground text-lg leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                              {game.title}
                            </h3>
                            {/* Earned stars from localStorage */}
                            {(() => {
                              const s = earnedStars[game.id] ?? 0;
                              return s > 0 ? (
                                <div className="flex items-center gap-0.5 mt-1">
                                  {[1,2,3].map(n => (
                                    <Star key={n} size={13} className={n <= s ? 'text-accent fill-accent' : 'text-muted-foreground/30 fill-muted-foreground/10'} />
                                  ))}
                                  <span className="text-xs font-bold text-muted-foreground ml-1">Best: {s}★</span>
                                </div>
                              ) : null;
                            })()}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.18 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={e => { e.stopPropagation(); speak(game.id, `${game.title}. ${game.subject} game. ${game.description}`); }}
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                              isSpeaking
                                ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 animate-pulse'
                                : 'bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground'
                            }`}
                            aria-label={isSpeaking ? 'Stop reading aloud' : 'Read game aloud'}
                            title={isSpeaking ? 'Tap to stop 🔇' : 'Tap to hear this game 🔊'}
                          >
                            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                          </motion.button>
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                          {game.description}
                        </p>

                        {/* Age badges */}
                        <div className="flex flex-wrap gap-1">
                          {game.ageGroups.map(ag => {
                        const ac = Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined;
                        const friendlyLabel: Record<string, string> = {
                          '4–6': 'Ages 4–6',
                          '5–7': 'Ages 5–7',
                          '8–10': 'Ages 8–10',
                          '11–13': 'Ages 11–12',
                        };
                        return <span key={ag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${ac?.badge ?? 'bg-muted text-muted-foreground'}`}>
                                {ac?.icon} {friendlyLabel[ag] ?? `Ages ${ag}`}
                              </span>;
                      })}
                          {game.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground">
                              <Star size={10} className="fill-current" /> Featured
                            </span>}
                        </div>

                        {/* Skills + difficulty */}
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black border ${difficultyConfig[game.difficulty] ?? difficultyConfig['Easy']}`}>
                            <Zap size={10} /> {game.difficulty}
                          </span>
                          {game.skills.map(skill => <span key={skill} className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                              {skill}
                            </span>)}
                        </div>

                        {/* Play / Unlock button */}
                        {isLocked ? <motion.button whileHover={{
                      scale: 1.03
                    }} whileTap={{
                      scale: 0.97
                    }} onClick={() => navigate('/pricing')} className="mt-1 w-full py-3 rounded-xl font-black text-base bg-muted text-foreground border-2 border-dashed border-border flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <Lock size={15} />
                            Unlock — from £1/month
                          </motion.button> : <motion.button whileHover={{
                      scale: 1.03
                    }} whileTap={{
                      scale: 0.97
                    }} onClick={() => {
                      const route = GAME_ROUTES[game.id];
                      if (route) navigate(route);
                    }} className="mt-1 w-full py-3.5 rounded-xl font-black text-base bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                            <Play size={17} className="fill-current" />
                            {isDemo ? 'Play Free' : 'Play Now'}
                          </motion.button>}
                      </div>
                    </motion.div>;
              })}
              </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {visibleCount === 0 && <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="text-center py-20">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-black text-foreground mb-2">No games found</h3>
                <p className="text-muted-foreground text-sm">Try selecting a different age group or subject.</p>
              </motion.div>}
          </div>
        </section>

        {/* ── READ-ALOUD BANNER ── */}
        <section className="py-12 bg-muted">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="bg-card rounded-3xl p-8 border-2 border-primary/20 shadow-sm">
              <div className="text-5xl mb-4">🔊</div>
              <h2 className="text-2xl font-black text-foreground mb-3" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                {games.readAloudBanner.headline}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
                {games.readAloudBanner.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-primary text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="max-w-2xl mx-auto px-4">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Ready to play?
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Pick an age group, choose a game, and start learning through play!
            </p>
            <motion.button whileHover={{
            scale: 1.06
          }} whileTap={{
            scale: 0.95
          }} onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })} className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg bg-accent text-accent-foreground shadow-lg">
              <Play size={20} className="fill-current" />
              Start Playing
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* ── AUTH MODAL ── */}
      <AnimatePresence>
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={() => {
              setAuthModal(null);
              // Redirect to hub after successful auth
              window.location.href = '/hub';
            }}
          />
        )}
      </AnimatePresence>

      {/* ── PRICING MODAL ── */}
      <AnimatePresence>
        {showPricing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPricing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-accent/40"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="hero-bg px-6 pt-6 pb-4 relative">
                <button onClick={() => setShowPricing(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                  <X size={22} />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <Crown size={28} className="text-accent drop-shadow" />
                  <h2 className="text-white font-black text-2xl hero-title-shadow">Unlock All Games</h2>
                </div>
                <p className="text-white/85 text-sm font-semibold">Full access to every game, every subject, every age group</p>
              </div>

              {/* Plans */}
              <div className="p-5 flex flex-col gap-3">

                {/* Monthly */}
                <Link to="/subscribe?plan=monthly" onClick={() => setShowPricing(false)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-accent bg-accent/10 px-5 py-4 hover:bg-accent/20 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <CreditCard size={22} className="text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-foreground text-base leading-tight">Monthly Plan</p>
                    <p className="text-muted-foreground text-xs leading-tight mt-0.5">Cancel anytime · no commitment</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-foreground text-xl leading-none">£1</p>
                    <p className="text-muted-foreground text-xs">/month</p>
                  </div>
                </Link>

                {/* Annual — best value */}
                <Link to="/subscribe?plan=annual" onClick={() => setShowPricing(false)}
                  className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-primary/10 px-5 py-4 hover:bg-primary/20 transition-colors group relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full">Best value</div>
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Crown size={22} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-foreground text-base leading-tight">Annual Plan</p>
                    <p className="text-muted-foreground text-xs leading-tight mt-0.5">Save 2 months vs monthly</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-foreground text-xl leading-none">£10</p>
                    <p className="text-muted-foreground text-xs">/year</p>
                  </div>
                </Link>

                {/* Free trial */}
                <Link to="/subscribe" onClick={() => setShowPricing(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/50 px-5 py-3 hover:bg-accent/10 transition-colors text-foreground font-black text-sm">
                  <Zap size={16} className="text-accent" />
                  Start 7-Day Free Trial first
                </Link>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs font-semibold">or use an access code</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Code shortcut */}
                <button
                  onClick={() => { setShowPricing(false); setCodeOpen(true); }}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-accent/40 bg-accent/10 px-5 py-3 hover:bg-accent/20 transition-colors text-foreground font-black text-sm"
                >
                  <Key size={16} className="text-accent" />
                  Enter access code
                </button>

                <p className="text-muted-foreground text-xs text-center mt-1">
                  🔒 Safe & secure · No ads · Cancel anytime
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE STICKY CTA BAR — shown only on mobile for non-subscribers ── */}
      {!subscribed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' as const }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          <div className="bg-primary px-4 py-3 flex items-center gap-3 shadow-2xl border-t-2 border-accent/40">
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-black text-sm leading-tight">🎉 Start Free — 7 days free!</p>
              <p className="text-primary-foreground/70 text-xs leading-tight">Then from £1/month · Cancel anytime</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPricing(true)}
              className="shrink-0 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-black text-sm shadow-md"
            >
              Try Free
            </motion.button>
            <button
              onClick={() => setAuthModal('login')}
              className="shrink-0 px-4 py-2.5 rounded-full bg-white/15 text-primary-foreground font-bold text-sm"
            >
              Log In
            </button>
          </div>
        </motion.div>
      )}
    </>;
}
