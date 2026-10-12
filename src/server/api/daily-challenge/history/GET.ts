/**
 * GET /api/daily-challenge/history?childId=N
 * Returns last 30 days of daily challenge claims for a child.
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

    const childId = parseInt(String(req.query.childId), 10);
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Verify ownership
    const childRows = await db.execute(sql`
      SELECT id FROM children WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `);
    if (!(childRows[0] as unknown as unknown[]).length) {
      return res.status(403).json({ error: 'Child not found' });
    }

    // Ensure table exists (idempotent)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_challenge_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        child_id INT NOT NULL,
        challenge_date DATE NOT NULL,
        claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_child_date (child_id, challenge_date)
      )
    `).catch(() => {});

    const rows = await db.execute(sql`
      SELECT DATE_FORMAT(challenge_date, '%Y-%m-%d') AS date, 5 AS stars
      FROM daily_challenge_claims
      WHERE child_id = ${childId}
        AND challenge_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY challenge_date ASC
    `);

    const history = (rows as any)[0].map((r: any) => ({
      date: r.date,
      stars: Number(r.stars),
    }));

    res.json({ history });
  } catch (err) {
    console.error('[daily-challenge/history]', err);
    res.status(500).json({ error: String(err) });
  }
}
