import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { and, desc, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

function parseChildId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.vary('Cookie');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorised' });

    const childId = parseChildId(req.params.childId);
    if (childId === null) return res.status(400).json({ error: 'A valid child is required.' });

    // Establish parent ownership before reading progress. A missing and
    // non-owned profile intentionally receive the same response.
    const [child] = await db.select({
      id: children.id,
      totalStars: children.totalStars,
    }).from(children).where(and(
      eq(children.id, childId),
      eq(children.parentId, session.user.id),
    )).limit(1);
    if (!child) return res.status(404).json({ error: 'Child progress not found.' });

    const [recent, summaries] = await Promise.all([
      db.select().from(activitySessions)
        .where(eq(activitySessions.childId, child.id))
        .orderBy(desc(activitySessions.completedAt))
        .limit(20),
      db.select().from(progressSummaries)
        .where(eq(progressSummaries.childId, child.id))
        .orderBy(desc(progressSummaries.weekStart))
        .limit(12),
    ]);

    return res.json({ recent, summaries, totalStars: child.totalStars ?? 0 });
  } catch {
    // Do not expose database, identity, or activity data in an error body.
    return res.status(500).json({ error: 'The child progress could not be loaded. Please try again.' });
  }
}
