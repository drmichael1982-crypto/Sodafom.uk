import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'motion/react';
import ArchieCharacter from '@/components/ArchieCharacter';
import {
  estimateEpisodeSeconds,
  SPACE_ADVENTURE,
  type SpaceAdventureScene,
  type SpaceCastMember,
  type SpaceSceneMood,
} from '@/lib/cartoons/archies-space-adventure';
import { stopTts, ttsSpeak } from '@/lib/voice-context';

interface SpaceAdventurePlayerProps {
  onExit: () => void;
}

const BACKGROUNDS: Record<SpaceSceneMood, string> = {
  launch: 'linear-gradient(135deg, #020617 0%, #312e81 55%, #9a3412 100%)',
  earth: 'linear-gradient(135deg, #020617 0%, #0c4a6e 55%, #1e3a8a 100%)',
  moon: 'linear-gradient(135deg, #020617 0%, #312e81 55%, #475569 100%)',
  sun: 'linear-gradient(135deg, #020617 0%, #9a3412 55%, #b45309 100%)',
  planets: 'linear-gradient(135deg, #020617 0%, #581c87 55%, #9d174d 100%)',
  gravity: 'linear-gradient(135deg, #020617 0%, #4c1d95 55%, #1e3a8a 100%)',
  iss: 'linear-gradient(135deg, #020617 0%, #155e75 55%, #1e3a8a 100%)',
  home: 'linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 58%, #0891b2 100%)',
};

const MOOD_ICON: Record<SpaceSceneMood, string> = {
  launch: '🚀',
  earth: '🌍',
  moon: '🌕',
  sun: '☀️',
  planets: '🪐',
  gravity: '✨',
  iss: '🛰️',
  home: '🏠',
};

const FRIENDS: Record<Exclude<SpaceCastMember, 'archie' | 'soda-bot'>, { src: string; alt: string; name: string }> = {
  'captain-spark': {
    src: '/assets/cartoon/friends/captain-spark.png',
    alt: 'Captain Spark, the Sodafom adventure friend',
    name: 'Captain Spark',
  },
  'professor-thinkwell': {
    src: '/assets/cartoon/friends/professor-thinkwell.png',
    alt: 'Professor Thinkwell, the Sodafom science friend',
    name: 'Professor Thinkwell',
  },
};

function useReducedMotionPreference(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const change = () => setReduced(query.matches);
    change();
    query.addEventListener?.('change', change);
    return () => query.removeEventListener?.('change', change);
  }, []);

  return reduced;
}

function useSpaceSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const tone = useCallback((frequency: number, duration: number, volume = 0.02) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    const context = contextRef.current || new window.AudioContext();
    contextRef.current = context;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return;
    const notes = [220, 277.18, 329.63, 277.18, 196, 246.94];
    let index = 0;
    const play = () => {
      tone(notes[index % notes.length], 1.3, 0.012);
      index += 1;
    };
    play();
    intervalRef.current = window.setInterval(play, 1750);
  }, [tone]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const correct = useCallback(() => {
    tone(523.25, 0.16, 0.05);
    window.setTimeout(() => tone(659.25, 0.23, 0.04), 130);
  }, [tone]);

  const tryAgain = useCallback(() => tone(196, 0.26, 0.03), [tone]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, correct, tryAgain };
}

