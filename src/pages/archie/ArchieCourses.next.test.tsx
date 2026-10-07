import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseLesson } from "@/lib/archie/course-types";

const { make } = vi.hoisted(() => ({
  make: (
    id: string,
    subject: string,
    week: number,
    session: number,
    extra: Record<string, unknown> = {},
  ) => ({
    id,
    subject,
    year: 2,
    week,
    session,
    title: "Lesson " + id,
    unit: "Unit",
    objective: "Objective for " + id,
    teaching: ["Key idea for " + id + "."],
    vocabulary: [{ word: "word-" + id, meaning: "meaning of " + id }],
    example: { prompt: "Example " + id, explanation: "Worked method for " + id },
    questions: [
      {
        prompt: "Question for " + id,
        options: ["red", "blue", "green"],
        answer: 1,
        hint: "Hint for " + id,
        explanation: "Explanation for " + id,
      },
    ],
    mission: { title: "Mission", instructions: ["Step one"] },
    reflection: "Reflect on " + id,
    source: "https://www.gov.uk/government/collections/national-curriculum",
    ...extra,
  }),
}));
const lessons = vi.hoisted(() => ({
  // Deliberately out of order in the array: the path follows week/session.
  maths: [make("m2", "maths", 1, 2), make("m1", "maths", 1, 1), make("m3", "maths", 2, 1)],
  english: [make("e1", "english", 1, 1), make("e2", "english", 1, 2)],
  history: [make("h1", "history", 1, 1, { sensitive: true }), make("h2", "history", 2, 1)],
  science: [make("s1", "science", 1, 1), make("s2", "science", 2, 1)],
}));
vi.mock("./ArchiePages", () => ({
  Page: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));
vi.mock("@/lib/archie/maths-course", () => ({ MATHS_LESSONS: lessons.maths }));
vi.mock("@/lib/archie/history-course", () => ({ HISTORY_LESSONS: lessons.history }));
vi.mock("@/lib/archie/english-course", () => ({ ENGLISH_LESSONS: lessons.english }));
vi.mock("@/lib/archie/science-course", () => ({ SCIENCE_LESSONS: lessons.science }));
const { stop, speak, setGameContext, clearGameContext } = vi.hoisted(() => ({
  stop: vi.fn(),
  speak: vi.fn(),
  setGameContext: vi.fn(),
  clearGameContext: vi.fn(),
}));
vi.mock("@/lib/voice-context", () => ({ useVoice: () => ({ stop, speak }) }));
vi.mock("@/contexts/ArchieContext", () => ({
  useArchieContext: () => ({ setGameContext, clearGameContext }),
}));
import { CoursePlayer } from "./ArchieCourses";

const resume = (id: string, phase: number) =>
  localStorage.setItem(
    "sodafom_course_resume:" + id,
    JSON.stringify({ phase, question: 0, answers: phase > 2 ? [1] : [], missions: phase > 3 ? [0] : [], reflection: phase > 3 ? "I can explain a new thing" : "" }),
  );
const show = (lesson: unknown) =>
  render(
    <MemoryRouter>
      <CoursePlayer lesson={lesson as CourseLesson} />
    </MemoryRouter>,
  );
const lastContext = () => setGameContext.mock.calls.at(-1)!;

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("lesson finish: recap and next lesson", () => {
  it.each([
    ["maths", lessons.maths[1], "m2"],
    ["maths", lessons.maths[0], "m3"],
    ["english", lessons.english[0], "e2"],
    ["science", lessons.science[0], "s2"],
  ])("offers the next %s lesson in week/session order", (_subject, lesson, nextId) => {
    resume(lesson.id, 5);
    show(lesson);
    expect(screen.getByRole("heading", { name: "Adventure complete!" })).toHaveFocus();
    const next = screen.getByRole("link", { name: new RegExp("Next lesson: Lesson " + nextId) });
    expect(next).toHaveAttribute("href", "/courses/" + nextId);
    expect(screen.queryByRole("note", { name: "End of this path" })).not.toBeInTheDocument();
  });
  it("shows a concise recap from the lesson data and can read it aloud", () => {
    const lesson = lessons.english[0];
    resume(lesson.id, 5);
    show(lesson);
    const recap = screen.getByRole("region", { name: "Lesson recap" });
    expect(recap).toHaveTextContent("Today's goal: Objective for e1");
    expect(recap).toHaveTextContent("word-e1: meaning of e1");
    expect(recap).toHaveTextContent("Key point: Key idea for e1.");
    fireEvent.click(screen.getByRole("button", { name: "Read the recap" }));
    expect(speak).toHaveBeenCalledWith("read:course", expect.stringContaining("Objective for e1"));
  });
  it.each([
    ["maths", lessons.maths[2], "Maths"],
    ["english", lessons.english[1], "English"],
    ["science", lessons.science[1], "Science"],
  ])("ends the %s path with review and other-subject choices", (_subject, lesson, label) => {
    resume(lesson.id, 5);
    show(lesson);
    expect(screen.queryByRole("link", { name: /Next lesson/ })).not.toBeInTheDocument();
    const end = screen.getByRole("note", { name: "End of this path" });
    expect(end).toHaveTextContent("end of the Year 2 " + label + " path");
    expect(screen.getByRole("link", { name: "Review this year's lessons" })).toHaveAttribute(
      "href",
      "/courses?year=2&subject=" + lesson.subject,
    );
    expect(screen.queryByRole("link", { name: "Choose " + label })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Choose (Maths|History|English|Science)$/ })).toHaveLength(3);
    expect(lastContext()[5]).toMatchObject({ phase: "complete", nextLessonTitle: null });
  });
  it("keeps the sensitive history gate and no stars, then links to the next history lesson", async () => {
    const lesson = lessons.history[0];
    resume(lesson.id, 5);
    show(lesson);
    expect(screen.queryByText(/Next lesson/)).not.toBeInTheDocument();
    await userEvent.setup().type(screen.getByRole("textbox"), "privacy choose{Enter}");
    expect(await screen.findByRole("heading", { name: "Learning session complete" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "See my stars" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Next lesson: Lesson h2/ })).toHaveAttribute("href", "/courses/h2");
  });
});

