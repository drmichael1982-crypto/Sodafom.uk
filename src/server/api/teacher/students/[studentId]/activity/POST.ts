/**
 * POST /api/teacher/students/:studentId/activity
 * Logs a game activity for a student (called from game pages when student code is active).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students, studentActivity } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { studentCode, gameId, gameTitle, subject, score, maxScore, starsEarned, durationSeconds } = req.body as {
      studentCode?: string; gameId?: string; gameTitle?: string; subject?: string;
      score?: number; maxScore?: number; starsEarned?: number; durationSeconds?: number;
    };

    if (!studentCode || !gameId || !subject) return res.status(400).json({ error: 'studentCode, gameId, subject required' });

    const [student] = await db.select({ id: students.id }).from(students).where(eq(students.studentCode, studentCode)).limit(1);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await db.insert(studentActivity).values({
      studentId: student.id,
      gameId,
      gameTitle: gameTitle ?? gameId,
      subject,
      score: score ?? 0,
      maxScore: maxScore ?? 100,
      starsEarned: starsEarned ?? 0,
      durationSeconds: durationSeconds ?? 0,
    });

    // Update student's total stars and lastActiveAt
    await db.update(students).set({
      totalStars: sql`${students.totalStars} + ${starsEarned ?? 0}`,
      lastActiveAt: new Date(),
    }).where(eq(students.id, student.id));

    res.json({ success: true });
  } catch (err) {
    console.error('Log activity error:', err);
    res.status(500).json({ error: 'Failed to log activity' });
  }
}