function CastMember({ member, speaker, reduced }: { member: SpaceCastMember; speaker: string; reduced: boolean }) {
  const speaking = (member === 'archie' && speaker === 'Archie')
    || (member === 'soda-bot' && speaker === 'Soda Bot')
    || (member === 'captain-spark' && speaker === 'Captain Spark')
    || (member === 'professor-thinkwell' && speaker === 'Professor Thinkwell');

  if (member === 'archie') {
    return <ArchieCharacter size={130} speaking={speaking} className="drop-shadow-2xl" />;
  }

  if (member === 'soda-bot') {
    return <ArchieCharacter size={104} character="soda" speaking={speaking} className="drop-shadow-2xl" />;
  }

  const friend = FRIENDS[member];
  return (
    <motion.div
      animate={reduced ? {} : { y: [0, -7, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative h-28 w-28 sm:h-36 sm:w-36"
    >
      <img src={friend.src} alt={friend.alt} className="h-full w-full object-contain drop-shadow-2xl" />
      {speaking && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-yellow-300 px-2 py-1 text-[9px] font-black text-slate-950">Speaking</span>}
    </motion.div>
  );
}

function SceneVisual({ scene, playing, reduced }: { scene: SpaceAdventureScene; playing: boolean; reduced: boolean }) {
  return (
    <div className="relative min-h-[22rem] overflow-hidden sm:min-h-[29rem]" style={{ background: BACKGROUNDS[scene.mood] }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-75 [background-image:radial-gradient(circle_at_15%_18%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_81%_28%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_52%_72%,white_0_1px,transparent_1.5px)] [background-size:96px_96px]" />
      {[0, 1, 2, 3, 4, 5].map(index => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="absolute text-yellow-100"
          style={{ left: String(8 + index * 15) + '%', top: String(12 + ((index * 17) % 66)) + '%' }}
          animate={reduced ? {} : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.7 + index * 0.2, repeat: Infinity, delay: index * 0.16 }}
        >
          ✦
        </motion.span>
      ))}
      <motion.div
        aria-hidden="true"
        className="absolute -right-6 top-8 h-36 w-36 rounded-full bg-gradient-to-br from-cyan-100 via-blue-500 to-emerald-800 shadow-[0_0_72px_rgba(250,204,21,.45)] sm:h-52 sm:w-52"
        animate={reduced ? {} : { y: [0, -9, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {scene.mood === 'launch' && <motion.div aria-hidden="true" className="absolute right-10 top-20 text-7xl sm:right-28 sm:text-9xl" animate={reduced ? {} : { y: playing ? [24, -14, 24] : 0 }} transition={{ duration: 2.8, repeat: Infinity }}>🚀</motion.div>}
      {scene.mood === 'iss' && <motion.div aria-label="International Space Station illustration" className="absolute right-8 top-20 text-6xl sm:right-20 sm:top-24 sm:text-8xl" animate={reduced ? {} : { y: [0, -8, 0] }} transition={{ duration: 3.8, repeat: Infinity }}>🛰️</motion.div>}
      <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black text-white shadow-lg">{MOOD_ICON[scene.mood]} {scene.chapter}</div>
      <div className="absolute inset-x-0 bottom-1 flex h-40 items-end justify-around px-1 sm:bottom-3 sm:h-48 sm:px-4">
        {scene.cast.map(member => <CastMember key={member} member={member} speaker={scene.speaker} reduced={reduced} />)}
      </div>
    </div>
  );
}

export default function SpaceAdventurePlayer({ onExit }: SpaceAdventurePlayerProps) {
  const episode = SPACE_ADVENTURE;
  const duration = useMemo(() => estimateEpisodeSeconds(episode), [episode]);
  const reduced = useReducedMotionPreference();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const tokenRef = useRef(0);
  const { start: startSound, stop: stopSound, correct: playCorrect, tryAgain: playTryAgain } = useSpaceSound();
  const scene = episode.scenes[sceneIndex];

  const cancelNarration = useCallback(() => {
    tokenRef.current += 1;
    stopTts();
  }, []);

  const stopEpisode = useCallback(() => {
    cancelNarration();
    stopSound();
    setPlaying(false);
  }, [cancelNarration, stopSound]);

  const advance = useCallback(() => {
    if (sceneIndex >= episode.scenes.length - 1) {
      stopEpisode();
      setFinished(true);
      return;
    }
    setFeedback(null);
    setAwaitingAnswer(false);
    setSceneIndex(index => index + 1);
  }, [episode.scenes.length, sceneIndex, stopEpisode]);

  useEffect(() => {
    if (!playing || awaitingAnswer) return;
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    ttsSpeak(scene.speaker + '. ' + scene.narration, () => {
      if (token !== tokenRef.current) return;
      if (scene.question) {
        setPlaying(false);
        setAwaitingAnswer(true);
        stopSound();
      } else {
        advance();
      }
    });
    return () => {
      if (tokenRef.current === token) {
        tokenRef.current += 1;
        stopTts();
      }
    };
  }, [advance, awaitingAnswer, playing, scene, stopSound]);

  useEffect(() => () => {
    cancelNarration();
    stopSound();
  }, [cancelNarration, stopSound]);

  const begin = () => {
    const restarting = finished;
    if (restarting) setSceneIndex(0);
    setFinished(false);
    setAwaitingAnswer(false);
    setFeedback(null);
    if (soundOn) startSound();
    setPlaying(true);
  };

  const moveTo = (nextIndex: number, resume: boolean) => {
    cancelNarration();
    setSceneIndex(Math.max(0, Math.min(nextIndex, episode.scenes.length - 1)));
    setAwaitingAnswer(false);
    setFeedback(null);
    setFinished(false);
    if (resume) {
      if (soundOn) startSound();
      setPlaying(true);
    } else {
      stopSound();
      setPlaying(false);
    }
  };

  const skip = () => {
    cancelNarration();
    if (sceneIndex === episode.scenes.length - 1) {
      stopEpisode();
      setFinished(true);
      return;
    }
    const nextIndex = sceneIndex + 1;
    const nextScene = episode.scenes[nextIndex];
    setSceneIndex(nextIndex);
    setFeedback(null);
    setFinished(false);
    if (nextScene.question) {
      setAwaitingAnswer(true);
      setPlaying(false);
      stopSound();
      ttsSpeak(nextScene.speaker + '. ' + nextScene.narration);
      return;
    }
    setAwaitingAnswer(false);
    if (soundOn) startSound();
    setPlaying(true);
  };

  const answer = (index: number) => {
    if (!scene.question) return;
    cancelNarration();
    const correct = index === scene.question.answerIndex;
    const reply = correct ? scene.question.correctReply : scene.question.tryAgainReply;
    setFeedback(reply);
    if (correct) playCorrect(); else playTryAgain();
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    ttsSpeak(reply, () => {
      if (!correct || token !== tokenRef.current) return;
      setFeedback(null);
      setAwaitingAnswer(false);
      if (sceneIndex >= episode.scenes.length - 1) {
        setFinished(true);
        setPlaying(false);
      } else {
        if (soundOn) startSound();
        setSceneIndex(value => value + 1);
        setPlaying(true);
      }
    });
  };

  return (
    <section data-testid="space-adventure-player" data-reduced-motion={reduced ? 'true' : 'false'} className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border-4 border-yellow-300 bg-slate-950 shadow-2xl sm:rounded-[2.5rem] sm:border-8">
      <SceneVisual scene={scene} playing={playing} reduced={reduced} />
      <div className="bg-gradient-to-b from-indigo-950 to-slate-950 px-4 py-4 text-white sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{scene.chapter}</div>
            <h2 className="mt-1 text-2xl font-black text-yellow-300 sm:text-3xl">{episode.title}</h2>
            <p className="mt-1 text-xs font-bold text-indigo-100">{episode.audience} • approximately {Math.floor(duration / 60)}m {String(duration % 60).padStart(2, '0')}s with quiz stops</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right text-xs font-black shadow-inner">Scene {sceneIndex + 1} of {episode.scenes.length}<div className="mt-1 text-cyan-200">Subtitles: on</div></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" aria-label={'Episode progress: scene ' + String(sceneIndex + 1) + ' of ' + String(episode.scenes.length)}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-yellow-300 to-orange-400 transition-all duration-300" style={{ width: String(((sceneIndex + 1) / episode.scenes.length) * 100) + '%' }} />
        </div>
        <div data-testid="cartoon-subtitle" aria-live="polite" className="mt-4 rounded-2xl border-2 border-white/20 bg-black/55 px-4 py-3 text-center text-base font-black leading-relaxed text-white shadow-xl sm:text-lg"><span className="mr-2 text-yellow-300">{scene.speaker}:</span>{scene.subtitle}</div>
        {scene.fact && <div className="mt-3 flex items-start gap-2 rounded-2xl bg-cyan-100 px-3 py-2 text-sm font-bold text-slate-950"><Sparkles className="mt-0.5 shrink-0 text-blue-700" size={18} /><span><strong>Space fact:</strong> {scene.fact}</span></div>}
        {awaitingAnswer && scene.question && (
          <div data-testid="space-quiz" className="mt-4 rounded-3xl border-4 border-yellow-300 bg-white p-4 text-slate-950 shadow-xl">
            <div className="flex items-start gap-2"><Sparkles className="mt-0.5 shrink-0 text-indigo-700" /><div><h3 className="text-lg font-black">Archie’s mission question</h3><p className="mt-1 font-bold">{scene.question.prompt}</p></div></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">{scene.question.choices.map((choice, index) => <button key={choice} onClick={() => answer(index)} className="min-h-12 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-950 transition hover:bg-yellow-200 active:scale-95">{choice}</button>)}</div>
            {feedback && <p role="status" className="mt-3 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-950">{feedback}</p>}
          </div>
        )}
        {finished && <div data-testid="space-complete" className="mt-4 flex items-center justify-center gap-2 rounded-3xl border-2 border-yellow-300 bg-yellow-200 px-4 py-3 text-center font-black text-indigo-950 shadow-lg"><CheckCircle2 size={22} /> Mission complete — you are a Sodafom Space Explorer!</div>}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
          <button aria-label="Previous scene" onClick={() => moveTo(sceneIndex - 1, false)} disabled={sceneIndex === 0} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-4 font-black disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={19} /> Back</button>
          <button aria-label="Read current subtitle" onClick={() => { stopEpisode(); ttsSpeak(scene.speaker + '. ' + scene.narration); }} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-4 font-black"><Volume2 size={19} /> Read</button>
          <button aria-label={playing ? 'Pause cartoon' : 'Play cartoon'} onClick={() => playing ? stopEpisode() : begin()} disabled={awaitingAnswer} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-5 font-black text-indigo-950 shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{playing ? <Pause size={19} /> : <Play size={19} />} {playing ? 'Pause' : finished ? 'Play again' : 'Play'}</button>
          <button aria-label="Skip or continue to next scene" onClick={skip} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-4 font-black"><SkipForward size={19} /> Skip / continue</button>
          <button aria-label="Restart Space Adventure" onClick={() => moveTo(0, false)} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-4 font-black"><RotateCcw size={19} /> Restart</button>
          <button aria-label={soundOn ? 'Turn music and sound off' : 'Turn music and sound on'} aria-pressed={soundOn} onClick={() => setSoundOn(value => { const next = !value; if (!next) stopSound(); else if (playing) startSound(); return next; })} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-500/20 px-4 font-black text-cyan-100">{soundOn ? <Volume2 size={19} /> : <VolumeX size={19} />} Sound</button>
        </div>
        <button onClick={() => { stopEpisode(); onExit(); }} className="mx-auto mt-4 flex min-h-11 items-center gap-2 text-sm font-black text-cyan-200 underline decoration-cyan-400 underline-offset-4"><ChevronLeft size={17} /> Back to the cartoon theatre</button>
      </div>
    </section>
  );
}
