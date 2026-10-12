// @vitest-environment node
import express from 'express';
import { describe, expect, it, vi } from 'vitest';
import { createAdminOverviewRouter } from './archie-admin-overview';

describe('owner account overview', () => {
  it('rejects anonymous and ordinary parents before reading counts, and exposes actual owner counts', async () => {
    const stats = vi.fn(async () => ({ registeredParents: 7, validParentSessions: 3 }));
    const app = express();
    app.use('/api/admin/overview', createAdminOverviewRouter(async req => {
      const testRole = req.get('x-test-role');
      return !testRole ? null : { user: { id: testRole, isAdmin: testRole === 'owner' || testRole === 'different-admin' } };
    }, stats, { ARCHIE_OWNER_USER_ID: 'owner' }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/admin/overview`;
    try {
      expect((await fetch(url)).status).toBe(401);
      expect((await fetch(url, { headers: { 'x-test-role': 'parent' } })).status).toBe(403);
      expect((await fetch(url, { headers: { 'x-test-role': 'different-admin' } })).status).toBe(403);
      expect(stats).not.toHaveBeenCalled();
      const response = await fetch(url, { headers: { 'x-test-role': 'owner' } });
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(await response.json()).toMatchObject({ registeredParents: 7, validParentSessions: 3, mode: 'free', collectionEnabled: false, paymentsConfigured: false });
      expect(stats).toHaveBeenCalledTimes(1);
      stats.mockResolvedValueOnce(null as unknown as { registeredParents: number; validParentSessions: number });
      expect((await fetch(url, { headers: { 'x-test-role': 'owner' } })).status).toBe(503);
    } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
  });
});
