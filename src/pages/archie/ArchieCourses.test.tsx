import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LessonTutorContext } from "@/contexts/ArchieContext";
import type { CourseLesson } from "@/lib/archie/course-types";
const { lesson, stop, speak } = vi.hoisted(() => ({
  stop: vi.fn(),
  speak: vi.fn(),
  lesson: {
    id: "test-adventure",
    subject: "maths",
    year: 1,
    week: 1,
    session: 1,
    title: "Find number keys",
    unit: "Numbers",
    objective: "Count and explain two small sums.",
    teaching: [
      "Count objects carefully.",
      "Adding combines two groups.",
      "You can draw counters to explain your answer.",
    ],
    vocabulary: [{ word: "add", meaning: "combine groups" }],
    example: {
      prompt: "One add one?",
      explanation: "One counter and one more make two.",
    },
    questions: [
      {
        prompt: "What is 1 + 1?",
        options: ["1", "2", "3"],
        answer: 1,
        hint: "Draw two single counters.",
        explanation: "One and one make two.",
      },
      {
        prompt: "What is 2 + 1?",
        options: ["2", "3", "4"],
        answer: 1,
        hint: "Count on one from two.",
        explanation: "Two and one make three.",
      },
    ],
    mission: {
      title: "Make your own sum",
      instructions: [
        "Draw two groups.",
        "Count the total.",
        "Explain your sum.",
      ],
    },
    reflection: "How can counters help you add?",
    source: "https://www.gov.uk/government/collections/national-curriculum",
  },
}));
vi.mock("./ArchiePages", () => ({
  Page: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));
vi.mock("@/lib/archie/maths-course", () => ({ MATHS_LESSONS: [lesson] }));
vi.mock("@/lib/archie/history-course", () => ({ HISTORY_LESSONS: [] }));
vi.mock("@/lib/archie/english-course", () => ({ ENGLISH_LESSONS: [] }));
vi.mock("@/lib/archie/science-course", () => ({ SCIENCE_LESSONS: [] }));
vi.mock("@/lib/voice-context", () => ({ useVoice: () => ({ stop, speak }) }));
const { setGameContext, clearGameContext } = vi.hoisted(() => ({
  setGameContext: vi.fn(),
  clearGameContext: vi.fn(),
}));
vi.mock("@/contexts/ArchieContext", () => ({
  useArchieContext: () => ({ setGameContext, clearGameContext }),
}));
import ArchieCourses, { CoursePlayer } from "./ArchieCourses";
import { submitGameVoiceAnswer } from "@/lib/archie/game-voice";
const tutorContext = () => setGameContext.mock.calls.at(-1)?.[4] as LessonTutorContext;
const answerTarget = () => tutorContext().answerTarget!;
const show = () =>
  render(
    <MemoryRouter>
      <CoursePlayer lesson={lesson as CourseLesson} />
    </MemoryRouter>,
  );
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("child lesson adventure", () => {
  it("keeps a keyboard retry on its answer and transfers a correct answer to the explicit next control", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "sodafom_course_resume:test-adventure",
      JSON.stringify({
        phase: 2,
        question: 0,
        answers: [],
        missions: [],
        reflection: "",
      }),
    );
    show();
    const wrong = screen.getByRole("button", { name: "1" });
    act(() => wrong.focus());
    await user.keyboard("{Enter}");
    expect(wrong).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Next key" })).not.toBeInTheDocument();

    const right = screen.getByRole("button", { name: "2" });
    act(() => right.focus());
    await user.keyboard("{Enter}");
    expect(right).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next key" })).toHaveFocus();
    expect(screen.getByRole("heading", { name: "What is 1 + 1?" })).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "What is 2 + 1?" })).toBeInTheDocument();
    const finalAnswer = screen.getByRole("button", { name: "3" });
    act(() => finalAnswer.focus());
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "All keys found · mission time" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "I tried my mission" })).not.toBeInTheDocument();
  });
  it("keeps focus in the helper when its answer bridge retries and then solves practice", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "sodafom_course_resume:test-adventure",
      JSON.stringify({
        phase: 2,
        question: 0,
        answers: [],
        missions: [],
        reflection: "",
      }),
    );
    render(
      <MemoryRouter>
        <CoursePlayer lesson={lesson as CourseLesson} />
        <input aria-label="Ask Archie question" />
      </MemoryRouter>,
    );
    const helperInput = screen.getByRole("textbox", { name: "Ask Archie question" });
    await user.type(helperInput, "one");
    act(() => {
      expect(submitGameVoiceAnswer(answerTarget(), "one")).toContain("Have another go");
    });
    expect(helperInput).toHaveFocus();
    await user.clear(helperInput);
    await user.type(helperInput, "two");
    act(() => {
      expect(submitGameVoiceAnswer(answerTarget(), "two")).toContain("One and one make two");
    });
    expect(helperInput).toHaveFocus();
    expect(screen.getByRole("button", { name: "Next key" })).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "2" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "What is 1 + 1?" })).toBeInTheDocument();
  });
  it("checks a spoken answer only during active practice and stops the listener after leaving", () => {
    localStorage.setItem(
      "sodafom_course_resume:test-adventure",
      JSON.stringify({
        phase: 2,
        question: 0,
        answers: [],
        missions: [],
        reflection: "",
      }),
    );
    const view = show();
    fireEvent.click(screen.getByText("Take a breather", { exact: true }));
    expect(submitGameVoiceAnswer(answerTarget(), "two")).toBeUndefined();
    fireEvent.click(screen.getByText("Resume my adventure", { exact: true }));
    act(() => {
      expect(submitGameVoiceAnswer(answerTarget(), "one")).toContain(
        "Have another go",
      );
    });
    expect(screen.getByText("Draw two single counters.")).toBeInTheDocument();
    act(() => {
      expect(submitGameVoiceAnswer(answerTarget(), "two")).toContain(
        "One and one make two",
      );
    });
    expect(screen.getByText("Next key", { exact: true })).toBeInTheDocument();
    view.unmount();
    expect(submitGameVoiceAnswer(answerTarget(), "two")).toBeUndefined();
  });
  it("publishes authored phase help and scopes answers to the lesson and exact question", () => {
    show();
    expect(tutorContext()).toMatchObject({activityId:"test-adventure",questionId:null,stepId:"test-adventure:phase:0",status:"learning"});
    expect(tutorContext().readText).toContain("Count objects carefully.");
    expect(submitGameVoiceAnswer(answerTarget(),"two")).toBeUndefined();
    fireEvent.click(screen.getByRole("button",{name:/Let's try together/}));
    expect(tutorContext().readText).toContain("One counter and one more make two.");
    fireEvent.click(screen.getByRole("button",{name:/Ready to find some keys/}));
    const first=answerTarget();
    expect(first).toBe("course:test-adventure:phase:2:question:0");
    expect(tutorContext()).toMatchObject({questionId:"test-adventure:question:0",status:"answering",hintText:"Draw two single counters."});
    expect(submitGameVoiceAnswer(lesson.title,"two")).toBeUndefined();
    act(()=>{expect(submitGameVoiceAnswer(first,"two")).toContain("One and one make two.");});
    expect(tutorContext().status).toBe("answered");
    expect(submitGameVoiceAnswer(first,"two")).toBeUndefined();
    expect(screen.getByRole("heading",{name:"What is 1 + 1?"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Next key"}));
    expect(answerTarget()).toBe("course:test-adventure:phase:2:question:1");
    expect(submitGameVoiceAnswer(first,"three")).toBeUndefined();
    expect(screen.queryByRole("button",{name:"All keys found · mission time"})).not.toBeInTheDocument();
    expect(tutorContext().hintText).toBe("Count on one from two.");
    fireEvent.click(screen.getByRole("button",{name:"Take a breather"}));
    expect(tutorContext().status).toBe("paused");
    expect(submitGameVoiceAnswer(answerTarget(),"three")).toBeUndefined();
  });
  it("does not guess when two visible choices normalise to the same spoken answer", () => {
    localStorage.setItem("sodafom_course_resume:test-adventure",JSON.stringify({phase:2,question:0,answers:[],missions:[],reflection:""}));
    const ambiguous={...lesson,questions:[{...lesson.questions[0],options:["two","2","3"]},lesson.questions[1]]} as CourseLesson;
    render(<MemoryRouter><CoursePlayer lesson={ambiguous}/></MemoryRouter>);
    act(()=>{expect(submitGameVoiceAnswer(answerTarget(),"two")).toBeUndefined();});
    expect(screen.queryByRole("button",{name:"Next key"})).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("sodafom_course_resume:test-adventure")!).answers).toEqual([]);
    expect(screen.getByRole("button",{name:"2"})).toBeEnabled();
  });
  it("gives a hint, resumes after a reload, completes a mission and saves two stars once", () => {
    let view = show();
    fireEvent.click(screen.getByRole("button", { name: /Let's try together/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Ready to find some keys/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(
      screen.getByText(/Take another look at the hint/),
    ).toBeInTheDocument();
    expect(screen.getByText("Draw two single counters.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Next key" }));
    fireEvent.click(screen.getByRole("button", { name: "Take a breather" }));
    expect(
      screen.getByRole("heading", { name: "Time for a breather" }),
    ).toBeInTheDocument();
    view.unmount();
    view = show();
    expect(screen.getByText("What is 2 + 1?")).toBeInTheDocument();
    expect(
      screen.getByLabelText("1 of 2 practice keys found"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(
      screen.getByRole("button", { name: "All keys found · mission time" }),
    );
    expect(
      screen.getByRole("button", { name: "I tried my mission" }),
    ).toBeDisabled();
    screen.getAllByRole("checkbox").forEach((box) => fireEvent.click(box));
    fireEvent.click(screen.getByRole("button", { name: "I tried my mission" }));
    fireEvent.click(
      screen.getByRole("button", { name: "I would like more practice" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Finish my adventure · 2 stars" }),
    );
    expect(
      screen.getByRole("heading", { name: "Adventure complete!" }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("sodafom_archie_design_v1")!).activities,
    ).toEqual([
      expect.objectContaining({ id: "course-test-adventure", stars: 2 }),
    ]);
    view.unmount();
    show();
    expect(
      screen.getByRole("heading", { name: "Adventure complete!" }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("sodafom_archie_design_v1")!).activities,
    ).toHaveLength(1);
  });
  it("keeps missions ticked across reloads and stops speech on a break", () => {
    localStorage.setItem(
      "sodafom_course_resume:test-adventure",
      JSON.stringify({
        phase: 3,
        question: 1,
        answers: [1, 1],
        missions: [0],
        reflection: "",
      }),
    );
    show();
    expect(
      screen.getByRole("checkbox", { name: "Draw two groups." }),
    ).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Read this part" }));
    expect(speak).toHaveBeenCalledWith(
      "read:course",
      expect.stringContaining("Make your own sum"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Take a breather" }));
    expect(stop).toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Resume my adventure" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Draw two groups." }),
    ).toBeChecked();
  });
  it("gates sensitive history before mounting its learning session, then uses reflection without stars", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "sodafom_course_resume:test-adventure",
      JSON.stringify({
        phase: 4,
        question: 1,
        answers: [1, 1],
        missions: [0, 1, 2],
        reflection: "I can explain a new thing",
      }),
    );
    render(
      <MemoryRouter>
        <CoursePlayer
          lesson={
            { ...lesson, subject: "history", sensitive: true } as CourseLesson
          }
        />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("button", { name: "Finish my learning session" }),
    ).not.toBeInTheDocument();
    expect(setGameContext).not.toHaveBeenCalled();
    await user.type(screen.getByRole("textbox"), "privacy choose{Enter}");
    expect(screen.queryByText(/2 stars/)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Finish my learning session" }),
    );
    expect(
      screen.getByRole("heading", { name: "Learning session complete" }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("sodafom_archie_design_v1")!)
        .activities[0].stars,
    ).toBe(0);
    expect(screen.queryByText("Adventure complete!")).not.toBeInTheDocument();
  });
  it("does not mount an external curriculum link until its separate grown-up gate succeeds", async () => {
    const user = userEvent.setup();
    const view = show();
    expect(view.container.querySelector('a[href^="https:"]')).toBeNull();
    await user.click(screen.getByText("For grown-ups: this lesson"));
    await user.click(
      screen.getByText("Open the external source with a grown-up"),
    );
    expect(
      screen.queryByRole("link", {
        name: "Curriculum or historical evidence source",
      }),
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox"), "privacy choose{Enter}");
    expect(
      screen.getByRole("link", {
        name: "Curriculum or historical evidence source",
      }),
    ).toHaveAttribute("href", lesson.source);
  });
  it("lets children choose a learning year while separately guarding library source links", async () => {
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter initialEntries={["/courses?year=1"]}>
        <ArchieCourses />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("combobox", { name: "Choose your school year" }),
    ).toHaveValue("1");
    expect(view.container.querySelector('a[href^="https:"]')).toBeNull();
    await user.click(screen.getByText("For grown-ups: pace and curriculum"));
    await user.click(
      screen.getByText("Open the external source with a grown-up"),
    );
    await user.type(screen.getByRole("textbox"), "privacy choose{Enter}");
    expect(
      screen.getByRole("link", {
        name: "Read the curriculum or evidence source for this unit",
      }),
    ).toHaveAttribute("href", lesson.source);
  });
});
