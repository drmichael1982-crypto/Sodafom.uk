import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ChevronRight, Star, Lock } from 'lucide-react';
import { useNavigate, Link } from "react-router";
import { subjects } from 'virtual:content';
import { useSubscription } from '@/hooks/useSubscription';

// Map subject category id → game route
const CATEGORY_ROUTES: Record<string, string> = {
  'maths-counting': '/games/number-pop',
  'maths-shapes': '/games/shape-sorter',
  'maths-times-tables': '/games/times-table-race',
  'maths-add-subtract': '/games/number-pop',
  'maths-divide': '/games/fraction-pizza',
  'maths-fractions': '/games/fraction-pizza',
  'spell-phonics': '/games/phonics-parrot',
  'spell-word-families': '/games/word-wizard',
  'spell-vocabulary': '/games/spelling-bee',
  'spell-tricky': '/games/tricky-word-hunt',
  'read-stories': '/games/story-builder',
  'read-comprehension': '/games/reading-quest',
  'read-phonics': '/games/phonics-parrot',
  'science-animals': '/games/animal-kingdom',
  'science-plants': '/games/nature-explorer',
  'science-experiments': '/games/science-lab',
};
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

// ── Age group visual config ──────────────────────────────────────────────────
const ageConfig: Record<string, {
  bg: string;
  border: string;
  badge: string;
  icon: string;
}> = {
  '5–7': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-400 text-yellow-900',
    icon: '⭐'
  },
  '8–10': {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-500 text-white',
    icon: '🚀'
  },
  '11–13': {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badge: 'bg-purple-600 text-white',
    icon: '🏆'
  }
};

// ── Subject visual config ────────────────────────────────────────────────────
const subjectConfig: Record<string, {
  headerBg: string;
  accent: string;
  lightBg: string;
  border: string;
}> = {
  maths: {
    headerBg: 'bg-accent',
    accent: 'text-accent-foreground',
    lightBg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  spelling: {
    headerBg: 'bg-secondary',
    accent: 'text-secondary-foreground',
    lightBg: 'bg-red-50',
    border: 'border-red-200'
  },
  reading: {
    headerBg: 'bg-primary',
    accent: 'text-primary-foreground',
    lightBg: 'bg-green-50',
    border: 'border-green-200'
  },
  science: {
    headerBg: 'bg-blue-600',
    accent: 'text-white',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200'
  }
};

// ── Read-aloud hook ──────────────────────────────────────────────────────────
function useReadAloud() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };
  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };
  useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);
  return {
    speak,
    stop,
    speaking
  };
}

