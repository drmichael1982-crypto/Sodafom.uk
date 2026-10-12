// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  execute: vi.fn(),
  getKeys: vi.fn(),
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn(),
}));

vi.mock('@/server/lib/archie-owner-session', () => ({ requireArchieOwnerSession: mocks.requireOwner }));
vi.mock('../../../db/client.js', () => ({ db: { execute: mocks.execute } }));
vi.mock('../../../push-keys.js', () => ({ getOrCreateVapidKeys: mocks.getKeys }));
vi.mock('web-push', () => ({ default: {
  setVapidDetails: mocks.setVapidDetails,
  sendNotification: mocks.sendNotification,
} }));

import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('owner-only push notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getKeys.mockResolvedValue({ publicKey: 'public', privateKey: 'private' });
    mocks.execute.mockResolvedValue([[]]);
  });

  it('does not accept the former public master code', async () => {
    mocks.requireOwner.mockImplementation(async (_req: Request, res: Response) => {
      res.status(401).json({ error: 'Sign in to the owner account.' });
      return null;
    });
    const req = { body: { code: '040718', title: 'Hello', body: 'Everyone' }, headers: {} } as Request;
    const res = response();

    await handler(req, res);

    expect(mocks.requireOwner).toHaveBeenCalledWith(req, res);
    expect(mocks.getKeys).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('allows the configured owner to reach the subscriber query', async () => {
    mocks.requireOwner.mockResolvedValue({ user: { id: 'owner', isAdmin: true } });
    const req = { body: { title: 'Hello', body: 'Everyone' }, headers: {} } as Request;
    const res = response();

    await handler(req, res);

    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ sent: 0, message: 'No subscribers' });
  });
});
