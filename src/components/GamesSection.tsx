import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Volume2, VolumeX, Play, Lock, Zap } from 'lucide-react';
import { useNavigate } from "react-router";
import { games } from 'virtual:content';
import { isDemoGameId, useSubscription } from '@/hooks/useSubscription';
const GAME_ROUTES = new Map<string, string>([
  ['game-number-pop', '/games/number-pop'],
  ['game-times-table-race', '/games/times-table-race'],
  ['game-fraction-pizza', '/games/fraction-pizza'],
  ['game-shape-sorter', '/games/shape-sorter'],
  ['game-word-wizard', '/games/word-wizard'],
  ['game-spelling-bee', '/games/spelling-bee'],
  ['game-tricky-words', '/games/tricky-word-hunt'],
  ['game-story-builder', '/games/story-builder'],
  ['game-phonics-parrot', '/games/phonics-parrot'],
  ['game-reading-quest', '/games/reading-quest'],
]);

function routeForGame(gameId: string): string {
  return GAME_ROUTES.get(gameId) ?? `/games/${gameId.replace(/^game-/, '')}`;
}
const AGE_ALL = 'All ages';
const AGE_OPTIONS = [AGE_ALL, '5–7', '8–10', '11–13'];
const ageConfig: Record<string, {
  badge: string;
  icon: string;
}> = {
  '5–7': {
    badge: 'bg-yellow-400 text-yellow-900',
    icon: '⭐'
  },
  '8–10': {
    badge: 'bg-blue-500 text-white',
    icon: '🚀'
  },
  '11–13': {
    badge: 'bg-purple-600 text-white',
    icon: '🏆'
  }
};
const subjectConfig: Record<string, {
  border: string;
  headerBg: string;
}> = {
  maths: {
    border: 'border-amber-300',
    headerBg: 'bg-accent'
  },
  spelling: {
    border: 'border-red-300',
    headerBg: 'bg-secondary'
  },
  reading: {
    border: 'border-green-300',
    headerBg: 'bg-primary'
  },
  stories: {
    border: 'border-green-300',
    headerBg: 'bg-primary'
  }
};
const dotPositions = [{
  top: '10%',
  left: '8%'
}, {
  top: '24%',
  left: '23%'
}, {
  top: '38%',
  left: '53%'
}, {
  top: '52%',
  left: '68%'
}, {
  top: '66%',
  left: '38%'
}, {
  top: '80%',
  left: '83%'
}];
function useReadAloud() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = (id: string, text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1;
    u.onstart = () => setSpeakingId(id);
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };
  React.useEffect(() => () => {
    window.speechSynthesis?.cancel();
  }, []);
  return {
    speak,
    speakingId
  };
}
const cardAnim = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 220,
      damping: 22
    }
  }
} as const;
const staggerGrid = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
} as const;
export default function GamesSection() {
  const [selectedAge, setSelectedAge] = useState(AGE_ALL);
  const [selectedCat, setSelectedCat] = useState('cat-all');
  const {
    speak,
    speakingId
  } = useReadAloud();
  const navigate = useNavigate();
  const {
    subscribed
  } = useSubscription();
  const isVisible = (game: typeof games.games[number]) => {
    const ageOk = selectedAge === AGE_ALL || game.ageGroups.includes(selectedAge);
    const catId = selectedCat.replace('cat-', '');
    const catOk = selectedCat === 'cat-all' || game.subject === catId;
    return ageOk && catOk;
  };
  const visibleCount = games.games.filter(isVisible).length;
  return <section className="py-14 bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2" style={{
          fontFamily: 'var(--font-heading)'
        }}>
            🎮 All {games.games.length} Games Included
          </h2>
          <p className="text-muted-foreground text-lg">Every game available on the app — play now in your browser or on the go</p>
        </div>

        {/* Age filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {AGE_OPTIONS.map(age => {
          const cfg = age !== AGE_ALL ? (Object.hasOwn(ageConfig, age) ? ageConfig[age as keyof typeof ageConfig] : undefined) : null;
          const isActive = selectedAge === age;
          return <motion.button key={age} whileHover={{
            scale: 1.06
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setSelectedAge(age)} className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card text-foreground border-border hover:border-primary/50'}`}>
                <span>{cfg ? cfg.icon : '🌈'}</span>
                <span>{age === AGE_ALL ? 'All ages' : `Ages ${age}`}</span>
              </motion.button>;
        })}
        </div>

        {/* Subject filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {games.categories.map(cat => {
          const isActive = selectedCat === cat.id;
          return <motion.button key={cat.id} whileHover={{
            scale: 1.06
          }} whileTap={{
            scale: 0.95
          }} onClick={() => setSelectedCat(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm border-2 transition-all ${isActive ? 'bg-accent text-accent-foreground border-accent shadow-md' : 'bg-card text-foreground border-border hover:border-accent/50'}`}>
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>;
        })}
        </div>

        <p className="text-muted-foreground text-sm font-semibold mb-6 text-center">
          {visibleCount === 0 ? 'No games match — try a different filter!' : `Showing ${visibleCount} game${visibleCount !== 1 ? 's' : ''}`}
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={`${selectedAge}-${selectedCat}`} variants={staggerGrid} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.games.map(game => {
            const visible = isVisible(game);
            const cfg = subjectConfig[game.subject] ?? subjectConfig['maths'];
            const isSpeaking = speakingId === game.id;
            const isDemo = isDemoGameId(game.id);
            const isLocked = !subscribed && !isDemo;
            return <motion.div key={game.id} variants={cardAnim} whileHover={{
              scale: 1.02,
              y: -4
            }} className={`rounded-2xl overflow-hidden border-2 shadow-sm flex flex-col ${cfg.border} ${!visible ? 'hidden' : ''} relative`}>
                  {isDemo ? <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-black shadow-md">
                      <Star size={10} className="fill-current" /> Free
                    </div> : isLocked ? <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/80 text-background text-xs font-black shadow-md">
                      <Lock size={10} /> Premium
                    </div> : null}

                  <div className={`relative h-36 rounded-t-2xl overflow-hidden flex items-center justify-center ${cfg.headerBg} ${isLocked ? 'opacity-70' : ''}`}>
                    {dotPositions.map((pos, di) => <motion.div key={di} className="absolute w-8 h-8 rounded-full bg-white/10" style={{
                  top: pos.top,
                  left: pos.left
                }} animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }} transition={{
                  duration: 2 + di * 0.4,
                  repeat: Infinity,
                  delay: di * 0.3,
                  ease: 'easeInOut' as const
                }} />)}
                    <motion.div animate={{
                  y: [0, -6, 0],
                  rotate: [0, 5, -5, 0]
                }} transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut' as const
                }} className="text-6xl select-none z-10">
                      {game.emoji}
                    </motion.div>
                    {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Lock size={20} className="text-foreground" />
                        </div>
                      </div>}
                    {!isLocked && <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                          <Play size={24} className="text-primary ml-1" />
                        </div>
                      </div>}
                  </div>

                  <div className="bg-card p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-foreground text-lg leading-tight" style={{
                    fontFamily: 'var(--font-heading)'
                  }}>
                        {game.title}
                      </h3>
                      {game.readAloud && !isLocked && <motion.button whileHover={{
                    scale: 1.15
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={() => speak(game.id, `${game.title}. ${game.description}`)} className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSpeaking ? 'bg-primary text-primary-foreground' : 'bg-primary/10 hover:bg-primary/20'}`} aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}>
                          {isSpeaking ? <VolumeX size={14} className="text-primary-foreground" /> : <Volume2 size={14} className="text-primary" />}
                        </motion.button>}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{game.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.ageGroups.map(ag => {
                    const agCfg = Object.hasOwn(ageConfig, ag) ? ageConfig[ag as keyof typeof ageConfig] : undefined;
                    return <span key={ag} className={`text-xs font-bold px-2 py-0.5 rounded-full ${agCfg?.badge ?? 'bg-muted text-muted-foreground'}`}>
                            {agCfg?.icon ?? ''} Ages {ag}
                          </span>;
                  })}
                    </div>
                    <motion.button whileHover={{
                  scale: 1.03
                }} whileTap={{
                  scale: 0.97
                }} onClick={() => {
                  navigate(isLocked ? '/subscribe' : routeForGame(game.id));
                }} className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors ${isLocked ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                      {isLocked ? <><Lock size={14} /> Unlock with Trial</> : <><Zap size={14} /> Play Now</>}
                    </motion.button>
                  </div>
                </motion.div>;
          })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>;
}
