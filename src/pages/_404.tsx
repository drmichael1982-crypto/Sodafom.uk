import { _404 } from 'virtual:content';
import { Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Home, ArrowLeft, MessageCircle, Shuffle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { games as gamesContent } from 'virtual:content';

interface SuggestedGame { id: string; title: string; emoji: string; slug: string; subject: string; }

function useRandomGames(count = 3): SuggestedGame[] {
  const [picks, setPicks] = useState<SuggestedGame[]>([]);
  useEffect(() => {
    const all = (gamesContent.games ?? []) as SuggestedGame[];
    if (!all.length) return;
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setPicks(shuffled.slice(0, count));
  }, [count]);
  return picks;
}

const floatVariants = {
  animate: (i: number) => ({
    y: [0, -12, 0],
    rotate: [0, i % 2 === 0 ? 8 : -8, 0],
    transition: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' as const, delay: i * 0.3 },
  }),
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const suggestedGames = useRandomGames(3);

  // Archie message cycles
  const archieMessages = [
    "Uh oh! I looked everywhere but couldn't find that page! 🦁",
    "Even I got lost once — but I found my way back! Let's go! 🌟",
    "That page must be on an adventure! Let's play a game instead! 🎮",
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % archieMessages.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Helmet>
        <title>Page Not Found — Sodafom</title>
        <meta name="description" content="The page you're looking for doesn't exist. Find age-appropriate maths, spelling and reading games for children aged 5–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/404" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-background to-muted/40">
        <div className="max-w-2xl w-full text-center">

          {/* Floating emojis */}
          <div className="relative h-32 mb-2 flex items-center justify-center">
            {['🌟', '🚀', '🏆', '🎮', '📖', '🔢'].map((emoji, i) => (
              <motion.span
                key={emoji}
                custom={i}
                variants={floatVariants}
                animate="animate"
                className="absolute text-3xl select-none pointer-events-none"
                style={{
                  left: `${10 + i * 14}%`,
                  top: i % 2 === 0 ? '10%' : '40%',
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* 404 heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <div
              className="text-[120px] sm:text-[160px] font-black leading-none select-none"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--primary) / 0.12)' }}
            >
              404
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
            className="-mt-8 mb-6"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Oops! Page not found
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Looks like this page went on an adventure without us. Let's get you back to the learning fun!
            </p>
          </motion.div>

          {/* Archie speech bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-start gap-3 max-w-sm mx-auto mb-8 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left"
          >
            <span className="text-3xl shrink-0">🦁</span>
            <div>
              <p className="font-black text-foreground text-sm mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Archie says:</p>
              <motion.p
                key={msgIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {archieMessages[msgIdx]}
              </motion.p>
            </div>
          </motion.div>

          {/* Primary actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-black text-base hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              <Home size={18} />
              Go to homepage
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-border bg-card text-foreground font-black text-base hover:border-primary/50 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowLeft size={18} />
              Go back
            </button>
            <motion.button
              whileHover={{ scale: 1.06, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const all = (gamesContent.games ?? []) as { slug: string }[];
                if (!all.length) return;
                const pick = all[Math.floor(Math.random() * all.length)];
                navigate(`/games/${pick.slug}`);
              }}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-accent text-accent-foreground font-black text-base shadow-lg"
            >
              <Shuffle size={18} />
              Surprise me!
            </motion.button>
          </motion.div>

          {/* Suggested games */}
          {suggestedGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-10"
            >
              <p className="text-sm font-bold text-muted-foreground mb-3 flex items-center justify-center gap-2">
                <MessageCircle size={14} />
                While you're here, why not play one of these?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedGames.map(game => (
                  <Link
                    key={game.id}
                    to={`/games/${game.slug}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border-2 border-border hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <span className="text-3xl">{game.emoji}</span>
                    <div className="text-left min-w-0">
                      <div className="font-black text-foreground text-sm truncate group-hover:text-primary transition-colors">{game.title}</div>
                      <div className="text-muted-foreground text-xs capitalize">{game.subject}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick links grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <p className="text-sm font-bold text-muted-foreground mb-4">
              Or jump straight to
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {_404.QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all hover:scale-105 ${link.color}`}
                >
                  <span className="text-xl">{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </main>
    </>
  );
}
