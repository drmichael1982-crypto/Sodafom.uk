/**
 * SOD-12 independent authorization probes for routes that were public in the
 * SOD-02/SOD-03 review. Anonymous requests must stop before any mutation or
 * schema migration. All dependencies are synthetic; no live account/data is
 * touched. Run with: pnpm exec vitest run src/__tests__/sod12-public-route-authorization.test.ts
 */
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn().mockResolvedValue(null),
  hasAdminAccess: vi.fn().mockResolvedValue(false),
  resolveTeacher: vi.fn().mockResolvedValue(null),
  execute: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock('@/server/admin-auth', () => ({ hasAdminAccess: mocks.hasAdminAccess }));
vi.mock('@/server/api/teacher/me/GET', () => ({ resolveTeacher: mocks.resolveTeacher }));

vi.mock('@/server/db/client', () => ({
  db: { execute: mocks.execute, insert: mocks.insert, select: mocks.select, update: mocks.update },
}));
vi.mock('@/server/db/schema', () => ({ siteReviews: {}, promoCodes: {}, students: {}, studentActivity: {}, teacherAccounts: {}, teacherSessions: {} }));
vi.mock('drizzle-orm', () => ({
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
  eq: (...args: unknown[]) => ({ args }),
  desc: (...args: unknown[]) => ({ args }),
}));

import reviewsPost from '@/server/api/reviews/POST';
import newsletterMigrate from '@/server/api/newsletter/migrate/POST';
import referralConvert from '@/server/api/referral/convert/POST';
import pushUnsubscribe from '@/server/api/push/unsubscribe/POST';
import studentLookup from '@/server/api/teacher/student-lookup/GET';
import studentActivity from '@/server/api/teacher/students/[studentId]/activity/POST';

function recorder() {
  const record = { status: 200, body: undefined as unknown, sent: undefined as unknown };
  const res = {
    status(code: number) { record.status = code; return res; },
    json(body: unknown) { record.body = body; return res; },
    send(body: unknown) { record.sent = body; return res; },
    type() { return res; },
  } as unknown as Response;
  return { record, res };
}

const anonymousRequest = (body: unknown = {}) => ({ headers: {}, body, query: {}, params: {} }) as unknown as Request;

describe('SOD-12 anonymous public-route authorization', () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue(null);
    mocks.hasAdminAccess.mockResolvedValue(false);
    mocks.resolveTeacher.mockResolvedValue(null);
    mocks.execute.mockReset();
    mocks.insert.mockReset();
    mocks.select.mockReset();
    mocks.update.mockReset();
    // Complete the database interfaces so authorization failures cannot be
    // confused with an artificial TypeError from an incomplete test double.
    mocks.execute.mockResolvedValue([]);
    mocks.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    mocks.select.mockReturnValue({ from: () => ({ where: () => ({ limit: async () => [
      { id: 7, studentCode: 'SODA-STUD-DEAD', name: 'Synthetic learner', ageGroup: '8-10', totalStars: 0 },
    ] }) }) });
    mocks.update.mockReturnValue({ set: () => ({ where: vi.fn().mockResolvedValue(undefined) }) });
  });

  it('does not publish an anonymous review as approved content', async () => {
    const { record, res } = recorder();
    await reviewsPost(anonymousRequest({ authorName: 'Synthetic', body: 'Synthetic review' }), res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('does not let an anonymous request run the newsletter schema migration', async () => {
    const { record, res } = recorder();
    await newsletterMigrate(anonymousRequest(), res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('does not convert referrals from a caller-selected user id', async () => {
    const { record, res } = recorder();
    await referralConvert(anonymousRequest({ userId: 'victim-account' }), res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('does not delete another account’s push subscription by endpoint alone', async () => {
    const { record, res } = recorder();
    await pushUnsubscribe(anonymousRequest({ endpoint: 'https://push.example/synthetic' }), res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('does not disclose a child profile from an anonymous student-code lookup', async () => {
    const { record, res } = recorder();
    await studentLookup({ headers: {}, query: { code: 'SODA-STUD-DEAD' }, body: {}, params: {} } as unknown as Request, res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('does not log anonymous student activity or trust a caller-selected student id', async () => {
    const { record, res } = recorder();
    await studentActivity(anonymousRequest({ studentCode: 'SODA-STUD-DEAD', gameId: 'synthetic', subject: 'maths', starsEarned: 999 }), res);

    expect([401, 403]).toContain(record.status);
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
