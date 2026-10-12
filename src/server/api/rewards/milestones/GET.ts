import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { starMilestones, children } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const childId = Number(req.query.childId);
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Verify ownership
    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));
    if (!child) return res.status(403).json({ error: 'Child not found' });

    const milestones = await db
      .select()
      .from(starMilestones)
      .where(eq(starMilestones.childId, childId));

    res.json({ milestones, totalStars: child.totalStars });
  } catch (err) {
    console.error('GET /api/rewards/milestones error:', err);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
}
