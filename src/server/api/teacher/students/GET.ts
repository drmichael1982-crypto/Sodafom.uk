/**
 * GET /api/teacher/students
 * Returns all students for the authenticated teacher.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students, studentActivity, studentNotes } from '@/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';

export default async function handler(req: Request, res: Response) {
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Unauthorised' });

    const allStudents = await db.select().from(students).where(eq(students.teacherId, teacher.id)).orderBy(students.name);

    // For each student get last activity + total games played
    const enriched = await Promise.all(allStudents.map(async (s: any) => {
      const [stats] = await db.select({
        gamesPlayed: sql<number>`count(*)`,
        totalStarsEarned: sql<number>`coalesce(sum(${studentActivity.starsEarned}), 0)`,
        avgScore: sql<number>`coalesce(avg(${studentActivity.score}), 0)`,
      }).from(studentActivity).where(eq(studentActivity.studentId, s.id));

      const [lastGame] = await db.select({ gameTitle: studentActivity.gameTitle, playedAt: studentActivity.playedAt })
        .from(studentActivity).where(eq(studentActivity.studentId, s.id))
        .orderBy(desc(studentActivity.playedAt)).limit(1);

      const notes = await db.select().from(studentNotes).where(eq(studentNotes.studentId, s.id)).orderBy(desc(studentNotes.createdAt));

      return { ...s, stats, lastGame: lastGame ?? null, notes };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Failed to load students' });
  }
}
