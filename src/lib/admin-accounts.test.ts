import { describe, expect, it } from 'vitest';
import { formatAdminAccountDate, normaliseVisitCounts, parseAdminAccounts } from './admin-accounts';

describe('admin account display contract', () => {
  it('keeps only the account fields intended for the founder table', () => {
    expect(parseAdminAccounts({
      users: [{
        id: 'user-1',
        name: 'Ada',
        email: 'ada@example.test',
        created_at: '2026-09-01T12:00:00.000Z',
        passwordHash: 'must-not-be-used',
        childProfiles: [{ id: 'child-1' }],
      }],
    })).toEqual([{
      id: 'user-1',
      name: 'Ada',
      email: 'ada@example.test',
      createdAt: '2026-09-01T12:00:00.000Z',
    }]);
  });

  it('rejects malformed payloads and caps the display at 100 accounts', () => {
    expect(parseAdminAccounts({ users: [{ id: 1, email: 'wrong@example.test' }] })).toEqual([]);
    expect(parseAdminAccounts(null)).toEqual([]);
    expect(parseAdminAccounts({ users: Array.from({ length: 101 }, (_, index) => ({ id: String(index), email: `${index}@example.test` })) })).toHaveLength(100);
  });

  it('keeps visit counters non-negative and human-readable dates safe', () => {
    expect(normaliseVisitCounts({ trafficToday: '5' as unknown as number, trafficThisWeek: -2, trafficThisMonth: Number.NaN })).toEqual({
      trafficToday: 5,
      trafficThisWeek: 0,
      trafficThisMonth: 0,
    });
    expect(formatAdminAccountDate('not-a-date')).toBe('—');
  });
});
