/**
 * GET /api/children/:childId/reward-email
 * Returns the reward_email for a child.
 */
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { ensureRewardStorage } from '@/server/lib/reward-storage';

interface ChildRow { reward_email: string | null }

function parseChildId(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  if (!/^\d+$/.test(value)) return null;
  const childId = Number(value);
  return Number.isSafeInteger(childId) && childId > 0 ? childId : null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const childId = parseChildId(req.params.childId);
    if (childId === null) return res.status(400).json({ error: 'Invalid child ID' });

    // Verify ownership before touching reward data or running compatibility DDL.
    const ownedRows = (await db.execute(sql`
      SELECT id FROM children
      WHERE id = ${childId} AND parent_id = ${session.user.id}
      LIMIT 1
    `))[0] as unknown as { id: number }[];
    if (!ownedRows.length) return res.status(404).json({ error: 'Child not found' });

    await ensureRewardStorage();

    const rows = (await db.execute(sql`
      SELECT reward_email FROM children
      WHERE id = ${childId} AND parent_id = ${session.user.id}
      LIMIT 1
    `))[0] as unknown as ChildRow[];

    if (!rows.length) return res.status(404).json({ error: 'Child not found' });

    res.json({ rewardEmail: rows[0].reward_email ?? '' });
  } catch (err) {
    console.error('[reward-email GET] error:', err);
    res.status(500).json({ error: 'Failed to load reward email' });
  }
}
