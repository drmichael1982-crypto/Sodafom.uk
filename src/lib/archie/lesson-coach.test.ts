import { describe, expect, it } from "vitest";
import {
  coachLessonReply,
  guardPracticeReply,
  lessonContextForService,
  practiceNudge,
  revealsAnswer,
  type LessonCoachContext,
} from "./lesson-coach";
import { tryLocalArchieResponse } from "../archie-local";

const practice: LessonCoachContext = {
  phase: "practice",
  phaseLabel: "Play and practise",
  subject: "maths",
  objective: "Add two small numbers",
  workedExample: { prompt: "One add one?", explanation: "One counter and one more make two counters." },
  hint: "Count on from the bigger number.",
  correctOption: "7",
  answeredCorrectly: false,
  wrongAttempts: 0,
};

describe("Archie lesson coach", () => {
  it("never gives the correct choice for answer requests during practice", () => {
    for (const ask of ["What is the answer?", "just tell me", "is it 7?", "which one is correct"]) {
      const reply = coachLessonReply(ask, practice)!;
      expect(reply).toContain("I will not tell you the answer yet");
      expect(revealsAnswer(reply, "7")).toBe(false);
      expect(reply).toContain("Count on from the bigger number.");
    }
  });
  it("adds the worked method after repeated wrong tries, still without the answer", () => {
    const reply = coachLessonReply("help", { ...practice, wrongAttempts: 2 })!;
    expect(reply).toContain("worked example");
    expect(reply).toContain("One counter and one more");
    expect(revealsAnswer(reply, "7")).toBe(false);
  });
  it("drops a worked example or hint that would itself reveal the answer", () => {
    const reply = practiceNudge(
      { ...practice, hint: "It is 7.", wrongAttempts: 3, workedExample: { prompt: "3 + 4", explanation: "makes 7" } },
      true,
    );
    expect(revealsAnswer(reply, "7")).toBe(false);
  });
  it("replaces a local maths answer that would reveal the practice answer", () => {
    const local = tryLocalArchieResponse("What is 3 + 4?")!.text;
    expect(revealsAnswer(local, "7")).toBe(true);
    const guarded = guardPracticeReply(local, practice);
    expect(revealsAnswer(guarded, "7")).toBe(false);
    expect(guarded).toContain("Hint:");
  });
  it("explains fully once the child has answered correctly", () => {
    const solved = { ...practice, answeredCorrectly: true, explanation: "3 and 4 make 7." };
    expect(guardPracticeReply("3 + 4 = 7", solved)).toBe("3 + 4 = 7");
    expect(coachLessonReply("why?", solved)).toContain("3 and 4 make 7.");
  });
  it("uses evidence and explanation language for history, science and reading", () => {
    expect(coachLessonReply("hint", { ...practice, subject: "history", correctOption: "A diary" })).toMatch(/evidence/);
    expect(coachLessonReply("hint", { ...practice, subject: "science", correctOption: "Melting" })).toMatch(/observe/);
    const english = coachLessonReply("hint", { ...practice, subject: "english", correctOption: "Brave" })!;
    expect(english).toMatch(/clue/);
    expect(english).not.toMatch(/spell/i);
  });
  it("answers by phase from the supplied lesson content", () => {
    expect(coachLessonReply("what do I do?", { ...practice, phase: "discover", keyPoint: "Counting on is quick." })).toContain("Today's goal: Add two small numbers.");
    expect(coachLessonReply("explain", { ...practice, phase: "example" })).toContain("One counter and one more");
    expect(coachLessonReply("help", { ...practice, phase: "mission", missionSteps: ["Draw", "Count"] })).toContain("1. Draw 2. Count");
    expect(coachLessonReply("what next", { ...practice, phase: "complete", nextLessonTitle: "Take away" })).toContain("Your next lesson is Take away");
    expect(coachLessonReply("what next", { ...practice, phase: "complete", nextLessonTitle: null })).toContain("end of this path");
    expect(coachLessonReply("tell me about volcanoes", { ...practice, phase: "discover" })).toBeNull();
    expect(coachLessonReply("hint", null)).toBeNull();
  });
  it("tells the online service the phase but never the correct choice", () => {
    const text = lessonContextForService(practice);
    expect(text).toContain("Play and practise");
    expect(text).toContain("never state or confirm which choice is correct");
    expect(revealsAnswer(text, "7")).toBe(false);
  });
  it("matches short numeric options as whole tokens only", () => {
    expect(revealsAnswer("The answer is 7.", "7")).toBe(true);
    expect(revealsAnswer("Try 17 or 70", "7")).toBe(false);
    expect(revealsAnswer("It was written in a diary by a soldier", "a diary")).toBe(true);
  });
});
