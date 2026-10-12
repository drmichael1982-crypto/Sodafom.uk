/**
 * GET /api/teacher/student-lookup?code=SODA-STUD-XXXX
 * Looks up a student by their unique code (used on game pages).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const code = (req.query.code as string | undefined)?.trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'code is required' });

    const [student] = await db.select({
      id: students.id,
      studentCode: students.studentCode,
      name: students.name,
      ageGroup: students.ageGroup,
      avatarEmoji: students.avatarEmoji,
      totalStars: students.totalStars,
    }).from(students).where(eq(students.studentCode, code)).limit(1);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' });
  }
}
