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
  it("explains place value with a concrete model instead of repeating the goal", () => {
    for (const ask of ["I don't understand place value. Explain it simply.", "make it simpler", "I'm confused"]) {
      const reply = coachLessonReply(ask, { ...practice, phase: "discover", year: 4, objective: "Place value to ten thousand" })!;
      expect(reply).toContain("2,000 + 300 + 5 = 2,305");
      expect(reply).toContain("Draw four boxes");
      expect(reply).not.toContain("Today's goal:");
    }
  });
  it("models Year 1 place value with a group of ten and extra ones within 20", () => {
    for (const ask of ["I don't understand place value. Explain it simply.", "make it simpler", "I'm confused"]) {
      const reply = coachLessonReply(ask, { ...practice, phase: "discover", year: 1, objective: "Place value to 20" })!;
      expect(reply).toContain("10 + 5 = 15");
      expect(reply).toContain("one group of ten dots");
      expect(reply).toContain("Draw two boxes labelled tens and ones");
      expect(reply).toContain("The 1 stands for one group of ten");
      expect(reply).not.toMatch(/hundreds|thousands|2,305|four boxes/i);
      expect((reply.match(/\b\d+\b/g) || []).every((number) => Number(number) <= 20)).toBe(true);
    }
  });
  it("models Year 2 two-digit place value with tens and ones within 100", () => {
    for (const ask of ["I don't understand place value. Explain it simply.", "make it simpler", "I'm confused"]) {
      const reply = coachLessonReply(ask, { ...practice, phase: "discover", year: 2, objective: "Place value to 100" })!;
      expect(reply).toContain("40 + 3 = 43");
      expect(reply).toContain("four groups of ten dots and three extra dots");
      expect(reply).toContain("Four tens make 40");
      expect(reply).toContain("Draw two boxes labelled tens and ones");
      expect(reply).not.toMatch(/hundreds|thousands|2,305|four boxes/i);
      expect((reply.match(/\b\d+\b/g) || []).every((number) => Number(number) <= 100)).toBe(true);
    }
  });
  it("explains the zero placeholder in Year 3 three-digit place value", () => {
    const reply = coachLessonReply("explain it simply", { ...practice, phase: "discover", year: 3, objective: "Place value to 1,000" })!;
    expect(reply).toContain("300 + 0 + 5 = 305");
    expect(reply).toContain("zero holds the tens place");
    expect(reply).toContain("Draw three boxes labelled hundreds, tens and ones");
    expect(reply).not.toMatch(/thousands|2,305|four boxes/i);
  });
  it("uses older lessons' supplied decimal example instead of the four-digit model", () => {
    const workedExample = {
      prompt: "What does the 3 represent in 47.36?",
      explanation: "The 3 is in the tenths place, so it represents three tenths, or 0.3.",
    };
    for (const year of [5, 6, 7, 8, 9]) {
      const reply = coachLessonReply("make it simpler", { ...practice, phase: "discover", year, objective: "Understand decimal place value", workedExample })!;
      expect(reply).toContain(workedExample.prompt);
      expect(reply).toContain(workedExample.explanation);
      expect(reply).not.toContain("2,305");
      expect(reply).not.toContain("Draw four boxes");
    }
  });
  it("retains the four-digit example for legacy contexts without a year", () => {
    const reply = coachLessonReply("I'm confused", { ...practice, phase: "discover", objective: "Place value to ten thousand" })!;
    expect(reply).toContain("2,000 + 300 + 5 = 2,305");
    expect(reply).toContain("Draw four boxes");
  });
  it("uses the supplied example for other discovery explanations", () => {
    expect(coachLessonReply("explain it simply", { ...practice, phase: "discover" })).toContain("One counter and one more make two counters.");
    expect(revealsAnswer(coachLessonReply("explain it simply", practice)!, "7")).toBe(false);
  });
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
