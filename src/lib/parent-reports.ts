/**
 * Parent-report calculations only.
 *
 * This module deliberately operates on account-linked activity records passed
 * in by an owner-scoped API route. It never reads browser/device tutor memory,
 * sends a report, or calls AI services.
 */
export const REPORT_DAYS = [7, 30, 90] as const;
export const REPORT_LIMIT = 500;

export type ReportDays = (typeof REPORT_DAYS)[number];
export type ActivityKind =
  "lessons" | "games" | "reading" | "homework" | "other";

export interface ParentChild {
  id: number;
  name: string;
  age_group: string;
  total_stars: number;
}

export interface SavedActivity {
  id: number;
  child_id: number;
  subject: string;
  activity_id: string;
  activity_title: string;
  score: number | string | null;
  max_score: number | string | null;
  duration_seconds: number | string | null;
  stars_earned: number | string | null;
  completed_at: string | Date | null;
}

export interface GameReference {
  id: string;
  title: string;
  slug: string;
}

export interface ReportCategory {
  kind: ActivityKind;
  label: string;
  sessions: number;
  assessed: number;
  averageScore: number | null;
  minutes: number;
  stars: number;
}

export interface SubjectProgress {
  subject: string;
  label: string;
  sessions: number;
  assessed: number;
  averageScore: number | null;
  trend: number | null;
  /** Stars attached to saved activity in the selected report period. */
  stars: number;
  status: "early" | "strength" | "practice" | "building";
}

export interface ReportActivity {
  id: number;
  title: string;
  subject: string;
  kind: ActivityKind;
  score: number | null;
  completedAt: string;
}

export interface LessonSuggestion {
  title: string;
  reason: string;
  guidance: string;
  href: "/reading" | "/lesson-library";
}

export interface ChildProgressReport {
  childId: number;
  days: ReportDays;
  from: string;
  to: string;
  truncated: boolean;
  totalSessions: number;
  categories: ReportCategory[];
  subjects: SubjectProgress[];
  strengths: SubjectProgress[];
  needsHelp: SubjectProgress[];
  recommendations: LessonSuggestion[];
  recent: ReportActivity[];
}

export interface ParentDashboardData {
  child: ParentChild;
  report: ChildProgressReport;
}

const LABELS: Record<ActivityKind, string> = {
  lessons: "Lessons",
  games: "Games",
  reading: "Reading",
  homework: "Homework",
  other: "Other saved activity",
};

const SUBJECTS: Record<string, string> = {
  maths: "Maths",
  english: "English",
  spelling: "Spelling",
  reading: "Reading",
  science: "Science",
  history: "History",
  geography: "Geography",
  french: "French",
  german: "German",
  pe: "PE",
  computing: "Computing",
  art: "Art",
  music: "Music",
};

function finite(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim()))
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function count(value: unknown): number {
  const parsed = finite(value);
  return parsed !== null && parsed >= 0 ? parsed : 0;
}

export function parseChildId(value: unknown): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function parseReportDays(value: unknown): ReportDays | null {
  if (value === undefined) return 30;
  return value === "7" ? 7 : value === "30" ? 30 : value === "90" ? 90 : null;
}

/** Accepts the actual /children array and a legacy envelope, without retaining extra profile fields. */
export function parseChildren(payload: unknown): ParentChild[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "children" in payload
      ? (payload as { children?: unknown }).children
      : null;
  if (!Array.isArray(rows))
    throw new Error("Child profiles could not be read. Please refresh.");

  const seen = new Set<number>();
  return rows.map((row: unknown) => {
    if (!row || typeof row !== "object")
      throw new Error("Invalid child profile response.");
    const data = row as Record<string, unknown>;
    const id = parseChildId(String(data.id));
    if (!id || typeof data.name !== "string" || seen.has(id)) {
      throw new Error("Invalid child profile response.");
    }
    seen.add(id);
    const age = data.ageGroup ?? data.age_group;
    return {
      id,
      name: data.name,
      age_group: typeof age === "string" ? age : "Not set",
      total_stars: count(data.totalStars ?? data.total_stars),
    };
  });
}

/** Normalises a valid score to a percentage; unknown/impossible scores stay unassessed. */
export function scorePercent(score: unknown, maximum: unknown): number | null {
  const value = finite(score);
  const max = finite(maximum);
  if (value === null || max === null || max <= 0 || value < 0 || value > max)
    return null;
  return Math.round((value / max) * 1000) / 10;
}

export function knownGameIds(games: readonly GameReference[]): Set<string> {
  return new Set(
    games
      .flatMap((game) => [
        game.id,
        game.slug,
        game.title.toLowerCase().replace(/\s+/g, "-"),
      ])
      .filter(Boolean)
      .map((id) => id.trim().toLowerCase()),
  );
}

export function activityKind(
  activityId: string,
  subject: string,
  gameIds: ReadonlySet<string>,
): ActivityKind {
  const id = activityId.trim().toLowerCase();
  if (
    /^(?:homework|scan[-_:]homework)(?:[-_:/]|$)/.test(id) ||
    subject === "homework"
  )
    return "homework";
  // A recognised reading game is one games session, never a second reading session.
  if (gameIds.has(id) || /^game[-_:/]/.test(id)) return "games";
  if (
    /^(?:reading|read|book|scan[-_:]reading)(?:[-_:/]|$)/.test(id) ||
    subject === "reading"
  )
    return "reading";
  if (/^(?:lesson|curriculum|tutor)(?:[-_:/]|$)/.test(id)) return "lessons";
  return "other";
}

function subjectLabel(subject: string): string {
  return Object.hasOwn(SUBJECTS, subject)
    ? SUBJECTS[subject]
    : subject.charAt(0).toUpperCase() + subject.slice(1);
}

