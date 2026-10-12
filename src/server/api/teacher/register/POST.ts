/**
 * POST /api/teacher/register
 * Registers a teacher account linked to a school licence key.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { teacherAccounts, schoolLicences } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'sodafom-teacher-salt').digest('hex');
}

export default async function handler(req: Request, res: Response) {
  try {
    const { name, email, password, licenceKey, className } = req.body as {
      name?: string; email?: string; password?: string; licenceKey?: string; className?: string;
    };
    if (!name || !email || !password || !licenceKey) {
      return res.status(400).json({ error: 'name, email, password and licenceKey are required' });
    }

    // Validate licence key
    const [licence] = await db.select().from(schoolLicences).where(eq(schoolLicences.licenceKey, licenceKey.trim())).limit(1);
    if (!licence) return res.status(400).json({ error: 'Invalid school licence key' });
    if (licence.expiresAt && licence.expiresAt < new Date()) return res.status(400).json({ error: 'School licence has expired' });

    // Check email not already used
    const [existing] = await db.select({ id: teacherAccounts.id }).from(teacherAccounts).where(eq(teacherAccounts.email, email.toLowerCase().trim())).limit(1);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const [teacher] = await db.insert(teacherAccounts).values({
      licenceId: licence.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      className: className?.trim() || 'My Class',
    }).$returningId();

    res.status(201).json({ success: true, teacherId: teacher.id });
  } catch (err) {
    console.error('Teacher register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}
