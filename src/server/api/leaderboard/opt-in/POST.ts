/**
 * POST /api/leaderboard/opt-in
 * Toggles leaderboard opt-in for a child.
 * Body: { childId: number, optIn: boolean }
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

    const { childId, optIn } = req.body ?? {};
    if (childId === undefined) return res.status(400).json({ error: 'childId required' });

    // Verify ownership
    const childRows = await db.execute(sql`
      SELECT id FROM children WHERE id = ${childId} AND parent_id = ${session.user.id} LIMIT 1
    `);
    if (!(childRows[0] as unknown as unknown[]).length) {
      return res.status(403).json({ error: 'Child not found' });
    }

    await db.execute(sql`
      UPDATE children SET leaderboard_opt_in = ${optIn ? 1 : 0} WHERE id = ${childId}
    `);

    res.json({ ok: true, optIn: !!optIn });
  } catch (err) {
    console.error('[leaderboard/opt-in]', err);
    res.status(500).json({ error: String(err) });
  }
}
