import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import {
  rewardCharacters,
  childCharacters,
  children,
} from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as any });
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const { childId, characterId } = req.body as { childId: number; characterId: number };
    if (!childId || !characterId) {
      return res.status(400).json({ error: 'childId and characterId required' });
    }

    // Verify child belongs to this user
    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));
    if (!child) return res.status(403).json({ error: 'Child not found' });

    // Fetch character
    const [character] = await db
      .select()
      .from(rewardCharacters)
      .where(eq(rewardCharacters.id, characterId));
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Check already owned
    const [existing] = await db
      .select()
      .from(childCharacters)
      .where(and(eq(childCharacters.childId, childId), eq(childCharacters.characterId, characterId)));
    if (existing) return res.status(409).json({ error: 'Already unlocked' });

    // Check stars
    if (child.totalStars < character.starCost) {
      return res.status(400).json({
        error: 'Not enough stars',
        need: character.starCost,
        have: child.totalStars,
      });
    }

    // Deduct stars and insert unlock in one go
    await db
      .update(children)
      .set({ totalStars: child.totalStars - character.starCost })
      .where(eq(children.id, childId));

    await db.insert(childCharacters).values({ childId, characterId });

    res.json({
      success: true,
      character: { id: character.id, name: character.name, emoji: character.emoji },
      starsRemaining: child.totalStars - character.starCost,
    });
  } catch (err) {
    console.error('POST /api/rewards/unlock error:', err);
    res.status(500).json({ error: 'Failed to unlock character' });
  }
}
