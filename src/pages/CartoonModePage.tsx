import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Calculator, BookOpen, Pencil, FlaskConical, Sparkles, Star, Cloud, Sun,
  ArrowLeft, Home, Trophy, Settings, BarChart2, ShoppingCart, Globe, Grid, Music, Heart,
  Tent, Trees, Rocket, Ghost, GraduationCap, Map as MapIcon, ChevronRight, Search, Zap
} from 'lucide-react';
import { ArchieCharacter } from '../components/ArchieCharacter';
import { CartoonRobot } from '../components/CartoonRobot';
import { useNavigate } from 'react-router';

// ── Types ────────────────────────────────────────────────────────────────────
type WorldId = 'map' | 'maths' | 'reading' | 'spelling' | 'science' | 'geography' | 'crossword' | 'creative' | 'music';

interface WorldConfig {
  id: WorldId;
  name: string;
  shortName: string;
  color: string;
  accent: string;
  lightAccent: string;
  themeGradient: string;
  icon: any;
  archiesMessage: string;
  emoji: string;
  locations: { id: string; label: string; icon: any; route: string; type: 'castle' | 'lab' | 'forest' | 'planet' | 'path' }[];
}

// ── Configuration ────────────────────────────────────────────────────────────
const WORLDS: Record<string, WorldConfig> = {
  maths: {
    id: 'maths',
    name: 'Maths Adventure Island',
    shortName: 'Maths World',
    color: 'text-blue-600',
    accent: 'bg-blue-500',
    lightAccent: 'bg-blue-50',
    themeGradient: 'from-blue-400 via-blue-500 to-indigo-600',
    icon: Calculator,
    emoji: '🔢',
    archiesMessage: "Welcome to Maths Island! We're going on a quest to find the Golden Numbers. Let's start at the Addition Waterfall!",
    locations: [
      { id: 'tt', label: 'Times Table Tunnels', icon: Grid, route: '/games/times-table-race', type: 'path' },
      { id: 'ns', label: 'Number Pop Mountain', icon: Calculator, route: '/games/number-pop', type: 'path' },
      { id: 'mc', label: 'Maths Challenge Castle', icon: Trophy, route: '/games/maths-challenge', type: 'castle' },
      { id: 'md', label: 'Multiplication Meadows', icon: Sparkles, route: '/games/multiplication-grid', type: 'path' },
      { id: 'fp', label: 'Fraction Pizza Kitchen', icon: Heart, route: '/games/fraction-pizza', type: 'lab' },
      { id: 'su', label: 'Sudoku Secret Cave', icon: Grid, route: '/games/sudoku', type: 'path' },
    ]
  },
  reading: {
    id: 'reading',
    name: 'Reading Quest: Story Land',
    shortName: 'Reading World',
    color: 'text-emerald-600',
    accent: 'bg-emerald-500',
    lightAccent: 'bg-emerald-50',
    themeGradient: 'from-emerald-400 via-emerald-500 to-teal-600',
    icon: BookOpen,
    emoji: '📖',
    archiesMessage: "Shhh! We've entered Story Land. The giant books are opening their secrets for us. Which adventure shall we pick?",
    locations: [
      { id: 'sb', label: 'Story Builder Library', icon: BookOpen, route: '/games/story-builder', type: 'castle' },
      { id: 'rq', label: 'Reading Quest Path', icon: Trees, route: '/games/reading-quest', type: 'path' },
      { id: 'ae', label: 'Alphabet Explorer Woods', icon: MapIcon, route: '/games/alphabet-explorer', type: 'path' },
      { id: 'pp', label: 'Phonics Parrot Nest', icon: Music, route: '/games/phonics-parrot', type: 'path' },
      { id: 'pc', label: 'Poetry Flower Garden', icon: Heart, route: '/games/poetry-corner', type: 'path' },
      { id: 'sm', label: 'Story Map Castle', icon: Trophy, route: '/games/story-map', type: 'castle' },
    ]
  },
  spelling: {
    id: 'spelling',
    name: 'Spelling World: Word Kingdom',
    shortName: 'Spelling World',
    color: 'text-purple-600',
    accent: 'bg-purple-500',
    lightAccent: 'bg-purple-50',
    themeGradient: 'from-purple-400 via-purple-500 to-fuchsia-600',
    icon: Pencil,
    emoji: '🔤',
    archiesMessage: "Welcome to the Word Kingdom! The letters are floating everywhere. Can you help me catch them and spell the magic words?",
    locations: [
      { id: 'sb', label: 'Spelling Bee Hive', icon: Pencil, route: '/games/spelling-bee', type: 'lab' },
      { id: 'ls', label: 'Letter Sound Lake', icon: Music, route: '/games/letter-sounds', type: 'path' },
      { id: 'wb', label: 'Word Builder Workshop', icon: Grid, route: '/games/word-builder', type: 'lab' },
      { id: 'th', label: 'Tricky Word Hunt', icon: Search, route: '/games/tricky-word-hunt', type: 'path' },
      { id: 'ws', label: 'Word Search Maze', icon: Sparkles, route: '/games/word-search', type: 'path' },
      { id: 'sc', label: 'Spelling Arena', icon: Trophy, route: '/games/spelling-challenge', type: 'castle' },
    ]
  },
  science: {
    id: 'science',
    name: 'Discovery Planet: Science World',
    shortName: 'Science World',
    color: 'text-cyan-600',
    accent: 'bg-cyan-500',
    lightAccent: 'bg-cyan-50',
    themeGradient: 'from-cyan-400 via-sky-500 to-blue-600',
    icon: FlaskConical,
    emoji: '🔬',
    archiesMessage: "Blast off! We're on Discovery Planet. Let's visit the Space Station and the Dinosaur Woods!",
    locations: [
      { id: 'ak', label: 'Animal Kingdom Forest', icon: Heart, route: '/games/animal-kingdom', type: 'path' },
      { id: 'hb', label: 'Human Body Lab', icon: Sparkles, route: '/games/human-body', type: 'lab' },
      { id: 'ms', label: 'Materials Sorting Yard', icon: Grid, route: '/games/materials-sort', type: 'path' },
      { id: 'fl', label: 'Forces Lab', icon: Zap, route: '/games/forces-lab', type: 'lab' },
      { id: 'ne', label: 'Nature Explorer Island', icon: Globe, route: '/games/nature-explorer', type: 'path' },
      { id: 'sl', label: 'Science Rocket Base', icon: Rocket, route: '/games/science-lab', type: 'castle' },
    ]
  }
};

