/**
 * GET /api/parent/dashboard?childId=X
 * Returns full progress data for a child: total stars, games played,
 * subject breakdown, daily stars over last 14 days, recent games.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = parseInt(req.query.childId as string, 10);
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Verify child belongs to this parent
    const childRows = await db.execute(sql`
      SELECT id, name, age_group, total_stars FROM children
      WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `);
    const children = childRows[0] as unknown as { id: number; name: string; age_group: string; total_stars: number }[];
    if (!children.length) return res.status(403).json({ error: 'Child not found' });
    const child = children[0];

    // Games played count + stars per subject
    const subjectRows = await db.execute(sql`
      SELECT subject,
             COUNT(*) AS games_played,
             COALESCE(SUM(stars_earned), 0) AS stars
      FROM game_plays
      WHERE child_id = ${childId}
      GROUP BY subject
    `);
    const subjects = subjectRows[0] as unknown as { subject: string; games_played: number; stars: number }[];

    // Total games played
    const totalGamesRows = await db.execute(sql`
      SELECT COUNT(*) AS total FROM game_plays WHERE child_id = ${childId}
    `);
    const totalGames = (totalGamesRows[0] as unknown as { total: number }[])[0]?.total ?? 0;

    // Daily stars over last 14 days
    const dailyRows = await db.execute(sql`
      SELECT DATE(played_at) AS day, COALESCE(SUM(stars_earned), 0) AS stars
      FROM game_plays
      WHERE child_id = ${childId}
        AND played_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE(played_at)
      ORDER BY day ASC
    `);
    const daily = dailyRows[0] as unknown as { day: string; stars: number }[];

    // Recent 5 games
    const recentRows = await db.execute(sql`
      SELECT game_slug, subject, stars_earned, score_pct, played_at
      FROM game_plays
      WHERE child_id = ${childId}
      ORDER BY played_at DESC
      LIMIT 5
    `);
    const recent = recentRows[0] as unknown as {
      game_slug: string; subject: string; stars_earned: number; score_pct: number; played_at: string;
    }[];

    // Badge count
    const badgeRows = await db.execute(sql`
      SELECT COUNT(*) AS total FROM badge_awards WHERE child_id = ${childId}
    `);
    const badgeCount = (badgeRows[0] as unknown as { total: number }[])[0]?.total ?? 0;

    res.json({
      child,
      totalGames,
      badgeCount,
      subjects,
      daily,
      recent,
    });
  } catch (err) {
    console.error('[parent/dashboard]', err);
    res.status(500).json({ error: String(err) });
  }
}
