import { Router, json, type Request, type Response, type NextFunction } from 'express';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { getPreviewParentSession, type PreviewParentSession } from './archie-parent-auth';
import { requireArchieOwnerSession } from './archie-owner-session';

type Environment = Record<string, string | undefined>;
const subjects = ['maths', 'spelling', 'reading', 'science', 'art'] as const;
export type GameIdeaInput = { title: string; subject: typeof subjects[number]; description: string };
export type GameIdea = GameIdeaInput & { id: string; createdAt: string };
const MAX_IDEAS = 100;

export function validateGameIdea(value: unknown): GameIdeaInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !['title', 'subject', 'description'].includes(key)) ||
    typeof input.title !== 'string' || typeof input.description !== 'string' ||
    !subjects.includes(input.subject as typeof subjects[number])) return null;
  const title = input.title.trim(), description = input.description.trim();
  if (!title || title.length > 80 || !description || description.length > 1500 ||
    /[\u0000-\u001f\u007f]/.test(title) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(description)) return null;
  return { title, subject: input.subject as typeof subjects[number], description };
}

export function gameIdeasPath(env: Environment): string | null {
  const configured = env.ARCHIE_ADMIN_GAME_IDEAS_PATH ||
    (env.ARCHIE_PARENT_SQLITE_PATH ? resolve(dirname(env.ARCHIE_PARENT_SQLITE_PATH), 'game-ideas.json') : '');
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

export class GameIdeasStore {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private path: string | null) {}
  async read(): Promise<{ ideas: GameIdea[]; editable: boolean }> {
    if (!this.path) return { ideas: [], editable: false };
    let ideas: GameIdea[] = [];
    try {
      const content = await readFile(this.path, 'utf8');
      if (content.length > 1_000_000) throw new Error('Idea storage exceeded its bound');
      const value: unknown = JSON.parse(content);
      if (!Array.isArray(value) || value.length > MAX_IDEAS) throw new Error('Invalid idea storage');
      const ids = new Set<string>();
      ideas = value.map(item => {
        const input = validateGameIdea({ title: item?.title, subject: item?.subject, description: item?.description });
        if (!input || typeof item.id !== 'string' || !/^[0-9a-f-]{36}$/.test(item.id) || ids.has(item.id) ||
          typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt))) throw new Error('Invalid idea storage');
        ids.add(item.id);
        return { ...input, id: item.id, createdAt: item.createdAt };
      });
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    return { ideas, editable: true };
  }
  add(input: GameIdeaInput) {
    const save = async () => {
      if (!this.path) throw new Error('Persistent idea storage is not configured');
      const { ideas } = await this.read();
      if (ideas.length >= MAX_IDEAS) throw new Error('IDEAS_FULL');
      const next = [{ ...input, id: randomUUID(), createdAt: new Date().toISOString() }, ...ideas];
      await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
      const temporary = `${this.path}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, JSON.stringify(next) + '\n', { mode: 0o600, flag: 'wx' });
        await rename(temporary, this.path);
      } finally { await unlink(temporary).catch(() => undefined); }
      return { ideas: next, editable: true };
    };
    const pending = this.queue.then(save, save);
    this.queue = pending.catch(() => undefined);
    return pending;
  }
}

export function createAdminGameIdeasRouter(
  resolveParent: (req: Request) => Promise<PreviewParentSession | null> = getPreviewParentSession,
  env: Environment = process.env,
  store = new GameIdeasStore(gameIdeasPath(env)),
) {
  const router = Router();
  router.use(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (await requireArchieOwnerSession(req, res, resolveParent, env)) next();
  });
  router.use(json({ limit: '8kb' }));
  router.get('/', async (_req, res) => {
    try { res.json(await store.read()); } catch { res.status(503).json({ error: 'Saved game ideas are unavailable.' }); }
  });
  router.put('/', async (req, res) => {
    let origin = '';
    try { origin = new URL(env.BETTER_AUTH_URL || '').origin; } catch { /* explicit origin required */ }
    if (!origin || req.get('origin') !== origin || req.get('sec-fetch-site') === 'cross-site') {
      res.status(403).json({ error: 'Open the owner dashboard on the configured app address.' }); return;
    }
    if (!req.is('application/json')) { res.status(415).json({ error: 'Send a JSON game idea form.' }); return; }
    const input = validateGameIdea(req.body);
    if (!input) { res.status(400).json({ error: 'Use a title of 1â€“80 characters, a supported subject and a description of 1â€“1500 characters.' }); return; }
    try { res.json(await store.add(input)); }
    catch (error) {
      res.status((error as Error).message === 'IDEAS_FULL' ? 409 : 503).json({ error: (error as Error).message === 'IDEAS_FULL' ? 'The 100 saved idea limit has been reached.' : 'The game idea could not be saved.' });
    }
  });
  router.use((error: { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'The game idea form could not be read.' });
  });
  return router;
}
×M:ã