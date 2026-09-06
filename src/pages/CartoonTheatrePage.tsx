import { useEffect, useState } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import ArchieCharacter from '@/components/ArchieCharacter';
import { stopTts, ttsSpeak } from '@/lib/voice-context';

const EPISODES = [
  { title: 'The Number Island', image: '/assets/cartoon/worlds/maths.png', colour: 'from-blue-500 to-indigo-700', scenes: ['Archie arrives at Number Island.', 'The number bridge needs ten correct answers.', 'Archie and Soda Bot solve the puzzle and earn a golden star!'] },
  { title: 'The Magical Library', image: '/assets/cartoon/worlds/reading.png', colour: 'from-purple-500 to-fuchsia-700', scenes: ['A storybook begins to glow.', 'Archie reads the clues carefully.', 'The friends discover that every book can open a new world!'] },
  { title: 'The Word Kingdom', image: '/assets/cartoon/worlds/spelling.png', colour: 'from-rose-500 to-red-700', scenes: ['The letters have escaped from Word Kingdom.', 'Archie listens to every sound.', 'The letters return in the correct order and the castle cheers!'] },
  { title: 'Soda Bot’s Science Mission', image: '/assets/cartoon/worlds/science.png', colour: 'from-emerald-500 to-green-700', scenes: ['Soda Bot finds a mysterious seed.', 'The friends give it light, water and warmth.', 'A bright new flower grows—the experiment worked!'] },
  { title: 'Around Our Amazing Planet', image: '/assets/cartoon/worlds/geography.png', colour: 'from-orange-500 to-amber-700', scenes: ['Archie opens the magical globe.', 'Mountains, rivers and oceans appear.', 'The friends learn that our planet is full of wonderful places.'] },
  { title: 'The Crossword Treasure', image: '/assets/cartoon/worlds/crossword.png', colour: 'from-violet-600 to-slate-800', scenes: ['A crossword hides the treasure-map key.', 'Across and Down words share matching letters.', 'The final word opens the treasure chest!'] },
];

export default function CartoonTheatrePage() {
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<(typeof EPISODES)[number] | null>(null);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopTts(), []);

  useEffect(() => {
    if (!episode || !playing) return;
    ttsSpeak(`${scene === 0 ? `${episode.title}. ` : ''}${episode.scenes[scene]}`);
    const timer = window.setTimeout(() => {
      if (scene + 1 < episode.scenes.length) {
        setScene(value => value + 1);
      } else {
        setPlaying(false);
        ttsSpeak('The end. Brilliant watching!');
      }
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [episode, playing, scene]);

  const play = (item: (typeof EPISODES)[number]) => {
    setEpisode(item);
    setScene(0);
    setPlaying(true);
  };

  const next = () => {
    if (!episode) return;
    stopTts();
    setScene(value => value + 1 < episode.scenes.length ? value + 1 : 0);
    setPlaying(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-500 via-blue-700 to-indigo-950 px-4 py-5 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button onClick={() => { stopTts(); setPlaying(false); episode ? setEpisode(null) : navigate('/'); }} className="flex min-h-12 items-center gap-2 rounded-full border-2 border-white bg-white/95 px-4 font-black text-blue-900 shadow-xl">
            <ArrowLeft size={20} /> {episode ? 'Episodes' : 'Home'}
          </button>
          <h1 className="text-center text-2xl font-black text-yellow-300 sm:text-4xl">🎬 CARTOON THEATRE</h1>
          <div className="w-20" />
        </div>

        <AnimatePresence mode="wait">
          {episode ? (
            <motion.section key={episode.title} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] border-8 border-yellow-300 bg-white text-blue-950 shadow-2xl">
              <div className="relative aspect-video min-h-64 overflow-hidden bg-sky-300">
                <motion.img
                  key={`${episode.title}-${scene}`}
                  initial={{ scale: 1.2, x: scene % 2 ? '-6%' : '6%', opacity: .35 }}
                  animate={{ scale: 1.03, x: scene % 2 ? '4%' : '-4%', opacity: 1 }}
                  transition={{ duration: 6.2, ease: 'linear' }}
                  src={episode.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/45 via-transparent to-white/10" />
                {[0, 1, 2, 3, 4].map(dot => <motion.span key={dot} className="absolute h-3 w-3 rounded-full bg-yellow-200 shadow" initial={{ left: `${12 + dot * 18}%`, top: '85%', opacity: 0 }} animate={{ top: '8%', opacity: [0, 1, 0] }} transition={{ duration: 3.2 + dot / 2, repeat: Infinity, delay: dot * .45 }} />)}
                <motion.div className="absolute bottom-1 left-2" animate={{ x: scene % 2 ? [0, 35, 0] : [0, 12, 0], y: [0, -7, 0] }} transition={{ duration: 2.4, repeat: Infinity }}><ArchieCharacter size={115} speaking={playing} /></motion.div>
                <motion.img src="/assets/cartoon/friends/soda-bot.png" alt="Soda Bot" className="absolute bottom-3 right-4 h-20 w-20 object-contain drop-shadow-xl sm:h-28 sm:w-28" animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }} />
                <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white">Scene {scene + 1} of {episode.scenes.length}</div>
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/70 px-4 py-3 text-center text-base font-black text-white shadow-xl">{episode.scenes[scene]}</div>
              </div>
              <div className={`bg-gradient-to-r ${episode.colour} p-5 text-center text-white`}>
                <h2 className="text-2xl font-black">{episode.title}</h2>
                <div className="mx-auto mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-white/25"><motion.div className="h-full bg-yellow-300" animate={{ width: `${((scene + 1) / episode.scenes.length) * 100}%` }} /></div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button onClick={() => ttsSpeak(episode.scenes[scene])} aria-label="Read this scene" className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><Volume2 /> Read</button>
                  <button onClick={() => { playing ? stopTts() : ttsSpeak(episode.scenes[scene]); setPlaying(value => !value); }} className="flex min-h-12 items-center gap-2 rounded-full bg-yellow-400 px-6 font-black text-blue-950 shadow-lg">{playing ? <Pause size={18} /> : <Play size={18} />} {playing ? 'Pause' : 'Play'}</button>
                  <button onClick={next} className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><SkipForward size={18} /> Next scene</button>
                  <button onClick={() => { stopTts(); setScene(0); setPlaying(true); }} className="flex min-h-12 items-center gap-2 rounded-full bg-white/20 px-4 font-black"><RotateCcw size={18} /> Restart</button>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section key="episodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="mb-5 text-center text-lg font-bold">Choose a colourful learning cartoon with Archie.</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {EPISODES.map(item => (
                  <button key={item.title} onClick={() => play(item)} className="overflow-hidden rounded-3xl border-4 border-white/80 bg-white text-blue-950 shadow-xl active:scale-95">
                    <img src={item.image} alt="" className="aspect-square w-full object-cover" />
                    <div className={`bg-gradient-to-r ${item.colour} p-3 text-white`}><p className="font-black">{item.title}</p><span className="mt-1 inline-flex items-center gap-1 text-xs font-bold"><Play size={13} /> Play cartoon</span></div>
                  </button>
                ))}
              </div>
              <button onClick={() => setScene(0)} className="sr-only"><RotateCcw /> Restart</button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
