import { describe, expect, it } from "vitest";
import {
  LESSON_BANK,
  buildInventory,
  unitsFor,
  nextIncomplete,
  courseActivityId,
} from "./lesson-inventory";
import type { CourseSubject } from "./course-types";

describe("lesson-inventory", () => {
  it("inventories the real lesson bank across all 9 years without missing subjects", () => {
    const inv = buildInventory(LESSON_BANK);
    expect(inv.subjects).toEqual(["maths", "english", "science", "history"]);
    expect(inv.years).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(inv.total).toBe(3240);

    for (let year = 1; year <= 9; year++) {
      expect(inv.counts.maths[year]).toBe(180);
      expect(inv.counts.english[year]).toBe(108);
      expect(inv.counts.history[year]).toBe(36);
      expect(inv.counts.science[year]).toBe(36);
    }
  });

  it("unitsFor groups lessons by unit in week order", () => {
    const units = unitsFor(1, "maths", LESSON_BANK);
    expect(units.length).toBeGreaterThan(0);
    const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);
    expect(totalLessons).toBe(180);

    for (let i = 0; i < units.length - 1; i++) {
      expect(units[i].lastWeek).toBeLessThanOrEqual(units[i + 1].firstWeek);
    }
  });

  it("nextIncomplete finds the next lesson not in completed set", () => {
    const units = unitsFor(1, "history", LESSON_BANK);
    const firstLesson = units[0].lessons[0];
    const secondLesson = units[0].lessons[1];

    const completed = new Set<string>();
    const next1 = nextIncomplete(1, "history", completed, LESSON_BANK);
    expect(next1?.id).toBe(firstLesson.id);

    completed.add(courseActivityId(firstLesson.id));
    const next2 = nextIncomplete(1, "history", completed, LESSON_BANK);
    expect(next2?.id).toBe(secondLesson.id);
  });
});
