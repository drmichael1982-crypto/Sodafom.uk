import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

interface Balloon {
  id: number;
  value: number;
  x: number;
  color: string;
  isAnswer: boolean;
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
function generateQuestion(tier: DifficultyTier): Question {
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
function NumberPopPlay({
  onComplete,
  onQuestionChange,
}: NumberPopPlayProps) {
  const { tier } = useChildAge();

  const questionHistory = useRef<Set<string>>(new Set());

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const createUniqueQuestion = (): Question => {
    let nextQuestion = generateQuestion(tier);
    let attempts = 0;

    /*
     * Try several times to find a question which
     * has not already appeared in this game.
     */
    while (
      questionHistory.current.has(nextQuestion.question) &&
      attempts < 50
    ) {
      nextQuestion = generateQuestion(tier);
      attempts += 1;
    }

    questionHistory.current.add(nextQuestion.question);

    return nextQuestion;
  };

  const [round, setRound] = useState(0);

  const [correct, setCorrect] = useState(0);

  const [question, setQuestion] =
    useState<Question>(() => {
      const firstQuestion = generateQuestion(tier);

      questionHistory.current.add(firstQuestion.question);

      return firstQuestion;
    });

  const [balloons, setBalloons] =
    useState<Balloon[]>([]);

  const [popped, setPopped] =
    useState<number | null>(null);

  const [feedback, setFeedback] =
    useState<'correct' | 'wrong' | null>(null);

  const [finishedResult, setFinishedResult] =
    useState<GameResult | null>(null);

  /**
   * Tell the parent component whenever
   * the displayed question changes.
   */
  useEffect(() => {
    onQuestionChange?.(question.question);
  }, [question.question, onQuestionChange]);

  /**
   * Build the four balloons whenever
   * a new question is displayed.
   */
  useEffect(() => {
    setBalloons(
      question.options.map((value, index) => ({
        id: index,
        value,
        x: 10 + index * 23,
        color: COLORS[index % COLORS.length],
        isAnswer: value === question.answer,
      })),
    );

    setPopped(null);
    setFeedback(null);
  }, [question]);

  /**
   * If the age tier changes, restart the game
   * with questions appropriate for the new age.
   */
  useEffect(() => {
    questionHistory.current.clear();

    const newQuestion = generateQuestion(tier);

    questionHistory.current.add(newQuestion.question);

    setRound(0);
    setCorrect(0);
    setFinishedResult(null);
    setQuestion(newQuestion);
    setPopped(null);
    setFeedback(null);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tier]);

  /**
   * Handle a balloon being selected.
   */
  const popBalloon = (balloon: Balloon) => {
    /*
     * Prevent multiple answers being clicked
     * during the feedback animation.
     */
    if (popped !== null) {
      return;
    }

    setPopped(balloon.id);

    const isCorrect = balloon.isAnswer;

    setFeedback(
      isCorrect
        ? 'correct'
        : 'wrong',
    );

    if (isCorrect) {
      setCorrect(previous => previous + 1);
    }

    timeoutRef.current = setTimeout(() => {
      const nextRound = round + 1;

      /*
       * Finish after question 10.
       */
      if (nextRound >= TOTAL_ROUNDS) {
        const finalCorrect =
          correct + (isCorrect ? 1 : 0);

        const score = Math.round(
          (finalCorrect / TOTAL_ROUNDS) * 100,
        );

        const stars =
          score >= 90
            ? 3
            : score >= 60
              ? 2
              : score >= 30
                ? 1
                : 0;

        const result: GameResult = {
          score,
          correct: finalCorrect,
          total: TOTAL_ROUNDS,
          stars,
        };

        setFinishedResult(result);

        onComplete?.(result);

        return;
      }

      /*
       * Move to a new unique question.
       */
      const nextQuestion =
        createUniqueQuestion();

      setRound(nextRound);
      setQuestion(nextQuestion);
    }, 900);
  };

  /**
   * Restart button used when this component
   * is running without an external GameShell.
   */
  const restartGame = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    questionHistory.current.clear();

    const newQuestion =
      generateQuestion(tier);

    questionHistory.current.add(
      newQuestion.question,
    );

    setRound(0);
    setCorrect(0);
    setPopped(null);
    setFeedback(null);
    setFinishedResult(null);
    setQuestion(newQuestion);
  };

  /**
   * Local result screen.
   *
   * If your GameShell supplies onComplete,
   * it can display its own results screen instead.
   */
  if (finishedResult && !onComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-card rounded-3xl shadow-xl border-2 border-border p-8 text-center"
        >
          <div className="text-6xl mb-4">
            🎈
          </div>

          <h2
            className="text-3xl font-black mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
            }}
          >
            Number Pop Complete!
          </h2>

