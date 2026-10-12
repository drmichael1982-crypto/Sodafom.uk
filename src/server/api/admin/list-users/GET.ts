/**
 * GET /api/admin/list-users?adminKey=xxx
 * Lists all registered users (admin only).
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { requireArchieOwnerSession } from '@/server/lib/archie-owner-session';

export default async function handler(req: Request, res: Response) {
  try {
    if (!await requireArchieOwnerSession(req, res)) return;

    const rows = await db.execute(sql`
      SELECT id, name, email, created_at FROM user ORDER BY created_at DESC LIMIT 100
    `);
    const users = rows[0] as unknown as { id: string; name: string; email: string; created_at: string }[];

    res.json({ users });
  } catch {
    res.status(500).json({ error: 'Could not load users' });
  }
}
