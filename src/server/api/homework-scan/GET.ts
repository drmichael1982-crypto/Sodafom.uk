import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { getAuth } from '@/lib/auth/auth';

async function userId(req: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
  return session?.user?.id ?? null;
}

export default async function handler(req: Request, res: Response) {
  try {
    const id = await userId(req);
    if (!id) return res.status(401).json({ error: 'Sign in to view saved homework.' });
    await db.execute(sql`CREATE TABLE IF NOT EXISTS homework_scans (
      user_id VARCHAR(191) PRIMARY KEY,
      image_data MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    const result = await db.execute(sql`SELECT image_data, updated_at FROM homework_scans WHERE user_id = ${id} LIMIT 1`);
    const rows = result[0] as unknown as { image_data: string; updated_at: string }[];
    return res.json(rows[0] ? { image: rows[0].image_data, updatedAt: rows[0].updated_at } : { image: null });
  } catch (error) {
    console.error('[homework-scan/get]', error);
    return res.status(500).json({ error: 'Could not load saved homework.' });
  }
}
