import type { Request, Response } from 'express';
import { getOrCreateVapidKeys } from '../../../push-keys.js';

export default async function handler(_req: Request, res: Response) {
  try {
    const { publicKey } = await getOrCreateVapidKeys();
    res.json({ publicKey });
  } catch (err) {
    console.error('VAPID public key error:', err);
    res.status(500).json({ error: 'Failed to get VAPID key' });
  }
}
