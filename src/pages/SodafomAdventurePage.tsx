import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, BookOpen, Home, Settings, Sparkles, Star, Trophy, Bot,
  Users, Volume2, BarChart3, Music, ChevronRight, Film, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';
import { CartoonRobot } from '@/components/CartoonRobot';
import { ttsSpeak, stopTts } from '@/lib/voice-context';
import { getSeasonalTheme } from './SeasonalThemesPage';

import { useProgression } from '@/contexts/ProgressionContext';

type Screen = 'home' | 'worlds' | 'world' | 'stickers' | 'friends';
type WorldId = 'maths' | 'reading' | 'spelling' | 'science' | 'geography' | 'crossword';

interface WorldV2 {
  id: WorldId;
  name: string;
  shortName: string;
  theme: string;
  emoji: string;
  gradient: string;
  accent: string;
  image?: string;
  archiesMessage: string;
  locations: { id: string; label: string; route: string }[];
}

const WORLDS_V2: Record<WorldId, WorldV2> = {
  maths: {
    id: 'maths',
    name: 'MATHS WORLD',
    shortName: 'Maths',
    theme: 'blue',
    emoji: '🔢',
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    accent: 'bg-blue-500',
    image: '/assets/cartoon/worlds/maths.png',
    archiesMessage: "Welcome to Maths World! Let's solve some number puzzles together!",
    locations: [
      { id: 'tt', label: 'Times Tables', route: '/games/times-table-race' },
      { id: 'ns', label: 'Number Skills', route: '/games/number-pop' },
      { id: 'as', label: 'Addition & Subtraction', route: '/games/mental-maths-sprint' },
      { id: 'md', label: 'Multiplication & Division', route: '/games/division-dash' },
      { id: 'fd', label: 'Fractions & Decimals', route: '/games/fraction-pizza' },
      { id: 'mp', label: 'Maths Puzzles', route: '/games/maths-mystery' },
      { id: 'oe', label: 'Odd or Even', route: '/games/odd-even' },
      { id: 'rr', label: 'Rounding Rocket', route: '/games/rounding-rocket' },
      { id: 'aa', label: 'Area Adventure', route: '/games/area-adventure' },
      { id: 'pq', label: 'Perimeter Quest', route: '/games/perimeter-quest' },
      { id: 'wp', label: 'Word Problems', route: '/games/maths-word-problems' },
      { id: 'mc', label: 'Maths Challenge', route: '/games/maths-challenge' },
    ]
  },
  reading: {
    id: 'reading',
    name: 'READING WORLD',
    shortName: 'Reading',
    theme: 'purple',
    emoji: '📖',
    gradient: 'from-purple-400 via-purple-500 to-fuchsia-600',
    accent: 'bg-purple-500',
    image: '/assets/cartoon/worlds/reading.png',
    archiesMessage: "Shhh! We've entered the Magical Library. Which story shall we explore?",
    locations: [
      { id: 'ms', label: 'Magical Stories', route: '/games/story-builder' },
      { id: 'co', label: 'Comprehension', route: '/games/comprehension-quest' },
      { id: 'pf', label: 'Phonics Fun', route: '/games/phonics-parrot' },
      { id: 'rp', label: 'Reading Practice', route: '/games/reading-quest' },
      { id: 'pc', label: 'Poetry Corner', route: '/games/poetry-corner' },
      { id: 'sq', label: 'Story Quizzes', route: '/games/story-map' },
      { id: 'br', label: 'Book Review', route: '/games/book-review' },
      { id: 'rd', label: 'Reading Detective', route: '/games/reading-detective' },
      { id: 'ss', label: 'Story Sequence', route: '/games/story-sequence' },
      { id: 'rf', label: 'Reading Fluency', route: '/games/reading-fluency' },
      { id: 'wm', label: 'Word Meaning', route: '/games/word-meaning' },
      { id: 'rc', label: 'Reading Challenge', route: '/games/reading-challenge' },
    ]
  },
  spelling: {
    id: 'spelling',
    name: 'SPELLING WORLD',
    shortName: 'Spelling',
    theme: 'red',
    emoji: '🔤',
    gradient: 'from-red-400 via-rose-500 to-orange-600',
    accent: 'bg-red-500',
    image: '/assets/cartoon/worlds/spelling.png',
    archiesMessage: "Welcome to the Word Kingdom! Can you help me spell the magic words?",
    locations: [
      { id: 'sl', label: 'Spelling Lists', route: '/games/spelling-bee' },
      { id: 'ps', label: 'Phonics & Sounds', route: '/games/letter-sounds' },
      { id: 'wb', label: 'Word Building', route: '/games/word-builder' },
      { id: 'cw', label: 'Common Words', route: '/games/tricky-word-hunt' },
      { id: 'sg', label: 'Spelling Games', route: '/games/word-search' },
      { id: 'cq', label: 'Challenge Quiz', route: '/games/spelling-challenge' },
    ]
  },
  science: {
    id: 'science',
    name: 'SCIENCE WORLD',
    shortName: 'Science',
    theme: 'green',
    emoji: '🔬',
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    accent: 'bg-green-500',
    image: '/assets/cartoon/worlds/science.png',
    archiesMessage: "Blast off! It's time for some scientific discoveries!",
    locations: [
      { id: 'lt', label: 'Living Things', route: '/games/animal-kingdom' },
      { id: 'hb', label: 'Human Body', route: '/games/human-body' },
      { id: 'ma', label: 'Materials', route: '/games/materials-sort' },
      { id: 'fe', label: 'Forces & Energy', route: '/games/forces-lab' },
      { id: 'te', label: 'The Earth', route: '/games/nature-explorer' },
      { id: 'se', label: 'Science Experiments', route: '/games/science-lab' },
    ]
  },
  geography: {
    id: 'geography',
    name: 'GEOGRAPHY WORLD',
    shortName: 'Geography',
    theme: 'orange',
    emoji: '🌍',
    gradient: 'from-orange-400 via-amber-500 to-yellow-600',
    accent: 'bg-orange-500',
    image: '/assets/cartoon/worlds/geography.png',
    archiesMessage: "Let's explore our amazing planet together!",
    locations: [
      { id: 'op', label: 'Our Planet', route: '/games/earth-space' },
      { id: 'cn', label: 'Countries', route: '/games/geography-quiz' },
      { id: 'lm', label: 'Landmarks', route: '/games/geography-uk' },
      { id: 'md', label: 'Maps & Directions', route: '/games/coordinates-grid' },
      { id: 'or', label: 'Oceans & Rivers', route: '/games/animal-habitats' },
      { id: 'wc', label: 'Weather & Climate', route: '/games/weather-watch' },
    ]
  },
  crossword: {
    id: 'crossword',
    name: 'CROSSWORD WORLD',
    shortName: 'Crossword',
    theme: 'purple-dark',
    emoji: '🧩',
    gradient: 'from-indigo-600 via-violet-700 to-slate-900',
    accent: 'bg-indigo-600',
    image: '/assets/cartoon/worlds/crossword.png',
    archiesMessage: "I love solving puzzles! Can you help me finish these crosswords?",
    locations: [
      { id: 'ec', label: 'Easy Crosswords', route: '/games/crossword' },
      { id: 'ws', label: 'Word Search', route: '/games/word-search' },
      { id: 'pc', label: 'Picture Clues', route: '/games/anagram-attack' },
      { id: 'fp', label: 'Fun Puzzles', route: '/games/sudoku' },
      { id: 'ct', label: 'Challenge Time', route: '/games/maths-mystery' },
      { id: 'bb', label: 'Daily Brain Boost', route: '/daily-challenge' },
    ]
  }
};

