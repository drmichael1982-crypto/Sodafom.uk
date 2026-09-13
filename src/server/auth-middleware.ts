/** BetterAuth catch-all. Never log request bodies, cookies, tokens or raw provider errors. */
import type { Request, Response } from 'express';
import { getAuth } from '@/lib/auth/auth';
import { toWebRequest, sendWebResponse } from '@/lib/auth/express-adapter';
import { tryClearStaleSession } from '@/lib/auth/session-cookies';

export async function authHandler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (tryClearStaleSession(req, res, { preview: process.env.AIRO_PREVIEW === 'true', secure: req.secure || process.env.NODE_ENV === 'production' })) return;
  try {
    const auth = getAuth();
    let webResponse = await auth.handler(toWebRequest(req));
    if (req.method === 'POST' && req.path.replace(/\/+$/, '').endsWith('/sign-out') && webResponse.ok) {
      // BetterAuth does not own the separate founder cookie. Clear it as part of
      // successful logout without replacing BetterAuth's own Set-Cookie headers.
      const headers = new Headers(webResponse.headers);
      headers.append('set-cookie', 'sodafom_founder_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict' + (process.env.NODE_ENV === 'production' ? '; Secure' : ''));
      webResponse = new globalThis.Response(webResponse.body, {
        status: webResponse.status, statusText: webResponse.statusText, headers,
      });
    }
    if (!webResponse.ok) console.warn(JSON.stringify({ event: 'auth.request.rejected', status: webResponse.status }));
    await sendWebResponse(webResponse, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const unavailable = /BETTER_AUTH_SECRET|Database not configured|SQLITE|ECONNREFUSED|ER_NO_SUCH_TABLE|no such table|doesn't exist/.test(message);
    console.error(JSON.stringify({ event: 'auth.request.failed', reason: unavailable ? 'unavailable' : 'request_failed' }));
    res.status(unavailable ? 503 : 500).json({ error: 'Authentication is temporarily unavailable. Please try again.' });
  }
}
