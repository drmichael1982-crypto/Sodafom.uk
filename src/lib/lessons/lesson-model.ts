import type {
  CurriculumAgeGroup,
  CurriculumSubject,
} from "@/lib/tutor/curriculum-year-plan";

export const LESSON_AGE_BANDS = [
  "5-6",
  "6-7",
  "7-8",
  "8-9",
  "9-10",
  "10-11",
  "11-12",
] as const;
export type LessonAgeBand = (typeof LESSON_AGE_BANDS)[number];

export const LESSON_DURATIONS = [15, 20, 30, 60] as const;
export type LessonDuration = (typeof LESSON_DURATIONS)[number];

export interface LessonSelection {
  subject: CurriculumSubject;
  ageBand: LessonAgeBand;
  day: number;
  durationMinutes: LessonDuration;
}

export const LESSON_AGE_OPTIONS: ReadonlyArray<{
  value: LessonAgeBand;
  label: string;
  schoolStage: string;
}> = LESSON_AGE_BANDS.map((value, index) => ({
  value,
  label: `Ages ${value.replace("-", "–")}`,
  schoolStage: index < 2 ? "KS1" : "KS2",
}));

export function isLessonAgeBand(value: unknown): value is LessonAgeBand {
  return (
    typeof value === "string" &&
    (LESSON_AGE_BANDS as readonly string[]).includes(value)
  );
}

export function isLessonDuration(value: unknown): value is LessonDuration {
  return (
    typeof value === "number" &&
    (LESSON_DURATIONS as readonly number[]).includes(value)
  );
}

/**
 * The current curriculum generator uses three broad internal groups. The
 * child-facing selection stays on the agreed one-year 5–12 bands so a future
 * content service can become more precise without another UI migration.
 */
export function curriculumGroupForAgeBand(
  ageBand: LessonAgeBand,
): CurriculumAgeGroup {
  if (ageBand === "5-6" || ageBand === "6-7") return "5-7";
  if (ageBand === "7-8" || ageBand === "8-9" || ageBand === "9-10")
    return "8-10";
  return "11-13";
}

export function ageBandFromCurriculumGroup(
  group: CurriculumAgeGroup,
): LessonAgeBand {
  if (group === "5-7") return "6-7";
  if (group === "8-10") return "9-10";
  return "11-12";
}