describe("lesson context shared with Archie", () => {
  it("includes phase, subject, objective and worked example, and the hint during practice", () => {
    const lesson = lessons.science[0];
    resume(lesson.id, 2);
    show(lesson);
    const [title, subject, question, options, , details] = lastContext();
    expect([title, subject, question, options]).toEqual([
      "Lesson s1",
      "Science",
      "Question for s1",
      ["red", "blue", "green"],
    ]);
    expect(details).toMatchObject({
      phase: "practice",
      phaseLabel: "Play and practise",
      subject: "science",
      objective: "Objective for s1",
      workedExample: { prompt: "Example s1", explanation: "Worked method for s1" },
      hint: "Hint for s1",
      answeredCorrectly: false,
      wrongAttempts: 0,
    });
    expect(details.explanation).toBeUndefined();
  });
  it("counts kind wrong attempts, nudges to the worked method, and shares the explanation only after a correct answer", () => {
    const lesson = lessons.maths[1];
    resume(lesson.id, 2);
    show(lesson);
    fireEvent.click(screen.getByRole("button", { name: "red" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite yet, and that is okay.");
    expect(screen.getByRole("status")).not.toHaveTextContent("Worked method");
    fireEvent.click(screen.getByRole("button", { name: "green" }));
    expect(screen.getByRole("status")).toHaveTextContent("Look back at the worked example: Example m1 Worked method for m1");
    expect(screen.getByRole("status")).not.toHaveTextContent("blue");
    expect(lastContext()[5]).toMatchObject({ wrongAttempts: 2, answeredCorrectly: false });
    fireEvent.click(screen.getByRole("button", { name: "blue" }));
    expect(lastContext()[5]).toMatchObject({ answeredCorrectly: true, explanation: "Explanation for m1" });
  });
  it("describes the discover phase without practice answers", () => {
    const lesson = lessons.english[0];
    show(lesson);
    const details = lastContext()[5];
    expect(details).toMatchObject({ phase: "discover", subject: "english", keyPoint: "Key idea for e1." });
    expect(details.correctOption).toBeUndefined();
    expect(details.hint).toBeUndefined();
  });
});
