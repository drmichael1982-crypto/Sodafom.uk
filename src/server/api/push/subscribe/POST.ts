import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { reminderParentId } from '../../../notifications/reminder-api';
import { readReminderPreferences, reserveReminderPasswordAttempt } from '../../../notifications/reminder-store';
import { requireReminderWrite, ReminderHttpError } from '../../../notifications/reminder-handlers';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const userId = await reminderParentId(req);
    requireReminderWrite(req);
    const { subscription, password } = req.body ?? {};
    if (typeof password !== 'string' || !password || password.length > 1024) {
      return res.status(400).json({ error: 'Confirm the parent password to enable a device.' });
    }
    if (!await reserveReminderPasswordAttempt(userId, Date.now())) return res.status(429).json({ error: 'Please wait ten minutes before trying again.' });
    let verified = false;
    try {
      const result = await getAuth().api.verifyPassword({ body: { password }, headers: new Headers(req.headers as Record<string, string>) });
      verified = result?.status === true;
    } catch { /* No credentials or provider errors in logs. */ }
    if (!verified) return res.status(403).json({ error: 'Parent password could not be confirmed.' });
    const preferences = await readReminderPreferences(userId);
    if (!Object.values(preferences.rules).some(rule => rule.enabled)) return res.status(409).json({ error: 'Save your parent reminder choices first.' });
    if (typeof subscription?.endpoint !== 'string' || subscription.endpoint.length > 2048 ||
        typeof subscription?.keys?.p256dh !== 'string' || !/^[A-Za-z0-9_-]{80,100}={0,2}$/.test(subscription.keys.p256dh) ||
        typeof subscription?.keys?.auth !== 'string' || !/^[A-Za-z0-9_-]{20,30}={0,2}$/.test(subscription.keys.auth)) {
      return res.status(400).json({ error: 'Invalid notification subscription.' });
    }
    let endpoint: URL;
    try { endpoint = new URL(subscription.endpoint); } catch { return res.status(400).json({ error: 'Invalid notification endpoint.' }); }
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.port || endpoint.hash) {
      return res.status(400).json({ error: 'Invalid notification endpoint.' });
    }
    // Notifications never contact arbitrary hosts supplied by a browser.
    const hosts = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
    if (!hosts.includes(endpoint.hostname) && !endpoint.hostname.endsWith('.notify.windows.com')) {
      return res.status(400).json({ error: 'This push provider is not supported.' });
    }
    // Do not reassign an endpoint owned by another account on a shared browser.
    const existing = await db.execute(sql`SELECT user_id FROM push_subscriptions WHERE endpoint = ${endpoint.href} LIMIT 1`);
    if (!Array.isArray(existing) || !Array.isArray(existing[0])) throw new Error('Subscription store unavailable');
    if (existing[0].length && existing[0][0].user_id !== userId) return res.status(409).json({ error: 'Remove the existing device subscription before changing accounts.' });
    const saved = await db.execute(sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth_key, device_label)
      VALUES (${userId}, ${endpoint.href}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, 'parent browser')
      ON DUPLICATE KEY UPDATE
        p256dh = IF(user_id = VALUES(user_id), VALUES(p256dh), p256dh),
        auth_key = IF(user_id = VALUES(user_id), VALUES(auth_key), auth_key)
    `);
    if (!Array.isArray(saved) || typeof saved[0]?.affectedRows !== 'number') throw new Error('Subscription not saved');
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof ReminderHttpError) return res.status(error.status).json({ error: error.message });
    res.status(503).json({ error: 'Could not save this device subscription.' });
  }
}
