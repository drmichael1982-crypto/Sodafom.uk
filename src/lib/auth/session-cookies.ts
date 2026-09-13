/** Clear only authentication cookies on this device; do not erase learning data. */
const EXPIRY = 'Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly';
interface ClearCookieOptions {
  preview: boolean;
  /** Default preserves existing HTTPS callers; local HTTP callers may opt out. */
  secure?: boolean;
}

export function buildClearCookieHeaders(cookieHeader: string | undefined, options: ClearCookieOptions): string[] {
  if (!cookieHeader) return [];
  const names = [...new Set(cookieHeader.split(';').map(part => part.trim().split('=')[0].trim()))];
  return names.filter(name => /^(?:(?:__Secure-|__Host-)?better-auth\.[A-Za-z0-9._-]+|sodafom_founder_session)$/.test(name)).map(name => {
    const secure = options.secure !== false || name.startsWith('__Secure-') || name.startsWith('__Host-');
    // Founder cookies are not partitioned, even when BetterAuth preview cookies are.
    const attributes = name === 'sodafom_founder_session'
      ? `${EXPIRY}; SameSite=Strict${secure ? '; Secure' : ''}`
      : options.preview ? `${EXPIRY}; SameSite=None; Secure; Partitioned`
      : `${EXPIRY}; SameSite=Lax${secure ? '; Secure' : ''}`;
    return `${name}=; ${attributes}`;
  });
}

interface ClearSessionRequest {
  query: Record<string, unknown>;
  headers: { cookie?: string };
}
interface ClearSessionResponse {
  setHeader(name: string, value: string | readonly string[]): unknown;
  status(code: number): { json(body: unknown): unknown };
}

export function tryClearStaleSession(req: ClearSessionRequest, res: ClearSessionResponse, options: ClearCookieOptions): boolean {
  if (req.query.clearCookies !== '1') return false;
  res.setHeader('Cache-Control', 'no-store');
  const cleared = buildClearCookieHeaders(req.headers.cookie, options);
  if (cleared.length) res.setHeader('set-cookie', cleared);
  res.status(200).json({ cleared: true });
  return true;
}
