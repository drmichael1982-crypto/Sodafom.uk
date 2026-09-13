/**
 * GET /api/admin/list-users
 *
 * Lists the minimum account fields for a signed-in administrator only.
 * This deliberately does not accept an admin code or a query secret: the
 * code-based Admin Hub can show aggregate visit figures for authorised testing,
 * while account PII requires a real administrator session.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as HeadersInit) });
    const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true;
    if (!isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const rows = await db.execute(sql`
      SELECT id, name, email, created_at FROM user ORDER BY created_at DESC LIMIT 100
    `);
    const users = rows[0] as unknown as { id: string; name: string | null; email: string; created_at: string | null }[];

    res.json({ users });
  } catch {
    console.error('[admin/list-users] request failed');
    res.status(500).json({ error: 'Unable to load accounts' });
  }
}
