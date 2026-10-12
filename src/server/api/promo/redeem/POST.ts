/**
 * POST /api/promo/redeem
 *
 * Validates a promo code and grants the signed-in user free access
 * by inserting a row into `subscriptions` with plan='promo'.
 *
 * Body: { code: string }
 * Returns: { success: true, message: string } | { success: false, error: string }
 */
import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { promoCodes, promoActivations, subscriptions } from '@/server/db/schema';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const { code } = req.body as { code?: string };
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Please enter a promo code.' });
      return;
    }

    const trimmed = code.trim().toUpperCase();

    // Look up the promo code first — before checking auth, so we can give
    // instant feedback on invalid codes even to unauthenticated users.
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, trimmed))
      .limit(1);

    if (!promo || !promo.active) {
      res.status(400).json({ success: false, error: 'That code isn\'t valid. Please check and try again.' });
      return;
    }

    // Check expiry
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      res.status(400).json({ success: false, error: 'That promo code has expired.' });
      return;
    }

    // Check max uses
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      res.status(400).json({ success: false, error: 'That promo code has reached its limit.' });
      return;
    }

    // Code is valid — now check auth. Return a special flag so the client
    // can redirect to signup/login with the code pre-filled (no error shown).
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user?.id) {
      res.status(401).json({ success: false, requiresAuth: true, validCode: trimmed });
      return;
    }

    // Check if this user already redeemed this code
    const [existing] = await db
      .select()
      .from(promoActivations)
      .where(
        and(
          eq(promoActivations.userId, session.user.id),
          eq(promoActivations.promoCodeId, promo.id)
        )
      )
      .limit(1);

    if (existing) {
      res.status(400).json({ success: false, error: 'You\'ve already redeemed this code.' });
      return;
    }

    // Check if user already has a live (non-cancelled) subscription
    const [activeSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    if (activeSub && activeSub.status === 'active' && activeSub.plan !== 'promo') {
      // Already on a paid plan — don't block, just tell them
      res.status(400).json({ success: false, error: 'You already have an active paid subscription.' });
      return;
    }

    // If they have a cancelled/cancelling/promo row, we'll overwrite it below

    // Grant access — upsert subscription row + activation record
    await db.transaction(async (tx: any) => {
      // Calculate expiry date if duration is set
      let expiresAt: Date | null = null;
      if (promo.accessDurationDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + promo.accessDurationDays);
      }

      if (activeSub) {
        // Overwrite existing row (e.g. previously cancelled) with promo access
        await tx.execute(sql`
          UPDATE subscriptions
          SET stripe_price_id = 'promo',
              plan = 'promo',
              status = 'active',
              expires_at = ${expiresAt},
              cancel_reason = NULL,
              cancelled_at = NULL
          WHERE user_id = ${session.user.id}
        `);
      } else {
        await tx.insert(subscriptions).values({
          userId: session.user.id,
          stripeSessionId: `promo_${promo.code}_${session.user.id}_${Date.now()}`,
          stripePriceId: 'promo',
          plan: 'promo',
          status: 'active',
          expiresAt: expiresAt,
        });
      }

      await tx.insert(promoActivations).values({
        userId: session.user.id,
        promoCodeId: promo.id,
        code: promo.code,
      });

      // Increment use count
      await tx
        .update(promoCodes)
        .set({ usedCount: promo.usedCount + 1 })
        .where(eq(promoCodes.id, promo.id));
    });

    res.json({ success: true, message: '🎉 Code accepted! You now have full access to Sodafom.' });
  } catch (error) {
    console.error('POST /api/promo/redeem error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}
