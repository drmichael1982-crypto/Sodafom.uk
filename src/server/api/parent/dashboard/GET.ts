/** GET /api/parent/dashboard?childId=X&days=7|30|90. Read-only, owner-scoped reports. */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { games } from 'virtual:content';
import { buildChildReport, knownGameIds, parseChildId, parseReportDays, REPORT_LIMIT,
  type ParentChild, type SavedActivity } from '@/lib/parent-reports';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.vary('Cookie');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user?.id) return res.status(401).json({ error: 'Sign in to view parent reports.' });
    const childId = parseChildId(req.query.childId);
    const days = parseReportDays(req.query.days);
    if (childId === null || days === null) return res.status(400).json({ error: 'A valid child and reporting period are required.' });

    const childResult = await db.execute(sql`
      SELECT id, name, age_group, total_stars FROM children
      WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `);
    const child = (childResult[0] as unknown as ParentChild[])[0];
    // The same response for a missing or another parent's child avoids an ID oracle.
    if (!child) return res.status(404).json({ error: 'Child report not found.' });
    const now = new Date();
    const from = new Date(now.getTime() - days * 86_400_000);
    const result = await db.execute(sql`
      SELECT a.id, a.child_id, a.subject, a.activity_id, a.activity_title,
             a.score, a.max_score, a.duration_seconds, a.stars_earned, a.completed_at
      FROM activity_sessions a
      INNER JOIN children c ON c.id = a.child_id
      WHERE a.child_id = ${childId} AND c.parent_id = ${session.user.id}
        AND a.completed_at >= ${from} AND a.completed_at <= ${now}
      ORDER BY a.completed_at DESC, a.id DESC
      LIMIT ${REPORT_LIMIT + 1}
    `);
    const rows = result[0] as unknown as SavedActivity[];
    const report = buildChildReport(child, rows.slice(0, REPORT_LIMIT), {
      days, now, gameIds: knownGameIds(games.games), truncated: rows.length > REPORT_LIMIT,
    });
    return res.json({ child, report });
  } catch {
    // Never expose SQL, session details, child records or provider errors.
    return res.status(500).json({ error: 'The child report could not be loaded. Please try again.' });
  }
}
