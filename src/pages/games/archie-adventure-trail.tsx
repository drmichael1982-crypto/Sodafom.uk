import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import GameShell, { type GameResult, useChildAge } from '@/components/games/GameShell';
import { useVoice } from '@/lib/voice-context';
import { listenForGameAnswer, normaliseVoiceAnswer } from '@/lib/archie/game-voice';
import './archie-adventure-trail.css';

export const ADVENTURE_TITLE = 'Archie’s Adventure Trail';
export const ADVENTURE_ROUNDS = 8;
export const ADVENTURE_BOARD_SIZE = 48;
type Tier = 1 | 2 | 3;
type Phase = 'ready' | 'question' | 'solved' | 'landed';
export type AdventureQuestion = {
  id: string; prompt: string; options: { id: string; label: string }[];
  answerId: string; hint: string; explanation: string;
};

// Original practice questions mapped to England's DfE mathematics programmes:
// KS1 counting/number bonds/halves; KS2 multiplication, place value and fractions;
// upper KS2/KS3 percentages, ratio, algebra, negative numbers, mean and area.
// https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
// These short practice sets supplement teaching; they are not a whole curriculum.
function clue(id: string, prompt: string, answer: string, wrong: [string, string], hint: string, explanation: string, turn: number): AdventureQuestion {
  const options = [answer, ...wrong].map((label, index) => ({ id: `${id}-option-${index}`, label }));
  const rotation = turn % options.length;
  return { id, prompt, options: [...options.slice(rotation), ...options.slice(0, rotation)], answerId: `${id}-option-0`, hint, explanation };
}
export const ADVENTURE_QUESTIONS: Record<Tier, AdventureQuestion[]> = {
  1: [
    clue('aat-1-add', '3 shells and 1 more shell. How many shells altogether?', '4', ['3', '5'], 'Start at three. Count one more.', '3 + 1 = 4. One more than three is four.', 0),
    clue('aat-1-take', 'There are 6 pebbles. Take away 2. How many remain?', '4', ['2', '6'], 'Draw six dots. Cross out two and count the rest.', '6 − 2 = 4. Four pebbles remain.', 1),
    clue('aat-1-count', 'What number comes next: 7, 8, 9, …?', '10', ['8', '11'], 'Count forwards by one from nine.', 'After nine comes ten when counting forwards by one.', 2),
    clue('aat-1-bond', '4 and how many more make 10?', '6', ['4', '5'], 'Count on from four until you reach ten.', '4 + 6 = 10. Six more complete the group of ten.', 0),
    clue('aat-1-half', 'Share 8 berries equally into two groups. How many in each group?', '4', ['2', '6'], 'Give one berry to each group in turn.', 'Two equal groups of four make eight. Half of 8 is 4.', 1),
    clue('aat-1-join', '5 leaves join 2 leaves. How many leaves altogether?', '7', ['6', '8'], 'Start at five and count on two.', '5 + 2 = 7. Count on: six, seven.', 2),
    clue('aat-1-less', 'What is one less than 12?', '11', ['10', '13'], 'Count backwards one step from twelve.', 'One less than twelve is eleven: 12 − 1 = 11.', 0),
    clue('aat-1-total', 'You find 7 stones, then 3 more. How many stones?', '10', ['9', '11'], 'Count on three from seven.', '7 + 3 = 10. Eight, nine, ten: three more steps.', 1),
  ],
  2: [
    clue('aat-2-times', '6 groups of 4 trail markers. How many markers?', '24', ['20', '28'], 'Use the four times table or draw six equal groups.', '6 × 4 = 24. Six equal groups of four make twenty-four.', 0),
    clue('aat-2-quarter', 'What is one quarter of 20?', '5', ['4', '10'], 'Share twenty into four equal groups.', '20 ÷ 4 = 5. One quarter of twenty is five.', 1),
    clue('aat-2-place', 'In 342, what is the value of the digit 4?', '40', ['4', '400'], 'The digit four is in the tens column.', 'Four tens have a value of 40.', 2),
    clue('aat-2-equivalent', 'Which fraction is equal to 2/4?', '1/2', ['1/4', '3/4'], 'Shade two of four equal parts of a whole.', 'Two quarters cover half the whole: 2/4 = 1/2.', 0),
    clue('aat-2-share', '24 markers shared equally between 3 teams. How many per team?', '8', ['6', '9'], 'Find a three times table fact that makes twenty-four.', '24 ÷ 3 = 8. Three groups of eight make twenty-four.', 1),
    clue('aat-2-money', 'You have 100p and spend 35p. How many pence remain?', '65', ['75', '55'], 'Count on from thirty-five to one hundred.', '100p − 35p = 65p. Check: 35p + 65p = 100p.', 2),
    clue('aat-2-fraction', 'What is three quarters of 16?', '12', ['4', '8'], 'Find one quarter, then take three equal groups.', '16 ÷ 4 = 4. Three groups of four make 12.', 0),
    clue('aat-2-add', 'What is 150 + 75?', '225', ['215', '235'], 'Add seventy, then add five.', '150 + 70 = 220; 220 + 5 = 225.', 1),
  ],
  3: [
    clue('aat-3-percent', 'What is 30% of 80?', '24', ['30', '26'], 'Find ten per cent, then multiply it by three.', '10% of 80 is 8. Three lots of 8 make 24.', 0),
    clue('aat-3-ratio', 'Red:blue markers are in the ratio 2:3. There are 25 markers. How many are red?', '10', ['15', '5'], 'There are five ratio parts. Find the size of one part.', '25 ÷ 5 = 5 per part. Red has two parts: 2 × 5 = 10.', 1),
    clue('aat-3-equation', 'Solve 3x + 2 = 20. What is x?', '6', ['8', '9'], 'Undo adding two, then undo multiplying by three.', '20 − 2 = 18; 18 ÷ 3 = 6. Check: 3 × 6 + 2 = 20.', 2),
    clue('aat-3-negative', 'What is −4 + 9?', '5', ['−13', '13'], 'Move nine steps right from minus four on a number line.', 'Four steps reach zero; five more reach 5.', 0),
    clue('aat-3-fraction', 'What is 3/4 − 1/4 in its simplest form?', '1/2', ['1/4', '3/8'], 'Subtract equal-sized quarter parts, then simplify.', '3/4 − 1/4 = 2/4 = 1/2.', 1),
    clue('aat-3-square', 'What is 5² + 3²?', '34', ['16', '64'], 'Square each number separately, then add.', '5² = 25 and 3² = 9. Their sum is 34.', 2),
    clue('aat-3-mean', 'What is the mean of 6, 8 and 10?', '8', ['9', '24'], 'Add the three values and divide by three.', '6 + 8 + 10 = 24; 24 ÷ 3 = 8.', 0),
    clue('aat-3-area', 'A triangle has base 6 cm and perpendicular height 4 cm. What is its area in cm²?', '12', ['24', '10'], 'Use half × base × perpendicular height.', '½ × 6 × 4 = 12 cm². The perpendicular height meets the base at a right angle.', 1),
  ],
};

