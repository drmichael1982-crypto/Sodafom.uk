// @vitest-environment node
import express from 'express';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createAdminGameIdeasRouter, GameIdeasStore, gameIdeasPath, validateGameIdea } from './archie-admin-game-ideas';
const input = { title: 'Planet word adventure', subject: 'science' as const, description: 'Build a picture after explaining each planet.' };

describe('bounded persistent owner game ideas', () => {
  it('validates exact draft fields, subject and length without accepting publish instructions', () => {
    expect(validateGameIdea({ ...input, title: '  My game  ' })).toMatchObject({ title: 'My game' });
    for (const bad of [null, [], { ...input, publish: true }, { ...input, subject: 'billing' }, { ...input, title: '' }, { ...input, title: 'x'.repeat(81) }, { ...input, description: 'x'.repeat(1501) }]) expect(validateGameIdea(bad)).toBeNull();
  });
  it('requires absolute persistent paths under the production volume', () => {
    expect(gameIdeasPath({ ARCHIE_ADMIN_GAME_IDEAS_PATH: 'relative.json' })).toBeNull();
    expect(gameIdeasPath({ ARCHIE_PARENT_SQLITE_PATH: '/data/accounts.sqlite' })).toBe('/data/game-ideas.json');
    expect(gameIdeasPath({ NODE_ENV: 'production', ARCHIE_PARENT_SQLITE_PATH: '/data/accounts.sqlite' })).toBeNull();
    expect(gameIdeasPath({ NODE_ENV: 'production', RAILWAY_VOLUME_MOUNT_PATH: '/data', ARCHIE_ADMIN_GAME_IDEAS_PATH: '/data/../tmp/ideas.json' })).toBeNull();
  });
  it('persists concurrent additions, sets private permissions and refuses full or corrupt storage', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'archie-ideas-'));
    const path = join(folder, 'ideas.json');
    try {
      const store = new GameIdeasStore(path);
      expect(await store.read()).toEqual({ ideas: [], editable: true });
      await Promise.all([store.add(input), store.add({ ...input, title: 'Second idea' })]);
      const saved = await new GameIdeasStore(path).read();
      expect(saved.ideas.map(idea => idea.title)).toEqual(['Second idea', input.title]);
      expect((await stat(path)).mode & 0o777).toBe(0o600);
      const full = Array.from({ length: 100 }, () => ({ ...input, id: randomUUID(), createdAt: new Date().toISOString() }));
      await writeFile(path, JSON.stringify(full));
      await expect(store.add(input)).rejects.toThrow('IDEAS_FULL');
      expect(JSON.parse(await readFile(path, 'utf8'))).toHaveLength(100);
      await writeFile(path, '{broken');
      await expect(store.add(input)).rejects.toThrow();
      expect(await readFile(path, 'utf8')).toBe('{broken');
      expect(await new GameIdeasStore(null).read()).toEqual({ ideas: [], editable: false });
    } finally { await rm(folder, { recursive: true, force: true }); }
  });
  it('denies other accounts and wrong origins, accepts owner drafts and reports invalid requests', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'archie-ideas-api-'));
    const app = express();
    const env = { ARCHIE_OWNER_USER_ID: 'owner', BETTER_AUTH_URL: 'https://app.example.test', ARCHIE_ADMIN_GAME_IDEAS_PATH: join(folder, 'ideas.json') };
    app.use('/api/admin/game-ideas', createAdminGameIdeasRouter(async req => {
      const id = req.get('x-test-account'); return id ? { user: { id, isAdmin: true } } : null;
    }, env));
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/admin/game-ideas`;
    const put = (body: unknown, origin = env.BETTER_AUTH_URL, extra = {}) => fetch(url, { method: 'PUT', headers: { 'x-test-account': 'owner', 'content-type': 'application/json', origin, ...extra }, body: JSON.stringify(body) });
    try {
      expect((await fetch(url)).status).toBe(401);
      expect((await fetch(url, { headers: { 'x-test-account': 'other' } })).status).toBe(403);
      expect((await put(input, 'https://attacker.example.test')).status).toBe(403);
      expect((await put(input, env.BETTER_AUTH_URL, { 'sec-fetch-site': 'cross-site' })).status).toBe(403);
      expect((await put({ ...input, publish: true })).status).toBe(400);
      const added = await put(input); expect(added.status).toBe(200);
      expect(added.headers.get('cache-control')).toBe('no-store');
      const body = await added.json(); expect(body.ideas).toHaveLength(1); expect(body.editable).toBe(true);
      expect(body.ideas[0]).toMatchObject(input);
      const listed = await fetch(url, { headers: { 'x-test-account': 'owner' } });
      expect(await listed.json()).toEqual(body);
      expect((await put({ ...input, description: 'x'.repeat(9000) })).status).toBe(413);
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      await rm(folder, { recursive: true, force: true });
    }
  });
});
