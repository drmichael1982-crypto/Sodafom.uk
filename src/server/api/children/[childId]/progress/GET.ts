import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { and, desc, eq, lt } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import {
  beforeIdFromQuery,
  childIdFromDailyParam,
  isDailyProgressView,
} from '../../../../lib/daily-progress-query.js';

export default async function handler(req: Request, res: Response) {
  const daily = isDailyProgressView(req.query.view);
  if (daily) res.setHeader('Cache-Control', 'private, no-store');
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    // This opt-in read is deliberately separate from the existing default
    // response below, so parent/game callers keep their current shape.
    if (daily) {
      const childId = childIdFromDailyParam(req.params.childId);
      const beforeId = beforeIdFromQuery(req.query.beforeId);
      if (childId === null || beforeId === null) {
        return res.status(400).json({ error: 'Valid child and cursor required' });
      }

      // A local active-child ID is not authority. Return daily history only for
      // a child linked to the current signed-in account.
      const [ownedChild] = await db.select({
        id: children.id,
        name: children.name,
        ageGroup: children.ageGroup,
        totalStars: children.totalStars,
      }).from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
        .limit(1);
      if (!ownedChild) return res.status(404).json({ error: 'Child not found' });

      // Send the dashboard only the progress fields it can render. In
      // particular, scores and duration are not needed for this gentle
      // day-view and remain server-side.
      const rows = await db.select({
        id: activitySessions.id,
        childId: activitySessions.childId,
        subject: activitySessions.subject,
        activityId: activitySessions.activityId,
        activityTitle: activitySessions.activityTitle,
        starsEarned: activitySessions.starsEarned,
        completedAt: activitySessions.completedAt,
      }).from(activitySessions)
        .where(beforeId === undefined
          ? eq(activitySessions.childId, childId)
          : and(eq(activitySessions.childId, childId), lt(activitySessions.id, beforeId)))
        .orderBy(desc(activitySessions.id))
        .limit(101);
      const recent = rows.slice(0, 100);
      return res.json({
        child: ownedChild,
        recent,
        nextCursor: rows.length > 100 ? recent[recent.length - 1].id : null,
      });
    }

    const childId = parseInt(String(req.params.childId));

    const [recent, summaries, [childRow]] = await Promise.all([
      db.select().from(activitySessions)
        .where(eq(activitySessions.childId, childId))
        .orderBy(desc(activitySessions.completedAt))
        .limit(20),
      db.select().from(progressSummaries)
        .where(eq(progressSummaries.childId, childId))
        .orderBy(desc(progressSummaries.weekStart))
        .limit(12),
      db.select({ totalStars: children.totalStars })
        .from(children)
        .where(eq(children.id, childId)),
    ]);

    res.json({ recent, summaries, totalStars: childRow?.totalStars ?? 0 });
  } catch (error) {
    return daily
      ? res.status(503).json({ error: 'Daily learning progress is temporarily unavailable.' })
      : res.status(500).json({ error: String(error) });
  }
}
