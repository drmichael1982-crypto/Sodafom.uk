import { home } from 'virtual:content';
/**
 * Homepage — Full-screen subject icon picker.
 *
 * Phase 1 (default): Big colourful subject icons fill the screen.
 *                    No header (hidden in RootLayout for "/").
 * Phase 2 (after tap): The full GamesPage slides in below with the
 *                      chosen subject pre-filtered. No page navigation.
 *
 * All existing GamesPage code is completely untouched.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Star, Zap, ChevronDown, LogIn, UserPlus, ShieldCheck, BookOpen, Calculator, Pencil, FlaskConical, Play, ChevronRight, ClipboardList, BrainCircuit } from 'lucide-react';
import { ArchieCharacter } from '../components/ArchieCharacter';
import GamesPage from './games';
import { useSession } from '@/lib/auth/auth-client';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Sodafom', url: `${siteUrl}/` },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Sodafom',
      url: `${siteUrl}/`,
      description: 'Fun, game-based learning platform for children ages 5–13 covering maths, spelling, reading and science.',
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: 'Sodafom — Fun Learning Games for Kids Ages 5–13',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      datePublished: '2024-01-01',
      dateModified: '2026-08-21',
    },
  ],
};

// ── Age bands for the homepage picker ────────────────────────────────────────
// gradFrom/gradTo use inline hex only for the age pill gradients — these are
// decorative game-UI colours, not brand palette overrides.
const AGE_BANDS = [
  { label: '4–5',  emoji: '🌱', gradFrom: '#EC4899', gradTo: '#DB2777', desc: 'Reception'   },
  { label: '5–6',  emoji: '🌟', gradFrom: '#F97316', gradTo: '#EA580C', desc: 'Year 1'      },
  { label: '6–7',  emoji: '⭐', gradFrom: '#EAB308', gradTo: '#CA8A04', desc: 'Year 2'      },
  { label: '7–8',  emoji: '🚀', gradFrom: '#22C55E', gradTo: '#16A34A', desc: 'Year 3'      },
  { label: '8–9',  emoji: '🎯', gradFrom: '#3B82F6', gradTo: '#2563EB', desc: 'Year 4'      },
  { label: '9–10', emoji: '🔥', gradFrom: '#6366F1', gradTo: '#4F46E5', desc: 'Year 5'      },
  { label: '10–11',emoji: '⚡', gradFrom: '#8B5CF6', gradTo: '#7C3AED', desc: 'Year 6'      },
  { label: '11–12',emoji: '🏆', gradFrom: '#0EA5E9', gradTo: '#0284C7', desc: 'Year 7'      },
  { label: '12–13',emoji: '🎓', gradFrom: '#2D6A4F', gradTo: '#1B4332', desc: 'Year 8'      },
  {
    id: 'cartoon-mode',
    label: 'Cartoon World',
    emoji: '🏰',
    sub: 'New adventure!',
    gradFrom: '#38BDF8',
    gradTo: '#0284C7',
    glow: 'rgba(56,189,248,0.55)',
    type: 'route' as const,
    route: '/',
  },
] as const;

type AgeBandLabel = typeof AGE_BANDS[number]['label'] | null;

// Best first game per subject per age group (easy → hard)
const FIRST_GAME_BY_AGE: Record<string, Record<string, string>> = {
  maths: {
    '4–5':  'number-pop',
    '5–6':  'number-pop',
    '6–7':  'times-table-race',
    '7–8':  'times-table-race',
    '8–9':  'mental-maths-sprint',
    '9–10': 'mental-maths-sprint',
    '10–11':'maths-challenge',
    '11–12':'maths-challenge',
    '12–13':'algebra-quest',
  },
  spelling: {
    '4–5':  'phonics-parrot',
    '5–6':  'phonics-parrot',
    '6–7':  'spelling-bee',
    '7–8':  'spelling-bee',
    '8–9':  'word-wizard',
    '9–10': 'word-wizard',
    '10–11':'anagram-attack',
    '11–12':'anagram-attack',
    '12–13':'anagram-attack',
  },
  reading: {
    '4–5':  'alphabet-explorer',
    '5–6':  'alphabet-explorer',
    '6–7':  'reading-quest',
    '7–8':  'reading-quest',
    '8–9':  'comprehension-quest',
    '9–10': 'comprehension-quest',
    '10–11':'story-builder',
    '11–12':'story-builder',
    '12–13':'story-builder',
  },
  science: {
    '4–5':  'animal-kingdom',
    '5–6':  'animal-kingdom',
    '6–7':  'animal-habitats',
    '7–8':  'animal-habitats',
    '8–9':  'nature-explorer',
    '9–10': 'nature-explorer',
    '10–11':'science-lab',
    '11–12':'science-lab',
    '12–13':'geography-quiz',
  },
};

// ── Home navigation items ──────────────────────────────────────────────────
const HOME_NAV = [
  {
    id: 'maths',
    label: 'Maths',
    emoji: '🔢',
    sub: 'Numbers & logic',
    gradFrom: '#F59E0B',
    gradTo: '#D97706',
    glow: 'rgba(245,158,11,0.55)',
    type: 'subject' as const,
  },
  {
    id: 'reading',
    label: 'Reading',
    emoji: '📖',
    sub: 'Stories & fluency',
    gradFrom: '#22C55E',
    gradTo: '#16A34A',
    glow: 'rgba(34,197,94,0.55)',
    type: 'subject' as const,
  },
  {
    id: 'spelling',
    label: 'Spelling',
    emoji: '🔤',
    sub: 'Words & phonics',
    gradFrom: '#EF4444',
    gradTo: '#DC2626',
    glow: 'rgba(239,68,68,0.55)',
    type: 'subject' as const,
  },
  {
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    sub: 'Nature & facts',
    gradFrom: '#3B82F6',
    gradTo: '#2563EB',
    glow: 'rgba(59,130,246,0.55)',
    type: 'subject' as const,
  },
  {
    id: 'rewards',
    label: 'Stars & Rewards',
    emoji: '⭐',
    sub: 'Your prizes',
    gradFrom: '#9C27B0',
    gradTo: '#7B1FA2',
    glow: 'rgba(156,39,176,0.55)',
    type: 'route' as const,
    route: '/rewards',
  },
  {
    id: 'archie-ai',
    label: 'Archie AI',
    emoji: '👦',
    sub: 'Chat with Archie',
    gradFrom: '#E91E63',
    gradTo: '#C2185B',
    glow: 'rgba(233,30,99,0.55)',
    type: 'route' as const,
    route: '/ask-archie',
  },
  {
    id: 'cartoon-mode',
    label: 'Cartoon World',
    emoji: '🏰',
    sub: 'New adventure!',
    gradFrom: '#38BDF8',
    gradTo: '#0284C7',
    glow: 'rgba(56,189,248,0.55)',
    type: 'route' as const,
    route: '/',
  },
] as const;

type SubjectId = 'maths' | 'reading' | 'spelling' | 'science';

const SUBJECTS = HOME_NAV.filter(item => item.type === 'subject') as Extract<typeof HOME_NAV[number], { type: 'subject' }>[];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubject = searchParams.get('subject');

  // Start with null so we see the simplified home page first
  // UNLESS a subject was passed in the URL
  const [chosen, setChosen] = useState<SubjectId | 'all' | null>(() => {
    if (urlSubject && ['maths', 'reading', 'spelling', 'science'].includes(urlSubject)) {
      return urlSubject as SubjectId;
    }
    return null;
  });

  // Key forces GamesPage to remount fresh when subject changes
  const [gamesKey, setGamesKey] = useState(0);
  const [selectedAge, setSelectedAge] = useState<AgeBandLabel>(() => {
    const age = searchParams.get('age');
    return (age ? age.replace('-', '–') : null) as AgeBandLabel;
  });
  const [showAgePicker, setShowAgePicker] = useState(false);
  const gamesRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();

  // Update chosen if URL param changes
  React.useEffect(() => {
    if (urlSubject && ['maths', 'reading', 'spelling', 'science'].includes(urlSubject)) {
      setChosen(urlSubject as SubjectId);
    }
  }, [urlSubject]);

  const [researchMode, setResearchMode] = useState(() => {
    if (OPEN_TESTING_MODE) return true;
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sodafom_research_mode') === 'true';
  });

  React.useEffect(() => {
    const handleResearchChange = () => {
      setResearchMode(OPEN_TESTING_MODE || localStorage.getItem('sodafom_research_mode') === 'true');
    };
    window.addEventListener('sodafom_research_mode_change', handleResearchChange);
    return () => window.removeEventListener('sodafom_research_mode_change', handleResearchChange);
  }, []);

  function handleSubjectPick(id: SubjectId | 'all') {
    setChosen(id);
    setGamesKey(k => k + 1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  }

  // When a subject icon is clicked: if age is set, go straight to the right game
  function handleSubjectIconClick(subjectId: SubjectId) {
    if (selectedAge && FIRST_GAME_BY_AGE[subjectId]?.[selectedAge]) {
      navigate(`/games/${FIRST_GAME_BY_AGE[subjectId][selectedAge]}`);
    } else {
      handleSubjectPick(subjectId);
    }
  }

  function handleNavClick(item: typeof HOME_NAV[number]) {
    if (item.type === 'subject') {
      handleSubjectIconClick(item.id as SubjectId);
    } else if (item.type === 'route') {
      navigate(item.route);
    }
  }

  return (
    <>
      <Helmet>
        <title>Sodafom — Fun Learning Games for Kids Ages 5–13</title>
        <meta
          name="description"
          content="Sodafom: 127 fun maths, spelling, reading and science games for children aged 5–13. Earn stars, unlock badges and learn through play. Start your free trial today!"
        />
        <link rel="canonical" href={siteUrl} />
        <meta property="og:title" content="Sodafom — Fun Learning Games for Kids Ages 5–13" />
        <meta property="og:description" content="127 fun learning games for children aged 5–13. Maths, spelling, reading and science. Start free today!" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sodafom — Fun Learning Games for Kids Ages 5–13" />
        <meta name="twitter:description" content="127 fun learning games for children aged 5–13. Start free today!" />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <h1 className="sr-only">Sodafom — Fun Learning Games for Kids Ages 5–13</h1>

      {/* ── PHASE 1: Full-screen icon picker ── */}
      <AnimatePresence>
        {chosen === null && (
          <motion.div
            key="picker"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeIn' as const }}
          >
            <section className="hero-bg relative overflow-hidden min-h-screen flex flex-col" aria-label="Choose a subject">

              {/* Sky decorations */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute top-6 left-6 opacity-70" width="140" height="58" viewBox="0 0 140 58" fill="white">
                  <ellipse cx="70" cy="40" rx="62" ry="22" />
                  <ellipse cx="40" cy="32" rx="32" ry="22" />
                  <ellipse cx="100" cy="28" rx="34" ry="22" />
                </svg>
                <svg className="absolute top-10 right-12 opacity-60" width="110" height="48" viewBox="0 0 110 48" fill="white">
                  <ellipse cx="55" cy="34" rx="48" ry="18" />
                  <ellipse cx="30" cy="26" rx="26" ry="18" />
                  <ellipse cx="80" cy="24" rx="28" ry="18" />
                </svg>
                <svg className="absolute top-0 right-0 pointer-events-none" style={{ width: '60%', height: '320px' }} viewBox="0 0 500 320" preserveAspectRatio="xMaxYMin meet">
                  {[{ r: 380, cls: 'rb-red' }, { r: 356, cls: 'rb-orange' }, { r: 332, cls: 'rb-yellow' }, { r: 308, cls: 'rb-green' }, { r: 284, cls: 'rb-blue' }, { r: 260, cls: 'rb-purple' }].map(b => (
                    <circle key={b.r} cx="500" cy="320" r={b.r} fill="none" className={b.cls} strokeWidth="22" opacity="0.8" />
                  ))}
                </svg>
                <svg className="absolute bottom-0 left-0 right-0 w-full" style={{ height: '52px' }} viewBox="0 0 1200 52" preserveAspectRatio="none">
                  <path className="hero-grass-a" d="M0,32 Q150,10 300,28 Q450,44 600,24 Q750,10 900,30 Q1050,44 1200,26 L1200,52 L0,52 Z" opacity="0.6" />
                  <path className="hero-grass-b" d="M0,40 Q200,20 400,36 Q600,48 800,32 Q1000,18 1200,38 L1200,52 L0,52 Z" opacity="0.85" />
                </svg>
              </div>

              {/* Minimal top nav */}
              <div className="relative z-20 flex items-center justify-between px-5 pt-5 pb-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                   <Link
                      to="/parents"
                      className="text-white/80 hover:text-white font-black text-sm transition-colors"
                    >
                      Parent Area
                    </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  {!isAuthenticated ? (
                      <Link
                        to="/hub/login"
                        className="text-white/80 hover:text-white font-black text-sm transition-colors"
                      >
                        Sign In
                      </Link>
                  ) : (
                    <Link
                      to="/hub"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-black hover:opacity-90 transition-opacity shadow-md"
                    >
                      <Star size={13} className="fill-current" />
                      My Hub
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Main centred content */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 pb-24">

                {/* Archie Character - Large and Central */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="mb-8"
                >
                  <ArchieCharacter size={180} className="drop-shadow-2xl" />
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                  className="text-center mb-10"
                >
                  <h2
                    className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-white hero-title-shadow"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Hi! I'm Archie!
                  </h2>
                  <p className="text-white font-black text-xl mt-2 hero-sub-shadow">
                    What shall we learn today?
                  </p>
                </motion.div>

                {/* 3×2 subject icon grid (2 cols on mobile, 3 on desktop) */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl"
                >
                  {HOME_NAV.map((s) => (
                    <motion.button
                      key={s.id}
                      variants={{
                        hidden: { opacity: 0, y: 32, scale: 0.92 },
                        visible: {
                          opacity: 1, y: 0, scale: 1,
                          transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
                        },
                      }}
                      whileHover={{ scale: 1.07, y: -6 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleNavClick(s)}
                      className="relative flex flex-col items-center gap-4 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-4 border-white/30 cursor-pointer text-center overflow-hidden group"
                      style={{
                        background: `linear-gradient(145deg, ${s.gradFrom}, ${s.gradTo})`,
                        boxShadow: `0 12px 40px ${s.glow}`,
                      }}
                    >
                      {/* Hover shine */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />

                      {/* Bouncing emoji */}
                      <motion.span
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.5 + HOME_NAV.indexOf(s) * 0.3, repeat: Infinity, ease: 'easeInOut' as const }}
                        className="text-7xl sm:text-8xl leading-none select-none drop-shadow-lg"
                        role="img"
                        aria-hidden="true"
                      >
                        {s.emoji}
                      </motion.span>

                      {/* Label + subtitle */}
                      <div>
                        <p className="text-white font-black text-2xl sm:text-3xl leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                          {s.label}
                        </p>
                        <p className="text-white/80 text-sm sm:text-base font-bold mt-1 leading-snug">
                          {s.sub}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Show all games button - simplified */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSubjectPick('all')}
                  className="mt-12 flex items-center gap-2 px-8 py-4 rounded-full bg-white/20 border-2 border-white/40 text-white font-black text-lg hover:bg-white/30 transition-colors backdrop-blur-sm shadow-xl"
                >
                  <Zap size={20} className="text-accent fill-accent" />
                  Show all 127 games
                  <ChevronDown size={20} />
                </motion.button>

              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BELOW-FOLD TEASER (only when picker is showing) ── */}
      <AnimatePresence>
        {chosen === null && (
          <motion.div
            key="teaser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Stats strip ── */}
            <section className="bg-primary py-5 border-b border-primary-foreground/10">
              <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { value: '127', label: 'Learning games', emoji: '🎮' },
                    { value: '5–13', label: 'Ages covered', emoji: '👧' },
                    { value: '4', label: 'Subjects', emoji: '📚' },
                    { value: '£1', label: 'Per month', emoji: '⭐' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-primary-foreground font-black text-2xl sm:text-3xl">{s.emoji} {s.value}</p>
                      <p className="text-primary-foreground/70 text-xs font-semibold mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-14 bg-background">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="text-center mb-10"
                >
                  <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    How Sodafom works
                  </h2>
                  <p className="text-muted-foreground">Three steps to a happier, more confident learner.</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { step: '1', emoji: '🎯', title: 'Pick a subject', body: 'Choose Maths, Spelling, Reading or Science — or let your child explore all four.' },
                    { step: '2', emoji: '🎮', title: 'Play & learn', body: 'Fun, curriculum-aligned games that feel like play but build real skills.' },
                    { step: '3', emoji: '⭐', title: 'Earn stars & badges', body: 'Children collect stars, unlock characters and celebrate every achievement.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
                      className="bg-card rounded-2xl border-2 border-border p-6 text-center shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground font-black text-lg flex items-center justify-center mx-auto mb-3">
                        {item.step}
                      </div>
                      <p className="text-4xl mb-3">{item.emoji}</p>
                      <h3 className="font-black text-foreground text-base mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Subject preview cards ── */}
            <section className="py-12 bg-muted">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Four subjects, one subscription
                  </h2>
                  <p className="text-muted-foreground">Everything your child needs — all in one place.</p>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'maths',    label: 'Maths',    emoji: '🔢', icon: Calculator, count: '40+', href: '/subjects/maths',    grad: 'from-amber-400 to-amber-600'   },
                    { id: 'spelling', label: 'Spelling', emoji: '🔤', icon: Pencil,     count: '35+', href: '/subjects/spelling', grad: 'from-red-400 to-red-600'       },
                    { id: 'reading',  label: 'Reading',  emoji: '📖', icon: BookOpen,   count: '30+', href: '/subjects/reading',  grad: 'from-green-500 to-green-700'   },
                    { id: 'science',  label: 'Science',  emoji: '🔬', icon: FlaskConical, count: '25+', href: '/subjects/science', grad: 'from-blue-500 to-blue-700'   },
                  ].map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                    >
                      <button
                        onClick={() => handleSubjectPick(s.id as typeof SUBJECTS[number]['id'])}
                        className={`w-full bg-gradient-to-br ${s.grad} rounded-2xl p-5 text-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform border-2 border-white/20`}
                      >
                        <p className="text-4xl mb-2">{s.emoji}</p>
                        <p className="font-black text-base" style={{ fontFamily: 'var(--font-heading)' }}>{s.label}</p>
                        <p className="text-white/80 text-xs mt-1">{s.count} games</p>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Trust & safety ── */}
            <section className="py-12 bg-background">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Built for families
                  </h2>
                  <p className="text-muted-foreground">Safe, simple, and trusted by parents across the UK.</p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { emoji: '🇬🇧', title: 'UK curriculum aligned',   body: 'Every game maps to the national curriculum for KS1, KS2 and KS3.' },
                    { emoji: '🔒', title: 'No ads, ever',              body: 'Completely ad-free. No in-app purchases. Just pure learning.' },
                    { emoji: '👨‍👩‍👧', title: 'Up to 4 children',         body: 'One subscription covers the whole family — all ages, all subjects.' },
                    { emoji: '📊', title: 'Parent progress dashboard', body: 'See exactly what your child has played and how they\'re improving.' },
                    { emoji: '⭐', title: 'Stars & rewards',           body: 'Children earn stars, unlock characters and stay motivated to learn.' },
                    { emoji: '💳', title: 'Cancel any time',           body: 'No long contracts. Cancel with one click — no questions asked.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
                      className="bg-card rounded-2xl border border-border p-5 flex gap-4 items-start shadow-sm"
                    >
                      <span className="text-3xl shrink-0">{item.emoji}</span>
                      <div>
                        <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">{item.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Testimonial strip ── */}
            <section className="py-12 bg-accent">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { quote: 'My son went from hating maths to asking to play every evening. Absolute game changer!', name: 'Sarah M.', child: 'Mum of Jake, age 8' },
                    { quote: 'The spelling games are brilliant. My daughter\'s confidence has soared since we started.', name: 'David T.', child: 'Dad of Lily, age 7' },
                    { quote: 'Best £1 I spend each month. The progress dashboard shows exactly where she\'s improving.', name: 'Emma R.', child: 'Mum of Ava, age 10' },
                  ].map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                      className="bg-card rounded-2xl p-5 shadow-sm border border-border"
                    >
                      <div className="flex gap-0.5 mb-3">
                        {[1,2,3,4,5].map(n => <Star key={n} size={14} className="fill-accent text-accent" />)}
                      </div>
                      <p className="text-foreground text-sm leading-relaxed mb-3 italic">"{t.quote}"</p>
                      <p className="font-black text-foreground text-xs">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.child}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-16 bg-primary text-center">
              <div className="max-w-2xl mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5 }}
                >
                  <p className="text-5xl mb-4">🚀</p>
                  <h2 className="text-3xl font-black text-primary-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    Ready to start learning?
                  </h2>
                  <p className="text-primary-foreground/80 mb-7 font-semibold">
                    Pick a subject above — or start your free trial now.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-base bg-accent text-accent-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Play size={16} className="fill-current" /> Choose a subject
                    </button>
                    {!researchMode && (
                      <Link
                        to="/subscribe"
                        className="flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-base border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-all"
                      >
                        <ShieldCheck size={16} /> Start free trial
                      </Link>
                    )}
                  </div>
                  {!researchMode && <p className="text-primary-foreground/60 text-xs mt-4">No card required for free games · £1/month after trial</p>}
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2: GamesPage slides in after subject chosen ── */}
      {chosen !== null && (
        <motion.div
          key={`games-${gamesKey}`}
          ref={gamesRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
        >
          {/* Sticky subject switcher bar */}
          <div className="hero-bg sticky top-0 z-40 border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">

              {/* Back button */}
              <button
                onClick={() => setChosen(null)}
                className="flex items-center gap-2 text-white font-black text-sm hover:text-accent transition-colors shrink-0"
                aria-label="Back to subject picker"
              >
                <ArchieCharacter size={28} className="drop-shadow" />
                <span className="hidden sm:inline">← Back to subjects</span>
                <span className="sm:hidden">← Back</span>
              </button>

              {/* Active subject label */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedAge && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/25 text-white text-xs font-black border border-white/40">
                    {AGE_BANDS.find(b => b.label === selectedAge)?.emoji} Age {selectedAge}
                  </span>
                )}
                {chosen !== 'all' && SUBJECTS.filter(s => s.id === chosen).map(s => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-black border border-white/30"
                    style={{ background: `linear-gradient(135deg, ${s.gradFrom}, ${s.gradTo})` }}
                  >
                    {s.emoji} {s.label} games
                  </span>
                ))}
                {chosen === 'all' && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black border border-white/30">
                    All 127 games
                  </span>
                )}
              </div>

              {/* Quick subject switcher — desktop */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {SUBJECTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSubjectPick(s.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                      chosen === s.id
                        ? 'text-white border-white/60 scale-105'
                        : 'text-white/70 border-white/20 hover:text-white hover:border-white/40'
                    }`}
                    style={chosen === s.id ? { background: `linear-gradient(135deg, ${s.gradFrom}, ${s.gradTo})` } : {}}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
                <button
                  onClick={() => handleSubjectPick('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                    chosen === 'all'
                      ? 'bg-white/30 text-white border-white/60'
                      : 'text-white/70 border-white/20 hover:text-white hover:border-white/40'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/*
           * GamesPage is rendered with an initialCat prop so it pre-filters
           * to the chosen subject. GamesPage reads this via its own state init.
           * We pass it as a prop — see the added optional prop below.
           */}
          <GamesPage initialCat={chosen === 'all' ? undefined : chosen} initialAge={selectedAge ?? undefined} />
        </motion.div>
      )}
    </>
  );
}
