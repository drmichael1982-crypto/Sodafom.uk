import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'sodafom-teacher-salt').digest('hex');
}

export default async function handler(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.email, email.toLowerCase().trim())).limit(1);
    if (!teacher) return res.status(401).json({ error: 'Invalid email or password' });

    const hash = hashPassword(password);
    // Use timingSafeEqual to prevent timing-based enumeration attacks
    const { timingSafeEqual } = await import('node:crypto');
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(teacher.passwordHash ?? '', 'hex');
    const match = hashBuf.length === storedBuf.length && timingSafeEqual(hashBuf, storedBuf);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    // Create session token
    const token = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.insert(teacherSessions).values({ teacherId: teacher.id, token, expiresAt });

    res.json({
      token,
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className },
    });
  } catch (err) {
    console.error('Teacher login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}
