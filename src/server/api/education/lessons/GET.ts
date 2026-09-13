import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../../../db/client.js';

const AGE_GROUPS = new Set(['5-7', '8-10', '11-13']);
const CLOUD_SUBJECTS = new Set(['maths', 'english', 'history']);

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

function normaliseSubject(raw: string): string {
  const subject = raw.trim().toLowerCase();
  if (subject === 'math' || subject === 'mathematics') return 'maths';
  if (subject === 'writing' || subject === 'reading' || subject === 'spelling') return 'english';
  return subject;
}

function extractRows(result: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(result)) return [];
  const maybeRows = Array.isArray(result[0]) ? result[0] : result;
  return maybeRows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row));
}

function parseLessonJson(value: unknown): Record<string, unknown> | null {
  try {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    return null;
  }
  return null;
}

export default async function handler(req: Request, res: Response) {
  const requestedSubject = firstQueryValue(req.query.subject);
  const ageGroup = firstQueryValue(req.query.age);
  const rawDay = Number(firstQueryValue(req.query.day) || '1');
  const day = Number.isFinite(rawDay) ? Math.max(1, Math.trunc(rawDay)) : 1;

  if (!requestedSubject) return res.status(400).json({ available: false, reason: 'missing-subject' });
  if (!AGE_GROUPS.has(ageGroup)) return res.status(400).json({ available: false, reason: 'invalid-age-group' });

  const subject = normaliseSubject(requestedSubject);
  if (!CLOUD_SUBJECTS.has(subject)) {
    return res.json({
      available: false,
      reason: 'no-cloud-library-for-subject',
      subject: requestedSubject,
      ageGroup,
      verifiedInventoryCount: 0,
    });
  }

  try {
    // Read-only access to the existing education cloud table. No seed/migration is
    // run here: if the table is unavailable, the client can safely use local lessons.
    const result = await db.execute(sql`
      SELECT lesson_key, subject, topic, age_band, title, duration_minutes,
             curriculum_ref, lesson_json, source_type
      FROM education_cloud_lessons
      WHERE active = 1
        AND subject = ${subject}
        AND age_band = ${ageGroup}
      ORDER BY lesson_key ASC
    `);
    const rows = extractRows(result);

    if (rows.length === 0) {
      return res.json({
        available: false,
        reason: 'no-cloud-lessons-found',
        subject: requestedSubject,
        ageGroup,
        verifiedInventoryCount: 0,
      });
    }

    const selected = rows[(day - 1) % rows.length];
    const content = parseLessonJson(selected.lesson_json);
    if (!content) {
      return res.json({
        available: false,
        reason: 'invalid-cloud-lesson-content',
        subject: requestedSubject,
        ageGroup,
        verifiedInventoryCount: rows.length,
      });
    }

    return res.json({
      available: true,
      source: 'education-cloud',
      subject: requestedSubject,
      ageGroup,
      requestedDay: day,
      verifiedInventoryCount: rows.length,
      lesson: {
        lessonKey: String(selected.lesson_key ?? ''),
        subject: String(selected.subject ?? subject),
        topic: String(selected.topic ?? ''),
        ageGroup: String(selected.age_band ?? ageGroup),
        title: String(selected.title ?? content.title ?? 'Lesson'),
        durationMinutes: Number(selected.duration_minutes ?? content.durationMinutes ?? 60),
        curriculumRef: selected.curriculum_ref ? String(selected.curriculum_ref) : null,
        sourceType: selected.source_type ? String(selected.source_type) : 'unknown',
        content,
      },
    });
  } catch (error) {
    console.warn('[education-cloud] lesson library unavailable:', error instanceof Error ? error.message : String(error));
    return res.json({
      available: false,
      reason: 'cloud-library-unavailable',
      subject: requestedSubject,
      ageGroup,
      verifiedInventoryCount: null,
    });
  }
}
