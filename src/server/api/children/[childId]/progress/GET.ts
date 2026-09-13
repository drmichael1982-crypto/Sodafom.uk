import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { and, eq, desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = Number(req.params.childId);
    if (!Number.isInteger(childId) || childId <= 0) {
      return res.status(400).json({ error: 'Valid childId required' });
    }

    // Check ownership before reading activity or summary rows.
    const [ownedChild] = await db.select({ totalStars: children.totalStars })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
      .limit(1);
    if (!ownedChild) return res.status(404).json({ error: 'Child not found' });

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

    res.json({ recent, summaries, totalStars: ownedChild.totalStars ?? 0 });
  } catch {
    console.error('[children/progress] request failed');
    res.status(500).json({ error: 'Unable to load child progress' });
  }
}
