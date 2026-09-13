/** Teacher comments and versioned school review records share the existing, school-owned notes store.
 * No database migration, image persistence, family-data joins or new route registration is required.
 */
import type { Request, Response } from 'express';
import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { students, studentNotes } from '@/server/db/schema';
import { eq, and, like } from 'drizzle-orm';
import { resolveTeacher } from '@/server/api/teacher/me/GET';
import { SCHOOL_RECORD_SUBJECT, SCHOOL_SUBJECTS, SchoolInputError, boundedText, positiveId, validSchoolRequestId, parseSchoolRecord, validateSchoolDraft, type StoredSchoolRecord } from '@/lib/teacher-progress';
const db = connection as MySql2Database;

class RecordError extends Error { constructor(public status: number, message: string) { super(message); } }
export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const studentId = positiveId(req.params.studentId);
    if (!studentId) return res.status(400).json({ error: 'Invalid pupil ID.' });
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) throw new SchoolInputError('A comment or school record is required.');
    const body = req.body as Record<string, unknown>;
    if (body.action !== undefined && body.action !== 'save-record') throw new SchoolInputError('Unknown teacher action.');
    const result = await db.transaction(async tx => {
      // Lock ownership while writing; a stale browser cannot write into another teacher's class.
      const [student] = await tx.select({ id: students.id }).from(students)
        .where(and(eq(students.id, studentId), eq(students.teacherId, teacher.id))).limit(1).for('update');
      if (!student) throw new RecordError(404, 'Pupil not found in your class.');
      if (body.action === 'save-record') {
        const draft = validateSchoolDraft(body.record);
        const recordId = body.recordId === undefined ? null : positiveId(body.recordId);
        if (body.recordId !== undefined && !recordId) throw new SchoolInputError('Invalid review ID.');
        let revision = 1;
        let requestId = body.requestId;
        if (!validSchoolRequestId(requestId)) throw new SchoolInputError('A valid school record request ID is required.');
        if (recordId) {
          const [previous] = await tx.select().from(studentNotes)
            .where(and(eq(studentNotes.id, recordId), eq(studentNotes.studentId, studentId), eq(studentNotes.teacherId, teacher.id), eq(studentNotes.subject, SCHOOL_RECORD_SUBJECT)))
            .limit(1).for('update');
          if (!previous) throw new RecordError(404, 'Review not found in your class.');
          const saved = parseSchoolRecord(previous.noteText);
          if (!saved || saved.teacherId !== teacher.id || positiveId(body.expectedRevision) !== saved.revision) {
            throw new RecordError(409, 'This review has changed. Refresh it before saving again.');
          }
          revision = saved.revision + 1;
          requestId = saved.requestId;
        }
        if (!recordId) {
          // The pupil-row lock serialises retries. The key is first in the JSON, so this prefix cannot match a comment.
          const [existing] = await tx.select().from(studentNotes)
            .where(and(eq(studentNotes.studentId, studentId), eq(studentNotes.teacherId, teacher.id), eq(studentNotes.subject, SCHOOL_RECORD_SUBJECT), like(studentNotes.noteText, `{"requestId":"${requestId}",%`))).limit(1);
          if (existing) {
            const saved = parseSchoolRecord(existing.noteText);
            if (!saved || saved.teacherId !== teacher.id || JSON.stringify(validateSchoolDraft(saved)) !== JSON.stringify(draft)) {
              throw new RecordError(409, 'This record was already saved. Refresh it before changing it.');
            }
            return { id: existing.id, revision: saved.revision, updated: true };
          }
        }
        const stored: StoredSchoolRecord = { requestId, ...draft, version: 1, revision, teacherId: teacher.id, reviewedAt: draft.status === 'reviewed' ? new Date().toISOString() : null };
        if (recordId) {
          await tx.update(studentNotes).set({ noteText: JSON.stringify(stored), updatedAt: new Date() })
            .where(and(eq(studentNotes.id, recordId), eq(studentNotes.studentId, studentId), eq(studentNotes.teacherId, teacher.id)));
          return { id: recordId, revision, updated: true };
        }
        const [created] = await tx.insert(studentNotes).values({ studentId, teacherId: teacher.id, subject: SCHOOL_RECORD_SUBJECT, noteText: JSON.stringify(stored) }).$returningId();
        return { id: created.id, revision, updated: false };
      }
      let noteText = boundedText(body.noteText, 'Teacher comment', 3000, true);
      if (body.needsHelp !== undefined && body.needsHelp !== '') {
        noteText = boundedText(`${noteText}\nNeeds support: ${boundedText(body.needsHelp, 'Support note', 500)}`, 'Teacher comment', 3000, true);
      }
      const subject = body.subject === undefined ? 'general' : String(body.subject);
      if (!SCHOOL_SUBJECTS.includes(subject as typeof SCHOOL_SUBJECTS[number])) throw new SchoolInputError('Choose a school subject.');
      const [created] = await tx.insert(studentNotes).values({ studentId, teacherId: teacher.id, subject, noteText }).$returningId();
      return { id: created.id, studentId, subject, noteText, updated: false };
    });
    return res.status(result.updated ? 200 : 201).json(result);
  } catch (error) {
    if (error instanceof SchoolInputError) return res.status(400).json({ error: error.message });
    if (error instanceof RecordError) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: 'Could not save. Your work has not been confirmed as saved; please retry.' });
  }
}
