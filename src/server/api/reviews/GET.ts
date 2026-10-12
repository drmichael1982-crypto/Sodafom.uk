import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { siteReviews } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function handler(_req: Request, res: Response) {
  try {
    const reviews = await db
      .select()
      .from(siteReviews)
      .where(eq(siteReviews.approved, true))
      .orderBy(desc(siteReviews.createdAt));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: String(err) });
  }
}
