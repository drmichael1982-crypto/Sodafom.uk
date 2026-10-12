/**
 * /games/maths — Maths games hub (green theme)
 * Shows ONLY maths-subject games.
 */
import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Star, Lock, Play, ChevronRight, Calculator } from 'lucide-react';
import catalog from '@/lib/archie/game-catalog.json';
import GameHubHelp from '@/components/games/GameHubHelp';
import { isDemoGameId, useSubscription } from '@/hooks/useSubscription';
import { ARCHIE_PREVIEW } from '@/lib/config';
import { useArchieData } from '@/lib/archie/storage';
import { isGameForYear } from '@/lib/archie/game-age';
import SceneArtwork, { sceneForSubject } from '@/components/SceneArtwork';


const ageConfig: Record<string, { badge: string; icon: string }> = {
  '4–6':  { badge: 'bg-pink-400 text-slate-950',      icon: '🌟' },
  '5–7':  { badge: 'bg-yellow-400 text-yellow-900',   icon: '⭐' },
  '8–10': { badge: 'bg-amber-500 text-slate-950',     icon: '🚀' },
  '11–13':{ badge: 'bg-orange-600 text-slate-950',    icon: '🏆' },
};

const difficultyConfig: Record<string, string> = {
  Easy:   'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Hard:   'bg-orange-100 text-orange-800 border-orange-200',
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

export default function MathsHubPage() {
  const navigate = useNavigate();
  const { speak, speakingId } = useReadAloud();
  const { subscribed } = useSubscription();
  const { settings } = useArchieData();

  const allGames = catalog as Array<Record<string, unknown>>;
  const mathsGames = allGames.filter(
    (g) => g.subject === 'maths' && (!ARCHIE_PREVIEW || isGameForYear(settings.year, (g.ageGroups as string[]) ?? []))
  );

  return (
    <main className={`min-h-screen bg-background pb-20 ${ARCHIE_PREVIEW ? 'soda-gamehub' : ''}`}>
      <Helmet>
        <title>Maths Hub — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Your maths learning hub on Sodafom. Browse all maths games for children aged 5–13." />
        <link rel="canonical" href="https://sodafom.uk/games/maths" />
        <meta property="og:title" content="Maths Hub — Sodafom" />
        <meta property="og:description" content="Your maths learning hub on Sodafom. Browse all maths games for children aged 5–13." />
        <meta property="og:url" content="https://sodafom.uk/games/maths" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Maths Hub — Sodafom" />
        <meta name="twitter:description" content="Your maths learning hub on Sodafom. Browse all maths games for children aged 5–13." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/maths#webpage","name":"Maths Hub — Sodafom","url":"https://sodafom.uk/games/maths","description":"Your maths learning hub on Sodafom. Browse all maths games for children aged 5–13.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>

      {/* Hero banner — green (accent) */}
      <div className="bg-accent text-accent-foreground">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-accent-foreground text-sm mb-4">
            <Link to="/" className="hover:text-accent-foreground transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-accent-foreground font-bold">Maths</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-black/10 flex items-center justify-center text-4xl shrink-0">
              🔢
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                Maths Games
              </h1>
              <p className="text-accent-foreground mt-1">
                Numbers, shapes, times tables — all maths games in one place
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-3 py-1.5 rounded-full bg-black/10 text-slate-950 text-sm font-bold">
              🔢 {mathsGames.length} games
            </span>
            <span className="px-3 py-1.5 rounded-full bg-black/10 text-slate-950 text-sm font-bold">
              🎯 {ARCHIE_PREVIEW ? `Year ${settings.year}` : 'Ages 5–13'}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-black/10 text-slate-950 text-sm font-bold">
              ⭐ Earn stars
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {ARCHIE_PREVIEW && <section className="soda-gamehub-age" aria-label="Your practice level"><p>Games for Year {settings.year} · Chosen for your current practice level.</p><Link to="/parents" className="a-button">Change practice year with a grown-up</Link></section>}
        <GameHubHelp title="Maths game library" subject="maths" />
        {mathsGames.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No maths games found.</p>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {mathsGames.map((game) => {
              const id = game.id as string;
              const route = typeof game.route === 'string' ? game.route : undefined;
              const isDemo = isDemoGameId(id);
              const locked = !isDemo && !subscribed;
              const ageGroups = (game.ageGroups as string[]) ?? [];
              const difficulty = game.difficulty as string | undefined;

              return (
                <motion.div key={id} variants={cardAnim}>
                  <article
                    aria-labelledby={`${id}-title`}
                    className="w-full text-left rounded-3xl border-2 border-accent/40 bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                  >
                    {ARCHIE_PREVIEW && <SceneArtwork scene={sceneForSubject('maths', game.title as string)} title={game.title as string} compact />}
                    <div className="bg-accent/10 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{game.emoji as string}</span>
                        <Calculator size={14} className="text-accent-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {locked && <Lock size={14} className="text-muted-foreground" />}
                        {isDemo && (
                          <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-black">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h2 id={`${id}-title`} className="font-black text-foreground text-base leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {game.title as string}
                      </h2>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                        {game.description as string}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-auto pt-2">
                        {ageGroups.map((ag) => {
                          const cfg = (Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined) ?? { badge: 'bg-amber-400 text-slate-950', icon: '🔢' };
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

                      {(game.stars as number) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: game.stars as number }).map((_, i) => (
                            <Star key={i} size={12} className="text-accent fill-accent" />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => speak(id, `${game.title}. ${game.description}`)}
                          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-accent/10 transition-colors text-accent-foreground focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                          aria-label={`${speakingId === id ? 'Stop reading' : 'Read'} about ${game.title}`}
                        >
                          {speakingId === id ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
                        </button>
                        <button
                          type="button"
                          aria-label={`${locked ? 'Unlock' : 'Play'} ${game.title}`}
                          onClick={() => {
                            if (!route) return;
                            if (locked) { navigate('/subscribe'); return; }
                            navigate(route);
                          }}
                          className={`min-h-11 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
                          locked ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'
                        }`}>
                          {locked ? <><Lock size={12} aria-hidden="true" /> Unlock</> : <><Play size={12} aria-hidden="true" /> Play</>}
                        </button>
                      </div>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 rounded-3xl bg-accent/5 border-2 border-accent/20 p-6 text-center"
          >
            <p className="text-2xl mb-2">🔓</p>
            <h3 className="font-black text-foreground text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Unlock all maths games
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start your 7-day free trial — no charge until the trial ends.
            </p>
            <Link
              to="/subscribe"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-black text-sm hover:opacity-90 transition-opacity"
            >
              Start free trial ✨
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
