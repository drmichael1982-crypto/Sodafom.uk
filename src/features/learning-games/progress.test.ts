import { describe, expect, it } from "vitest";
import { numberBondsGame } from "./catalog";
import {
  assertProgressReceiptMatchesAttempt,
  createGameCompletionCommand,
} from "./progress";

const validAttempt = {
  attemptId: "attempt-opaque-123",
  gameId: numberBondsGame.id,
  gameVersion: numberBondsGame.version,
  contentVersion: numberBondsGame.questionSource.contentVersion,
  expiresAt: "2099-01-01T00:00:00.000Z",
  mode: "online" as const,
};

describe("game progress boundary", () => {
  it("creates a versioned, idempotent command without personal data or raw answers", () => {
    const command = createGameCompletionCommand({
      definition: numberBondsGame,
      attempt: validAttempt,
      score: 2,
    });

    expect(command).toMatchObject({
      schemaVersion: 1,
      idempotencyKey: "attempt-opaque-123:completed",
      attemptId: "attempt-opaque-123",
      activityKind: "game",
      activityVersion: 1,
      eventType: "completed",
      scorePercent: 67,
    });
    expect(command).not.toHaveProperty("learnerName");
    expect(command).not.toHaveProperty("childUserId");
    expect(command).not.toHaveProperty("tenantId");
    expect(command).not.toHaveProperty("results");
  });

  it("rejects a receipt for different or expired content", () => {
    expect(() =>
      createGameCompletionCommand({
        definition: numberBondsGame,
        attempt: { ...validAttempt, gameId: "different-game" },
        score: 2,
      }),
    ).toThrow(/does not match/i);

    expect(() =>
      createGameCompletionCommand({
        definition: numberBondsGame,
        attempt: { ...validAttempt, expiresAt: "2020-01-01T00:00:00.000Z" },
        score: 2,
      }),
    ).toThrow(/expired/i);
  });

  it("accepts only progress and reward receipts for the same attempt", () => {
    expect(() =>
      assertProgressReceiptMatchesAttempt(
        {
          schemaVersion: 1,
          attemptId: validAttempt.attemptId,
          status: "recorded",
          reward: {
            schemaVersion: 1,
            ledgerEntryId: "reward-ledger-1",
            attemptId: validAttempt.attemptId,
            kind: "stars",
            amount: 3,
          },
        },
        validAttempt,
      ),
    ).not.toThrow();

    expect(() =>
      assertProgressReceiptMatchesAttempt(
        {
          schemaVersion: 1,
          attemptId: "different-attempt",
          status: "recorded",
        },
        validAttempt,
      ),
    ).toThrow(/does not match/i);
  });
});
