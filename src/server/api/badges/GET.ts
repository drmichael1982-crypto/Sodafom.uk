/**
 * GET /api/badges?childId=:id
 * Returns all badge definitions with earned/unearned status for a child.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';
import { BADGE_DEFS, type BadgeStats } from '@/lib/badges';

interface ProgressRow {
  subject: string;
  stars: number;
  completed_at: string;
}

interface ReferralRow {
  cnt: number;
}

interface StreakRow {
  current_streak: number;
  max_streak: number;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = req.query['childId'] as string | undefined;
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Verify child belongs to this user
    const childRows = await db.execute(sql`
      SELECT id FROM children WHERE id = ${childId} AND user_id = ${session.user.id} LIMIT 1
    `);
    if (!(childRows[0] as unknown as { id: string }[]).length) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Fetch progress rows
    const progressRows = (await db.execute(sql`
      SELECT subject, stars, completed_at FROM child_progress WHERE child_id = ${childId}
    `))[0] as unknown as ProgressRow[];

    // Fetch streak
    const streakRows = (await db.execute(sql`
      SELECT current_streak, max_streak FROM streak_tracker WHERE child_id = ${childId} LIMIT 1
    `))[0] as unknown as StreakRow[];
    const streak = streakRows[0] ?? { current_streak: 0, max_streak: 0 };

    // Fetch referrals by parent
    const refRows = (await db.execute(sql`
      SELECT COUNT(*) as cnt FROM referrals WHERE referrer_user_id = ${session.user.id} AND converted = 1
    `))[0] as unknown as ReferralRow[];
    const referrals = Number(refRows[0]?.cnt ?? 0);

    // Build stats
    const stats: BadgeStats = {
      gamesPlayed: progressRows.length,
      totalStars: progressRows.reduce((sum, r) => sum + (r.stars ?? 0), 0),
      currentStreak: Number(streak.current_streak),
      maxStreak: Number(streak.max_streak),
      mathsGames: progressRows.filter(r => r.subject?.toLowerCase() === 'maths').length,
      readingGames: progressRows.filter(r => r.subject?.toLowerCase() === 'reading').length,
      spellingGames: progressRows.filter(r => r.subject?.toLowerCase() === 'spelling').length,
      scienceGames: progressRows.filter(r => r.subject?.toLowerCase() === 'science').length,
      perfectGames: progressRows.filter(r => r.stars >= 3).length,
      referrals,
    };

    // Evaluate each badge
    const badges = BADGE_DEFS.map((def) => ({
      id: def.id,
      emoji: def.emoji,
      name: def.name,
      desc: def.desc,
      category: def.category,
      rarity: def.rarity,
      earned: def.evaluate(stats),
    }));

    res.json({ badges, stats });
  } catch (err) {
    console.error('Badges GET error:', err);
    res.status(500).json({ error: 'Failed to load badges' });
  }
}
