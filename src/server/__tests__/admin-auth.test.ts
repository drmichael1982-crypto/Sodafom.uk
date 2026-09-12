import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scryptSync } from 'node:crypto';
import type { Request, Response } from 'express';
import { hasFounderSession, isConfiguredAdminCode, issueFounderSession } from '@/server/admin-auth';

// All credentials here are synthetic fixtures; never read a production secret.
const envKeys = ['ADMIN_MASTER_CODE', 'ADMIN_MASTER_CODE_HASH', 'BETTER_AUTH_SECRET', 'NODE_ENV'] as const;
const originalEnvironment = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
beforeEach(() => {
  for (const key of envKeys) delete process.env[key];
  process.env.NODE_ENV = 'test';
});
afterEach(() => {
  vi.useRealTimers();
  for (const key of envKeys) {
    const original = originalEnvironment[key];
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

function fixture() {
  process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
  process.env.BETTER_AUTH_SECRET = 'test-only-secret-with-enough-entropy';
  let value = '';
  let options: Record<string, unknown> = {};
  const cookie = vi.fn((_name: string, nextValue: string, nextOptions: Record<string, unknown>) => {
    value = nextValue;
    options = nextOptions;
  });
  const response = { cookie } as unknown as Response;
  return {
    response, cookie,
    request: () => ({ headers: { cookie: `sodafom_founder_session=${encodeURIComponent(value)}` } }) as Request,
    options: () => options,
    value: () => value,
  };
}

describe('founder authentication', () => {
  it('fails closed when no master code is configured', () => {
    expect(isConfiguredAdminCode('legacy-default')).toBe(false);
  });

  it('accepts only the environment-configured code', () => {
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    expect(isConfiguredAdminCode('test-only-founder-code')).toBe(true);
    expect(isConfiguredAdminCode('legacy-default')).toBe(false);
  });

  it('verifies a configured scrypt hash and does not fall back to a plaintext code', () => {
    const salt = Buffer.alloc(16, 7);
    const hash = scryptSync('test-hashed-code', salt, 32).toString('hex');
    process.env.ADMIN_MASTER_CODE_HASH = `scrypt$${salt.toString('hex')}$${hash}`;
    process.env.ADMIN_MASTER_CODE = 'ignored-legacy-code';
    expect(isConfiguredAdminCode('test-hashed-code')).toBe(true);
    expect(isConfiguredAdminCode('ignored-legacy-code')).toBe(false);
    process.env.ADMIN_MASTER_CODE_HASH = 'malformed';
    expect(isConfiguredAdminCode('ignored-legacy-code')).toBe(false);
  });

  it('does not issue a cookie without both signing and master-code configuration', () => {
    const f = fixture();
    delete process.env.ADMIN_MASTER_CODE;
    expect(issueFounderSession(f.response)).toBe(false);
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    delete process.env.BETTER_AUTH_SECRET;
    expect(issueFounderSession(f.response)).toBe(false);
    expect(f.cookie).not.toHaveBeenCalled();
  });

  it('issues a signed, short-lived HttpOnly cookie and rejects tampering', () => {
    const f = fixture();
    process.env.NODE_ENV = 'production';
    expect(issueFounderSession(f.response)).toBe(true);
    expect(f.options()).toMatchObject({ httpOnly: true, sameSite: 'strict', secure: true, path: '/', maxAge: 7_200_000 });
    expect(hasFounderSession(f.request())).toBe(true);
    const tampered = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(`${f.value()}x`)}` } } as Request;
    expect(hasFounderSession(tampered)).toBe(false);
  });

  it('revokes an existing session when the master code changes', () => {
    const f = fixture();
    expect(issueFounderSession(f.response)).toBe(true);
    process.env.ADMIN_MASTER_CODE = 'test-only-rotated-code';
    expect(hasFounderSession(f.request())).toBe(false);
  });

  it('expires a session after two hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    const f = fixture();
    expect(issueFounderSession(f.response)).toBe(true);
    expect(hasFounderSession(f.request())).toBe(true);
    vi.advanceTimersByTime(7_200_000);
    expect(hasFounderSession(f.request())).toBe(false);
  });

  it('rejects malformed or absent cookies', () => {
    fixture();
    for (const value of ['', 'sodafom_founder_session=%zz', 'sodafom_founder_session=not-a-session']) {
      expect(hasFounderSession({ headers: { cookie: value } } as Request)).toBe(false);
    }
  });
});
