import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students, studentActivity, studentNotes } from '@/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';
import { privateResponse, schoolError } from '../security';
import { decodeReview } from '@/lib/teacher-school';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const allStudents = await db.select().from(students).where(eq(students.teacherId, teacher.id)).orderBy(students.name);
    // Keep the existing array response and roster ownership contract.
    const enriched = [];
    for (const pupil of allStudents) {
      const [stats] = await db.select({
        gamesPlayed: sql<number>`count(*)`,
        avgScore: sql<number | null>`avg(case when ${studentActivity.maxScore} > 0 and ${studentActivity.score} >= 0 and ${studentActivity.score} <= ${studentActivity.maxScore} then 100.0 * ${studentActivity.score} / ${studentActivity.maxScore} else null end)`,
      }).from(studentActivity).where(eq(studentActivity.studentId, pupil.id));
      const [lastGame] = await db.select({ gameTitle: studentActivity.gameTitle, playedAt: studentActivity.playedAt }).from(studentActivity).where(eq(studentActivity.studentId, pupil.id)).orderBy(desc(studentActivity.playedAt)).limit(1);
      const notes = await db.select({ noteText: studentNotes.noteText }).from(studentNotes).where(and(eq(studentNotes.studentId, pupil.id), eq(studentNotes.teacherId, teacher.id))).orderBy(desc(studentNotes.createdAt)).limit(501);
      const pendingReviews = notes.slice(0, 500).filter((note: { noteText: string }) => decodeReview(note.noteText)?.status === 'needs_review').length;
      enriched.push({ ...pupil, stats: { gamesPlayed: Number(stats?.gamesPlayed ?? 0), avgScore: stats?.avgScore == null ? null : Number(stats.avgScore) }, lastGame: lastGame ?? null, pendingReviews, reviewsLimited: notes.length > 500 });
    }
    return res.json(enriched);
  } catch (error) { return schoolError(res, error, 'Could not load your class list.'); }
}
