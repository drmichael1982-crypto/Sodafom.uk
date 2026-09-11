import type { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { founderChangeRequests } from '@/server/db/schema';
import { hasAdminAccess } from '@/server/admin-auth';

export default async function handler(req: Request, res: Response) {
  if (!(await hasAdminAccess(req))) return res.status(401).json({ error: 'Authorisation required' });
  try {
    const changes = await db.select().from(founderChangeRequests).orderBy(desc(founderChangeRequests.createdAt)).limit(50);
    res.json({ success: true, changes });
  } catch (error) {
    console.error('[founder-changes] list failed', error);
    res.status(500).json({ error: 'Could not load founder change history' });
  }
}
