import {useState,useCallback} from 'react';
import CompletionScene from './CompletionScene';
import {useVoice} from '@/lib/voice-context';
import './learning-jigsaw.css';
import FractionJigsaw from './FractionJigsaw';
type Mode='letters'|'sentence'|'maths'|'fractions';
export default function LearningJigsaw({text='Earth moves around the Sun.',year=1}:{text?:string;year?:number}){
 const [rewardOpen,setRewardOpen]=useState(false);
 const closeReward=useCallback(()=>setRewardOpen(false),[]);
 const [mode,setMode]=useState<Mode>('letters');const [round,setRound]=useState(0);const [placed,setPlaced]=useState<number[]>([]);const [notice,setNotice]=useState('Choose the next piece to build the picture.');const {speak}=useVoice();
 const sentence=text.split(/[.!?]/)[0].trim();const words=sentence.split(/\s+/);const word=words.filter(w=>/^[a-z]+$/i.test(w)&&w.length>3)[round%Math.max(1,words.filter(w=>/^[a-z]+$/i.test(w)&&w.length>3).length)]||'Earth';
 const a=2+round+Math.min(year,6);const b=1+round%5;const answer=a+b;
 const target=mode==='letters'?word.toUpperCase().split(''):mode==='sentence'?words:[String(answer)];
 const choices=mode==='maths'?[String(answer+2),String(answer),String(answer-1),String(answer+1)]:target;
 const order=choices.map((_,i)=>i).sort((i,j)=>((i*7+3)%choices.length)-((j*7+3)%choices.length));const complete=placed.length===target.length;
 function reset(next:Mode=mode){setRewardOpen(false);setMode(next);setPlaced([]);setNotice('Choose the next piece to build the picture.');}
 function pick(id:number){if(complete||placed.includes(id))return;if(choices[id]!==target[placed.length]){setNotice('That piece does not fit yet. Try another answer.');return;}const next=[...placed,id];setPlaced(next);if(next.length===target.length)setRewardOpen(true);setNotice(next.length===target.length?'Well done! You built the picture.':'It fits! Choose the next piece.');}
 const prompt=mode==='maths'?`${a} + ${b} = ?`:mode==='letters'?`Spell ${word}`:`Build this sentence: ${sentence}`;
 return <section className="learning-jigsaw" aria-label="Picture learning jigsaws">{rewardOpen&&<CompletionScene kind={mode==='maths'?'maths':'words'} onClose={closeReward}/>}<h2>Build a picture, learn a little</h2><div className="learning-jigsaw-tabs">{(['letters','sentence','maths','fractions'] as Mode[]).map(m=><button type="button" key={m} aria-pressed={mode===m} onClick={()=>reset(m)}>{m==='letters'?'Spelling pieces':m==='sentence'?'Sentence pieces':m==='fractions'?'Fractions':'Maths pieces'}</button>)}</div>{mode==='fractions'?<FractionJigsaw year={year}/>:<><p>{prompt}</p><button type="button" onClick={()=>speak('jigsaw-prompt',prompt)}>Read the clue aloud</button><p className="jigsaw-instruction">Tap the correct pieces in order. Each piece reveals more of the picture.</p><div className="learning-picture" style={{gridTemplateColumns:`repeat(${target.length},minmax(0,1fr))`}} aria-label="Your completed picture">{target.map((_,i)=><span key={i} className={i<placed.length?'learning-picture-fit':'learning-picture-gap'} style={{backgroundSize:`${target.length*100}% 100%`,backgroundPosition:`${target.length===1?0:i/(target.length-1)*100}% center`}}><b>{i<placed.length?target[i]:i+1}</b></span>)}</div><div className="learning-pieces">{order.map(id=><button key={id} type="button" aria-label={`Piece ${id+1}: ${choices[id]}`} disabled={complete||placed.includes(id)} onClick={()=>pick(id)}>{choices[id]}</button>)}</div><p aria-live="polite">{notice}</p>{complete&&<button type="button" onClick={()=>setRewardOpen(true)}>See my moving reward again</button>}<button type="button" onClick={()=>{setRound(r=>r+1);reset();}}>Next puzzle</button><button type="button" onClick={()=>reset()}>Start again</button></>}</section>;
}
