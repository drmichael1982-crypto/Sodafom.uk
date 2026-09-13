/** School-only validation and reporting. No network, paid AI, or child data storage. */
export const SUBJECTS = ['maths', 'english', 'spelling', 'science', 'history', 'geography', 'french', 'german', 'pe', 'technology', 'reading', 'general'] as const;
export const ACTIVITY_KINDS = ['lesson', 'game', 'homework', 'reading'] as const;
export type ActivityKind = typeof ACTIVITY_KINDS[number];
export const REVIEW_PREFIX = 'SODAFOM_WORK_REVIEW_V1\n';
export const SCHOOL_POLICY = { inSchoolFree: true, aiMode: 'local-only', paidAiEnabled: false } as const;
export class SchoolInputError extends Error {}

export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SchoolInputError('Invalid request.');
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, max: number, required = true): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string') throw new SchoolInputError(`${label} must be text.`);
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new SchoolInputError(`${label} must be ${required ? '1' : '0'}–${max} characters.`);
  return result;
}
export function positiveId(value: unknown): number {
  const raw = typeof value === 'number' ? String(value) : value;
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > 2147483647) {
    throw new SchoolInputError('Invalid pupil or review ID.');
  }
  return Number(raw);
}
export function normaliseEmail(value: unknown): string {
  const email = text(value, 'Email', 255).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new SchoolInputError('Enter a valid email address.');
  return email;
}
export function passwordInput(value: unknown, registering = false): string {
  // Do not trim passwords: leading/trailing spaces may be intentional.
  if (typeof value !== 'string' || value.length < (registering ? 12 : 1) || value.length > 256) {
    throw new SchoolInputError(registering ? 'Use a password of 12–256 characters.' : 'Enter your password.');
  }
  return value;
}
export function subjectInput(value: unknown): string {
  if (typeof value !== 'string' || !(SUBJECTS as readonly string[]).includes(value)) throw new SchoolInputError('Choose a supported subject.');
  return value;
}
export function ageGroupInput(value: unknown): string {
  if (typeof value !== 'string') throw new SchoolInputError('Choose an age group.');
  const age = value.replace(/[–—]/g, '-');
  if (!['5-7', '8-10', '11-13'].includes(age)) throw new SchoolInputError('Choose an age group.');
  return age;
}
export function scorePercent(score: unknown, maximum: unknown): number | null {
  if (typeof score !== 'number' || typeof maximum !== 'number' || !Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0 || score < 0 || score > maximum) return null;
  return Math.round(score / maximum * 1000) / 10;
}
export function activityKind(gameId: unknown, subject: unknown): ActivityKind {
  const id = typeof gameId === 'string' ? gameId.toLowerCase() : '';
  // Only explicit source prefixes identify lessons/homework; never invent a source.
  if (/^lesson[:/]/.test(id)) return 'lesson';
  if (/^homework[:/]/.test(id)) return 'homework';
  if (/^reading[:/]/.test(id)) return 'reading';
  // Legacy reading games remain games. A reading subject is still reported separately.
  void subject;
  return 'game';
}
export interface ActivityRecord {
  id: number; gameId: string; gameTitle: string; subject: string;
  score: number | null; maxScore: number | null; starsEarned: number | null;
  durationSeconds: number | null; playedAt: string | Date | null;
}
export interface WorkReview {
  version: 1; revision: number; kind: Exclude<ActivityKind, 'game'>;
  title: string; subject: string; source: 'manual' | 'photo' | 'handwriting';
  transcription: string; comment: string; status: 'needs_review' | 'reviewed';
  score: number | null; maxScore: number | null; reviewedBy: number | null;
  reviewedAt: string | null;
}
export interface SavedReview extends WorkReview { id: number; createdAt: string | Date | null }
export function validateReview(value: unknown, teacherId: number, revision = 1, now = new Date()): WorkReview {
  const input = object(value);
  if (typeof input.kind !== 'string' || !['lesson', 'homework', 'reading'].includes(input.kind)) throw new SchoolInputError('Choose a work type.');
  if (typeof input.source !== 'string' || !['manual', 'photo', 'handwriting'].includes(input.source)) throw new SchoolInputError('Choose an evidence type.');
  if (typeof input.status !== 'string' || !['needs_review', 'reviewed'].includes(input.status)) throw new SchoolInputError('Choose a review status.');
  // Images and provider output are never accepted into a review record.
  for (const key of ['image', 'imageUrl', 'photo', 'base64', 'attachment', 'fileName']) {
    if (key in input) throw new SchoolInputError('Photos must stay on this device. Save only your review text.');
  }
  const reviewed = input.status === 'reviewed';
  if (reviewed && input.teacherConfirmed !== true) throw new SchoolInputError('Confirm that you checked the work before publishing a mark.');
  if (reviewed && (!Number.isInteger(input.score) || !Number.isInteger(input.maxScore) || Number(input.maxScore) > 100000 || scorePercent(input.score, input.maxScore) === null)) {
    throw new SchoolInputError('Enter whole-number marks between zero and the maximum.');
  }
  const transcription = text(input.transcription, 'Transcription', 4000, false);
  const comment = text(input.comment, 'Comment', 2000, false);
  if (/data:image\//i.test(transcription + comment)) throw new SchoolInputError('Do not paste image data into a review.');
  return {
    version: 1, revision, kind: input.kind as WorkReview['kind'], title: text(input.title, 'Work title', 255),
    subject: subjectInput(input.subject), source: input.source as WorkReview['source'], transcription, comment,
    status: reviewed ? 'reviewed' : 'needs_review', score: reviewed ? Number(input.score) : null,
    maxScore: reviewed ? Number(input.maxScore) : null, reviewedBy: reviewed ? positiveId(teacherId) : null,
    reviewedAt: reviewed ? now.toISOString() : null,
  };
}
export function encodeReview(review: WorkReview): string { return REVIEW_PREFIX + JSON.stringify(review); }
export function decodeReview(noteText: string): WorkReview | null {
  if (!noteText.startsWith(REVIEW_PREFIX)) return null;
  try {
    const input = object(JSON.parse(noteText.slice(REVIEW_PREFIX.length)));
    if (input.version !== 1 || !Number.isSafeInteger(input.revision) || Number(input.revision) < 1) return null;
    if (input.status === 'reviewed' && (typeof input.reviewedAt !== 'string' || !Number.isFinite(Date.parse(input.reviewedAt)))) return null;
    return validateReview({ ...input, teacherConfirmed: input.status === 'reviewed' }, input.status === 'reviewed' ? positiveId(input.reviewedBy) : 1, Number(input.revision), input.status === 'reviewed' ? new Date(String(input.reviewedAt)) : new Date(0));
  } catch { return null; }
}
export interface ScoreSummary { count: number; assessed: number; averagePercent: number | null; pending: number }
export function summariseProgress(activities: ActivityRecord[], reviews: SavedReview[]) {
  const buckets = new Map<string, { count: number; values: number[]; pending: number }>();
  const add = (key: string, percent: number | null, pending: boolean) => {
    const bucket = buckets.get(key) ?? { count: 0, values: [], pending: 0 };
    bucket.count++;
    if (percent !== null) bucket.values.push(percent);
    if (pending) bucket.pending++;
    buckets.set(key, bucket);
  };
  for (const a of activities) {
    const percent = scorePercent(a.score, a.maxScore);
    add(`kind:${activityKind(a.gameId, a.subject)}`, percent, false);
    add(`subject:${a.subject}`, percent, false);
  }
  for (const r of reviews) {
    const percent = r.status === 'reviewed' ? scorePercent(r.score, r.maxScore) : null;
    add(`kind:${r.kind}`, percent, r.status === 'needs_review');
    add(`subject:${r.subject}`, percent, r.status === 'needs_review');
  }
  const finish = (key: string): ScoreSummary => {
    const b = buckets.get(key) ?? { count: 0, values: [], pending: 0 };
    return { count: b.count, assessed: b.values.length, averagePercent: b.values.length ? Math.round(b.values.reduce((a, n) => a + n, 0) / b.values.length * 10) / 10 : null, pending: b.pending };
  };
  return {
    byKind: Object.fromEntries(ACTIVITY_KINDS.map(kind => [kind, finish(`kind:${kind}`)])) as Record<ActivityKind, ScoreSummary>,
    bySubject: [...buckets.keys()].filter(key => key.startsWith('subject:')).map(key => ({ subject: key.slice(8), ...finish(key) })),
  };
}
/** Deterministic local assistance, NOT handwriting OCR or a model judgement. */
export function localArithmeticCheck(transcription: string): { status: 'suggestion' | 'needs_review'; message: string; suggestedScore: number | null } {
  const match = /^\s*(\d{1,4})\s*([+\-×*])\s*(\d{1,4})\s*=\s*(-?\d{1,8})\s*$/.exec(transcription);
  if (!match) return { status: 'needs_review', message: 'This local check cannot assess this work. Please review it yourself.', suggestedScore: null };
  const [, left, op, right, answer] = match;
  const a = Number(left), b = Number(right);
  const expected = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const correct = expected === Number(answer);
  return { status: 'suggestion', message: `${correct ? 'The typed calculation matches.' : 'The typed calculation needs another look.'} Check the original work before confirming any mark.`, suggestedScore: correct ? 1 : 0 };
}
export function csvCell(value: unknown): string {
  let cell = value == null ? '' : String(value);
  // Spreadsheet formulas may start after leading whitespace/control characters.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replace(/"/g, '""')}"`;
}
export function csvRows(rows: unknown[][]): string { return rows.map(row => row.map(csvCell).join(',')).join('\r\n'); }
