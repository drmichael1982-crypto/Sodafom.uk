/**
 * POST /api/subscription/cancel
 *
 * Cancels the user's Stripe subscription IMMEDIATELY.
 * Access stops right away — Stripe stops billing and the DB row is marked cancelled.
 *
 * Body: { reason?: string }
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { getSecret } from '#airo/secrets';
import Stripe from 'stripe';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

interface SubRow {
  stripe_subscription_id: string | null;
  stripe_session_id: string;
  status: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { reason } = req.body as { reason?: string };

    // Fetch subscription row
    const rows = (await db.execute(sql`
      SELECT stripe_subscription_id, stripe_session_id, status
      FROM subscriptions
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC LIMIT 1
    `))[0] as unknown as SubRow[];

    const sub = rows[0];
    if (!sub) return res.status(404).json({ error: 'No active subscription found' });
    if (sub.status === 'cancelled') return res.status(400).json({ error: 'Subscription already cancelled' });

    const stripeKey = getSecret('STRIPE_SECRET_KEY');
    if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });

    const stripe = new Stripe(stripeKey as string, { apiVersion: '2026-02-25.clover' });

    let stripeSubId = sub.stripe_subscription_id;

    // If we only have a session ID, look up the subscription from it
    if (!stripeSubId && sub.stripe_session_id && !sub.stripe_session_id.startsWith('promo_')) {
      try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sub.stripe_session_id, {
          expand: ['subscription'],
        });
        const subField = checkoutSession.subscription;
        stripeSubId = typeof subField === 'string'
          ? subField
          : (subField as Stripe.Subscription | null)?.id ?? null;
      } catch { /* session may not exist in sandbox */ }
    }

    if (stripeSubId) {
      // Cancel IMMEDIATELY — access stops now, bank payment stops now
      await stripe.subscriptions.cancel(stripeSubId, {
        cancellation_details: { comment: reason ?? 'Cancelled via Sodafom icon' },
      });
    }

    // Update local DB — mark cancelled immediately, clear expiry so access gates fail
    await db.execute(sql`
      UPDATE subscriptions
      SET status = 'cancelled',
          cancel_reason = ${reason ?? null},
          cancelled_at = NOW(),
          expires_at = NOW()
      WHERE user_id = ${session.user.id}
    `);

    res.json({ ok: true, message: 'Your subscription has been cancelled. Access has ended.' });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
