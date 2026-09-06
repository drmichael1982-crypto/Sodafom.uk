/**
 * GET /api/teacher/me
 * Returns the authenticated teacher's profile.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function resolveTeacher(req: Request): Promise<typeof teacherAccounts.$inferSelect | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [session] = await db.select().from(teacherSessions)
    .where(and(eq(teacherSessions.token, token), gt(teacherSessions.expiresAt, new Date())))
    .limit(1);
  if (!session) return null;
  const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.id, session.teacherId)).limit(1);
  return teacher ?? null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Unauthorised' });
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
}
