import {
  ageBandFromCurriculumGroup,
  curriculumGroupForAgeBand,
  isLessonAgeBand,
  isLessonDuration,
  type LessonAgeBand,
  type LessonDuration,
  type LessonSelection,
} from "./lesson-model";
import type {
  CurriculumAgeGroup,
  CurriculumSubject,
} from "@/lib/tutor/curriculum-year-plan";

const SESSION_KEY = "sodafom_lesson_session_v1";
const SESSION_VERSION = 1 as const;

export type LessonSessionStatus = "in-progress" | "paused" | "completed";

export interface LessonScore {
  correct: number;
  attempted: number;
}

export interface LessonSession {
  version: typeof SESSION_VERSION;
  id: string;
  lessonId?: string;
  lessonTitle?: string;
  childId?: string;
  subject: CurriculumSubject;
  ageBand: LessonAgeBand;
  curriculumAgeGroup: CurriculumAgeGroup;
  day: number;
  durationMinutes: LessonDuration;
  stageIndex: number;
  questionIndex: number;
  elapsedSeconds: number;
  score: LessonScore;
  status: LessonSessionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LessonVisibilitySummary {
  eventType: "lesson-progress";
  sessionId: string;
  childId?: string;
  subject: CurriculumSubject;
  ageBand: LessonAgeBand;
  day: number;
  lessonId?: string;
  lessonTitle?: string;
  durationSeconds: number;
  scorePercent: number;
  status: LessonSessionStatus;
  updatedAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeInteger(value: unknown, minimum: number, maximum: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.trunc(number)));
}

function isCurriculumAgeGroup(value: unknown): value is CurriculumAgeGroup {
  return value === "5-7" || value === "8-10" || value === "11-13";
}

function parseSession(value: unknown): LessonSession | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<LessonSession>;
  if (
    candidate.version !== SESSION_VERSION ||
    typeof candidate.id !== "string" ||
    typeof candidate.subject !== "string"
  )
    return null;
  if (
    !isLessonAgeBand(candidate.ageBand) ||
    !isLessonDuration(candidate.durationMinutes)
  )
    return null;
  const curriculumAgeGroup = isCurriculumAgeGroup(candidate.curriculumAgeGroup)
    ? candidate.curriculumAgeGroup
    : curriculumGroupForAgeBand(candidate.ageBand);
  const status: LessonSessionStatus =
    candidate.status === "paused" || candidate.status === "completed"
      ? candidate.status
      : "in-progress";
  const startedAt =
    typeof candidate.startedAt === "string" ? candidate.startedAt : nowIso();
  const updatedAt =
    typeof candidate.updatedAt === "string" ? candidate.updatedAt : startedAt;

  return {
    version: SESSION_VERSION,
    id: candidate.id,
    lessonId:
      typeof candidate.lessonId === "string" ? candidate.lessonId : undefined,
    lessonTitle:
      typeof candidate.lessonTitle === "string"
        ? candidate.lessonTitle
        : undefined,
    childId:
      typeof candidate.childId === "string" ? candidate.childId : undefined,
    subject: candidate.subject as CurriculumSubject,
    ageBand: candidate.ageBand,
    curriculumAgeGroup,
    day: safeInteger(candidate.day, 1, 365),
    durationMinutes: candidate.durationMinutes,
    stageIndex: safeInteger(candidate.stageIndex, 0, 30),
    questionIndex: safeInteger(candidate.questionIndex, 0, 100),
    elapsedSeconds: safeInteger(
      candidate.elapsedSeconds,
      0,
      candidate.durationMinutes * 60,
    ),
    score: {
      correct: safeInteger(candidate.score?.correct, 0, 10000),
      attempted: safeInteger(candidate.score?.attempted, 0, 10000),
    },
    status,
    startedAt,
    updatedAt,
    completedAt:
      typeof candidate.completedAt === "string"
        ? candidate.completedAt
        : undefined,
  };
}

export function readLessonSession(): LessonSession | null {
  if (typeof window === "undefined") return null;
  try {
    return parseSession(
      JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null"),
    );
  } catch {
    return null;
  }
}

export function readActiveLessonSession(): LessonSession | null {
  const session = readLessonSession();
  return session && session.status !== "completed" ? session : null;
}

export function beginLessonSession(
  selection: LessonSelection,
  childId?: string,
): LessonSession {
  const timestamp = nowIso();
  const session: LessonSession = {
    version: SESSION_VERSION,
    id: newSessionId(),
    childId,
    ...selection,
    curriculumAgeGroup: curriculumGroupForAgeBand(selection.ageBand),
    stageIndex: 0,
    questionIndex: 0,
    elapsedSeconds: 0,
    score: { correct: 0, attempted: 0 },
    status: "in-progress",
    startedAt: timestamp,
    updatedAt: timestamp,
  };
  return writeLessonSession(session);
}

export function beginLessonSessionFromLegacy(input: {
  subject: CurriculumSubject;
  ageGroup: CurriculumAgeGroup;
  day: number;
  durationMinutes: LessonDuration;
  childId?: string;
}): LessonSession {
  return beginLessonSession(
    {
      subject: input.subject,
      ageBand: ageBandFromCurriculumGroup(input.ageGroup),
      day: input.day,
      durationMinutes: input.durationMinutes,
    },
    input.childId,
  );
}

export function writeLessonSession(session: LessonSession): LessonSession {
  const normalised = parseSession({ ...session, updatedAt: nowIso() });
  if (!normalised) throw new Error("Invalid lesson session");
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalised));
    } catch {
      /* Storage is an optional offline enhancement. */
    }
  }
  return normalised;
}

export function updateLessonSession(
  current: LessonSession,
  patch: Partial<Omit<LessonSession, "version" | "id" | "startedAt">>,
): LessonSession {
  return writeLessonSession({
    ...current,
    ...patch,
    version: SESSION_VERSION,
    id: current.id,
    startedAt: current.startedAt,
  });
}

export function lessonVisibilitySummary(
  session: LessonSession,
): LessonVisibilitySummary {
  const attempted = Math.max(0, session.score.attempted);
  return {
    eventType: "lesson-progress",
    sessionId: session.id,
    childId: session.childId,
    subject: session.subject,
    ageBand: session.ageBand,
    day: session.day,
    lessonId: session.lessonId,
    lessonTitle: session.lessonTitle,
    durationSeconds: session.elapsedSeconds,
    scorePercent: attempted
      ? Math.round((session.score.correct / attempted) * 100)
      : 0,
    status: session.status,
    updatedAt: session.updatedAt,
  };
}

/** Parent and teacher surfaces can subscribe without owning lesson runtime state. */
export function publishLessonVisibility(
  session: LessonSession,
): LessonVisibilitySummary {
  const summary = lessonVisibilitySummary(session);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<LessonVisibilitySummary>("sodafom:lesson-progress", {
        detail: summary,
      }),
    );
  }
  return summary;
}

export const LESSON_SESSION_STORAGE_KEY = SESSION_KEY;
