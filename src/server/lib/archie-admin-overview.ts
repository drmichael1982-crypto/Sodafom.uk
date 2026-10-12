import { Router, type Request } from 'express';
import { getPreviewParentSession, getPreviewParentStats, type PreviewParentSession } from './archie-parent-auth';
import { requireArchieOwnerSession } from './archie-owner-session';

type Environment = Record<string, string | undefined>;

export function createAdminOverviewRouter(
  resolveParent: (req: Request) => Promise<PreviewParentSession | null> = getPreviewParentSession,
  readStats: () => Promise<{ registeredParents: number; validParentSessions: number } | null> = getPreviewParentStats,
  env: Environment = process.env,
) {
  const router = Router();
  router.get('/', async (req, res) => {
    try {
      if (!await requireArchieOwnerSession(req, res, resolveParent, env)) return;
      const stats = await readStats();
      if (!stats) { res.status(503).json({ error: 'Account counts are unavailable. No usage or revenue estimate has been substituted.' }); return; }
      res.json({ ...stats, mode: 'free', collectionEnabled: false, paymentsConfigured: false, generatedAt: new Date().toISOString() });
    } catch { res.status(503).json({ error: 'Owner account overview is unavailable.' }); }
  });
  return router;
}
