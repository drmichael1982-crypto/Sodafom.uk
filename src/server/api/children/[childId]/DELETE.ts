import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { children } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const id = parseInt(String(req.params.childId));
    await db.delete(children).where(and(eq(children.id, id), eq(children.parentId, session.user.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
