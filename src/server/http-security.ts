import type { NextFunction, Request, Response } from 'express';
import { isTrustedOrigin } from '../lib/auth/trusted-origins';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
const AREAS = new Set(['auth', 'admin', 'parent', 'children', 'teacher']);

/** Fixed labels only: URLs can contain reset tokens, names and identifiers. */
export function requestMetadata(req: Request): { method: string; area: string } {
  const segments = req.path.split('/');
  const area = segments[1] === 'api'
    ? (AREAS.has(segments[2]) ? segments[2] : 'api')
    : 'page';
  return { method: METHODS.has(req.method) ? req.method : 'OTHER', area };
}

/**
 * Applies baseline response privacy and strict credentialed-origin controls.
 * Headerless signed webhook/native requests are preserved; browser writes that
 * identify themselves as cross- or same-site must include a trusted Origin.
 */
export function httpSecurity(req: Request, res: Response, next: NextFunction) {
  const api = req.path === '/api' || req.path.startsWith('/api/');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self)');
  if (api) res.setHeader('Cache-Control', 'private, no-store');
  res.vary('Origin');

  const origin = req.headers.origin;
  if (origin !== undefined) {
    if (!isTrustedOrigin(origin)) {
      if (api) return res.status(403).json({ error: 'Origin not permitted' });
      return next();
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Origin, Range, Cache-Control, Pragma, X-Capacitor-Http, Accept-Encoding, X-Accel-Buffering, User-Agent');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, X-Accel-Buffering, Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  } else if (
    api
    && !SAFE_METHODS.has(req.method)
    && ['cross-site', 'same-site'].includes(String(req.headers['sec-fetch-site'] || ''))
  ) {
    return res.status(403).json({ error: 'Origin required' });
  }

  if (api && req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

export function apiErrorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  console.error('ssr.api.error', requestMetadata(req));
  if (res.headersSent) return next(new Error('API response failed'));

  const type = (error as { type?: unknown } | null)?.type;
  const status = type === 'entity.too.large' ? 413 : type === 'entity.parse.failed' ? 400 : 500;
  const message = status === 413
    ? 'Request too large'
    : status === 400
      ? 'Invalid request body'
      : 'Internal server error';
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(status).json({ error: message });
}
