import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, schoolLicences } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashTeacherPassword } from '@/server/teacher-password';
import { object, text, normaliseEmail, passwordInput, SCHOOL_POLICY } from '@/lib/teacher-school';
import { allowAttempt, privateResponse, schoolError } from '../security';

export default async function handler(req: Request, res: Response) {
  privateResponse(res);
  try {
    if (!allowAttempt(req, res, 'teacher-register', 10)) return;
    const body = object(req.body);
    const name = text(body.name, 'Name', 255), email = normaliseEmail(body.email);
    const password = passwordInput(body.password, true), className = text(body.className, 'Class name', 128);
    // Optional legacy school link. A free account NEVER inherits another teacher's roster.
    const licenceKey = text(body.licenceKey, 'School access key', 64, false);
    let licenceId: number | null = null;
    if (licenceKey) {
      const [licence] = await db.select().from(schoolLicences).where(eq(schoolLicences.licenceKey, licenceKey)).limit(1);
      if (!licence || (licence.expiresAt && licence.expiresAt < new Date())) return res.status(400).json({ error: 'School access key is invalid or expired.' });
      licenceId = licence.id;
    }
    const [existing] = await db.select({ id: teacherAccounts.id }).from(teacherAccounts).where(eq(teacherAccounts.email, email)).limit(1);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    const [teacher] = await db.insert(teacherAccounts).values({ licenceId, name, email, passwordHash: await hashTeacherPassword(password), className }).$returningId();
    return res.status(201).json({ success: true, teacherId: teacher.id, schoolPolicy: SCHOOL_POLICY });
  } catch (error) { return schoolError(res, error, 'Registration is unavailable. The school database setup may need updating.'); }
}
