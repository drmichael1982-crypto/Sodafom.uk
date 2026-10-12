/**
 * POST /api/referral/convert
 * Marks a referred user's subscription as converted and grants reward codes.
 * Body: { userId: string }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { promoCodes } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) { res.status(400).json({ error: 'Missing userId' }); return; }

    await db.execute(
      sql`UPDATE referrals SET converted = 1, converted_at = NOW() WHERE referred_user_id = ${userId} AND converted = 0`
    );

    const refResult = await db.execute(
      sql`SELECT referrer_user_id FROM referrals WHERE referred_user_id = ${userId} LIMIT 1`
    ) as unknown as Array<{ referrer_user_id: string }>;
    const referrerId = Array.isArray(refResult) ? refResult[0]?.referrer_user_id : undefined;

    if (referrerId) {
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as cnt FROM referrals WHERE referrer_user_id = ${referrerId} AND converted = 1`
      ) as unknown as Array<{ cnt: number }>;
      const cnt = Number(Array.isArray(countResult) ? countResult[0]?.cnt ?? 0 : 0);

      if (cnt > 0 && cnt % 3 === 0) {
        const rewardCode = `REF${referrerId.slice(-4).toUpperCase()}${cnt}`;
        await db.insert(promoCodes).values({
          code: rewardCode,
          description: `Referral reward — ${cnt} friends converted`,
          accessType: 'free',
          maxUses: 1,
          active: true,
          expiresAt: null,
        }).onDuplicateKeyUpdate({ set: { active: true } });
        console.log(`✅ Referral reward code ${rewardCode} granted to ${referrerId}`);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Referral convert error:', err);
    res.status(500).json({ error: 'Failed to convert referral' });
  }
}
