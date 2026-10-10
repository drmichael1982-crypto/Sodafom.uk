import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import './AgeExperience.css';
import { useVoice } from '@/lib/voice-context';
import { useArchieData } from '@/lib/archie/storage';
import { readLearningAge, resolveLearningAge, saveLearningAge } from '@/lib/learning-age';

export { readLearningAge, resolveLearningAge, saveLearningAge } from '@/lib/learning-age';
export function experienceBand(age: number | null, year: number): 'starter' | 'explorer' | 'challenger' {
  if (age !== null) return age <= 7 ? 'starter' : age <= 9 ? 'explorer' : 'challenger';
  return year <= 3 ? 'starter' : year <= 5 ? 'explorer' : 'challenger';
}
const EXPERIENCES = {
  starter: { title: 'Little discoveries', label: 'Ages 5–7', intro: 'Listen, count and try one little step.', question: 'There are 3 stars. Add 2 more. How many?', choices: [4, 5, 6], answer: 5, hint: 'Start at 3. Count two more: 4, 5.', explanation: '3 + 2 = 5. You counted two extra stars!', links: [['Hear and spell', '/lesson', '🔤'], ['Read together', '/library', '📖'], ['Count and play', '/games', '⭐']] },
  explorer: { title: 'Discovery missions', label: 'Ages 8–9', intro: 'Spot a pattern, try a hint and explain your thinking.', question: 'Each rocket carries 4 explorers. How many in 3 rockets?', choices: [7, 12, 16], answer: 12, hint: 'Count three groups of 4: 4, 8, …', explanation: '4 + 4 + 4 = 12, so 3 × 4 = 12.', links: [['Learn a new skill', '/courses', '🧠'], ['Read an adventure', '/library', '📚'], ['Explore the world', '/world', '🌍']] },
  challenger: { title: 'Challenge lab', label: 'Ages 10–13', intro: 'Investigate, solve and tell Archie how you worked it out.', question: 'A probe travels 120 km in 3 hours at a steady speed. How far in 1 hour?', choices: [30, 40, 60], answer: 40, hint: 'Divide the total distance into 3 equal parts.', explanation: '120 ÷ 3 = 40. The probe travels 40 km each hour.', links: [['Subject missions', '/courses', '🔬'], ['Practise a challenge', '/games', '🎯'], ['History discoveries', '/history', '🏰']] },
} as const;

