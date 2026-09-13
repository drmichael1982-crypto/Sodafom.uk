/**
 * GET /api/admin/list-users?adminKey=xxx
 * Lists all registered users (admin only).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const adminKey = req.query.adminKey as string;
    const secret = getSecret('BETTER_AUTH_SECRET');
    if (!adminKey || adminKey !== secret) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rows = await db.execute(sql`
      SELECT id, name, email, created_at FROM user ORDER BY created_at DESC LIMIT 100
    `);
    const users = rows[0] as unknown as { id: string; name: string; email: string; created_at: string }[];

    res.json({ users });
  } catch {
    console.error('[admin/list-users] request failed');
    res.status(500).json({ error: 'Unable to load accounts' });
  }
}
