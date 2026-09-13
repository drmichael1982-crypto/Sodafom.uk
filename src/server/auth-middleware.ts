/**
 * BetterAuth Express Middleware
 *
 * Single catch-all handler for ALL /api/auth/* requests.
 * BetterAuth routes internally (CSRF, sessions, sign-in, sign-up,
 * OAuth callbacks, token refresh, etc.)
 *
 * Called by the dynamic route files under src/server/api/auth/[action]/.
 */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { toWebRequest, sendWebResponse } from '@/lib/auth/express-adapter';
import { tryClearStaleSession } from '@/lib/auth/session-cookies';

export async function authHandler(req: Request, res: Response) {
  // Stale-session recovery escape hatch (`?clearCookies=1`). A stale
  // `better-auth.session_token` makes `useSession()` resolve to an error/pending
  // state with no thrown error to surface, leaving the app blank; the cookie is
  // HttpOnly so only the server can expire it. Handled before getAuth() so it
  // still works when auth/db is itself unavailable.
  if (tryClearStaleSession(req, res, { preview: process.env.AIRO_PREVIEW === 'true' })) {
    return;
  }

  try {
    const auth = getAuth();
    const webRequest = toWebRequest(req);
    const webResponse = await auth.handler(webRequest);

    // Keep status diagnostics, never response bodies, URLs or account details.
    if (!webResponse.ok && (req.path.includes('sign-in') || req.path.includes('sign-up'))) {
      console.error(JSON.stringify({ event: 'auth.request.failed', status: webResponse.status }));
    }

    await sendWebResponse(webResponse, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('BETTER_AUTH_SECRET')) {
      console.error(JSON.stringify({ event: 'auth.error', reason: 'missing_secret' }));
      res.status(503).json({
        error: 'Sign-in is temporarily unavailable. Please try again later.',
      });
      return;
    }

    if (message.includes('Database not configured') || message.includes('SQLITE') || message.includes('ECONNREFUSED')) {
      console.error(JSON.stringify({ event: 'auth.error', reason: 'database_unavailable' }));
      res.status(503).json({
        error: 'Sign-in is temporarily unavailable. Please try again later.',
      });
      return;
    }

    if (message.includes("doesn't exist") || message.includes('no such table') || message.includes('relation') || message.includes('ER_NO_SUCH_TABLE')) {
      console.error(JSON.stringify({ event: 'auth.error', reason: 'missing_tables' }));
      res.status(503).json({
        error: 'Sign-in is temporarily unavailable. Please try again later.',
      });
      return;
    }

    console.error(JSON.stringify({ event: 'auth.middleware.error' }));
    res.status(500).json({ error: 'Authentication request failed' });
  }
}
