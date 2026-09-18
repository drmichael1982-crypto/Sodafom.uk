import type { LearningGameAction, LearningGameSession } from "./types";

export const INITIAL_LEARNING_GAME_SESSION: LearningGameSession = {
  phase: "ready",
  questionIndex: 0,
  score: 0,
  results: [],
  selectedAnswerId: null,
  previousPhase: null,
};

export function learningGameReducer(
  state: LearningGameSession,
  action: LearningGameAction,
): LearningGameSession {
  switch (action.type) {
    case "start":
      if (state.phase !== "ready") return state;
      return { ...state, phase: "playing" };

    case "answer":
      if (state.phase !== "playing") return state;
      return {
        ...state,
        phase: "feedback",
        score: state.score + (action.correct ? 1 : 0),
        selectedAnswerId: action.answerId,
        results: [
          ...state.results,
          {
            questionId: action.questionId,
            answerId: action.answerId,
            correct: action.correct,
          },
        ],
      };

    case "next": {
      if (state.phase !== "feedback") return state;
      const hasAnotherQuestion = state.questionIndex + 1 < action.questionCount;
      if (!hasAnotherQuestion) {
        return { ...state, phase: "completed", selectedAnswerId: null };
      }
      return {
        ...state,
        phase: "playing",
        questionIndex: state.questionIndex + 1,
        selectedAnswerId: null,
      };
    }

    case "pause":
      if (state.phase !== "playing" && state.phase !== "feedback") return state;
      return { ...state, phase: "paused", previousPhase: state.phase };

    case "resume":
      if (state.phase !== "paused" || !state.previousPhase) return state;
      return { ...state, phase: state.previousPhase, previousPhase: null };

    case "restart":
      return INITIAL_LEARNING_GAME_SESSION;
  }
}

export function scorePercentage(score: number, questionCount: number): number {
  if (!Number.isFinite(questionCount) || questionCount <= 0) return 0;
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(score, questionCount))
    : 0;
  return Math.round((safeScore / questionCount) * 100);
}
