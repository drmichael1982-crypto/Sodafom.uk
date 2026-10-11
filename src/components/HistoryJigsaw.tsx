import { useEffect, useState } from 'react';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useArchieData } from '@/lib/archie/storage';
import { useVoice } from '@/lib/voice-context';
import './history-jigsaw.css';

type Fact = [string, string, string, string];
export const HISTORY_TOPICS: { id: string; title: string; facts: Fact[] }[] = [
  {id:'egypt',title:'Ancient Egypt',facts:[['Which river helped Egyptian farming?','The Nile','The Thames','The Nile’s yearly floods brought water and fertile soil.'],['What were many pyramids built as?','Royal tombs','Train stations','Pyramids were monumental tombs for some rulers. Not every Egyptian had one.'],['What do we call Egyptian picture writing?','Hieroglyphs','Musical notes','Hieroglyphs were signs used in Egyptian writing.'],['What was an Egyptian ruler called?','A pharaoh','A mayor','Pharaoh is a name used for rulers of ancient Egypt.'],['What can an ancient object give historians?','Evidence','A full video','Objects give clues, but historians must ask what they can and cannot show.'],['Which came first?','Ancient Egypt','Modern Britain','Ancient Egyptian civilisation began thousands of years before today.']]},
  {id:'1066',title:'1066',facts:[['Which battle took place in 1066?','The Battle of Hastings','The Battle of Waterloo','The Battle of Hastings was fought in England in 1066.'],['Who won at Hastings?','William of Normandy','Henry VIII','William’s victory helped him become king of England.'],['Which English king fought William?','Harold Godwinson','Tutankhamun','Harold Godwinson was king of England when William invaded.'],['Where did William come from?','Normandy','Ancient Egypt','Normandy is in what is now France.'],['What changed after the conquest?','Who ruled England','The existence of the Moon','The Norman conquest changed rulers, land ownership and government.'],['Can one picture tell the whole story?','No, compare evidence','Yes, always','The Bayeux Tapestry is evidence, but it presents a particular view. Historians compare sources.']]},
  {id:'henry',title:'Henry VIII',facts:[['Which royal family did Henry VIII belong to?','The Tudors','The Normans','Henry VIII was a Tudor king.'],['How many wives did Henry VIII have?','Six','Two','Henry VIII married six times. Each queen had her own life and story.'],['Which century did Henry VIII rule in?','The 1500s','The 1900s','Henry VIII ruled England from 1509 to 1547.'],['What changed during Henry’s reign?','England’s relationship with Rome','Earth’s orbit','Henry’s break with Rome changed religion and royal authority in England.'],['What can a royal portrait tell us?','How the king wanted to appear','Exactly what everyone thought','Portraits could show wealth and power. They were not neutral photographs.'],['Who followed Henry VIII as king?','Edward VI','William of Normandy','Henry’s son Edward VI became king in 1547.']]},
  {id:'anglo-saxon',title:'Anglo-Saxons',facts:[['Where did many Anglo-Saxon settlers come from?','Parts of northern Europe','The Moon','Groups including Angles and Saxons settled in Britain after Roman rule.'],['Which homes were common in settlements?','Timber buildings','Modern tower blocks','Archaeologists find traces of timber homes and halls.'],['What was important work for many people?','Farming','Flying planes','Many people grew crops and kept animals.'],['Which language developed in this period?','Old English','Modern Spanish','Old English developed from languages spoken by settlers.'],['What can a burial reveal?','Clues about beliefs and status','Every detail of a life','Sutton Hoo’s finds give clues about skill, trade and elite life. Some questions remain uncertain.'],['What happened in 1066?','The Norman conquest','The invention of cars','The Norman conquest changed the rulers of England. Anglo-Saxon people and traditions did not simply disappear.']]},
];

const READY = 'Choose an answer to earn a picture piece.';

export default function HistoryJigsaw() {
  const [topic, setTopic] = useState(0);
  const [piece, setPiece] = useState(0);
  const [explanation, setExplanation] = useState(READY);
  const [paused, setPaused] = useState(false);
  const { setGameContext } = useArchieContext();
  const { complete } = useArchieData();
  const { speak, stop } = useVoice();
  const current = HISTORY_TOPICS[topic];
  const fact = current.facts[Math.min(piece, 5)];

  useEffect(() => {
    setGameContext(`${current.title} history jigsaw`, 'History', piece < 6 ? fact[0] : 'Completed history puzzle');
  }, [current, piece, fact, setGameContext]);

  function pick(answer: string) {
    if (piece === 6 || paused) return;
    if (answer !== fact[1]) {
      setExplanation('Try another answer. Ask Archie for a clue if you need one.');
      return;
    }
    setExplanation(fact[3]);
    setPiece(previous => previous + 1);
    speak('history-piece', fact[3]);
    if (piece === 5) {
      complete({ id: `history-jigsaw-${current.id}`, kind: 'lesson', title: `${current.title} history picture puzzle`, stars: 1 });
    }
  }

  function resetScene() {
    stop();
    setPiece(0);
    setPaused(false);
    setExplanation(READY);
  }

  function togglePause() {
    stop();
    setPaused(value => {
      const next = !value;
      setExplanation(next ? 'Puzzle paused. Your picture pieces are still here.' : 'Puzzle resumed. Choose an answer when you are ready.');
      return next;
    });
  }

  return <section className="history-jigsaw">
    <label>Choose a history scene <select aria-label="History scene" value={topic} onChange={event => {
      stop();
      setTopic(Number(event.target.value));
      setPiece(0);
      setPaused(false);
      setExplanation(READY);
    }}>{HISTORY_TOPICS.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}</select></label>
    <div className="history-picture" aria-label={`${current.title} picture: ${piece} of 6 pieces`} style={{ backgroundImage: `url('/assets/history/${current.id}.svg')` }}>
      {Array.from({ length: 6 }, (_, index) => <span key={index} className={index < piece ? 'history-piece-fit' : 'history-piece-gap'}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M100 0V37C88 32 88 53 100 48V100H63C68 88 47 88 52 100H0" /></svg>
        {index >= piece && <b>{index + 1}</b>}
      </span>)}
    </div>
    <small>Illustrated learning scene, not an exact reconstruction.</small>
    <p className="history-explanation" aria-live="polite">{explanation}</p>
    {piece < 6 ? <>
      <p className="history-question">{fact[0]}</p>
      <div className="history-answers">{(piece % 2 ? [fact[1], fact[2]] : [fact[2], fact[1]]).map(answer =>
        <button type="button" key={answer} disabled={paused} onClick={() => pick(answer)}>{answer}</button>)}</div>
    </> : <p>You completed {current.title}! It is saved in My progress. Choose another scene or practise this one again.</p>}
    <div className="history-controls">
      <button type="button" aria-pressed={paused} onClick={togglePause}>{paused ? 'Resume puzzle' : 'Pause puzzle'}</button>
      <button type="button" disabled={paused} onClick={() => speak('history-read', `${piece < 6 ? fact[0] : current.title}. ${explanation}`)}>Read aloud</button>
      <button type="button" disabled={paused && piece === 0} onClick={resetScene}>Start this scene again</button>
    </div>
  </section>;
}
