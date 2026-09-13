/** School-only records. No parent data, image storage, network calls or paid AI. */
export const SCHOOL_RECORD_SUBJECT = 'school-record-v1';
export const SCHOOL_HISTORY_LIMIT = 500;
export const SCHOOL_SUBJECTS = ['maths', 'english', 'spelling', 'reading', 'science', 'history', 'geography', 'french', 'german', 'pe', 'technology', 'general'] as const;
export type SchoolKind = 'lesson' | 'homework' | 'reading';
export type RecordKind = SchoolKind | 'game';
export type ReviewStatus = 'needs_review' | 'reviewed';
export interface SchoolDraft {
  kind: SchoolKind;
  subject: string;
  title: string;
  status: ReviewStatus;
  score: number | null;
  maxScore: number | null;
  comment: string;
  photoReviewed: boolean;
}
export interface StoredSchoolRecord extends SchoolDraft {
  requestId: string;
  version: 1;
  revision: number;
  teacherId: number;
  reviewedAt: string | null;
}
export interface ProgressRecord extends Omit<SchoolDraft, 'kind'> {
  id: string;
  kind: RecordKind;
  noteId?: number;
  requestId?: string;
  revision?: number;
  recordedAt: string | null;
  source: 'teacher' | 'game';
}
export interface ProgressBucket {
  count: number;
  needsReview: number;
  scoredCount: number;
  marks: number;
  possibleMarks: number;
  percent: number | null;
}
export interface ProgressSummary extends ProgressBucket {
  byKind: Record<RecordKind, ProgressBucket>;
  bySubject: Record<string, ProgressBucket>;
}
export interface SchoolCoverage { limitPerSource: number; gamesTruncated: boolean; notesTruncated: boolean; unreadableRecords: number }
export class SchoolInputError extends Error {}

