import { describe, expect, it } from "vitest";
import { numberBondsGame } from "./catalog";
import { createGameCompletionEvent, createRewardRequest } from "./progress";

describe("game progress boundary", () => {
  it("creates a versioned, idempotent completion event without learner personal data", () => {
    const results = [
      { questionId: "bond-7", answerId: "3", correct: true },
      { questionId: "bond-4", answerId: "5", correct: false },
      { questionId: "bond-9", answerId: "1", correct: true },
    ];
    const event = createGameCompletionEvent({
      definition: numberBondsGame,
      sessionId: "session-safe-id",
      score: 2,
      results,
    });

    expect(event).toMatchObject({
      schemaVersion: 1,
      eventId: "session-safe-id:number-bonds-to-10:completed",
      activityType: "game",
      scorePercent: 67,
      correctCount: 2,
      questionCount: 3,
    });
    expect(event).not.toHaveProperty("learnerName");
    expect(createRewardRequest(event)).toMatchObject({
      schemaVersion: 1,
      requestId: `${event.eventId}:reward`,
      reason: "activity-completed",
      scorePercent: 67,
    });
  });
});