          <p className="text-xl font-bold mb-2">
            You got {finishedResult.correct} out of{' '}
            {finishedResult.total} correct.
          </p>

          <p className="text-2xl font-black text-primary mb-4">
            Score: {finishedResult.score}%
          </p>

          <div className="text-4xl mb-6">
            {'⭐'.repeat(finishedResult.stars)}
            {'☆'.repeat(
              Math.max(
                0,
                3 - finishedResult.stars,
              ),
            )}
          </div>

          <button
            type="button"
            onClick={restartGame}
            className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-md hover:scale-105 transition-transform"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-background">

      {/* Progress */}
      <div className="w-full max-w-md mb-6">

        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">

          <span>
            Question {round + 1} of {TOTAL_ROUNDS}
          </span>

          <span>
            ⭐ {correct} correct
          </span>

        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden">

          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{
              width: `${
                ((round + 1) /
                  TOTAL_ROUNDS) *
                100
              }%`,
            }}
            transition={{
              duration: 0.35,
            }}
          />

        </div>
      </div>

      {/* Maths question */}
      <motion.div
        key={question.question}
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        className="text-4xl font-black text-foreground mb-8 bg-card rounded-2xl px-8 py-4 shadow-md border-2 border-border"
        style={{
          fontFamily: 'var(--font-heading)',
        }}
      >
        {question.question}
      </motion.div>

      {/* Correct / Wrong feedback */}
      <div className="h-14 mb-2">

        <AnimatePresence mode="wait">

          {feedback && (
            <motion.div
              key={feedback}
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className={`text-3xl font-black ${
                feedback === 'correct'
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}
            >
              {feedback === 'correct'
                ? '🎉 Correct!'
                : '❌ Not this one!'}
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Balloons */}
      <div className="relative w-full max-w-md h-48">

        {balloons.map(balloon => (
          <motion.button
            type="button"
            key={balloon.id}
            style={{
              left: `${balloon.x}%`,
              position: 'absolute',
              bottom: 0,
              transform: 'translateX(-50%)',
            }}
            animate={
              popped === balloon.id
                ? {
                    scale: 0,
                    opacity: 0,
                  }
                : {
                    y: [0, -12, 0],
                  }
            }
            transition={
              popped === balloon.id
                ? {
                    duration: 0.3,
                  }
                : {
                    duration:
                      1.5 +
                      balloon.id * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            whileHover={
              popped === null
                ? {
                    scale: 1.1,
                  }
                : undefined
            }
            whileTap={
              popped === null
                ? {
                    scale: 0.95,
                  }
                : undefined
            }
            onClick={() =>
              popBalloon(balloon)
            }
            disabled={popped !== null}
            className={`w-16 h-16 rounded-full ${balloon.color} text-white font-black text-xl shadow-lg flex items-center justify-center cursor-pointer disabled:cursor-default`}
            aria-label={`Pop balloon ${balloon.value}`}
          >
            {balloon.value}
          </motion.button>
        ))}

      </div>

      {/* Instructions */}
      <p className="mt-6 text-muted-foreground text-sm font-bold text-center">
        Pop the balloon with the right answer!
      </p>

    </div>


  );
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
