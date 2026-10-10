import type { Request, Response } from 'express';
import { db } from '../../../db/client';
import { promoCodes } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { requireArchieOwnerSession } from '@/server/lib/archie-owner-session';

export default async function handler(req: Request, res: Response) {
  try {
    if (!await requireArchieOwnerSession(req, res)) return;

    const codes = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
    res.json({ success: true, codes });
  } catch (err) {
    console.error('[admin-promo-list] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
