/**
 * GET /api/subscription
 * Returns the current user's subscription status.
 * Returns { subscribed: false } for unauthenticated or free users.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '@/server/db/client';
import { subscriptions } from '@/server/db/schema';
import { eq, and, or, isNull, gt } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });

    if (!session?.user?.id) {
      res.json({ subscribed: false });
      return;
    }

    const now = new Date();

    const activeSub = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user.id),
          eq(subscriptions.status, 'active'),
          or(
            isNull(subscriptions.expiresAt),
            gt(subscriptions.expiresAt, now)
          )
        )
      )
      .limit(1);

    if (activeSub.length > 0) {
      res.json({
        subscribed: true,
        plan: activeSub[0].plan,
        activatedAt: activeSub[0].activatedAt,
        expiresAt: activeSub[0].expiresAt,
      });
    } else {
      res.json({ subscribed: false });
    }
  } catch (error) {
    console.error('GET /api/subscription error:', error);
    res.status(500).json({ subscribed: false, error: 'Failed to check subscription' });
  }
}
