/**
 * POST /api/track/pageview
 * Lightweight page-view counter. Called from the client on each navigation.
 * Upserts a row per (path, date) — increments hits each call.
 * No auth required — public endpoint.
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const body = req.body as { path?: string } | undefined;
    const { path } = body ?? {};
    if (!path || typeof path !== 'string' || path.length > 255) {
      res.status(400).json({ ok: false });
      return;
    }

    // Sanitise — keep only the pathname, strip query/hash
    const safePath = path.split('?')[0].split('#')[0].slice(0, 255) || '/';
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Try to create the table if it doesn't exist yet (safe no-op if it does)
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS page_views (
          id INT PRIMARY KEY AUTO_INCREMENT,
          path VARCHAR(255) NOT NULL,
          view_date DATE NOT NULL,
          hits INT NOT NULL DEFAULT 1,
          unique_hits INT NOT NULL DEFAULT 1,
          UNIQUE KEY uq_path_date (path, view_date)
        )
      `);
    } catch {
      // table already exists — ignore
    }

    // Upsert: increment hits on duplicate (path, view_date)
    await db.execute(sql`
      INSERT INTO page_views (path, view_date, hits, unique_hits)
      VALUES (${safePath}, ${today}, 1, 1)
      ON DUPLICATE KEY UPDATE hits = hits + 1
    `);

    res.json({ ok: true });
  } catch (err) {
    // Never fail the client — tracking is best-effort
    console.error('[pageview] error:', err);
    res.json({ ok: false });
  }
}
