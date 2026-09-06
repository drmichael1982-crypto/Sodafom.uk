import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Star, Play, Calculator, ArrowLeft } from 'lucide-react';
import { games as _games } from 'virtual:content';

const games = _games;
const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } } as const;

const AGE_BANDS = [
  { label: 'Ages 5–7',   emoji: '⭐', desc: 'Counting, number bonds, simple addition and subtraction',       badge: 'bg-yellow-400 text-yellow-900', group: '5-7'   },
  { label: 'Ages 8–10',  emoji: '🚀', desc: 'Times tables, fractions, place value and mental maths',         badge: 'bg-blue-500 text-white',         group: '8-10'  },
  { label: 'Ages 11–13', emoji: '🏆', desc: 'Algebra, coordinates, ratio, percentages and problem solving',  badge: 'bg-purple-600 text-white',       group: '11-13' },
];

const TOPICS = [
  { emoji: '🔢', title: 'Number & Place Value',      desc: 'Understand how numbers work, from units to millions'         },
  { emoji: '➕', title: 'Addition & Subtraction',    desc: 'Build speed and accuracy with mental and written methods'    },
  { emoji: '✖️', title: 'Multiplication & Division', desc: 'Master times tables and division facts up to 12×12'          },
  { emoji: '🍕', title: 'Fractions & Decimals',      desc: 'Visualise fractions, compare decimals and percentages'       },
  { emoji: '📐', title: 'Geometry & Shapes',         desc: 'Explore 2D and 3D shapes, angles and symmetry'              },
  { emoji: '📊', title: 'Data & Statistics',         desc: 'Read charts, tally data and interpret results'               },
];

const WHY_ITEMS = [
  { emoji: '🎯', title: 'Curriculum-aligned',  body: 'Every game maps to the UK primary and KS3 maths curriculum so learning counts in school.' },
  { emoji: '⭐', title: 'Earn stars & badges', body: 'Children earn up to 3 stars per game — collecting them unlocks badges and Hub rewards.'   },
  { emoji: '📈', title: 'Track progress',      body: 'Parents can see exactly which topics their child has mastered in the Parent Dashboard.'    },
  { emoji: '🔊', title: 'Read-aloud support',  body: 'Every question can be read aloud — perfect for younger learners building confidence.'      },
];

