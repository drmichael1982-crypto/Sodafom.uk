import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const voice = vi.hoisted(() => ({ playing: false }));
vi.mock("@/lib/voice-context", () => ({
  useVoice: () => ({ speak: vi.fn(), stop: vi.fn(), playing: voice.playing }),
}));
import FractionJigsaw, { fractionTask } from "./FractionJigsaw";
import { PicturePauseContext } from "@/lib/archie/picture-pause";
beforeEach(() => {
  localStorage.clear();
  voice.playing = false;
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function answer(index: number, year = 3) {
  const t = fractionTask(index, year);
  if (t.kind === "build") {
    for (let i = 1; i <= t.numerator; i++)
      fireEvent.click(
        screen.getByRole("button", { name: `Fraction section ${i}` }),
      );
    fireEvent.click(screen.getByRole("button", { name: "Check the fraction" }));
  } else fireEvent.click(screen.getByRole("button", { name: t.answer }));
}
it("retries a wrong fraction and automatically asks another question after a correct answer", () => {
  vi.useFakeTimers();
  render(<FractionJigsaw />);
  fireEvent.click(screen.getByRole("button", { name: "Check the fraction" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "You have placed 0 sections",
  );
  answer(0);
  expect(screen.getByRole("status")).toHaveTextContent("1 out of 8");
  act(() => vi.advanceTimersByTime(2400));
  expect(screen.getByText("Question 2 of 10")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Can you make 1/2?" }),
  ).toBeInTheDocument();
  expect(screen.getByText("0 first-try answers")).toBeInTheDocument();
});
it("supports native keyboard placement and removal", async () => {
  const user = userEvent.setup();
  render(<FractionJigsaw />);
  const button = screen.getByRole("button", { name: "Fraction section 1" });
  button.focus();
  await user.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-pressed", "true");
  await user.keyboard(" ");
  expect(button).toHaveAttribute("aria-pressed", "false");
});
it("covers ten build, identify and equivalent questions, saves one result and starts another round", () => {
  render(<FractionJigsaw />);
  for (let index = 0; index < 10; index++) {
    answer(index);
    fireEvent.click(
      screen.getByRole("button", {
        name: index === 9 ? "See my results" : "Next question",
      }),
    );
  }
  expect(
    screen.getByRole("heading", { name: "Ten fractions explored!" }),
  ).toBeInTheDocument();
  const data = JSON.parse(
    localStorage.getItem("sodafom_archie_design_v1") || "{}",
  );
  expect(data.activities).toHaveLength(1);
  expect(data.activities[0].stars).toBe(3);
  expect(data.activities[0].title).toContain("10 first-try answers");
  fireEvent.click(
    screen.getByRole("button", { name: "Play ten more questions" }),
  );
  expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Can you make 2/5?" }),
  ).toBeInTheDocument();
});
it("does not advance while paused or in a page-picture break", () => {
  vi.useFakeTimers();
  const view = render(
    <PicturePauseContext.Provider value={false}>
      <FractionJigsaw />
    </PicturePauseContext.Provider>,
  );
  answer(0);
  view.rerender(
    <PicturePauseContext.Provider value={true}>
      <FractionJigsaw />
    </PicturePauseContext.Provider>,
  );
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
  view.rerender(
    <PicturePauseContext.Provider value={false}>
      <FractionJigsaw />
    </PicturePauseContext.Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Pause questions" }));
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Resume questions" }));
  act(() => vi.advanceTimersByTime(2400));
  expect(screen.getByText("Question 2 of 10")).toBeInTheDocument();
});
it("keeps Year 1 to halves and quarters and gives each choice exactly one mathematical answer", () => {
  for (let year = 1; year <= 9; year++)
    for (let round = 0; round < 10; round++) {
      const t = fractionTask(round, year);
      if (year === 1) expect([2, 4]).toContain(t.denominator);
      expect(t.numerator).toBeLessThan(t.denominator);
      expect(new Set(t.options).size).toBe(4);
      const value = t.numerator / t.denominator;
      expect(
        t.options.filter((option) => {
          const [n, d] = option.split("/").map(Number);
          return n / d === value;
        }),
      ).toEqual([t.answer]);
    }
});

it("waits for spoken feedback before advancing", () => {
  vi.useFakeTimers();
  voice.playing = true;
  const view = render(<FractionJigsaw />);
  answer(0);
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
  voice.playing = false;
  view.rerender(<FractionJigsaw />);
  act(() => vi.advanceTimersByTime(2400));
  expect(screen.getByText("Question 2 of 10")).toBeInTheDocument();
});