const average = (values: number[]): number | null =>
  values.length
    ? Math.round(
        (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
      ) / 10
    : null;

/**
 * Builds an honest, time-bounded report from records already owner-scoped by
 * the API. It also filters malformed, duplicated, cross-child and future rows
 * defensively so they cannot become a misleading report.
 */
export function buildChildReport(
  child: ParentChild,
  rows: readonly SavedActivity[],
  options: {
    days: ReportDays;
    now: Date;
    gameIds: ReadonlySet<string>;
    truncated?: boolean;
  },
): ChildProgressReport {
  const end = options.now.getTime();
  const start = end - options.days * 86_400_000;
  const seen = new Set<number>();
  const valid = rows
    .filter((row) => {
      const time = row.completed_at
        ? new Date(row.completed_at).getTime()
        : NaN;
      if (
        row.child_id !== child.id ||
        !Number.isSafeInteger(row.id) ||
        row.id <= 0 ||
        seen.has(row.id) ||
        !Number.isFinite(time) ||
        time < start ||
        time > end
      )
        return false;
      seen.add(row.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.completed_at!).getTime() -
          new Date(b.completed_at!).getTime() || a.id - b.id,
    );

  const categories = (Object.keys(LABELS) as ActivityKind[]).map((kind) => ({
    kind,
    label: LABELS[kind],
    sessions: 0,
    assessed: 0,
    averageScore: null as number | null,
    minutes: 0,
    stars: 0,
    seconds: 0,
    scores: [] as number[],
  }));
  const subjectGroups = new Map<
    string,
    { sessions: number; scores: number[]; stars: number }
  >();
  const activities: ReportActivity[] = [];

  for (const row of valid) {
    const subject =
      typeof row.subject === "string" && row.subject.trim()
        ? row.subject.trim().toLowerCase()
        : "general";
    const activityId =
      typeof row.activity_id === "string" ? row.activity_id : "";
    const title =
      typeof row.activity_title === "string" && row.activity_title.trim()
        ? row.activity_title
        : "Saved activity";
    const kind = activityKind(activityId, subject, options.gameIds);
    const pct = scorePercent(row.score, row.max_score);
    const stars = count(row.stars_earned);
    const category = categories.find((item) => item.kind === kind)!;
    category.sessions++;
    category.seconds += count(row.duration_seconds);
    category.stars += stars;
    if (pct !== null) category.scores.push(pct);

    const group = subjectGroups.get(subject) ?? {
      sessions: 0,
      scores: [],
      stars: 0,
    };
    group.sessions++;
    group.stars += stars;
    if (pct !== null) group.scores.push(pct);
    subjectGroups.set(subject, group);

    activities.push({
      id: row.id,
      title,
      subject: subjectLabel(subject),
      kind,
      score: pct,
      completedAt: new Date(row.completed_at!).toISOString(),
    });
  }

  const subjects: SubjectProgress[] = [...subjectGroups.entries()]
    .map(([subject, group]): SubjectProgress => {
      const avg = average(group.scores);
      const split = Math.floor(group.scores.length / 2);
      const trend =
        group.scores.length >= 4
          ? Math.round(
              (average(group.scores.slice(split))! -
                average(group.scores.slice(0, split))!) *
                10,
            ) / 10
          : null;
      return {
        subject,
        label: subjectLabel(subject),
        sessions: group.sessions,
        assessed: group.scores.length,
        averageScore: avg,
        trend,
        stars: group.stars,
        status:
          group.scores.length < 3 || avg === null
            ? "early"
            : avg >= 80
              ? "strength"
              : avg < 60
                ? "practice"
                : "building",
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const strengths = subjects.filter((item) => item.status === "strength");
  const needsHelp = subjects.filter((item) => item.status === "practice");
  const candidates = [...subjects]
    .filter((item) => Object.hasOwn(SUBJECTS, item.subject))
    .sort((a, b) => (a.averageScore ?? 101) - (b.averageScore ?? 101))
    .slice(0, 3);
  const guidance =
    child.age_group === "5-7"
      ? "Use objects, pictures and one short instruction at a time."
      : child.age_group === "8-10"
        ? "Start with a worked example, then let your child try a similar question."
        : "Choose the saved age group and work through one example together before independent practice.";
  const recommendations: LessonSuggestion[] = candidates.map((item) => ({
    title: `${item.label}: ${item.status === "strength" ? "try the next challenge" : "guided practice"}`,
    reason:
      item.assessed >= 3
        ? `Average ${item.averageScore}% across ${item.assessed} marked activities in this period.`
        : "An introductory suggestion; there are not enough marked activities for a reliable strength or support label.",
    guidance: `Age group ${child.age_group}. ${guidance}`,
    href: item.subject === "reading" ? "/reading" : "/lesson-library",
  }));
  if (!recommendations.length) {
    recommendations.push({
      title: "Choose an introductory lesson",
      reason:
        "There is not enough linked progress for a personalised recommendation yet.",
      guidance: `Select age group ${child.age_group} in the lesson chooser. ${guidance}`,
      href: "/lesson-library",
    });
  }

  return {
    childId: child.id,
    days: options.days,
    from: new Date(start).toISOString(),
    to: options.now.toISOString(),
    truncated: options.truncated ?? false,
    totalSessions: valid.length,
    categories: categories.map(({ scores, seconds, ...category }) => ({
      ...category,
      assessed: scores.length,
      averageScore: average(scores),
      minutes: Math.round(seconds / 60),
    })),
    subjects,
    strengths,
    needsHelp,
    recommendations,
    recent: activities.reverse().slice(0, 20),
  };
}