export function rollAdventureDie(random: () => number = Math.random): number {
  const value = random();
  return Number.isFinite(value) ? Math.max(1, Math.min(6, Math.floor(value * 6) + 1)) : 1;
}
export function advanceAdventurePosition(position: number, die: number): number {
  const start = Number.isFinite(position) ? Math.max(0, Math.min(ADVENTURE_BOARD_SIZE, Math.floor(position))) : 0;
  return Number.isInteger(die) && die >= 1 && die <= 6 ? Math.min(ADVENTURE_BOARD_SIZE, start + die) : start;
}
const BOARD = Array.from({ length: 8 }, (_, row) => {
  const cells = Array.from({ length: 6 }, (_, col) => row * 6 + col + 1);
  return row % 2 ? cells.reverse() : cells;
}).flat();
function handoffFocus(origin: HTMLButtonElement, target: HTMLElement) {
  const active = document.activeElement;
  if (document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"]')) return;
  if (active !== origin && !(active === document.body && (!origin.isConnected || origin.disabled))) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView?.({ behavior: 'instant', block: 'nearest' });
}
type PlayProps = { tier: Tier; onComplete: (result: GameResult) => void; onQuestionChange?: (question: string, options: string[]) => void };
export function AdventureTrailPlay({ tier, onComplete, onQuestionChange }: PlayProps) {
  const { speak, stop } = useVoice();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [position, setPosition] = useState(0);
  const [die, setDie] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [hint, setHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState('Roll when you are ready. Solve the clue, then choose to move.');
  const question = ADVENTURE_QUESTIONS[tier][round];
  const target = advanceAdventurePosition(position, die);
  const solvedRound = useRef(-1);
  const movedRound = useRef(-1);
  const advancedRound = useRef(-1);
  const rolledRound = useRef(-1);
  const mistake = useRef(false);
  const completed = useRef(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const rollButton = useRef<HTMLButtonElement>(null);
  const moveButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<{ origin: HTMLButtonElement; target: 'question' | 'roll' | 'move' | 'next' } | null>(null);
  function requestFocus(event: MouseEvent<HTMLButtonElement> | undefined, destination: 'question' | 'roll' | 'move' | 'next') {
    if (event?.currentTarget === document.activeElement) pendingFocus.current = { origin: event.currentTarget, target: destination };
  }
  useEffect(() => {
    const pending = pendingFocus.current; pendingFocus.current = null;
    const node = pending?.target === 'question' ? questionHeading.current : pending?.target === 'roll' ? rollButton.current : pending?.target === 'move' ? moveButton.current : nextButton.current;
    if (pending && node) handoffFocus(pending.origin, node);
  }, [phase, round]);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    const active = !paused && phase === 'question';
    onQuestionChange?.(paused ? 'Adventure paused. Resume when you are ready.' : active ? question.prompt : 'Eight clues. Roll, solve, then choose to move. No hurry.', active ? question.options.map(option => option.label) : []);
  }, [question, phase, paused, onQuestionChange]);
  function roll(event: MouseEvent<HTMLButtonElement>) {
    if (paused || phase !== 'ready' || rolledRound.current === round || completed.current) return;
    rolledRound.current = round;
    const rolled = rollAdventureDie(); setDie(rolled); setPhase('question');
    setFeedback(`The die shows ${rolled}. Solve the clue to move from ${position === 0 ? 'base camp' : 'square ' + position} to square ${advanceAdventurePosition(position, rolled)}.`);
    requestFocus(event, 'question');
  }
  function choose(id: string, event?: MouseEvent<HTMLButtonElement>): string | undefined {
    if (paused || phase !== 'question' || solvedRound.current === round || completed.current) return undefined;
    if (!question.options.some(option => option.id === id)) return undefined;
    if (id === question.answerId) {
      solvedRound.current = round; setPhase('solved');
      if (!mistake.current) setFirstTry(value => value + 1);
      const reply = 'Clue solved! ' + question.explanation + ' Choose Move when you are ready.';
      setFeedback(reply); requestFocus(event, 'move'); return reply;
    }
    mistake.current = true; setHint(true);
    const reply = 'Good try. Your explorer stays safe. Use the hint and try the same clue again. ' + question.hint;
    setFeedback(reply); return reply;
  }
  useEffect(() => listenForGameAnswer(ADVENTURE_TITLE, text => {
    const answer = normaliseVoiceAnswer(text);
    const option = question.options.find(item => normaliseVoiceAnswer(item.label) === answer);
    return option ? choose(option.id) : undefined;
  }), [question, paused, phase, round]);
  function move(event: MouseEvent<HTMLButtonElement>) {
    if (paused || phase !== 'solved' || movedRound.current === round || completed.current) return;
    movedRound.current = round; const landing = advanceAdventurePosition(position, die);
    setPosition(landing); setPhase('landed'); setFeedback(`You moved ${die} ${die === 1 ? 'square' : 'squares'} and reached square ${landing}. ${round === 3 ? 'Four clues explored. A good moment to stretch or look away.' : 'Take a moment to enjoy your discovery.'}`);
    requestFocus(event, 'next');
  }
  function next(event: MouseEvent<HTMLButtonElement>) {
    if (paused || phase !== 'landed' || advancedRound.current === round || completed.current) return;
    advancedRound.current = round; stop();
    if (round + 1 === ADVENTURE_ROUNDS) {
      completed.current = true; const score = Math.round(firstTry / ADVENTURE_ROUNDS * 100);
      onComplete({ score, correct: firstTry, total: ADVENTURE_ROUNDS, stars: score >= 90 ? 3 : score >= 75 ? 2 : score >= 50 ? 1 : 0 });
    } else {
      mistake.current = false; setRound(value => value + 1); setDie(0); setPhase('ready'); setHint(false);
      setFeedback('A new clue awaits. Roll when you are ready.'); requestFocus(event, 'roll');
    }
  }
  return <section className="aat" data-tier={tier} aria-label="Adventure Trail game">
    <header className="aat-intro"><p className="aat-eyebrow">{tier === 3 ? 'Expedition briefing' : 'A new adventure with Archie'}</p><h2>Eight clues. Your own pace.</h2><p>Roll a die from 1 to 6. Solve the clue, then move along the trail. The adventure finishes after eight clues, wherever you land.</p></header>
    <div className="aat-toolbar"><p>Clue {round + 1} of {ADVENTURE_ROUNDS} · {firstTry} first-try {firstTry === 1 ? 'answer' : 'answers'}</p><button type="button" onClick={() => { stop(); setPaused(value => !value); }}>{paused ? 'Resume adventure' : 'Take a break'}</button></div>
    <progress className="aat-progress" aria-label="Adventure clues explored" max={ADVENTURE_ROUNDS} value={round + (phase === 'landed' ? 1 : 0)} />
    <div className="aat-layout"><section className="aat-mission" aria-label="Current trail clue">
      {paused ? <div className="aat-rest"><h3>Time for a breather</h3><p>Your dice, clue and explorer are kept here. Stretch or look away. Resume whenever you are ready.</p></div> : <>
        {phase === 'ready' && <><h3>Ready for clue {round + 1}?</h3><button ref={rollButton} type="button" className="aat-primary" onClick={roll}>Roll the die</button><p>The die chooses your distance, not your score. Hints and retries are welcome.</p></>}
        {(phase === 'question' || phase === 'solved') && <><p className="aat-die">Die: {die} · next stop: square {target}</p><h3 ref={questionHeading} tabIndex={-1}>{question.prompt}</h3><div className="aat-tools"><button type="button" onClick={() => speak('read:archie-adventure-trail', question.prompt + ' Your choices are ' + question.options.map(option => option.label).join(', '))}>Read the clue</button><button type="button" aria-expanded={hint} aria-controls="aat-hint" onClick={() => setHint(value => !value)}>{hint ? 'Hide hint' : 'Show hint'}</button></div><p id="aat-hint" className="aat-hint" hidden={!hint}>{question.hint}</p><div className="aat-answers" role="group" aria-label="Choose a clue answer">{question.options.map(option => <button type="button" key={option.id} disabled={phase === 'solved'} onClick={event => choose(option.id, event)}>{option.label}</button>)}</div></>}
        {phase === 'landed' && <><h3>{round + 1 === ADVENTURE_ROUNDS ? 'Eight clues explored!' : 'A new place discovered'}</h3><p>You are at square {position}. Every clue you solved helped you explore.</p></>}
      </>}
      <div className="aat-feedback" role="status" aria-atomic="true">{paused ? 'Adventure paused. Your place is safe.' : feedback}</div>
      {!paused && phase === 'solved' && <button ref={moveButton} type="button" className="aat-primary" onClick={move}>Move {die} {die === 1 ? 'square' : 'squares'}</button>}
      {!paused && phase === 'landed' && <button ref={nextButton} type="button" className="aat-primary" onClick={next}>{round + 1 === ADVENTURE_ROUNDS ? 'See my stars' : 'Next adventure'}</button>}
    </section><section className="aat-map" aria-label="Your adventure route"><h3>Adventure map</h3><p className="aat-position">Your explorer: {position === 0 ? 'base camp' : `square ${position} of ${ADVENTURE_BOARD_SIZE}`}</p><div className="aat-board" role="img" aria-label={`A winding trail of ${ADVENTURE_BOARD_SIZE} numbered squares. Your explorer is ${position === 0 ? 'at base camp, before square 1' : 'on square ' + position}.${phase === 'question' || phase === 'solved' ? ` The die shows ${die}; the next stop is square ${target}, after solving the clue and choosing Move.` : ''}`}>
      {BOARD.map(square => <div key={square} aria-hidden="true" className={'aat-square' + (square === position ? ' is-current' : square < position ? ' is-visited' : '') + ((phase === 'question' || phase === 'solved') && square === target ? ' is-target' : '')}><span>{square}</span>{square === position && <strong>YOU</strong>}</div>)}
    </div><p className="aat-map-note">Gold + YOU = your explorer. A dashed outline = your next stop. There are no backward falls or penalties for trying again.</p></section></div>
    <p className="aat-footnote">First-try answers describe this practice visit, not your ability. Take a break whenever you need one.</p>
  </section>;
}
export default function ArchieAdventureTrailGame() {
  const { tier } = useChildAge();
  const [context, setContext] = useState<{ question: string; options: string[] }>({ question: 'Eight clues. Roll, solve, then choose to move.', options: [] });
  const updateContext = useCallback((question: string, options: string[]) => setContext({ question, options }), []);
  return <GameShell title={ADVENTURE_TITLE} emoji="🎲" subject="maths" ageGroups={['5–7', '8–10', '11–13']} currentQuestion={context.question} currentOptions={context.options}>
    {onComplete => <AdventureTrailPlay key={tier} tier={tier} onComplete={onComplete} onQuestionChange={updateContext} />}
  </GameShell>;
}
