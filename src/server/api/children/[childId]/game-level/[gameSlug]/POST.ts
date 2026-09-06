import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { gameLevels } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

// Every completed ten-question round advances a level, up to level 10.

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childIdStr = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    const childId = parseInt(String(childIdStr), 10);
    const gameSlug = Array.isArray(req.params.gameSlug) ? req.params.gameSlug[0] : req.params.gameSlug;
    const { stars } = req.body as { stars: number };
    if (!gameSlug || stars === undefined) return res.status(400).json({ error: 'Missing fields' });

    const [existing] = await db.select()
      .from(gameLevels)
      .where(and(eq(gameLevels.childId, childId), eq(gameLevels.gameSlug, gameSlug)));

    let currentLevel = existing?.level ?? 1;
    let bestStars = existing?.bestStars ?? 0;
    let playsAtLevel = (existing?.playsAtLevel ?? 0) + 1;

    if (stars > bestStars) bestStars = stars;

    let newLevel = currentLevel;
    if (currentLevel < 10) {
      newLevel = currentLevel + 1;
      playsAtLevel = 0;
    }

    if (existing) {
      await db.update(gameLevels)
        .set({ level: newLevel, bestStars, playsAtLevel })
        .where(eq(gameLevels.id, existing.id));
    } else {
      await db.insert(gameLevels).values({ childId, gameSlug, level: newLevel, bestStars, playsAtLevel });
    }

    res.json({ level: newLevel, bestStars, playsAtLevel, advanced: newLevel > currentLevel, dropped: newLevel < currentLevel });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
