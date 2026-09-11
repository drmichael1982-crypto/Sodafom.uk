import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { aiVoucherPacks } from '@/server/db/schema';

type UpdateVoucherPack = { id: number; enabled: boolean; displayName: string; stripeTestPriceId: string | null };

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const pack = req.body as UpdateVoucherPack;
    if (!Number.isInteger(pack.id) || !pack.displayName?.trim()) return res.status(400).json({ error: 'A voucher pack and name are required' });
    const testPriceId = pack.stripeTestPriceId?.trim() || null;
    if (testPriceId && !testPriceId.startsWith('price_')) return res.status(400).json({ error: 'Enter a Stripe test Price ID beginning price_' });
    if (pack.enabled && !testPriceId) return res.status(400).json({ error: 'Add a Stripe test Price ID before enabling a voucher pack' });
    await db.update(aiVoucherPacks).set({ enabled: Boolean(pack.enabled), displayName: pack.displayName.trim().slice(0, 80), stripeTestPriceId: testPriceId }).where(eq(aiVoucherPacks.id, pack.id));
    return res.json({ success: true });
  } catch (error) {
    console.error('[admin-vouchers-update] error:', error);
    return res.status(500).json({ error: 'Unable to save voucher pack' });
  }
}
