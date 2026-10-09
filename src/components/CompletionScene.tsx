import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './completion-scene.css';
import { useVoice } from '@/lib/voice-context';
import { useArchieData } from '@/lib/archie/storage';
import { readLearningAge, experienceBand } from './AgeExperience';

/** A completion reward; never mounted for an incorrect or partial answer. */
export default function CompletionScene({ kind, onClose }: { kind: 'words' | 'maths' | 'science' | 'art'; onClose: () => void }) {
  const title=kind==='words'?'Your word world is alive!':kind==='maths'?'Your rocket is ready!':kind==='science'?'Your discovery is alive!':'Your colours are dancing!';
  const message=kind==='words'?'You built the words. Now explore Archie’s moving world!':kind==='maths'?'You solved the maths. Watch your rocket launch!':kind==='science'?'You completed your discovery. Watch your science world move!':'You completed your art. Watch the colours dance!';
  const { speak, stop }=useVoice();
  const { settings }=useArchieData();
  const band=experienceBand(readLearningAge(),settings.year);
  const word=band==='starter'?'SUN':band==='explorer'?'SPACE':'PLANET';
  const [wordStep,setWordStep]=useState(0);
  const [sceneRound,setSceneRound]=useState(0);
  const [explored,setExplored]=useState(false);
  const [feedback,setFeedback]=useState('Choose an answer to bring your scene to life.');
  const nextLetter=word[wordStep];
  const activities={
    words:{question:`Build ${word}: ${word.slice(0,wordStep)} _`,choices:[nextLetter,...['A','E','R','M','T'].filter(letter=>letter!==nextLetter).slice(0,2)],answer:nextLetter,fact:`${word}! You built the word one letter at a time.`},
    maths:band==='starter'?{question:'Count the stars: ★ ★ ★ ★ ★',spoken:'Count five stars. How many stars are there?',choices:['4','5','6'],answer:'5',fact:'Five stars! Your counting launched the rocket.'}:band==='explorer'?{question:'24 ÷ 4 = ?',choices:['4','6','8'],answer:'6',fact:'24 divided into four equal groups makes six in each group.'}:{question:'7 × 8 = ?',choices:['54','56','64'],answer:'56',fact:'Seven groups of eight make fifty-six.'},
    science:band==='challenger'?{question:'What keeps planets in orbit around the Sun?',choices:['Gravity','Wind','Sound'],answer:'Gravity',fact:'Gravity pulls planets towards the Sun while they travel around it.'}:band==='explorer'?{question:'Which planet is our home?',choices:['Mars','Earth','Venus'],answer:'Earth',fact:'Earth is our home planet. It travels around the Sun.'}:{question:'Which one gives Earth light and warmth?',choices:['The Moon','The Sun','Mars'],answer:'The Sun',fact:'The Sun is a star. It gives Earth light and warmth.'},
    art:band==='starter'?{question:'Mix blue and yellow paint. What colour do you make?',choices:['Green','Purple','Orange'],answer:'Green',fact:'Blue and yellow paint mix to make green.'}:band==='explorer'?{question:'Mix red and yellow paint. What colour do you make?',choices:['Green','Purple','Orange'],answer:'Orange',fact:'Red and yellow paint mix to make orange.'}:{question:'Mix red and blue paint. What colour do you make?',choices:['Green','Purple','Orange'],answer:'Purple',fact:'Red and blue paint mix to make purple.'},
  };
  const activity=activities[kind];
  function explore(answer:string){
    if(answer!==activity.answer){setFeedback('Good try! Look again and choose another answer.');speak('read:scene-feedback','Good try! Look again and choose another answer.');return;}
    if(kind==='words'&&wordStep<word.length-1){setWordStep(value=>value+1);setFeedback('That letter fits! Choose the next letter.');speak('read:scene-feedback','That letter fits! Choose the next letter.');return;}
    setExplored(true);setFeedback(activity.fact);speak('read:scene-feedback',activity.fact);setSceneRound(value=>value+1);
  }
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(()=>()=>stop(),[stop]);
  const root = useRef<HTMLElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if(!query)return;
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus(); else document.querySelector<HTMLElement>('[data-reward-return]')?.focus(); };
  }, [onClose]);
  return createPortal(<section ref={root} className={`completion-scene scene-${kind} ${paused || reduced ? 'scene-paused' : ''} ${explored?'scene-explored':''}`} role="dialog" aria-modal="true" aria-labelledby="moving-scene-title">
    <header><div><span>Puzzle complete!</span><h1 id="moving-scene-title">{title}</h1></div><button ref={close} type="button" onClick={onClose}>Back to puzzle</button></header>
    <div key={sceneRound} className="completion-scene-art" aria-hidden="true">{explored&&<div className="scene-learning-result">{kind==='words'?word.split('').join(' '):kind==='maths'?activity.answer+' ★':kind==='science'?'☀ → 🌍':activity.answer}</div>}<div className="reward-sparkles">✦ · ★ · ✦ · ★</div>{kind === 'maths' ? <div className="reward-rocket">🚀</div> : kind==='science'?<div className="reward-atom">⚛</div>:kind==='art'?<div className="reward-colours">🎨 🌈</div>:<><div className="reward-butterfly butterfly-one">🦋</div><div className="reward-butterfly butterfly-two">🦋</div><div className="reward-balloon">🎈</div></>}</div>
    <footer><div className="scene-learning-controls"><strong>Play with your scene</strong>{!explored&&<><p>{activity.question}</p><button type="button" onClick={()=>speak('read:scene-question', ('spoken' in activity?activity.spoken:activity.question) + '. '+activity.choices.join('. '))}>Hear the question</button><div className="scene-answer-choices">{activity.choices.map(answer=><button type="button" key={answer} onClick={()=>explore(answer)}>{answer}</button>)}</div></>}<p role="status">{feedback}</p>{explored&&<button type="button" onClick={()=>{setExplored(false);setWordStep(0);setFeedback('Choose an answer to bring your scene to life.');}}>Play with the scene again</button>}</div><p>{message}</p><button type="button" disabled={reduced} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{reduced ? 'Still scene' : paused ? 'Resume scene' : 'Pause scene'}</button>{reduced && <small>Your motion setting keeps this reward still.</small>}</footer>
  </section>, document.body);
}