// ── Level badge colours ──────────────────────────────────────────────────────
const levelColors = ['bg-green-100 text-green-800 border-green-200', 'bg-blue-100 text-blue-800 border-blue-200', 'bg-purple-100 text-purple-800 border-purple-200'];

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
      staggerChildren: 0.1
    }
  }
} as const;
const cardAnim = {
  hidden: {
    opacity: 0,
    y: 32,
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

// ── Subject stats strip ──────────────────────────────────────────────────────
const SUBJECT_STATS = [
  { emoji: '🔢', label: 'Maths',    games: 10, color: 'bg-amber-400',  track: 'bg-amber-100' },
  { emoji: '🔤', label: 'Spelling', games: 6,  color: 'bg-secondary',  track: 'bg-red-100'   },
  { emoji: '📖', label: 'Reading',  games: 5,  color: 'bg-primary',    track: 'bg-green-100' },
  { emoji: '🔬', label: 'Science',  games: 4,  color: 'bg-blue-500',   track: 'bg-blue-100'  },
];
const TOTAL_GAMES = 25;

// ── Fun facts ────────────────────────────────────────────────────────────────
const FUN_FACTS = [
  { emoji: '🧠', fact: 'Children who play maths games for just 10 minutes a day score up to 20% higher in class tests.' },
  { emoji: '📖', fact: 'Reading aloud to children — even older ones — boosts vocabulary faster than silent reading alone.' },
  { emoji: '🔤', fact: 'Learning 5 new spelling words a day adds up to over 1,800 words in a single school year.' },
  { emoji: '🔬', fact: 'Curiosity-based science activities improve problem-solving skills across ALL subjects, not just science.' },
  { emoji: '🎮', fact: 'Game-based learning increases knowledge retention by up to 90% compared to traditional methods.' },
  { emoji: '⭐', fact: 'Children who earn rewards for effort (not just results) develop stronger long-term learning habits.' },
];

function FunFactsBanner() {
  const [idx, setIdx] = useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % FUN_FACTS.length), 5000);
    return () => clearInterval(t);
  }, []);
  const fact = FUN_FACTS[idx];
  return (
    <section className="py-10 bg-primary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-accent font-bold text-xs mb-3 uppercase tracking-wide">Did you know?</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-5xl">{fact.emoji}</span>
            <p className="text-primary-foreground text-base sm:text-lg font-bold leading-relaxed max-w-xl">
              {fact.fact}
            </p>
          </motion.div>
        </AnimatePresence>
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {FUN_FACTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? 'bg-accent w-5' : 'bg-primary-foreground/30'}`}
              aria-label={`Fact ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Age group selector ───────────────────────────────────────────────────────
const ALL_AGES = 'All ages';
const AGE_OPTIONS = [ALL_AGES, '5–7', '8–10', '11–13'];
export default function SubjectsPage() {
  const [selectedAge, setSelectedAge] = useState<string>(ALL_AGES);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const { subscribed } = useSubscription();

  const {
    speak,
    stop,
    speaking
  } = useReadAloud();
  const navigate = useNavigate();
  const handleReadAloud = (text: string) => {
    if (speaking) {
      stop();
      return;
    }
    speak(text);
  };

  // We drive visibility with className — no content filtering into locals
  const isCatVisible = (ageGroups: string[]) => selectedAge === ALL_AGES || ageGroups.includes(selectedAge);
  const subjectHasVisible = (subj: typeof subjects.subjects[number]) => subj.categories.some(cat => isCatVisible(cat.ageGroups));
  return <>
      <Helmet>
        <title>Subjects — Maths, Spelling & Reading | Sodafom</title>
        <meta name="description" content="Explore Sodafom's subjects: maths, spelling, and reading — with age-appropriate levels, fun categories, and read-aloud support for ages 5–13." />
        <link rel="canonical" href={`${siteUrl}/subjects`} />
        <meta property="og:title" content="Subjects — Sodafom" />
        <meta property="og:description" content="Fun, game-based maths, spelling and reading for ages 5–13." />
        <meta property="og:url" content={`${siteUrl}/subjects`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Subjects — Sodafom" />
        <meta name="twitter:description" content="Fun, game-based maths, spelling and reading for ages 5–13." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${siteUrl}/subjects#webpage`,
          name: 'Subjects — Maths, Spelling & Reading | Sodafom',
          url: `${siteUrl}/subjects`,
          description: 'Explore Sodafom subjects: maths, spelling, and reading with age-appropriate levels for children aged 5–13.',
          isPartOf: {
            '@id': `${siteUrl}/#website`
          },
          about: {
            '@id': `${siteUrl}/#organization`
          }
        })}</script>
      </Helmet>      <main>
        {/* ── HERO ── */}
        <section className="bg-primary py-16 text-center relative overflow-hidden">
          {/* Floating stars */}
          {['⭐', '🚀', '🏆', '✨', '🌟'].map((em, i) => <motion.span key={i} className="absolute text-2xl pointer-events-none select-none" style={{
          top: `${10 + i * 18}%`,
          left: i % 2 === 0 ? `${4 + i * 4}%` : undefined,
          right: i % 2 !== 0 ? `${4 + i * 4}%` : undefined
        }} animate={{
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0]
        }} transition={{
          duration: 3 + i * 0.6,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: i * 0.3
        }}>
              {em}
            </motion.span>)}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10 max-w-2xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-3" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              {subjects.hero.headline}
            </h1>
            <p className="text-primary-foreground/75 text-lg">{subjects.hero.tagline}</p>
          </motion.div>
        </section>

        {/* ── AGE GROUP SELECTOR ── */}
        <section className="bg-muted py-8 sticky top-[64px] md:top-[80px] z-30 border-b border-border shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-sm font-bold text-muted-foreground mb-4">Select your child's age group:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {AGE_OPTIONS.map(age => {
              const cfg = age !== ALL_AGES ? (Object.hasOwn(ageConfig, age) ? ageConfig[age as keyof typeof ageConfig] : null) : null;
              const isActive = selectedAge === age;
              return <motion.button key={age} whileHover={{
                scale: 1.06
              }} whileTap={{
                scale: 0.95
              }} onClick={() => setSelectedAge(age)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card text-foreground border-border hover:border-primary/50'}`}>
                    {cfg ? <>
                        <span className="text-xl">{cfg.icon}</span>
                        <span>Ages {age}</span>
                      </> : <>
                        <span className="text-xl">🌈</span>
                        <span>{age}</span>
                      </>}
                  </motion.button>;
            })}
            </div>
          </div>
        </section>

        {/* ── SUBJECT STATS STRIP ── */}
        <section className="py-10 bg-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center text-sm font-bold text-muted-foreground mb-6">
              {TOTAL_GAMES} games across 4 subjects — something for every learner
            </motion.p>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SUBJECT_STATS.map(s => (
                <motion.div key={s.label} variants={cardAnim} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{s.label}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${s.track} overflow-hidden`}>
                    <motion.div
                      className={`h-full rounded-full ${s.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(s.games / TOTAL_GAMES) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-bold">{s.games} games</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── SUBJECTS ── */}
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
            {subjects.subjects.map(subj => {
            const cfg = subjectConfig[subj.id] ?? subjectConfig['maths'];
            const isOpen = activeSubject === subj.id || activeSubject === null;
            const hasVisible = subjectHasVisible(subj);
            return <motion.div key={subj.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
              once: true
            }} className="rounded-3xl overflow-hidden shadow-md border border-border">
                  {/* Subject header */}
                  <button className={`w-full flex items-center justify-between gap-4 px-8 py-6 ${cfg.headerBg} ${cfg.accent} text-left`} onClick={() => setActiveSubject(activeSubject === subj.id ? null : subj.id)} aria-expanded={isOpen}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{subj.emoji}</span>
                      <div>
                        <h2 className="text-3xl font-black" style={{
                      fontFamily: 'var(--font-heading)'
                    }}>
                          {subj.title}
                        </h2>
                        <p className="opacity-80 text-sm mt-0.5">{subj.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Read-aloud button */}
                      {subj.readAloud && <motion.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={e => {
                    e.stopPropagation();
                    handleReadAloud(subj.description);
                  }} className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center hover:bg-white/40 transition-colors" aria-label={speaking ? 'Stop reading' : 'Read aloud'} title="Read aloud 🔊">
                          {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </motion.button>}
                      <motion.div animate={{
                    rotate: isOpen ? 90 : 0
                  }} transition={{
                    duration: 0.25
                  }}>
                        <ChevronRight size={24} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Category cards */}
                  <AnimatePresence initial={false}>
                    {isOpen && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: 'auto'
                }} exit={{
                  opacity: 0,
                  height: 0
                }} transition={{
                  duration: 0.35,
                  ease: 'easeInOut' as const
                }} className="overflow-hidden">
                        <div className={`p-6 sm:p-8 ${cfg.lightBg}`}>
                          {!hasVisible ? <p className="text-center text-muted-foreground py-8 font-bold">
                              No activities for this age group in {subj.title} yet — check back soon! 🌟
                            </p> : <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              {subj.categories.map(cat => <motion.div key={cat.id} variants={cardAnim} whileHover={{
                        scale: 1.03,
                        y: -3
                      }} className={`bg-card rounded-2xl p-5 border-2 ${cfg.border} shadow-sm flex flex-col gap-3 cursor-pointer ${!isCatVisible(cat.ageGroups) ? 'hidden' : ''}`}>
                                  {/* Icon + title row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-3xl">{cat.icon}</span>
                                      <h3 className="font-black text-foreground text-base leading-tight" style={{
                              fontFamily: 'var(--font-heading)'
                            }}>
                                        {cat.title}
                                      </h3>
                                    </div>
                                    {/* Read-aloud per card */}
                                    <motion.button whileHover={{
                            scale: 1.15
                          }} whileTap={{
                            scale: 0.9
                          }} onClick={() => handleReadAloud(`${cat.title}. ${cat.description}`)} className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Read this aloud" title="Tap to hear this read aloud 🔊">
                                      <Volume2 size={14} className="text-primary" />
                                    </motion.button>
                                  </div>

                                  {/* Description */}
                                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                                    {cat.description}
                                  </p>

                                  {/* Age group badges */}
                                  <div className="flex flex-wrap gap-1">
                                    {cat.ageGroups.map(ag => {
                            const ac = Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined;
                            return <span key={ag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${ac?.badge ?? 'bg-muted text-muted-foreground'}`}>
                                          {ac?.icon} Ages {ag}
                                        </span>;
                          })}
                                  </div>

                                  {/* Level pills */}
                                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
                                    {cat.levels.map((lvl, li) => <span key={lvl} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${levelColors.at(li) ?? levelColors.at(2)}`}>
                                        {(li === 0 || subscribed) ? <Star size={10} className="fill-current" /> : <Lock size={10} />}
                                        {lvl}
                                      </span>)}
                                  </div>

                                  {/* Play button */}
                                  <motion.button whileHover={{
                          scale: 1.04
                        }} whileTap={{
                          scale: 0.96
                        }} onClick={() => {
                          const route = CATEGORY_ROUTES[cat.id];
                          if (route) navigate(route);
                        }} className="mt-1 w-full py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                                    Play Now 🎮
                                  </motion.button>
                                </motion.div>)}
                            </motion.div>}

                          {/* See all games for this subject */}
                          <div className="mt-6 flex justify-center">
                            <Link
                              to={`/games?cat=${subj.id}`}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-transform shadow-md"
                            >
                              See all {subj.title} games <ChevronRight size={15} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </motion.div>;
          })}
          </div>
        </section>

        {/* ── FUN FACTS BANNER ── */}
        <FunFactsBanner />

        {/* ── READ-ALOUD EXPLAINER BANNER ── */}
        <section className="py-12 bg-muted">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="bg-card rounded-3xl p-8 border-2 border-primary/20 shadow-sm">
              <div className="text-5xl mb-4">🔊</div>

              <h2 className="text-2xl font-black text-foreground mb-3" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                Read-Aloud Support
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
                Every activity has a <strong className="text-primary">speaker icon</strong> — tap it and Sodafom will read the instructions and text aloud in a clear, friendly voice. Perfect for children who are still building their reading confidence. Follow along as the words are spoken, at your own pace.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {['Maths 🔢', 'Spelling 🔤', 'Reading 📖', 'Storytelling 📜'].map(tag => <span key={tag} className="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {tag}
                  </span>)}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── LEARNING TIPS ── */}
        <section className="py-16 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-primary font-bold text-sm mb-2">Make the most of it</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Tips to boost learning 🚀
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { emoji: '🎯', title: 'Start with your favourite', body: 'Let your child pick the subject they enjoy most first — early wins build confidence and make them want to keep going.' },
                { emoji: '⏱️', title: 'Little and often', body: 'Just 10 minutes a day is more effective than one long session. Short bursts keep concentration high and learning sharp.' },
                { emoji: '🔊', title: 'Use read-aloud', body: 'Tap the speaker icon on any activity to hear it read aloud. Great for younger learners or anyone who learns better by listening.' },
                { emoji: '🏆', title: 'Chase the levels', body: 'Each category has Beginner, Intermediate and Advanced levels. Unlocking the next level is a brilliant motivator to keep practising.' },
                { emoji: '🌈', title: 'Mix it up', body: 'Switch between Maths, Spelling, Reading and Science to keep things fresh. Variety prevents boredom and strengthens different skills.' },
                { emoji: '⭐', title: 'Collect your stars', body: 'Every game awards up to 3 stars. Aim for full marks — then try to beat your score! Stars unlock badges and rewards in the Hub.' },
              ].map(tip => (
                <motion.div key={tip.title} variants={cardAnim} className="flex gap-4 bg-muted rounded-2xl p-5 border border-border">
                  <span className="text-3xl shrink-0">{tip.emoji}</span>
                  <div>
                    <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{tip.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{tip.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-primary text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="max-w-2xl mx-auto px-4">

            <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Ready to start learning?
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Pick an age group above and dive straight in — it's free to get started!
            </p>
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/subscribe"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started Free <ChevronRight size={20} />
              </Link>
            </motion.div>          </motion.div>
        </section>
      </main>
    </>;
}
