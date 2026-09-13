import type { Request, Response } from 'express';
import { db as connection } from '@/server/db/client';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { hashTeacherPassword, verifyTeacherPassword } from '@/server/teacher-password';
const db = connection as MySql2Database;

// Defence in depth for this process, not a substitute for a shared production edge limit.
const attempts = new Map<string, { count: number; until: number }>();
function allowed(key: string): boolean {
  const now = Date.now();
  for (const [k, value] of attempts) if (value.until <= now) attempts.delete(k);
  let entry = attempts.get(key);
  if (!entry) {
    if (attempts.size >= 2000) return false;
    entry = { count: 0, until: now + 15 * 60 * 1000 };
    attempts.set(key, entry);
  }
  return ++entry.count <= 60;
}
let dummyHash: Promise<string> | undefined;
export default async function handler(req: Request, res: Response) {
  res.set('Cache-Control', 'private, no-store');
  try {
    if (req.body?.action === 'logout') {
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ') && /^[a-f0-9]{96}$/i.test(auth.slice(7))) {
        await db.delete(teacherSessions).where(eq(teacherSessions.token, auth.slice(7)));
      }
      return res.status(204).end();
    }
    const email = req.body?.email;
    const password = req.body?.password;
    if (typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      || typeof password !== 'string' || !password || password.length > 256) {
      return res.status(400).json({ error: 'Enter a valid email address and password.' });
    }
    if (!allowed(req.ip ?? 'unknown')) {
      res.set('Retry-After', '900');
      return res.status(429).json({ error: 'Too many sign-in attempts. Please try again later.' });
    }
    const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.email, email.toLowerCase().trim())).limit(1);
    dummyHash ??= hashTeacherPassword(randomBytes(32).toString('hex'));
    const verification = await verifyTeacherPassword(password, teacher?.passwordHash ?? await dummyHash);
    if (!teacher || !verification.valid) return res.status(401).json({ error: 'Invalid email or password.' });
    if (verification.needsUpgrade) {
      await db.update(teacherAccounts).set({ passwordHash: await hashTeacherPassword(password) }).where(eq(teacherAccounts.id, teacher.id));
    }
    const token = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await db.insert(teacherSessions).values({ teacherId: teacher.id, token, expiresAt });
    return res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className } });
  } catch {
    return res.status(500).json({ error: 'Teacher sign-in is unavailable. Please retry.' });
  }
}
