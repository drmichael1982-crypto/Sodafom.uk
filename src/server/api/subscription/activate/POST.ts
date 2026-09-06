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

const ANNUAL_PRICE_ID  = 'price_1U5bb5K4qwt1chs3WvIrzKfS';
const MONTHLY_PRICE_ID = 'price_1U5bazK4qwt1chs3b6cnitbe';

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('STRIPE_SECRET_KEY not provisioned');
  }
  return new Stripe(secretKey);
}

function getPlan(priceId: string): string {
  if (priceId === ANNUAL_PRICE_ID) return 'annual';
  if (priceId === MONTHLY_PRICE_ID) return 'monthly';
  return 'promo';
}

function getExpiry(plan: string): Date | null {
  if (plan === 'annual') {
    // Annual: exactly 1 year from today's payment date
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  // Monthly: Stripe manages rolling billing — no fixed expiry in our DB.
  // Access is valid as long as Stripe subscription is active.
  // We set null and rely on Stripe webhook / cancel endpoint to revoke.
  return null;
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

    if (stripeSession.payment_status !== 'paid' && stripeSession.status !== 'complete') {
      res.status(400).json({ success: false, error: 'Payment not completed' });
      return;
    }

    // Get price ID from session
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 1 });
    const priceId = lineItems.data[0]?.price?.id ?? '';
    const plan = getPlan(priceId);
    const expiresAt = getExpiry(plan);

    // Extract Stripe subscription ID so cancel can find it directly
    const subField = stripeSession.subscription;
    const stripeSubscriptionId = typeof subField === 'string'
      ? subField
      : (subField as Stripe.Subscription | null)?.id ?? null;

    await db.insert(subscriptions).values({
      userId: session.user.id,
      stripeSessionId: sessionId,
      stripePriceId: priceId,
      plan,
      status: 'active',
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
