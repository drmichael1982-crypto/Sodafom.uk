import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { numberBondsGame } from "../catalog";
import { MultipleChoiceLearningGame } from "./MultipleChoiceLearningGame";

describe("MultipleChoiceLearningGame", () => {
  it("gives kind corrective feedback and emits progress only after completion", async () => {
    const user = userEvent.setup();
    const onProgress = vi.fn();
    const onReward = vi.fn();
    render(
      <MultipleChoiceLearningGame
        definition={numberBondsGame}
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
        correctCount: 2,
        scorePercent: 67,
      }),
    );
    expect(onReward).toHaveBeenCalledTimes(1);
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
