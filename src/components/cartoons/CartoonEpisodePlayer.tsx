import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Captions, CaptionsOff, CheckCircle2, Music2, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import ArchieCharacter from '@/components/ArchieCharacter';
import { stopTts, ttsSpeak } from '@/lib/voice-context';
import type { CartoonActor, CartoonEpisodeManifest } from '@/lib/cartoons/episode-contract';

type CartoonEpisodePlayerProps = {
  episode: CartoonEpisodeManifest;
  onExit: () => void;
};

type BrowserAudioContext = typeof AudioContext;

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

function makeTone(context: AudioContext, frequency: number, seconds: number, volume: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + seconds);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + seconds);
}

function positionClass(side: CartoonActor['side']) {
  if (side === 'left') return 'left-[4%] sm:left-[8%]';
  if (side === 'right') return 'right-[4%] sm:right-[8%]';
  return 'left-1/2 -translate-x-1/2';
}

function skyClass(sceneIndex: number) {
  const skies = [
    'from-indigo-950 via-violet-800 to-amber-400',
    'from-indigo-900 via-sky-700 to-cyan-200',
    'from-sky-500 via-emerald-500 to-lime-300',
    'from-emerald-600 via-lime-500 to-amber-200',
    'from-amber-500 via-orange-400 to-sky-300',
    'from-teal-800 via-emerald-600 to-lime-200',
  ];
  return skies[sceneIndex % skies.length];
}

/**
 * Temporary manifest renderer. It uses the public Agent 22 episode contract so
 * the shared engine can replace this component without rewriting the story.
 */
