/**
 * POST /api/referral/track
 * Records that the newly signed-up user was referred by the code owner.
 * Body: { code: string }
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) { res.status(401).json({ error: 'Not authenticated' }); return; }
    const newUserId = session.user.id;

    const { code } = req.body as { code?: string };
    if (!code || typeof code !== 'string') { res.status(400).json({ error: 'Missing referral code' }); return; }
    const safeCode = code.trim().toUpperCase().slice(0, 32);

    // Find the referrer's seed row
    const result = await db.execute(
      sql`SELECT id, referrer_user_id FROM referrals WHERE referral_code = ${safeCode} AND referred_user_id IS NULL LIMIT 1`
    ) as unknown as Array<{ id: number; referrer_user_id: string }>;

    const seedRow = Array.isArray(result) ? result[0] : undefined;
    if (!seedRow) { res.status(404).json({ error: 'Invalid or expired referral code' }); return; }
    if (seedRow.referrer_user_id === newUserId) { res.status(400).json({ error: 'Cannot refer yourself' }); return; }

    // Check not already tracked
    const dupe = await db.execute(
      sql`SELECT id FROM referrals WHERE referred_user_id = ${newUserId} LIMIT 1`
    ) as unknown as Array<{ id: number }>;
    if (Array.isArray(dupe) && dupe.length > 0) { res.json({ ok: true, message: 'Already tracked' }); return; }

    await db.execute(
      sql`INSERT INTO referrals (referrer_user_id, referral_code, referred_user_id, converted, created_at)
          VALUES (${seedRow.referrer_user_id}, ${safeCode}, ${newUserId}, 0, NOW())`
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Referral track error:', err);
    res.status(500).json({ error: 'Failed to track referral' });
  }
}
