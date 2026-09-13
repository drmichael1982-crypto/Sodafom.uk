import type { Request, Response } from 'express';
import { familyDate, parseAction } from '@/lib/chores';
import { getChoreParent, verifyChoreParent } from './security';
import { choresStore } from './store';
import { applyChoreAction } from './service';
import { choreFailure } from './transport';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const parentId = await getChoreParent(req);
    const now = new Date();
    const today = familyDate(now);
    const action = parseAction(req.body, today);
    let parentVerified = false;
    if (action.action !== 'complete') {
      await verifyChoreParent(parentId, req.body.parentPassword, now);
      parentVerified = true;
    }
    const result = await applyChoreAction(choresStore, parentId, parentVerified, action, today, now);
    return res.status(action.action === 'create' ? 201 : 200).json({ ...result, success: true, commissionPence: 0 });
  } catch (error) {
    const failure = choreFailure(error);
    if (failure.status === 429) res.setHeader('Retry-After', '900');
    return res.status(failure.status).json({ error: failure.error });
  } finally {
    // Do not retain a submitted password in request objects any longer than necessary.
    if (req.body && typeof req.body === 'object') delete req.body.parentPassword;
  }
}
