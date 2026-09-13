/**
 * GET /api/rewards/characters?childId=:id
 * Returns all active characters with unlocked + active flags for the given child.
 * Agent 40 also exposes the learning-earned claw-machine state for the same child.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { rewardCharacters, childCharacters, children } from '@/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { getClawMachineState, type ClawMachineState } from '@/server/rewards/claw-machine';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as any });
    const childId = req.query.childId ? Number(req.query.childId) : null;

    // Fetch all active characters ordered by star cost
    const chars = await db
      .select()
      .from(rewardCharacters)
      .where(eq(rewardCharacters.active, true))
      .orderBy(asc(rewardCharacters.sortOrder));

    let unlockedIds: Set<number> = new Set();
    let activeCharacterId: number | null = null;
    let totalStars = 0;
    let clawMachine: ClawMachineState | null = null;

    if (childId && session?.user) {
      // Verify ownership
      const [child] = await db
        .select()
        .from(children)
        .where(and(eq(children.id, childId), eq(children.parentId, session.user.id)));

      if (child) {
        totalStars = child.totalStars;
        activeCharacterId = child.activeCharacterId ?? null;

        const owned = await db
          .select({ characterId: childCharacters.characterId })
          .from(childCharacters)
          .where(eq(childCharacters.childId, childId));
        unlockedIds = new Set(owned.map((r: any) => r.characterId));

        // The claw feature must never break the existing Rewards page if its
        // storage is temporarily unavailable. Existing character rewards still load.
        try {
          clawMachine = await getClawMachineState(childId, session.user.id);
        } catch (clawError) {
          console.warn('GET /api/rewards/characters claw state unavailable:', clawError);
        }
      }
    }

    const result = chars.map((c: any) => ({
      ...c,
      unlocked: unlockedIds.has(c.id),
      isActive: c.id === activeCharacterId,
    }));

    res.json({ characters: result, totalStars, activeCharacterId, clawMachine });
  } catch (err) {
    console.error('GET /api/rewards/characters error:', err);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
}
