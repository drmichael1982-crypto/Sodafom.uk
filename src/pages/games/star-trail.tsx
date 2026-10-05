import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';
import { useVoice } from '@/lib/voice-context';
import { listenForGameAnswer, normaliseVoiceAnswer } from '@/lib/archie/game-voice';

type Tier = 1 | 2 | 3;
export type TrailQuestion = { id:string; prompt:string; options:{id:string;label:string}[];answerId:string;hint:string;explanation:string };
const STEPS = [2,3,1,3,2,3,1,2];
export const TRAIL_BRIDGES:Record<number,number> = {6:10,13:16};
export const TRAIL_END = 24;
function q(id:string,prompt:string,right:string,wrong:[string,string],hint:string,explanation:string,rotation:number):TrailQuestion {
  const options=[right,...wrong].map((label,index)=>({id:id+'-choice-'+index,label}));
  for(let index=0;index<rotation%3;index++)options.unshift(options.pop()!);
  return {id,prompt,options,answerId:id+'-choice-0',hint,explanation};
}
export const TRAIL_QUESTIONS:Record<Tier,TrailQuestion[]> = {
  1:[
    q('trail-young-add','3 stars and 1 more star. How many stars?','4',['3','5'],'Start at 3. Count one more.','3 + 1 = 4. Counting on one takes us to the next number.',0),
    q('trail-young-count','Count the stars: ★ ★ ★ ★ ★','5',['4','6'],'Point to each star once as you count.','There are five stars. Count each star once: 1, 2, 3, 4, 5.',1),
    q('trail-young-subtract','6 stepping stones. We pass 2. How many are left?','4',['2','6'],'Draw six dots and cross out two.','6 − 2 = 4. Four stepping stones are left.',2),
    q('trail-young-shape','Which shape has three straight sides?','Triangle',['Square','Circle'],'Think of the shape with three corners.','A triangle has three straight sides and three corners.',0),
    q('trail-young-bond','4 stars and how many more make 10?','6',['4','5'],'Count on from 4 until you reach 10.','4 + 6 = 10. Six more stars complete the group of ten.',1),
    q('trail-young-half','Share 8 stars equally into two groups. How many in each?','4',['2','6'],'Deal one star to each group in turn.','Two equal groups of four make eight. Half of 8 is 4.',2),
    q('trail-young-order','What comes after 9 when counting by ones?','10',['8','11'],'Say 8, 9, then the next number.','Counting forwards by one after 9 gives 10.',0),
    q('trail-young-add2','5 stars join 2 stars. How many altogether?','7',['6','8'],'Start at five and count on two.','5 + 2 = 7. Count on: six, seven.',1),
  ],
  2:[
    q('trail-middle-times','6 groups of 4 stars. How many stars?','24',['20','28'],'Use the four times table or draw six groups.','6 × 4 = 24. Six equal groups of four make twenty-four.',0),
    q('trail-middle-quarter','What is one quarter of 20 stars?','5',['4','10'],'Share 20 into four equal groups.','20 ÷ 4 = 5. One of the four equal groups has five stars.',1),
    q('trail-middle-place','In 342, what is the value of the digit 4?','40',['4','400'],'The 4 is in the tens column.','The digit 4 represents four tens, so its value is 40.',2),
    q('trail-middle-perimeter','A rectangle is 5 m long and 3 m wide. What is its perimeter?','16 m',['8 m','15 m'],'Add the lengths of all four sides.','5 + 3 + 5 + 3 = 16 m. Perimeter is the distance around the outside.',0),
    q('trail-middle-time','How many minutes are in two hours?','120',['100','60'],'An hour has sixty minutes.','2 × 60 = 120 minutes.',1),
    q('trail-middle-fraction','Which fraction is the same amount as 2/4?','1/2',['1/4','3/4'],'Split a whole into four equal parts and shade two.','Two quarters cover half the whole: 2/4 = 1/2.',2),
    q('trail-middle-divide','24 stars shared equally between 3 teams. How many per team?','8',['6','9'],'Use a three times table fact that makes 24.','24 ÷ 3 = 8. Three groups of eight make twenty-four.',0),
    q('trail-middle-money','You have 100p and spend 35p. How much is left?','65p',['75p','55p'],'Count on from 35 to 100, or subtract 35.','100 − 35 = 65p. Check: 35p + 65p = 100p.',1),
  ],
  3:[
    q('trail-older-percent','What is 30% of 80?','24',['30','26'],'Find ten per cent, then multiply it by three.','10% of 80 is 8. Three lots of 8 make 24.',0),
    q('trail-older-ratio','Red:blue stars are in the ratio 2:3. There are 25 altogether. How many red?','10',['15','5'],'There are five ratio parts. Find the size of one part.','25 ÷ 5 = 5 per part. Red has two parts, so 2 × 5 = 10.',1),
    q('trail-older-algebra','Solve 3x + 2 = 20. What is x?','6',['8','9'],'Undo adding two, then undo multiplying by three.','20 − 2 = 18; 18 ÷ 3 = 6. Check: 3 × 6 + 2 = 20.',2),
    q('trail-older-negative','What is −4 + 9?','5',['−13','13'],'Move nine steps right from minus four on a number line.','From −4, four steps reach zero and five more reach 5.',0),
    q('trail-older-fraction','What is 3/4 − 1/4?','1/2',['1/4','3/8'],'Subtract the numerators because the parts have equal size.','3/4 − 1/4 = 2/4 = 1/2. Two quarters make one half.',1),
    q('trail-older-square','What is 5² + 3²?','34',['16','64'],'Square each number separately, then add.','5² = 25 and 3² = 9. Their sum is 34.',2),
    q('trail-older-mean','What is the mean of 6, 8 and 10?','8',['9','24'],'Add the three values and divide by three.','6 + 8 + 10 = 24. Then 24 ÷ 3 = 8.',0),
    q('trail-older-area','A triangle has base 6 cm and perpendicular height 4 cm. What is its area?','12 cm²',['24 cm²','10 cm²'],'A triangle has half the area of the matching rectangle.','Area = ½ × 6 × 4 = 12 cm².',1),
  ],
};