export function positiveId(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
export function normaliseAgeGroup(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const age = value.trim().replace(/[–—]/g, '-');
  return ['5-7', '8-10', '11-13'].includes(age) ? age : null;
}
export function boundedText(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== 'string') throw new SchoolInputError(`${label} must be text.`);
  const text = value.trim();
  if ((required && !text) || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) {
    throw new SchoolInputError(`${label} must contain ${required ? '1' : '0'}–${max} characters.`);
  }
  return text;
}
export function validMarks(score: unknown, maxScore: unknown): boolean {
  return typeof score === 'number' && typeof maxScore === 'number' && Number.isFinite(score) && Number.isFinite(maxScore)
    && score >= 0 && maxScore > 0 && score <= maxScore;
}
export function validateSchoolDraft(value: unknown): SchoolDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SchoolInputError('A school record is required.');
  const r = value as Record<string, unknown>;
  if (!['lesson', 'homework', 'reading'].includes(String(r.kind))) throw new SchoolInputError('Choose lesson, homework or reading.');
  if (!SCHOOL_SUBJECTS.includes(r.subject as typeof SCHOOL_SUBJECTS[number])) throw new SchoolInputError('Choose a school subject.');
  if (r.status !== 'needs_review' && r.status !== 'reviewed') throw new SchoolInputError('Choose a review status.');
  if (r.score !== null || r.maxScore !== null) {
    if (r.status !== 'reviewed' || !validMarks(r.score, r.maxScore) || !Number.isInteger(r.score) || !Number.isInteger(r.maxScore) || Number(r.maxScore) > 10000) {
      throw new SchoolInputError('Only teacher-reviewed work can have whole-number marks, from 0 up to a maximum of 10,000.');
    }
  }
  if (typeof r.photoReviewed !== 'boolean') throw new SchoolInputError('Confirm whether a photo was reviewed.');
  // An explicit allow-list prevents photographs, filenames and client-supplied authors being persisted.
  return { kind: r.kind as SchoolKind, subject: r.subject as string,
    title: boundedText(r.title, 'Title', 160, true), status: r.status,
    score: r.score as number | null, maxScore: r.maxScore as number | null,
    comment: boundedText(r.comment, 'Teacher comment', 3000), photoReviewed: r.photoReviewed };
}
export function validSchoolRequestId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}
export function parseSchoolRecord(text: string): StoredSchoolRecord | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown>;
    if (!raw || !validSchoolRequestId(raw.requestId) || raw.version !== 1 || !positiveId(raw.revision) || !positiveId(raw.teacherId)) return null;
    const draft = validateSchoolDraft(raw);
    if (draft.status === 'reviewed' && (typeof raw.reviewedAt !== 'string' || !Number.isFinite(Date.parse(raw.reviewedAt)))) return null;
    if (draft.status === 'needs_review' && raw.reviewedAt !== null) return null;
    return { requestId: raw.requestId, ...draft, version: 1, revision: Number(raw.revision), teacherId: Number(raw.teacherId), reviewedAt: raw.reviewedAt as string | null };
  } catch { return null; }
}
function bucket(): ProgressBucket { return { count: 0, needsReview: 0, scoredCount: 0, marks: 0, possibleMarks: 0, percent: null }; }
function add(b: ProgressBucket, r: ProgressRecord): void {
  b.count++;
  if (r.status !== 'reviewed') { b.needsReview++; return; }
  if (!validMarks(r.score, r.maxScore)) return;
  b.scoredCount++;
  b.marks += r.score!;
  b.possibleMarks += r.maxScore!;
  b.percent = Math.round(1000 * b.marks / b.possibleMarks) / 10;
}
export function summariseProgress(records: ProgressRecord[]): ProgressSummary {
  const summary: ProgressSummary = { ...bucket(), byKind: { lesson: bucket(), game: bucket(), homework: bucket(), reading: bucket() }, bySubject: Object.create(null) as Record<string, ProgressBucket> };
  for (const r of records) {
    add(summary, r);
    add(summary.byKind[r.kind], r);
    const subject = r.subject || 'general';
    summary.bySubject[subject] ??= bucket();
    add(summary.bySubject[subject], r);
  }
  return summary;
}
export function percentLabel(value: number | null): string { return value === null ? 'Not yet scored' : `${value}%`; }
export function recordMark(r: ProgressRecord): string {
  if (r.status !== 'reviewed') return 'Needs teacher review';
  return validMarks(r.score, r.maxScore) ? `${r.score}/${r.maxScore} (${Math.round(1000 * r.score! / r.maxScore!) / 10}%)` : 'Reviewed, no numeric mark';
}
/** Suggestions only. The teacher must verify the transcription and explicitly confirm a mark. */
export function localMarkSuggestion(answer: string, expected: string, transcriptionConfirmed: boolean): { suggestedScore: 0 | 1 | null; message: string } {
  if (!transcriptionConfirmed) return { suggestedScore: null, message: 'Check the photograph and confirm the transcription first.' };
  const a = answer.trim().normalize('NFC');
  const e = expected.trim().normalize('NFC');
  if (!a || !e || a.length > 500 || e.length > 500) return { suggestedScore: null, message: 'Needs teacher review: an answer or marking guide is missing.' };
  if (a === e) return { suggestedScore: 1, message: 'Exact match found locally. Confirm the mark yourself.' };
  // Do not guess about synonyms, working, spelling, units, fractions or partial credit.
  if (/^-?\d{1,9}(?:\.\d{1,6})?$/.test(a) && /^-?\d{1,9}(?:\.\d{1,6})?$/.test(e)) {
    return { suggestedScore: Number(a) === Number(e) ? 1 : 0, message: 'Numeric comparison only. Check working and partial credit before confirming.' };
  }
  return { suggestedScore: null, message: 'Needs teacher review: these answers require judgement. No mark has been guessed.' };
}
export function buildSchoolReport(pupil: { name: string; ageGroup: string }, records: ProgressRecord[], comments: string[], coverage: SchoolCoverage): string {
  const summary = summariseProgress(records);
  return [
    'SODAFOM — PRIVATE TEACHER REPORT',
    `Pupil: ${pupil.name}`, `Age group: ${pupil.ageGroup}`, `Generated: ${new Date().toISOString()}`,
    'School-linked records only. Private home accounts are not joined or inferred.',
    `Coverage: up to ${coverage.limitPerSource} most recent game results and ${coverage.limitPerSource} teacher notes/records.`,
    coverage.gamesTruncated || coverage.notesTruncated ? 'This report is a limited recent-history view, not a lifetime total.' : 'No history truncation detected.',
    `Unreadable saved records: ${coverage.unreadableRecords}. Pending or invalid marks are excluded from scores.`,
    'Scores are weighted by available marks. Unscored work is not treated as zero.',
    `Reviewed score: ${percentLabel(summary.percent)}`, `Needs teacher review: ${summary.needsReview}`, '',
    'SUBJECT SCORES', ...Object.entries(summary.bySubject).map(([name, s]) => `${name}: ${percentLabel(s.percent)}; ${s.scoredCount} scored; ${s.needsReview} awaiting review`), '',
    'RESULTS', ...records.map(r => `${r.recordedAt ?? 'Date not recorded'} | ${r.kind} | ${r.subject} | ${r.title} | ${recordMark(r)}${r.comment ? `\nTeacher comment: ${r.comment}` : ''}`), '',
    'TEACHER COMMENTS', ...comments, '', 'Photographs and pupil sign-in codes are not included. Store and share only through approved school processes.',
  ].join('\n');
}
export function validSchoolPhoto(mime: string, size: number, bytes: Uint8Array): boolean {
  if (!Number.isFinite(size) || size <= 0 || size > 5 * 1024 * 1024) return false;
  if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  if (mime === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}
