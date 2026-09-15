import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Eye, Pause, Play, RotateCcw, SkipForward, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

import ArchieCharacter from '@/components/ArchieCharacter';
import type { ScienceEpisode } from '@/lib/cartoons/archies-amazing-science-adventure';
import { stopTts, ttsSpeak } from '@/lib/voice-context';

type Props = { episode: ScienceEpisode; onExit: () => void; initialSceneIndex?: number };
const TICK_MS = 250;

function useReducedMotion(): boolean {
  const current = (): boolean => typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [reduced, setReduced] = useState(current);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function CartoonEpisodePlayer({ episode, onExit, initialSceneIndex = 0 }: Props): ReactElement {
  const start = Math.max(0, Math.min(initialSceneIndex, episode.scenes.length - 1));
  const [sceneIndex, setSceneIndex] = useState(start);
  const [sceneElapsedMs, setSceneElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const spokenScene = useRef<string | null>(null);
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion && !calmMode;
  const scene = episode.scenes[sceneIndex];
  const selectedChoice = answerIndex === null ? null : scene.question?.choices[answerIndex] ?? null;
  const questionAnswered = !scene.question || answerIndex !== null;
  const secondsBefore = episode.scenes.slice(0, sceneIndex).reduce((sum, item) => sum + item.durationSeconds, 0);
  const progress = Math.min(100, ((secondsBefore * 1000 + sceneElapsedMs) / (episode.runtimeSeconds * 1000)) * 100);

  const chooseScene = useCallback((next: number, continuePlaying = true): void => {
    stopTts();
    spokenScene.current = null;
    setSceneIndex(next);
    setSceneElapsedMs(0);
    setAnswerIndex(null);
    setPlaying(continuePlaying);
  }, []);

  const nextScene = useCallback((): void => {
    if (sceneIndex === episode.scenes.length - 1) {
      stopTts();
      setPlaying(false);
      setComplete(true);
      return;
    }
    chooseScene(sceneIndex + 1);
  }, [chooseScene, episode.scenes.length, sceneIndex]);

  const restart = useCallback((): void => {
    setComplete(false);
    chooseScene(0);
  }, [chooseScene]);

  const togglePlay = useCallback((): void => {
    if (complete) { restart(); return; }
    if (playing) { stopTts(); setPlaying(false); return; }
    setPlaying(true);
  }, [complete, playing, restart]);

  const selectAnswer = (index: number): void => {
    if (answerIndex !== null) return;
    setAnswerIndex(index);
    setPlaying(false);
    stopTts();
  };

  useEffect(() => () => stopTts(), []);

  useEffect(() => {
    if (!playing || muted || complete || spokenScene.current === scene.id) return;
    spokenScene.current = scene.id;
    ttsSpeak(`${scene.speaker}. ${scene.narration}`);
  }, [complete, muted, playing, scene]);

  useEffect(() => {
    if (!playing || !questionAnswered || complete) return undefined;
    const duration = scene.durationSeconds * 1000;
    const remaining = duration - sceneElapsedMs;
    if (remaining <= 0) { nextScene(); return undefined; }
    const timer = window.setTimeout(() => setSceneElapsedMs((current) => Math.min(duration, current + Math.min(TICK_MS, remaining))), Math.min(TICK_MS, remaining));
    return () => window.clearTimeout(timer);
  }, [complete, nextScene, playing, questionAnswered, scene.durationSeconds, sceneElapsedMs]);

  if (complete) {
    return <main className="min-h-screen bg-gradient-to-b from-violet-700 via-fuchsia-700 to-sky-800 p-5 text-white"><section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center rounded-[2.5rem] border-4 border-yellow-300 bg-white/10 p-8 text-center shadow-2xl"><motion.div animate={animate ? { rotate: [0, 7, -7, 0], scale: [1, 1.08, 1] } : {}} transition={{ duration: 2.5, repeat: animate ? Infinity : 0 }} className="rounded-full bg-yellow-300 p-6 text-violet-900"><Sparkles size={56}/></motion.div><h1 className="mt-6 text-4xl font-black text-yellow-200">Science stars!</h1><p className="mt-4 max-w-lg text-lg font-bold">You finished {episode.title}. Keep asking why, observing carefully, and being kind to the world around you.</p><p className="mt-3 font-black">Be curious • Be kind • Be brave</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={restart} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-300 px-5 font-black text-violet-950"><RotateCcw size={18}/> Watch again</button><button type="button" onClick={onExit} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-5 font-black ring-2 ring-white/70"><ArrowLeft size={18}/> More cartoons</button></div></section></main>;
  }

  const positions = scene.characterAssets.length === 3 ? ['left-2 sm:left-8', 'right-2 sm:right-8', 'left-1/2 -translate-x-1/2'] : ['left-2 sm:left-8', 'right-2 sm:right-8'];

  return <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-5"><section data-testid="cartoon-episode-player" className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border-4 border-white/80 bg-slate-900 shadow-2xl">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-slate-950 px-4 py-3"><button type="button" onClick={onExit} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black ring-1 ring-white/35"><ArrowLeft size={18}/> Cartoons</button><div className="text-center"><p className="text-sm font-black text-yellow-300 sm:text-lg">{episode.title}</p><p className="text-xs font-bold text-white/75">Ages 5–12 · Approx. {clock(episode.runtimeSeconds)}</p></div><button type="button" onClick={() => setCalmMode((value) => !value)} aria-pressed={calmMode || reducedMotion} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-black ring-1 ring-white/35"><Eye size={17}/>{calmMode || reducedMotion ? 'Calm motion' : 'Motion on'}</button></header>
    <section aria-label={`${scene.title}. ${scene.subtitle}`} className="relative aspect-[4/3] min-h-[28rem] overflow-hidden sm:aspect-video sm:min-h-[30rem]"><motion.img key={scene.id} src="/assets/cartoon/worlds/science.png" alt="" aria-hidden="true" initial={{opacity:0, scale:animate?1.12:1}} animate={animate?{opacity:.45, scale:1.02, x:[-6,6,-6]}:{opacity:.45, scale:1, x:0}} transition={{duration:animate?scene.durationSeconds:0, repeat:animate?Infinity:0, ease:'linear'}} className="absolute inset-0 h-full w-full object-cover"/><div className={`absolute inset-0 bg-gradient-to-br ${scene.colours} opacity-75 mix-blend-multiply`}/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-white/10"/>
      {animate && Array.from({length:6},(_, index)=><motion.span key={`${scene.id}-${index}`} className="absolute h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_16px_5px_rgba(253,224,71,0.5)]" initial={{left:`${12+index*15}%`,top:'88%',opacity:0}} animate={{top:['88%',`${10+(index%3)*17}%`],opacity:[0,1,0]}} transition={{duration:3.7+index*.2,repeat:Infinity,delay:index*.25}}/>) }
      <div className="absolute left-3 top-3 z-30 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-black">Scene {sceneIndex+1} of {episode.scenes.length}</div><div className="absolute right-3 top-3 z-30 rounded-full bg-emerald-400/90 px-3 py-1.5 text-xs font-black text-emerald-950">Science adventure</div>
      {scene.characterAssets.map((asset,index)=>asset.includes('archie-character-v2.png') ? <motion.div key={`${scene.id}-archie`} className={`absolute bottom-1 z-20 ${positions[index]}`} animate={animate?{y:[0,-8,0],x:[0,3,0]}:{}} transition={{duration:2.8,repeat:animate?Infinity:0}}><ArchieCharacter size={scene.characterAssets.length===3?104:138} speaking={playing&&scene.speaker==='Archie'}/></motion.div> : <motion.img key={`${scene.id}-${asset}`} src={asset} alt={`${scene.speaker}'s science friend`} className={`absolute bottom-2 z-20 h-28 w-28 object-contain drop-shadow-2xl sm:h-40 sm:w-40 ${positions[index]}`} initial={{opacity:0,scale:animate?.82:1}} animate={animate?{opacity:1,scale:[1,1.04,1],y:[0,-10,0],rotate:[-1,1,-1]}:{opacity:1,scale:1,y:0,rotate:0}} transition={{duration:animate?2.7:0,repeat:animate?Infinity:0,delay:index*.2}}/>) }
      <div className="absolute inset-x-3 bottom-3 z-40 rounded-2xl border border-white/25 bg-slate-950/85 px-4 py-3 text-center shadow-xl sm:inset-x-8 sm:bottom-5"><p className="text-[11px] font-black uppercase tracking-[.16em] text-yellow-300">{scene.speaker}</p><p className="mt-1 text-sm font-bold leading-relaxed sm:text-base" aria-live="polite">{scene.subtitle}</p></div>
    </section>
    <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 px-4 py-4 sm:px-6 sm:py-5"><h2 className="text-lg font-black text-yellow-200 sm:text-2xl">{scene.title}</h2><p className="mt-1 text-sm font-medium leading-relaxed text-white/90">{scene.narration}</p>{scene.safety&&<aside className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-100/10 px-4 py-3 text-sm font-bold text-amber-50"><span className="font-black text-amber-200">Safe science:</span> {scene.safety}</aside>}
      {scene.question&&<section className="mt-5 rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4 text-slate-900"><p className="font-black text-cyan-900">🧠 Pause and think: {scene.question.prompt}</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{scene.question.choices.map((choice,index)=>{const selected=index===answerIndex;return <button key={choice.label} type="button" disabled={answerIndex!==null} onClick={()=>selectAnswer(index)} className={`min-h-12 rounded-2xl border-2 px-3 py-2 text-sm font-black disabled:cursor-default ${selected&&choice.correct?'border-emerald-500 bg-emerald-500 text-white':selected?'border-rose-400 bg-rose-100 text-rose-800':'border-cyan-200 bg-white text-cyan-950 hover:border-cyan-400 hover:bg-cyan-100'}`}>{choice.label}</button>})}</div>{selectedChoice&&<div role="status" className={`mt-3 flex gap-2 rounded-2xl p-3 text-sm font-bold ${selectedChoice.correct?'bg-emerald-100 text-emerald-950':'bg-amber-100 text-amber-950'}`}><CheckCircle2 className="mt-.5 shrink-0" size={18}/><span>{selectedChoice.feedback}</span></div>}</section>}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15" aria-label="Episode progress"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-[width] duration-200" style={{width:`${Math.max(2,progress)}%`}}/></div><div className="mt-1 flex justify-between text-xs font-bold text-white/70"><span>{clock(Math.floor((secondsBefore*1000+sceneElapsedMs)/1000))}</span><span>{clock(episode.runtimeSeconds)}</span></div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3"><button type="button" onClick={()=>sceneIndex>0&&chooseScene(sceneIndex-1)} disabled={sceneIndex===0} aria-label="Previous scene" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black ring-1 ring-white/30 disabled:opacity-40"><ArrowLeft size={18}/> Back</button><button type="button" onClick={togglePlay} aria-label={playing?'Pause cartoon':'Play cartoon'} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-300 px-5 text-sm font-black text-slate-950">{playing?<Pause size={20}/>:<Play size={20}/>}{playing?'Pause':'Play'}</button><button type="button" onClick={()=>!muted&&ttsSpeak(`${scene.speaker}. ${scene.narration}`)} disabled={muted} aria-label="Read current scene aloud" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black ring-1 ring-white/30 disabled:opacity-40"><Volume2 size={18}/> Read</button><button type="button" onClick={()=>{if(!muted) stopTts();else spokenScene.current=null;setMuted(!muted)}} aria-pressed={!muted} aria-label={muted?'Turn audio narration on':'Mute audio narration'} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black ring-1 ring-white/30">{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}{muted?'Sound off':'Sound on'}</button><button type="button" onClick={nextScene} disabled={!questionAnswered} aria-label={questionAnswered?'Skip current scene':'Continue after answering the question'} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-indigo-500 px-4 text-sm font-black text-white disabled:opacity-45">{questionAnswered?'Skip scene':'Choose an answer'}<SkipForward size={18}/></button>{answerIndex!==null&&<button type="button" onClick={nextScene} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-black text-white">Continue<ChevronRight size={18}/></button>}<button type="button" onClick={restart} aria-label="Restart cartoon" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-black ring-1 ring-white/30"><RotateCcw size={18}/> Restart</button></div><p className="mt-3 text-center text-xs font-semibold text-white/70">Subtitles are on. Audio narration uses the device’s temporary computer voice and can be muted.</p>
    </section>
  </section></main>;
}
