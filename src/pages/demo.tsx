import { demo } from 'virtual:content';
/**
 * /demo — Free Demo Page
 *
 * Showcases the 3 free trial games. No login required.
 * Locked premium games shown with paywall overlay to drive conversion.
 */
import { useState } from 'react';
import { Link } from "react-router";
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Star, Lock, Play, Zap, ArrowRight, CheckCircle, School } from 'lucide-react';
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

// ── Demo games (free) ─────────────────────────────────────────────────────────
const DEMO_GAMES = [{
  id: 'number-pop',
  route: '/games/number-pop',
  title: 'Number Pop',
  emoji: '🎈',
  subject: 'Maths',
  subjectColor: 'bg-accent text-accent-foreground',
  borderColor: 'border-amber-300',
  headerBg: 'bg-accent',
  description: 'Pop the balloon with the correct answer! Addition and subtraction made fun.',
  ageGroups: ['5–7', '8–10'],
  difficulty: 'Easy'
}, {
  id: 'spelling-bee',
  route: '/games/spelling-bee',
  title: 'Spelling Bee',
  emoji: '🐝',
  subject: 'Spelling',
  subjectColor: 'bg-secondary text-secondary-foreground',
  borderColor: 'border-red-300',
  headerBg: 'bg-secondary',
  description: 'Listen to the word and spell it correctly. Build your vocabulary one buzz at a time.',
  ageGroups: ['5–7', '8–10', '11–13'],
  difficulty: 'Medium'
}, {
  id: 'phonics-parrot',
  route: '/games/phonics-parrot',
  title: 'Phonics Parrot',
  emoji: '🦜',
  subject: 'Reading',
  subjectColor: 'bg-primary text-primary-foreground',
  borderColor: 'border-green-300',
  headerBg: 'bg-primary',
  description: 'Repeat after the parrot! Match sounds to letters and build reading foundations.',
  ageGroups: ['5–7', '8–10'],
  difficulty: 'Easy'
}];

// ── Locked premium games (teaser) ─────────────────────────────────────────────
const LOCKED_GAMES = [{
  title: 'Times Table Race',
  emoji: '🏎️',
  subject: 'Maths'
}, {
  title: 'Fraction Pizza',
  emoji: '🍕',
  subject: 'Maths'
}, {
  title: 'Shape Sorter',
  emoji: '🔷',
  subject: 'Maths'
}, {
  title: 'Word Wizard',
  emoji: '🧙',
  subject: 'Spelling'
}, {
  title: 'Tricky Word Hunt',
  emoji: '🔍',
  subject: 'Spelling'
}, {
  title: 'Story Builder',
  emoji: '📖',
  subject: 'Reading'
}, {
  title: 'Reading Quest',
  emoji: '🗺️',
  subject: 'Reading'
}];

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
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

