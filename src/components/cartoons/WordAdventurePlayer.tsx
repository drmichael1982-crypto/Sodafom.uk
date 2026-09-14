import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Captions, CheckCircle2, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import ArchieCharacter from '@/components/ArchieCharacter';
import { stopTts, ttsSpeak } from '@/lib/voice-context';
import { WORD_ADVENTURE, WORD_ADVENTURE_RUNTIME_SECONDS, type CartoonCue, type CartoonScene, type CartoonSpeaker } from '@/lib/cartoons/word-adventure';

const SPEAKER_ASSETS: Record<CartoonSpeaker, { src: string; alt: string }> = {
  Archie: { src: '/assets/images/archie-character-v2.png', alt: 'Archie holding his golden key' },
  Bella: { src: '/assets/cartoon/friends/bella.png', alt: 'Bella, the English tutor' },
  'Soda Bot': { src: '/assets/cartoon/friends/soda-bot.png', alt: 'Soda Bot' },
};
const BACKDROPS: Record<CartoonScene['backdrop'], string> = {
  reading: '/assets/cartoon/worlds/reading.png',
  spelling: '/assets/cartoon/worlds/spelling.png',
};

function durationLabel(seconds: number) { return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`; }
function notes(cue: CartoonCue) {
  if (cue === 'magic') return [523.25, 659.25, 783.99];
  if (cue === 'celebrate') return [659.25, 783.99, 1046.5];
  if (cue === 'question') return [493.88, 587.33];
  return [440];
}
/** Small local musical cue: no third-party audio, no extra artwork or network request. */
function playCue(cue: CartoonCue, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  try {
    const context = new AudioContextCtor();
    const now = context.currentTime;
    notes(cue).forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = cue === 'question' ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.07, now + index * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.24);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.27);
    });
    window.setTimeout(() => context.close().catch(() => undefined), 900);
  } catch { /* Audio can be blocked until a device interaction; subtitles and TTS still work. */ }
}

export interface WordAdventurePlayerProps { onExit: () => void; initialScene?: number; }

export default function WordAdventurePlayer({ onExit, initialScene = 0 }: WordAdventurePlayerProps) {
  const reduceMotion = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(() => Math.max(0, Math.min(initialScene, WORD_ADVENTURE.scenes.length - 1)));
  const [playing, setPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const feedbackTimer = useRef<number | null>(null);
  const scene = WORD_ADVENTURE.scenes[sceneIndex];
  const last = sceneIndex === WORD_ADVENTURE.scenes.length - 1;

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = null;
  }, []);
  const finish = useCallback(() => {
    clearFeedbackTimer(); stopTts(); setPlaying(false); setCompleted(true); setProgress(100);
    playCue('celebrate', soundEnabled); ttsSpeak('The end. You did brilliantly, word explorer!');
  }, [clearFeedbackTimer, soundEnabled]);
  const next = useCallback(() => {
    clearFeedbackTimer(); stopTts(); setFeedback(null);
    if (last) return finish();
    setProgress(0); setSceneIndex(index => index + 1);
  }, [clearFeedbackTimer, finish, last]);

  useEffect(() => () => { clearFeedbackTimer(); stopTts(); }, [clearFeedbackTimer]);
  useEffect(() => {
    if (!playing || feedback || completed) return;
    playCue(scene.cue, soundEnabled);
    ttsSpeak(`${scene.speaker}. ${scene.dialogue}`);
    return () => stopTts();
  }, [completed, feedback, playing, scene, soundEnabled]);
  useEffect(() => {
    if (!playing || feedback || completed) return;
    const began = Date.now();
    const progressTimer = window.setInterval(() => setProgress(Math.min(100, ((Date.now() - began) / scene.durationMs) * 100)), 100);
    const sceneTimer = window.setTimeout(next, scene.durationMs);
    return () => { window.clearInterval(progressTimer); window.clearTimeout(sceneTimer); };
  }, [completed, feedback, next, playing, scene.durationMs]);

  const restart = () => { clearFeedbackTimer(); stopTts(); setSceneIndex(0); setProgress(0); setFeedback(null); setCompleted(false); setPlaying(true); };
  const togglePlay = () => {
    if (completed) return restart();
    if (playing) stopTts();
    setPlaying(value => !value);
  };
  const answer = (label: string) => {
    if (!scene.question || feedback) return;
    const choice = scene.question.choices.find(item => item.label === label);
    if (!choice) return;
    const text = choice.correct ? scene.question.answerExplanation : `Good try. ${scene.question.answerExplanation}`;
    clearFeedbackTimer(); stopTts(); setPlaying(false); setFeedback({ correct: choice.correct, text });
    playCue(choice.correct ? 'celebrate' : 'question', soundEnabled); ttsSpeak(text);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback(null);
      if (last) finish(); else { setSceneIndex(index => index + 1); setProgress(0); setPlaying(true); }
    }, 2_200);
  };
  const speakerAsset = SPEAKER_ASSETS[scene.speaker];

  return <main data-testid="word-adventure-player" className="min-h-screen bg-gradient-to-b from-violet-800 via-fuchsia-700 to-sky-800 px-3 py-4 text-white sm:px-5 sm:py-6">
    <div className="mx-auto max-w-6xl">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => { stopTts(); onExit(); }} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 py-2 font-black text-violet-950 shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"><ArrowLeft size={20} /> Back to Cartoon Theatre</button>
        <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-200">Ages 5–12 · Subtitles on</p><h1 className="text-2xl font-black sm:text-4xl">Archie’s Word Adventure</h1></div>
        <div className="rounded-full bg-slate-950/45 px-4 py-2 text-sm font-black" aria-label={`Episode length ${durationLabel(WORD_ADVENTURE_RUNTIME_SECONDS)}`}>{durationLabel(WORD_ADVENTURE_RUNTIME_SECONDS)}</div>
      </header>

      <section aria-label="Archie’s Word Adventure player" className="overflow-hidden rounded-[2rem] border-4 border-yellow-300 bg-slate-950 shadow-2xl sm:rounded-[2.5rem] sm:border-8">
        <div className="relative aspect-video min-h-[330px] overflow-hidden bg-sky-900 sm:min-h-[430px]">
          <motion.img key={`${scene.id}-backdrop`} src={BACKDROPS[scene.backdrop]} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-70" initial={reduceMotion ? false : { scale: 1.13, x: sceneIndex % 2 ? '-4%' : '4%', opacity: 0.25 }} animate={reduceMotion ? { opacity: 0.7 } : { scale: 1.04, x: sceneIndex % 2 ? '3%' : '-3%', opacity: 0.7 }} transition={reduceMotion ? { duration: 0 } : { duration: 7.7, ease: 'linear' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-violet-950/35 to-sky-100/20" />
          {[0, 1, 2, 3, 4, 5].map(index => <motion.span key={`${scene.id}-${index}`} aria-hidden="true" className="absolute text-2xl text-yellow-200 drop-shadow-[0_0_12px_rgba(253,224,71,0.95)]" style={{ left: `${10 + index * 15}%`, top: `${15 + (index % 3) * 22}%` }} animate={reduceMotion ? { opacity: 0.75 } : { y: [0, -14, 0], opacity: [0.25, 1, 0.25] }} transition={reduceMotion ? { duration: 0 } : { duration: 1.9 + index * 0.22, repeat: Infinity, delay: index * 0.16 }}>{index % 2 ? '✦' : '✧'}</motion.span>)}
          <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-black shadow-lg" data-testid="scene-counter">Scene {sceneIndex + 1} of {WORD_ADVENTURE.scenes.length} · {scene.stage}</div>
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-black shadow-lg"><Captions size={15} /> Subtitles on</div>
          <motion.div className="absolute bottom-[20%] left-[6%]" animate={reduceMotion ? { y: 0 } : { y: [0, -9, 0], x: scene.speaker === 'Archie' ? [0, 14, 0] : [0, -4, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
            {scene.speaker === 'Archie' ? <ArchieCharacter size={150} speaking={playing && !feedback} /> : <img src="/assets/images/archie-character-v2.png" alt="Archie listens attentively" className="w-32 object-contain drop-shadow-2xl sm:w-40" />}
          </motion.div>
          <motion.div className="absolute bottom-[19%] right-[6%]" animate={reduceMotion ? { y: 0 } : { y: [0, -13, 0], rotate: [0, -2, 2, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}><img src={speakerAsset.src} alt={speakerAsset.alt} className="w-32 object-contain drop-shadow-2xl sm:w-40" />{playing && !feedback && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-yellow-300 px-2 py-1 text-[10px] font-black text-violet-950 shadow">Talking</span>}</motion.div>
          <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/20 bg-slate-950/85 p-3 text-center shadow-2xl sm:inset-x-6 sm:bottom-5 sm:p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-200">{scene.speaker}</p><p data-testid="word-adventure-subtitle" aria-live="polite" className="mt-1 text-base font-black leading-snug sm:text-xl">{scene.subtitle}</p></div>
        </div>
        <div className="bg-gradient-to-r from-violet-950 via-fuchsia-900 to-sky-950 p-4 sm:p-6">
          <div className="h-2 overflow-hidden rounded-full bg-white/20" aria-label={`Scene progress ${Math.round(progress)} percent`}><motion.div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} /></div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
            <button type="button" onClick={() => ttsSpeak(`${scene.speaker}. ${scene.dialogue}`)} aria-label="Read this scene aloud again" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-yellow-300"><Volume2 size={19} /> Read again</button>
            <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause cartoon' : 'Play cartoon'} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-300 px-5 font-black text-violet-950 shadow-lg hover:bg-yellow-200 focus:outline-none focus:ring-4 focus:ring-white">{playing ? <Pause size={19} /> : <Play size={19} />}{playing ? 'Pause' : completed ? 'Play again' : 'Play'}</button>
            <button type="button" onClick={next} aria-label="Skip to next scene" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-yellow-300"><SkipForward size={19} /> Next scene</button>
            <button type="button" onClick={restart} aria-label="Restart the cartoon" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-yellow-300"><RotateCcw size={19} /> Restart</button>
            <button type="button" onClick={() => setSoundEnabled(value => !value)} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Turn music and sound off' : 'Turn music and sound on'} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-yellow-300">{soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />} Sound {soundEnabled ? 'on' : 'off'}</button>
          </div>
          {scene.question && <section aria-labelledby="word-adventure-question" className="mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-yellow-200 bg-white p-4 text-slate-950 shadow-xl sm:p-5"><h2 id="word-adventure-question" className="text-center text-lg font-black sm:text-xl">🗝️ {scene.question.prompt}</h2><p className="mt-1 text-center text-sm font-bold text-slate-600">Choose an answer, or pause to think. Archie will always be kind.</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{scene.question.choices.map(choice => <button key={choice.label} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice.label)} className="min-h-12 rounded-xl border-2 border-violet-200 bg-violet-50 px-3 py-2 text-sm font-black text-violet-950 transition hover:border-violet-500 hover:bg-violet-100 focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:cursor-wait disabled:opacity-70">{choice.label}</button>)}</div>{feedback && <div role="status" aria-live="assertive" className={`mt-4 rounded-xl p-3 text-center font-black ${feedback.correct ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950'}`}><CheckCircle2 className="mr-1 inline-block" size={19} /> {feedback.text}</div>}</section>}
          {completed && <div role="status" aria-live="assertive" className="mx-auto mt-5 max-w-3xl rounded-2xl border-2 border-yellow-200 bg-yellow-100 p-4 text-center text-violet-950 shadow-xl"><p className="text-xl font-black">⭐ Adventure complete!</p><p className="mt-1 font-bold">You explored sounds, spelling, sentences, grammar, meanings, reading clues and story writing.</p></div>}
        </div>
      </section>
      <p className="mx-auto mt-4 max-w-3xl text-center text-sm font-bold text-violet-100">Accessibility: subtitles stay on, every control works by keyboard, gentle motion respects reduced-motion settings, and music/sound can be switched off.</p>
    </div>
  </main>;
}
