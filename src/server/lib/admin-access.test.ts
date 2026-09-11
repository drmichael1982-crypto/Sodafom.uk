import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateWeekCode, isValidAdminCode, isValidMasterCode } from './admin-access';

const originalMasterCode = process.env.ADMIN_MASTER_CODE;
const originalAuthSecret = process.env.BETTER_AUTH_SECRET;

describe('admin access', () => {
  beforeEach(() => {
    process.env.ADMIN_MASTER_CODE = 'configured-founder-code';
    process.env.BETTER_AUTH_SECRET = 'configured-auth-secret';
  });

  afterEach(() => {
    if (originalMasterCode === undefined) delete process.env.ADMIN_MASTER_CODE;
    else process.env.ADMIN_MASTER_CODE = originalMasterCode;

    if (originalAuthSecret === undefined) delete process.env.BETTER_AUTH_SECRET;
    else process.env.BETTER_AUTH_SECRET = originalAuthSecret;
  });

  it('accepts only the configured master code', () => {
    expect(isValidMasterCode('configured-founder-code')).toBe(true);
    expect(isValidMasterCode('1182')).toBe(false);
    expect(isValidMasterCode('040718')).toBe(false);
  });

  it('fails closed when the master code is missing', () => {
    delete process.env.ADMIN_MASTER_CODE;
    expect(isValidMasterCode('configured-founder-code')).toBe(false);
    expect(isValidMasterCode('')).toBe(false);
  });

  it('accepts the current rolling code when auth is configured', () => {
    const now = new Date('2026-09-11T12:00:00.000Z');
    const rollingCode = generateWeekCode(37, 2026);
    expect(rollingCode).not.toBeNull();
    expect(isValidAdminCode(rollingCode ?? undefined, now)).toBe(true);
  });

  it('does not generate a predictable fallback rolling code', () => {
    delete process.env.BETTER_AUTH_SECRET;
    expect(generateWeekCode(37, 2026)).toBeNull();
  });
});
