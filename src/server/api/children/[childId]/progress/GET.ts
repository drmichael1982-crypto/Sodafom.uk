import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { and, eq, desc, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

interface SubjectSummaryRow {
  subject: string;
  games_played: number | string;
}

interface StreakSummaryRow {
  current_streak: number | string;
}

interface BadgeSummaryRow {
  badge_count: number | string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childIdParam = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    if (!/^\d+$/.test(childIdParam ?? '')) return res.status(400).json({ error: 'Invalid child ID' });
    const childId = Number(childIdParam);
    if (!Number.isSafeInteger(childId) || childId <= 0) return res.status(400).json({ error: 'Invalid child ID' });

    const [childRow] = await db.select({ totalStars: children.totalStars })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
      .limit(1);
    if (!childRow) return res.status(404).json({ error: 'Child not found' });

    if (req.query.summary === '1') {
      // Keep the hub summary aligned with the existing weekly email: Sunday is
      // the first day of the current reporting week.
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const [subjectResult, streakResult, badgeResult] = await Promise.all([
        db.execute(sql`
          SELECT subject, COUNT(*) AS games_played
          FROM activity_sessions
          WHERE child_id = ${childId}
            AND completed_at >= ${weekStart.toISOString()}
          GROUP BY subject
          ORDER BY COUNT(*) DESC, subject ASC
        `),
        db.execute(sql`
          SELECT current_streak
          FROM streak_tracker
          WHERE child_id = ${childId}
          LIMIT 1
        `),
        db.execute(sql`
          SELECT COUNT(*) AS badge_count
          FROM badge_awards
          WHERE child_id = ${childId}
        `),
      ]);

      const subjectRows = subjectResult[0] as unknown as SubjectSummaryRow[];
      const streakRows = streakResult[0] as unknown as StreakSummaryRow[];
      const badgeRows = badgeResult[0] as unknown as BadgeSummaryRow[];

      return res.json({
        totalStars: Number(childRow.totalStars ?? 0),
        streakDays: Number(streakRows[0]?.current_streak ?? 0),
        gamesThisWeek: subjectRows.reduce((total, row) => total + Number(row.games_played ?? 0), 0),
        badgeCount: Number(badgeRows[0]?.badge_count ?? 0),
        topSubject: subjectRows[0]?.subject ?? null,
      });
    }

    const [recent, summaries] = await Promise.all([
      db.select().from(activitySessions)
        .where(eq(activitySessions.childId, childId))
        .orderBy(desc(activitySessions.completedAt))
        .limit(20),
      db.select().from(progressSummaries)
        .where(eq(progressSummaries.childId, childId))
        .orderBy(desc(progressSummaries.weekStart))
        .limit(12),
    ]);

    res.json({ recent, summaries, totalStars: childRow.totalStars });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
