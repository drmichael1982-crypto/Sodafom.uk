import { app_download } from 'virtual:content';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Star, Smartphone, BookOpen, Gamepad2, BarChart3, Bell, Shield, Zap } from 'lucide-react';
import GamesSection from '@/components/GamesSection';
import { ArchieCharacter } from '../components/ArchieCharacter';

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
} as const;
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as const;

// ── Static data ───────────────────────────────────────────────────────────────
const APP_FEATURES = [
  { icon: <BookOpen size={22} />, title: 'All subjects included', desc: 'Maths, Spelling & Reading for ages 5–13 — all in one place.' },
  { icon: <Gamepad2 size={22} />, title: 'Fun learning games', desc: 'Hundreds of interactive games that make learning feel like play.' },
  { icon: <BarChart3 size={22} />, title: 'Progress tracking', desc: 'Parents can monitor every child\'s growth from the Hub dashboard.' },
  { icon: <Bell size={22} />, title: 'Daily reminders', desc: 'Gentle nudges keep children in their learning routine.' },
  { icon: <Smartphone size={22} />, title: 'Phone and tablet ready', desc: 'Open the mobile web app in a modern browser — no store download is needed.' },
  { icon: <Shield size={22} />, title: 'Safe & ad-free', desc: 'No adverts, no in-app purchases — just pure learning.' },
];

// ── Mobile web actions ────────────────────────────────────────────────────────
function AppStoreBadge() {
  return (
    <a
      href="/"
      aria-label="Open the Sodafom web app"
      className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity active:scale-95 select-none"
    >
      <Smartphone className="w-7 h-7 shrink-0" aria-hidden="true" />
      <div className="text-left leading-tight">
        <div className="text-xs font-bold opacity-75">Open the</div>
        <div className="text-lg font-black" style={{ fontFamily: 'var(--font-heading)' }}>Sodafom web app</div>
      </div>
    </a>
  );
}

