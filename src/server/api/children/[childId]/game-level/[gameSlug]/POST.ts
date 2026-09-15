import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { children, gameLevels } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { childIdFromParam, gameSlugFromParam, starsFromBody } from '../../../../../lib/progress-input.js';

// Keep the existing rule: each completed round advances a level, up to ten.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const session = await getAuth().api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });
    const childId = childIdFromParam(req.params.childId);
    const gameSlug = gameSlugFromParam(req.params.gameSlug);
    const stars = starsFromBody(req.body);
    if (childId === null || gameSlug === null || stars === null) {
      return res.status(400).json({ error: 'Invalid game result' });
    }

    const result = await db.transaction(async (tx: typeof db) => {
      // Lock the existing child, including on the first play when no level row
      // exists yet. Concurrent saves for this child must not overwrite each other.
      const [child] = await tx.select({ id: children.id }).from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)))
        .for('update');
      if (!child) return null;

      const [existing] = await tx.select().from(gameLevels)
        .where(and(eq(gameLevels.childId, childId), eq(gameLevels.gameSlug, gameSlug)));
      const currentLevel = existing?.level ?? 1;
      const newLevel = Math.min(10, currentLevel + 1);
      const bestStars = Math.max(existing?.bestStars ?? 0, stars);
      const playsAtLevel = newLevel > currentLevel ? 0 : (existing?.playsAtLevel ?? 0) + 1;
      if (existing) {
        await tx.update(gameLevels).set({ level: newLevel, bestStars, playsAtLevel })
          .where(eq(gameLevels.id, existing.id));
      } else {
        await tx.insert(gameLevels).values({ childId, gameSlug, level: newLevel, bestStars, playsAtLevel });
      }
      return { level: newLevel, bestStars, playsAtLevel, advanced: newLevel > currentLevel, dropped: false };
    });
    if (!result) return res.status(404).json({ error: 'Child not found' });
    return res.json(result);
  } catch {
    // No automatic POST retry: an interrupted response may follow a commit.
    return res.status(503).json({ error: 'Progress could not be confirmed saved' });
  }
}
