import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoice } from '@/lib/voice-context';
import { useArchieData } from '@/lib/archie/storage';
import { ARCHIE_PREVIEW } from '@/lib/config';
import { listenForGameAnswer, normaliseVoiceAnswer } from '@/lib/archie/game-voice';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';

// ── Types ─────────────────────────────────────────────────────────────────────
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Fraction {
  label: string;
  numerator: number;
  denominator: number;
  slices: number;
  fill: number;
  description?: string;
}

// ── Safe record lookup (prevents object injection lint warnings) ──────────────
function safeGet<T>(record: Record<string, T>, key: string, fallback: T): T {
  const entry = Object.entries(record).find(([k]) => k === key);
  return entry ? (entry[1] as T) : fallback;
}

// ── Fraction sets by difficulty ───────────────────────────────────────────────
const FRACTIONS_EASY: Fraction[] = [
  { label: '½',  numerator: 1, denominator: 2, slices: 2, fill: 1, description: 'one half' },
  { label: '¼',  numerator: 1, denominator: 4, slices: 4, fill: 1, description: 'one quarter' },
  { label: '¾',  numerator: 3, denominator: 4, slices: 4, fill: 3, description: 'three quarters' },
  { label: '⅓',  numerator: 1, denominator: 3, slices: 3, fill: 1, description: 'one third' },
  { label: '⅔',  numerator: 2, denominator: 3, slices: 3, fill: 2, description: 'two thirds' },
  { label: '2/4', numerator: 2, denominator: 4, slices: 4, fill: 2, description: 'two quarters' },
];

const FRACTIONS_MEDIUM: Fraction[] = [
  { label: '⅛',  numerator: 1, denominator: 8, slices: 8, fill: 1 },
  { label: '⅜',  numerator: 3, denominator: 8, slices: 8, fill: 3 },
  { label: '⅝',  numerator: 5, denominator: 8, slices: 8, fill: 5 },
  { label: '⅞',  numerator: 7, denominator: 8, slices: 8, fill: 7 },
  { label: '2/6', numerator: 2, denominator: 6, slices: 6, fill: 2 },
  { label: '4/6', numerator: 4, denominator: 6, slices: 6, fill: 4 },
  { label: '5/6', numerator: 5, denominator: 6, slices: 6, fill: 5 },
  { label: '3/5', numerator: 3, denominator: 5, slices: 5, fill: 3 },
  { label: '2/5', numerator: 2, denominator: 5, slices: 5, fill: 2 },
  { label: '4/5', numerator: 4, denominator: 5, slices: 5, fill: 4 },
];

const FRACTIONS_HARD: Fraction[] = [
  { label: '3/9',  numerator: 3, denominator: 9, slices: 9, fill: 3 },
  { label: '6/9',  numerator: 6, denominator: 9, slices: 9, fill: 6 },
  { label: '7/9',  numerator: 7, denominator: 9, slices: 9, fill: 7 },
  { label: '2/10', numerator: 2, denominator: 10, slices: 10, fill: 2 },
  { label: '4/10', numerator: 4, denominator: 10, slices: 10, fill: 4 },
  { label: '7/10', numerator: 7, denominator: 10, slices: 10, fill: 7 },
  { label: '9/10', numerator: 9, denominator: 10, slices: 10, fill: 9 },
  { label: '5/12', numerator: 5, denominator: 12, slices: 12, fill: 5 },
  { label: '7/12', numerator: 7, denominator: 12, slices: 12, fill: 7 },
  { label: '11/12', numerator: 11, denominator: 12, slices: 12, fill: 11 },
];

export const FRACTION_SETS: Record<Difficulty, Fraction[]> = {
  'Easy':   FRACTIONS_EASY,
  'Medium': FRACTIONS_MEDIUM,
  'Hard':   FRACTIONS_HARD,
};

const TOTAL_ROUNDS = 10;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  'Easy':   'bg-green-100 text-green-700 border-green-300',
  'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Hard':   'bg-red-100 text-red-700 border-red-300',
};

