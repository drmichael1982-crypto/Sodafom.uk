// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({ requireOwner: vi.fn(), execute: vi.fn() }));
vi.mock('@/server/lib/archie-owner-session', () => ({ requireArchieOwnerSession: mocks.requireOwner }));
vi.mock('@/server/db/client', () => ({ db: { execute: mocks.execute } }));
import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

beforeEach(() => vi.clearAllMocks());

it('does not run the migration without the configured owner session', async () => {
  mocks.requireOwner.mockResolvedValue(null);
  const req = { headers: {} } as Request;
  const res = response();

  await handler(req, res);

  expect(mocks.requireOwner).toHaveBeenCalledWith(req, res);
  expect(mocks.execute).not.toHaveBeenCalled();
});

it('runs the idempotent migration for the configured owner', async () => {
  mocks.requireOwner.mockResolvedValue({ user: { id: 'owner', isAdmin: true } });
  mocks.execute.mockResolvedValue(undefined);
  const req = { headers: {} } as Request;
  const res = response();

  await handler(req, res);

  expect(mocks.execute).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith({ ok: true, message: 'newsletter_subscribers table ready' });
});
