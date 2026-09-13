import type { Request, Response } from 'express';
import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { promoActivations, promoCodes } from '@/server/db/schema';

/**
 * Server-side paid-AI voucher gate.
 *
 * Local AI never calls this guard. Paid AI is allowed only when the signed-in
 * parent has previously activated a promo code whose accessType is
 * `ai-voucher`. For those codes, maxUses is the number of paid-AI questions in
 * the voucher and usedCount includes the one redemption event, so a redeemed
 * 5-question voucher progresses 1 -> 6 while allowing exactly five paid calls.
 *
 * This stays fail-closed: no session, no voucher, expired/disabled voucher,
 * exhausted credit, database trouble, or a concurrent final-credit race all
 * block the paid provider before any OpenAI request is made.
 */
export async function requirePaidAiBilling(
  req: Request,
  res: Response,
  format: 'text' | 'json' = 'json',
): Promise<boolean> {
  const deny = (status: number, message: string, code: string) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Sodafom-AI-Status', code.toLowerCase());
    if (format === 'text') res.status(status).type('text/plain').send(message);
    else res.status(status).json({ error: message, code, paidAiAvailable: false });
    return false;
  };

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) {
      return deny(401, 'Sign in to use a paid AI voucher. Local AI is still available.', 'AI_VOUCHER_SIGN_IN_REQUIRED');
    }

    const now = new Date();
    const rows = await db
      .select({
        codeId: promoCodes.id,
        maxUses: promoCodes.maxUses,
        usedCount: promoCodes.usedCount,
      })
      .from(promoActivations)
      .innerJoin(promoCodes, eq(promoActivations.promoCodeId, promoCodes.id))
      .where(and(
        eq(promoActivations.userId, session.user.id),
        eq(promoCodes.accessType, 'ai-voucher'),
        eq(promoCodes.active, true),
        or(isNull(promoCodes.expiresAt), gt(promoCodes.expiresAt, now)),
        or(isNull(promoCodes.maxUses), sql`${promoCodes.usedCount} <= ${promoCodes.maxUses}`),
      ))
      .limit(1);

    const voucher = rows[0];
    if (!voucher) {
      return deny(402, 'Local AI could not answer this one. A paid AI voucher with remaining questions is required.', 'AI_VOUCHER_REQUIRED');
    }

    const updateResult = await db
      .update(promoCodes)
      .set({ usedCount: sql`${promoCodes.usedCount} + 1` })
      .where(and(
        eq(promoCodes.id, voucher.codeId),
        eq(promoCodes.accessType, 'ai-voucher'),
        eq(promoCodes.active, true),
        or(isNull(promoCodes.expiresAt), gt(promoCodes.expiresAt, now)),
        or(isNull(promoCodes.maxUses), sql`${promoCodes.usedCount} <= ${promoCodes.maxUses}`),
      ));

    const affectedRows = Array.isArray(updateResult)
      ? Number((updateResult[0] as { affectedRows?: number } | undefined)?.affectedRows ?? 0)
      : Number((updateResult as { affectedRows?: number } | undefined)?.affectedRows ?? 0);
    if (affectedRows !== 1) {
      return deny(402, 'That paid AI voucher has no questions left. Local AI is still available.', 'AI_VOUCHER_EXHAUSTED');
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Sodafom-AI-Status', 'paid-voucher');
    res.setHeader('X-Sodafom-AI-Source', 'paid-voucher');
    return true;
  } catch (error) {
    console.error('[paid-ai-guard] voucher check failed:', error instanceof Error ? error.message : String(error));
    return deny(503, 'Paid AI is unavailable until voucher billing can be verified. Please use Local AI.', 'AI_VOUCHER_CHECK_FAILED');
  }
}