const FRIENDS = [
  { name: 'Archie', emoji: '🗝️', role: 'Your learning buddy', helps: 'I can help with questions, reading aloud and encouragement.', archie: true },
  { name: 'Soda Bot', emoji: '🤖', image: '/assets/cartoon/friends/soda-bot.png', role: 'App helper', helps: 'Soda Bot helps you find games and explore the app.' },
  { name: 'Captain Spark', emoji: '🦸', image: '/assets/cartoon/friends/captain-spark.png', role: 'Challenge captain', helps: 'Captain Spark loves brave challenges and achievements.' },
  { name: 'Professor Thinkwell', emoji: '🧑‍🔬', image: '/assets/cartoon/friends/professor-thinkwell.png', role: 'Discovery expert', helps: 'Professor Thinkwell loves science, facts and clever thinking.' },
  { name: 'Mia', emoji: '🎨', image: '/assets/cartoon/friends/mia.png', role: 'Creative friend', helps: 'Mia helps with ideas, stories and creative learning.' },
  { name: 'Toby', emoji: '🔬', image: '/assets/cartoon/friends/toby.png', role: 'Science friend', helps: 'Toby loves experiments, inventions and discoveries.' },
  { name: 'Bella', emoji: '📚', image: '/assets/cartoon/friends/bella.png', role: 'Word friend', helps: 'Bella loves spelling, vocabulary, letters and words.' },
  { name: 'Rocky', emoji: '🐶', image: '/assets/cartoon/friends/rocky.png', role: 'Cheerful helper', helps: 'Rocky celebrates effort and helps learning feel fun.' },
  { name: 'Penny', emoji: '🐧', image: '/assets/cartoon/friends/penny.png', role: 'Reading pal', helps: 'Penny is gentle, patient and loves reading activities.' },
  { name: 'Ziggy', emoji: '🦖', image: '/assets/cartoon/friends/ziggy.png', role: 'Dinosaur friend', helps: 'Ziggy brings fun challenges and big dinosaur energy.' },
  { name: 'Daisy', emoji: '🌼', image: '/assets/cartoon/friends/daisy.png', role: 'Kindness friend', helps: 'Daisy reminds you to be proud of every bit of progress.' },
  { name: 'Sunny', emoji: '🌟', image: '/assets/cartoon/friends/sunny.png', role: 'Reward star', helps: 'Sunny celebrates stars, stickers and brilliant effort.' },
];

