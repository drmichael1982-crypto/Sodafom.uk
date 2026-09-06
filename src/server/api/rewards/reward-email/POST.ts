/**
 * POST /api/rewards/reward-email
 * Sets or updates the reward_email for a child.
 * Body: { childId: number, email: string }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { childId, email } = req.body ?? {};
    if (!childId) return res.status(400).json({ error: 'childId required' });

    // Validate email format (or allow empty string to clear it)
    const trimmed = (email ?? '').trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Ensure column exists
    await db.execute(sql`
      ALTER TABLE children ADD COLUMN reward_email VARCHAR(255) NULL
    `).catch(() => {});

    // Verify child belongs to this user
    const rows = (await db.execute(sql`
      SELECT id FROM children WHERE id = ${childId} AND user_id = ${session.user.id} LIMIT 1
    `))[0] as unknown as { id: number }[];
    if (!rows.length) return res.status(404).json({ error: 'Child not found' });

    await db.execute(sql`
      UPDATE children SET reward_email = ${trimmed || null} WHERE id = ${childId}
    `);

    res.json({ ok: true });
  } catch (err) {
    console.error('[reward-email] error:', err);
    res.status(500).json({ error: String(err) });
  }
}