function GooglePlayBadge() {
  return (
    <a
      href="/games"
      aria-label="Browse free learning games"
      className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity active:scale-95 select-none"
    >
      <Gamepad2 className="w-7 h-7 shrink-0" aria-hidden="true" />
      <div className="text-left leading-tight">
        <div className="text-xs font-bold opacity-75">Play now</div>
        <div className="text-lg font-black" style={{ fontFamily: 'var(--font-heading)' }}>Free learning games</div>
      </div>
    </a>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AppDownloadPage() {
  const site = 'https://sodafom.uk';
  const url = `${site}/download`;
  const ogImage = `${site}/og-image.png`;

  return (
    <>
      <Helmet>
        <title>Sodafom on Phones and Tablets</title>
        <meta name="description" content="Open Sodafom's free mobile web app for curriculum-aligned Maths, Spelling and Reading games for children aged 5–13." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Sodafom on Phones and Tablets" />
        <meta property="og:description" content="Free mobile web learning games for children aged 5–13." />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sodafom on Phones and Tablets" />
        <meta name="twitter:description" content="Free mobile web learning games for children aged 5–13." />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          name: 'Sodafom on Phones and Tablets',
          url,
          description: 'Open the free Sodafom mobile web app for curriculum-aligned learning games for children aged 5–13.',
          isPartOf: { '@id': `${site}/#website` },
          about: { '@id': `${site}/#organization` },
        })}</script>
      </Helmet>

      <main>
        {/* ── Hero ── */}
        <section className="bg-primary text-primary-foreground overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left: copy + badges */}
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-accent/30">
                  <Smartphone size={14} />
                  <span>Mobile web preview for phones &amp; tablets</span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Learning on phones and tablets 🌟
                </motion.h1>

                <motion.p variants={fadeUp} className="text-primary-foreground/80 text-lg leading-relaxed mb-8 max-w-lg">
                  Open Sodafom in a modern phone or tablet browser. Curriculum-aligned Maths, Spelling and Reading games are free in this testing release.
                </motion.p>

                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                  <Shield size={16} aria-hidden="true" />
                  <span className="text-primary-foreground/70 text-sm font-bold">Open testing release · designed for ages 5–13</span>
                </motion.div>

                {/* Download badges */}
                <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                  <AppStoreBadge />
                  <GooglePlayBadge />
                </motion.div>

                <motion.p variants={fadeUp} className="mt-4 text-primary-foreground/50 text-xs">
                  Free web access · no subscription or app-store download required
                </motion.p>
              </motion.div>

              {/* Right: device image */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' as const, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Glow blob */}
                  <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl scale-110 pointer-events-none" />
                  <div className="relative rounded-3xl shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10 w-72 sm:w-80 lg:w-96 aspect-[3/4] flex items-center justify-center p-8">
                    <ArchieCharacter size={240} className="drop-shadow-2xl" />
                  </div>
                  {/* Floating badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4, ease: 'backOut' as const }}
                    className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-xl border border-border px-4 py-3 flex items-center gap-2"
                  >
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-xs font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Open testing</p>
                      <p className="text-xs text-muted-foreground">Mobile web preview</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.4, ease: 'backOut' as const }}
                    className="absolute -top-4 -right-4 bg-accent rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2"
                  >
                    <Zap size={16} className="text-accent-foreground shrink-0" />
                    <p className="text-xs font-black text-accent-foreground" style={{ fontFamily: 'var(--font-heading)' }}>Free to use</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── App screenshots strip ── */}
        <section className="py-14 bg-muted/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-black text-foreground text-center mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Everything your child needs, beautifully designed
            </motion.h2>
            <p className="text-center text-muted-foreground text-sm mb-10">Swipe through games, track progress, and earn rewards — all in one mobile web app.</p>

            {/* Phone mockup frames */}
            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6"
            >
              {[
                { emoji: '🔢', label: 'Maths Games', desc: 'Number Pop, Times Tables, Fractions', bg: 'from-green-400 to-green-600', screen: ['3 + 4 = ?', '⭐⭐⭐', '12 pts'] },
                { emoji: '🔤', label: 'Spelling Bee', desc: 'Word Wizard, Spelling Bee, Phonics', bg: 'from-blue-400 to-blue-600', screen: ['S _ E L L', '🐝', 'Level 3'] },
                { emoji: '📖', label: 'Reading Quest', desc: 'Story Builder, Reading Quest', bg: 'from-purple-400 to-purple-600', screen: ['Chapter 2', '🏰', '85% done'] },
                { emoji: '🏆', label: 'Star Rewards', desc: 'Earn stars, unlock characters', bg: 'from-yellow-400 to-orange-500', screen: ['⭐ 247', '🦁 Unlocked!', 'Level up!'] },
              ].map((screen, i) => (
                <motion.div key={screen.label} variants={fadeUp} className="flex flex-col items-center gap-3">
                  {/* Phone frame */}
                  <div className="relative w-36 sm:w-40">
                    {/* Phone shell */}
                    <div className="bg-foreground rounded-[2rem] p-2 shadow-2xl">
                      <div className="bg-background rounded-[1.5rem] overflow-hidden">
                        {/* Status bar */}
                        <div className="bg-foreground/5 px-3 py-1 flex justify-between items-center">
                          <span className="text-[9px] font-black text-foreground/60">9:41</span>
                          <div className="flex gap-1">
                            <div className="w-3 h-1.5 rounded-full bg-foreground/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                          </div>
                        </div>
                        {/* App screen */}
                        <div className={`bg-gradient-to-b ${screen.bg} aspect-[9/16] flex flex-col items-center justify-center gap-3 px-3`}>
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' as const }}
                            className="text-4xl"
                          >{screen.emoji}</motion.div>
                          {screen.screen.map((line, li) => (
                            <div key={li} className="bg-white/20 rounded-xl px-3 py-1.5 text-white font-black text-xs text-center w-full">
                              {line}
                            </div>
                          ))}
                        </div>
                        {/* Home indicator */}
                        <div className="bg-background py-2 flex justify-center">
                          <div className="w-12 h-1 rounded-full bg-foreground/20" />
                        </div>
                      </div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-2 bg-foreground rounded-full" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{screen.label}</p>
                    <p className="text-muted-foreground text-xs">{screen.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Why families love the app
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Built for children, with clear learning and parent controls.
              </p>
            </motion.div>

            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {APP_FEATURES.map(f => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border border-border p-6 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-foreground mb-1 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl sm:text-4xl font-black text-center mb-12"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Up and running in minutes
            </motion.h2>
            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {app_download.STEPS.map(step => (
                <motion.div key={step.num} variants={fadeUp} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground text-2xl font-black mx-auto mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    {step.num}
                  </div>
                  <h3 className="font-black text-primary-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{step.title}</h3>
                  <p className="text-primary-foreground/70 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-black text-foreground text-center mb-10"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              What parents &amp; teachers say
            </motion.h2>
            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {app_download.REVIEWS.map(r => (
                <motion.div key={r.name} variants={fadeUp} className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-3">
                  <div className="flex gap-0.5" aria-label={`${r.stars} out of 5 stars`}>
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} size={14} className="fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed flex-1">"{r.text}"</p>
                  <p className="text-muted-foreground text-xs font-bold">— {r.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── GAMES GRID ── */}
        <GamesSection />

        {/* ── Bottom CTA ── */}
        <section id="coming-soon" className="py-20 px-4 bg-background text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <div className="text-6xl mb-5">📱</div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Ready to learn?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Open the free testing release in your phone or tablet browser. No store listing or subscription is required.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <a href="/hub/login" className="text-primary font-bold hover:underline">Sign in to the Hub →</a>
            </p>
          </motion.div>
        </section>

      </main>
    </>
  );
}
