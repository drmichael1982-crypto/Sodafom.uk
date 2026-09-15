/** POST /api/auth/forgot-password: keep account-existence responses indistinguishable. */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { passwordResetCallback } from '@/lib/auth/account-reliability';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  // Configuration failures affect every account, so it is safe to report unavailability.
  let auth: ReturnType<typeof getAuth>;
  try { auth = getAuth(); }
  catch {
    console.error(JSON.stringify({ event: 'auth.password_reset.unavailable' }));
    return res.status(503).json({ error: 'Password reset is temporarily unavailable. Please try again.' });
  }
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: passwordResetCallback(
          process.env.NODE_ENV === 'development', `${req.protocol}://${req.get('host') || ''}`,
        ),
      },
      headers: new Headers(req.headers as Record<string, string>),
    });
  } catch {
    // Do not reveal whether only a registered address hit a mail/token failure.
    // The UI confirms request acceptance, not guaranteed delivery. Operational
    // delivery failures need a separate, private server-side investigation.
    console.error(JSON.stringify({ event: 'auth.password_reset.delivery_or_processing_failed' }));
  }
  return res.json({ ok: true });
}
