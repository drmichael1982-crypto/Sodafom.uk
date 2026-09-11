import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { updateAiControlState } from '../../../lib/ai-control';

const allowedKeys = ['masterEnabled','localAiEnabled','openAiEnabled','schoolAiEnabled','homeAiEnabled'] as const;

type AllowedKey = typeof allowedKeys[number];

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: new Headers(req.headers as any) });
    if (!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const patch: Partial<Record<AllowedKey, boolean>> = {};
    for (const key of allowedKeys) {
      if (typeof req.body?.[key] === 'boolean') patch[key] = req.body[key];
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No valid AI control fields supplied' });
    }

    return res.json(updateAiControlState(patch));
  } catch (err) {
    console.error('[admin-ai-control-post] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