export default function MathsSubjectPage() {
  const mathsGames = games.games.filter(g => g.subject === 'maths');

  return (
    <>
      <Helmet>
        <title>Maths Games for Kids Ages 5–13 — Sodafom</title>
        <meta name="description" content="Fun maths games for children ages 5–13. Times tables, number bonds, fractions, algebra and more — all aligned to the UK curriculum." />
        <link rel="canonical" href={`${siteUrl}/subjects/maths`} />
        <meta property="og:title" content="Maths Games for Kids — Sodafom" />
        <meta property="og:description" content="Fun maths games for children ages 5–13. Times tables, number bonds, fractions and more." />
        <meta property="og:url" content={`${siteUrl}/subjects/maths`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${siteUrl}/subjects/maths#webpage`,
          name: 'Maths Games for Kids Ages 5–13 — Sodafom',
          url: `${siteUrl}/subjects/maths`,
          description: 'Fun maths games for children ages 5–13 aligned to the UK curriculum.',
          isPartOf: { '@id': `${siteUrl}/#website` },
        })}</script>
      </Helmet>

      <h1 className="sr-only">Maths Games for Kids Ages 5–13 — Sodafom</h1>

      <main>
        {/* ── HERO ── */}
        <section className="hero-bg relative overflow-hidden py-20">
          {/* Floating maths symbols */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {['➕','✖️','➗','🔢','📐','🍕','📊','🔣'].map((sym, i) => (
              <motion.span key={i}
                className="absolute text-3xl opacity-20"
                style={{ top: `${8 + i * 11}%`, left: i % 2 === 0 ? `${3 + i * 5}%` : undefined, right: i % 2 !== 0 ? `${3 + i * 5}%` : undefined }}
                animate={{ y: [0, -14, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' as const }}
              >{sym}</motion.span>
            ))}
          </div>

          {/* Breadcrumb */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-bold transition-colors">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-black mb-5 border border-white/30">
                <Calculator size={16} /> UK Curriculum Aligned
              </div>
              <motion.p
                className="text-7xl mb-4 leading-none"
                animate={{ y: [0, -10, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >🔢</motion.p>
              <h2 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight hero-title-shadow" style={{ fontFamily: 'var(--font-heading)' }}>
                Maths Games
              </h2>
              <p className="text-xl text-white/85 font-semibold max-w-2xl mx-auto mb-8">
                {mathsGames.length} fun maths games for children ages 5–13. Times tables, fractions, algebra and more — learning that feels like play.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/?subject=maths"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-base bg-white text-accent shadow-lg hover:scale-105 active:scale-95 transition-transform">
                  <Play size={18} className="fill-current" /> Play Maths Games
                </Link>
                <Link to="/subscribe"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-black text-base border-2 border-white/50 text-white hover:bg-white/20 transition-all">
                  <Star size={16} /> Start Free Trial
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-accent py-5">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: `${mathsGames.length}`, label: 'Maths games' },
                { value: '3',                    label: 'Age groups'  },
                { value: '6',                    label: 'Topic areas' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-accent-foreground font-black text-2xl sm:text-3xl">{s.value}</p>
                  <p className="text-accent-foreground/80 text-xs font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AGE BANDS ── */}
        <section className="py-14 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Right for every age</h2>
              <p className="text-muted-foreground">Games adapt to your child's level — from counting to algebra.</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {AGE_BANDS.map(band => (
                <motion.div key={band.label} variants={fadeUp} whileHover={{ y: -4 }}
                  className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-3 ${band.badge}`}>
                    <span>{band.emoji}</span> {band.label}
                  </div>
                  <p className="text-foreground font-semibold text-sm leading-relaxed">{band.desc}</p>
                  <Link to="/?subject=maths"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-black text-accent hover:underline">
                    See games <ChevronRight size={12} />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── TOPICS COVERED ── */}
        <section className="py-14 bg-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Topics covered</h2>
              <p className="text-muted-foreground">Every key area of the UK primary and secondary maths curriculum.</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPICS.map(t => (
                <motion.div key={t.title} variants={fadeUp} whileHover={{ scale: 1.03 }}
                  className="bg-card rounded-2xl border-2 border-border p-5 flex gap-4 items-start shadow-sm">
                  <span className="text-3xl shrink-0">{t.emoji}</span>
                  <div>
                    <p className="font-black text-foreground text-sm">{t.title}</p>
                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURED GAMES ── */}
        <section className="py-14 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Popular maths games</h2>
              <p className="text-muted-foreground">A taste of what's waiting — {mathsGames.length} games in total.</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mathsGames.slice(0, 6).map(game => (
                <motion.div key={game.id} variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-sm">
                  <div className="h-28 flex items-center justify-center text-6xl bg-accent">
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                    >{game.emoji}</motion.span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{game.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{game.description}</p>
                    <Link to={`/games/${game.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-black text-accent hover:underline">
                      Play now <ChevronRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-8">
              <Link to="/?subject=maths"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-base bg-accent text-accent-foreground shadow-md hover:scale-105 active:scale-95 transition-transform">
                See all {mathsGames.length} maths games <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHY SODAFOM ── */}
        <section className="py-14 bg-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Why Sodafom maths?</h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY_ITEMS.map(item => (
                <motion.div key={item.title} variants={fadeUp}
                  className="bg-card rounded-2xl border border-border p-5 flex gap-4">
                  <span className="text-3xl shrink-0">{item.emoji}</span>
                  <div>
                    <p className="font-black text-foreground text-sm mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── OTHER SUBJECTS ── */}
        <section className="py-12 bg-background border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-muted-foreground font-bold text-sm mb-5">Explore other subjects</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Spelling', emoji: '🔤', href: '/subjects/spelling', bg: 'bg-secondary text-secondary-foreground' },
                { label: 'Reading',  emoji: '📖', href: '/subjects/reading',  bg: 'bg-primary text-primary-foreground'   },
                { label: 'Science',  emoji: '🔬', href: '/subjects/science',  bg: 'bg-primary text-primary-foreground'   },
              ].map(s => (
                <Link key={s.label} to={s.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-transform ${s.bg}`}>
                  {s.emoji} {s.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 bg-accent text-center">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="text-6xl mb-4">🔢</p>
              <h2 className="text-3xl font-black text-accent-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Ready to make maths fun?</h2>
              <p className="text-accent-foreground/85 mb-7 font-semibold">Start your 7-day free trial — no card required. Cancel any time.</p>
              <Link to="/subscribe"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-base bg-card text-accent shadow-lg hover:scale-105 active:scale-95 transition-transform">
                <Star size={18} className="fill-accent text-accent" /> Start Free Trial
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
