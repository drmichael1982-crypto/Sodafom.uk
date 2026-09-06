import type { Request, Response } from 'express';
import { db } from '../../../db/client';
import { promoCodes } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });

    // Security: Only admins can list codes
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const codes = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
    res.json({ success: true, codes });
  } catch (err) {
    console.error('[admin-promo-list] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
