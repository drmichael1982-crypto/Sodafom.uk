import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import GameShell, {
  type GameResult,
  useChildAge,
} from '@/components/games/GameShell';
import { Helmet } from '@dr.pogodin/react-helmet';

const TOTAL_ROUNDS = 10;

type DifficultyTier = 1 | 2 | 3;

interface Question {
  question: string;
  answer: number;
  options: number[];
}

interface NumberPopPlayProps {
  onComplete?: (result: GameResult) => void;
  onQuestionChange?: (question: string) => void;
}

const COLORS = [
  'bg-red-400',
  'bg-blue-400',
  'bg-yellow-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-green-400',
];

/**
 * Shuffle an array without changing the original.
 */
function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/**
 * Create three believable wrong answers.
 */
function createWrongAnswers(
  answer: number,
  range: number,
): number[] {
  const wrongs = new Set<number>();

  let attempts = 0;

  while (wrongs.size < 3 && attempts < 100) {
    const offset =
      Math.floor(Math.random() * (range * 2 + 1)) - range;

    const wrongAnswer = answer + offset;

    if (wrongAnswer !== answer && wrongAnswer > 0) {
      wrongs.add(wrongAnswer);
    }

    attempts += 1;
  }

  /*
   * Safety fallback.
   * This guarantees four different answer buttons even if
   * random generation somehow fails.
   */
  let fallback = 1;

  while (wrongs.size < 3) {
    const wrongAnswer = answer + fallback;

    if (wrongAnswer !== answer && wrongAnswer > 0) {
      wrongs.add(wrongAnswer);
    }

    fallback += 1;
  }

  return [...wrongs];
}

/**
 * Generate one maths question based on the child's age tier.
 *
 * Tier 1: ages 5–7
 * Tier 2: ages 8–10
 * Tier 3: ages 11–13
 */
export function generateQuestion(tier: DifficultyTier): Question {
  /*
   * TIER 1
   * Simple addition using numbers 1–5.
   */
  if (tier === 1) {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;

    const answer = a + b;

    const wrongs = createWrongAnswers(answer, 3);

    return {
      question: `${a} + ${b} = ?`,
      answer,
      options: shuffle([...wrongs, answer]),
    };
  }

  /*
   * TIER 2
   * Addition and subtraction.
   */
  if (tier === 2) {
    const operations = ['+', '-'] as const;

    const operation =
      operations[Math.floor(Math.random() * operations.length)];

    const a = Math.floor(Math.random() * 15) + 5;

    const b =
      operation === '-'
        ? Math.floor(Math.random() * a) + 1
        : Math.floor(Math.random() * 10) + 1;

    const answer =
      operation === '+'
        ? a + b
        : a - b;

    const wrongs = createWrongAnswers(answer, 4);

    return {
      question: `${a} ${operation} ${b} = ?`,
      answer,
      options: shuffle([...wrongs, answer]),
    };
  }

  /*
   * TIER 3
   * Addition, subtraction and multiplication.
   */
  const operations = ['+', '-', '×'] as const;

  const operation =
    operations[Math.floor(Math.random() * operations.length)];

  /*
   * Multiplication questions.
   */
  if (operation === '×') {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 2;

    const answer = a * b;

    const wrongs = createWrongAnswers(answer, 6);

    return {
      question: `${a} × ${b} = ?`,
      answer,
      options: shuffle([...wrongs, answer]),
    };
  }

  /*
   * Addition/subtraction questions for Tier 3.
   */
  const a = Math.floor(Math.random() * 30) + 10;

  const b =
    operation === '-'
      ? Math.floor(Math.random() * a) + 1
      : Math.floor(Math.random() * 20) + 5;

  const answer =
    operation === '+'
      ? a + b
      : a - b;

  const wrongs = createWrongAnswers(answer, 5);

  return {
    question: `${a} ${operation} ${b} = ?`,
    answer,
    options: shuffle([...wrongs, answer]),
  };
}

