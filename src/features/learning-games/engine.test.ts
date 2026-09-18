import { describe, expect, it } from "vitest";
import {
  INITIAL_LEARNING_GAME_SESSION,
  learningGameReducer,
  scorePercentage,
} from "./engine";

describe("learningGameReducer", () => {
  it("runs a complete, deterministic question flow", () => {
    const started = learningGameReducer(INITIAL_LEARNING_GAME_SESSION, {
      type: "start",
    });
    expect(started.phase).toBe("playing");

    const answered = learningGameReducer(started, {
      type: "answer",
      questionId: "question-1",
      answerId: "answer-a",
      correct: true,
    });
    expect(answered).toMatchObject({
      phase: "feedback",
      score: 1,
      selectedAnswerId: "answer-a",
    });
    expect(answered.results).toHaveLength(1);

    const next = learningGameReducer(answered, {
      type: "next",
      questionCount: 2,
    });
    expect(next).toMatchObject({
      phase: "playing",
      questionIndex: 1,
      selectedAnswerId: null,
    });

    const secondAnswer = learningGameReducer(next, {
      type: "answer",
      questionId: "question-2",
      answerId: "answer-b",
      correct: false,
    });
    const completed = learningGameReducer(secondAnswer, {
      type: "next",
      questionCount: 2,
    });
    expect(completed).toMatchObject({ phase: "completed", score: 1 });
    expect(completed.results).toHaveLength(2);
  });

  it("ignores duplicate answers so a score cannot be inflated", () => {
    const started = learningGameReducer(INITIAL_LEARNING_GAME_SESSION, {
      type: "start",
    });
    const answered = learningGameReducer(started, {
      type: "answer",
      questionId: "question-1",
      answerId: "answer-a",
      correct: true,
    });
    const duplicate = learningGameReducer(answered, {
      type: "answer",
      questionId: "question-1",
      answerId: "answer-a",
      correct: true,
    });
    expect(duplicate).toBe(answered);
    expect(duplicate.score).toBe(1);
  });

  it("pauses and resumes without losing the current question", () => {
    const started = learningGameReducer(INITIAL_LEARNING_GAME_SESSION, {
      type: "start",
    });
    const paused = learningGameReducer(started, { type: "pause" });
    expect(paused).toMatchObject({
      phase: "paused",
      previousPhase: "playing",
      questionIndex: 0,
    });
    const resumed = learningGameReducer(paused, { type: "resume" });
    expect(resumed).toMatchObject({
      phase: "playing",
      previousPhase: null,
      questionIndex: 0,
    });
  });
});

describe("scorePercentage", () => {
  it("clamps invalid values", () => {
    expect(scorePercentage(2, 3)).toBe(67);
    expect(scorePercentage(10, 3)).toBe(100);
    expect(scorePercentage(1, 0)).toBe(0);
  });
});