function PizzaSlice({total,index,selected,onClick}:{total:number;index:number;selected:boolean;onClick:()=>void}) {
  const angle=360/total;const start=(index*angle-90)*Math.PI/180;const end=start+angle*Math.PI/180;
  return <path d={'M100 100 L'+(100+80*Math.cos(start))+' '+(100+80*Math.sin(start))+' A80 80 0 '+(angle>180?1:0)+' 1 '+(100+80*Math.cos(end))+' '+(100+80*Math.sin(end))+' Z'} fill={selected?'#f97342':'#ffe5a3'} stroke="#78350f" strokeWidth="2" onClick={onClick} className="cursor-pointer"/>;
}
export function fractionExplanation(numerator:number,denominator:number):string {
  let a=numerator,b=denominator;while(b){const next=a%b;a=b;b=next;}
  const equivalent=a>1?' That is also '+(numerator/a)+'/'+(denominator/a)+' of the whole.':'';
  return 'The whole pizza has '+denominator+' equal slices. You shaded '+numerator+', so the fraction is '+numerator+'/'+denominator+'.'+equivalent;
}
function DifficultyPicker({onSelect}:{onSelect:(difficulty:Difficulty)=>void}) {
  return <section className="p-5 w-full max-w-md mx-auto text-center"><h2 className="text-2xl font-black mb-4">Choose your pizza challenge</h2><p className="mb-4">Every recipe has equal slices. Take your time.</p><div className="grid gap-3">{(['Easy','Medium','Hard'] as Difficulty[]).map(value=><button type="button" key={value} onClick={()=>onSelect(value)} className={'min-h-14 p-4 rounded-2xl border-2 font-bold '+DIFFICULTY_COLORS[value]}>{value} · {value==='Easy'?'halves, quarters and thirds':value==='Medium'?'fifths, sixths and eighths':'ninths, tenths and twelfths'}</button>)}</div></section>;
}