export default function AgeExperience({ year, askArchie, nickname }: { year: number; askArchie: () => void; nickname?: string }) {
  const age = resolveLearningAge();
  const band = experienceBand(age, year);
  return <ExperienceMission key={`${band}-${year}`} nickname={nickname} band={band} age={age} year={year} askArchie={askArchie}/>;
}
function ExperienceMission({ band, age, year, askArchie, nickname }: { nickname?: string; band: keyof typeof EXPERIENCES; age: number | null; year: number; askArchie: () => void }) {
  const experience = EXPERIENCES[band];
  const { complete, activities, settings } = useArchieData();
  const { speak } = useVoice();
  const missionNames = { space: 'Space maths', words: 'Sentence builder', fractions: 'Sharing fractions', story: 'Sequence and explain' };
  const completedMissions = (['space','words','fractions','story'] as const).filter(id=>activities.some(activity=>activity.id===`learn-${band}-${id}`));
  function recordMission(id: keyof typeof missionNames) { complete({id:`learn-${band}-${id}`,kind:'lesson',title:`${missionNames[id]} · ${experience.label}`,stars:1}); }
  const [mission, setMission] = useState<'space' | 'words' | 'fractions' | 'story'>('space');
  const [chosen, setChosen] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const correct = chosen === experience.answer;
  return <section className={`age-experience age-experience-${band}`} aria-labelledby="age-experience-title">
    <div className="age-experience-heading"><div><small>{age === null ? `Year ${year} presentation` : `Age ${age} · ${experience.label}`}</small><h2 id="age-experience-title">{experience.title}</h2></div><Link to="/parents">Grown-ups: change age</Link></div>
    {nickname && <p className="age-learner-greeting">Hello, {nickname}! Ready for your next discovery?</p>}
    <p>{experience.intro}</p>
    <nav className="age-experience-links" aria-label="Learning adventures">{experience.links.map(([title, path, icon]) => <Link key={path} to={path}><span aria-hidden="true">{icon}</span><strong>{title}</strong><span aria-hidden="true">→</span></Link>)}</nav>
    <p className="age-mission-progress"><strong>{completedMissions.length} / 4 mini missions saved</strong> · {experience.label}. One practice star per first completed mini mission in this age band. Replays help you practise.</p>
    <div className="age-game-picker" role="group" aria-label="Choose a learning mini game">{([['space',band==='starter'?'🚀 Count stars':band==='explorer'?'🚀 Groups of explorers':'🚀 Space speed'],['words',band==='starter'?'📝 Build a sentence':band==='explorer'?'📝 Describe a discovery':'📝 Make a contrast'],['fractions','🍕 Share a pizza'],['story',band==='challenger'?'🔬 Order an investigation':'🌱 Put the story in order']] as const).map(([id,title])=><button className="a-button" type="button" key={id} aria-pressed={mission===id} onClick={()=>setMission(id)}>{title}</button>)}</div>
    {mission==='story' && <SequenceMission band={band} onComplete={()=>recordMission('story')} askArchie={askArchie}/>}
    {mission==='words' && <SentenceMission band={band} askArchie={askArchie} onComplete={()=>recordMission('words')}/>}
    {mission==='fractions' && <FractionMission band={band} askArchie={askArchie} onComplete={()=>recordMission('fractions')}/>}
    {mission==='space' && <div className={`age-mission ${correct ? 'age-mission-complete' : ''}`}>
      <span className="age-mission-rocket" aria-hidden="true">🚀</span><h3>Try a space question</h3><p>{experience.question}</p>
      <div className="age-answer-options" aria-label="Choose your answer">{experience.choices.map(answer => <button className="a-button" type="button" key={answer} disabled={correct} aria-pressed={chosen === answer} onClick={() => {setChosen(answer);if(answer===experience.answer)recordMission('space');}}>{answer}</button>)}</div>
      <p role="status">{chosen === null ? 'Choose an answer. Take your time.' : correct ? `Well done! ${experience.explanation}` : 'Have another try. A hint can help.'}</p>
      {hint && !correct && <p className="age-mission-hint">{experience.hint}</p>}
      <div className="a-actions"><button className="a-button" type="button" disabled={!settings.sound} onClick={()=>speak('read:mini-mission',experience.question)}>Hear the space question</button>{!correct && <button className="a-button" type="button" onClick={() => setHint(true)}>Give me a hint</button>}<button className="a-button" type="button" onClick={askArchie}>Talk it through with Archie</button>{correct && <button className="a-button" type="button" onClick={() => { setChosen(null); setHint(false); }}>Try again</button>}</div>
    </div>}
  </section>;
}

