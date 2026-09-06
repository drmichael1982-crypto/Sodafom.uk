/**
 * GET /api/subscription/trial-status
 *
 * Returns the full subscription state for the current user:
 *   - subscribed: boolean  (active paid OR active trial)
 *   - status: 'none' | 'trial_active' | 'trial_expired' | 'active' | 'cancelled'
 *   - trialEndsAt: ISO string | null
 *   - daysLeft: number | null   (days remaining in trial, 0 when expired)
 *   - plan: string | null
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { subscriptions } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSecret } from '#airo/secrets';

function getStripe(): Stripe {
  const key = getSecret('STRIPE_SECRET_KEY');
  if (!key || typeof key !== 'string') throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user?.id) {
      res.json({ subscribed: false, status: 'none', trialEndsAt: null, daysLeft: null, plan: null });
      return;
    }

    const now = new Date();

    // Check our DB first (covers promo codes and manually activated subs)
    const [dbSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (dbSub) {
      const expired = dbSub.expiresAt && dbSub.expiresAt < now;
      if (!expired && dbSub.status === 'active') {
        // Promo access — flag it clearly
        const plan = dbSub.plan === 'promo' ? 'promo' : dbSub.plan;
        res.json({ subscribed: true, status: 'active', trialEndsAt: null, daysLeft: null, plan });
        return;
      }
    }

    // Check Stripe for live subscription/trial state
    const stripe = getStripe();
    const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
    if (customers.data.length === 0) {
      res.json({ subscribed: false, status: 'none', trialEndsAt: null, daysLeft: null, plan: null });
      return;
    }

    const customer = customers.data[0];
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 5,
      expand: ['data.items.data.price'],
    });

    if (subs.data.length === 0) {
      res.json({ subscribed: false, status: 'none', trialEndsAt: null, daysLeft: null, plan: null });
      return;
    }

    // Find the most relevant subscription
    const activeSub = subs.data.find(s => s.status === 'active') ||
                      subs.data.find(s => s.status === 'trialing') ||
                      subs.data[0];

    const price = activeSub.items.data[0]?.price;
    const planLabel = price?.recurring?.interval === 'year' ? 'annual' : 'monthly';

    if (activeSub.status === 'trialing' && activeSub.trial_end) {
      const trialEnd = new Date(activeSub.trial_end * 1000);
      const msLeft = trialEnd.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      res.json({
        subscribed: true,
        status: 'trial_active',
        trialEndsAt: trialEnd.toISOString(),
        daysLeft,
        plan: planLabel,
      });
      return;
    }

    if (activeSub.status === 'active') {
      res.json({ subscribed: true, status: 'active', trialEndsAt: null, daysLeft: null, plan: planLabel });
      return;
    }

    // Cancelled / past_due / incomplete
    res.json({ subscribed: false, status: 'cancelled', trialEndsAt: null, daysLeft: null, plan: planLabel });
  } catch (error) {
    console.error('GET /api/subscription/trial-status error:', error);
    res.status(500).json({ subscribed: false, status: 'none', trialEndsAt: null, daysLeft: null, plan: null });
  }
}
