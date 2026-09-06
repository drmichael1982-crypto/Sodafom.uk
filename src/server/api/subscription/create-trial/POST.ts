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

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('STRIPE_SECRET_KEY not configured.');
  }
  return new Stripe(secretKey);
}

interface CreateTrialRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { priceId, successUrl, cancelUrl } = req.body as CreateTrialRequest;

    if (!priceId) {
      res.status(400).json({ success: false, error: 'priceId is required.' });
      return;
    }

    // Derive safe redirect URLs — prefer body values (they include session_id placeholder)
    // but fall back to origin-derived URLs as a security backstop.
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const resolvedSuccess = successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel  = cancelUrl  || `${origin}/hub/signup`;

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
      },
      // ─────────────────────────────────────────────────────────────────────────
      success_url: resolvedSuccess,
      cancel_url: resolvedCancel,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      // Pre-fill customer email if the user is authenticated
      customer_email: (req as Request & { user?: { email?: string } }).user?.email ?? undefined,
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
