import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { siteReviews } from '@/server/db/schema';

export default async function handler(req: Request, res: Response) {
  try {
    const { authorName, authorRole, stars, body } = req.body as {
      authorName?: string;
      authorRole?: string;
      stars?: number;
      body?: string;
    };

    if (!authorName?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Name and review text are required.' });
    }
    const starsNum = Math.min(5, Math.max(1, Number(stars) || 5));

    await db.insert(siteReviews).values({
      authorName: authorName.trim().slice(0, 128),
      authorRole: (authorRole ?? 'Parent').slice(0, 64),
      stars: starsNum,
      body: body.trim().slice(0, 2000),
      approved: true, // auto-approve; set false here if you want manual moderation
    });

    res.status(201).json({ ok: true, message: 'Thank you for your review!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save review', message: String(err) });
  }
}
