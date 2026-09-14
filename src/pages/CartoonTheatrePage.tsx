import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';
import SpaceAdventurePlayer from '@/components/cartoons/SpaceAdventurePlayer';
import { stopTts, ttsSpeak } from '@/lib/voice-context';

type MiniEpisode = {
  kind: 'mini';
  title: string;
  image: string;
  colour: string;
  scenes: string[];
};

type SpaceEpisode = {
  kind: 'space';
  title: string;
  image: string;
  colour: string;
  description: string;
};

type TheatreEpisode = MiniEpisode | SpaceEpisode;

const EPISODES: TheatreEpisode[] = [
  {
    kind: 'space',
    title: "Archie's Space Adventure",
    image: '/assets/cartoon/worlds/science.png',
    colour: 'from-indigo-600 via-blue-600 to-cyan-500',
    description: 'A 5–7 minute rocket adventure with questions about Earth, the Moon, planets, gravity and the ISS.',
  },
  {
    kind: 'mini',
    title: 'The Number Island',
    image: '/assets/cartoon/worlds/maths.png',
    colour: 'from-blue-500 to-indigo-700',
    scenes: ['Archie arrives at Number Island.', 'The number bridge needs ten correct answers.', 'Archie and Soda Bot solve the puzzle and earn a golden star!'],
  },
  {
    kind: 'mini',
    title: 'The Magical Library',
    image: '/assets/cartoon/worlds/reading.png',
    colour: 'from-purple-500 to-fuchsia-700',
    scenes: ['A storybook begins to glow.', 'Archie reads the clues carefully.', 'The friends discover that every book can open a new world!'],
  },
  {
    kind: 'mini',
    title: 'The Word Kingdom',
    image: '/assets/cartoon/worlds/spelling.png',
    colour: 'from-rose-500 to-red-700',
    scenes: ['The letters have escaped from Word Kingdom.', 'Archie listens to every sound.', 'The letters return in the correct order and the castle cheers!'],
  },
  {
    kind: 'mini',
    title: 'Soda Bot’s Science Mission',
    image: '/assets/cartoon/worlds/science.png',
    colour: 'from-emerald-500 to-green-700',
    scenes: ['Soda Bot finds a mysterious seed.', 'The friends give it light, water and warmth.', 'A bright new flower grows—the experiment worked!'],
  },
  {
    kind: 'mini',
    title: 'Around Our Amazing Planet',
    image: '/assets/cartoon/worlds/geography.png',
    colour: 'from-orange-500 to-amber-700',
    scenes: ['Archie opens the magical globe.', 'Mountains, rivers and oceans appear.', 'The friends learn that our planet is full of wonderful places.'],
  },
  {
    kind: 'mini',
    title: 'The Crossword Treasure',
    image: '/assets/cartoon/worlds/crossword.png',
    colour: 'from-violet-600 to-slate-800',
    scenes: ['A crossword hides the treasure-map key.', 'Across and Down words share matching letters.', 'The final word opens the treasure chest!'],
  },
];

