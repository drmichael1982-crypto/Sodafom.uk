/**
 * POST /api/teacher/students
 * Adds a new student to the teacher's class. Generates a unique SODA-STUD-XXXX code.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { resolveTeacher } from '../me/GET';
import { randomBytes } from 'node:crypto';

async function generateStudentCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const part = randomBytes(2).toString('hex').toUpperCase();
    const code = `SODA-STUD-${part}`;
    const [existing] = await db.select({ id: students.id }).from(students).where(eq(students.studentCode, code)).limit(1);
    if (!existing) return code;
  }
  throw new Error('Could not generate unique student code');
}

export default async function handler(req: Request, res: Response) {
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Unauthorised' });

    const { name, ageGroup, avatarEmoji } = req.body as { name?: string; ageGroup?: string; avatarEmoji?: string };
    if (!name?.trim()) return res.status(400).json({ error: 'Student name is required' });

    const validAgeGroups = ['5-7', '8-10', '11-13'];
    const age = validAgeGroups.includes(ageGroup ?? '') ? ageGroup! : '8-10';

    const studentCode = await generateStudentCode();
    const [newStudent] = await db.insert(students).values({
      teacherId: teacher.id,
      studentCode,
      name: name.trim(),
      ageGroup: age,
      avatarEmoji: avatarEmoji ?? '⭐',
    }).$returningId();

    const [created] = await db.select().from(students).where(eq(students.id, newStudent.id)).limit(1);
    res.status(201).json(created);
  } catch (err) {
    console.error('Add student error:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
}
