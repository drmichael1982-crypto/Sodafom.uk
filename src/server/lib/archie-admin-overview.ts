import { Router, type Request } from 'express';
import { getPreviewParentSession, getPreviewParentStats, requirePreviewParentSession, type PreviewParentSession } from './archie-parent-auth';

export function createAdminOverviewRouter(
  resolveParent: (req: Request) => Promise<PreviewParentSession | null> = getPreviewParentSession,
  readStats: () => Promise<{ registeredParents: number; validParentSessions: number } | null> = getPreviewParentStats,
) {
  const router = Router();
  router.get('/', async (req, res) => {
    try {
      const session = await requirePreviewParentSession(req, res, resolveParent);
      if (!session) return;
      if (session.user.isAdmin !== true) { res.status(403).json({ error: 'Only the server-authorized owner can view account counts.' }); return; }
      const stats = await readStats();
      if (!stats) { res.status(503).json({ error: 'Account counts are unavailable. No usage or revenue estimate has been substituted.' }); return; }
      res.json({ ...stats, mode: 'free', collectionEnabled: false, paymentsConfigured: false, generatedAt: new Date().toISOString() });
    } catch { res.status(503).json({ error: 'Owner account overview is unavailable.' }); }
  });
  return router;
}
