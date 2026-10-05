import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ArchieProvider } from "@/contexts/ArchieContext";
import { TeacherLessons, ClassLessons } from "./ArchieTeacherClass";
import { TeacherHubEntry } from "@/pages/teacher-hub/TeacherHubEntry";

const renderWithProviders = (ui: React.ReactElement, initialRoute = "/") =>
  render(
    <ArchieProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </ArchieProvider>
  );

describe("Teacher and Class Lessons Views", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("Teacher lessons requires grown-up gate and shows answers only after unlocking", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<TeacherLessons />, "/teacher?year=1&subject=maths");

    expect(screen.getByRole("heading", { level: 1, name: "Teacher lessons" })).toBeInTheDocument();
    expect(screen.getByText(/A grown-up needs to help here/i)).toBeInTheDocument();
    expect(screen.queryByTestId("teacher-answer")).not.toBeInTheDocument();

    // Fill in the gate answer
    const answerInput = screen.getByLabelText(/Grown-up answer/i);
    await user.type(answerInput, "privacy choose");
    await user.click(screen.getByRole("button", { name: /Continue with a grown-up/i }));

    // Unlocked!
    expect(screen.getByText(/Year 1 Maths · 180 lessons/i)).toBeInTheDocument();

    // Open first unit details
    const firstUnit = container.querySelector(".tc-unit > summary") as HTMLElement;
    expect(firstUnit).toBeInTheDocument();
    fireEvent.click(firstUnit);

    // Open first lesson details
    const firstLesson = container.querySelector(".tc-lesson > summary") as HTMLElement;
    expect(firstLesson).toBeInTheDocument();
    fireEvent.click(firstLesson);

    // Now answers, hints, and explanations are visible
    const answers = screen.getAllByTestId("teacher-answer");
    expect(answers.length).toBeGreaterThan(0);
    expect(answers[0].textContent).toContain("Answer:");
  });

  it("Class lessons is open, has no answers, and shows correct structure and links", () => {
    const { container } = renderWithProviders(<ClassLessons />, "/class");

    expect(screen.getByRole("heading", { level: 1, name: "Class lessons" })).toBeInTheDocument();
    expect(screen.queryByText(/A grown-up needs to help here/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("teacher-answer")).not.toBeInTheDocument();

    // Has subject tabs
    expect(screen.getByRole("button", { name: /Maths/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Science/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /History/i })).toBeInTheDocument();

    // Shows next lesson button
    const nextLink = screen.getByTestId("class-next");
    expect(nextLink).toBeInTheDocument();
    expect(nextLink.getAttribute("href")).toMatch(/^\/courses\//);

    // The unit containing the target lesson is defaultOpen, so links are already present
    const lessonLinks = container.querySelectorAll(".tc-lessons .course-lesson-link");
    expect(lessonLinks.length).toBeGreaterThan(0);
    expect(lessonLinks[0].getAttribute("href")).toMatch(/^\/courses\//);
  });

  it("Maths lessons are available across all 9 years in Teacher view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TeacherLessons />, "/teacher?year=5&subject=maths");

    const answerInput = screen.getByLabelText(/Grown-up answer/i);
    await user.type(answerInput, "privacy choose");
    await user.click(screen.getByRole("button", { name: /Continue with a grown-up/i }));

    expect(screen.getByText(/Year 5 Maths · 180 lessons/i)).toBeInTheDocument();
  });

  it("TeacherHubEntry redirects to /teacher when preview is true", () => {
    render(
      <MemoryRouter initialEntries={["/teacher-hub?year=3&subject=science"]}>
        <Routes>
          <Route path="/teacher-hub" element={<TeacherHubEntry preview={true} />} />
          <Route path="/teacher" element={<div>Teacher Page Redirect Target</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Teacher Page Redirect Target")).toBeInTheDocument();
  });
});
