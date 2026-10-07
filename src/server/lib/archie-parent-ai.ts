import { Router, json, type Request, type Response } from 'express';
import { getPreviewParentSession } from './archie-parent-auth';

type ParentSession = { user: { id: string } } | null;
type ResolveParent = (request: Request) => Promise<ParentSession>;
const KEY_LIFETIME = 30 * 60 * 1000;

/** Secrets stay in server memory only. Neither status nor errors return a key. */
export class ParentAIKeyStore {
  private keys = new Map<string, { key: string; expires: number; timer: ReturnType<typeof setTimeout> | null }>();
  constructor(private now: () => number = Date.now) {}
  set(parentId: string, key: string) {
    if (!/^sk-[A-Za-z0-9_-]{16,2040}$/.test(key)) return false;
    this.prune();
    if (!this.keys.has(parentId) && this.keys.size >= 1000) return false;
    this.remove(parentId);
    const value = { key, expires: this.now() + KEY_LIFETIME, timer: null as ReturnType<typeof setTimeout> | null };
    this.keys.set(parentId, value);
    value.timer = setTimeout(() => {
      // A queued callback from an earlier connection must never delete its replacement.
      if (this.keys.get(parentId) === value) this.remove(parentId);
    }, KEY_LIFETIME);
    // Retention cleanup must not keep an otherwise idle server process alive.
    if (typeof value.timer === 'object' && 'unref' in value.timer) value.timer.unref();
    return true;
  }
  remove(parentId: string) {
    const value = this.keys.get(parentId);
    if (value?.timer !== null && value?.timer !== undefined) clearTimeout(value.timer);
    this.keys.delete(parentId);
  }
  private prune() { for (const [id, value] of this.keys) if (value.expires <= this.now()) this.remove(id); }
  status(parentId: string) {
    this.prune();
    const value = this.keys.get(parentId);
    return { connected: Boolean(value), provider: value ? 'openai' : 'builtin', expiresAt: value?.expires ?? null, verified: false };
  }
  env(parentId: string, base: NodeJS.ProcessEnv): NodeJS.ProcessEnv | null {
    this.prune();
    const value = this.keys.get(parentId);
    if (!value) return null;
    return { ...base, OPENAI_API_KEY: value.key, ARCHIE_CLOUD_PROVIDER: 'openai', ARCHIE_OLLAMA_URL: undefined, LOCAL_AI_MODEL: undefined };
  }
}
const store = new ParentAIKeyStore();

export async function getParentAIEnv(request: Request): Promise<NodeJS.ProcessEnv | null> {
  const session = await getPreviewParentSession(request);
  return session ? store.env(session.user.id, process.env) : null;
}

export function createParentAIRouter(resolveParent: ResolveParent, keys = store) {
  const router = Router();
  router.use(json({ limit: '4kb' }));
  const requests = new Map<string, { count: number; reset: number }>();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  async function parent(req: Request, res: Response, mutate = false) {
    if (mutate) {
      // The public origin is explicitly configured; never trust a caller's Host.
      let expected = '';
      try { expected = new URL(process.env.BETTER_AUTH_URL || '').origin; } catch { /* no configured origin */ }
      if (!expected || req.get('origin') !== expected) {
        res.status(403).json({ error: 'Open the parent hub on the configured app address.' }); return null;
      }
      if (!req.is('application/json')) { res.status(415).json({ error: 'Send a JSON request.' }); return null; }
    }
    const session = await resolveParent(req);
    if (!session) { res.status(401).json({ error: 'Sign in to a real parent account first.', connected: false }); return null; }
    if (mutate) {
      const now = Date.now();
      for (const [id, window] of requests) if (window.reset <= now) requests.delete(id);
      const window = requests.get(session.user.id) ?? { count: 0, reset: now + 60_000 };
      if (window.count >= 8) { res.status(429).json({ error: 'Wait a minute before changing your AI setup again.' }); return null; }
      window.count++; requests.set(session.user.id, window);
    }
    return session.user.id;
  }
  router.get('/status', async (req, res) => {
    try { const id = await parent(req, res); if (id) res.json(keys.status(id)); }
    catch { res.status(503).json({ error: 'Parent account service is unavailable.', connected: false }); }
  });
  router.post('/connect', async (req, res) => {
    try {
      const id = await parent(req, res, true); if (!id) return;
      if (typeof req.body?.key !== 'string' || !keys.set(id, req.body.key.trim())) {
        res.status(400).json({ error: 'Enter a valid OpenAI API key. Do not include anything else.' }); return;
      }
      res.json({ ...keys.status(id), message: 'Key held on the server for up to 30 minutes. Provider access has not been tested; built-in help remains available.' });
    } catch { res.status(503).json({ error: 'AI setup is unavailable. Your key was not returned or saved in this browser.' }); }
  });
  router.post('/disconnect', async (req, res) => {
    try { const id = await parent(req, res, true); if (id) { keys.remove(id); res.json(keys.status(id)); } }
    catch { res.status(503).json({ error: 'Parent account service is unavailable.' }); }
  });
  return router;
}