export function FractionPizzaPlay({onComplete,difficulty,year,onQuestionChange}:{onComplete:(result:GameResult)=>void;difficulty:Difficulty;year?:number;onQuestionChange?:(question:string,options:string[])=>void}) {
  const {speak,stop}=useVoice();
  const pool=difficulty==='Easy'&&year===1?FRACTION_SETS.Easy.filter(item=>item.numerator===1&&(item.denominator===2||item.denominator===4)):FRACTION_SETS[difficulty];
  const [recipes]=useState(()=>[...pool].sort(()=>Math.random()-0.5));
  const [round,setRound]=useState(0);const [correct,setCorrect]=useState(0);
  const [selected,setSelected]=useState<number[]>([]);const [feedback,setFeedback]=useState<'correct'|'wrong'|null>(null);
  const [hadMistake,setHadMistake]=useState(false);const [hint,setHint]=useState(false);const [paused,setPaused]=useState(false);
  const completionSent=useRef(false);const frac=recipes[round%recipes.length];
  const prompt='Can you make '+frac.numerator+'/'+frac.denominator+' of a pizza with '+frac.denominator+' equal slices?';
  useEffect(()=>{onQuestionChange?.(prompt,Array.from({length:frac.slices},(_,index)=>'Slice '+(index+1)));},[prompt,frac.slices,onQuestionChange]);
  useEffect(()=>()=>stop(),[stop]);
  function toggleSlice(index:number){if(paused||feedback==='correct')return;setSelected(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index]);setFeedback(null);}
  function checkAnswer(){if(paused||feedback==='correct')return;if(selected.length===frac.fill){setFeedback('correct');if(!hadMistake)setCorrect(previous=>previous+1);}else{setFeedback('wrong');setHadMistake(true);setHint(true);}}
  useEffect(()=>listenForGameAnswer('Fraction Pizza',text=>{
    if(paused||feedback==='correct')return undefined;
    const match=normaliseVoiceAnswer(text).match(/^slice (.+)$/);if(!match)return undefined;
    const number=Number(normaliseVoiceAnswer(match[1]));if(!Number.isInteger(number)||number<1||number>frac.slices)return undefined;
    const removing=selected.includes(number-1);const count=selected.length+(removing?-1:1);toggleSlice(number-1);
    return 'Slice '+number+' '+(removing?'unshaded':'shaded')+'. '+count+' of '+frac.denominator+' slices are shaded. Choose Serve my pizza when your recipe is ready.';
  }),[selected,paused,feedback,frac.slices,frac.denominator]);
  function nextOrder(){if(paused||feedback!=='correct'||completionSent.current)return;stop();if(round+1===TOTAL_ROUNDS){completionSent.current=true;const score=Math.round(correct/TOTAL_ROUNDS*100);onComplete({score,correct,total:TOTAL_ROUNDS,stars:score>=90?3:score>=75?2:1});}else{setRound(previous=>previous+1);setSelected([]);setFeedback(null);setHadMistake(false);setHint(false);}}
  return <section className="flex-1 w-full max-w-3xl mx-auto p-3 sm:p-6 bg-gradient-to-b from-orange-50 to-background text-center" aria-label="Fraction Pizza kitchen">
    <div className="flex justify-between flex-wrap gap-2 font-bold text-sm mb-3"><span>Order {round+1} of {TOTAL_ROUNDS} · {difficulty}</span><span>{correct} first-try orders</span></div>
    <progress className="w-full h-4 mb-4" aria-label="Pizza orders completed" max={TOTAL_ROUNDS} value={round+(feedback==='correct'?1:0)}/>
    <h2 className="text-2xl font-black mb-2">A pizza for the star picnic</h2><p className="text-base mb-3">{prompt} Tap the equal slices to answer.</p>
    <p className="text-4xl font-black mb-1">{frac.label}</p><p className="text-base mb-3">{frac.description||frac.numerator+' out of '+frac.denominator+' equal parts'}</p>
    <div className="flex justify-center flex-wrap gap-2 mb-4"><button type="button" className="min-h-12 p-3 rounded-xl bg-white border-2 border-orange-300 font-bold" onClick={()=>speak('read:fraction-pizza',prompt)}>Read my order</button><button type="button" className="min-h-12 p-3 rounded-xl bg-white border-2 border-orange-300 font-bold" onClick={()=>setHint(value=>!value)} aria-expanded={hint}>{hint?'Hide recipe hint':'Show recipe hint'}</button><button type="button" className="min-h-12 p-3 rounded-xl bg-white border-2 border-orange-300 font-bold" onClick={()=>{stop();setPaused(value=>!value);}}>{paused?'Resume kitchen':'Take a breather'}</button></div>
    {paused?<div role="status" className="p-6 bg-white rounded-2xl"><h3 className="text-xl font-black">Your pizza is safe</h3><p>Stretch or look away. Resume when you are ready.</p></div>:<>
      {hint&&<p className="p-4 bg-yellow-100 rounded-xl text-base mb-4">The bottom number, {frac.denominator}, tells us the total equal slices. The top number, {frac.numerator}, tells us how many to shade.</p>}
      <svg viewBox="0 0 200 200" role="img" aria-label={'Pizza with '+frac.denominator+' equal slices; '+selected.length+' shaded'} style={{width:'min(100%,280px)',height:'auto',margin:'0 auto'}}><circle cx="100" cy="100" r="85" fill="#d97706"/>{Array.from({length:frac.slices},(_,index)=><PizzaSlice key={index} total={frac.slices} index={index} selected={selected.includes(index)} onClick={()=>toggleSlice(index)}/>)}<circle cx="100" cy="100" r="6" fill="#78350f" pointerEvents="none"/></svg>
      <p role="status" aria-label="Pizza slice count" aria-atomic="true" className="font-bold my-3">{selected.length} of {frac.denominator} slices shaded</p>
      <p className="text-sm mb-3">Tap the pizza or use these large slice buttons.</p><div role="group" aria-label="Choose pizza slices" className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-xl mx-auto mb-4">{Array.from({length:frac.slices},(_,index)=><button type="button" key={index} aria-label={'Slice '+(index+1)} aria-pressed={selected.includes(index)} disabled={feedback==='correct'} onClick={()=>toggleSlice(index)} className={'min-w-11 min-h-12 p-2 rounded-xl border-2 font-bold '+(selected.includes(index)?'bg-orange-600 border-orange-800 text-white':'bg-white border-orange-300 text-orange-950')}>{index+1}{selected.includes(index)?' ✓':''}</button>)}</div>
      <div role="status" aria-live="polite" className="mb-4 text-base">{feedback==='wrong'&&<p className="font-bold text-blue-900">Good try. {selected.length>frac.fill?'Unshade a few slices':'Shade a few more slices'}, then try serving again. Your order is still here.</p>}{feedback==='correct'&&<><p className="text-xl font-black text-green-700">🍕 Picnic pizza ready!</p><p className="mt-2">{fractionExplanation(frac.numerator,frac.denominator)}</p><p className="mt-2 text-sm">{hadMistake?'You adjusted your recipe and solved it. Useful practice!':'You served this order on your first try.'}</p></>}</div>
      <div className="flex gap-3 flex-wrap justify-center"><button type="button" onClick={()=>{setSelected([]);setFeedback(null);}} disabled={feedback==='correct'} className="min-h-12 px-5 py-3 rounded-xl bg-white border-2 border-orange-300 font-bold disabled:opacity-50">Clear slices</button><button type="button" onClick={checkAnswer} disabled={feedback==='correct'||selected.length===0} className="min-h-12 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black disabled:opacity-50">Serve my pizza</button>{feedback==='correct'&&<button type="button" onClick={nextOrder} className="min-h-12 px-6 py-3 rounded-xl bg-green-700 text-white font-black">{round+1===TOTAL_ROUNDS?'Finish picnic · see my stars':'Next picnic order'}</button>}</div>
    </>}
  </section>;
}

