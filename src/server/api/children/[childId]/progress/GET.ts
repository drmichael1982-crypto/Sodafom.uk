import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

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
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
