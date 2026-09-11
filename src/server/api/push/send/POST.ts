/**
 * POST /api/push/send
 * Internal endpoint — sends a push notification to a specific user or all subscribers.
 * Protected by admin code.
 */
import type { Request, Response } from 'express';
import webpush from 'web-push';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getOrCreateVapidKeys } from '../../../push-keys.js';
import { getAuth } from '@/lib/auth/auth';
import { isValidAdminCode } from '@/server/lib/admin-access';

interface PushRow {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { code, userId, title, body, url, icon, tag } = req.body as {
      code?: string;
      userId?: string;
      title?: string;
      body?: string;
      url?: string;
      icon?: string;
      tag?: string;
    };
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    // Allow access if user is a signed-in admin or provides a configured admin code.
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && !isValidAdminCode(code)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { publicKey, privateKey } = await getOrCreateVapidKeys();
    webpush.setVapidDetails('mailto:sodafom.uk@gmail.com', publicKey, privateKey);

    // Fetch target subscriptions
    const rows = userId
      ? await db.execute(sql`SELECT endpoint, p256dh, auth_key FROM push_subscriptions WHERE user_id = ${userId}`)
      : await db.execute(sql`SELECT endpoint, p256dh, auth_key FROM push_subscriptions`);

    const subs = (rows[0] as unknown as PushRow[]);
    if (!subs.length) return res.json({ sent: 0, message: 'No subscribers' });

    const payload = JSON.stringify({ title, body, url: url ?? '/', icon: icon ?? '/favicon.ico', tag: tag ?? 'sodafom' });

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            payload
          );
          sent++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            // Subscription expired — clean up
            staleEndpoints.push(sub.endpoint);
          }
          failed++;
        }
      })
    );

    // Remove stale subscriptions
    for (const ep of staleEndpoints) {
      await db.execute(sql`DELETE FROM push_subscriptions WHERE endpoint = ${ep}`).catch(() => {});
    }

    res.json({ sent, failed, staleRemoved: staleEndpoints.length });
  } catch (err) {
    console.error('Push send error:', err);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}
