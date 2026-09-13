/**
 * Existing internal push endpoint: the admin authorization is unchanged.
 * Only a targeted, due parent-approved reminder may be sent. Never broadcast
 * arbitrary copy. Shares its atomic ledger with in-app reminders.
 * A background scheduler is NOT installed or enabled by this change.
 */
import type { Request, Response } from 'express';
import webpush from 'web-push';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { getOrCreateVapidKeys } from '../../../push-keys.js';
import { hasAdminAccess } from '@/server/admin-auth';
import { claimReminder } from '../../../notifications/reminder-store';
interface PushRow { endpoint: string; p256dh: string; auth_key: string }
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!(await hasAdminAccess(req))) return res.status(403).json({ error: 'Forbidden' });
    const userId = req.body?.userId;
    if (typeof userId !== 'string' || !userId || userId.length > 191) {
      return res.status(400).json({ error: 'A target parent account is required; broadcasts are disabled.' });
    }
    const rows = await db.execute(sql`
      SELECT endpoint, p256dh, auth_key FROM push_subscriptions
      WHERE user_id = ${userId} AND EXISTS (SELECT 1 FROM children WHERE parent_id = ${userId})
      ORDER BY updated_at DESC, endpoint LIMIT 1
    `);
    const sub = (rows[0] as PushRow[] | undefined)?.[0];
    if (!sub) return res.json({ sent: 0 });
    // Validate legacy stored endpoints too, not only newly registered devices.
    const endpoint = new URL(sub.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.port || endpoint.hash ||
        !(['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(endpoint.hostname) || endpoint.hostname.endsWith('.notify.windows.com'))) {
      return res.json({ sent: 0, reason: 'Unsupported push provider' });
    }
    const keys = await getOrCreateVapidKeys();
    webpush.setVapidDetails('mailto:sodafom.uk@gmail.com', keys.publicKey, keys.privateKey);
    const notification = await claimReminder(userId, new Date());
    if (!notification) return res.json({ sent: 0, reason: 'Not due or disabled by parent settings' });
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } }, JSON.stringify({
        title: 'A gentle Sodafom reminder', body: notification.message,
        url: '/hub/notifications', tag: 'sodafom-parent-reminder',
        icon: '/favicon.ico', silent: true, renotify: false, requireInteraction: false,
      }), { TTL: 60, urgency: 'low' });
      return res.json({ sent: 1 });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.execute(sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint} AND user_id = ${userId}`);
      // Never retry a failed send: a missed reminder is preferable to spam.
      return res.json({ sent: 0, failed: 1 });
    }
  } catch {
    return res.status(503).json({ error: 'Reminder delivery is unavailable.' });
  }
}