export function moveAlongTrail(position:number,steps:number):{position:number;bridgeFrom?:number} {
  const landing=Math.min(TRAIL_END,Math.max(0,position+Math.max(0,steps)));
  return TRAIL_BRIDGES[landing] ? {position:TRAIL_BRIDGES[landing],bridgeFrom:landing} : {position:landing};
}
const BOARD_ORDER=Array.from({length:6},(_,row)=>{
  const level=5-row;const spaces=Array.from({length:4},(_,column)=>level*4+column+1);
  return level%2?spaces.reverse():spaces;
}).flat();

export function StarTrailPlay({onComplete,onQuestionChange}:{onComplete:(result:GameResult)=>void;onQuestionChange?:(question:string,options:string[])=>void}) {
  const {tier}=useChildAge();const {speak,stop}=useVoice();
  const [round,setRound]=useState(0);const [position,setPosition]=useState(0);const [rolled,setRolled]=useState(false);
  const [solved,setSolved]=useState(false);const [hadMistake,setHadMistake]=useState(false);const [firstTry,setFirstTry]=useState(0);
  const [hint,setHint]=useState(false);const [paused,setPaused]=useState(false);const [feedback,setFeedback]=useState('');const [completed,setCompleted]=useState(false);
  const clueHeading=useRef<HTMLHeadingElement>(null);
  const routeButton=useRef<HTMLButtonElement>(null);
  const pendingFocus=useRef<'clue'|'route'|null>(null);
  useEffect(()=>{
    const target=pendingFocus.current==='clue'?clueHeading.current:pendingFocus.current==='route'?routeButton.current:null;
    if(target){pendingFocus.current=null;target.focus();}
  },[rolled,round,completed]);
  const completionSent=useRef(false);const question=TRAIL_QUESTIONS[tier][round];const steps=STEPS[round];
  useEffect(()=>{onQuestionChange?.(question.prompt,question.options.map(item=>item.label));},[question,onQuestionChange]);
  useEffect(()=>()=>stop(),[stop]);
  function chooseAnswer(id:string){if(paused||!rolled||solved)return;if(id===question.answerId){setSolved(true);if(!hadMistake)setFirstTry(value=>value+1);setFeedback('You found the trail clue! '+question.explanation);}else{setHadMistake(true);setHint(true);setFeedback('Good try. Use the hint and try this same clue again. Your explorer stays safe.');}}
  useEffect(()=>listenForGameAnswer('Star Trail',text=>{
    if(paused||!rolled||solved||completed)return undefined;
    const answer=normaliseVoiceAnswer(text);const option=question.options.find(item=>normaliseVoiceAnswer(item.label)===answer);
    if(!option)return undefined;chooseAnswer(option.id);
    return option.id===question.answerId?'You found the trail clue! '+question.explanation:'Good try. '+question.hint+' Try this same clue again.';
  }),[question,paused,rolled,solved,completed,hadMistake]);
  function reveal(event:MouseEvent<HTMLButtonElement>){if(event.currentTarget===document.activeElement)pendingFocus.current='clue';setRolled(true);setFeedback('');}
  function move(event:MouseEvent<HTMLButtonElement>){if(paused||!solved)return;if(event.currentTarget===document.activeElement)pendingFocus.current=round===STEPS.length-1?'clue':'route';stop();const next=moveAlongTrail(position,steps);setPosition(next.position);setFeedback(next.bridgeFrom?'A friendly bridge carries you from '+next.bridgeFrom+' to '+next.position+'.':'You discovered star space '+next.position+'.');if(round===STEPS.length-1){setCompleted(true);return;}setRound(value=>value+1);setRolled(false);setSolved(false);setHadMistake(false);setHint(false);}
  function finish(){if(completionSent.current)return;completionSent.current=true;const score=Math.round(firstTry/STEPS.length*100);onComplete({score,correct:firstTry,total:STEPS.length,stars:score>=90?3:score>=60?2:1});}
  return <section className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-yellow-50" aria-label="Star Trail board adventure">
    <h2 className="text-2xl sm:text-3xl font-black text-center text-blue-950 mb-2">Star Trail · the friendly bridge adventure</h2>
    <p className="text-center text-base mb-4">Follow a winding path through our imaginary star garden. Solve eight clues. Bridges help you forwards; a mistake is a chance to try again.</p>
    <div className="flex justify-between flex-wrap gap-3 font-bold mb-4"><span>Clue {Math.min(round+1,8)} of 8 · {firstTry} first-try answers</span><button type="button" className="min-h-11 px-4 py-2 rounded-xl bg-white border-2 border-blue-300" onClick={()=>{stop();setPaused(value=>!value);}}>{paused?'Resume trail':'Take a trail break'}</button></div>
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div><p role="status" className="font-bold text-center mb-3">Your explorer: {position===0?'the starting camp':'space '+position+' of '+TRAIL_END}</p>
        <div role="img" aria-label={'Winding star trail with 24 spaces. Explorer at '+position+'. Bridges from 6 to 10 and from 13 to 16.'} className="grid grid-cols-4 gap-2 p-2 sm:p-4 rounded-3xl border-4 border-white bg-blue-100 shadow-lg">
          {BOARD_ORDER.map(space=><div key={space} aria-hidden="true" className={'min-h-16 min-w-0 rounded-xl p-2 flex flex-col items-center justify-center font-black border-2 '+(position===space?'bg-yellow-300 border-blue-900':TRAIL_BRIDGES[space]?'bg-cyan-200 border-cyan-600':space===24?'bg-purple-200 border-purple-600':'bg-white border-blue-200')}><span>{space===position?'🚀':space===24?'🏕️':TRAIL_BRIDGES[space]?'🌉':'✦'} {space}</span>{TRAIL_BRIDGES[space]&&<small className="text-xs">→ {TRAIL_BRIDGES[space]}</small>}</div>)}
        </div><p className="text-sm mt-3 text-center">Camp → follow 1 to 24. Blue bridges are shortcuts. This is an eight-clue visit, with no timer.</p>
      </div>
      <div className="bg-white border-2 border-blue-200 rounded-3xl p-4 sm:p-6">
        {paused?<div role="status"><h3 className="text-xl font-black mb-3">Your explorer is resting</h3><p>Stretch or have a drink. The same clue and board will be here when you resume.</p></div>:completed?<><h3 ref={clueHeading} tabIndex={-1} className="text-2xl font-black mb-3 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-700">Star garden discovered!</h3><p>You solved all eight clues and reached space 24. {firstTry} were correct on your first try; retries were useful practice.</p><p className="my-4">Tell someone your favourite strategy. This is a good moment for a break.</p><button type="button" onClick={finish} className="min-h-12 w-full p-3 rounded-xl bg-primary text-primary-foreground font-black">Finish trail · see my stars</button></>:<>
          {!rolled?<><h3 className="text-xl font-black mb-3">Find your next route</h3><p className="mb-4">The star die has a planned path of one, two or three spaces. Solve the clue to move when you are ready.</p><button ref={routeButton} type="button" onClick={reveal} className="min-h-12 w-full p-3 rounded-xl bg-primary text-primary-foreground font-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-700">Reveal my star die</button></>:<><p className="font-black text-lg text-blue-800 mb-3">Star die: {steps} {steps===1?'space':'spaces'}</p><h3 ref={clueHeading} tabIndex={-1} className="text-xl font-black mb-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{question.prompt}</h3><div role="group" aria-label="Trail clue answers" className="grid gap-3">{question.options.map(option=><button type="button" key={option.id} data-answer-id={option.id} disabled={solved} onClick={()=>chooseAnswer(option.id)} className="min-h-12 p-3 rounded-xl bg-blue-700 text-white font-bold disabled:opacity-70">{option.label}</button>)}</div><div className="flex gap-2 flex-wrap mt-4"><button type="button" className="min-h-11 px-3 py-2 rounded-xl border-2 border-blue-200 font-bold" onClick={()=>speak('read:star-trail',question.prompt+'. '+question.options.map(item=>item.label).join('. '))}>Read the clue</button><button type="button" className="min-h-11 px-3 py-2 rounded-xl border-2 border-blue-200 font-bold" aria-expanded={hint} onClick={()=>setHint(value=>!value)}>{hint?'Hide trail hint':'Show trail hint'}</button></div>{hint&&<p className="p-4 bg-yellow-100 rounded-xl mt-4">{question.hint}</p>}{solved&&<button type="button" onClick={move} className="min-h-12 w-full p-3 rounded-xl bg-green-700 text-white font-black mt-4">Move {steps} {steps===1?'space':'spaces'}</button>}</>}
          <p role="status" aria-live="polite" className="mt-4 text-base">{feedback}</p>
        </>}
      </div>
    </div>
  </section>;
}

export default function StarTrailGame(){
  const [question,setQuestion]=useState('');const [options,setOptions]=useState<string[]>([]);
  const questionChange=useCallback((prompt:string,choices:string[])=>{setQuestion(prompt);setOptions(choices);},[]);
  return <><Helmet><title>Star Trail — Sodafom</title><meta name="description" content="An original friendly maths board adventure with bridges, hints and eight clues."/></Helmet><GameShell title="Star Trail" emoji="🌉" subject="maths" ageGroups={['5–7','8–10','11–13']} currentQuestion={question} currentOptions={options}>{onComplete=><StarTrailPlay onComplete={onComplete} onQuestionChange={questionChange}/>}</GameShell></>;
}