// ── Game card ─────────────────────────────────────────────────────────────────
function DemoGameCard({
  game
}: {
  game: typeof DEMO_GAMES[number];
}) {
  const [hovered, setHovered] = useState(false);
  return <motion.div variants={cardAnim} whileHover={{
    scale: 1.02,
    y: -4
  }} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className={`rounded-2xl overflow-hidden border-2 shadow-md flex flex-col ${game.borderColor} relative`}>
      {/* Free badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black shadow-md">
        <Star size={10} className="fill-current" /> Free
      </div>

      {/* Animated header */}
      <div className={`relative h-36 flex items-center justify-center overflow-hidden ${game.headerBg}`}>
        {demo.dots.map((pos, di) => <motion.div key={di} className="absolute w-8 h-8 rounded-full bg-white/10" style={{
        top: pos.top,
        left: pos.left
      }} animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3]
      }} transition={{
        duration: 2 + di * 0.4,
        repeat: Infinity,
        delay: di * 0.3,
        ease: 'easeInOut' as const
      }} />)}
        <motion.div animate={{
        y: [0, -6, 0],
        rotate: [0, 5, -5, 0]
      }} transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }} className="text-6xl select-none z-10">
          {game.emoji}
        </motion.div>
        {/* Play overlay on hover */}
        <motion.div animate={{
        opacity: hovered ? 1 : 0
      }} transition={{
        duration: 0.2
      }} className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play size={24} className="text-primary ml-1" />
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="bg-card p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-foreground text-lg leading-tight" style={{
          fontFamily: 'var(--font-heading)'
        }}>
            {game.title}
          </h3>
          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${game.subjectColor}`}>
            {game.subject}
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed flex-1">{game.description}</p>
        <div className="flex flex-wrap gap-1">
          {game.ageGroups.map(ag => <span key={ag} className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground">
              Ages {ag}
            </span>)}
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <Zap size={9} className="inline mr-0.5" />{game.difficulty}
          </span>
        </div>
        <Link to={game.route} className="mt-1 w-full py-3 rounded-xl font-black text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Play size={16} className="fill-current" />
          Play Free Now
        </Link>
      </div>
    </motion.div>;
}

// ── Locked game teaser ────────────────────────────────────────────────────────
function LockedGameCard({
  game
}: {
  game: typeof LOCKED_GAMES[number];
}) {
  return <motion.div variants={cardAnim} className="rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/40 flex flex-col opacity-70">
      <div className="relative h-28 flex items-center justify-center bg-muted">
        <span className="text-4xl select-none opacity-50">{game.emoji}</span>
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <div className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-sm">
            <Lock size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-black text-muted-foreground text-sm" style={{
        fontFamily: 'var(--font-heading)'
      }}>
          {game.title}
        </h3>
        <span className="text-xs text-muted-foreground font-bold">{game.subject}</span>
        <div className="mt-auto pt-2">
          <Link to="/pricing" className="block w-full py-2 rounded-lg text-xs font-black text-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Unlock →
          </Link>
        </div>
      </div>
    </motion.div>;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DemoPage() {
  return <>
      <Helmet>
        <title>Free Demo — Try Sodafom | 3 Free Learning Games for Kids</title>
        <meta name="description" content="Try Sodafom free — play Number Pop, Spelling Bee and Phonics Parrot with no sign-up needed. See why children love learning with Sodafom." />
        <link rel="canonical" href={`${siteUrl}/demo`} />
        <meta property="og:title" content="Free Demo — Try Sodafom" />
        <meta property="og:description" content="Play 3 free learning games — no sign-up needed. Maths, Spelling and Reading for ages 5–13." />
        <meta property="og:url" content={`${siteUrl}/demo`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Demo — Try Sodafom" />
        <meta name="twitter:description" content="Play 3 free learning games — no sign-up needed." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${siteUrl}/demo#webpage`,
          name: 'Free Demo — Try Sodafom',
          url: `${siteUrl}/demo`,
          description: 'Try Sodafom free — play Number Pop, Spelling Bee and Phonics Parrot with no sign-up needed.',
          isPartOf: {
            '@id': `${siteUrl}/#website`
          },
          about: {
            '@id': `${siteUrl}/#organization`
          }
        })}</script>
      </Helmet>

      <main>
        {/* ── HERO ── */}
        <section className="bg-primary text-primary-foreground py-16 text-center relative overflow-hidden px-4">
          {['🎈', '🐝', '🦜', '⭐', '🎮', '✨'].map((em, i) => <motion.span key={i} className="absolute text-2xl pointer-events-none select-none" style={{
          top: `${8 + i * 14}%`,
          left: i % 2 === 0 ? `${3 + i * 4}%` : undefined,
          right: i % 2 !== 0 ? `${3 + i * 4}%` : undefined
        }} animate={{
          y: [0, -10, 0],
          rotate: [0, 12, -12, 0]
        }} transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: i * 0.25
        }}>
              {em}
            </motion.span>)}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-10 max-w-2xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40 mb-5">
              <Star size={16} className="text-accent fill-current" />
              <span className="text-accent font-black text-sm">No sign-up needed</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Try Sodafom free
            </motion.h1>
            <motion.p variants={fadeUp} className="text-primary-foreground/75 text-lg max-w-xl mx-auto mb-8">
              Play 3 full games completely free — one from each subject. No account, no card, no catch.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              {['🎈 Maths', '🐝 Spelling', '🦜 Reading'].map(label => <span key={label} className="px-4 py-2 rounded-full bg-white/15 text-primary-foreground font-bold text-sm border border-white/30">
                  {label}
                </span>)}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FREE DEMO GAMES ── */}
        <section className="py-16 bg-background px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="text-center mb-10">
              <p className="text-primary font-bold text-sm mb-2">Free to play right now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                Your 3 free games
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {DEMO_GAMES.map(game => <DemoGameCard key={game.id} game={game} />)}
            </motion.div>
          </div>
        </section>

        {/* ── LOCKED GAMES TEASER ── */}
        <section className="py-16 bg-muted/40 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Lock size={14} className="text-primary" />
                <span className="text-primary font-bold text-sm">Premium — unlock with any plan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                7 more games waiting for you
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
                Get full access to every game, subject, and age group from just £1/month.
              </p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {LOCKED_GAMES.map(game => <LockedGameCard key={game.title} game={game} />)}
            </motion.div>
          </div>
        </section>

        {/* ── WHAT'S INCLUDED ── */}
        <section className="py-16 bg-background px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="bg-card rounded-3xl border-2 border-primary/20 shadow-lg overflow-hidden">
              <div className="bg-primary text-primary-foreground p-8 text-center">
                <div className="text-4xl mb-3">🔑</div>
                <h2 className="text-2xl font-black mb-2" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                  Everything in the full version
                </h2>
                <p className="text-primary-foreground/75 text-sm">One subscription. Every game. Every child.</p>
              </div>
              <div className="p-8">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {demo.FULL_FEATURES.map(f => <li key={f} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-bold text-foreground">{f}</span>
                    </li>)}
                </ul>
                {/* Plan pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <Link to="/pricing" className="flex flex-col items-center p-4 rounded-2xl border-2 border-border bg-muted/50 hover:border-primary/50 transition-all text-center">
                    <span className="text-2xl mb-1">📅</span>
                    <span className="font-black text-foreground text-sm">Monthly</span>
                    <span className="text-primary font-black text-lg">£1<span className="text-xs font-bold text-muted-foreground">/mo</span></span>
                  </Link>
                  <Link to="/pricing" className="flex flex-col items-center p-4 rounded-2xl border-2 border-primary bg-primary text-primary-foreground hover:opacity-90 transition-all text-center shadow-md">
                    <span className="text-2xl mb-1">🏆</span>
                    <span className="font-black text-sm">Annual</span>
                    <span className="font-black text-lg">£10<span className="text-xs font-bold opacity-70">/yr</span></span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 font-bold">Best value</span>
                  </Link>
                  <Link to="/pricing#school" className="flex flex-col items-center p-4 rounded-2xl border-2 border-border bg-muted/50 hover:border-primary/50 transition-all text-center">
                    <span className="text-2xl mb-1">🏫</span>
                    <span className="font-black text-foreground text-sm">School</span>
                    <span className="text-primary font-black text-lg">£100<span className="text-xs font-bold text-muted-foreground">/yr</span></span>
                    <span className="text-xs text-muted-foreground mt-1">Unlimited devices</span>
                  </Link>
                </div>
                <Link to="/pricing" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-accent text-accent-foreground font-black text-base hover:opacity-90 transition-opacity shadow-md">
                  Get full access <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SCHOOL CTA ── */}
        <section className="py-16 bg-primary text-primary-foreground px-4" id="school">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
          once: true
        }} className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="text-5xl mb-4">🏫</motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black mb-3" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              Are you a school or teacher?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-primary-foreground/75 mb-6 max-w-xl mx-auto">
              The School Plan gives you a unique licence key and individual activation codes for every device — so every pupil can log in instantly.
            </motion.p>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[{
              icon: '🔑',
              title: 'Licence key',
              desc: 'One master key for your school account'
            }, {
              icon: '📱',
              title: 'Device codes',
              desc: 'Unique code generated for every device'
            }, {
              icon: '♾️',
              title: 'Unlimited pupils',
              desc: 'As many children as you need'
            }].map(item => <motion.div key={item.title} variants={fadeUp} className="bg-white/10 rounded-2xl p-5 border border-white/20">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-black text-sm mb-1" style={{
                fontFamily: 'var(--font-heading)'
              }}>{item.title}</h3>
                  <p className="text-primary-foreground/70 text-xs">{item.desc}</p>
                </motion.div>)}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/pricing#school" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg">
                <School size={20} />
                Get the School Plan — £100/year
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>;
}
