/**
 * /battle/:id — Battle room: join, play, and see live results
 */
import { useState, useEffect, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Clock, Copy, Check, ArrowLeft, Star } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import ConfettiCanvas from '@/components/games/ConfettiCanvas';

interface BattlePlayer {
  name: string;
  score: number | null;
  stars: number | null;
}

interface Battle {
  battleId: string;
  gameSlug: string;
  gameTitle: string;
  gameEmoji: string;
  subject: string;
  status: 'waiting' | 'active' | 'complete';
  creator: BattlePlayer;
  challenger: BattlePlayer | null;
  createdAt: string;
}

const SUBJECT_BG: Record<string, string> = {
  maths:    'from-amber-400 to-yellow-500',
  spelling: 'from-red-400 to-rose-500',
  reading:  'from-green-500 to-emerald-600',
};

const GAME_ROUTES: Record<string, string> = {
  'number-ninja':      '/games/number-ninja',
  'times-table-blitz': '/games/times-table-blitz',
  'word-builder':      '/games/word-builder',
  'spell-master':      '/games/spell-master',
  'story-quest':       '/games/story-quest',
  'sentence-builder':  '/games/sentence-builder',
};

function StarRow({ count, total = 3 }: { count: number | null; total?: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={20}
          className={i < (count ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

function ScoreBar({ score, color }: { score: number | null; color: string }) {
  return (
    <div className="h-3 bg-muted rounded-full overflow-hidden mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: score !== null ? `${score}%` : '0%' }}
        transition={{ duration: 0.9, ease: 'easeOut' as const, delay: 0.3 }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

function BattleRoomContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionData = useSession();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [myRole, setMyRole] = useState<'creator' | 'challenger' | 'spectator'>('spectator');

  const fetchBattle = useCallback(async () => {
    try {
      const res = await fetch(`${API_PREFIX}/battle/${id}`, { credentials: 'include' });
      if (!res.ok) { setError('Battle not found.'); return; }
      const data = await res.json() as Battle;
      setBattle(data);

      // Determine role
      if (sessionData?.session || sessionData?.user) {
        // We can't get userId from session easily here, so we rely on name matching
        // The server stores creator_user_id — we'll use a separate approach via localStorage flag
        const flag = localStorage.getItem(`sodafom_battle_role_${id}`);
        if (flag === 'creator') setMyRole('creator');
        else if (flag === 'challenger') setMyRole('challenger');
        else setMyRole('spectator');
      }

      // Fire confetti when battle completes
      if (data.status === 'complete') {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 4000);
      }
    } catch {
      setError('Could not load battle.');
    } finally {
      setLoading(false);
    }
  }, [id, sessionData]);

  // Poll every 3 seconds while not complete
  useEffect(() => {
    void fetchBattle();
    const interval = setInterval(() => {
      if (battle?.status !== 'complete') void fetchBattle();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchBattle, battle?.status]);

  void sessionData; // used for auth context only

  // Mark as creator when we arrive via /battle (created by us)
  useEffect(() => {
    const flag = localStorage.getItem(`sodafom_battle_role_${id}`);
    if (!flag) {
      localStorage.setItem(`sodafom_battle_role_${id}`, 'challenger');
      setMyRole('challenger');
    }
  }, [id]);

  function copyLink() {
    const url = `https://sodafom.uk/battle/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goPlay() {
    if (!battle) return;
    const route = GAME_ROUTES[battle.gameSlug] ?? '/games';
    // Store battle context so GameShell can submit score after completion
    localStorage.setItem('sodafom_active_battle', JSON.stringify({ battleId: id, role: myRole }));
    navigate(route);
  }

  const gradient = battle ? (SUBJECT_BG[battle.subject] ?? SUBJECT_BG['maths']) : SUBJECT_BG['maths'];

  // Determine winner
  const winner = (() => {
    if (!battle || battle.status !== 'complete') return null;
    const cs = battle.creator.score ?? 0;
    const chs = battle.challenger?.score ?? 0;
    if (cs > chs) return 'creator';
    if (chs > cs) return 'challenger';
    return 'draw';
  })();

  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-muted-foreground">Loading battle...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">⚔️</p>
        <p className="font-black text-foreground text-lg mb-2">Battle not found</p>
        <p className="text-muted-foreground text-sm mb-6">{error}</p>
        <Link to="/battle" className="inline-block bg-primary text-primary-foreground font-black px-6 py-3 rounded-xl">
          Create a Battle
        </Link>
      </div>
    </main>
  );

  if (!battle) return null;

  return (
    <>
      <Helmet>
        <title>{battle.gameTitle} Battle — Sodafom</title>
        <meta name="description" content={`Join the ${battle.gameTitle} battle on Sodafom!`} />
        <link rel="canonical" href={`https://sodafom.uk/battle/${id}`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <ConfettiCanvas active={confetti} mode="burst" intensity={winner === 'draw' ? 0.5 : 1} />

      <main className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
          <Link to="/battle" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={15} /> All Battles
          </Link>

          {/* Game header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl bg-gradient-to-r ${gradient} text-white p-5 mb-6 text-center shadow-lg`}
          >
            <div className="text-4xl mb-1">{battle.gameEmoji}</div>
            <h1 className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
              {battle.gameTitle} Battle
            </h1>
            <StatusBadge status={battle.status} />
          </motion.div>

          {/* Waiting state */}
          <AnimatePresence>
            {battle.status === 'waiting' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border-2 border-dashed border-border rounded-2xl p-6 text-center mb-6"
              >
                <div className="flex justify-center mb-3">
                  <Clock size={28} className="text-muted-foreground animate-pulse" />
                </div>
                <p className="font-black text-foreground mb-1">Waiting for your opponent...</p>
                <p className="text-muted-foreground text-sm mb-4">Share this link so they can join:</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-muted rounded-xl px-3 py-2 text-xs font-mono truncate text-foreground">
                    sodafom.uk/battle/{id}
                  </code>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VS card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-card border-2 border-border rounded-2xl p-6 mb-6"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Creator */}
              <PlayerCard
                player={battle.creator}
                label="Challenger 1"
                gradient={gradient}
                isWinner={winner === 'creator'}
                isDraw={winner === 'draw'}
                pending={battle.creator.score === null}
              />

              {/* VS divider */}
              <div className="flex flex-col items-center gap-1">
                <Swords size={24} className="text-muted-foreground" />
                <span className="text-xs font-black text-muted-foreground">VS</span>
              </div>

              {/* Challenger */}
              <PlayerCard
                player={battle.challenger ?? { name: '???', score: null, stars: null }}
                label="Challenger 2"
                gradient={gradient}
                isWinner={winner === 'challenger'}
                isDraw={winner === 'draw'}
                pending={!battle.challenger || battle.challenger.score === null}
                ghost={!battle.challenger}
              />
            </div>

            {/* Score bars */}
            {(battle.creator.score !== null || (battle.challenger?.score !== null)) && (
              <div className="mt-5 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                    <span>{battle.creator.name}</span>
                    <span>{battle.creator.score ?? '—'}%</span>
                  </div>
                  <ScoreBar score={battle.creator.score} color={gradient} />
                </div>
                {battle.challenger && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                      <span>{battle.challenger.name}</span>
                      <span>{battle.challenger.score ?? '—'}%</span>
                    </div>
                    <ScoreBar score={battle.challenger.score} color="from-gray-400 to-gray-500" />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Winner banner */}
          <AnimatePresence>
            {battle.status === 'complete' && winner && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`rounded-2xl bg-gradient-to-r ${gradient} text-white text-center py-4 px-5 mb-6 shadow-lg`}
              >
                <p className="text-2xl mb-1">{winner === 'draw' ? '🤝' : '🏆'}</p>
                <p className="font-black text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                  {winner === 'draw'
                    ? "It's a draw!"
                    : winner === 'creator'
                    ? `${battle.creator.name} wins!`
                    : `${battle.challenger?.name ?? 'Challenger'} wins!`}
                </p>
                <p className="text-sm opacity-90 font-bold mt-0.5">
                  {winner === 'draw' ? 'Both players scored the same!' : 'Great game — well played!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play / Rematch CTA */}
          <div className="flex gap-3">
            {battle.status !== 'complete' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goPlay}
                className={`flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r ${gradient} shadow-md`}
              >
                ⚔️ Play Your Turn
              </motion.button>
            )}
            {battle.status === 'complete' && (
              <Link
                to="/battle"
                className={`flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r ${gradient} shadow-md text-center`}
              >
                ⚔️ New Battle
              </Link>
            )}
            <Link
              to="/games"
              className="flex-1 py-3 rounded-xl font-bold bg-muted text-foreground border border-border text-center"
            >
              All Games
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: Battle['status'] }) {
  const map = {
    waiting:  { label: 'Waiting for opponent', cls: 'bg-white/20' },
    active:   { label: 'In progress',           cls: 'bg-white/20' },
    complete: { label: 'Complete',              cls: 'bg-white/30' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block mt-2 text-xs font-black px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function PlayerCard({
  player, label, gradient, isWinner, isDraw, pending, ghost = false,
}: {
  player: BattlePlayer;
  label: string;
  gradient: string;
  isWinner: boolean;
  isDraw: boolean;
  pending: boolean;
  ghost?: boolean;
}) {
  return (
    <div className={`text-center rounded-xl p-3 border-2 transition-colors
      ${isWinner ? `border-yellow-400 bg-yellow-50` : isDraw ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`}
    >
      {isWinner && <div className="text-lg mb-1">🏆</div>}
      {isDraw && <div className="text-lg mb-1">🤝</div>}
      <p className="font-black text-foreground text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>
        {ghost ? '???' : player.name}
      </p>
      <p className="text-[10px] font-bold text-muted-foreground mb-2">{label}</p>
      {ghost ? (
        <p className="text-xs text-muted-foreground font-bold italic">Waiting...</p>
      ) : pending ? (
        <div className="flex justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-black text-foreground">{player.score}%</p>
          <StarRow count={player.stars} />
        </>
      )}
    </div>
  );
}

export default function BattleRoomPage() {
  return (
    <ProtectedRoute>
      <BattleRoomContent />
    </ProtectedRoute>
  );
}
