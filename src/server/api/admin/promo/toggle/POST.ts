import type { Request, Response } from 'express';
import { db } from '../../../../db/client';
import { promoCodes } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });

    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, active } = req.body as { id: number; active: boolean };

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    await db.update(promoCodes).set({ active }).where(eq(promoCodes.id, id));

    res.json({ success: true });
  } catch (err) {
    console.error('[admin-promo-toggle] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
