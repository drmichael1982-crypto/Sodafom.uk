/**
 * POST /api/subscription/activate
 * Called after a successful Stripe checkout to activate a subscription.
 * Verifies the Stripe session server-side before writing to DB.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { subscriptions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSecret } from '#airo/secrets';
import { planForPrice } from '@/server/lib/checkout-security';

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('STRIPE_SECRET_KEY not provisioned');
  }
  return new Stripe(secretKey);
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });

    if (!session?.user?.id) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Missing sessionId' });
      return;
    }

    // Check if already activated (idempotent)
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      res.json({ success: true, alreadyActivated: true });
      return;
    }

    // Verify with Stripe
    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (stripeSession.mode !== 'subscription' || stripeSession.status !== 'complete') {
      res.status(400).json({ success: false, error: 'Subscription checkout not completed' });
      return;
    }

    const checkoutUserId = stripeSession.metadata?.sodafomUserId ?? stripeSession.client_reference_id;
    if (!checkoutUserId || checkoutUserId !== session.user.id) {
      res.status(403).json({ success: false, error: 'Checkout does not belong to this account' });
      return;
    }

    // Get price ID from session
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 1 });
    const priceId = lineItems.data[0]?.price?.id ?? '';
    const plan = planForPrice(priceId);
    if (!plan) {
      res.status(400).json({ success: false, error: 'Unknown Sodafom subscription plan' });
      return;
    }

    // Extract Stripe subscription ID so cancel can find it directly
    const subField = stripeSession.subscription;
    const stripeSubscriptionId = typeof subField === 'string'
      ? subField
      : (subField as Stripe.Subscription | null)?.id ?? null;
    const stripeSubscription = typeof subField === 'string' ? null : subField as Stripe.Subscription | null;
    if (!stripeSubscriptionId) {
      res.status(400).json({ success: false, error: 'Stripe subscription was not created' });
      return;
    }
    const isTrial = stripeSubscription?.status === 'trialing';
    const expiresAt = isTrial && stripeSubscription?.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null;

    await db.insert(subscriptions).values({
      userId: session.user.id,
      stripeSessionId: sessionId,
      stripePriceId: priceId,
      plan,
      status: isTrial ? 'trial_active' : 'active',
      activatedAt: new Date(),
      expiresAt,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
    });

    res.json({ success: true, plan });
  } catch (error) {
    console.error('POST /api/subscription/activate error:', error);
    res.status(500).json({ success: false, error: 'Failed to activate subscription' });
  }
}
