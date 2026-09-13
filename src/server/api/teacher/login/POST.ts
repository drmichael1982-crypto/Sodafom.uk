import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, teacherSessions } from '@/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { hashTeacherPassword, verifyTeacherPassword } from '@/server/teacher-password';
import { object, normaliseEmail, passwordInput } from '@/lib/teacher-school';
import { allowAttempt, bearerToken, tokenHash, privateResponse, schoolError } from '../security';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    const body = object(req.body);
    // Reuse the existing teacher route so no shared routing or parent auth is changed.
    if (body.action === 'logout') {
      const token = bearerToken(req);
      if (token) {
        await db.delete(teacherSessions).where(or(
          eq(teacherSessions.token, tokenHash(token)),
          eq(teacherSessions.token, token),
        ));
      }
      return res.json({ success: true });
    }

    if (!allowAttempt(req, res, 'teacher-login', 30)) return;
    const email = normaliseEmail(body.email);
    const password = passwordInput(body.password);
    const [teacher] = await db.select().from(teacherAccounts).where(eq(teacherAccounts.email, email)).limit(1);
    // Keep the verification cost comparable for unknown emails without revealing accounts.
    if (!teacher) {
      await hashTeacherPassword(password);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const verification = await verifyTeacherPassword(password, teacher.passwordHash);
    if (!verification.valid) return res.status(401).json({ error: 'Invalid email or password.' });
    if (verification.needsUpgrade) {
      await db.update(teacherAccounts).set({ passwordHash: await hashTeacherPassword(password) }).where(eq(teacherAccounts.id, teacher.id));
    }

    const token = randomBytes(48).toString('hex');
    await db.insert(teacherSessions).values({
      teacherId: teacher.id,
      token: tokenHash(token),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
    return res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email, className: teacher.className ?? 'My Class' } });
  } catch (error) {
    return schoolError(res, error, 'Sign-in is unavailable. Please try again.');
  }
}
