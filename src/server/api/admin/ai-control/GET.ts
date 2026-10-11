import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { getAiControlState } from '../../../lib/ai-control';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(getAiControlState());
  } catch (err) {
    console.error('[admin-ai-control-get] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
