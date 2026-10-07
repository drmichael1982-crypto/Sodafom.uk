import type { CourseLesson, CourseSubject } from "./course-types";
import { MATHS_LESSONS } from "./maths-course";
import { ENGLISH_LESSONS } from "./english-course";
import { HISTORY_LESSONS } from "./history-course";
import { SCIENCE_LESSONS } from "./science-course";
import { lessonPath, nextLessonInPath } from "./course-sequence";

/**
 * The full lesson bank, imported directly from the four subject banks so this
 * module never depends on a page component (avoids circular imports).
 * Same order as COURSE_LESSONS in ArchieCourses.
 */
export const LESSON_BANK: readonly CourseLesson[] = [
  ...MATHS_LESSONS,
  ...HISTORY_LESSONS,
  ...ENGLISH_LESSONS,
  ...SCIENCE_LESSONS,
];

export const SUBJECT_LABELS: Record<CourseSubject, string> = {
  maths: "Maths",
  english: "English",
  history: "History",
  science: "Science",
};

/** Maths first, then the remaining subjects in a stable display order. */
const SUBJECT_ORDER: CourseSubject[] = ["maths", "english", "science", "history"];

export type InventoryUnit = {
  unit: string;
  firstWeek: number;
  lastWeek: number;
  lessons: CourseLesson[];
};

export type LessonInventory = {
  /** Subjects that actually have lessons, maths first. Nothing is invented. */
  subjects: CourseSubject[];
  /** Years that actually have lessons, ascending. */
  years: number[];
  /** Lesson count per subject per year. */
  counts: Record<string, Record<number, number>>;
  total: number;
};

export function buildInventory(
  lessons: readonly CourseLesson[] = LESSON_BANK,
): LessonInventory {
  const counts: Record<string, Record<number, number>> = {};
  const years = new Set<number>();
  for (const lesson of lessons) {
    counts[lesson.subject] ??= {};
    counts[lesson.subject][lesson.year] =
      (counts[lesson.subject][lesson.year] ?? 0) + 1;
    years.add(lesson.year);
  }
  const present = Object.keys(counts) as CourseSubject[];
  const subjects = [
    ...SUBJECT_ORDER.filter((s) => present.includes(s)),
    ...present.filter((s) => !SUBJECT_ORDER.includes(s)).sort(),
  ];
  return {
    subjects,
    years: [...years].sort((a, b) => a - b),
    counts,
    total: lessons.length,
  };
}

/**
 * Lessons for one year and subject, grouped into units in teaching order
 * (week, then session). A unit name that reappears later in the year after a
 * different unit starts a new group, so the order always follows the weeks.
 */
export function unitsFor(
  year: number,
  subject: CourseSubject,
  lessons: readonly CourseLesson[] = LESSON_BANK,
): InventoryUnit[] {
  const units: InventoryUnit[] = [];
  for (const lesson of lessonPath(lessons, year, subject)) {
    const last = units[units.length - 1];
    if (last && last.unit === lesson.unit) {
      last.lessons.push(lesson);
      last.lastWeek = lesson.week;
    } else {
      units.push({
        unit: lesson.unit,
        firstWeek: lesson.week,
        lastWeek: lesson.week,
        lessons: [lesson],
      });
    }
  }
  return units;
}

/** First lesson in the path not yet completed, or null when all are done. */
export function nextIncomplete(
  year: number,
  subject: CourseSubject,
  completedIds: ReadonlySet<string>,
  lessons: readonly CourseLesson[] = LESSON_BANK,
): CourseLesson | null {
  return (
    lessonPath(lessons, year, subject).find(
      (lesson) => !completedIds.has(courseActivityId(lesson.id)),
    ) ?? null
  );
}

/** Activity id saved by the course player when a lesson is completed. */
export const courseActivityId = (lessonId: string) => "course-" + lessonId;

export { lessonPath, nextLessonInPath };
