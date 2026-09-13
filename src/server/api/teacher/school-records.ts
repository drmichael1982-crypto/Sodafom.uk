import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { students, studentActivity, studentNotes } from '@/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { SCHOOL_HISTORY_LIMIT, SCHOOL_RECORD_SUBJECT, parseSchoolRecord, summariseProgress, validMarks, type ProgressRecord } from '@/lib/teacher-progress';
const db = connection as MySql2Database;

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
/** Ownership is checked here as well as at the calling endpoint. Never join family profiles by name. */
export async function loadTeacherPupil(teacherId: number, studentId: number) {
  const [student] = await db.select().from(students)
    .where(and(eq(students.id, studentId), eq(students.teacherId, teacherId))).limit(1);
  if (!student) return null;
  const [gameRows, noteRows] = await Promise.all([
    db.select().from(studentActivity).where(eq(studentActivity.studentId, studentId))
      .orderBy(desc(studentActivity.playedAt), desc(studentActivity.id)).limit(SCHOOL_HISTORY_LIMIT + 1),
    db.select().from(studentNotes).where(and(eq(studentNotes.studentId, studentId), eq(studentNotes.teacherId, teacherId)))
      .orderBy(desc(studentNotes.createdAt), desc(studentNotes.id)).limit(SCHOOL_HISTORY_LIMIT + 1),
  ]);
  const activity = gameRows.slice(0, SCHOOL_HISTORY_LIMIT);
  const records: ProgressRecord[] = activity.map(a => ({
    id: `game:${a.id}`, kind: 'game', subject: a.subject, title: a.gameTitle,
    status: validMarks(a.score, a.maxScore) ? 'reviewed' : 'needs_review',
    score: a.score, maxScore: a.maxScore, comment: '', photoReviewed: false,
    recordedAt: iso(a.playedAt), source: 'game',
  }));
  let unreadableRecords = 0;
  const notes: { id: number; noteText: string; subject: string | null; createdAt: string | null }[] = [];
  for (const n of noteRows.slice(0, SCHOOL_HISTORY_LIMIT)) {
    if (n.subject !== SCHOOL_RECORD_SUBJECT) {
      notes.push({ id: n.id, noteText: n.noteText, subject: n.subject, createdAt: iso(n.createdAt) });
      continue;
    }
    const r = parseSchoolRecord(n.noteText);
    if (!r || r.teacherId !== teacherId) { unreadableRecords++; continue; }
    records.push({ ...r, id: `note:${n.id}`, noteId: n.id, recordedAt: iso(n.createdAt), source: 'teacher' });
  }
  records.sort((a, b) => (b.recordedAt ?? '').localeCompare(a.recordedAt ?? '') || a.id.localeCompare(b.id));
  const summary = summariseProgress(records);
  const coverage = { limitPerSource: SCHOOL_HISTORY_LIMIT, gamesTruncated: gameRows.length > SCHOOL_HISTORY_LIMIT, notesTruncated: noteRows.length > SCHOOL_HISTORY_LIMIT, unreadableRecords };
  return { student, activity, notes, records, summary, coverage };
}