const STICKERS = [
  { id: 'archie-first', name: 'Archie Starter', emoji: '🗝️', category: 'Archie' },
  { id: 'maths-star', name: 'Maths Star', emoji: '⭐', category: 'Maths' },
  { id: 'reading-hero', name: 'Reading Hero', emoji: '📚', category: 'Reading' },
  { id: 'spelling-bee', name: 'Spelling Bee', emoji: '🐝', category: 'Spelling' },
  { id: 'science-explorer', name: 'Science Explorer', emoji: '🔬', category: 'Science' },
  { id: 'soda-bot', name: 'Soda Bot', emoji: '🤖', category: 'Friends' },
  { id: 'captain-spark', name: 'Captain Spark', emoji: '🦸', category: 'Friends' },
  { id: 'thinkwell', name: 'Professor Thinkwell', emoji: '🧑‍🔬', category: 'Friends' },
  { id: 'rainbow', name: 'Rainbow Learner', emoji: '🌈', category: 'Special' },
  { id: 'trophy', name: 'Learning Champion', emoji: '🏆', category: 'Special' },
  { id: 'treasure', name: 'Treasure Finder', emoji: '🎁', category: 'Special' },
  { id: 'gold-archie', name: 'Golden Archie', emoji: '👑', category: 'Archie' },
];

const STICKER_KEY = 'sodafom_sticker_book_v2';

function getEarnedStickers(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STICKER_KEY) || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch { /* ignore */ }
  return ['archie-first', 'maths-star', 'reading-hero'];
}

function BackgroundSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-12 -left-16 h-52 w-52 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute top-[12%] right-[3%] h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute bottom-[10%] left-[10%] h-44 w-44 rounded-full bg-yellow-200/20 blur-3xl" />
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white/60"
          style={{ left: `${(i * 17) % 93}%`, top: `${(i * 29) % 83}%` }}
          animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.25, 0.8] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.13 }}
        >✦</motion.span>
      ))}
    </div>
  );
}

function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-white/70 bg-white/90 px-4 py-2 font-black text-sky-800 shadow-lg active:scale-95">
      <ArrowLeft size={19} /> {label}
    </button>
  );
}

