import { ChoreError } from '@/lib/chores';
interface ChoreRequest {
  method: string; protocol: string;
  get(name: string): string | undefined;
}
/** Chores-only CSRF protection, including reads because the host has permissive legacy CORS. */
export function assertChoreRequest(req: ChoreRequest) {
  // Reuse an already CORS-allowed header; no change to shared server middleware.
  if (req.get('X-Requested-With') !== 'SodafomChores') throw new ChoreError(403, 'Open chores in the Sodafom app.');
  if (req.method === 'POST' && req.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ChoreError(415, 'Chores requires a JSON request.');
  const origin = req.get('Origin');
  if (!origin) {
    if (req.get('Sec-Fetch-Site') === 'cross-site') throw new ChoreError(403, 'This site cannot access family chores.');
    return;
  }
  const trusted = new Set(['https://sodafom.uk', 'https://www.sodafom.uk', 'https://app.sodafom.uk', 'http://localhost', 'https://localhost', 'capacitor://localhost']);
  if (trusted.has(origin)) return;
  const sameOrigin = `${req.protocol}://${req.get('Host')}`;
  if (origin === sameOrigin && (req.protocol === 'https' || req.protocol === 'http')) return;
  if (process.env.NODE_ENV !== 'production') {
    try { const url = new URL(origin); if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return; } catch { /* Reject malformed origin. */ }
  }
  throw new ChoreError(403, 'This site cannot access family chores.');
}
export function choreFailure(error: unknown): { status: number; error: string } {
  if (error instanceof ChoreError) return { status: error.status, error: error.message };
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'ER_DUP_ENTRY' || code === 'ER_LOCK_DEADLOCK' || code === 'ER_LOCK_WAIT_TIMEOUT') return { status: 409, error: 'Another update has just happened. Refresh chores and try again.' };
  if (code === 'ER_BAD_FIELD_ERROR' || code === 'ER_NO_SUCH_TABLE') return { status: 503, error: 'The chores upgrade is not ready on this server. No reward has been added.' };
  return { status: 503, error: 'Chores is temporarily unavailable. Refresh to check the latest saved status before trying again.' };
}
