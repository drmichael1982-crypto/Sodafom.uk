import { describe, expect, it } from "vitest";
import { MATHS_LESSONS } from "./maths-course";
import { ENGLISH_LESSONS } from "./english-course";
import { HISTORY_LESSONS } from "./history-course";
import { SCIENCE_LESSONS } from "./science-course";
import { lessonPath, nextLessonInPath } from "./course-sequence";
import type { CourseSubject } from "./course-types";

const ALL = [
  ...MATHS_LESSONS,
  ...HISTORY_LESSONS,
  ...ENGLISH_LESSONS,
  ...SCIENCE_LESSONS,
];

describe("next lesson in the bank's year and subject path", () => {
  for (const subject of ["maths", "english", "history", "science"] as CourseSubject[]) {
    it(`moves to the following ${subject} lesson and stops at the end of the year`, () => {
      const path = lessonPath(ALL, 3, subject);
      expect(path.length).toBeGreaterThan(2);
      const middle = path[Math.floor(path.length / 2)];
      const next = nextLessonInPath(ALL, middle)!;
      expect(next).toBe(path[path.indexOf(middle) + 1]);
      expect(next.subject).toBe(subject);
      expect(next.year).toBe(3);
      expect(next.week * 10 + next.session).toBeGreaterThan(
        middle.week * 10 + middle.session,
      );
      expect(nextLessonInPath(ALL, path[path.length - 1])).toBeNull();
    });
  }
  it("orders every year path by week then session", () => {
    for (let year = 1; year <= 9; year++)
      for (const subject of ["maths", "english", "history", "science"] as CourseSubject[]) {
        const path = lessonPath(ALL, year, subject);
        path.slice(1).forEach((lesson, i) => {
          const previous = path[i];
          expect(
            lesson.week > previous.week ||
              (lesson.week === previous.week && lesson.session >= previous.session),
          ).toBe(true);
        });
      }
  });
});
