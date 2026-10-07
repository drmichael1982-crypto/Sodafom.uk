import type { CourseLesson, CourseSubject } from "./course-types";

/**
 * The teaching order for one year and subject: week, then session, keeping
 * the bank's array order for any ties. No lessons are invented here.
 */
export function lessonPath(
  lessons: readonly CourseLesson[],
  year: number,
  subject: CourseSubject,
): CourseLesson[] {
  return lessons
    .map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => lesson.year === year && lesson.subject === subject)
    .sort(
      (a, b) =>
        a.lesson.week - b.lesson.week ||
        a.lesson.session - b.lesson.session ||
        a.index - b.index,
    )
    .map(({ lesson }) => lesson);
}

/** The next lesson in the same year and subject, or null at the end of the path. */
export function nextLessonInPath(
  lessons: readonly CourseLesson[],
  current: CourseLesson,
): CourseLesson | null {
  const path = lessonPath(lessons, current.year, current.subject);
  const index = path.findIndex((lesson) => lesson.id === current.id);
  return index >= 0 && index + 1 < path.length ? path[index + 1] : null;
}