export default function SodafomAdventurePage() {
  const navigate = useNavigate();
  const { level, completedGamesCount } = useProgression();
  const [screen, setScreen] = useState<Screen>('home');
  const [worldId, setWorldId] = useState<WorldId>('maths');
  const [stickerFilter, setStickerFilter] = useState('All');
  const [earned, setEarned] = useState<string[]>(getEarnedStickers);
  const [selectedFriend, setSelectedFriend] = useState<(typeof FRIENDS)[number] | null>(null);
  const [seasonalTheme] = useState(getSeasonalTheme);

  const activeWorld = WORLDS_V2[worldId];
  const filteredStickers = useMemo(() => stickerFilter === 'All' ? STICKERS : STICKERS.filter(s => s.category === stickerFilter), [stickerFilter]);

  // Award another sticker for every two completed games. This keeps the
  // cartoon book useful offline as well as when a parent account is signed in.
  useEffect(() => {
    const unlockedCount = Math.min(STICKERS.length, 3 + Math.floor(completedGamesCount / 2));
    const next = STICKERS.slice(0, unlockedCount).map(sticker => sticker.id);
    setEarned(next);
    try { localStorage.setItem(STICKER_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, [completedGamesCount]);

  const welcomeText = "Hi! I'm Archie! Let's explore, learn and have fun together!";

  useEffect(() => {
    if (screen === 'home') {
      ttsSpeak(welcomeText);
    } else if (screen === 'world') {
      // The spoken title and guidance always come from the same selected World
      // object that supplies the visible title and its activity routes.
      ttsSpeak(`${activeWorld.name}. ${activeWorld.archiesMessage}`);
    }
    return () => stopTts();
  }, [screen, activeWorld]);

  const enterWorld = (id: WorldId) => {
    setWorldId(id);
    setScreen('world');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const introduce = (friend: (typeof FRIENDS)[number]) => {
    setSelectedFriend(friend);
    stopTts();
    ttsSpeak(`Hi! This is ${friend.name}. ${friend.role}. ${friend.helps}`);
  };

  const meetAll = (index = 0) => {
    const f = FRIENDS[index];
    if (!f) return;
    ttsSpeak(`This is ${f.name}. ${f.role}. ${f.helps}`, () => meetAll(index + 1));
  };

  // ── HOME SCREEN RENDER (Image 1) ──────────────────────────────────────────
  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center pt-6 pb-32 px-4 overflow-hidden"
    >
      {/* Background Layer: Rainbow & Fantasy Landscape */}
      <div className="absolute inset-0 z-0">
         <img
           src="/assets/cartoon/home-landscape-v2.png"
           alt=""
           className="h-full w-full object-cover object-center"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-blue-700/10 via-transparent to-emerald-950/15" />
         {seasonalTheme === 'christmas' && (
           <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
             <span className="absolute left-[8%] top-[18%] text-5xl drop-shadow-lg">❄️</span>
             <span className="absolute right-[8%] top-[22%] text-5xl drop-shadow-lg">🎄</span>
             <span className="absolute bottom-[22%] left-[12%] text-5xl drop-shadow-lg">🎁</span>
           </div>
         )}
         {seasonalTheme === 'easter' && (
           <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
             <span className="absolute left-[8%] top-[18%] text-5xl drop-shadow-lg">🌷</span>
             <span className="absolute right-[8%] top-[22%] text-5xl drop-shadow-lg">🐣</span>
             <span className="absolute bottom-[22%] left-[12%] text-5xl drop-shadow-lg">🥚</span>
           </div>
         )}
      </div>

      {/* Top Corners: Settings, Music, Sound */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
         <button onClick={() => navigate('/hub/profile')} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg active:scale-90 text-white">
            <Settings size={28} />
         </button>
         <div className="bg-yellow-400 border-2 border-white px-3 py-1 rounded-full shadow-lg">
            <span className="text-blue-900 font-black text-sm">LEVEL {level}</span>
         </div>
      </div>
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-4">
         <button
           type="button"
           disabled
           aria-label="Background music coming soon"
           title="Background music coming soon"
           className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg text-white opacity-60 cursor-not-allowed"
         >
            <Music size={28} />
         </button>
         <button
           type="button"
           onClick={() => ttsSpeak(welcomeText)}
           aria-label="Hear Archie's welcome message"
           className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg active:scale-90 text-white"
         >
            <Volume2 size={28} />
         </button>
      </div>

      {/* Logo & "LEARN PLAY GROW" Banner */}
      <div className="relative z-10 flex flex-col items-center mb-4 drop-shadow-2xl text-center">
         <h1 className="text-[clamp(2.8rem,14vw,7rem)] font-black text-white tracking-tighter italic leading-none" style={{ WebkitTextStroke: 'clamp(2px,0.7vw,4px) #1e40af' }}>
           SODAFOM
         </h1>
         <div className="relative -mt-3 bg-yellow-400 border-4 border-white px-8 py-2 rounded-2xl shadow-xl transform rotate-[-2deg]">
            <span className="text-blue-800 font-black text-xl md:text-3xl tracking-widest uppercase">
               LEARN • PLAY • GROW
            </span>
         </div>
         {seasonalTheme !== 'everyday' && (
           <button type="button" onClick={() => navigate('/seasonal-themes')} className="mt-2 rounded-full border-2 border-white/70 bg-white/90 px-4 py-1 text-xs font-black uppercase text-blue-900 shadow-lg">
             {seasonalTheme === 'christmas' ? '🎄 Christmas theme' : '🐣 Easter theme'}
           </button>
         )}
      </div>

      {/* Center Group: keep Archie fully visible. His greeting is spoken aloud;
          the old oversized speech bubble obscured his face on folding phones. */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full max-w-2xl mt-2">
         {/* Full Body Archie Character */}
         <motion.div
           animate={{ y: [0, -12, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="relative z-10"
         >
            <ArchieCharacter size={300} />
            {/* Sodafom AI Robot */}
            <motion.button
               type="button"
               whileTap={{ scale: 0.92 }}
               onClick={() => navigate('/ai-teacher')}
               aria-label="Open Sodafom AI teacher"
               className="absolute bottom-[10px] right-[-4px] md:bottom-[20px] md:right-[-100px] w-[118px] h-[118px] md:w-[160px] md:h-[160px] rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            >
               <CartoonRobot size={160} className="max-w-full max-h-full" />
               <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg border-2 border-white">
                  AI TEACHER
               </div>
            </motion.button>
         </motion.div>
      </div>

      {/* Large Green Action Button */}
      <div className="relative z-20 mt-3 w-full max-w-md">
         <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => setScreen('worlds')}
           className="w-full bg-gradient-to-b from-lime-400 to-green-600 border-b-[10px] border-green-800 text-white font-black text-3xl md:text-4xl py-6 rounded-3xl shadow-2xl flex items-center justify-center gap-3 tracking-tighter"
         >
           EXPLORE MY WORLD! <Sparkles size={34} />
         </motion.button>
         <motion.button
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.96 }}
           onClick={() => navigate('/archie-menu')}
           className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-4 border-white/80 bg-blue-700/90 px-5 text-lg font-black text-white shadow-2xl backdrop-blur-sm"
         >
           <Menu size={24} /> OPEN ARCHIE&apos;S MENU
         </motion.button>
      </div>

      {/* Every planned main area is visible from the approved colourful home. */}
      <nav aria-label="Sodafom main areas" className="relative z-20 mt-5 mb-24 grid w-full max-w-3xl grid-cols-3 gap-2 rounded-3xl border-4 border-white/60 bg-blue-950/55 p-3 shadow-2xl backdrop-blur-sm sm:grid-cols-5">
        {[
          { label: "Archie's Lessons", emoji: '🎓', route: '/lessons' },
          { label: 'Games', emoji: '🎮', action: 'worlds' },
          { label: 'Reading', emoji: '📚', route: '/reading' },
          { label: 'Homework Helper', emoji: '📷', route: '/homework-helper' },
          { label: 'Ask Archie', emoji: '🗝️', route: '/ask-archie' },
          { label: 'Birthday / Party', emoji: '🎂', route: '/birthday' },
          { label: 'Pocket Money Chores', emoji: '🪙', route: '/pocket-money' },
          { label: 'Design Archie Outfit', emoji: '🦸', route: '/archie-outfit' },
          { label: 'Parent Area', emoji: '👪', route: '/parent-area' },
        ].map((item) => (
          <button key={item.label} onClick={() => item.action === 'worlds' ? setScreen('worlds') : navigate(item.route!)} className="flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 border-white/70 bg-white/95 p-2 text-center text-blue-950 shadow-lg active:scale-95">
            <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
            <span className="mt-1 text-[10px] font-black leading-tight sm:text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Colorful Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-30">
         <div className="max-w-3xl mx-auto grid grid-cols-6 gap-1.5 sm:gap-2">
            {[
              { label: 'PARENT AREA', icon: Users, color: 'bg-blue-500', route: '/parent-area' },
              { label: 'STARS & REWARDS', icon: Star, color: 'bg-purple-500', route: '/rewards' },
              { label: 'ASK ARCHIE', icon: Bot, color: 'bg-orange-500', route: '/ask-archie', archie: true },
              { label: 'STICKER BOOK', icon: BookOpen, color: 'bg-emerald-500', screen: 'stickers' as const },
              { label: 'CARTOONS', icon: Film, color: 'bg-pink-500', route: '/cartoons' },
              { label: 'PROGRESS', icon: BarChart3, color: 'bg-sky-600', route: '/hub/progress' },
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileTap={{ scale: 0.9 }}
                onClick={() => 'screen' in btn && btn.screen ? setScreen(btn.screen) : 'route' in btn && btn.route ? navigate(btn.route) : undefined}
                className={`${btn.color} rounded-2xl border-2 sm:border-4 border-white/40 p-1.5 sm:p-2 flex flex-col items-center gap-1 shadow-lg h-24 sm:h-28 justify-center`}
              >
                <div className="bg-white/20 p-1 rounded-full mb-1 h-10 w-10 flex items-center justify-center overflow-hidden">
                   {'archie' in btn && btn.archie
                     ? <img src="/assets/images/sodafom-launcher-icon-v2.png" alt="Archie" className="h-full w-full rounded-full object-cover" />
                     : <btn.icon size={24} className="text-white sm:h-7 sm:w-7" />}
                </div>
                <span className="text-white font-black text-[9px] md:text-[11px] leading-tight text-center uppercase tracking-tighter">
                   {btn.label}
                </span>
              </motion.button>
            ))}
         </div>
      </div>
    </motion.div>
  );

  // ── WORLDS SELECTION RENDER (Image 2) ──────────────────────────────────
  const renderWorlds = () => (
    <motion.div
      key="worlds"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative min-h-screen bg-sky-400 pt-20 pb-12 px-6"
    >
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-30">
         <button onClick={() => setScreen('home')} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg active:scale-90 text-white">
            <ArrowLeft size={28} />
         </button>
         <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border-4 border-white shadow-xl flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-400" size={20} />
            <span className="text-xl font-black text-sky-800 tracking-tight">1,250</span>
         </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center">
         <div className="mb-10 bg-amber-800/80 border-4 border-white px-10 py-3 rounded-2xl shadow-2xl transform rotate-[-1deg]">
            <h2 className="text-white font-black text-3xl tracking-wider uppercase italic">CHOOSE YOUR WORLD</h2>
         </div>

         <div className="grid grid-cols-2 gap-8 w-full">
            {Object.values(WORLDS_V2).map((world) => (
              <motion.button
                key={world.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => enterWorld(world.id)}
                className="relative flex flex-col items-center group"
              >
                <div className="w-full aspect-square bg-white/10 rounded-full blur-3xl absolute bottom-0 z-0" />
                <div className="relative z-10 w-full flex flex-col items-center">
                   <div className="w-full aspect-square max-w-56 mb-3 overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/20 shadow-2xl flex items-center justify-center">
                      {world.image ? <img src={world.image} alt="" className="h-full w-full object-cover" /> : <span className="text-7xl md:text-9xl">{world.emoji}</span>}
                   </div>
                   <div className={`${world.accent} border-4 border-white px-6 py-2 rounded-2xl shadow-xl transform rotate-[1deg] group-hover:rotate-0 transition-transform flex flex-col items-center`}>
                      <span className="text-white font-black text-[10px] opacity-80 uppercase tracking-widest">LEVEL {level}</span>
                      <span className="text-white font-black text-sm md:text-lg tracking-tight uppercase leading-none mt-0.5">
                         {world.name}
                      </span>
                   </div>
                </div>
              </motion.button>
            ))}
         </div>
      </div>
    </motion.div>
  );

  // ── WORLD DETAIL RENDER (Images 3-8) ───────────────────────────────────
  const renderWorldDetail = () => {
    if (!activeWorld) return null;

    // Themed styles based on world ID
    const themeStyles: Record<string, { btn: string; bg: string }> = {
      maths:     { btn: 'from-blue-500 to-blue-700',   bg: 'bg-blue-900/60' },
      reading:   { btn: 'from-purple-500 to-indigo-700', bg: 'bg-indigo-900/60' },
      spelling:  { btn: 'from-red-500 to-rose-700',     bg: 'bg-rose-900/60' },
      science:   { btn: 'from-green-500 to-emerald-700', bg: 'bg-emerald-900/60' },
      geography: { btn: 'from-orange-500 to-amber-700',  bg: 'bg-amber-900/60' },
      crossword: { btn: 'from-violet-600 to-slate-800',  bg: 'bg-slate-900/60' },
    };

    const style = themeStyles[activeWorld.id] || themeStyles.maths;

    return (
      <motion.div
        key={`world-${activeWorld.id}`}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative min-h-screen bg-gradient-to-b ${activeWorld.gradient} pt-24 pb-32 px-6`}
      >
        {/* Navigation Top Bar */}
        <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-30">
           <button onClick={() => setScreen('worlds')} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-lg active:scale-90 text-white">
              <ArrowLeft size={28} />
           </button>
           <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border-4 border-white shadow-xl flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-400" size={20} />
              <span className="text-xl font-black text-sky-800 tracking-tight">1,250</span>
           </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col h-full">
           {/* Banner Header with Ribbons */}
           <div className="relative self-center mb-16 flex flex-col items-center">
              <div className={`${style.bg} blur-3xl absolute inset-[-20px] -z-10 rounded-full`} />
              <div className="relative bg-white/10 backdrop-blur-sm border-4 border-white/40 px-12 py-4 rounded-3xl shadow-2xl transform rotate-[-1deg]">
                 <h2 className="text-white font-black text-5xl md:text-7xl italic tracking-tighter drop-shadow-2xl uppercase">
                    {activeWorld.name}
                 </h2>
              </div>
           </div>

           <div className="flex flex-col lg:flex-row gap-12 items-center flex-1">
              {/* Left Side: the selected World artwork shown on the picker is
                  also used here, so opening a World always matches its picture. */}
              <div className="flex-1 relative flex justify-center lg:justify-start">
                 <div className="relative w-full max-w-md">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="aspect-square overflow-hidden rounded-[2.75rem] border-[8px] border-white/90 bg-white/20 shadow-2xl"
                    >
                      <img src={activeWorld.image} alt={`${activeWorld.name} cartoon landscape`} className="h-full w-full object-cover" />
                    </motion.div>
                    <div className="absolute -bottom-8 -left-5 rounded-full border-4 border-white bg-blue-600/90 p-1 shadow-2xl">
                      <ArchieCharacter size={112} />
                    </div>
                 </div>
              </div>

              {/* Right Side: Large Themed Game Buttons */}
              <div className="flex-1 w-full flex flex-col gap-5">
                 {activeWorld.locations.map((loc, i) => (
                    <motion.button
                      key={loc.id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                      whileHover={{ x: 15, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(loc.route)}
                      className={`group relative flex items-center justify-between bg-gradient-to-r ${style.btn} border-[6px] border-white/90 rounded-[32px] p-6 shadow-2xl overflow-hidden`}
                    >
                       <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="flex flex-col items-start">
                          <span className="text-white/60 font-black text-xs tracking-widest uppercase mb-1">ACTIVITY {i+1}</span>
                          <span className="text-white font-black text-2xl md:text-3xl tracking-tight leading-none">
                             {loc.label}
                          </span>
                       </div>
                       <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                          <ChevronRight size={40} className="text-white" strokeWidth={4} />
                       </div>
                    </motion.button>
                 ))}
              </div>
           </div>
        </div>

        {/* Global Bottom Navigation in Detail View */}
        <div className="fixed bottom-0 left-0 w-full p-4 z-30">
           <div className="max-w-2xl mx-auto flex gap-3 justify-center items-center">
              {[
                { label: 'HOME', icon: Home, route: 'home' },
                { label: 'PROGRESS', icon: BarChart3, route: '/hub/progress' },
                { label: 'BADGES', icon: Trophy, route: '/badges' },
                { label: 'SETTINGS', icon: Settings, route: '/hub/profile' },
              ].map((btn) => (
                 <motion.button
                   key={btn.label}
                   whileTap={{ scale: 0.9 }}
                   onClick={() => typeof btn.route === 'string' && btn.route.startsWith('/') ? navigate(btn.route) : setScreen(btn.route as any)}
                   className="flex-1 bg-blue-950/90 backdrop-blur-xl border-4 border-white/20 rounded-3xl py-4 px-2 flex flex-col items-center gap-1 shadow-2xl"
                 >
                    <btn.icon size={26} className="text-white" />
                    <span className="text-white font-black text-[10px] tracking-[0.1em] uppercase">{btn.label}</span>
                 </motion.button>
              ))}
           </div>
        </div>
      </motion.div>
    );
  };

  // ── FRIENDS RENDER (Image 4) ───────────────────────────────────────────
  const renderFriends = () => (
    <motion.main key="friends" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} className="relative min-h-screen bg-gradient-to-b from-blue-700 via-indigo-700 to-violet-900 px-4 pb-28 pt-20 overflow-hidden">
      <BackgroundSparkles />
      <div className="fixed top-4 left-4 z-30"><BackButton onClick={() => setScreen('home')} label="Home" /></div>
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-5 max-w-xl rounded-[2rem] border-4 border-yellow-300 bg-blue-950/70 p-5 shadow-2xl">
          <h2 className="text-4xl font-black text-yellow-300 md:text-6xl">ARCHIE &amp; FRIENDS</h2>
          <p className="mt-2 font-bold text-blue-50">Tap a friend to hear how they can help you learn.</p>
          <button onClick={() => meetAll()} className="mt-3 rounded-full border-2 border-white bg-green-500 px-5 py-2 font-black shadow-lg">Meet everyone aloud</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {FRIENDS.map(friend => (
            <motion.button key={friend.name} whileTap={{ scale: 0.95 }} onClick={() => introduce(friend)} className={`rounded-3xl border-4 p-3 shadow-xl ${selectedFriend?.name === friend.name ? 'border-yellow-300 bg-yellow-100 text-blue-950' : 'border-white/70 bg-white/95 text-blue-950'}`}>
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-sky-300 bg-gradient-to-b from-sky-100 to-blue-200 shadow-inner">
                {friend.archie ? <ArchieCharacter size={110} /> : friend.image ? <img src={friend.image} alt="" className="h-full w-full object-contain" /> : <span className="text-6xl">{friend.emoji}</span>}
              </div>
              <p className="mt-2 text-base font-black">{friend.name}</p>
              <p className="text-[10px] font-bold uppercase text-green-700">{friend.role}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.main>
  );

  // ── STICKER BOOK RENDER (Image 5) ──────────────────────────────────────
  const renderStickerBook = () => {
    const categories = ['All', 'Archie', 'Maths', 'Reading', 'Spelling', 'Science', 'Friends', 'Special'];
    return (
      <motion.main key="stickers" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} className="relative min-h-screen bg-gradient-to-b from-emerald-500 via-green-600 to-emerald-900 px-3 pb-28 pt-20 overflow-hidden">
        <BackgroundSparkles />
        <div className="fixed top-4 left-4 z-30"><BackButton onClick={() => setScreen('home')} label="Home" /></div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mx-auto -mb-4 w-fit rounded-3xl border-4 border-white bg-gradient-to-b from-blue-400 to-blue-700 px-8 py-3 shadow-2xl">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">STICKER BOOK</h2>
          </div>
          <div className="rounded-[2.5rem] border-[10px] border-amber-800 bg-[#fff4cf] p-5 pt-10 text-blue-950 shadow-2xl md:p-9 md:pt-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-black">Collected Stickers</p>
                <p className="text-sm font-bold text-amber-800">{earned.length} of {STICKERS.length} collected</p>
              </div>
              <button onClick={() => setScreen('friends')} className="rounded-full bg-purple-600 px-4 py-2 text-sm font-black text-white shadow-lg">Meet Archie’s Friends</button>
            </div>
            <div className="mb-6 h-5 overflow-hidden rounded-full border-2 border-amber-700 bg-amber-100">
              <div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-green-600 transition-all" style={{ width: `${(earned.length / STICKERS.length) * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filteredStickers.map(sticker => {
                const unlocked = earned.includes(sticker.id);
                return (
                  <motion.button key={sticker.id} whileTap={unlocked ? { scale: 0.92 } : undefined} disabled={!unlocked} onClick={() => ttsSpeak(unlocked ? `${sticker.name} sticker. Brilliant work!` : 'Keep learning to unlock this sticker.')} className={`aspect-square rounded-full border-4 shadow-lg flex flex-col items-center justify-center p-2 ${unlocked ? 'border-sky-400 bg-white' : 'border-stone-400 bg-stone-200 grayscale'}`}>
                    <span className="text-4xl sm:text-5xl">{unlocked ? sticker.emoji : '❔'}</span>
                    <span className="mt-1 text-[9px] font-black leading-tight sm:text-[11px]">{unlocked ? sticker.name : 'Locked'}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
              {categories.map(category => <button key={category} onClick={() => setStickerFilter(category)} className={`whitespace-nowrap rounded-full border-2 px-4 py-2 text-xs font-black ${stickerFilter === category ? 'border-blue-800 bg-blue-600 text-white' : 'border-amber-700 bg-amber-100 text-amber-900'}`}>{category.toUpperCase()}</button>)}
            </div>
          </div>
        </div>
      </motion.main>
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-sky-500 text-white font-sans selection:bg-yellow-300">
      <Helmet>
        <title>Sodafom — Archie&apos;s Learning Worlds</title>
      </Helmet>

      <AnimatePresence mode="wait">
        {screen === 'home' && renderHome()}
        {screen === 'worlds' && renderWorlds()}
        {screen === 'world' && renderWorldDetail()}
        {screen === 'stickers' && renderStickerBook()}
        {screen === 'friends' && renderFriends()}
      </AnimatePresence>
    </div>
  );
}
