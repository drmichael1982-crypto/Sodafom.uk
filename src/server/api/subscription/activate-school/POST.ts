/**
 * POST /api/subscription/activate-school
 * Activates a school licence and generates device activation codes.
 * Called after a successful school plan Stripe checkout.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { subscriptions, schoolLicences, deviceCodes } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSecret } from '#airo/secrets';
import { randomBytes } from 'crypto';

const SCHOOL_PRICE_ID = 'price_1U67njK4qwt1chs37hn3EUeh'; // School Plan £100/year

function getStripe(): Stripe {
  const secretKey = getSecret('STRIPE_SECRET_KEY');
  if (!secretKey || typeof secretKey !== 'string') throw new Error('STRIPE_SECRET_KEY not provisioned');
  return new Stripe(secretKey);
}

function generateCode(): string {
  // Format: SODA-XXXX-XXXX  (uppercase alphanumeric, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SODA-${seg(4)}-${seg(4)}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user?.id) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { sessionId, deviceCount = 30 } = req.body as { sessionId?: string; deviceCount?: number };
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Missing sessionId' });
      return;
    }

    // Idempotency check
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.stripeSessionId, sessionId)).limit(1);
    if (existing.length > 0) {
      const licence = await db.select().from(schoolLicences).where(eq(schoolLicences.subscriptionId, existing[0].id)).limit(1);
      const codes = licence.length > 0
        ? await db.select().from(deviceCodes).where(eq(deviceCodes.licenceId, licence[0].id))
        : [];
      res.json({ success: true, alreadyActivated: true, codes: codes.map((c: any) => c.code) });
      return;
    }

    // Verify with Stripe
    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status !== 'paid' && stripeSession.status !== 'complete') {
      res.status(400).json({ success: false, error: 'Payment not completed' });
      return;
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Insert subscription
    const [sub] = await db.insert(subscriptions).values({
      userId: session.user.id,
      stripeSessionId: sessionId,
      stripePriceId: SCHOOL_PRICE_ID,
      plan: 'school',
      status: 'active',
      activatedAt: new Date(),
      expiresAt,
    }).$returningId();

    // Insert school licence
    const licenceKey = randomBytes(16).toString('hex').toUpperCase();
    const [lic] = await db.insert(schoolLicences).values({
      subscriptionId: sub.id,
      userId: session.user.id,
      licenceKey,
      maxDevices: deviceCount,
      expiresAt,
    }).$returningId();

    // Generate device codes
    const codeValues = Array.from({ length: deviceCount }, () => ({
      licenceId: lic.id,
      code: generateCode(),
      status: 'unused' as const,
    }));
    await db.insert(deviceCodes).values(codeValues);

    const allCodes = await db.select().from(deviceCodes).where(eq(deviceCodes.licenceId, lic.id));

    res.json({
      success: true,
      licenceKey,
      deviceCount,
      expiresAt,
      codes: allCodes.map((c: any) => c.code),
    });
  } catch (error) {
    console.error('POST /api/subscription/activate-school error:', error);
    res.status(500).json({ success: false, error: 'Failed to activate school licence' });
  }
}
