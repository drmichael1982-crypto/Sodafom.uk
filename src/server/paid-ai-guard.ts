import type { Response } from 'express';

/**
 * Fail closed while the voucher/subscription ledger is not able to debit a
 * verified entitlement atomically. A client flag, promo code, or admin browser
 * state must never authorise paid model usage.
 */
export function requirePaidAiBilling(res: Response, format: 'text' | 'json' = 'json'): boolean {
  const message = 'Paid AI is temporarily paused while voucher billing is connected. Please use Local AI.';
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Sodafom-AI-Status', 'voucher-billing-pending');
  if (format === 'text') {
    res.status(503).type('text/plain').send(message);
  } else {
    res.status(503).json({
      error: message,
      code: 'PAID_AI_BILLING_PENDING',
      paidAiAvailable: false,
    });
  }
  return false;
}
