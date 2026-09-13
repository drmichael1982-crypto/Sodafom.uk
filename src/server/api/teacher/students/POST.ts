import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';
import { randomBytes } from 'node:crypto';
import { object, text, ageGroupInput } from '@/lib/teacher-school';
import { privateResponse, schoolError } from '../security';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    const body = object(req.body), name = text(body.name, 'Pupil display name', 255), ageGroup = ageGroupInput(body.ageGroup);
    const avatarEmoji = body.avatarEmoji === undefined ? '⭐' : text(body.avatarEmoji, 'Avatar', 8);
    for (let attempt = 0; attempt < 5; attempt++) {
      // 40 random bits, fits the existing 20-character column and keeps the code prefix.
      const studentCode = 'SODA-STUD-' + randomBytes(5).toString('hex').toUpperCase();
      try {
        const [created] = await db.insert(students).values({ teacherId: teacher.id, name, ageGroup, avatarEmoji, studentCode }).$returningId();
        const [student] = await db.select().from(students).where(eq(students.id, created.id)).limit(1);
        return res.status(201).json(student);
      } catch (error) {
        const cause = error as { code?: string; cause?: { code?: string } };
        if (cause.code !== 'ER_DUP_ENTRY' && cause.cause?.code !== 'ER_DUP_ENTRY') throw error;
      }
    }
    return res.status(503).json({ error: 'Could not create a pupil code. Please try again.' });
  } catch (error) { return schoolError(res, error, 'Could not add this pupil.'); }
}
