import { scorePercentage } from "./engine";
import type { LearningGameDefinition, LearningGameResult } from "./types";

/**
 * Boundary shared with the future app-wide progress service.
 *
 * Games emit facts through this port. They deliberately do not choose storage,
 * update totals, or write rewards, so lessons and reading can use one upstream
 * progress service without competing local state.
 */
export interface LearningActivityCompletedEventV1 {
  schemaVersion: 1;
  eventId: string;
  activityType: "game";
  activityId: string;
  sessionId: string;
  subject: LearningGameDefinition["subject"];
  skills: readonly string[];
  correctCount: number;
  questionCount: number;
  scorePercent: number;
  results: readonly LearningGameResult[];
}

export type LearningProgressSink = (
  event: LearningActivityCompletedEventV1,
) => void | Promise<void>;

export interface LearningRewardRequestV1 {
  schemaVersion: 1;
  requestId: string;
  reason: "activity-completed";
  activityType: "game";
  activityId: string;
  sessionId: string;
  scorePercent: number;
}

export type LearningRewardHook = (
  request: LearningRewardRequestV1,
) => void | Promise<void>;

export function createGameCompletionEvent(input: {
  definition: LearningGameDefinition;
  sessionId: string;
  score: number;
  results: readonly LearningGameResult[];
}): LearningActivityCompletedEventV1 {
  const questionCount = input.definition.questions.length;
  return {
    schemaVersion: 1,
    eventId: `${input.sessionId}:${input.definition.id}:completed`,
    activityType: "game",
    activityId: input.definition.id,
    sessionId: input.sessionId,
    subject: input.definition.subject,
    skills: input.definition.skills,
    correctCount: input.score,
    questionCount,
    scorePercent: scorePercentage(input.score, questionCount),
    results: input.results,
  };
}

export function createRewardRequest(
  event: LearningActivityCompletedEventV1,
): LearningRewardRequestV1 {
  return {
    schemaVersion: 1,
    requestId: `${event.eventId}:reward`,
    reason: "activity-completed",
    activityType: "game",
    activityId: event.activityId,
    sessionId: event.sessionId,
    scorePercent: event.scorePercent,
  };
}
