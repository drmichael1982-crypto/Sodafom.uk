/**
 * GET /api/children/:childId/reward-email
 * Returns the reward_email for a child.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

interface ChildRow { reward_email: string | null }

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = req.params.childId;

    // Ensure column exists
    await db.execute(sql`
      ALTER TABLE children ADD COLUMN reward_email VARCHAR(255) NULL
    `).catch(() => {});

    const rows = (await db.execute(sql`
      SELECT reward_email FROM children WHERE id = ${childId} AND user_id = ${session.user.id} LIMIT 1
    `))[0] as unknown as ChildRow[];

    if (!rows.length) return res.status(404).json({ error: 'Child not found' });

    res.json({ rewardEmail: rows[0].reward_email ?? '' });
  } catch (err) {
    console.error('[reward-email GET] error:', err);
    res.status(500).json({ error: String(err) });
  }
}
