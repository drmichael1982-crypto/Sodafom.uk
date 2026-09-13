import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { hasFounderSession, isConfiguredAdminCode, issueFounderSession } from '@/server/admin-auth';

// Every test supplies its own configuration; never depend on a developer's
// environment, a previous test, or real admin credentials.
beforeEach(() => {
  vi.stubEnv('ADMIN_MASTER_CODE', '');
  vi.stubEnv('ADMIN_MASTER_CODE_HASH', '');
  vi.stubEnv('BETTER_AUTH_SECRET', '');
});
afterEach(() => vi.unstubAllEnvs());

describe('founder authentication', () => {
  it('fails closed when no master code is configured', () => {
    delete process.env.ADMIN_MASTER_CODE;
    expect(isConfiguredAdminCode('legacy-default')).toBe(false);
  });

  it('accepts only the environment-configured code', () => {
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    expect(isConfiguredAdminCode('test-only-founder-code')).toBe(true);
    expect(isConfiguredAdminCode('legacy-default')).toBe(false);
  });

  it('issues a signed, short-lived HttpOnly cookie', () => {
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    process.env.BETTER_AUTH_SECRET = 'test-only-secret-with-enough-entropy';
    let value = '';
    let options: Record<string, unknown> = {};
    const response = {
      cookie: (_name: string, nextValue: string, nextOptions: Record<string, unknown>) => {
        value = nextValue;
        options = nextOptions;
      },
    } as unknown as Response;

    expect(issueFounderSession(response)).toBe(true);
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 60 * 1000 });
    const request = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(value)}` } } as Request;
    expect(hasFounderSession(request)).toBe(true);

    const tampered = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(`${value}x`)}` } } as Request;
    expect(hasFounderSession(tampered)).toBe(false);
  });

  it('does not issue a cookie without both signing secret and configured code', () => {
    const cookie = vi.fn();
    const response = { cookie } as unknown as Response;
    process.env.BETTER_AUTH_SECRET = 'test-only-secret-with-enough-entropy';
    expect(issueFounderSession(response)).toBe(false);
    process.env.BETTER_AUTH_SECRET = '';
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    expect(issueFounderSession(response)).toBe(false);
    expect(cookie).not.toHaveBeenCalled();
  });

  it('revokes a previously signed cookie after the configured code rotates', () => {
    process.env.ADMIN_MASTER_CODE = 'test-only-founder-code';
    process.env.BETTER_AUTH_SECRET = 'test-only-secret-with-enough-entropy';
    let value = '';
    const response = {
      cookie: (_name: string, nextValue: string) => { value = nextValue; },
    } as unknown as Response;
    expect(issueFounderSession(response)).toBe(true);
    const request = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(value)}` } } as Request;
    expect(hasFounderSession(request)).toBe(true);
    process.env.ADMIN_MASTER_CODE = 'test-only-rotated-founder-code';
    expect(hasFounderSession(request)).toBe(false);
  });
});
