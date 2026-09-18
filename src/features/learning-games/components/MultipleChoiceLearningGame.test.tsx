import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { numberBondsGame } from "../catalog";
import { MultipleChoiceLearningGame } from "./MultipleChoiceLearningGame";

const validAttempt = {
  attemptId: "attempt-opaque-123",
  gameId: numberBondsGame.id,
  gameVersion: numberBondsGame.version,
  contentVersion: numberBondsGame.questionSource.contentVersion,
  expiresAt: "2099-01-01T00:00:00.000Z",
  mode: "online" as const,
};

describe("MultipleChoiceLearningGame", () => {
  it("gives kind corrective feedback and emits progress only after completion", async () => {
    const user = userEvent.setup();
    const onProgress = vi.fn().mockResolvedValue({
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
    });
    const onReward = vi.fn();
    render(
      <MultipleChoiceLearningGame
        definition={numberBondsGame}
        attempt={validAttempt}
        onExit={() => undefined}
        onProgress={onProgress}
        onReward={onReward}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText(/not quite right yet/i)).toBeVisible();
    expect(onProgress).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("button", { name: "1" }));
    await user.click(screen.getByRole("button", { name: "See my result" }));

    expect(
      screen.getByRole("heading", { name: "Game complete" }),
    ).toBeVisible();
    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: "number-bonds-to-10",
        attemptId: "attempt-opaque-123",
        idempotencyKey: "attempt-opaque-123:completed",
        scorePercent: 67,
      }),
    );
    await waitFor(() => expect(onReward).toHaveBeenCalledTimes(1));
    expect(onReward).toHaveBeenCalledWith(
      expect.objectContaining({
        ledgerEntryId: "reward-ledger-1",
        attemptId: validAttempt.attemptId,
      }),
    );
  });

  it("fails closed in practice mode when no trusted attempt was issued", async () => {
    const user = userEvent.setup();
    const onProgress = vi.fn();
    render(
      <MultipleChoiceLearningGame
        definition={numberBondsGame}
        onExit={() => undefined}
        onProgress={onProgress}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start" }));
    for (const [answer, next] of [
      ["3", "Next question"],
      ["6", "Next question"],
      ["1", "See my result"],
    ] as const) {
      await user.click(screen.getByRole("button", { name: answer }));
      await user.click(screen.getByRole("button", { name: next }));
    }

    expect(onProgress).not.toHaveBeenCalled();
    expect(screen.getByText(/Practice mode/i)).toBeVisible();
  });

  it("can pause and resume without losing progress", async () => {
    const user = userEvent.setup();
    render(
      <MultipleChoiceLearningGame
        definition={numberBondsGame}
        onExit={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText("Question 1 of 3")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("heading", { name: "Game paused" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Carry on" }));
    expect(screen.getByText("Question 1 of 3")).toBeVisible();
  });
});
