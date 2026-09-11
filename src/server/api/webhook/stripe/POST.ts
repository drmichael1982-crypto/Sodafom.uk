/**
 * POST /api/webhook/stripe
 *
 * Stripe webhook handler — sends owner notification emails on:
 *   - checkout.session.completed  (payment confirmed)
 *   - customer.subscription.created (new subscription)
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { sendEmail } from '@/server/email';
import { getSecret } from '#airo/secrets';

const OWNER_EMAIL = 'sodafom.uk@gmail.com';

function getStripe(): Stripe {
  const key = getSecret('STRIPE_SECRET_KEY');
  if (!key || typeof key !== 'string') throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

const PLAN_LABELS = new Map<string, string>([
  ['price_1U5bazK4qwt1chs3b6cnitbe', 'Monthly (£1/month)'],
  ['price_1U5bb5K4qwt1chs3WvIrzKfS', 'Annual (£10/year)'],
  ['price_1U67njK4qwt1chs37hn3EUeh', 'School Plan (£100/year)'],
]);

function planLabel(priceId: string): string {
  return PLAN_LABELS.get(priceId) ?? priceId;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

function paymentEmail(session: Stripe.Checkout.Session): { subject: string; html: string; text: string } {
  const name = session.customer_details?.name ?? 'Unknown';
  const email = session.customer_details?.email ?? session.customer_email ?? 'Unknown';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const amount = session.amount_total != null ? `£${(session.amount_total / 100).toFixed(2)}` : 'N/A';
  const plan = planLabel(session.metadata?.priceId ?? '');
  const sessionId = session.id;
  const date = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

  const subject = `💳 New Sodafom payment — ${name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
      <div style="background: #2D6A4F; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #FFD700; margin: 0; font-size: 22px;">💳 New Payment — Sodafom</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 140px;">Customer:</td><td style="padding: 8px 0; color: #222;">${safeName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #2D6A4F;">${safeEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Plan:</td><td style="padding: 8px 0; color: #222;">${plan}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Amount:</td><td style="padding: 8px 0; color: #222; font-weight: bold;">${amount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td><td style="padding: 8px 0; color: #222;">${date}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Session ID:</td><td style="padding: 8px 0; color: #888; font-size: 12px;">${sessionId}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="color: #2D6A4F; font-weight: bold; margin: 0;">🎉 A new subscriber has joined Sodafom!</p>
      </div>
    </div>
  `;
  const text = `New Sodafom Payment\n\nCustomer: ${name}\nEmail: ${email}\nPlan: ${plan}\nAmount: ${amount}\nDate: ${date}\nSession: ${sessionId}`;
  return { subject, html, text };
}


export default async function handler(req: Request, res: Response): Promise<void> {
  // Stripe sends raw body — must be read as buffer
  const sig = req.headers['stripe-signature'];
  const webhookSecret = getSecret('STRIPE_WEBHOOK_SECRET');

  if (!webhookSecret || typeof webhookSecret !== 'string') {
    console.warn('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured');
    res.status(503).json({ error: 'Webhook verification is not configured' });
    return;
  }
  if (!sig) {
    res.status(400).json({ error: 'Missing Stripe signature' });
    return;
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { subject, html, text } = paymentEmail(session);
      await sendEmail({ fromName: 'Sodafom Payments', to: OWNER_EMAIL, subject, html, text });
      console.log(`[stripe-webhook] payment notification sent for session ${session.id}`);
    }
  } catch (err) {
    console.error('[stripe-webhook] failed to send notification email:', err);
  }

  res.json({ received: true });
}