const FUTURE_WORLDS = [
  { id: 'geography', name: 'Geography World', icon: Globe, emoji: '🌍', color: 'bg-orange-400' },
  { id: 'crossword', name: 'Puzzle World', icon: Grid, emoji: '🧩', color: 'bg-indigo-400' },
  { id: 'creative', name: 'Creative World', icon: Sparkles, emoji: '🎨', color: 'bg-pink-400' },
  { id: 'music', name: 'Music World', icon: Music, emoji: '🎵', color: 'bg-yellow-400' },
];

// ── Components ───────────────────────────────────────────────────────────────

const TopBar = ({ title, onBack, stars = 1250 }: { title: string; onBack?: () => void, stars?: number }) => (
  <div className="flex justify-between items-center mb-6 md:mb-10">
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg active:scale-90"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </button>
      )}
      <div className="bg-white/90 backdrop-blur-md px-4 md:px-8 py-2 md:py-3 rounded-2xl md:rounded-full border-4 border-white shadow-xl">
        <h1 className="text-sm md:text-2xl font-black text-sky-800 tracking-tight uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h1>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-2xl md:rounded-full border-4 border-white shadow-xl">
      <Star className="text-yellow-500 fill-yellow-400" size={24} />
      <span className="text-base md:text-xl font-black text-sky-800">{stars.toLocaleString()}</span>
    </div>
  </div>
);

const BottomNav = ({ activeWorld, onHome }: { activeWorld: WorldId, onHome: () => void }) => (
  <div className="fixed bottom-0 left-0 w-full p-4 z-50 flex justify-center pointer-events-none">
    <div className="bg-white/90 backdrop-blur-xl border-4 border-white rounded-[32px] md:rounded-[40px] px-6 py-3 md:px-12 md:py-4 flex gap-6 md:gap-16 shadow-2xl pointer-events-auto">
      <NavButton icon={Home} label="HOME" active={activeWorld === 'map'} onClick={onHome} />
      <NavButton icon={BarChart2} label="PROGRESS" />
      <NavButton icon={Star} label="BADGES" />
      <NavButton icon={Settings} label="SETTINGS" />
    </div>
  </div>
);

