import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
const { age } = vi.hoisted(() => ({ age: { tier: 1 } }));
vi.mock("@/components/games/GameShell", () => ({
  default: () => null,
  useChildAge: () => age,
}));
import { makePlanetQuestion, NumberPlanetsPlay } from "./number-planets";
import { submitGameVoiceAnswer } from "@/lib/archie/game-voice";
afterEach(() => {
  age.tier = 1;
});
describe("Number Planets", () => {
  it.each([1, 2, 3])("keeps retry focus, follows correct answers to Next and announces the next question for age tier %i", async (tier) => {
    const user = userEvent.setup();
    age.tier = tier;
    const onComplete = vi.fn();
    const view = render(<NumberPlanetsPlay onComplete={onComplete} />);
    const first = makePlanetQuestion(tier, 0);
    const wrong = screen.getByRole("button", { name: "Answer " + first.options.find(value => value !== first.answer) });
    act(() => wrong.focus());
    await user.keyboard("{Enter}");
    expect(wrong).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Next space mission" })).not.toBeInTheDocument();
    for (let round = 0; round < 8; round++) {
      const question = makePlanetQuestion(tier, round);
      const right = screen.getByRole("button", { name: "Answer " + question.answer });
      act(() => right.focus());
      await user.keyboard(round % 2 ? " " : "{Enter}");
      const next = screen.getByRole("button", { name: round === 7 ? "Finish space mission" : "Next space mission" });
      expect(next).toHaveFocus();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.getByText(new RegExp("Mission " + (round + 1) + " of 8"))).toBeInTheDocument();
      await user.keyboard("{Enter}");
      if (round < 7) {
        const heading = screen.getByRole("heading", { name: "Choose the answer planet" });
        expect(heading).toHaveFocus();
        expect(heading).toHaveAccessibleDescription(makePlanetQuestion(tier, round + 1).prompt);
        await user.tab();
        expect(screen.getByRole("button", { name: "Answer " + makePlanetQuestion(tier, round + 1).options[0] })).toHaveFocus();
      }
    }
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: 88, correct: 7, total: 8, stars: 2 });
    view.unmount();
  });
  it("keeps focus in the tutor when the answer bridge solves the current mission", async () => {
    const user = userEvent.setup();
    render(<><NumberPlanetsPlay onComplete={vi.fn()} /><input aria-label="Your question for Archie" /></>);
    const helper = screen.getByRole("textbox", { name: "Your question for Archie" });
    await user.type(helper, "two");
    act(() => { expect(submitGameVoiceAnswer("Number Planets", "two")).toContain("Correct!"); });
    expect(helper).toHaveFocus();
    expect(screen.getByRole("button", { name: "Next space mission" })).not.toHaveFocus();
    expect(screen.getByText(/Mission 1 of 8/)).toBeInTheDocument();
  });
  it("offers unique answers for all rounds and age tiers, with correct arithmetic", () => {
    for (const tier of [1, 2, 3])
      for (let round = 0; round < 8; round++) {
        const q = makePlanetQuestion(tier, round);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(q.answer);
        const result =
          q.operation === "+"
            ? q.a + q.b
            : q.operation === "×"
              ? q.a * q.b
              : q.a / q.b;
        expect(q.answer).toBe(result);
        expect(q.operation).toBe(
          tier === 1 ? "+" : tier === 3 && round % 2 ? "÷" : "×",
        );
      }
  });
  it("keeps a wrong answer for another try and advances only when asked", () => {
    const onComplete = vi.fn();
    render(<NumberPlanetsPlay onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "Answer 3" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Start at 1, then count on 1",
    );
    expect(screen.getByText(/Mission 1 of 8/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Answer 2" }));
    expect(screen.getByRole("button", { name: "Answer 2" })).toHaveClass("correct-planet");
    for (const value of [1, 3, 5]) {
      expect(screen.getByRole("button", { name: "Answer " + value })).toHaveClass("other-planet");
      expect(screen.getByRole("button", { name: "Answer " + value })).not.toHaveClass("correct-planet");
    }
    expect(screen.getByRole("status")).toHaveTextContent("1 + 1 = 2");
    expect(screen.getByText(/0 first-try discoveries/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next space mission" }));
    expect(screen.getByText(/Mission 2 of 8/)).toBeInTheDocument();
  });
  it("accepts current answer options aloud, stops on pause and retires the voice listener on unmount", () => {
    const onQuestionChange = vi.fn();
    const { unmount } = render(
      <NumberPlanetsPlay
        onComplete={vi.fn()}
        onQuestionChange={onQuestionChange}
      />,
    );
    expect(onQuestionChange).toHaveBeenCalledWith("1 + 1 = ?", [
      "2",
      "3",
      "1",
      "5",
    ]);
    act(() =>
      expect(submitGameVoiceAnswer("Number Planets", "nineteen")).toBeFalsy(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Pause mission" }));
    act(() =>
      expect(submitGameVoiceAnswer("Number Planets", "two")).toBeFalsy(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Resume mission" }));
    act(() =>
      expect(submitGameVoiceAnswer("Number Planets", "two")).toContain(
        "Correct!",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Next space mission" }),
    ).toBeInTheDocument();
    unmount();
    expect(submitGameVoiceAnswer("Number Planets", "two")).toBeUndefined();
  });
  it("uses older learner multiplication and division and finishes after eight explicit rounds", () => {
    age.tier = 3;
    const onComplete = vi.fn();
    render(<NumberPlanetsPlay onComplete={onComplete} />);
    expect(
      screen.getByText("Explore a simplified atom model"),
    ).toBeInTheDocument();
    for (let round = 0; round < 8; round++) {
      const q = makePlanetQuestion(3, round);
      fireEvent.click(
        screen.getByRole("button", { name: "Answer " + q.answer }),
      );
      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.click(
        screen.getByRole("button", {
          name: round === 7 ? "Finish space mission" : "Next space mission",
        }),
      );
    }
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({
      score: 100,
      correct: 8,
      total: 8,
      stars: 3,
    });
  });
});
