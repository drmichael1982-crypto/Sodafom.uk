/**
 * /games/reading — Reading games hub (blue theme)
 * Shows ONLY reading-subject games.
 */
/**
 * /games/reading — Reading games hub (blue theme)
 * Shows ONLY reading-subject games.
 */
import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Star, Lock, Play, ChevronRight, BookOpen } from 'lucide-react';
import { games } from 'virtual:content';
import { isDemoGameId, useSubscription } from '@/hooks/useSubscription';


// Reading games only (subject = 'reading' or 'stories')
const READING_SUBJECTS = new Set(['reading', 'stories']);

const GAME_ROUTES = new Map<string, string>([
  ['game-phonics-parrot',    '/games/phonics-parrot'],
  ['game-reading-quest',     '/games/reading-quest'],
  ['game-story-builder',     '/games/story-builder'],
  ['game-colour-book',       '/games/colour-book'],
  ['game-sentence-builder',  '/games/sentence-builder'],
]);

const ageConfig: Record<string, { badge: string; icon: string }> = {
  '4–6':  { badge: 'bg-pink-400 text-white',         icon: '🌟' },
  '5–7':  { badge: 'bg-blue-400 text-white',          icon: '⭐' },
  '8–10': { badge: 'bg-blue-600 text-white',           icon: '🚀' },
  '11–13':{ badge: 'bg-indigo-700 text-white',         icon: '🏆' },
};

const difficultyConfig: Record<string, string> = {
  Easy:   'bg-blue-100 text-blue-800 border-blue-200',
  Medium: 'bg-sky-100 text-sky-800 border-sky-200',
  Hard:   'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const cardAnim = {
  hidden:  { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 220, damping: 22 } },
} as const;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

function useReadAloud() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const speak = (id: string, text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingId === id) { setSpeakingId(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 1.1;
    u.onstart = () => setSpeakingId(id);
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  return { speak, speakingId };
}

export default function ReadingHubPage() {
  const navigate = useNavigate();
  const { speak, speakingId } = useReadAloud();
  const { subscribed } = useSubscription();

  const allGames = ((games as unknown) as { games: Array<Record<string, unknown>> }).games ?? [];
  const readingGames = allGames.filter(
    (g) => READING_SUBJECTS.has(g.subject as string)
  );

  return (
    <main className="min-h-screen bg-cover bg-center bg-fixed pb-20" style={{ backgroundImage: "linear-gradient(rgba(37,99,235,.76),rgba(30,27,75,.94)),url('/assets/cartoon/home-landscape-v2.png')" }}>
      <Helmet>
        <title>Reading Hub — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Your reading learning hub on Sodafom. Browse all reading and comprehension games for ages 5–13." />
        <link rel="canonical" href="https://sodafom.uk/games/reading" />
        <meta property="og:title" content="Reading Hub — Sodafom" />
        <meta property="og:description" content="Your reading learning hub on Sodafom. Browse all reading and comprehension games for ages 5–13." />
        <meta property="og:url" content="https://sodafom.uk/games/reading" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reading Hub — Sodafom" />
        <meta name="twitter:description" content="Your reading learning hub on Sodafom. Browse all reading and comprehension games for ages 5–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/reading#webpage","name":"Reading Hub — Sodafom","url":"https://sodafom.uk/games/reading","description":"Your reading learning hub on Sodafom. Browse all reading and comprehension games for ages 5–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>

      {/* Hero banner — blue */}
      <div className="border-b-4 border-white/70 bg-cover bg-center text-white shadow-2xl" style={{ backgroundImage: "linear-gradient(rgba(30,64,175,.60),rgba(49,46,129,.88)),url('/assets/cartoon/worlds/reading.png')" }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-4">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-primary-foreground font-bold">Reading</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-4xl shrink-0">
              📖
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                Reading Challenge
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Stories, phonics, comprehension — all reading games in one place
              </p>
            </div>
          </div>
          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm font-bold">
              📚 {readingGames.length} games
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm font-bold">
              🎯 Ages 5–13
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-sm font-bold">
              ⭐ Earn stars
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {readingGames.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No reading games found.</p>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {readingGames.map((game) => {
              const id = game.id as string;
              const route = GAME_ROUTES.get(id);
              const isDemo = isDemoGameId(id);
              const locked = !isDemo && !subscribed;
              const ageGroups = (game.ageGroups as string[]) ?? [];
              const difficulty = game.difficulty as string | undefined;

              return (
                <motion.div key={id} variants={cardAnim}>
                  <button
                    onClick={() => {
                      if (!route) return;
                      if (locked) { navigate('/subscribe'); return; }
                      navigate(route);
                    }}
                    className="w-full text-left rounded-3xl border-2 border-primary/30 bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                  >
                    {/* Card header */}
                    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{game.emoji as string}</span>
                        <BookOpen size={14} className="text-primary" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {locked && <Lock size={14} className="text-muted-foreground" />}
                        {isDemo && (
                          <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-black">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h2 className="font-black text-foreground text-base leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {game.title as string}
                      </h2>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                        {game.description as string}
                      </p>

                      {/* Age badges */}
                      <div className="flex flex-wrap gap-1 mt-auto pt-2">
                        {ageGroups.map((ag) => {
                          const cfg = (Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined) ?? { badge: 'bg-blue-400 text-white', icon: '📖' };
                          return (
                            <span key={ag} className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
                              {cfg.icon} {ag}
                            </span>
                          );
                        })}
                        {difficulty && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${Object.hasOwn(difficultyConfig, difficulty) ? difficultyConfig[difficulty as keyof typeof difficultyConfig] : ''}`}>
                            {difficulty}
                          </span>
                        )}
                      </div>

                      {/* Stars */}
                      {(game.stars as number) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: game.stars as number }).map((_, i) => (
                            <Star key={i} size={12} className="text-accent fill-accent" />
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); speak(id, `${game.title}. ${game.description}`); }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                          aria-label="Read aloud"
                        >
                          {speakingId === id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                          locked
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {locked ? <><Lock size={12} /> Unlock</> : <><Play size={12} /> Play</>}
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Upsell if locked */}
        {!subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 rounded-3xl bg-primary/5 border-2 border-primary/20 p-6 text-center"
          >
            <p className="text-2xl mb-2">🔓</p>
            <h3 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Unlock all reading games
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start your 7-day free trial — no charge until the trial ends.
            </p>
            <Link
              to="/subscribe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-opacity"
            >
              Start free trial ✨
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
