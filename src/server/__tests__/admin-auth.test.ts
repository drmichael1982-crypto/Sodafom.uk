import { afterEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { hasFounderSession, isConfiguredAdminCode, issueFounderSession } from '@/server/admin-auth';

const originalAdminCode = process.env.ADMIN_MASTER_CODE;
const originalAuthSecret = process.env.BETTER_AUTH_SECRET;

afterEach(() => {
  if (originalAdminCode === undefined) delete process.env.ADMIN_MASTER_CODE;
  else process.env.ADMIN_MASTER_CODE = originalAdminCode;
  if (originalAuthSecret === undefined) delete process.env.BETTER_AUTH_SECRET;
  else process.env.BETTER_AUTH_SECRET = originalAuthSecret;
});

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
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'strict', path: '/' });
    const request = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(value)}` } } as Request;
    expect(hasFounderSession(request)).toBe(true);

    const tampered = { headers: { cookie: `sodafom_founder_session=${encodeURIComponent(`${value}x`)}` } } as Request;
    expect(hasFounderSession(tampered)).toBe(false);
  });
});
