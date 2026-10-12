import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, BookOpen, Calculator, Pencil, FlaskConical, ChevronRight, Clock, Users, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { games as gamesContent } from 'virtual:content';

const siteUrl = 'https://sodafom.uk';

const SUBJECT_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  maths:    { icon: <Calculator size={18} />,   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  label: 'Maths' },
  spelling: { icon: <Pencil size={18} />,        color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      label: 'Spelling' },
  reading:  { icon: <BookOpen size={18} />,      color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  label: 'Reading' },
  science:  { icon: <FlaskConical size={18} />,  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    label: 'Science' },
};

const CURRICULUM_LINKS: Record<string, string[]> = {
  maths:    ['KS1 Number & Place Value', 'KS2 Multiplication & Division', 'KS2 Fractions'],
  spelling: ['KS1 Phonics & Word Reading', 'KS2 Spelling Patterns', 'KS2 Vocabulary'],
  reading:  ['KS1 Comprehension', 'KS2 Reading for Pleasure', 'KS2 Inference Skills'],
  science:  ['KS1 Living Things', 'KS2 Animals & Habitats', 'KS2 Earth & Space'],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

interface GameEntry {
  id: string;
  title: string;
  subject: string;
  emoji: string;
  description?: string;
  ageGroup?: string;
  slug: string;
}

export default function GameOfTheWeekPage() {
  const [game, setGame] = useState<GameEntry | null>(null);
  const [relatedGames, setRelatedGames] = useState<GameEntry[]>([]);

  useEffect(() => {
    // Pick game of the week deterministically by ISO week number
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const allGames: GameEntry[] = (gamesContent.games ?? []).map((g: { id: string; title: string; subject: string; emoji: string; description?: string; ageGroup?: string; slug: string }) => ({
      ...g,
      slug: g.slug ?? g.id,
    }));

    if (allGames.length === 0) return;

    const picked = allGames[weekNum % allGames.length];
    setGame(picked);

    // Related: same subject, different game
    const related = allGames
      .filter(g => g.subject === picked.subject && g.id !== picked.id)
      .slice(0, 3);
    setRelatedGames(related);
  }, []);

  const subjectCfg = game ? (SUBJECT_CONFIG[game.subject] ?? SUBJECT_CONFIG.maths) : null;
  const curriculumLinks = game ? (CURRICULUM_LINKS[game.subject] ?? []) : [];

  const jsonLd = game ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/game-of-the-week#webpage`,
    name: `Game of the Week: ${game.title} | Sodafom`,
    url: `${siteUrl}/game-of-the-week`,
    isPartOf: { '@id': `${siteUrl}/#website` },
  } : null;

  return (
    <>
      <Helmet>
        <title>{game ? `Game of the Week: ${game.title}` : 'Game of the Week'} | Sodafom</title>
        <meta name="description" content={game ? `This week's featured Sodafom game is ${game.title} — a ${game.subject} game for children ages 5–13. Play now and earn bonus stars!` : 'Discover this week\'s featured learning game on Sodafom.'} />
        <link rel="canonical" href={`${siteUrl}/game-of-the-week`} />
        <meta property="og:title" content={game ? `Game of the Week: ${game.title} | Sodafom` : 'Game of the Week | Sodafom'} />
        <meta property="og:description" content="A new featured game every week — earn bonus stars and explore the curriculum." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/game-of-the-week`} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={game ? `Game of the Week: ${game.title} | Sodafom` : 'Game of the Week | Sodafom'} />
        <meta name="twitter:description" content="A new featured game every week — earn bonus stars and explore the curriculum." />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <main>
        {/* ── HERO ── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black">
                  ⭐ Game of the Week
                </span>
                <span className="text-muted-foreground text-xs">Updated every Monday</span>
              </motion.div>

              {game ? (
                <>
                  <motion.div variants={fadeUp} className="flex items-start gap-6 mb-6">
                    <div className="text-7xl md:text-8xl shrink-0">{game.emoji}</div>
                    <div>
                      <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-3"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {game.title}
                      </h1>
                      {subjectCfg && (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${subjectCfg.bg} ${subjectCfg.color}`}>
                          {subjectCfg.icon}
                          {subjectCfg.label}
                        </span>
                      )}
                    </div>
                  </motion.div>

                  <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                    {game.description ?? `${game.title} is a fun, curriculum-aligned ${game.subject} game that helps children aged 5–13 build key skills through play. Earn up to 3 stars and unlock achievement badges!`}
                  </motion.p>

                  <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
                    <Link
                      to={`/games/${game.slug}`}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl"
                    >
                      Play now
                      <ChevronRight size={20} />
                    </Link>
                    <div className="flex items-center gap-2 text-accent font-bold">
                      <Star size={18} className="fill-accent" />
                      <span>Earn up to 3 bonus stars this week</span>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-muted rounded-2xl w-2/3" />
                  <div className="h-6 bg-muted rounded-xl w-1/2" />
                  <div className="h-4 bg-muted rounded-xl w-full" />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── STATS ── */}
        {game && (
          <section className="py-10 bg-muted border-b border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { icon: <Clock size={20} />, label: 'Play time', value: '5–10 min' },
                  { icon: <Users size={20} />, label: 'Age range', value: '5–13 years' },
                  { icon: <Star size={20} className="fill-accent text-accent" />, label: 'Max stars', value: '3 stars' },
                  { icon: <Trophy size={20} />, label: 'Subject', value: subjectCfg?.label ?? 'Mixed' },
                ].map((stat, i) => (
                  <motion.div key={i} variants={fadeUp} className="bg-card rounded-2xl border border-border p-4 text-center">
                    <div className="flex justify-center text-primary mb-2">{stat.icon}</div>
                    <div className="font-black text-foreground text-lg">{stat.value}</div>
                    <div className="text-muted-foreground text-xs">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ── CURRICULUM LINKS ── */}
        {game && curriculumLinks.length > 0 && (
          <section className="py-16 bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.h2 variants={fadeUp} className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  Curriculum alignment
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground mb-6 leading-relaxed">
                  This game is aligned with the UK National Curriculum and supports the following learning objectives:
                </motion.p>
                <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {curriculumLinks.map((link, i) => (
                    <motion.div key={i} variants={fadeUp} className={`p-4 rounded-2xl border ${subjectCfg?.bg ?? 'bg-muted border-border'}`}>
                      <div className={`font-bold text-sm ${subjectCfg?.color ?? 'text-foreground'}`}>{link}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <h3 className="font-black text-foreground mb-2">Why this game?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our team selects the Game of the Week based on which skills children most benefit from practising at this time of year, aligned with what's typically being taught in UK schools. Playing for just 5–10 minutes a day can make a real difference to confidence and attainment.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── RELATED GAMES ── */}
        {relatedGames.length > 0 && (
          <section className="py-16 bg-muted">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.h2 variants={fadeUp} className="text-2xl font-black text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                  More {subjectCfg?.label} games
                </motion.h2>
                <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedGames.map(g => (
                    <motion.div key={g.id} variants={fadeUp}>
                      <Link
                        to={`/games/${g.slug}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group"
                      >
                        <span className="text-3xl">{g.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-foreground text-sm truncate group-hover:text-primary transition-colors">{g.title}</div>
                          <div className="text-muted-foreground text-xs capitalize">{g.subject}</div>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-16 bg-primary">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-black text-primary-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                Ready to play?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-primary-foreground/80 mb-6">
                Start your 7-day free trial and unlock all 118 games today.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
                {game && (
                  <Link to={`/games/${game.slug}`} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-accent text-accent-foreground font-black hover:scale-105 active:scale-95 transition-transform shadow-xl">
                    Play {game.title} <ChevronRight size={18} />
                  </Link>
                )}
                <Link to="/games" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/15 text-primary-foreground font-bold hover:bg-white/25 transition-all">
                  Browse all games
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