/**
 * Number Pop
 *
 * Players answer maths questions by popping
 * the balloon containing the correct answer.
 *
 * The game keeps a history of previous questions
 * so questions do not repeat during the same game.
 */
export function explainQuestion(question: Question, revealAnswer = false): string {
  const [a, operation, b] = question.question.split(' ');
  const strategy = operation === '+'
    ? 'Start at ' + a + ' and count on ' + b + ' steps. You can draw dots to help.'
    : operation === '-'
      ? 'Start at ' + a + ' and count back ' + b + ' steps on a number line.'
      : 'Make ' + a + ' equal groups of ' + b + '. Add the groups or use your times table.';
  return revealAnswer ? strategy + ' ' + a + ' ' + operation + ' ' + b + ' = ' + question.answer + '.' : strategy;
}

export function NumberPopPlay({ onComplete, onQuestionChange }: NumberPopPlayProps) {
  const { tier } = useChildAge();
  const reduceMotion = useReducedMotion();
  const questionHistory = useRef(new Set<string>());
  const completionSent = useRef(false);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion(tier));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finishedResult, setFinishedResult] = useState<GameResult | null>(null);

  const restartGame = () => {
    const first = generateQuestion(tier);
    questionHistory.current = new Set([first.question]);
    completionSent.current = false;
    setRound(0); setCorrect(0); setQuestion(first);
    setFeedback(null); setHadMistake(false); setHintVisible(false); setPaused(false); setFinishedResult(null);
  };
  useEffect(() => { restartGame(); }, [tier]);
  useEffect(() => { onQuestionChange?.(question.question); }, [question.question, onQuestionChange]);

  const popBalloon = (value: number) => {
    if (paused || feedback === 'correct' || finishedResult) return;
    if (value === question.answer) {
      setFeedback('correct');
      if (!hadMistake) setCorrect(previous => previous + 1);
    } else {
      setHadMistake(true); setFeedback('wrong'); setHintVisible(true);
    }
  };

  const nextBalloon = () => {
    if (paused || feedback !== 'correct' || completionSent.current) return;
    if (round + 1 === TOTAL_ROUNDS) {
      completionSent.current = true;
      const score = Math.round(correct / TOTAL_ROUNDS * 100);
      const result = { score, correct, total: TOTAL_ROUNDS, stars: score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0 };
      setFinishedResult(result); onComplete?.(result); return;
    }
    let next = generateQuestion(tier);
    let attempts = 0;
    while (questionHistory.current.has(next.question) && attempts++ < 50) next = generateQuestion(tier);
    questionHistory.current.add(next.question);
    setRound(previous => previous + 1); setQuestion(next);
    setFeedback(null); setHadMistake(false); setHintVisible(false);
  };

  if (finishedResult && !onComplete) return <section className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-blue-50">
    <h2 className="text-3xl font-black mb-4">Balloon adventure complete!</h2>
    <p className="text-lg">You solved all {TOTAL_ROUNDS} balloons.</p>
    <p className="text-lg mb-4">{finishedResult.correct} correct on your first try. Every retry was useful practice.</p>
    <p className="text-2xl mb-4">{'⭐'.repeat(finishedResult.stars)}</p>
    <button type="button" className="px-6 py-3 min-h-12 rounded-xl bg-primary text-primary-foreground font-bold" onClick={restartGame}>Play again</button>
  </section>;

  return <section className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-blue-50 to-background" aria-label="Number Pop adventure">
    <div className="w-full max-w-md mb-5">
      <div className="flex justify-between flex-wrap gap-2 text-sm font-bold mb-2"><span>Question {round + 1} of {TOTAL_ROUNDS}</span><span>⭐ {correct} first-try answers</span></div>
      <progress className="w-full h-4" aria-label="Balloon adventure progress" value={round + (feedback === 'correct' ? 1 : 0)} max={TOTAL_ROUNDS}/>
    </div>
    <h2 className="font-black text-center bg-card rounded-2xl px-4 py-4 mb-4 border-2 border-border" style={{fontSize:'clamp(24px,7vw,36px)', fontFamily:'var(--font-heading)'}}>{question.question}</h2>
    <p className="text-center text-base mb-4">Take your time. Pop the balloon with the right answer.</p>
    <div className="flex gap-3 flex-wrap justify-center mb-4">
      <button type="button" onClick={()=>setHintVisible(value=>!value)} aria-expanded={hintVisible} aria-controls="number-pop-hint" className="min-h-12 px-4 py-3 rounded-xl bg-white border-2 border-blue-300 font-bold">{hintVisible ? 'Hide hint' : 'Show a hint'}</button>
      <button type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused} className="min-h-12 px-4 py-3 rounded-xl bg-white border-2 border-blue-300 font-bold">{paused ? 'Resume adventure' : 'Pause adventure'}</button>
    </div>
    {paused ? <div role="status" className="max-w-md w-full p-5 text-center rounded-2xl bg-white mb-4"><h3 className="text-xl font-black">Time for a breather</h3><p>Your balloons are safe. Resume when you are ready.</p></div> : <>
      <div role="status" aria-live="polite" className="w-full max-w-md text-center mb-4">
        {feedback === 'wrong' && <p className="font-bold text-blue-900 mb-2">Good try. Use the hint and have another go at this balloon.</p>}
        {feedback === 'correct' && <><p className="text-xl font-black text-green-700">🎉 Balloon solved!</p><p className="mt-2">{explainQuestion(question, true)}</p><p className="mt-2 text-sm">{hadMistake ? 'You kept trying and solved it. That is useful practice!' : 'Solved on your first try!'}</p></>}
      </div>
      {hintVisible && feedback !== 'correct' && <p id="number-pop-hint" className="max-w-md w-full p-4 mb-5 rounded-xl bg-yellow-100 text-base">{explainQuestion(question)}</p>}
      <div className="grid grid-cols-4 gap-2 w-full max-w-md mb-5" aria-label="Answer balloons">
        {question.options.map((value,index)=><motion.button type="button" key={value} aria-label={'Pop balloon ' + value} onClick={()=>popBalloon(value)} disabled={feedback === 'correct'}
          animate={reduceMotion || feedback === 'correct' ? {y:0} : {y:[0,-6,0]}} transition={{duration:2+index*0.3,repeat:reduceMotion || feedback === 'correct' ? 0 : Infinity}}
          className={'min-w-11 min-h-16 aspect-square rounded-full ' + COLORS[index % COLORS.length] + ' text-blue-950 font-black text-xl shadow-lg border-2 border-white disabled:opacity-70'}>{value}</motion.button>)}
      </div>
      {feedback === 'correct' && <button type="button" onClick={nextBalloon} className="min-h-12 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black mb-4">{round + 1 === TOTAL_ROUNDS ? 'Finish balloon adventure' : 'Next balloon'}</button>}
    </>}
  </section>;
}

export default function NumberPopGame() {
  const [currentQuestion, setCurrentQuestion] = useState('');

  return (
    <>
      <Helmet>
        <title>Number Pop — Sodafom | Fun Maths Games for Kids</title>
        <meta name="description" content="Pop balloons to answer maths questions! A fun way for kids to practice addition, subtraction and multiplication." />
        <link rel="canonical" href="https://sodafom.uk/games/number-pop" />
      </Helmet>

      <GameShell
        title="Number Pop"
        emoji="🎈"
        subject="maths"
        ageGroups={['5–7', '8–10', '11–13']}
        currentQuestion={currentQuestion}
      >
        {(onComplete) => (
          <NumberPopPlay
            onComplete={onComplete}
            onQuestionChange={setCurrentQuestion}
          />
        )}
      </GameShell>
    </>
  );
}
