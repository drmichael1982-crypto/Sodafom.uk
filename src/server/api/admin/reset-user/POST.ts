/**
 * POST /api/admin/reset-user
 * Deletes a user account by email so it can be re-registered cleanly.
 * ADMIN ONLY — requires the admin secret header.
 *
 * Body: { email: string, adminKey: string }
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { hasAdminAccess } from '@/server/admin-auth';

export default async function handler(req: Request, res: Response) {
  try {
    const { email } = req.body ?? {};
    if (!(await hasAdminAccess(req))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' });
    }

    const trimmed = email.trim().toLowerCase();

    // Find user
    const rows = await db.execute(sql`SELECT id FROM user WHERE email = ${trimmed} LIMIT 1`);
    const userRows = rows[0] as unknown as { id: string }[];

    if (!userRows.length) {
      return res.status(404).json({ error: `No user found with email: ${trimmed}` });
    }

    const userId = userRows[0].id;

    // Delete in order (cascade should handle it but be explicit)
    await db.execute(sql`DELETE FROM session WHERE user_id = ${userId}`);
    await db.execute(sql`DELETE FROM account WHERE user_id = ${userId}`);
    await db.execute(sql`DELETE FROM verification WHERE identifier = ${trimmed}`);
    await db.execute(sql`DELETE FROM user WHERE id = ${userId}`);

    console.log(`[admin/reset-user] deleted user ${trimmed} (${userId})`);
    res.json({ ok: true, deleted: trimmed });
  } catch (err) {
    console.error('[admin/reset-user]', err);
    res.status(500).json({ error: String(err) });
  }
}
