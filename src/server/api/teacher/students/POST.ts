import type { Request, Response } from 'express';
import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { students } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';
import { randomBytes } from 'node:crypto';
import { boundedText, normaliseAgeGroup, summariseProgress, SchoolInputError, SCHOOL_HISTORY_LIMIT } from '@/lib/teacher-progress';
const db = connection as MySql2Database;

export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const name = boundedText(req.body?.name, 'Pupil name or school alias', 120, true);
    const ageGroup = normaliseAgeGroup(req.body?.ageGroup);
    if (!ageGroup) throw new SchoolInputError('Choose a valid age group.');
    const avatarEmoji = boundedText(req.body?.avatarEmoji ?? '⭐', 'Avatar', 8, true);
    // The 20-character schema permits a 40-bit random suffix without changing pupil-code consumers.
    let studentCode = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `SODA-STUD-${randomBytes(5).toString('hex').toUpperCase()}`;
      const [existing] = await db.select({ id: students.id }).from(students).where(eq(students.studentCode, candidate)).limit(1);
      if (!existing) { studentCode = candidate; break; }
    }
    if (!studentCode) throw new Error('No code available');
    const [created] = await db.insert(students).values({ teacherId: teacher.id, name, ageGroup, avatarEmoji, studentCode }).$returningId();
    const [student] = await db.select().from(students).where(and(eq(students.id, created.id), eq(students.teacherId, teacher.id))).limit(1);
    if (!student) throw new Error('Created pupil could not be read');
    return res.status(201).json({ ...student, notes: [], lastGame: null, summary: summariseProgress([]),
      stats: { gamesPlayed: 0, totalStarsEarned: 0, avgScore: null },
      coverage: { limitPerSource: SCHOOL_HISTORY_LIMIT, gamesTruncated: false, notesTruncated: false, unreadableRecords: 0 },
    });
  } catch (error) {
    if (error instanceof SchoolInputError) return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Could not add the pupil. Refresh your class list before retrying.' });
  }
}
