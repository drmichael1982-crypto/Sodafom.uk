import { describe, expect, it } from 'vitest';
import { shouldRecoverStaleSession } from './auth-client';

describe('shouldRecoverStaleSession', () => {
  it.each([
    [{ status: 401 }, true],
    [{ status: 403 }, true],
    [{ message: 'Session expired' }, true],
    [{ code: 'SESSION_REVOKED' }, true],
    [{ message: 'Failed to fetch' }, false],
    [{ status: 500 }, false],
    [undefined, false],
  ])('returns %s for %o', (error, expected) => {
    expect(shouldRecoverStaleSession(error)).toBe(expected);
  });
});
