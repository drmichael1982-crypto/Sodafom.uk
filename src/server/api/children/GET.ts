import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { children } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const rows = await db.select().from(children).where(eq(children.parentId, session.user.id));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
