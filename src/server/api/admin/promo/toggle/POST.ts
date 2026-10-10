import type { Request, Response } from 'express';
import { db } from '../../../../db/client';
import { promoCodes } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { requireArchieOwnerSession } from '@/server/lib/archie-owner-session';

export default async function handler(req: Request, res: Response) {
  try {
    if (!await requireArchieOwnerSession(req, res)) return;

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
