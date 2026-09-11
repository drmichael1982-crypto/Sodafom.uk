import type { Request, Response } from 'express';
import { asc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { aiVoucherPacks } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const packs = await db.select().from(aiVoucherPacks).orderBy(asc(aiVoucherPacks.sortOrder));
    return res.json({ success: true, packs });
  } catch (error) {
    console.error('[admin-vouchers-list] error:', error);
    return res.status(500).json({ error: 'Unable to load voucher packs' });
  }
}
