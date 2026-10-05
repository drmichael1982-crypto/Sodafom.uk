import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { ttsSpeak, stopTts, setGameContext, clearGameContext } = vi.hoisted(() => ({
  ttsSpeak: vi.fn(),
  stopTts: vi.fn(),
  setGameContext: vi.fn(),
  clearGameContext: vi.fn(),
}));
vi.mock("@/lib/voice-context", () => ({ ttsSpeak, stopTts }));
vi.mock("@/contexts/ArchieContext", () => ({
  useArchieContext: () => ({ setGameContext, clearGameContext }),
}));
vi.mock("@dr.pogodin/react-helmet", () => ({ Helmet: () => null }));
vi.mock("@/components/ArchieCharacter", () => ({ ArchieCharacter: () => <div /> }));
vi.mock("@/components/Blackboard", () => ({
  Blackboard: (props: {
    questionText?: string;
    options?: string[];
    onOptionSelect?: (option: string) => void;
    feedback?: { message: string } | null;
    hintText?: string | null;
  }) => (
    <section>
      <h2>{props.questionText}</h2>
      {props.options?.map((option) => (
        <button key={option} onClick={() => props.onOptionSelect?.(option)}>
          {option}
        </button>
      ))}
      {props.feedback && <p>{props.feedback.message}</p>}
      {props.hintText && <p>{props.hintText}</p>}
    </section>
  ),
}));
vi.mock("@/lib/tutor/curriculum", () => {
  const question = (id: string, answer: string) => ({
    id,
    question: "Question " + id,
    options: ["wrong", answer],
    answer,
    hint: "Hint " + id,
    explanation: "Because " + id,
    simplerExplanation: "Simply " + id,
    difficulty: 1,
  });
  const lesson = (id: string, ageGroup: string, questions: unknown[]) => ({
    id,
    subject: "Maths",
    topic: id,
    ageGroup,
    title: "Lesson " + id,
    explanation: "Explaining " + id,
    simplerExplanation: "Simpler " + id,
    examples: ["Example " + id],
    questions,
  });
  const CURRICULUM_LESSONS = [
    lesson("A", "8-10", [question("A1", "right"), question("A2", "right")]),
    lesson("B", "8-10", [question("B1", "right")]),
    lesson("Young", "5-7", [question("Y1", "right")]),
  ];
  return {
    CURRICULUM_LESSONS,
    tutorLessonsFor: (age: string) => {
      const lessons = CURRICULUM_LESSONS.filter((item) => item.ageGroup === age);
      return lessons.length ? { lessons, matched: true } : { lessons: CURRICULUM_LESSONS, matched: false };
    },
  };
});
import TeacherModePage from "./TeacherModePage";

const named = (name = "Sophie", ageGroup = "8-10") =>
  localStorage.setItem("sodafom_tutor_memory", JSON.stringify({ childName: name, ageGroup, topics: {} }));
const show = () =>
  render(
    <MemoryRouter>
      <TeacherModePage />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  delete (window as any).SpeechRecognition;
});

describe("Teacher Mode", () => {
  it("does not require a real name: a grown-up can skip setup, with a privacy note", () => {
    show();
    expect(screen.getByLabelText("Nickname (optional)")).not.toBeRequired();
    expect(screen.getByText(/You do not need a real name/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));
    expect(screen.getByRole("heading", { name: "Question A1" })).toBeInTheDocument();
    expect(screen.getByText("Ready to learn")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("sodafom_tutor_memory")!);
    expect(saved.profileSetupComplete).toBe(true);
    expect(saved.childName).toBeUndefined();
    cleanup();
    show();
    expect(screen.getByRole("heading", { name: "Question A1" })).toBeInTheDocument();
  });

  it("keeps existing saved named profiles working and links to the full lesson library", () => {
    named();
    show();
    expect(screen.getByText("Learning with Sophie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the full lesson library" })).toHaveAttribute("href", "/courses");
  });

  it("waits for an explicit Next after a correct answer, with no timer, then shows an end screen instead of looping", () => {
    vi.useFakeTimers();
    named();
    const view = show();
    fireEvent.click(screen.getByRole("button", { name: "wrong" }));
    expect(screen.getByText(/Not quite yet, and that is okay/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next/ })).not.toBeInTheDocument();
    const timeouts = vi.spyOn(globalThis, "setTimeout");
    fireEvent.click(screen.getByRole("button", { name: "right" }));
    expect(timeouts.mock.calls.filter(([, delay]) => Number(delay) >= 1000)).toEqual([]);
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByRole("heading", { name: "Question A1" })).toBeInTheDocument();
    const next = screen.getByRole("button", { name: "Next question" });
    expect(next).toHaveFocus();
    expect(setGameContext.mock.calls.at(-1)![4]).toMatchObject({ phase: "practice", answeredCorrectly: true });

    fireEvent.click(next);
    expect(screen.getByRole("heading", { name: "Question A2" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "right" }));
    fireEvent.click(screen.getByRole("button", { name: "Next lesson" }));
    expect(screen.getByRole("heading", { name: "Question B1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "right" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish my lessons" }));

    expect(screen.getByRole("heading", { name: "You finished all 2 tutor lessons!" })).toHaveFocus();
    expect(screen.queryByRole("heading", { name: "Question A1" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review Lesson B (Maths)" }));
    expect(screen.getByRole("heading", { name: "Question B1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "right" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish my lessons" }));
    fireEvent.click(screen.getByRole("button", { name: "Start again from the first lesson" }));
    expect(screen.getByRole("heading", { name: "Question A1" })).toBeInTheDocument();
    expect(timeouts.mock.calls.filter(([, delay]) => Number(delay) >= 1000)).toEqual([]);
    view.unmount();
    expect(() => act(() => vi.advanceTimersByTime(10000))).not.toThrow();
  });

  it("filters lessons by the configured age group", () => {
    named("Kit", "5-7");
    show();
    expect(screen.getByRole("heading", { name: "Question Y1" })).toBeInTheDocument();
  });

  it("shows an inline status instead of alert() when voice commands are unsupported", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    named();
    show();
    fireEvent.click(screen.getByRole("button", { name: /Voice/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Voice commands are not supported");
    expect(alert).not.toHaveBeenCalled();
  });

  it("starts and stops the microphone, and releases it and speech on unmount", () => {
    const instances: Array<{ start: ReturnType<typeof vi.fn>; abort: ReturnType<typeof vi.fn> }> = [];
    (window as any).SpeechRecognition = class {
      start = vi.fn();
      abort = vi.fn();
      stop = vi.fn();
      constructor() {
        instances.push(this);
      }
    };
    named();
    const view = show();
    fireEvent.click(screen.getByRole("button", { name: /Voice/ }));
    expect(instances[0].start).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Listening");
    fireEvent.click(screen.getByRole("button", { name: /Stop voice/ }));
    expect(instances[0].abort).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Voice/ }));
    stopTts.mockClear();
    view.unmount();
    expect(instances[1].abort).toHaveBeenCalled();
    expect(stopTts).toHaveBeenCalled();
  });
});
