/**
 * POST /api/daily-challenge/claim
 * Awards 5 bonus stars to a child for completing today's daily challenge.
 * Body: { childId: number }
 * Idempotent — safe to call twice, second call returns already_claimed.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

const BONUS_STARS = 5;

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { childId } = req.body ?? {};
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Verify ownership
    const childRows = await db.execute(sql`
      SELECT id FROM children WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `);
    if (!(childRows[0] as unknown as unknown[]).length) {
      return res.status(403).json({ error: 'Child not found' });
    }

    // Ensure table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_challenge_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        challenge_date DATE NOT NULL,
        claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_child_date (child_id, challenge_date)
      )
    `);

    // Try to insert claim (will fail silently if duplicate)
    let alreadyClaimed = false;
    try {
      await db.execute(sql`
        INSERT INTO daily_challenge_claims (child_id, challenge_date)
        VALUES (${childId}, CURDATE())
      `);
    } catch {
      alreadyClaimed = true;
    }

    if (alreadyClaimed) {
      return res.json({ ok: true, already_claimed: true, stars: 0 });
    }

    // Award bonus stars
    await db.execute(sql`
      UPDATE children SET total_stars = total_stars + ${BONUS_STARS} WHERE id = ${childId}
    `);

    res.json({ ok: true, already_claimed: false, stars: BONUS_STARS });
  } catch (err) {
    console.error('[daily-challenge/claim]', err);
    res.status(500).json({ error: String(err) });
  }
}
