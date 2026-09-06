import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { endpoint } = req.body as { endpoint: string };
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

    await db.execute(sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
}
