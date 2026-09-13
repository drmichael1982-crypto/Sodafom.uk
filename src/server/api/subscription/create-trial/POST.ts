/**
 * POST /api/subscription/create-trial
 *
 * Creates a Stripe Checkout session in "subscription" mode with a 7-day free trial.
 * Stripe collects card details upfront but does NOT charge until day 8.
 *
 * Body: { planId: 'monthly' | 'annual' }
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { getAuth } from '@/lib/auth/auth';

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('STRIPE_SECRET_KEY not configured.');
  }
  return new Stripe(secretKey);
}

interface CreateTrialRequest {
  /** A server-recognised plan, never a Stripe price supplied by the browser. */
  planId: 'monthly' | 'annual';
}

const PUBLIC_ORIGIN = 'https://sodafom.uk';

function priceForPlan(planId: CreateTrialRequest['planId']): string | null {
  // Price IDs belong in the deployment secret store, not in browser bundles.
  // Set both values to TEST price IDs before exercising this route in Stripe test mode.
  const secretName = planId === 'monthly'
    ? 'STRIPE_MONTHLY_PRICE_ID'
    : 'STRIPE_ANNUAL_PRICE_ID';
  const value = getSecret(secretName);
  return typeof value === 'string' && value.startsWith('price_') ? value : null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user?.id || !session.user.email) {
      res.status(401).json({ success: false, error: 'Please sign in before starting a subscription.' });
      return;
    }

    const { planId } = req.body as Partial<CreateTrialRequest>;

    if (planId !== 'monthly' && planId !== 'annual') {
      res.status(400).json({ success: false, error: 'Choose the monthly or annual plan.' });
      return;
    }

    const priceId = priceForPlan(planId);
    if (!priceId) {
      // Failing closed prevents an accidental live launch against obsolete prices.
      res.status(503).json({ success: false, error: 'Subscriptions are not configured yet.' });
      return;
    }

    const resolvedSuccess = `${PUBLIC_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel = `${PUBLIC_ORIGIN}/subscribe?cancelled=1`;

    const stripe = getStripe();

    // Verify the price is a recurring (subscription) price
    const price = await stripe.prices.retrieve(priceId);
    if (!price.recurring) {
      res.status(400).json({
        success: false,
        error: 'This price is not a subscription. Free trials require a recurring price.',
      });
      return;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // ── 7-day free trial ──────────────────────────────────────────────────────
      // Stripe collects card details now; the first charge happens on day 8.
      subscription_data: {
        trial_period_days: 7,
      },
      // ─────────────────────────────────────────────────────────────────────────
      success_url: resolvedSuccess,
      cancel_url: resolvedCancel,
      client_reference_id: session.user.id,
      metadata: { sodafomPlan: planId, sodafomUserId: session.user.id },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      // Pre-fill customer email if the user is authenticated
      customer_email: session.user.email,
      // Allow promo codes at checkout
      allow_promotion_codes: true,
      // Collect payment method even during trial so Stripe can charge on day 8
      payment_method_collection: 'always',
    });

    res.json({ success: true, url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (error) {
    console.error('create-trial failed:', error);

    if (error instanceof Stripe.errors.StripeError) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: 'Unable to start checkout. Please try again or contact support.',
        code: error.code,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Unable to start checkout. Please try again or contact support.',
    });
  }
}
