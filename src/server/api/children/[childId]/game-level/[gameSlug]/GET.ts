import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { children, gameLevels } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { childIdFromParam, gameSlugFromParam } from '../../../../../lib/progress-input.js';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });
    const childId = childIdFromParam(req.params.childId);
    const gameSlug = gameSlugFromParam(req.params.gameSlug);
    if (childId === null || gameSlug === null) return res.status(400).json({ error: 'Invalid child or game' });

    const [child] = await db.select({ id: children.id }).from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const [row] = await db.select().from(gameLevels)
      .where(and(eq(gameLevels.childId, childId), eq(gameLevels.gameSlug, gameSlug)));
    return res.json({ level: row?.level ?? 1, bestStars: row?.bestStars ?? 0, playsAtLevel: row?.playsAtLevel ?? 0 });
  } catch {
    return res.status(503).json({ error: 'Progress is temporarily unavailable' });
  }
}
