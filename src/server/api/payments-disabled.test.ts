// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const getSecret = vi.hoisted(() => vi.fn());
vi.mock('#airo/secrets', () => ({ getSecret }));

import createTrial from './subscription/create-trial/POST';
import createCheckout from './stripe/create-checkout-session/POST';
import activateSubscription from './subscription/activate/POST';
import activateSchool from './subscription/activate-school/POST';
import getCheckoutSession from './stripe/session/[sessionId]/GET';
import stripeWebhook from './webhook/stripe/POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('free-build payment boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSecret.mockImplementation((name: string) => name === 'STRIPE_SECRET_KEY' ? 'configured-but-unused' : null);
  });

  it.each([
    ['subscription trial', createTrial],
    ['cart checkout', createCheckout],
    ['subscription activation', activateSubscription],
    ['school activation', activateSchool],
    ['checkout session details', getCheckoutSession],
    ['Stripe webhook', stripeWebhook],
  ])('blocks %s before Stripe can be used', async (_label, handler) => {
    const res = response();
    await handler({ body: { priceId: 'price_test' }, headers: {}, params: { sessionId: 'cs_test' } } as unknown as Request, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Payments are disabled while Sodafom is free.',
    }));
    expect(getSecret).not.toHaveBeenCalledWith('STRIPE_SECRET_KEY');
  });
});
