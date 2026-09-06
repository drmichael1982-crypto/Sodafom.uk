/**
 * GET /api/battle/:id
 * Returns battle state — used for polling.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

interface BattleRow {
  id: string;
  game_slug: string;
  game_title: string;
  game_emoji: string;
  subject: string;
  creator_user_id: string;
  creator_name: string;
  creator_score: number | null;
  creator_stars: number | null;
  challenger_user_id: string | null;
  challenger_name: string | null;
  challenger_score: number | null;
  challenger_stars: number | null;
  status: 'waiting' | 'active' | 'complete';
  created_at: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const rows = (await db.execute(sql`
      SELECT * FROM battles WHERE id = ${id} LIMIT 1
    `))[0] as unknown as BattleRow[];

    if (!rows.length) return res.status(404).json({ error: 'Battle not found' });

    const b = rows[0];
    res.json({
      battleId: b.id,
      gameSlug: b.game_slug,
      gameTitle: b.game_title,
      gameEmoji: b.game_emoji,
      subject: b.subject,
      status: b.status,
      creator: {
        name: b.creator_name,
        score: b.creator_score,
        stars: b.creator_stars,
      },
      challenger: b.challenger_user_id ? {
        name: b.challenger_name,
        score: b.challenger_score,
        stars: b.challenger_stars,
      } : null,
      createdAt: b.created_at,
    });
  } catch (err) {
    console.error('Battle GET error:', err);
    res.status(500).json({ error: 'Failed to load battle' });
  }
}
