/**
 * GET /api/referral
 * Returns the current user's referral code and stats.
 */
import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const userId = session.user.id;

    // Get or create referral code for this user
    const existing = await db.execute(
      sql`SELECT referral_code FROM referrals WHERE referrer_user_id = ${userId} AND referred_user_id IS NULL LIMIT 1`
    ) as unknown as Array<{ referral_code: string }>;

    let code: string;
    if (Array.isArray(existing) && existing[0]?.referral_code) {
      code = existing[0].referral_code;
    } else {
      code = `SF${userId.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, 'X')}`;
      await db.execute(
        sql`INSERT IGNORE INTO referrals (referrer_user_id, referral_code) VALUES (${userId}, ${code})`
      );
    }

    // Count conversions
    const stats = await db.execute(
      sql`SELECT COUNT(*) as total, SUM(converted) as converted FROM referrals WHERE referrer_user_id = ${userId} AND referred_user_id IS NOT NULL`
    ) as unknown as Array<{ total: number; converted: number }>;

    const row = Array.isArray(stats) ? stats[0] : null;
    const totalReferred = Number(row?.total ?? 0);
    const totalConverted = Number(row?.converted ?? 0);

    res.json({
      code,
      shareUrl: `https://sodafom.uk/signup?ref=${code}`,
      totalReferred,
      totalConverted,
      rewardsEarned: Math.floor(totalConverted / 3),
    });
  } catch (err) {
    console.error('Referral GET error:', err);
    res.status(500).json({ error: 'Failed to load referral data' });
  }
}
