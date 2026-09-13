import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { studentActivity, studentNotes } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { resolveTeacher } from '@/server/api/teacher/me/GET';
import { getGameRecommendations } from '@/server/lib/game-recommendations';
import { privateResponse, schoolError, ownedStudent } from '@/server/api/teacher/security';
import { decodeReview, REVIEW_PREFIX, summariseProgress, type SavedReview } from '@/lib/teacher-school';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const student = await ownedStudent(req.params.studentId, teacher.id);
    if (!student) return res.status(404).json({ error: 'Pupil not found.' });
    const activityRows = await db.select().from(studentActivity).where(eq(studentActivity.studentId, student.id)).orderBy(desc(studentActivity.playedAt), desc(studentActivity.id)).limit(501);
    const noteRows = await db.select().from(studentNotes).where(and(eq(studentNotes.studentId, student.id), eq(studentNotes.teacherId, teacher.id))).orderBy(desc(studentNotes.createdAt), desc(studentNotes.id)).limit(501);
    const activity = activityRows.slice(0, 500), notes = noteRows.slice(0, 500);
    const reviews: SavedReview[] = [];
    let invalidReviewCount = 0;
    for (const note of notes) {
      const review = decodeReview(note.noteText);
      if (review) reviews.push({ ...review, id: note.id, createdAt: note.createdAt });
      else if (note.noteText.startsWith(REVIEW_PREFIX)) invalidReviewCount++;
    }
    const comments = notes.filter((note: { noteText: string }) => !note.noteText.startsWith(REVIEW_PREFIX));
    const progress = summariseProgress(activity, reviews);
    const recommendations = getGameRecommendations(
      comments.map((note: { noteText: string }) => note.noteText).join(' '),
      activity.map((entry: { gameId: string }) => entry.gameId),
    )
      .map((recommendation) => ({ ...recommendation, path: recommendation.href }));
    return res.json({ student, activity, notes: comments, reviews, progress,
      // Backward-compatible subjectStats name; percentage fields now have explicit meaning.
      subjectStats: progress.bySubject.map(item => ({ subject: item.subject, gamesPlayed: item.count, avgScore: item.averagePercent })),
      recommendations, invalidReviewCount, historyLimited: activityRows.length > 500 || noteRows.length > 500,
      historyScope: 'Latest 500 activity records and latest 500 comments/work reviews. Not a lifetime report.' });
  } catch (error) { return schoolError(res, error, 'Could not load this pupil.'); }
}
