import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { hasAdminAccess } from '@/server/admin-auth';
import { db } from '@/server/db/client';
import { aiVoucherPacks } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!(await hasAdminAccess(req))) return res.status(403).json({ error: 'Forbidden' });
    const pack = req.body;
    if (!pack || !Number.isSafeInteger(pack.id) || pack.id < 1 || typeof pack.enabled !== 'boolean' || typeof pack.displayName !== 'string' || !pack.displayName.trim()) {
      return res.status(400).json({ error: 'A valid voucher pack, name and enabled setting are required' });
    }
    if (pack.stripeTestPriceId != null && typeof pack.stripeTestPriceId !== 'string') return res.status(400).json({ error: 'Invalid Stripe test Price ID' });
    const testPriceId = pack.stripeTestPriceId?.trim() || null;
    if (testPriceId && !/^price_[A-Za-z0-9]+$/.test(testPriceId)) return res.status(400).json({ error: 'Enter a Stripe test Price ID beginning price_' });
    if (pack.enabled && !testPriceId) return res.status(400).json({ error: 'Add a Stripe test Price ID before enabling a voucher pack' });
    await db.update(aiVoucherPacks).set({ enabled: pack.enabled, displayName: pack.displayName.trim().slice(0, 80), stripeTestPriceId: testPriceId }).where(eq(aiVoucherPacks.id, pack.id));
    return res.json({ success: true, paidAiAvailable: false, billingStatus: 'live-payment-ledger-required' });
  } catch (error) {
    console.error('[admin-vouchers-update] error:', error);
    return res.status(500).json({ error: 'Unable to save voucher pack' });
  }
}
