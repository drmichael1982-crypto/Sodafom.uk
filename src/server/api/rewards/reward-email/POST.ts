/**
 * POST /api/rewards/reward-email
 * Sets or updates the reward_email for a child.
 * Body: { childId: number, email: string }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { ensureRewardStorage } from '@/server/lib/reward-storage';

function parseChildId(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+$/.test(value)) return null;
  const childId = Number(value);
  return Number.isSafeInteger(childId) && childId > 0 ? childId : null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { childId: childIdValue, email } = req.body ?? {};
    const childId = parseChildId(childIdValue);
    if (childId === null) return res.status(400).json({ error: 'Invalid child ID' });

    // Validate email format (or allow empty string to clear it)
    if (email !== undefined && typeof email !== 'string') {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const trimmed = (email ?? '').trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Verify ownership before touching reward data or running compatibility DDL.
    const rows = (await db.execute(sql`
      SELECT id FROM children
      WHERE id = ${childId} AND parent_id = ${session.user.id}
      LIMIT 1
    `))[0] as unknown as { id: number }[];
    if (!rows.length) return res.status(404).json({ error: 'Child not found' });

    await ensureRewardStorage();

    await db.execute(sql`
      UPDATE children SET reward_email = ${trimmed || null}
      WHERE id = ${childId} AND parent_id = ${session.user.id}
    `);

    res.json({ ok: true });
  } catch (err) {
    console.error('[reward-email] error:', err);
    res.status(500).json({ error: 'Failed to update reward email' });
  }
}
