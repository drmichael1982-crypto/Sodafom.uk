// Internal migration endpoint — creates newsletter_subscribers table if it doesn't exist
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ ok: true, message: 'newsletter_subscribers table ready' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
