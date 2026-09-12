import type { Response } from 'express';

/**
 * Temporary, fail-closed spending safeguard.
 * The existing voucher table configures test packs but does not provide a
 * verified live-payment ledger or atomic credit debits. Until those are wired
 * and tested, no public endpoint may spend the owner's OpenAI balance.
 * Do not replace this with a client flag, subscription/promo check, admin
 * exception or test payment. Local AI does not call this guard.
 */
export function requirePaidAiBilling(res: Response, format: 'text' | 'json' = 'json'): boolean {
  const message = 'Paid AI is temporarily paused while voucher billing is connected. Please use Local AI.';
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Sodafom-AI-Status', 'voucher-billing-pending');
  if (format === 'text') res.status(503).type('text/plain').send(message);
  else res.status(503).json({ error: message, code: 'PAID_AI_BILLING_PENDING', paidAiAvailable: false });
  return false;
}
