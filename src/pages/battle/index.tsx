/**
 * /battle — Battle hub: pick a game to challenge a friend
 */
import { useState } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Swords, Copy, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/auth-client';

const BATTLE_GAMES = [
  { slug: 'number-ninja',       title: 'Number Ninja',       emoji: '🥷', subject: 'maths'   },
  { slug: 'times-table-blitz',  title: 'Times Table Blitz',  emoji: '⚡', subject: 'maths'   },
  { slug: 'word-builder',       title: 'Word Builder',       emoji: '🔤', subject: 'spelling' },
  { slug: 'spell-master',       title: 'Spell Master',       emoji: '✏️', subject: 'spelling' },
  { slug: 'story-quest',        title: 'Story Quest',        emoji: '📖', subject: 'reading'  },
  { slug: 'sentence-builder',   title: 'Sentence Builder',   emoji: '📝', subject: 'reading'  },
];

const SUBJECT_COLOUR: Record<string, string> = {
  maths:    'bg-amber-100 border-amber-300 text-amber-800',
  spelling: 'bg-red-100 border-red-300 text-red-800',
  reading:  'bg-green-100 border-green-300 text-green-800',
};

function BattleHubContent() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);

  async function createBattle(game: typeof BATTLE_GAMES[0]) {
    setCreating(game.slug);
    setShareUrl(null);
    setBattleId(null);
    setCopied(false);
    try {
      const raw = localStorage.getItem('sodafom_active_child');
      const childName = raw ? (JSON.parse(raw) as { name?: string }).name ?? 'Player 1' : 'Player 1';
      const res = await fetch(`${API_PREFIX}/battle/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameSlug: game.slug,
          gameTitle: game.title,
          gameEmoji: game.emoji,
          subject: game.subject,
          childName,
        }),
      });
      const data = await res.json() as { battleId: string; shareUrl: string };
      setShareUrl(data.shareUrl);
      setBattleId(data.battleId);
    } catch {
      alert('Could not create battle. Please try again.');
    } finally {
      setCreating(null);
    }
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goPlay() {
    if (!battleId || !shareUrl) return;
    // Find the game
    const game = BATTLE_GAMES.find(g => shareUrl.includes(battleId));
    void game;
    navigate(`/battle/${battleId}`);
  }

  return (
    <>
      <Helmet>
        <title>Friend Battles — Sodafom</title>
        <meta name="description" content="Challenge a friend to a learning game battle on Sodafom!" />
        <link rel="canonical" href="https://sodafom.uk/battle" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/games" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={15} /> Back to Games
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-3">
              <Swords size={32} className="text-secondary" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Friend Battles
            </h1>
            <p className="text-muted-foreground font-bold text-sm max-w-sm mx-auto">
              Pick a game, share the link with a friend, and see who scores higher!
            </p>
          </motion.div>

          {/* Share link card (shown after creating) */}
          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-8 bg-primary/5 border-2 border-primary/20 rounded-2xl p-5"
            >
              <p className="font-black text-foreground mb-1 text-sm">🎉 Battle created! Share this link:</p>
              <div className="flex gap-2 mt-2">
                <code className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground truncate">
                  {shareUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0 hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button
                onClick={goPlay}
                className="mt-3 w-full py-2.5 rounded-xl bg-secondary text-white font-black text-sm hover:opacity-90 transition-opacity"
              >
                ⚔️ Play your turn now
              </button>
            </motion.div>
          )}

          {/* Game grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BATTLE_GAMES.map((game, i) => (
              <motion.button
                key={game.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => void createBattle(game)}
                disabled={creating === game.slug}
                className="flex items-center gap-4 bg-card border-2 border-border hover:border-primary/40 rounded-2xl p-4 text-left transition-colors disabled:opacity-60"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                  {game.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                    {game.title}
                  </p>
                  <span className={`inline-block mt-0.5 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${SUBJECT_COLOUR[game.subject]}`}>
                    {game.subject}
                  </span>
                </div>
                <div className="shrink-0">
                  {creating === game.slug
                    ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    : <Swords size={18} className="text-muted-foreground" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 bg-muted/50 rounded-2xl p-5"
          >
            <p className="font-black text-foreground text-sm mb-3">How it works</p>
            <ol className="space-y-2">
              {[
                'Pick a game above to create a battle',
                'Copy the link and send it to a friend',
                'You both play the same game independently',
                'Scores are compared — highest wins! 🏆',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground font-bold">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default function BattleHubPage() {
  return (
    <ProtectedRoute>
      <BattleHubContent />
    </ProtectedRoute>
  );
}
