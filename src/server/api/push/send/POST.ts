/**
 * Push delivery is deliberately fail-closed.
 *
 * Agent 23's recovery provides only local reminder-policy contracts. A real
 * delivery rollout needs a signed-parent consent flow, provider review and
 * device/browser validation before this endpoint can be enabled.
 */
import type { Request, Response } from 'express';

const DELIVERY_DISABLED = 'Push notification delivery is disabled pending a parent-consented device rollout.';

export default async function handler(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({ error: DELIVERY_DISABLED });
}
