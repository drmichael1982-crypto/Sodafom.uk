/**
 * POST /api/auth/update-profile
 * Updates the authenticated user's display name.
 * Body: { name: string }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const trimmed = name.trim().slice(0, 100);

    await db.execute(sql`
      UPDATE user SET name = ${trimmed} WHERE id = ${session.user.id}
    `);

    res.json({ ok: true, name: trimmed });
  } catch (err) {
    console.error('[update-profile] error:', err);
    res.status(500).json({ error: String(err) });
  }
}
