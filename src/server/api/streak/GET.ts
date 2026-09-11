/**
 * GET /api/streak?childId=:id
 * Returns streak info + star balance for the freeze UI.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';

interface StreakRow {
  current_streak: number;
  max_streak: number;
  last_played_date: string | null;
  freeze_active: number;
  freeze_used_at: string | null;
}

interface ChildRow { id: number; total_stars: number }

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = Number(req.query['childId']);
    if (!Number.isInteger(childId) || childId <= 0) return res.status(400).json({ error: 'Valid childId required' });

    const childRows = (await db.execute(sql`
      SELECT id, total_stars FROM children WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `))[0] as unknown as ChildRow[];
    if (!childRows.length) return res.status(404).json({ error: 'Child not found' });

    const streakRows = (await db.execute(sql`
      SELECT current_streak, max_streak, last_played_date, freeze_active, freeze_used_at
      FROM streak_tracker WHERE child_id = ${childId} LIMIT 1
    `))[0] as unknown as StreakRow[];

    const streak = streakRows[0] ?? { current_streak: 0, max_streak: 0, last_played_date: null, freeze_active: 0, freeze_used_at: null };

    res.json({
      currentStreak: Number(streak.current_streak),
      maxStreak: Number(streak.max_streak),
      lastPlayedDate: streak.last_played_date,
      freezeActive: Boolean(streak.freeze_active),
      freezeUsedAt: streak.freeze_used_at,
      totalStars: Number(childRows[0]?.total_stars ?? 0),
      freezeCost: 50,
    });
  } catch (err) {
    console.error('Streak GET error:', err);
    res.status(500).json({ error: 'Failed to load streak' });
  }
}
