/**
 * POST /api/auth/change-password
 * Changes the authenticated user's password via BetterAuth's built-in handler.
 * Body: { currentPassword: string, newPassword: string }
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorised' });

    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Use BetterAuth's built-in changePassword action
    const result = await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: false },
      headers: req.headers as Record<string, string>,
    });

    if (!result) {
      return res.status(400).json({ error: 'Could not change password. Please check your current password.' });
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // BetterAuth throws with message "Invalid password" when current password is wrong
    if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('incorrect')) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    console.error('[change-password] error:', err);
    res.status(500).json({ error: 'Could not change password' });
  }
}
