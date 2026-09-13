import type { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { db } from '@/server/db/client';
import { founderChangeRequests } from '@/server/db/schema';
import { hasAdminAccess } from '@/server/admin-auth';
import { createFeatureService } from '@/server/admin-feature-controls/service';
import { featureStore } from '@/server/admin-feature-controls/store';

export default async function handler(req: Request, res: Response) {
  // Public availability exposes only known feature IDs, states and a revision.
  // The existing change-request history remains private.
  if (req.query.view === 'feature-availability' || req.query.view === 'feature-controls') {
    const publicOnly = req.query.view === 'feature-availability';
    const authorised = publicOnly ? false : await hasAdminAccess(req);
    const result = await createFeatureService(featureStore).read(authorised, publicOnly);
    return res.set('Cache-Control', 'no-store').status(result.status).json(result.body);
  }
  if (!(await hasAdminAccess(req))) return res.status(401).json({ error: 'Authorisation required' });
  try {
    const changes = await db.select().from(founderChangeRequests).orderBy(desc(founderChangeRequests.createdAt)).limit(50);
    res.json({ success: true, changes });
  } catch (error) {
    console.error('[founder-changes] list failed', error);
    res.status(500).json({ error: 'Could not load founder change history' });
  }
}
