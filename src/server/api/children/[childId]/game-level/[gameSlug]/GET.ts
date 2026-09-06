import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { gameLevels } from '../../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childIdStr = Array.isArray(req.params.childId) ? req.params.childId[0] : req.params.childId;
    const childId = parseInt(String(childIdStr), 10);
    const gameSlug = Array.isArray(req.params.gameSlug) ? req.params.gameSlug[0] : req.params.gameSlug;
    if (!gameSlug) return res.status(400).json({ error: 'Missing gameSlug' });

    const [row] = await db.select()
      .from(gameLevels)
      .where(and(eq(gameLevels.childId, childId), eq(gameLevels.gameSlug, gameSlug)));

    res.json({ level: row?.level ?? 1, bestStars: row?.bestStars ?? 0, playsAtLevel: row?.playsAtLevel ?? 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