const SENTENCES = {
  starter: { words: ['The', 'dog', 'can', 'run.'], order: [2, 0, 3, 1], hint: 'Start with The. Who can run? The dog.', fact: 'The dog can run. A sentence starts with a capital letter and ends with a full stop.' },
  explorer: { words: ['Archie', 'found', 'a', 'shiny', 'shell.'], order: [3, 1, 4, 0, 2], hint: 'Who found something? Start with Archie. Shiny describes the shell.', fact: 'Archie found a shiny shell. Shiny is an adjective: it describes the shell.' },
  challenger: { words: ['Although', 'it', 'rained,', 'we', 'explored', 'the', 'museum.'], order: [5, 2, 4, 0, 6, 1, 3], hint: 'Start with Although it rained, then say what we did.', fact: 'Although it rained, we explored the museum. Although introduces a contrast, and the comma separates the opening clause.' },
} as const;
function SentenceMission({band,askArchie,onComplete}:{band:keyof typeof EXPERIENCES;askArchie:()=>void;onComplete:()=>void}) {
  const puzzle=SENTENCES[band];
  const [selected,setSelected]=useState<number[]>([]);
  const [message,setMessage]=useState('Tap the words to build a sentence.');
  const [solved,setSolved]=useState(false);
  function check(){if(selected.length!==puzzle.words.length){setMessage('Add every word, then check your sentence.');return;}if(selected.every((value,index)=>value===index)){setSolved(true);setMessage(puzzle.fact);onComplete();}else setMessage('Read it aloud. Does it make sense? Undo a word or clear the sentence and try again.');}
  return <div className={`age-mission age-word-mission ${solved?'age-mission-complete':''}`}><span className="age-mission-rocket" aria-hidden="true">🦋</span><h3>Sentence builder</h3><p>{band==='starter'?'Tell us that the dog can run.':band==='explorer'?'Tell us that Archie found a shiny shell.':'Say that we explored the museum despite the rain.'}</p><div className="age-built-sentence" aria-label="Your sentence">{selected.length?selected.map(index=>puzzle.words[index]).join(' '):'Your words go here…'}</div><div className="age-word-bank" aria-label="Word pieces">{puzzle.order.map(index=><button className="a-button" key={index} type="button" disabled={solved||selected.includes(index)} onClick={()=>{setSelected(previous=>[...previous,index]);setMessage('Keep building, then check your sentence.');}}>{puzzle.words[index]}</button>)}</div><p role="status">{message}</p><div className="a-actions"><button className="a-button" type="button" disabled={solved} onClick={check}>Check sentence</button><button className="a-button" type="button" disabled={solved||!selected.length} onClick={()=>setSelected(previous=>previous.slice(0,-1))}>Undo last word</button><button className="a-button" type="button" onClick={()=>{setSelected([]);setSolved(false);setMessage('Tap the words to build a sentence.');}}>Clear sentence</button>{!solved&&<button className="a-button" type="button" onClick={()=>setMessage(puzzle.hint)}>Sentence hint</button>}<button className="a-button" type="button" onClick={askArchie}>Ask Archie about sentences</button></div></div>;
}
const FRACTIONS={starter:{total:2,target:1,label:'one half',fact:'1 out of 2 equal slices is one half: ½.'},explorer:{total:4,target:3,label:'three quarters',fact:'3 out of 4 equal slices is three quarters: ¾.'},challenger:{total:8,target:6,label:'three quarters, using eighths',fact:'6 out of 8 equal slices is the same as 3 out of 4: 6/8 = 3/4.'}} as const;
function FractionMission({band,askArchie,onComplete}:{band:keyof typeof EXPERIENCES;askArchie:()=>void;onComplete:()=>void}){
 const puzzle=FRACTIONS[band];const [selected,setSelected]=useState<number[]>([]);const [solved,setSolved]=useState(false);const [message,setMessage]=useState('Tap equal pizza slices to share the right amount.');
 return <div className={`age-mission age-fraction-mission ${solved?'age-mission-complete':''}`}><span className="age-mission-rocket" aria-hidden="true">🍕</span><h3>Share a pizza</h3><p>Give Archie {puzzle.label} of this pizza. It has {puzzle.total} equal slices.</p><div className="age-pizza" role="group" aria-label="Equal pizza slices" style={{'--pizza-slices':puzzle.total} as CSSProperties}>{Array.from({length:puzzle.total},(_,index)=><button type="button" key={index} aria-label={`Pizza slice ${index+1}`} aria-pressed={selected.includes(index)} disabled={solved} onClick={()=>{setSelected(previous=>previous.includes(index)?previous.filter(value=>value!==index):[...previous,index]);setMessage('Check when you have shared the right amount.');}}><span aria-hidden="true">🍕</span><small>{index+1}</small></button>)}</div><p>{selected.length} of {puzzle.total} slices selected</p><p role="status">{message}</p><div className="a-actions"><button className="a-button" type="button" disabled={solved} onClick={()=>{if(selected.length===puzzle.target){setSolved(true);setMessage(puzzle.fact);onComplete();}else setMessage(selected.length<puzzle.target?'A little more is needed. Tap another equal slice.':'That is more than Archie needs. Tap a selected slice to take it back.');}}>Check my sharing</button>{!solved&&<button className="a-button" type="button" onClick={()=>setMessage(band==='starter'?'A half is one of two equal parts.':band==='explorer'?'Three quarters means three of four equal parts.':'Half of 8 is 4. A quarter of 8 is 2. Add them to make three quarters.')}>Sharing hint</button>}<button className="a-button" type="button" onClick={()=>{setSelected([]);setSolved(false);setMessage('Tap equal pizza slices to share the right amount.');}}>Share again</button><button className="a-button" type="button" onClick={askArchie}>Ask Archie about fractions</button></div></div>;
}

