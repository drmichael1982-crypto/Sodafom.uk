/**
 * Device subscriptions are deliberately fail-closed with delivery.
 *
 * No endpoint, device label, account identifier or browser subscription is
 * persisted until a separately approved parent-consent delivery workflow is
 * implemented and tested on real devices.
 */
import type { Request, Response } from 'express';

const SUBSCRIPTIONS_DISABLED = 'Push notification setup is disabled pending a parent-consented device rollout.';

export default async function handler(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({ error: SUBSCRIPTIONS_DISABLED });
}
