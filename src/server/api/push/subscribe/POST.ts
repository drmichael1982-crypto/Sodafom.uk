import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const session = await getAuth().api.getSession({ headers: req.headers as Record<string, string> });
    const userId = session?.user?.id ?? null;

    const { subscription, deviceLabel } = req.body as {
      subscription: PushSubscriptionJSON;
      deviceLabel?: string;
    };

    if (!subscription?.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    // Upsert by endpoint — safe to call multiple times
    await db.execute(sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth_key, device_label)
      VALUES (${userId}, ${subscription.endpoint}, ${(subscription.keys as Record<string,string>)?.p256dh ?? ''}, ${(subscription.keys as Record<string,string>)?.auth ?? ''}, ${deviceLabel ?? 'browser'})
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        p256dh = VALUES(p256dh),
        auth_key = VALUES(auth_key),
        device_label = VALUES(device_label),
        updated_at = CURRENT_TIMESTAMP
    `);

    res.json({ ok: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}
