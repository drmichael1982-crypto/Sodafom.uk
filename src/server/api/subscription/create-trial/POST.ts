/**
 * POST /api/subscription/create-trial
 *
 * Creates a Stripe Checkout session in "subscription" mode with a 7-day free trial.
 * Stripe collects card details upfront but does NOT charge until day 8.
 *
 * Body: { priceId, successUrl, cancelUrl }
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { getAuth } from '@/lib/auth/auth';
import { checkoutOrigin, planForPrice } from '@/server/lib/checkout-security';

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('STRIPE_SECRET_KEY not configured.');
  }
  return new Stripe(secretKey);
}

interface CreateTrialRequest {
  priceId: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { priceId } = req.body as CreateTrialRequest;

    if (!priceId) {
      res.status(400).json({ success: false, error: 'priceId is required.' });
      return;
    }

    const plan = planForPrice(priceId);
    if (!plan) {
      res.status(400).json({ success: false, error: 'Unknown Sodafom subscription plan.' });
      return;
    }

    const authSession = await getAuth().api.getSession({ headers: req.headers as unknown as Headers });
    if (!authSession?.user?.id || !authSession.user.email) {
      res.status(401).json({ success: false, error: 'Please sign in before starting checkout.' });
      return;
    }

    const origin = checkoutOrigin(req);

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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // ── 7-day free trial ──────────────────────────────────────────────────────
      // Stripe collects card details now; the first charge happens on day 8.
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          sodafomUserId: authSession.user.id,
          sodafomPlan: plan,
          sodafomPriceId: priceId,
        },
      },
      // ─────────────────────────────────────────────────────────────────────────
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/hub/signup?checkout=cancelled`,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      // Pre-fill customer email if the user is authenticated
      customer_email: authSession.user.email,
      client_reference_id: authSession.user.id,
      metadata: {
        sodafomUserId: authSession.user.id,
        sodafomPlan: plan,
        sodafomPriceId: priceId,
      },
      // Allow promo codes at checkout
      allow_promotion_codes: true,
      // Collect payment method even during trial so Stripe can charge on day 8
      payment_method_collection: 'always',
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
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
