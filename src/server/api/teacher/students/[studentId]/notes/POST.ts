import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { studentNotes } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { resolveTeacher } from '@/server/api/teacher/me/GET';
import { privateResponse, schoolError, ownedStudent } from '@/server/api/teacher/security';
import { object, text, subjectInput, positiveId, validateReview, encodeReview, decodeReview, REVIEW_PREFIX } from '@/lib/teacher-school';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const student = await ownedStudent(req.params.studentId, teacher.id);
    if (!student) return res.status(404).json({ error: 'Pupil not found.' });
    const body = object(req.body);
    if (body.action === 'saveReview') {
      if (body.reviewId !== undefined) {
        const reviewId = positiveId(body.reviewId);
        const condition = and(eq(studentNotes.id, reviewId), eq(studentNotes.studentId, student.id), eq(studentNotes.teacherId, teacher.id));
        const [existing] = await db.select().from(studentNotes).where(condition).limit(1);
        const previous = existing ? decodeReview(existing.noteText) : null;
        if (!existing || !previous) return res.status(404).json({ error: 'Review not found.' });
        if (body.expectedRevision !== previous.revision) return res.status(409).json({ error: 'This review changed. Reload it before saving.' });
        const review = validateReview(body.review, teacher.id, previous.revision + 1);
        // Compare-and-swap prevents overwriting another browser tab's review.
        const [result] = await db.update(studentNotes).set({ noteText: encodeReview(review), subject: review.subject, updatedAt: new Date() })
          .where(and(condition, eq(studentNotes.noteText, existing.noteText)));
        if (result.affectedRows !== 1) return res.status(409).json({ error: 'This review changed. Reload it before saving.' });
        return res.json({ id: reviewId, ...review });
      }
      const review = validateReview(body.review, teacher.id);
      const [saved] = await db.insert(studentNotes).values({ studentId: student.id, teacherId: teacher.id, subject: review.subject, noteText: encodeReview(review) }).$returningId();
      return res.status(201).json({ id: saved.id, ...review });
    }
    const noteText = text(body.noteText, 'Comment', 4000), subject = subjectInput(body.subject ?? 'general');
    if (noteText.startsWith(REVIEW_PREFIX.trimEnd())) return res.status(400).json({ error: 'Use the work review form for assessments.' });
    const [saved] = await db.insert(studentNotes).values({ studentId: student.id, teacherId: teacher.id, subject, noteText }).$returningId();
    return res.status(201).json({ id: saved.id, studentId: student.id, subject, noteText });
  } catch (error) { return schoolError(res, error, 'Could not save this comment or review.'); }
}
