import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
    if (!session?.user) return res.status(401).json({ error: 'Sign in to save homework.' });
    const image = typeof req.body?.image === 'string' ? req.body.image : '';
    if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image) || image.length > 6_000_000) {
      return res.status(400).json({ error: 'Please use one clear homework photo under 4 MB.' });
    }
    await db.execute(sql`CREATE TABLE IF NOT EXISTS homework_scans (
      user_id VARCHAR(191) PRIMARY KEY,
      image_data MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await db.execute(sql`INSERT INTO homework_scans (user_id, image_data) VALUES (${session.user.id}, ${image})
      ON DUPLICATE KEY UPDATE image_data = VALUES(image_data), updated_at = CURRENT_TIMESTAMP`);
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[homework-scan/save]', error);
    return res.status(500).json({ error: 'Could not save homework.' });
  }
}