export default function CartoonEpisodePlayer({ episode, onExit }: CartoonEpisodePlayerProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captionsOn, setCaptionsOn] = useState<boolean>(episode.subtitleDefault);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const scene = episode.scenes[sceneIndex];
  const finalScene = sceneIndex === episode.scenes.length - 1;

  const unlockAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const constructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: BrowserAudioContext }).webkitAudioContext;
    if (!constructor) return null;
    if (!audioContextRef.current) audioContextRef.current = new constructor();
    void audioContextRef.current.resume?.();
    return audioContextRef.current;
  }, []);

  const soundEffect = useCallback((frequency = 600, duration = 0.12, volume = 0.04) => {
    if (!soundOn) return;
    const context = unlockAudio();
    if (context) makeTone(context, frequency, duration, volume);
  }, [soundOn, unlockAudio]);

  const moveTo = useCallback((index: number, autoPlay = true) => {
    const safeIndex = Math.max(0, Math.min(index, episode.scenes.length - 1));
    stopTts();
    setSceneIndex(safeIndex);
    setPlaying(autoPlay);
    setFinished(false);
  }, [episode.scenes.length]);

  const play = useCallback(() => {
    unlockAudio();
    soundEffect(660, 0.12);
    setPlaying(true);
    setFinished(false);
  }, [soundEffect, unlockAudio]);

  const pause = useCallback(() => {
    stopTts();
    setPlaying(false);
  }, []);

  const restart = useCallback(() => {
    stopTts();
    setAnswers({});
    moveTo(0, true);
    soundEffect(520, 0.16);
  }, [moveTo, soundEffect]);

  useEffect(() => () => {
    stopTts();
    void audioContextRef.current?.close?.();
  }, []);

  useEffect(() => {
    if (!playing) return;
    ttsSpeak(scene.speaker + '. ' + scene.dialogue);
    soundEffect(470 + (sceneIndex % 4) * 65, 0.08, 0.028);
    const timer = window.setTimeout(() => {
      if (finalScene) {
        stopTts();
        setPlaying(false);
        setFinished(true);
      } else {
        setSceneIndex(value => value + 1);
      }
    }, scene.durationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [finalScene, playing, scene, sceneIndex, soundEffect]);

  useEffect(() => {
    if (!playing || !musicOn || reducedMotion) return;
    const context = unlockAudio();
    if (!context) return;
    const notes = [196, 246.94, 293.66, 246.94];
    let noteIndex = sceneIndex % notes.length;
    makeTone(context, notes[noteIndex], 0.6, 0.012);
    const timer = window.setInterval(() => {
      noteIndex = (noteIndex + 1) % notes.length;
      makeTone(context, notes[noteIndex], 0.6, 0.012);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [musicOn, playing, reducedMotion, sceneIndex, unlockAudio]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, button')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        playing ? pause() : play();
      }
      if (event.code === 'ArrowRight') moveTo(sceneIndex + 1, true);
      if (event.code === 'ArrowLeft') moveTo(sceneIndex - 1, true);
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [moveTo, pause, play, playing, sceneIndex]);

  const answerQuestion = (answer: string) => {
    if (!scene.question) return;
    setAnswers(previous => ({ ...previous, [scene.id]: answer }));
    if (answer === scene.question.answer) {
      unlockAudio();
      soundEffect(880, 0.2, 0.07);
    } else {
      soundEffect(240, 0.1, 0.03);
    }
  };

  const actorAnimation = reducedMotion ? { opacity: 1 } : { y: [0, -8, 0], rotate: [-1, 1, -1] };
  const progress = ((sceneIndex + 1) / episode.scenes.length) * 100;

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-white sm:px-5 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button onClick={onExit} className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/75 bg-white/10 px-4 font-black transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-yellow-300">
            <ArrowLeft size={20} /> Cartoon Theatre
          </button>
          <div className="text-center">
            <p className="text-xs font-black tracking-[0.2em] text-yellow-200">SODAFOAM CARTOON ADVENTURE</p>
            <h1 className="text-2xl font-black sm:text-4xl">{episode.title}</h1>
          </div>
          <div className="rounded-full bg-amber-300 px-3 py-2 text-xs font-black text-amber-950">6 minute adventure</div>
        </header>

        <section aria-label={episode.title + ' player'} className="overflow-hidden rounded-[2rem] border-4 border-yellow-300 bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,.55)] sm:rounded-[2.75rem]">
          <div className={'relative aspect-[16/10] min-h-[360px] overflow-hidden bg-gradient-to-b sm:aspect-video sm:min-h-0 ' + skyClass(sceneIndex)}>
            <div className="absolute inset-x-0 bottom-0 h-[37%] bg-gradient-to-t from-emerald-950 via-emerald-800/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-[25%] h-8 bg-emerald-700/70 blur-sm" />
            {!reducedMotion && [0, 1, 2, 3, 4, 5].map(index => (
              <motion.span
                key={index}
                aria-hidden="true"
                className="absolute text-xl opacity-70"
                initial={{ left: (8 + index * 16) + '%', top: '76%', opacity: 0 }}
                animate={{ top: ['76%', '14%'], opacity: [0, 0.8, 0] }}
                transition={{ duration: 4.2 + index * 0.25, delay: index * 0.5, repeat: Infinity, ease: 'easeOut' }}
              >✨</motion.span>
            ))}
            <div className="absolute left-3 top-3 z-20 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black backdrop-blur">Scene {sceneIndex + 1} of {episode.scenes.length}</div>
            <div className="absolute right-3 top-3 z-20 rounded-full bg-black/55 px-3 py-1.5 text-xs font-black backdrop-blur">{scene.setting}</div>

            {scene.cast.map(actor => (
              <motion.div
                key={scene.id + '-' + actor.id}
                className={'absolute bottom-[13%] z-10 flex max-w-[34%] flex-col items-center text-center ' + positionClass(actor.side)}
                initial={reducedMotion ? false : { opacity: 0, y: 26, scale: 0.92 }}
                animate={actorAnimation}
                transition={{ duration: actor.kind === 'dinosaur' ? 3.1 : 2.4, repeat: reducedMotion ? 0 : Infinity, ease: 'easeInOut' }}
              >
                {actor.id === 'archie' ? (
                  <ArchieCharacter size={132} speaking={playing && scene.speaker === 'Archie'} className="max-w-full" />
                ) : actor.asset ? (
                  <img src={actor.asset} alt={actor.label} className="h-28 w-28 object-contain drop-shadow-2xl sm:h-40 sm:w-40" />
                ) : (
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-white/80 bg-white/20 text-7xl shadow-2xl backdrop-blur sm:h-40 sm:w-40 sm:text-9xl">{actor.emoji}</div>
                )}
                <span className="mt-1 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-black text-white shadow-lg sm:text-xs">{actor.label}</span>
              </motion.div>
            ))}

            <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-3 pb-3 pt-14 sm:px-6 sm:pb-5">
              {captionsOn && (
                <div aria-live="polite" aria-label="Subtitles" className="mx-auto max-w-4xl rounded-2xl border-2 border-white/30 bg-black/75 px-4 py-3 text-center text-sm font-bold leading-relaxed shadow-xl sm:text-lg">
                  <span className="mr-2 text-yellow-300">{scene.speaker}:</span>{scene.dialogue}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-800 to-slate-950 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Now exploring</p><h2 className="text-xl font-black text-white sm:text-2xl">{scene.title}</h2></div>
              <div className="rounded-2xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950">🔎 {scene.fact}</div>
            </div>

            {scene.question && (
              <section aria-label="Explorer question" className="mt-4 rounded-3xl border-2 border-fuchsia-300 bg-fuchsia-950/55 p-4 shadow-inner">
                <div className="flex items-center gap-2 font-black text-fuchsia-100"><Sparkles size={19} /> Archie asks: {scene.question.prompt}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {scene.question.choices.map(choice => {
                    const selected = answers[scene.id] === choice;
                    const correct = selected && choice === scene.question.answer;
                    const classes = correct
                      ? 'border-emerald-300 bg-emerald-500 text-emerald-950'
                      : selected
                        ? 'border-rose-300 bg-rose-500 text-white'
                        : 'border-white/35 bg-white/10 text-white hover:bg-white/20';
                    return (
                      <button key={choice} onClick={() => answerQuestion(choice)} className={'min-h-12 rounded-2xl border-2 px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-yellow-300 ' + classes}>
                        {correct && <CheckCircle2 className="mr-1 inline" size={16} />}{choice}
                      </button>
                    );
                  })}
                </div>
                {answers[scene.id] && <p aria-live="polite" className="mt-3 rounded-xl bg-black/25 px-3 py-2 text-sm font-bold text-white">{answers[scene.id] === scene.question.answer ? scene.question.correctResponse : scene.question.tryAgainResponse}</p>}
              </section>
            )}

            {finished && <div role="status" className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-100 p-4 text-center font-black text-emerald-950"><CheckCircle2 className="mr-2 inline" /> Episode complete — you are an official Dinosaur Detective!</div>}

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15" aria-label="Episode progress"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-yellow-300 to-pink-400 transition-all duration-500" style={{ width: progress + '%' }} /></div>

            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
              <button onClick={() => moveTo(sceneIndex - 1, true)} disabled={sceneIndex === 0} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"><SkipBack size={18} /> Previous</button>
              <button onClick={playing ? pause : play} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-300 px-5 font-black text-slate-950 shadow-lg transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white">{playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}{playing ? 'Pause' : 'Play'}</button>
              <button onClick={() => finalScene ? restart() : moveTo(sceneIndex + 1, true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cyan-500 px-4 font-black text-cyan-950 shadow-lg transition hover:scale-105"><SkipForward size={18} />{finalScene ? 'Watch again' : 'Continue'}</button>
              <button onClick={restart} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20"><RotateCcw size={18} /> Restart</button>
              <button onClick={() => ttsSpeak(scene.speaker + '. ' + scene.dialogue)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20"><Volume2 size={18} /> Read scene</button>
              <button aria-pressed={captionsOn} onClick={() => setCaptionsOn(value => !value)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20">{captionsOn ? <Captions size={18} /> : <CaptionsOff size={18} />}{captionsOn ? 'Subtitles on' : 'Subtitles off'}</button>
              <button aria-pressed={soundOn} onClick={() => { unlockAudio(); setSoundOn(value => !value); }} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20">{soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}{soundOn ? 'Sound on' : 'Sound off'}</button>
              <button aria-pressed={musicOn} onClick={() => { unlockAudio(); setMusicOn(value => !value); }} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 font-black transition hover:bg-white/20"><Music2 size={18} />{musicOn ? 'Music on' : 'Music off'}</button>
            </div>
            <p className="mt-4 text-center text-xs font-semibold text-slate-300">Temporary computer-generated narration from the device — designed to be replaceable later. Subtitles are on by default. Reduced-motion settings keep the story clear without moving effects.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
