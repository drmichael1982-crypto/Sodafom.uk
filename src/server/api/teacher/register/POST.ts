import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, schoolLicences } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashTeacherPassword } from '@/server/teacher-password';
import { object, text, normaliseEmail, passwordInput } from '@/lib/teacher-school';
import { allowAttempt, privateResponse, schoolError } from '../security';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    if (!allowAttempt(req, res, 'teacher-register', 10)) return;
    const body = object(req.body);
    const name = text(body.name, 'Name', 255);
    const email = normaliseEmail(body.email);
    const password = passwordInput(body.password, true);
    const className = text(body.className, 'Class name', 128);
    // Preserve the existing school-licence membership model; no payment or schema policy changes are made here.
    const licenceKey = text(body.licenceKey, 'School access key', 64);
    const [licence] = await db.select().from(schoolLicences).where(eq(schoolLicences.licenceKey, licenceKey)).limit(1);
    if (!licence || (licence.expiresAt && licence.expiresAt < new Date())) {
      return res.status(400).json({ error: 'School access key is invalid or expired.' });
    }

    const [existing] = await db.select({ id: teacherAccounts.id }).from(teacherAccounts).where(eq(teacherAccounts.email, email)).limit(1);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });

    const [teacher] = await db.insert(teacherAccounts).values({
      licenceId: licence.id,
      name,
      email,
      passwordHash: await hashTeacherPassword(password),
      className,
    }).$returningId();
    return res.status(201).json({ success: true, teacherId: teacher.id });
  } catch (error) {
    return schoolError(res, error, 'Registration is unavailable. Please try again.');
  }
}