const NavButton = ({ icon: Icon, label, active = false, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 md:gap-1 group`}>
    <div className={`p-1.5 md:p-2 rounded-xl md:rounded-2xl transition-all ${active ? 'bg-sky-500 text-white shadow-lg' : 'text-sky-400 hover:bg-sky-50'}`}>
      <Icon size={20} md:size={24} strokeWidth={active ? 3 : 2} />
    </div>
    <span className={`text-[8px] md:text-[10px] font-black tracking-widest ${active ? 'text-sky-600' : 'text-sky-300'}`}>{label}</span>
  </button>
);

// ── Main Page Component ──────────────────────────────────────────────────────

export default function CartoonModePage() {
  const navigate = useNavigate();
  const [currentWorld, setCurrentWorld] = useState<WorldId>('map');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnterWorld = (id: WorldId) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentWorld(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsTransitioning(false);
    }, 400);
  };

  const handleBackToMap = () => {
    handleEnterWorld('map');
  };

  return (
    <div className="min-h-screen bg-sky-400 overflow-x-hidden relative font-sans selection:bg-yellow-300">
      <Helmet>
        <title>Sodafom: {currentWorld === 'map' ? 'Adventure Map' : WORLDS[currentWorld]?.shortName}</title>
      </Helmet>

      {/* ── Background Layer ── */}
      <div className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-b ${
        currentWorld === 'map' ? 'from-sky-400 via-sky-300 to-emerald-200' : WORLDS[currentWorld]?.themeGradient
      }`} />

      {/* ── Animated Background Assets ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {/* Clouds */}
         <motion.div animate={{ x: [-20, 20, -20] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[8%] left-[10%] text-white opacity-40"><Cloud size={100} fill="currentColor" /></motion.div>
         <motion.div animate={{ x: [30, -30, 30] }} transition={{ duration: 20, repeat: Infinity, delay: 2 }} className="absolute top-[12%] right-[15%] text-white opacity-30"><Cloud size={160} fill="currentColor" /></motion.div>

         {/* Rotating Sun/Stars */}
         {currentWorld === 'map' ? (
           <div className="absolute -top-10 -right-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
                 <Sun size={200} className="text-yellow-300 fill-yellow-100 opacity-60" />
              </motion.div>
           </div>
         ) : (
           <div className="absolute top-10 right-10">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                 <Star size={100} className="text-white/20 fill-white/10" />
              </motion.div>
           </div>
         )}
      </div>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 pb-40 relative z-10">

        <AnimatePresence mode="wait">
          {currentWorld === 'map' ? (
            /* ── ADVENTURE MAP VIEW ── */
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <TopBar title="Adventure Map" />

              {/* Archie Greeting */}
              <div className="flex flex-col items-center gap-6 md:gap-10 mb-12 md:mb-20">
                 <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                 >
                    <ArchieCharacter size={240} />
                 </motion.div>

                 <motion.div
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="bg-white border-8 border-sky-400 p-6 md:p-8 rounded-[40px] rounded-bl-none shadow-2xl max-w-lg relative text-center"
                 >
                   <div className="absolute -left-10 bottom-0 w-10 h-10 bg-white border-l-8 border-b-8 border-sky-400 transform -skew-x-[45deg]" />
                   <p className="text-lg md:text-2xl font-black text-sky-800 leading-tight">
                     "Hi! I'm Archie! Pick an island to start your learning adventure!"
                   </p>
                 </motion.div>
              </div>

              {/* Worlds Grid (The Illustrated Map) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
                {Object.values(WORLDS).map((world, i) => (
                  <motion.button
                    key={world.id}
                    whileHover={{ scale: 1.08, y: -15, rotate: [-1, 1, 0] }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEnterWorld(world.id)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative"
                  >
                    <div className={`bg-gradient-to-br ${world.themeGradient} p-1.5 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-b-[10px] border-black/20`}>
                      <div className="bg-white rounded-[34px] p-6 md:p-8 flex flex-col items-center gap-4">
                        <div className={`${world.accent} w-16 h-16 md:w-20 md:h-20 rounded-[30%] flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                          <world.icon size={40} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                           <span className="block font-black text-slate-800 text-xs md:text-sm uppercase tracking-widest opacity-60 mb-1">{world.emoji} LEVEL 1</span>
                           <span className="block font-black text-slate-800 text-sm md:text-lg leading-tight uppercase tracking-tight">{world.shortName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}

                {/* Expandable/Future World Cards */}
                {FUTURE_WORLDS.map((world, i) => (
                  <div key={world.id} className="opacity-50 grayscale cursor-not-allowed">
                    <div className="bg-slate-700/20 backdrop-blur-md p-1.5 rounded-[40px] border-b-[10px] border-black/10">
                      <div className="bg-white/40 rounded-[34px] p-6 md:p-8 flex flex-col items-center gap-4 border-4 border-dashed border-white/60">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-400 rounded-[30%] flex items-center justify-center text-white shadow-md">
                          <world.icon size={36} />
                        </div>
                        <div className="text-center">
                           <span className="block font-black text-slate-900 text-[10px] md:text-xs uppercase tracking-widest opacity-40 mb-1">{world.emoji} COMING SOON</span>
                           <span className="block font-black text-slate-900 text-sm md:text-lg leading-tight uppercase tracking-tight">{world.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Map UI */}
              <div className="mt-16 flex flex-wrap justify-center gap-4">
                 {[
                   { icon: Heart, label: 'PARENT AREA', color: 'bg-blue-600' },
                   { icon: Star, label: 'MY REWARDS', color: 'bg-amber-500' },
                   { icon: CartoonRobot, label: 'ASK ARCHIE', color: 'bg-sky-500', isRobot: true },
                 ].map((item, i) => (
                   <button key={item.label} className={`${item.color} px-8 py-4 rounded-3xl flex items-center gap-3 text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-transform border-b-6 border-black/20 uppercase tracking-tight`}>
                     {item.isRobot ? <item.icon size={32} /> : <item.icon size={22} strokeWidth={3} />}
                     {item.label}
                   </button>
                 ))}
              </div>
            </motion.div>
          ) : (
            /* ── IMMERSIVE WORLD DETAIL VIEW ── */
            <motion.div
              key="world"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex flex-col"
            >
              <TopBar title={WORLDS[currentWorld].name} onBack={handleBackToMap} />

              {/* World Arche & Message */}
              <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-12 mb-12 md:mb-16">
                 <div className="relative">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                      <ArchieCharacter size={240} />
                    </motion.div>
                    <div className="absolute -right-6 top-1/2">
                      <CartoonRobot size={110} />
                    </div>
                 </div>

                 <motion.div
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-white border-8 border-sky-400 p-6 md:p-10 rounded-[50px] rounded-bl-none shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative"
                 >
                   <div className="absolute -left-12 bottom-0 w-12 h-12 bg-white border-l-8 border-b-8 border-sky-400 transform -skew-x-[45deg]" />
                   <p className="text-xl md:text-3xl font-black text-sky-900 leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                     {WORLDS[currentWorld].archiesMessage}
                   </p>
                   <div className="flex gap-3">
                      <div className={`${WORLDS[currentWorld].lightAccent} px-5 py-2.5 rounded-2xl border-2 border-sky-100 flex items-center gap-3`}>
                         <Star className="text-yellow-500 fill-yellow-400 animate-pulse" size={20} />
                         <span className="text-sm md:text-base font-black text-sky-700 uppercase tracking-widest">50 Stars to be won!</span>
                      </div>
                   </div>
                 </motion.div>
              </div>

              {/* Game Locations inside the World (Illustrated Path style) */}
              <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                 {WORLDS[currentWorld].locations.map((loc, i) => (
                   <motion.button
                     key={loc.id}
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.12 }}
                     whileHover={{ scale: 1.02, x: 10 }}
                     onClick={() => navigate(loc.route)}
                     className="w-full bg-white/95 backdrop-blur-md p-5 md:p-6 rounded-[40px] border-4 border-white shadow-2xl flex items-center justify-between group hover:bg-white transition-all relative overflow-hidden"
                   >
                     {/* illustrated background hint */}
                     <div className={`absolute top-0 right-0 w-24 h-24 ${WORLDS[currentWorld].accent} opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`} />

                     <div className="flex items-center gap-6 relative z-10">
                        <div className={`${WORLDS[currentWorld].accent} w-14 h-14 md:w-16 md:h-16 rounded-[35%] flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                           {loc.type === 'castle' ? <Home size={32} strokeWidth={3} /> :
                            loc.type === 'lab' ? <FlaskConical size={32} strokeWidth={3} /> :
                            <loc.icon size={32} strokeWidth={3} />}
                        </div>
                        <div className="text-left">
                           <span className="block font-black text-sky-900 text-lg md:text-xl leading-tight group-hover:text-sky-600 transition-colors">{loc.label}</span>
                           <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Adventure Awaits</span>
                        </div>
                     </div>
                     <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-inner">
                        <ChevronRight size={24} strokeWidth={3} />
                     </div>
                   </motion.button>
                 ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <BottomNav activeWorld={currentWorld} onHome={handleBackToMap} />

      {/* ── Decorative Illustrated Ground ── */}
      <div className="fixed bottom-0 left-0 w-full h-[18vh] pointer-events-none z-0">
         {/* Green rolling hills */}
         <div className="absolute bottom-0 left-[-5%] w-[110%] h-36 bg-emerald-500 rounded-[100%] border-t-[10px] border-emerald-400/60 shadow-[0_-20px_100px_rgba(0,0,0,0.1)]" />
         <div className="absolute bottom-[-15px] right-[5%] w-[45%] h-28 bg-green-400 rounded-[100%] opacity-80" />

         {/* Ground details */}
         <div className="absolute bottom-10 left-[20%] opacity-20"><Trees className="text-emerald-900" size={60} /></div>
         <div className="absolute bottom-8 right-[30%] opacity-20"><Tent className="text-emerald-900" size={40} /></div>
      </div>

      {/* Floating Magic Dust */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: [0, 1.2, 0],
              opacity: [0, 0.5, 0],
              y: ["-10%", "+10%"]
            }}
            transition={{
              duration: 4 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            className="text-white"
          >
            <Sparkles size={10 + Math.random() * 15} fill="white" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
