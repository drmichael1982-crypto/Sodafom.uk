/**
 * GET /api/teacher/students/:studentId
 * Returns full detail for one student — activity history, notes, recommendations.
 * Import path fixed: uses @/ alias instead of relative ../../..
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students, studentActivity, studentNotes } from '@/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { resolveTeacher } from '@/server/api/teacher/me/GET';
import { getGameRecommendations } from '@/server/lib/game-recommendations';

export default async function handler(req: Request, res: Response) {
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Unauthorised' });

    const rawId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const studentId = parseInt(rawId ?? '', 10);
    if (isNaN(studentId)) return res.status(400).json({ error: 'Invalid student ID' });

    const [student] = await db.select().from(students)
      .where(and(eq(students.id, studentId), eq(students.teacherId, teacher.id))).limit(1);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const activity = await db.select().from(studentActivity)
      .where(eq(studentActivity.studentId, studentId))
      .orderBy(desc(studentActivity.playedAt)).limit(50);

    const notes = await db.select().from(studentNotes)
      .where(eq(studentNotes.studentId, studentId))
      .orderBy(desc(studentNotes.createdAt));

    // Subject breakdown
    const subjectStats = await db.select({
      subject: studentActivity.subject,
      gamesPlayed: sql<number>`count(*)`,
      avgScore: sql<number>`coalesce(avg(${studentActivity.score}), 0)`,
      totalStars: sql<number>`coalesce(sum(${studentActivity.starsEarned}), 0)`,
    }).from(studentActivity).where(eq(studentActivity.studentId, studentId))
      .groupBy(studentActivity.subject);

    // Smart recommendations based on notes
    const allNoteText = notes.map((n: any) => n.noteText).join(' ');
    const recommendations = getGameRecommendations(allNoteText, activity.map((a: any) => a.gameId));

    res.json({ student, activity, notes, subjectStats, recommendations });
  } catch (err) {
    console.error('Get student detail error:', err);
    res.status(500).json({ error: 'Failed to load student' });
  }
}
