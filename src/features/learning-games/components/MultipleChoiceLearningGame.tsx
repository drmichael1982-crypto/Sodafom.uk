import { useId, useReducer, useRef } from "react";
import {
  INITIAL_LEARNING_GAME_SESSION,
  learningGameReducer,
  scorePercentage,
} from "../engine";
import {
  createGameCompletionEvent,
  createRewardRequest,
  type LearningProgressSink,
  type LearningRewardHook,
} from "../progress";
import type { LearningGameDefinition } from "../types";

export interface MultipleChoiceLearningGameProps {
  definition: LearningGameDefinition;
  onExit: () => void;
  onProgress?: LearningProgressSink;
  onReward?: LearningRewardHook;
  onReadAloud?: (text: string) => void;
}

export function MultipleChoiceLearningGame({
  definition,
  onExit,
  onProgress,
  onReward,
  onReadAloud,
}: MultipleChoiceLearningGameProps) {
  const reactId = useId();
  const sessionBaseId = useRef(`game-${reactId.replaceAll(":", "")}`).current;
  const attemptNumber = useRef(1);
  const emittedSessionIds = useRef(new Set<string>());
  const sessionId = `${sessionBaseId}-attempt-${attemptNumber.current}`;
  const [session, dispatch] = useReducer(
    learningGameReducer,
    INITIAL_LEARNING_GAME_SESSION,
  );
  const question = definition.questions[session.questionIndex];
  const feedbackId = `${reactId}-feedback`;

  const finishOrContinue = () => {
    const isLastQuestion =
      session.questionIndex + 1 >= definition.questions.length;
    if (isLastQuestion && !emittedSessionIds.current.has(sessionId)) {
      emittedSessionIds.current.add(sessionId);
      const event = createGameCompletionEvent({
        definition,
        sessionId,
        score: session.score,
        results: session.results,
      });
      void Promise.resolve(onProgress?.(event)).catch(() => undefined);
      void Promise.resolve(onReward?.(createRewardRequest(event))).catch(
        () => undefined,
      );
    }
    dispatch({ type: "next", questionCount: definition.questions.length });
  };

  if (session.phase === "ready") {
    return (
      <section
        aria-labelledby={`${reactId}-title`}
        className="mx-auto max-w-2xl p-4 sm:p-6"
      >
        <button
          type="button"
          onClick={onExit}
          className="min-h-11 rounded-xl px-3 font-bold underline"
        >
          Back to games
        </button>
        <div className="mt-4 rounded-3xl bg-sky-50 p-6 text-center shadow-sm">
          <p className="font-bold uppercase tracking-wide text-sky-800">
            Untimed activity
          </p>
          <h1
            id={`${reactId}-title`}
            className="mt-2 text-3xl font-black text-slate-950"
          >
            {definition.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-700">
            {definition.summary}
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "start" })}
            className="mt-6 min-h-14 rounded-2xl bg-emerald-700 px-8 py-3 text-xl font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            Start
          </button>
        </div>
      </section>
    );
  }

  if (session.phase === "completed") {
    const percent = scorePercentage(session.score, definition.questions.length);
    return (
      <section
        aria-labelledby={`${reactId}-complete`}
        className="mx-auto max-w-2xl p-4 sm:p-6"
      >
        <div
          className="rounded-3xl bg-emerald-50 p-6 text-center shadow-sm"
          role="status"
        >
          <h1
            id={`${reactId}-complete`}
            className="text-3xl font-black text-slate-950"
          >
            Game complete
          </h1>
          <p className="mt-3 text-xl font-bold text-emerald-900">
            You got {session.score} out of {definition.questions.length} correct
            ({percent}%).
          </p>
          <p className="mt-2 text-slate-700">
            Good work for finishing every question.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                attemptNumber.current += 1;
                dispatch({ type: "restart" });
              }}
              className="min-h-12 rounded-2xl bg-sky-800 px-6 py-3 font-black text-white"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={onExit}
              className="min-h-12 rounded-2xl border-2 border-slate-700 px-6 py-3 font-black text-slate-900"
            >
              Choose another game
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (session.phase === "paused") {
    return (
      <section
        aria-labelledby={`${reactId}-paused`}
        className="mx-auto max-w-2xl p-6 text-center"
      >
        <div className="rounded-3xl bg-amber-50 p-8 shadow-sm">
          <h1
            id={`${reactId}-paused`}
            className="text-3xl font-black text-slate-950"
          >
            Game paused
          </h1>
          <p className="mt-3 text-slate-700">
            Your place is safe on this device.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "resume" })}
            className="mt-6 min-h-14 rounded-2xl bg-emerald-700 px-8 py-3 text-xl font-black text-white"
          >
            Carry on
          </button>
        </div>
      </section>
    );
  }

  const selectedAnswer = question.answers.find(
    (answer) => answer.id === session.selectedAnswerId,
  );
  const isCorrect = session.selectedAnswerId === question.correctAnswerId;

  return (
    <section
      aria-labelledby={`${reactId}-question`}
      className="mx-auto max-w-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="min-h-11 rounded-xl px-3 font-bold underline"
        >
          Exit game
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "pause" })}
          className="min-h-11 rounded-xl border-2 border-slate-600 px-4 font-bold"
        >
          Pause
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-5 shadow-md sm:p-7">
        <p className="font-bold text-sky-800">
          Question {session.questionIndex + 1} of {definition.questions.length}
        </p>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Game progress"
          aria-valuemin={0}
          aria-valuemax={definition.questions.length}
          aria-valuenow={session.questionIndex + 1}
        >
          <div
            className="h-full bg-sky-700"
            style={{
              width: `${((session.questionIndex + 1) / definition.questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-3">
          <h1
            id={`${reactId}-question`}
            className="text-2xl font-black text-slate-950 sm:text-3xl"
          >
            {question.prompt}
          </h1>
          {onReadAloud ? (
            <button
              type="button"
              onClick={() =>
                onReadAloud(
                  [
                    question.prompt,
                    ...question.answers.map((answer) => answer.label),
                  ].join(". "),
                )
              }
              className="min-h-12 shrink-0 rounded-full border-2 border-sky-700 px-4 font-bold text-sky-900"
              aria-label="Read the question and answers aloud"
            >
              Read aloud
            </button>
          ) : null}
        </div>

        <div
          className="mt-6 grid gap-3"
          role="group"
          aria-label="Answer choices"
          aria-describedby={feedbackId}
        >
          {question.answers.map((answer) => (
            <button
              key={answer.id}
              type="button"
              disabled={session.phase === "feedback"}
              onClick={() =>
                dispatch({
                  type: "answer",
                  questionId: question.id,
                  answerId: answer.id,
                  correct: answer.id === question.correctAnswerId,
                })
              }
              className="min-h-14 rounded-2xl border-2 border-sky-700 bg-sky-50 px-5 py-3 text-left text-xl font-bold text-slate-950 enabled:hover:bg-sky-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-default disabled:opacity-80"
            >
              {answer.label}
            </button>
          ))}
        </div>

        <div
          id={feedbackId}
          className="mt-5 min-h-24"
          aria-live="polite"
          aria-atomic="true"
        >
          {session.phase === "feedback" ? (
            <div
              className={`rounded-2xl p-4 ${isCorrect ? "bg-emerald-50" : "bg-amber-50"}`}
            >
              <p className="text-xl font-black text-slate-950">
                {isCorrect
                  ? "That’s right!"
                  : `${selectedAnswer?.label ?? "That answer"} is not quite right yet.`}
              </p>
              <p className="mt-1 text-slate-800">{question.explanation}</p>
              <button
                type="button"
                onClick={finishOrContinue}
                className="mt-4 min-h-12 rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                {session.questionIndex + 1 === definition.questions.length
                  ? "See my result"
                  : "Next question"}
              </button>
            </div>
          ) : (
            <p className="text-slate-600">
              Choose one answer. Take as long as you need.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
