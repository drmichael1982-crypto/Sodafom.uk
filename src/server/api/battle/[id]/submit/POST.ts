/**
 * POST /api/battle/:id/submit
 * Submit a score for a battle. First caller = creator, second = challenger.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';

interface BattleRow {
  id: string;
  creator_user_id: string;
  challenger_user_id: string | null;
  status: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { id } = req.params as { id: string };
    const { score, stars, playerName } = req.body as { score: number; stars: number; playerName?: string };
    if (score === undefined || stars === undefined) return res.status(400).json({ error: 'score and stars required' });

    const rows = (await db.execute(sql`
      SELECT id, creator_user_id, challenger_user_id, status FROM battles WHERE id = ${id} LIMIT 1
    `))[0] as unknown as BattleRow[];

    if (!rows.length) return res.status(404).json({ error: 'Battle not found' });
    const battle = rows[0];

    if (battle.status === 'complete') return res.status(400).json({ error: 'Battle already complete' });

    const isCreator = battle.creator_user_id === session.user.id;
    const name = playerName ?? 'Player';

    if (isCreator) {
      // Update creator score
      await db.execute(sql`
        UPDATE battles
        SET creator_score = ${score}, creator_stars = ${stars},
            status = CASE WHEN challenger_score IS NOT NULL THEN 'complete' ELSE 'active' END
        WHERE id = ${id}
      `);
    } else {
      // Register as challenger if not already set
      if (!battle.challenger_user_id) {
        await db.execute(sql`
          UPDATE battles
          SET challenger_user_id = ${session.user.id}, challenger_name = ${name},
              challenger_score = ${score}, challenger_stars = ${stars},
              status = CASE WHEN creator_score IS NOT NULL THEN 'complete' ELSE 'active' END
          WHERE id = ${id}
        `);
      } else if (battle.challenger_user_id === session.user.id) {
        await db.execute(sql`
          UPDATE battles
          SET challenger_score = ${score}, challenger_stars = ${stars},
              status = CASE WHEN creator_score IS NOT NULL THEN 'complete' ELSE 'active' END
          WHERE id = ${id}
        `);
      } else {
        return res.status(403).json({ error: 'Battle already has two players' });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Battle submit error:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
}
