/**
 * POST /api/rewards/set-character
 * Sets a child's active display character (must already be unlocked).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { children, childCharacters } from '@/server/db/schema';
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

    // Verify the child has unlocked this character
    const [owned] = await db
      .select()
      .from(childCharacters)
      .where(and(eq(childCharacters.childId, childId), eq(childCharacters.characterId, characterId)));
    if (!owned) return res.status(403).json({ error: 'Character not unlocked' });

    // Set as active
    await db.update(children)
      .set({ activeCharacterId: characterId })
      .where(eq(children.id, childId));

    res.json({ success: true, activeCharacterId: characterId });
  } catch (err) {
    console.error('POST /api/rewards/set-character error:', err);
    res.status(500).json({ error: 'Failed to set character' });
  }
}
