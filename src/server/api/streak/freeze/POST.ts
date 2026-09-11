/**
 * POST /api/streak/freeze
 * Spends 50 stars to apply a streak freeze to the active child.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

const FREEZE_COST = 50;

interface ChildRow { id: number; total_stars: number }
interface StreakRow { current_streak: number; freeze_active: number; freeze_used_at: string | null }

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = Number((req.body as { childId?: string | number }).childId);
    if (!Number.isInteger(childId) || childId <= 0) return res.status(400).json({ error: 'Valid childId required' });

    // Verify ownership
    const childRows = (await db.execute(sql`
      SELECT id, total_stars FROM children WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `))[0] as unknown as ChildRow[];
    if (!childRows.length) return res.status(404).json({ error: 'Child not found' });

    const totalStars = Number(childRows[0]?.total_stars ?? 0);

    if (totalStars < FREEZE_COST) {
      return res.status(400).json({ error: `Not enough stars. You need ${FREEZE_COST} stars to buy a freeze.`, totalStars });
    }

    // Check if freeze already active
    const streakRows = (await db.execute(sql`
      SELECT current_streak, freeze_active, freeze_used_at FROM streak_tracker WHERE child_id = ${childId} LIMIT 1
    `))[0] as unknown as StreakRow[];
    const streak = streakRows[0];

    if (streak?.freeze_active) {
      return res.status(400).json({ error: 'A streak freeze is already active.' });
    }

    // Deduct from the same running balance displayed by the child UI read everywhere else.
    // The ownership and balance predicates make this safe if two requests race.
    const updateResult = (await db.execute(sql`
      UPDATE children
      SET total_stars = total_stars - ${FREEZE_COST}
      WHERE id = ${childId} AND parent_id = ${session.user.id} AND total_stars >= ${FREEZE_COST}
    `))[0] as unknown as { affectedRows?: number };
    if (!updateResult?.affectedRows) {
      return res.status(409).json({ error: 'Star balance changed. Please try again.' });
    }

    // Keep the legacy progress ledger as an audit record.
    await db.execute(sql`
      INSERT INTO child_progress (child_id, game_title, subject, stars, score, completed_at)
      VALUES (${childId}, '__streak_freeze__', 'system', ${-FREEZE_COST}, 0, NOW())
    `);

    // Activate freeze
    await db.execute(sql`
      INSERT INTO streak_tracker (child_id, current_streak, max_streak, last_played_date, freeze_active, freeze_used_at)
      VALUES (${childId}, 0, 0, CURDATE(), 1, NOW())
      ON DUPLICATE KEY UPDATE freeze_active = 1, freeze_used_at = NOW()
    `);

    res.json({ ok: true, starsSpent: FREEZE_COST, remainingStars: totalStars - FREEZE_COST });
  } catch (err) {
    console.error('Streak freeze error:', err);
    res.status(500).json({ error: 'Failed to apply freeze' });
  }
}
