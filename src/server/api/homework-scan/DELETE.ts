import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Sign in to clear saved homework.' });
    await db.execute(sql`DELETE FROM homework_scans WHERE user_id = ${session.user.id}`);
    return res.json({ ok: true });
  } catch (error) {
    console.error('[homework-scan/delete]', error);
    return res.status(500).json({ error: 'Could not clear saved homework.' });
  }
}
