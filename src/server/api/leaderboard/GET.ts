/**
 * GET /api/leaderboard
 * Returns top 10 children by total stars this week (opt-in only).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';

const AVATARS = ['🦁', '🐯', '🦊', '🐸', '🦋', '🐬', '🦄', '🐧', '🦉', '🐙'];

export default async function handler(req: Request, res: Response) {
  try {
    // Ensure opt-in column exists (idempotent)
    await db.execute(sql`
      ALTER TABLE children ADD COLUMN leaderboard_opt_in TINYINT(1) NOT NULL DEFAULT 0
    `).catch(() => {});

    let rows: unknown[];
    try {
      const result = await db.execute(sql`
        SELECT c.id, c.name,
               COALESCE(SUM(gp.stars_earned), 0) AS week_stars,
               c.total_stars
        FROM children c
        LEFT JOIN game_plays gp
          ON gp.child_id = c.id
          AND gp.played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE c.leaderboard_opt_in = 1
        GROUP BY c.id, c.name, c.total_stars
        ORDER BY week_stars DESC, c.total_stars DESC
        LIMIT 10
      `);
      rows = (result as any)[0];
    } catch {
      // Column may not exist yet on first call — return empty
      rows = [];
    }

    const entries = (rows as { id: number; name: string; week_stars: number; total_stars: number }[])
      .map((r, i) => ({
        rank: i + 1,
        firstName: r.name.split(' ')[0],
        avatar: AVATARS[i % AVATARS.length],
        weekStars: Number(r.week_stars),
        totalStars: Number(r.total_stars),
      }));

    res.json({ entries, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[leaderboard]', err);
    res.status(500).json({ error: String(err) });
  }
}
