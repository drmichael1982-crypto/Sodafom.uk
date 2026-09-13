import type { Request, Response } from 'express';
import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
const db = connection as MySql2Database;

export async function resolveTeacher(req: Request): Promise<typeof teacherAccounts.$inferSelect | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ') || !/^[a-f0-9]{96}$/i.test(auth.slice(7))) return null;
  const [session] = await db.select().from(teacherSessions)
    .where(and(eq(teacherSessions.token, auth.slice(7)), gt(teacherSessions.expiresAt, new Date()))).limit(1);
  if (!session) return null;
  const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.id, session.teacherId)).limit(1);
  return teacher ?? null;
}
export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  res.set('Vary', 'Authorization');
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Please sign in as a teacher.' });
    return res.json({ id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className });
  } catch { return res.status(500).json({ error: 'Could not load your teacher profile.' }); }
}
