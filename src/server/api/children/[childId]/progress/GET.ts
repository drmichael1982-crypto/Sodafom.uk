import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { activitySessions, progressSummaries, children } from '../../../../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

interface RecentActivity {
  subject: string;
  completedAt: Date | string | null;
  [key: string]: unknown;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = Number(req.params.childId);
    if (!Number.isInteger(childId) || childId <= 0) return res.status(400).json({ error: 'Valid childId required' });

    const [ownedChild] = await db.select({ totalStars: children.totalStars })
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
      .limit(1);
    if (!ownedChild) return res.status(404).json({ error: 'Child not found' });

    const [recentRows, summaries] = await Promise.all([
      db.select().from(activitySessions)
        .where(eq(activitySessions.childId, childId))
        .orderBy(desc(activitySessions.completedAt))
        .limit(20),
      db.select().from(progressSummaries)
        .where(eq(progressSummaries.childId, childId))
        .orderBy(desc(progressSummaries.weekStart))
        .limit(12),
    ]);
    const recent = recentRows as RecentActivity[];

    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const gamesThisWeek = recent.filter((entry) => {
      const completed = entry.completedAt ? new Date(entry.completedAt).getTime() : 0;
      return completed >= weekAgo;
    }).length;
    const subjectCounts: Record<string, number> = {};
    for (const entry of recent) {
      subjectCounts[entry.subject] = (subjectCounts[entry.subject] ?? 0) + 1;
    }
    const rankedSubjects = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1]);
    const topSubject = rankedSubjects.length > 0 ? rankedSubjects[0][0] : null;

    res.json({
      recent,
      summaries,
      totalStars: ownedChild.totalStars ?? 0,
      gamesThisWeek,
      topSubject,
      streakDays: 0,
      badgeCount: 0,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
