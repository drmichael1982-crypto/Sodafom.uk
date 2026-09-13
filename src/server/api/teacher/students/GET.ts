import type { Request, Response } from 'express';
import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { students } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';
import { loadTeacherPupil } from '../school-records';
const db = connection as MySql2Database;

export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  res.set('Vary', 'Authorization');
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const roster = await db.select({ id: students.id }).from(students).where(eq(students.teacherId, teacher.id)).orderBy(students.name);
    const enriched = [];
    // Sequential loading bounds database concurrency for a large class.
    for (const s of roster) {
      const data = await loadTeacherPupil(teacher.id, s.id);
      if (!data) continue;
      enriched.push({ ...data.student, notes: data.notes, summary: data.summary, coverage: data.coverage,
        stats: { gamesPlayed: data.summary.byKind.game.count, totalStarsEarned: data.student.totalStars, avgScore: data.summary.percent },
        lastGame: data.activity[0] ? { gameTitle: data.activity[0].gameTitle, playedAt: data.activity[0].playedAt } : null,
      });
    }
    return res.json(enriched);
  } catch {
    return res.status(500).json({ error: 'Could not load your class. Please retry.' });
  }
}
