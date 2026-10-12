/**
 * POST /api/battle/create
 * Creates a new battle challenge. Returns battleId + shareUrl.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { gameSlug, gameTitle, gameEmoji, subject } = req.body as {
      gameSlug: string;
      gameTitle: string;
      gameEmoji: string;
      subject: string;
    };
    if (!gameSlug || !gameTitle) return res.status(400).json({ error: 'gameSlug and gameTitle required' });

    // Get active child name for display
    const childName = (req.body as { childName?: string }).childName ?? 'Player 1';

    const battleId = randomBytes(6).toString('hex'); // 12-char unique ID

    await db.execute(sql`
      INSERT INTO battles (
        id, game_slug, game_title, game_emoji, subject,
        creator_user_id, creator_name,
        status, created_at
      ) VALUES (
        ${battleId}, ${gameSlug}, ${gameTitle}, ${gameEmoji ?? '🎮'}, ${subject ?? 'maths'},
        ${session.user.id}, ${childName},
        'waiting', NOW()
      )
    `);

    res.status(201).json({
      battleId,
      shareUrl: `https://sodafom.uk/battle/${battleId}`,
    });
  } catch (err) {
    console.error('Battle create error:', err);
    res.status(500).json({ error: 'Failed to create battle' });
  }
}
