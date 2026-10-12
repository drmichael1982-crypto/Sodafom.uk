/**
 * POST /api/teacher/students/:studentId/notes
 * Adds a note for a student.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { students, studentNotes } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { resolveTeacher } from '@/server/api/teacher/me/GET';

export default async function handler(req: Request, res: Response) {
  try {
    const teacher = await resolveTeacher(req);
    if (!teacher) return res.status(401).json({ error: 'Unauthorised' });

    const rawId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const studentId = parseInt(rawId ?? '', 10);
    if (isNaN(studentId)) return res.status(400).json({ error: 'Invalid student ID' });

    const [student] = await db.select({ id: students.id }).from(students)
      .where(and(eq(students.id, studentId), eq(students.teacherId, teacher.id))).limit(1);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { noteText, subject } = req.body as { noteText?: string; subject?: string };
    if (!noteText?.trim()) return res.status(400).json({ error: 'Note text is required' });

    const validSubjects = ['maths', 'reading', 'spelling', 'general'];
    const sub = validSubjects.includes(subject ?? '') ? subject! : 'general';

    const [note] = await db.insert(studentNotes).values({
      studentId,
      teacherId: teacher.id,
      subject: sub,
      noteText: noteText.trim(),
    }).$returningId();

    res.status(201).json({ id: note.id, studentId, subject: sub, noteText: noteText.trim() });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
}
