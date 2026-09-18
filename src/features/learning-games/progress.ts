import { scorePercentage } from "./engine";
import type { GameAttemptReceipt, LearningGameDefinition } from "./types";

/**
 * Boundary shared with the future app-wide progress service.
 *
 * Games emit facts through this port. They deliberately do not choose storage,
 * update totals, or write rewards, so lessons and reading can use one upstream
 * progress service without competing local state.
 */
export interface GameCompletionCommandV1 {
  schemaVersion: 1;
  idempotencyKey: string;
  attemptId: string;
  activityKind: "game";
  activityId: string;
  activityVersion: number;
  eventType: "completed";
  scorePercent: number;
  skillCodes: readonly string[];
  source: "client";
}

export type LearningProgressSink = (
  event: GameCompletionCommandV1,
) => GameProgressReceiptV1 | Promise<GameProgressReceiptV1>;

export interface VerifiedGameRewardV1 {
  schemaVersion: 1;
  ledgerEntryId: string;
  attemptId: string;
  kind: "stars" | "badge";
  amount?: number;
}

export type LearningRewardHook = (
  reward: VerifiedGameRewardV1,
) => void | Promise<void>;

export interface GameProgressReceiptV1 {
  schemaVersion: 1;
  attemptId: string;
  status: "queued" | "recorded";
  reward?: VerifiedGameRewardV1;
}

export function createGameCompletionCommand(input: {
  definition: LearningGameDefinition;
  attempt: GameAttemptReceipt;
  score: number;
}): GameCompletionCommandV1 {
  assertAttemptMatchesGame(input.attempt, input.definition);
  const questionCount = input.definition.questions.length;
  return {
    schemaVersion: 1,
    idempotencyKey: `${input.attempt.attemptId}:completed`,
    attemptId: input.attempt.attemptId,
    activityKind: "game",
    activityId: input.definition.id,
    activityVersion: input.definition.version,
    eventType: "completed",
    scorePercent: scorePercentage(input.score, questionCount),
    skillCodes: input.definition.skillCodes,
    source: "client",
  };
}

export function assertAttemptMatchesGame(
  attempt: GameAttemptReceipt,
  definition: LearningGameDefinition,
): void {
  if (
    attempt.gameId !== definition.id ||
    attempt.gameVersion !== definition.version ||
    attempt.contentVersion !== definition.questionSource.contentVersion
  ) {
    throw new Error("Game attempt does not match the reviewed game content.");
  }

  const expiresAt = Date.parse(attempt.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("Game attempt has expired.");
  }
}

export function assertProgressReceiptMatchesAttempt(
  receipt: GameProgressReceiptV1,
  attempt: GameAttemptReceipt,
): void {
  if (receipt.attemptId !== attempt.attemptId) {
    throw new Error("Progress receipt does not match the game attempt.");
  }
  if (receipt.reward && receipt.reward.attemptId !== attempt.attemptId) {
    throw new Error("Reward receipt does not match the game attempt.");
  }
}
