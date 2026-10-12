import { about } from 'virtual:content';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Heart, BookOpen, Shield, Zap, Users, Award, Globe, ChevronRight, Quote, Play } from 'lucide-react';
import { useState } from 'react';

const siteUrl = 'https://sodafom.uk';
const ogImage = `${siteUrl}/og-image.png`;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${siteUrl}/about#webpage`,
  name: 'About Sodafom — Our Story & Mission',
  url: `${siteUrl}/about`,
  description: 'Learn about Sodafom — the UK children\'s educational platform making maths, spelling and reading fun for ages 5–13.',
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: { '@id': `${siteUrl}/#organization` },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const;
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as const;

const VALUESMeta = [
  {
    icon: Heart
  },
  {
    icon: Shield
  },
  {
    icon: BookOpen
  },
  {
    icon: Users
  },
  {
    icon: Zap
  },
  {
    icon: Globe
  },
];

// ── Mission video — shows a YouTube embed when a video ID is set, otherwise a polished placeholder ──
// To activate: set YOUTUBE_VIDEO_ID to your real YouTube video ID (e.g. "dQw4w9WgXcQ")
const YOUTUBE_VIDEO_ID = ''; // ← paste your YouTube video ID here

function MissionVideo() {
  const [playing, setPlaying] = useState(false);

  if (YOUTUBE_VIDEO_ID && playing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-primary/20 aspect-video"
      >
        <iframe
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
          title="Sodafom mission video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </motion.div>
    );
  }

  if (YOUTUBE_VIDEO_ID && !playing) {
    // Thumbnail click-to-play
    return (
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-primary/20 aspect-video cursor-pointer group"
        onClick={() => setPlaying(true)}
        role="button"
        aria-label="Play mission video"
      >
        <img
          src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
          alt="Sodafom mission video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl"
          >
            <Play size={32} className="text-primary ml-1 fill-primary" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // No video ID set — polished placeholder with key facts
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 aspect-video flex items-center justify-center"
    >
      {/* Decorative background circles */}
      <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-accent/10 pointer-events-none" />

      <div className="relative z-10 text-center px-8 max-w-lg">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center mx-auto mb-5"
        >
          <Play size={32} className="text-primary ml-1" />
        </motion.div>
        <p className="font-black text-foreground text-xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Our story — coming soon
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          We're putting together a short video about why Sodafom exists and what makes it different. Check back soon!
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { emoji: '🎮', text: '127 games' },
            { emoji: '🇬🇧', text: 'UK curriculum' },
            { emoji: '⭐', text: 'Star rewards' },
            { emoji: '🔒', text: 'Ad-free & safe' },
          ].map(({ emoji, text }) => (
            <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-bold text-foreground">
              <span>{emoji}</span> {text}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Sodafom — Our Story, Mission & Values</title>
        <meta name="description" content="Learn about Sodafom — the UK educational platform making maths, spelling and reading fun for children aged 5–13. Our story, mission, and values." />
        <link rel="canonical" href={`${siteUrl}/about`} />
        <meta property="og:title" content="About Sodafom — Our Story & Mission" />
        <meta property="og:description" content="The UK children's learning platform built by a parent, for parents. Fun, safe, curriculum-aligned games for ages 5–13." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Sodafom" />
        <meta name="twitter:description" content="The UK children's learning platform built by a parent, for parents." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <main>
        {/* ── HERO ── */}
        <section className="bg-primary py-20 text-center relative overflow-hidden">
          {['📚', '⭐', '🎓', '🌟', '🔑', '✨'].map((em, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl pointer-events-none select-none"
              style={{ top: `${10 + i * 15}%`, left: i % 2 === 0 ? `${4 + i * 4}%` : undefined, right: i % 2 !== 0 ? `${4 + i * 4}%` : undefined }}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.3 }}
            >{em}</motion.span>
          ))}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="relative z-10 max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-bold mb-6">
              <Heart size={14} className="fill-current" />
              <span>Built by a parent, for parents</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-primary-foreground mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
              Our story
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto">
              Sodafom was born from a simple frustration: why are children's learning apps so boring? We set out to build something different — a platform where learning feels like play.
            </p>
          </motion.div>
        </section>

        {/* ── MISSION ── */}
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <p className="text-primary font-bold text-sm mb-2">Our mission</p>
                <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  Every child deserves to love learning
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We believe the gap between "I hate maths" and "I love maths" is often just the right game at the right moment. Sodafom exists to close that gap — for every child, regardless of ability or background.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Our games are built around the UK National Curriculum, designed by educators, and tested by real families. We're not trying to replace teachers or parents — we're here to support them.
                </p>
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-black hover:opacity-90 transition-opacity"
                >
                  Explore the games <ChevronRight size={16} />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
                {about.STATS.map(stat => (
                  <motion.div key={stat.label} variants={fadeUp} className="bg-muted rounded-2xl p-6 text-center border border-border">
                    <div className="text-3xl mb-2">{stat.emoji}</div>
                    <div className="text-3xl font-black text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
                    <div className="text-sm font-bold text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">What we stand for</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Our values
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.VALUES.map((v, _airoIdx) => {
                const meta = VALUESMeta.at(_airoIdx);
                const Icon = meta ? meta.icon : Heart;

                return (
                  <motion.div key={v.title} variants={fadeUp} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${v.colour}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-black text-foreground text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">How we got here</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Our journey
              </h2>
            </motion.div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-10">
                {about.MILESTONES.map((m, i) => (
                  <motion.div key={m.year} variants={fadeUp} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    {/* Dot */}
                    <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 mt-1" aria-hidden="true" />
                    {/* Card */}
                    <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] bg-muted rounded-2xl p-5 border border-border ${i % 2 === 0 ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black mb-2">{m.year}</span>
                      <h3 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{m.label}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">The people behind Sodafom</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Meet the team
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {about.TEAM.map(t => (
                <motion.div key={t.name} variants={fadeUp} className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="text-6xl mb-4">{t.emoji}</div>
                  <h3 className="font-black text-foreground text-xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{t.name}</h3>
                  <p className="text-primary font-bold text-sm mb-3">{t.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.bio}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── AWARDS / TRUST ── */}
        <section className="py-16 bg-background border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-muted-foreground font-bold text-sm">Why families trust Sodafom</p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '🇬🇧', label: 'UK National Curriculum aligned' },
                { emoji: '🔒', label: 'GDPR compliant & COPPA safe' },
                { emoji: '📵', label: 'Zero adverts, zero tracking' },
                { emoji: '⭐', label: '5-star rated by parents' },
              ].map(b => (
                <motion.div key={b.label} variants={fadeUp} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted border border-border text-center">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-xs font-bold text-muted-foreground leading-tight">{b.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRESS / TESTIMONIALS ── */}
        <section className="py-20 bg-muted">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-bold text-sm mb-2">What people are saying</p>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Loved by families & teachers
              </h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {about.PRESS.map((p) => (
                <motion.div key={p.source} variants={fadeUp} className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-4">
                  <Quote size={20} className="text-primary/40 shrink-0" />
                  <p className="text-foreground text-sm leading-relaxed flex-1 italic">{p.quote}</p>
                  <p className="text-muted-foreground text-xs font-bold">— {p.source}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CURRICULUM ALIGNMENT ── */}
        <section className="py-16 bg-muted">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-primary font-bold text-sm mb-2 uppercase tracking-wide">Curriculum aligned</p>
              <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Built for the UK National Curriculum
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                Every game is mapped to the UK National Curriculum so children practise exactly what they need at school — from phonics in KS1 to algebra in KS3.
              </p>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { key: 'KS1', ages: 'Ages 5–7', desc: 'Phonics, counting, number bonds, simple sentences, shapes and colours.', emoji: '🌱', color: 'bg-green-100 border-green-300 text-green-800' },
                { key: 'KS2', ages: 'Ages 7–11', desc: 'Times tables, fractions, spelling rules, reading comprehension, science experiments.', emoji: '📚', color: 'bg-blue-100 border-blue-300 text-blue-800' },
                { key: 'KS3', ages: 'Ages 11–13', desc: 'Algebra, advanced grammar, scientific method, sequences, and critical reading.', emoji: '🔬', color: 'bg-purple-100 border-purple-300 text-purple-800' },
              ].map(ks => (
                <motion.div key={ks.key} variants={fadeUp} className={`rounded-2xl border-2 p-6 flex flex-col gap-3 ${ks.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ks.emoji}</span>
                    <div>
                      <p className="font-black text-lg leading-tight">{ks.key}</p>
                      <p className="text-sm font-bold opacity-75">{ks.ages}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">{ks.desc}</p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 text-xs font-black">
                      ✅ Curriculum aligned
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── MISSION VIDEO ── */}
        <section className="py-16 bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
              <p className="text-primary font-bold text-sm mb-2 uppercase tracking-wide">Our story</p>
              <h2 className="text-3xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Why we built Sodafom
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
                Sodafom was created by a parent who wanted something better — a platform where children actually want to learn, not just sit through it.
              </p>
            </motion.div>
            <MissionVideo />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-primary text-center relative overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="absolute pointer-events-none" style={{ top: `${20 + i * 20}%`, left: i % 2 === 0 ? `${5 + i * 5}%` : undefined, right: i % 2 !== 0 ? `${5 + i * 5}%` : undefined }}
              animate={{ rotate: 360 }} transition={{ duration: 10 + i * 3, repeat: Infinity, ease: 'linear' as const }}>
              <Award size={16 + i * 4} className="text-accent/20" />
            </motion.div>
          ))}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 max-w-2xl mx-auto px-4">
            <div className="text-5xl mb-6">🔑</div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Ready to unlock your child's potential?
            </h2>
            <p className="text-primary-foreground/75 text-lg mb-8">
              Start a free 7-day trial today — no card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/hub/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg">
                Start free trial <ChevronRight size={20} />
              </Link>
              <Link to="/games" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-foreground/10 text-primary-foreground font-black text-lg hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/30">
                Browse games
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
