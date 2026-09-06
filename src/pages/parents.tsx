import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from "react-router";
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, ShieldCheck, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArchieCharacter } from '../components/ArchieCharacter';
import { parents } from 'virtual:content';
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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
const cardIn = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const
    }
  }
} as const;
export default function ParentsPage() {
  return <>
      <Helmet>
        <title>For Parents — Sodafom | Safe, Fun Learning for Ages 5–13</title>
        <meta name="description" content="Everything parents need to know about Sodafom — safe, UK curriculum-aligned, game-based learning for children aged 5–13. Track progress, no ads, cancel anytime." />
        <link rel="canonical" href={`${siteUrl}/parents`} />
        <meta property="og:title" content="For Parents — Sodafom" />
        <meta property="og:description" content="Safe, fun, curriculum-aligned learning for children aged 5–13. Track your child's progress from the Parent Hub." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/parents`} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="For Parents — Sodafom" />
        <meta name="twitter:description" content="Safe, fun, curriculum-aligned learning for children aged 5–13. Track your child's progress from the Parent Hub." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${siteUrl}/parents#webpage`,
          name: 'For Parents — Sodafom',
          url: `${siteUrl}/parents`,
          description: 'Everything parents need to know about Sodafom — safe, UK curriculum-aligned, game-based learning for children aged 5–13.',
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
        <section className="bg-primary py-20 relative overflow-hidden">
          {/* Decorative stars */}
          {[...Array(5)].map((_, i) => <motion.div key={i} className="absolute pointer-events-none" style={{
          top: `${10 + i * 18}%`,
          left: i % 2 === 0 ? `${4 + i * 4}%` : undefined,
          right: i % 2 !== 0 ? `${4 + i * 4}%` : undefined
        }} animate={{
          rotate: 360
        }} transition={{
          duration: 10 + i * 3,
          repeat: Infinity,
          ease: 'linear' as const
        }}>
              <Star size={10 + i * 4} className="text-accent/25 fill-accent/15" />
            </motion.div>)}

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{
            opacity: 0,
            scale: 0.85
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 0.5,
            ease: 'easeOut' as const
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40 mb-6">
              <ShieldCheck size={15} className="text-accent" />
              <span className="text-accent font-bold text-sm">Trusted by families across the UK</span>
            </motion.div>

            <motion.h1 initial={{
            opacity: 0,
            y: 24
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.1,
            ease: 'easeOut' as const
          }} className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-foreground leading-tight mb-5" style={{
            fontFamily: 'var(--font-heading)'
          }}>
              {parents.hero.headline}
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2,
            ease: 'easeOut' as const
          }} className="text-primary-foreground/75 text-lg max-w-2xl mx-auto mb-10">
              {parents.hero.subtext}
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 16
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3,
            ease: 'easeOut' as const
          }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/hub" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base bg-accent text-accent-foreground hover:scale-105 active:scale-95 transition-transform shadow-lg">
                Go to Parent Hub
                <ChevronRight size={18} />
              </Link>
              <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base bg-white/15 text-primary-foreground border border-white/30 hover:bg-white/25 transition-all">
                View pricing
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST BADGES ── */}
        <section className="py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {parents.trustBadges.map(badge => <motion.div key={badge.id} variants={cardIn} whileHover={{
              y: -4
            }} className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center">
                  <div className="text-4xl mb-3">{badge.emoji}</div>
                  <p className="font-black text-foreground text-base mb-1" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                    {badge.label}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{badge.detail}</p>
                </motion.div>)}
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="py-10 bg-primary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: '25+', label: 'Playable games', emoji: '🎮' },
                { value: '3',   label: 'Core subjects',  emoji: '📚' },
                { value: '5–13', label: 'Ages covered',  emoji: '🎓' },
                { value: '£1',  label: 'From per month', emoji: '💷' },
              ].map(s => (
                <motion.div key={s.label} variants={cardIn} className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-3xl font-black text-accent" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</span>
                  <span className="text-primary-foreground/70 text-sm font-bold">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PARENT TESTIMONIALS ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">What parents say</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Real families. Real results.
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Sarah M.', role: 'Parent of two, Manchester', stars: 5, quote: 'My daughter went from dreading maths to asking to play Sodafom every evening. The difference in her confidence is incredible.' },
                { name: 'James T.', role: 'Primary school teacher, London', stars: 5, quote: 'I use Sodafom with my Year 3 class. The Teacher Hub makes it so easy to see who needs extra support. Brilliant tool.' },
                { name: 'Priya K.', role: 'Parent, Birmingham', stars: 5, quote: 'Finally an app with no ads and no in-app purchases. My son can just focus on learning. Worth every penny.' },
                { name: 'David L.', role: 'Parent of three, Leeds', stars: 5, quote: 'All three of my children use it — ages 6, 9, and 12. The age-appropriate difficulty means it works for all of them.' },
                { name: 'Emma R.', role: 'Home educator, Bristol', stars: 5, quote: 'The curriculum alignment is spot on. I use it to supplement our home education and the progress tracking is really useful.' },
                { name: 'Aisha B.', role: 'Parent, Nottingham', stars: 5, quote: 'My son earned 1000 stars and got a free month — he was so proud! The rewards system keeps him motivated every day.' },
              ].map(t => (
                <motion.div key={t.name} variants={cardIn} className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed flex-1 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-black text-foreground text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <section className="py-20 bg-muted">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="text-center mb-14">
              <p className="text-primary font-bold text-sm mb-2">Curriculum-aligned content</p>
              <h2 className="text-4xl sm:text-5xl font-black text-foreground" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                {parents.howItHelps.heading}
              </h2>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {parents.howItHelps.items.map(item => <motion.div key={item.id} variants={cardIn} className="bg-card rounded-3xl p-8 shadow-sm">
                  <div className="text-5xl mb-5">{item.emoji}</div>
                  <h3 className="text-xl font-black text-foreground mb-3" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                </motion.div>)}
            </motion.div>
          </div>
        </section>

        {/* ── SAFETY ── */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — image */}
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.7,
              ease: 'easeOut' as const
            }} className="relative rounded-3xl overflow-hidden shadow-lg aspect-[4/3] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-8">
                <ArchieCharacter size={320} className="drop-shadow-2xl" />
                {/* Safety badge overlay */}
                <div className="absolute bottom-4 left-4 bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  <span className="font-black text-foreground text-sm">100% child-safe</span>
                </div>
              </motion.div>

              {/* Right — points */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
              once: true
            }}>
                <p className="text-primary font-bold text-sm mb-2">Built with care</p>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-8" style={{
                fontFamily: 'var(--font-heading)'
              }}>
                  {parents.safetySection.heading}
                </h2>
                <ul className="flex flex-col gap-4">
                  {parents.safetySection.points.map(point => <li key={point.id} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm leading-relaxed">{point.text}</span>
                    </li>)}
                </ul>
                <Link to="/legal" className="inline-flex items-center gap-1 mt-8 text-primary font-bold text-sm hover:underline">
                  Read our privacy policy
                  <ChevronRight size={15} />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── QUICK WINS ── */}
        <section className="py-16 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-primary font-bold text-sm mb-2">Why parents love it</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Quick wins for your family
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { emoji: '⏱️', title: '10 minutes a day', body: 'Short, focused sessions fit into any routine — before school, after dinner, or at weekends.' },
                { emoji: '📊', title: 'See progress instantly', body: 'The Parent Hub shows exactly which topics your child has practised and where they need more support.' },
                { emoji: '🏆', title: 'Built-in motivation', body: 'Stars, badges, streaks, and certificates keep children coming back without any nagging from you.' },
                { emoji: '🔒', title: 'No surprises', body: 'One flat subscription. No ads, no in-app purchases, no hidden extras. Ever.' },
                { emoji: '🎓', title: 'Curriculum-aligned', body: 'Every game maps to the UK National Curriculum — so what they play actually helps at school.' },
                { emoji: '📱', title: 'Any device', body: 'Works on phones, tablets, and computers. No app to download — just open the browser and play.' },
              ].map(w => (
                <motion.div key={w.title} variants={cardIn} className="flex gap-4 bg-muted rounded-2xl p-5 border border-border">
                  <span className="text-3xl shrink-0">{w.emoji}</span>
                  <div>
                    <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{w.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{w.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress Dashboard CTA card */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-10">
              <div className="rounded-2xl overflow-hidden border-2 border-primary/20 shadow-sm bg-card flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
                <div className="text-6xl shrink-0">📈</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-black text-foreground text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Full Progress Dashboard
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    See 14-day star charts, subject breakdowns, games played, badges earned, and recent activity — all in one place for every child on your account.
                  </p>
                  <Link
                    to="/parent-dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Open Progress Dashboard →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── MEET THE SUBJECTS ── */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">What your child will learn</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Meet the subjects 📚
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
                Every subject is packed with age-appropriate games, challenges, and rewards — all aligned to the UK National Curriculum.
              </p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  emoji: '🔢', title: 'Maths', games: 10, color: 'bg-amber-50 border-amber-200',
                  headerBg: 'bg-amber-400', headerText: 'text-amber-900',
                  topics: ['Counting & number bonds', 'Times tables', 'Fractions & division', 'Shapes & geometry', 'Mental maths'],
                  ages: 'Ages 5–13',
                },
                {
                  emoji: '🔤', title: 'Spelling', games: 6, color: 'bg-red-50 border-red-200',
                  headerBg: 'bg-secondary', headerText: 'text-white',
                  topics: ['Phonics & letter sounds', 'Word families', 'Vocabulary building', 'Tricky words', 'Spelling challenges'],
                  ages: 'Ages 5–11',
                },
                {
                  emoji: '📖', title: 'Reading', games: 5, color: 'bg-green-50 border-green-200',
                  headerBg: 'bg-primary', headerText: 'text-white',
                  topics: ['Phonics adventures', 'Story comprehension', 'Reading for meaning', 'Sentence building', 'Creative writing'],
                  ages: 'Ages 5–11',
                },
                {
                  emoji: '🔬', title: 'Science', games: 4, color: 'bg-blue-50 border-blue-200',
                  headerBg: 'bg-blue-600', headerText: 'text-white',
                  topics: ['Animals & habitats', 'Plants & nature', 'Science experiments', 'Earth & space', 'Forces & materials'],
                  ages: 'Ages 7–13',
                },
              ].map(subj => (
                <motion.div key={subj.title} variants={cardIn} className={`rounded-2xl border-2 overflow-hidden shadow-sm ${subj.color}`}>
                  <div className={`${subj.headerBg} ${subj.headerText} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{subj.emoji}</span>
                      <div>
                        <p className="font-black text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{subj.title}</p>
                        <p className="text-xs opacity-80">{subj.ages}</p>
                      </div>
                    </div>
                    <span className="font-black text-sm opacity-90">{subj.games} games</span>
                  </div>
                  <ul className="p-5 flex flex-col gap-2">
                    {subj.topics.map(t => (
                      <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="px-5 pb-5">
                    <Link to={`/games?cat=${subj.title.toLowerCase()}`} className="inline-flex items-center gap-1 text-primary font-black text-xs hover:underline">
                      See {subj.title} games <ChevronRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW TO HELP YOUR CHILD ── */}
        <section className="py-20 bg-primary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-accent font-bold text-sm mb-2">Parent tips</p>
              <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                How to help your child thrive
              </h2>
              <p className="text-primary-foreground/70 mt-3 max-w-xl mx-auto text-sm">
                Small habits make a big difference. Here's how to get the most out of Sodafom at home.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  step: '1',
                  emoji: '📅',
                  title: 'Set a regular time',
                  body: 'Even 10 minutes at the same time each day builds a powerful learning habit. Before school, after dinner — whatever works for your family.',
                },
                {
                  step: '2',
                  emoji: '🎉',
                  title: 'Celebrate every win',
                  body: 'When your child earns stars or completes a game, make a fuss! Positive reinforcement is the single biggest driver of learning motivation.',
                },
                {
                  step: '3',
                  emoji: '📊',
                  title: 'Check the Hub together',
                  body: 'Sit with your child and look at their progress in the Parent Hub. Asking "which subject do you want to improve?" gives them ownership.',
                },
                {
                  step: '4',
                  emoji: '🏆',
                  title: 'Set a weekly challenge',
                  body: 'Use the Weekly Challenge game as a shared goal. "Can you get 3 stars this week?" turns learning into a fun family mission.',
                },
                {
                  step: '5',
                  emoji: '🔄',
                  title: 'Mix the subjects',
                  body: 'Switching between Maths, Spelling, and Reading keeps things fresh and prevents boredom. Variety is the key to sustained engagement.',
                },
                {
                  step: '6',
                  emoji: '💬',
                  title: 'Talk about what they learned',
                  body: 'Ask your child to explain a game or topic to you. Teaching something back is one of the most effective ways to cement new knowledge.',
                },
              ].map(tip => (
                <motion.div key={tip.step} variants={cardIn} className="flex gap-5 bg-white/10 rounded-2xl p-6 border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-black text-accent-foreground text-sm shrink-0">
                    {tip.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{tip.emoji}</span>
                      <p className="font-black text-primary-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{tip.title}</p>
                    </div>
                    <p className="text-primary-foreground/70 text-xs leading-relaxed">{tip.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-10">
              <Link to="/hub" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-base bg-accent text-accent-foreground hover:scale-105 active:scale-95 transition-transform shadow-lg">
                Open Parent Hub
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── SAMPLE WEEK ── */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">A simple routine</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Your child's learning week 📅
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
                Just 10 minutes a day is all it takes. Here's a sample week that works for most families.
              </p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex flex-col gap-3">
              {[
                { day: 'Monday',    emoji: '🔢', subject: 'Maths',    game: 'Times Table Race',      mins: '10 min', color: 'border-l-amber-400' },
                { day: 'Tuesday',   emoji: '🔤', subject: 'Spelling',  game: 'Spelling Bee',          mins: '10 min', color: 'border-l-secondary' },
                { day: 'Wednesday', emoji: '📖', subject: 'Reading',   game: 'Reading Quest',         mins: '10 min', color: 'border-l-primary' },
                { day: 'Thursday',  emoji: '🔬', subject: 'Science',   game: 'Animal Kingdom',        mins: '10 min', color: 'border-l-blue-500' },
                { day: 'Friday',    emoji: '⚡', subject: 'Challenge', game: 'Weekly Challenge',      mins: '15 min', color: 'border-l-accent' },
                { day: 'Weekend',   emoji: '🌈', subject: 'Free play', game: 'Any favourite game',    mins: 'Free',   color: 'border-l-purple-400' },
              ].map(row => (
                <motion.div key={row.day} variants={cardIn}
                  className={`bg-card rounded-xl border border-border border-l-4 ${row.color} px-5 py-4 flex items-center gap-4`}>
                  <div className="w-24 shrink-0">
                    <p className="font-black text-foreground text-sm">{row.day}</p>
                  </div>
                  <span className="text-2xl shrink-0">{row.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{row.game}</p>
                    <p className="text-muted-foreground text-xs">{row.subject}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs">{row.mins}</span>
                </motion.div>
              ))}
            </motion.div>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center text-muted-foreground text-xs mt-6">
              This is just a suggestion — let your child lead and adjust to what works for your family.
            </motion.p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">Got questions?</p>
              <h2 className="text-4xl sm:text-5xl font-black text-foreground" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                Frequently asked questions
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }}>
              <Accordion type="single" collapsible className="flex flex-col gap-3">
                {parents.faq.map((item, idx) => <AccordionItem key={item.id} value={`faq-${idx}`} className="bg-card rounded-2xl border border-border px-6 shadow-sm">
                    <AccordionTrigger className="font-bold text-foreground text-left py-5 hover:no-underline">
                      <span>{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                      <span>{item.answer}</span>
                    </AccordionContent>
                  </AccordionItem>)}
              </Accordion>
            </motion.div>

            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }} className="text-center text-muted-foreground text-sm mt-8">
              Still have questions?{' '}
              <Link to="/contact" className="text-primary font-bold hover:underline">
                Get in touch
              </Link>
            </motion.p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-primary relative overflow-hidden">
          {[...Array(4)].map((_, i) => <motion.div key={i} className="absolute pointer-events-none" style={{
          top: `${20 + i * 20}%`,
          left: i % 2 === 0 ? `${6 + i * 5}%` : undefined,
          right: i % 2 !== 0 ? `${6 + i * 5}%` : undefined
        }} animate={{
          rotate: 360
        }} transition={{
          duration: 12 + i * 3,
          repeat: Infinity,
          ease: 'linear' as const
        }}>
              <Star size={12 + i * 5} className="text-accent/25 fill-accent/15" />
            </motion.div>)}

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{
            once: true
          }}>
              <div className="text-5xl mb-6">🔑</div>
              <h2 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-4" style={{
              fontFamily: 'var(--font-heading)'
            }}>
                {parents.cta.headline}
              </h2>
              <p className="text-primary-foreground/70 text-lg mb-10">{parents.cta.subtext}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link to="/subscribe" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base bg-accent text-accent-foreground hover:scale-105 active:scale-95 transition-transform shadow-lg">
                  🎉 Start 7-day free trial
                </Link>
                <Link to="/games" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base bg-white/15 text-primary-foreground border border-white/30 hover:bg-white/25 transition-all">
                  Browse games first
                </Link>
              </div>
              <p className="text-primary-foreground/50 text-xs mb-8">No card required for trial · Cancel anytime · From £1/month after</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/games?age=5-7" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-base bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all">
                  🌟 Ages 5–7
                </Link>
                <Link to="/games?age=8-10" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-base bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all">
                  🚀 Ages 8–10
                </Link>
                <Link to="/games?age=11-13" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-black text-base bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all">
                  🏆 Ages 11–13
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>;
}