export function FractionPizzaWithDifficulty({onComplete,onQuestionChange}:{onComplete:(result:GameResult)=>void;onQuestionChange:(question:string,options:string[])=>void}) {
  const {tier}=useChildAge();const {settings}=useArchieData();const [difficulty,setDifficulty]=useState<Difficulty|null>(null);
  useEffect(()=>{setDifficulty(tier===1?'Easy':tier===2?'Medium':'Hard');},[tier]);
  if(ARCHIE_PREVIEW){
    const selected=tier===1?'Easy':tier===2?'Medium':'Hard';
    return <FractionPizzaPlay key={selected+'-'+settings.year} onComplete={onComplete} difficulty={selected} year={settings.year} onQuestionChange={onQuestionChange}/>;
  }
  if(!difficulty)return <DifficultyPicker onSelect={setDifficulty}/>;
  return <><div className="p-3 text-center"><button type="button" className="min-h-11 px-4 py-2 rounded-xl bg-white border-2 border-orange-300 font-bold" onClick={()=>setDifficulty(null)}>Choose pizza challenge</button></div><FractionPizzaPlay key={difficulty+'-'+settings.year} onComplete={onComplete} difficulty={difficulty} year={ARCHIE_PREVIEW?settings.year:undefined} onQuestionChange={onQuestionChange}/></>;
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function FractionPizzaGame() {
  const [currentQuestion,setCurrentQuestion]=useState('');
  const [currentOptions,setCurrentOptions]=useState<string[]>([]);
  const questionChange=useCallback((question:string,options:string[])=>{setCurrentQuestion(question);setCurrentOptions(options);},[]);
  return (
    <>
      <Helmet>
        <title>Fraction Pizza — Sodafom | Fun Learning Games for Kids</title>
        <meta name="description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <link rel="canonical" href="https://sodafom.uk/games/fraction-pizza" />
        <meta property="og:title" content="Fraction Pizza — Sodafom" />
        <meta property="og:description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <meta property="og:url" content="https://sodafom.uk/games/fraction-pizza" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fraction Pizza — Sodafom" />
        <meta name="twitter:description" content="Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom." />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":"https://sodafom.uk/games/fraction-pizza#webpage","name":"Fraction Pizza — Sodafom","url":"https://sodafom.uk/games/fraction-pizza","description":"Learn fractions by making pizzas! A delicious maths game for children aged 8–13 on Sodafom.","isPartOf":{"@id":"https://sodafom.uk/#website"},"about":{"@id":"https://sodafom.uk/#organization"}})}</script>
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Fraction Pizza — Maths Game for Kids — Sodafom
      </h1>

      <GameShell title="Fraction Pizza" emoji="🍕" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={currentQuestion} currentOptions={currentOptions}>
        {(onComplete) => <FractionPizzaWithDifficulty onComplete={onComplete} onQuestionChange={questionChange} />}
      </GameShell>
    </>
  );
}
