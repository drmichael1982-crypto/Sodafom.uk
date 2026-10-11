// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ execute: vi.fn() }));
vi.mock('../db/client.js', () => ({ db: { execute: mocks.execute } }));

describe('reward storage initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('accepts an existing reward_email column and initializes only once', async () => {
    mocks.execute
      .mockRejectedValueOnce({ code: 'ER_DUP_FIELDNAME', errno: 1060 })
      .mockResolvedValueOnce([[]]);
    const { ensureRewardStorage } = await import('./reward-storage');

    await ensureRewardStorage();
    await ensureRewardStorage();

    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(mocks.execute.mock.calls[1][0])).toContain('CREATE TABLE IF NOT EXISTS badge_awards');
  });

  it('surfaces unexpected setup failures and allows a later retry', async () => {
    mocks.execute
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);
    const { ensureRewardStorage } = await import('./reward-storage');

    await expect(ensureRewardStorage()).rejects.toThrow('database unavailable');
    await expect(ensureRewardStorage()).resolves.toBeUndefined();
    expect(mocks.execute).toHaveBeenCalledTimes(3);
  });
});
