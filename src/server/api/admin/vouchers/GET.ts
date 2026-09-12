import type { Request, Response } from 'express';
import { asc } from 'drizzle-orm';
import { hasAdminAccess } from '@/server/admin-auth';
import { db } from '@/server/db/client';
import { aiVoucherPacks } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!(await hasAdminAccess(req))) return res.status(403).json({ error: 'Forbidden' });
    const packs = await db.select().from(aiVoucherPacks).orderBy(asc(aiVoucherPacks.sortOrder));
    return res.json({ success: true, packs, paidAiAvailable: false, billingStatus: 'live-payment-ledger-required' });
  } catch (error) {
    console.error('[admin-vouchers-list] error:', error);
    return res.status(500).json({ error: 'Unable to load voucher packs' });
  }
}
