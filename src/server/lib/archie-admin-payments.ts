import { Router, json, type Request, type Response, type NextFunction } from 'express';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { getPreviewParentSession, type PreviewParentSession } from './archie-parent-auth';
import { requireArchieOwnerSession } from './archie-owner-session';
import type { AdminPaymentSettings, PaymentSettingsDraft } from '../../lib/archie/payment-settings';

type Environment = Record<string, string | undefined>;
type ResolveParent = (request: Request) => Promise<PreviewParentSession | null>;
type SavedDraft = PaymentSettingsDraft & { updatedAt: string | null };
const emptyDraft: SavedDraft = { draftEnabled: false, linkLabel: '', signupUrl: '', updatedAt: null };

export function validatePaymentDraft(value: unknown): PaymentSettingsDraft | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !['draftEnabled', 'linkLabel', 'signupUrl'].includes(key)) ||
    typeof input.draftEnabled !== 'boolean' || typeof input.linkLabel !== 'string' || typeof input.signupUrl !== 'string') return null;
  const linkLabel = input.linkLabel.trim();
  const rawUrl = input.signupUrl.trim();
  if (linkLabel.length > 80 || /[\u0000-\u001f\u007f]/.test(linkLabel) || rawUrl.length > 2048) return null;
  let signupUrl = '';
  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      const hostname = url.hostname.toLowerCase();
      // Store a public HTTPS destination only. Never fetch it or accept credentials.
      if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
        isIP(hostname.replace(/^\[|\]$/g, '')) || !hostname.includes('.') ||
        /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(hostname) ||
        hostname.endsWith('.localhost') || /[\u0000-\u0020\u007f]/.test(rawUrl)) return null;
      signupUrl = url.href;
    } catch { return null; }
  }
  if (input.draftEnabled && (!signupUrl || !linkLabel)) return null;
  return { draftEnabled: input.draftEnabled, linkLabel, signupUrl };
}

export function adminPaymentSettingsPath(env: Environment): string | null {
  const configured = env.ARCHIE_ADMIN_SETTINGS_PATH ||
    (env.ARCHIE_PARENT_SQLITE_PATH ? resolve(dirname(env.ARCHIE_PARENT_SQLITE_PATH), 'payment-settings.json') : '');
  if (!configured || !isAbsolute(configured)) return null;
  const path = resolve(configured);
  if (env.NODE_ENV === 'production') {
    const mount = env.RAILWAY_VOLUME_MOUNT_PATH;
    if (!mount || !isAbsolute(mount)) return null;
    const within = relative(resolve(mount), path);
    if (!within || within.startsWith('..') || isAbsolute(within)) return null;
  }
  return path;
}

export class AdminPaymentSettingsStore {
  constructor(private path: string | null) {}
  async read(): Promise<AdminPaymentSettings> {
    let draft = { ...emptyDraft };
    if (this.path) {
      try {
        const value = JSON.parse(await readFile(this.path, 'utf8'));
        const validated = validatePaymentDraft({ draftEnabled: value.draftEnabled, linkLabel: value.linkLabel, signupUrl: value.signupUrl });
        if (!validated || typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) throw new Error('Invalid saved payment settings');
        draft = { ...validated, updatedAt: value.updatedAt };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    return { ...draft, mode: 'free', collectionEnabled: false, editable: !!this.path,
      message: this.path ? 'Learning is free. This private draft does not activate payments or appear to learners.'
        : 'Learning is free. Configure persistent admin settings storage on the server before saving a draft.' };
  }
  async save(draft: PaymentSettingsDraft): Promise<AdminPaymentSettings> {
    if (!this.path) throw new Error('Persistent settings storage is not configured');
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const temporary = `${this.path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }) + '\n', { mode: 0o600, flag: 'wx' });
      await rename(temporary, this.path);
    } finally { await unlink(temporary).catch(() => undefined); }
    return this.read();
  }
}

export function createAdminPaymentRouter(
  resolveParent: ResolveParent = getPreviewParentSession,
  env: Environment = process.env,
  store = new AdminPaymentSettingsStore(adminPaymentSettingsPath(env)),
) {
  const router = Router();
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(async (req, res, next) => {
    if (await requireArchieOwnerSession(req, res, resolveParent, env)) next();
  });
  router.use(json({ limit: '4kb' }));
  router.get('/', async (_req, res) => {
    try { res.json(await store.read()); }
    catch { res.status(503).json({ error: 'Payment draft storage is unavailable. Learning remains free and payments remain off.' }); }
  });
  router.put('/', async (req, res) => {
    let origin = '';
    try { origin = new URL(env.BETTER_AUTH_URL || '').origin; } catch { /* fail closed */ }
    if (!origin || req.get('origin') !== origin || req.get('sec-fetch-site') === 'cross-site') {
      res.status(403).json({ error: 'Open payment settings on the configured app address.' }); return;
    }
    if (!req.is('application/json')) { res.status(415).json({ error: 'Send a JSON settings form.' }); return; }
    const draft = validatePaymentDraft(req.body);
    if (!draft) {
      res.status(400).json({ error: 'Use a public HTTPS link and a label of up to 80 characters. A prepared draft needs both fields. Payment activation and secret keys are not accepted.' }); return;
    }
    try { res.json(await store.save(draft)); }
    catch { res.status(503).json({ error: 'The payment draft could not be saved. Learning remains free and payments remain off.' }); }
  });
  router.use((error: { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'The payment settings form could not be read. Payments remain off.' });
  });
  return router;
}
