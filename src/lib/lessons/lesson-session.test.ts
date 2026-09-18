import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LESSON_SESSION_STORAGE_KEY,
  beginLessonSession,
  lessonVisibilitySummary,
  publishLessonVisibility,
  readActiveLessonSession,
  readLessonSession,
  updateLessonSession,
} from "./lesson-session";
import { curriculumGroupForAgeBand } from "./lesson-model";

describe("lesson session model", () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ["5-6", "5-7"],
    ["6-7", "5-7"],
    ["7-8", "8-10"],
    ["9-10", "8-10"],
    ["10-11", "11-13"],
    ["11-12", "11-13"],
  ] as const)(
    "maps age band %s to the current curriculum group %s",
    (band, group) => {
      expect(curriculumGroupForAgeBand(band)).toBe(group);
    },
  );

  it("starts, validates and resumes an unfinished lesson", () => {
    const session = beginLessonSession(
      { subject: "Maths", ageBand: "7-8", day: 12, durationMinutes: 20 },
      "child-1",
    );
    updateLessonSession(session, {
      stageIndex: 3,
      questionIndex: 1,
      elapsedSeconds: 305,
      score: { correct: 2, attempted: 3 },
      status: "paused",
    });

    expect(readActiveLessonSession()).toMatchObject({
      id: session.id,
      childId: "child-1",
      ageBand: "7-8",
      curriculumAgeGroup: "8-10",
      stageIndex: 3,
      elapsedSeconds: 305,
      status: "paused",
    });
  });

  it("ignores damaged storage instead of crashing the child flow", () => {
    localStorage.setItem(LESSON_SESSION_STORAGE_KEY, "{broken");
    expect(readLessonSession()).toBeNull();
  });

  it("publishes a minimal parent/teacher-safe progress summary", () => {
    const listener = vi.fn();
    window.addEventListener("sodafom:lesson-progress", listener);
    const session = beginLessonSession({
      subject: "Science",
      ageBand: "10-11",
      day: 4,
      durationMinutes: 15,
    });
    const updated = updateLessonSession(session, {
      lessonId: "science-4",
      lessonTitle: "Forces",
      elapsedSeconds: 600,
      score: { correct: 3, attempted: 4 },
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    expect(lessonVisibilitySummary(updated)).toMatchObject({
      scorePercent: 75,
      status: "completed",
      subject: "Science",
    });
    expect(publishLessonVisibility(updated)).toMatchObject({
      scorePercent: 75,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("sodafom:lesson-progress", listener);
  });

  it("does not expose private admin, business, provider or deployment capabilities", () => {
    const session = beginLessonSession({
      subject: "English",
      ageBand: "8-9",
      day: 2,
      durationMinutes: 15,
    });
    const unsafeInput = {
      ...session,
      adminTools: ["deploy", "merge"],
      businessLedger: { revenue: 100 },
      providerSecret: "never-copy-me",
      railwayControl: true,
      private797Brain: true,
    };

    const summary = lessonVisibilitySummary(unsafeInput);
    expect(Object.keys(summary).sort()).toEqual([
      "ageBand",
      "childId",
      "day",
      "durationSeconds",
      "eventType",
      "lessonId",
      "lessonTitle",
      "scorePercent",
      "sessionId",
      "status",
      "subject",
      "updatedAt",
    ].sort());
    expect(JSON.stringify(summary)).not.toMatch(
      /admin|business|ledger|provider|secret|railway|deploy|merge|797/i,
    );
  });
});
