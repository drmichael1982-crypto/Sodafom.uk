import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Calculator, FlaskConical, Volume2 } from 'lucide-react';
import { Page } from './ArchiePages';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useArchieData } from '@/lib/archie/storage';
import { useVoice } from '@/lib/voice-context';
import questData from '@/lib/archie/curriculum-quests.json';
import './archie.css';
import GrownUpGate from '@/components/GrownUpGate';
import LearningYearOptions, { LEARNING_YEAR_SCOPE_NOTE } from '@/components/LearningYearOptions';

type Quest = typeof questData[number];
const SUBJECT_LABELS = { maths: 'Maths', english: 'English', science: 'Science' };
export default function ArchieQuests() {
  const { settings, activities } = useArchieData();
  const [year, setYear] = useState(settings.year);
  const [active, setActive] = useState<Quest | null>(null);
  if (active) return <QuestRun key={active.id} quest={active} onBack={() => setActive(null)}/>;
  return <Page title="Learning quests" intro="Help Archie explore, one small challenge at a time. Try a hint, talk it through, and earn a star.">
    <label className="a-field">Choose a school year<select value={year} onChange={event => setYear(Number(event.target.value))}><LearningYearOptions/></select></label><p className="a-note">{LEARNING_YEAR_SCOPE_NOTE}</p>
    <div className="a-grid">{questData.filter(quest => quest.year === year).map(quest => {
      const Icon = quest.subject === 'maths' ? Calculator : quest.subject === 'english' ? BookOpen : FlaskConical;
      const completed = activities.some(activity => activity.id === 'quest-' + quest.id);
      return <button className={'a-card colour-' + (quest.subject === 'maths' ? 0 : quest.subject === 'english' ? 1 : 2)} key={quest.id} onClick={() => setActive(quest)}>
        <span className="a-emoji" aria-hidden="true"><Icon size={58}/></span><small>{SUBJECT_LABELS[quest.subject as keyof typeof SUBJECT_LABELS]} · Year {quest.year}</small><h2>{quest.title}</h2><p>{quest.objective}</p><span className="a-play">{completed ? 'Practise again' : 'Start quest'}</span>{completed && <small>Star already earned</small>}
      </button>;
    })}</div>
    <details className="a-panel"><summary>For grown-ups: curriculum links</summary><p>These original starter activities practise selected objectives from England's National Curriculum. They supplement teaching and do not cover a full course. Years 7–9 use Key Stage 3 topics; the year sequence is our suggested practice order.</p><GrownUpGate purpose="Read curriculum sources outside this app"><ul>{Object.entries(SUBJECT_LABELS).map(([subject,label]) => <li key={subject}><a href={questData.find(quest => quest.subject === subject)!.source} target="_blank" rel="noopener noreferrer">{label} programme of study</a></li>)}</ul></GrownUpGate></details>
  </Page>;
}
function QuestRun({quest,onBack}:{quest:Quest;onBack:()=>void}) {
  const { complete, activities } = useArchieData();
  const { setGameContext, clearGameContext } = useArchieContext();
  const { speak, stop } = useVoice();
  const [step,setStep] = useState(0);
  const [correct,setCorrect] = useState(false);
  const [hint,setHint] = useState(false);
  const [feedback,setFeedback] = useState('');
  const [paused,setPaused] = useState(false);
  const finished = step === quest.questions.length;
  const question = quest.questions[Math.min(step,quest.questions.length-1)];
  const earned = activities.some(activity => activity.id === 'quest-' + quest.id);
  useEffect(() => {
    setGameContext(quest.title, SUBJECT_LABELS[quest.subject as keyof typeof SUBJECT_LABELS], finished ? 'Quest completed' : question.prompt, finished ? [] : question.options);
    return clearGameContext;
  },[quest,question,finished,setGameContext,clearGameContext]);
  useEffect(() => () => stop(),[stop]);
  function next() {
    stop();
    if (step + 1 === quest.questions.length) complete({id:'quest-'+quest.id,kind:'lesson',title:quest.title+' · Year '+quest.year,stars:1});
    setStep(value => value+1);setCorrect(false);setHint(false);setFeedback('');
  }
  function answer(index:number) {
    if (correct || paused) return;
    if (index === question.answer) {setCorrect(true);setFeedback('Well done! '+question.explanation);}
    else {setHint(true);setFeedback('Good try. Use the hint and have another go.');}
  }
  return <Page title={quest.title} intro={'Year '+quest.year+' · '+SUBJECT_LABELS[quest.subject as keyof typeof SUBJECT_LABELS]}>
    <button className="a-button" onClick={() => {stop();onBack();}}>Back to quests</button>
    <section className="a-panel quest-board" aria-label="Learning quest">
      <p className="a-note"><strong>Learning goal:</strong> {quest.objective}</p>
      <label className="quest-progress">Journey progress<progress value={step} max={quest.questions.length}/><span>{finished ? 'Quest complete' : 'Challenge '+(step+1)+' of '+quest.questions.length}</span></label>
      {finished ? <div className="a-celebrate"><span className="a-emoji" aria-hidden="true">★</span><h2>Quest complete!</h2><p>{earned ? 'Your quest star is saved on this device. Great exploring!' : 'Great exploring!'}</p><p>You can practise again whenever you like. Each quest earns one star once.</p><Link className="a-button" to="/rewards">See my rewards</Link><button className="a-button" onClick={onBack}>Choose another quest</button></div>
      : paused ? <div className="a-celebrate"><h2>Time for a breather</h2><p>Your place is kept while you take a break.</p><button className="a-button" onClick={() => setPaused(false)}>Resume quest</button></div>
      : <><h2 id="quest-question">{question.prompt}</h2><div className="a-actions"><button className="a-button" onClick={() => speak('read:quest',question.prompt+' '+question.options.join('. '))}><Volume2 size={20}/> Read the challenge</button><button className="a-button" onClick={() => setHint(value => !value)} aria-expanded={hint} aria-controls="quest-hint">{hint ? 'Hide hint' : 'Give me a hint'}</button><button className="a-button" onClick={() => {stop();setPaused(true);}}>Pause quest</button></div>
      {hint && <p id="quest-hint" className="quest-hint"><strong>Archie's hint:</strong> {question.hint}</p>}
      <div className="quest-options" role="group" aria-labelledby="quest-question">{question.options.map((option,index) => <button className="a-button" key={option} disabled={correct} onClick={() => answer(index)}>{option}</button>)}</div>
      <p role="status" className="quest-feedback">{feedback}</p>{correct && <button className="a-button" onClick={next}>{step+1 === quest.questions.length ? 'Finish quest · Earn a star' : 'Next challenge'}</button>}
    </>}</section>
  </Page>;
}
