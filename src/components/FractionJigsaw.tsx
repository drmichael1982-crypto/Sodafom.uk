import { useEffect, useRef, useState } from "react";
import { useVoice } from "@/lib/voice-context";
import { usePicturePuzzlePause } from "@/lib/archie/picture-pause";
import "./fraction-jigsaw.css";
import { useArchieData } from "@/lib/archie/storage";

export const FRACTION_ROUND_LENGTH = 10;
export function fractionTask(round: number, year: number, session = 0) {
  const bank =
    year <= 1
      ? [
          [1, 2],
          [1, 4],
        ]
      : year === 2
        ? [
            [1, 2],
            [1, 4],
            [3, 4],
            [1, 3],
            [2, 3],
            [2, 4],
          ]
        : year <= 4
          ? [
              [1, 8],
              [1, 2],
              [1, 4],
              [3, 4],
              [2, 8],
              [3, 8],
              [1, 3],
              [2, 3],
              [3, 5],
              [5, 8],
              [2, 5],
              [4, 6],
            ]
          : [
              [1, 8],
              [3, 4],
              [2, 3],
              [3, 5],
              [5, 6],
              [7, 8],
              [3, 10],
              [7, 12],
              [4, 5],
              [5, 12],
              [9, 10],
              [2, 6],
              [3, 8],
              [4, 6],
              [7, 10],
              [11, 12],
            ];
  const [numerator, denominator] =
    bank[(round + session * FRACTION_ROUND_LENGTH) % bank.length];
  const kind =
    round % 3 === 1
      ? "name"
      : round % 3 === 2 && year >= 3
        ? "equivalent"
        : "build";
  const prompt =
    kind === "build"
      ? `Can you make ${numerator}/${denominator}?`
      : kind === "name"
        ? "What fraction of the circle is shaded?"
        : `Which fraction is the same as ${numerator}/${denominator}?`;
  const answer =
    kind === "equivalent"
      ? `${numerator * 2}/${denominator * 2}`
      : `${numerator}/${denominator}`;
  const wrong =
    kind === "equivalent"
      ? [
          `${numerator}/${denominator * 2}`,
          `${numerator * 2}/${denominator}`,
          `${numerator}/${denominator + 1}`,
        ]
      : [
          `${Math.max(0, numerator - 1)}/${denominator}`,
          `${numerator + 1}/${denominator}`,
          `${numerator}/${denominator + 1}`,
        ];
  const options = [answer, ...wrong].sort((a, b) => a.localeCompare(b));
  return { numerator, denominator, kind, prompt, answer, options };
}
export default function FractionJigsaw({ year = 3 }: { year?: number }) {
  const [round, setRound] = useState(0),
    [session, setSession] = useState(0),
    [pieces, setPieces] = useState<number[]>([]);
  const [notice, setNotice] = useState(
    "Tap equal sections, then check your answer.",
  );
  const [done, setDone] = useState(false),
    [paused, setPaused] = useState(false),
    [finished, setFinished] = useState(false);
  const [mistake, setMistake] = useState(false),
    [score, setScore] = useState(0),
    [support, setSupport] = useState(false);
  const { complete } = useArchieData();
  const saved = useRef(false);
  const [sessionId] = useState(() => Date.now());
  const { speak, stop, playing } = useVoice();
  const puzzlePause = usePicturePuzzlePause();
  const base = fractionTask(round, year, session);
  const task = support
    ? {
        ...base,
        kind: "build",
        prompt: `Can you make ${base.numerator}/${base.denominator}?`,
      }
    : base;
  const { numerator, denominator, kind } = task;
  function advance() {
    stop();
    if (round === FRACTION_ROUND_LENGTH - 1) {
      setFinished(true);
      return;
    }
    setSupport(mistake);
    setRound((r) => r + 1);
    setPieces([]);
    setDone(false);
    setMistake(false);
    setNotice("A new question. Take your time and try it.");
  }
  useEffect(() => {
    if (!done || paused || puzzlePause || finished || playing) return;
    const timer = setTimeout(advance, 2400);
    return () => clearTimeout(timer);
  }, [done, paused, puzzlePause, finished, playing, round]);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    if (!finished || saved.current) return;
    saved.current = true;
    complete({
      id: `fraction-picture-${year}-${sessionId}-${session}`,
      kind: "lesson",
      title: `Fractions · 10 questions · ${score} first-try answers`,
      stars: score >= 8 ? 3 : score >= 5 ? 2 : 1,
    });
  }, [finished, complete, score, session, sessionId, year]);
  function toggle(i: number) {
    if (done || paused || puzzlePause) return;
    setPieces((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    setNotice("Check your fraction when you are ready.");
  }
  function check(answer?: string) {
    if (done || paused || puzzlePause) return;
    const correct =
      kind === "build" ? pieces.length === numerator : answer === task.answer;
    if (correct) {
      setDone(true);
      if (!mistake) setScore((s) => s + 1);
      const message =
        kind === "equivalent"
          ? `Yes! ${numerator}/${denominator} and ${task.answer} cover the same amount. Multiply the top and bottom numbers by 2.`
          : `It fits! ${numerator} out of ${denominator} equal sections makes ${numerator}/${denominator}.`;
      setNotice(message);
      speak("fraction-feedback", message);
    } else {
      setMistake(true);
      setNotice(
        kind === "build"
          ? `You have placed ${pieces.length} sections. ${pieces.length > numerator ? "Remove a few" : "Add a few"} until there are ${numerator}. Try again.`
          : kind === "equivalent"
            ? "Multiply both the top and bottom numbers by the same number. Try another answer."
            : `Count the shaded sections for the top number. There are ${denominator} equal sections altogether for the bottom number. Try another answer.`,
      );
    }
  }
  function restart() {
    stop();
    saved.current = false;
    setSupport(false);
    setSession((s) => s + 1);
    setRound(0);
    setPieces([]);
    setDone(false);
    setFinished(false);
    setPaused(false);
    setMistake(false);
    setScore(0);
    setNotice("Ten more questions. Let’s build, read and match fractions.");
  }
  if (finished)
    return (
      <section
        className="fraction-jigsaw fraction-round-complete"
        aria-label="Fraction circle jigsaw"
      >
        <h3>Ten fractions explored!</h3>
        <p role="status">
          {score} of {FRACTION_ROUND_LENGTH} correct on the first try. You
          worked through all ten questions.
        </p>
        <p>{"★ ".repeat(score >= 8 ? 3 : score >= 5 ? 2 : 1)}</p>
        <button type="button" onClick={restart}>
          Play ten more questions
        </button>
      </section>
    );
  return (
    <section
      className={`fraction-jigsaw ${done ? "fraction-answer-correct" : ""}`}
      aria-label="Fraction circle jigsaw"
    >
      <div className="fraction-question-count">
        <strong>
          Question {round + 1} of {FRACTION_ROUND_LENGTH}
        </strong>
        <span>{score} first-try answers</span>
      </div>
      <progress
        aria-label="Fraction questions completed"
        value={round + (done ? 1 : 0)}
        max={FRACTION_ROUND_LENGTH}
      />
      <h3>{task.prompt}</h3>
      <div className="fraction-tools">
        <button
          type="button"
          onClick={() =>
            speak(
              "fraction-question",
              task.prompt +
                (kind === "build"
                  ? ` The circle has ${denominator} equal sections. Tap ${numerator}.`
                  : ""),
            )
          }
        >
          Read question
        </button>
        <button
          type="button"
          onClick={() => {
            stop();
            setPaused((p) => !p);
          }}
        >
          {paused ? "Resume questions" : "Pause questions"}
        </button>
      </div>
      {paused ? (
        <p role="status">Your question is paused. Resume when you are ready.</p>
      ) : (
        <>
          <div className="fraction-task-layout">
            <div>
              <svg
                className="fraction-circle"
                viewBox="0 0 240 240"
                role="img"
                aria-label={`${denominator} equal sections; ${kind === "build" ? pieces.length : numerator} shaded`}
              >
                {Array.from({ length: denominator }, (_, i) => {
                  const start = (2 * Math.PI * i) / denominator - Math.PI / 2,
                    end = (2 * Math.PI * (i + 1)) / denominator - Math.PI / 2;
                  const x = (a: number) => 120 + 105 * Math.cos(a),
                    y = (a: number) => 120 + 105 * Math.sin(a);
                  const filled =
                    kind === "build" ? pieces.includes(i) : i < numerator;
                  return (
                    <g key={i} onClick={() => kind === "build" && toggle(i)}>
                      <path
                        d={`M120 120L${x(start)} ${y(start)}A105 105 0 0 1 ${x(end)} ${y(end)}Z`}
                        fill={filled ? "#ffcf54" : "#e4f1fd"}
                        stroke="#173560"
                        strokeWidth="3"
                      />
                      <text
                        x={120 + 70 * Math.cos((start + end) / 2)}
                        y={125 + 70 * Math.sin((start + end) / 2)}
                        textAnchor="middle"
                        fill="#173560"
                        fontSize="14"
                      >
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="fraction-answer-area">
              {kind === "build" ? (
                <>
                  <p>
                    The whole has {denominator} equal sections. Fit {numerator}{" "}
                    {numerator === 1 ? "section" : "sections"}.
                  </p>
                  <div
                    className="fraction-section-buttons"
                    role="group"
                    aria-label="Choose fraction sections"
                  >
                    {Array.from({ length: denominator }, (_, i) => (
                      <button
                        type="button"
                        key={i}
                        aria-label={`Fraction section ${i + 1}`}
                        aria-pressed={pieces.includes(i)}
                        disabled={done}
                        onClick={() => toggle(i)}
                      >
                        {i + 1}
                        {pieces.includes(i) ? " ✓" : ""}
                      </button>
                    ))}
                  </div>
                  <button type="button" disabled={done} onClick={() => check()}>
                    Check the fraction
                  </button>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => {
                      setPieces([]);
                      setNotice("Choose your sections again.");
                    }}
                  >
                    Clear pieces
                  </button>
                </>
              ) : (
                <div
                  className="fraction-choice-buttons"
                  role="group"
                  aria-label="Fraction answers"
                >
                  {task.options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      disabled={done}
                      onClick={() => check(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="fraction-feedback" role="status" aria-live="polite">
            {notice}
          </p>
          {done && (
            <button type="button" onClick={advance}>
              {round === FRACTION_ROUND_LENGTH - 1
                ? "See my results"
                : "Next question"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
