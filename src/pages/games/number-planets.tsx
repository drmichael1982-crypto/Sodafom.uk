import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import GameShell, {
  useChildAge,
  type GameResult,
} from "@/components/games/GameShell";
import {
  listenForGameAnswer,
  normaliseVoiceAnswer,
} from "@/lib/archie/game-voice";
import "./number-planets.css";

export function makePlanetQuestion(tier: number, index: number) {
  const a = tier === 1 ? index + 1 : 2 + index;
  const b = tier === 1 ? 1 + (index % 4) : 3 + (index % 6);
  const operation = tier === 1 ? "+" : tier === 3 && index % 2 ? "÷" : "×";
  const left = operation === "÷" ? a * b : a;
  const answer = operation === "+" ? a + b : operation === "÷" ? a : a * b;
  const values = [answer, answer + 1, Math.max(0, answer - 1), answer + 3];
  const options = values.slice(index % 4).concat(values.slice(0, index % 4));
  return {
    a: left,
    b,
    operation,
    answer,
    options,
    prompt: `${left} ${operation} ${b} = ?`,
    hint:
      operation === "+"
        ? `Start at ${left}, then count on ${b}.`
        : operation === "÷"
          ? `How many groups of ${b} make ${left}?`
          : `Draw ${left} equal groups of ${b}.`,
    explanation: `${left} ${operation} ${b} = ${answer}. ${operation === "×" ? `That is ${left} equal groups of ${b}.` : operation === "÷" ? `Check: ${answer} × ${b} = ${left}.` : "Count both groups together."}`,
  };
}
const PLANETS = [
  ["Mercury", "#aab1b6", "The closest planet to the Sun."],
  ["Venus", "#ecc08f", "A rocky planet with a very hot surface."],
  ["Earth", "#39aef7", "Our home planet."],
  ["Mars", "#ee805e", "A rocky planet known as the Red Planet."],
  ["Jupiter", "#dcb48d", "The largest planet in our solar system."],
  ["Saturn", "#e9d2a3", "A giant planet with bright rings."],
  ["Uranus", "#7fd9dc", "An ice giant."],
  ["Neptune", "#4a79ef", "The most distant of the eight planets from the Sun."],
];
export function NumberPlanetsPlay({
  onComplete,
  onQuestionChange,
}: {
  onComplete: (result: GameResult) => void;
  onQuestionChange?: (prompt: string, options: string[]) => void;
}) {
  const { tier } = useChildAge();
  const [round, setRound] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [mistake, setMistake] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [paused, setPaused] = useState(false);
  const [motion, setMotion] = useState(true);
  const [planet, setPlanet] = useState(2);
  const [atoms, setAtoms] = useState(false);
  const questionId = useId();
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const answeredButton = useRef<HTMLButtonElement | null>(null);
  const advancingButton = useRef<HTMLButtonElement | null>(null);
  const question = makePlanetQuestion(tier || 2, round);
  useEffect(() => {
    const origin = answeredButton.current;
    answeredButton.current = null;
    if (
      correct &&
      origin &&
      (document.activeElement === origin || document.activeElement === document.body)
    ) {
      nextButton.current?.focus();
    }
  }, [correct]);
  useEffect(() => {
    const origin = advancingButton.current;
    advancingButton.current = null;
    if (
      origin &&
      (document.activeElement === origin || document.activeElement === document.body)
    ) {
      questionHeading.current?.focus();
    }
  }, [round]);
  useEffect(() => {
    setRound(0);
    setFirstTry(0);
    setMistake(false);
    setCorrect(false);
    setFeedback("");
  }, [tier]);
  useEffect(() => {
    onQuestionChange?.(question.prompt, question.options.map(String));
  }, [question.prompt, onQuestionChange]);
  function choose(value: number, origin?: HTMLButtonElement) {
    if (paused || correct) return;
    if (value === question.answer) {
      // Tutor answers keep focus in the tutor; only follow a focused choice.
      answeredButton.current = origin === document.activeElement ? origin : null;
      setCorrect(true);
      if (!mistake) setFirstTry((n) => n + 1);
      setFeedback("Correct! " + question.explanation);
    } else {
      setMistake(true);
      setFeedback("Try another planet. " + question.hint);
    }
  }
  useEffect(
    () =>
      listenForGameAnswer("Number Planets", (text) => {
        const value = Number(normaliseVoiceAnswer(text));
        if (
          !normaliseVoiceAnswer(text) ||
          !question.options.includes(value) ||
          paused ||
          correct
        )
          return;
        choose(value);
        return value === question.answer
          ? "Correct! " + question.explanation
          : "Have another go. " + question.hint;
      }),
    [question.prompt, paused, correct, mistake],
  );
  function next(event: MouseEvent<HTMLButtonElement>) {
    if (!correct || paused) return;
    if (round === 7) {
      const score = Math.round((firstTry / 8) * 100);
      onComplete({
        score,
        correct: firstTry,
        total: 8,
        stars: score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0,
      });
    } else {
      advancingButton.current =
        event.currentTarget === document.activeElement ? event.currentTarget : null;
      setRound((n) => n + 1);
      setCorrect(false);
      setMistake(false);
      setFeedback("");
    }
  }
  return (
    <section className="number-planets">
      <div className="planet-toolbar">
        <p>
          Mission {round + 1} of 8 · {firstTry} first-try discoveries
        </p>
        <button onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume mission" : "Pause mission"}
        </button>
        <button aria-pressed={!motion} onClick={() => setMotion((m) => !m)}>
          {motion ? "Still planets" : "Moving planets"}
        </button>
      </div>
      <div
        className={
          "planet-space " +
          (correct ? "is-correct " : mistake ? "needs-another-look " : "") +
          (!motion || paused ? "is-still" : "")
        }
      >
        <div className="orbit-sun" aria-hidden="true" />
        {PLANETS.map(([name, colour], i) => (
          <div
            className="planet-orbit"
            key={name}
            style={
              {
                "--orbit": `${36 - i * 4}%`,
                "--speed": `${16 + i * 4}s`,
                "--angle": `${i * 43}deg`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <span
              className="orbit-body"
              style={{
                background: `radial-gradient(circle at 30% 25%,white,${colour} 40%,#17284b)`,
              }}
            />
          </div>
        ))}
        <div id={questionId} className="planet-equation" aria-label={question.prompt}>
          <strong>{question.a}</strong>{" "}
          <strong>{question.operation}</strong>{" "}
          <strong>{question.b}</strong>{" "}
          <strong>= ?</strong>
        </div>
        <p className="planet-model-note">
          Playful space model · sizes, distances and speeds are not to scale
        </p>
      </div>
      {paused ? (
        <div className="planet-break">
          <h2>Time for a breather</h2>
          <p>Your mission is waiting. Resume when you are ready.</p>
        </div>
      ) : (
        <>
          <h2
            ref={questionHeading}
            tabIndex={-1}
            aria-describedby={questionId}
            className="planet-answer-heading"
          >
            Choose the answer planet
          </h2>
          <div
            className="answer-planets"
            role="group"
            aria-label="Answer planets"
          >
            {question.options.map((value, i) => (
              <button
                key={value}
                disabled={correct}
                className={correct ? "correct-planet" : ""}
                style={
                  { "--planet-colour": PLANETS[i + 2][1] } as CSSProperties
                }
                onClick={(event) => choose(value, event.currentTarget)}
                aria-label={"Answer " + value}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="planet-feedback" role="status">
            {feedback ||
              "Take your time. Choose a planet or tell Archie its number."}
          </p>
          <button
            className="planet-action"
            onClick={() => setFeedback(question.hint)}
          >
            Show a hint
          </button>
          {correct && (
            <button ref={nextButton} className="planet-action" onClick={next}>
              {round === 7 ? "Finish space mission" : "Next space mission"}
            </button>
          )}
        </>
      )}
      <details className="planet-explorer">
        <summary>Explore the real planets</summary>
        <div className="planet-selector">
          {PLANETS.map(([name], i) => (
            <button
              key={name}
              aria-pressed={planet === i}
              onClick={() => setPlanet(i)}
            >
              {name}
            </button>
          ))}
        </div>
        <h3>{PLANETS[planet][0]}</h3>
        <p>{PLANETS[planet][2]}</p>
        <p>
          Planets travel around the Sun. This game picture is a playful model,
          so real orbits and sizes are different.
        </p>
      </details>
      {tier === 3 && (
        <details className="planet-explorer">
          <summary>Explore a simplified atom model</summary>
          <button aria-pressed={atoms} onClick={() => setAtoms((a) => !a)}>
            {atoms ? "Still atom picture" : "Show moving atom picture"}
          </button>
          <div
            className={
              "atom-model " + (!atoms || !motion || paused ? "is-still" : "")
            }
            role="img"
            aria-label="Simplified neutral carbon atom: nucleus with six protons and six neutrons, surrounded by six electrons"
          >
            <div className="atom-nucleus">
              6 p⁺
              <br />6 n
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="electron-track"
                style={
                  {
                    "--angle": `${i * 60}deg`,
                    "--speed": `${10 + i}s`,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                <span />
              </div>
            ))}
          </div>
          <p>
            A carbon atom has six protons. This carbon-12 picture also shows six
            neutrons and, for a neutral atom, six electrons. Electrons occupy
            regions around the nucleus; these moving circles are a simplified
            model, not their literal paths. The picture is not to scale.
          </p>
        </details>
      )}
    </section>
  );
}
export default function NumberPlanets() {
  const [context, setContext] = useState<{ prompt: string; options: string[] }>(
    { prompt: "", options: [] },
  );
  const update = useCallback(
    (prompt: string, options: string[]) => setContext({ prompt, options }),
    [],
  );
  return (
    <GameShell
      title="Number Planets"
      emoji="🪐"
      subject="maths"
      ageGroups={["5–7", "8–10", "11–13"]}
      currentQuestion={context.prompt}
      currentOptions={context.options}
    >
      {(onComplete) => (
        <NumberPlanetsPlay onComplete={onComplete} onQuestionChange={update} />
      )}
    </GameShell>
  );
}
