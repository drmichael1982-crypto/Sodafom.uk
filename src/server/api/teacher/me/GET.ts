import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq, and, gt, or } from 'drizzle-orm';
import { bearerToken, tokenHash, privateResponse, schoolError } from '../security';
import { SCHOOL_POLICY } from '@/lib/teacher-school';

export async function resolveTeacher(req: Request): Promise<typeof teacherAccounts.$inferSelect | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const [session] = await db.select().from(teacherSessions)
    .where(and(or(eq(teacherSessions.token, tokenHash(token)), eq(teacherSessions.token, token)), gt(teacherSessions.expiresAt, new Date()))).limit(1);
  if (!session) return null;
  const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.id, session.teacherId)).limit(1);
  return teacher ?? null;
}
export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    return res.json({ id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className, schoolPolicy: SCHOOL_POLICY });
  } catch (error) { return schoolError(res, error, 'Could not load your teacher profile.'); }
}