export default function CartoonTheatrePage() {
  const navigate = useNavigate();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const selected = useMemo(() => EPISODES.find(episode => episode.title === selectedTitle) || null, [selectedTitle]);
  const mini = selected?.kind === 'mini' ? selected : null;

  useEffect(() => () => stopTts(), []);

  useEffect(() => {
    if (!mini || !playing) return;
    ttsSpeak((sceneIndex === 0 ? mini.title + '. ' : '') + mini.scenes[sceneIndex]);
    const timer = window.setTimeout(() => {
      if (sceneIndex + 1 < mini.scenes.length) setSceneIndex(value => value + 1);
      else {
        setPlaying(false);
        ttsSpeak('The end. Brilliant watching!');
      }
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [mini, playing, sceneIndex]);

  const close = () => {
    stopTts();
    setPlaying(false);
    setSelectedTitle(null);
  };

  const open = (episode: TheatreEpisode) => {
    setSceneIndex(0);
    setSelectedTitle(episode.title);
    setPlaying(episode.kind === 'mini');
  };

  const nextMiniScene = () => {
    if (!mini) return;
    stopTts();
    setSceneIndex(index => index + 1 < mini.scenes.length ? index + 1 : 0);
    setPlaying(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-950 px-4 py-5 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button onClick={() => selected ? close() : navigate('/')} className="flex min-h-12 items-center gap-2 rounded-full border-2 border-white bg-white/95 px-4 font-black text-blue-900 shadow-xl">
            <ArrowLeft size={20} /> {selected ? 'Episodes' : 'Home'}
          </button>
          <h1 className="text-center text-2xl font-black text-yellow-300 sm:text-4xl">🎬 CARTOON THEATRE</h1>
          <div className="w-20" />
        </div>

        <AnimatePresence mode="wait">
          {selected?.kind === 'space' ? (
            <motion.div key="space-adventure" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
              <SpaceAdventurePlayer onExit={close} />
            </motion.div>
          ) : mini ? (
            <motion.section key={mini.title} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] border-8 border-yellow-300 bg-white text-blue-950 shadow-2xl">
              <div className="relative aspect-video min-h-64 overflow-hidden bg-sky-300">
                <motion.img
                  key={mini.title + '-' + String(sceneIndex)}
                  initial={{ scale: 1.2, x: sceneIndex % 2 ? '-6%' : '6%', opacity: 0.35 }}
                  animate={{ scale: 1.03, x: sceneIndex % 2 ? '4%' : '-4%', opacity: 1 }}
                  transition={{ duration: 6.2, ease: 'linear' }}
                  src={mini.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/45 via-transparent to-white/10" />
                <motion.div className="absolute bottom-1 left-2" animate={{ x: sceneIndex % 2 ? [0, 35, 0] : [0, 12, 0], y: [0, -7, 0] }} transition={{ duration: 2.4, repeat: Infinity }}><ArchieCharacter size={115} speaking={playing} /></motion.div>
                <motion.img src="/assets/cartoon/friends/soda-bot.png" alt="Soda Bot" className="absolute bottom-3 right-4 h-20 w-20 object-contain drop-shadow-xl sm:h-28 sm:w-28" animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white">Scene {sceneIndex + 1} of {mini.scenes.length}</div>
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/70 px-4 py-3 text-center text-base font-black text-white shadow-xl">{mini.scenes[sceneIndex]}</div>
              </div>
              <div className={'bg-gradient-to-r ' + mini.colour + ' p-5 text-center text-white'}>
                <h2 className="text-2xl font-black">{mini.title}</h2>
                <div className="mx-auto mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-white/25"><motion.div className="h-full bg-yellow-300" animate={{ width: String(((sceneIndex + 1) / mini.scenes.length) * 100) + '%' }} /></div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button onClick={() => ttsSpeak(mini.scenes[sceneIndex])} aria-label="Read this scene" className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><Volume2 /> Read</button>
                  <button onClick={() => { if (playing) stopTts(); else ttsSpeak(mini.scenes[sceneIndex]); setPlaying(value => !value); }} className="flex min-h-12 items-center gap-2 rounded-full bg-yellow-400 px-6 font-black text-blue-950 shadow-lg">{playing ? <Pause size={18} /> : <Play size={18} />} {playing ? 'Pause' : 'Play'}</button>
                  <button onClick={nextMiniScene} className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><SkipForward size={18} /> Next scene</button>
                  <button onClick={() => { stopTts(); setSceneIndex(0); setPlaying(true); }} className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><RotateCcw size={18} /> Restart</button>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section key="episodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mb-5 text-center text-lg font-bold">Choose a colourful learning cartoon with Archie.</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {EPISODES.map(episode => (
                  <button key={episode.title} onClick={() => open(episode)} className="overflow-hidden rounded-3xl border-4 border-white/80 bg-white text-blue-950 shadow-xl transition active:scale-95">
                    <img src={episode.image} alt="" className="aspect-square w-full object-cover" />
                    <div className={'bg-gradient-to-r ' + episode.colour + ' p-3 text-white'}>
                      <p className="font-black">{episode.title}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold"><Play size={13} /> {episode.kind === 'space' ? '5–7 minute adventure' : 'Play cartoon'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