const SEQUENCES={
 starter:{title:'Grow a flower',intro:'What happens first, next and last?',steps:[['🌱','Plant the seed.'],['💧','Water it and let it grow.'],['🌼','The flower opens.']],hint:'A flower needs a seed first. What helps that seed grow?',fact:'First we plant a seed. Next it gets water and grows. Then the flower opens.'},
 explorer:{title:'Plan a discovery trip',intro:'Help Archie make a sensible plan for a museum visit.',steps:[['🗺️','Choose a museum and check when it opens.'],['🚌','Travel to the museum.'],['🏛️','Explore the exhibits and discuss what you learned.']],hint:'Check where you are going before you travel. What can happen after you arrive?',fact:'Plan first, travel next, then explore. Planning ahead helps us make good use of a trip.'},
 challenger:{title:'Plan a fair investigation',intro:'Archie wants to find out whether light affects plant growth. Arrange his investigation.',steps:[['❓','Ask a question and predict what might happen.'],['🌱','Compare plants with different light, keeping water and plant type the same.'],['📏','Measure growth and compare the evidence with the prediction.']],hint:'Choose what you want to investigate first. Collect evidence before drawing a conclusion.',fact:'Ask and predict, carry out a fair test, then compare evidence. Keeping other conditions the same helps us investigate the effect of light.'},
} as const;
function SequenceMission({band,onComplete,askArchie}:{band:keyof typeof EXPERIENCES;onComplete:()=>void;askArchie:()=>void}){
 const puzzle=SEQUENCES[band];const [order,setOrder]=useState<number[]>([]);const [solved,setSolved]=useState(false);const [message,setMessage]=useState('Tap a scene for first, next and last.');
 return <div className={`age-mission age-sequence-mission ${solved?'age-mission-complete':''}`}><span className="age-mission-rocket" aria-hidden="true">{band==='challenger'?'🔬':'🌼'}</span><h3>{puzzle.title}</h3><p>{puzzle.intro}</p><ol className="age-sequence-result" aria-label="Your story order">{[0,1,2].map(position=><li key={position}><strong>{['First','Next','Last'][position]}</strong><span>{order[position]===undefined?'Choose a scene…':puzzle.steps[order[position]][1]}</span></li>)}</ol><div className="age-sequence-bank" aria-label="Story scenes">{[2,0,1].map(index=><button type="button" className="a-button" key={index} disabled={solved||order.includes(index)} onClick={()=>{setOrder(previous=>[...previous,index]);setMessage('Keep arranging, then check the order.');}}><span aria-hidden="true">{puzzle.steps[index][0]}</span>{puzzle.steps[index][1]}</button>)}</div><p role="status">{message}</p><div className="a-actions"><button type="button" className="a-button" disabled={solved} onClick={()=>{if(order.length!==3){setMessage('Choose all three scenes, then check.');return;}if(order.every((value,index)=>value===index)){setSolved(true);setMessage(puzzle.fact);onComplete();}else setMessage('Think about what must happen before the next step. Undo a scene or start again.');}}>Check the order</button><button type="button" className="a-button" disabled={solved||order.length===0} onClick={()=>setOrder(previous=>previous.slice(0,-1))}>Undo last scene</button><button type="button" className="a-button" onClick={()=>{setOrder([]);setSolved(false);setMessage('Tap a scene for first, next and last.');}}>Start the story again</button>{!solved&&<button type="button" className="a-button" onClick={()=>setMessage(puzzle.hint)}>Story clue</button>}<button type="button" className="a-button" onClick={askArchie}>Talk about this story with Archie</button></div></div>;
}
