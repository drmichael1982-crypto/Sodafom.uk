// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  getSession: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('@/server/db/client', () => ({ db: { execute: mocks.execute } }));
vi.mock('@/lib/auth/auth', () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock('@/server/email', () => ({ sendEmail: mocks.sendEmail }));

import handler from './POST';

function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
}

describe('weekly parent report email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      user: { id: 'parent-1', email: 'parent@example.test', name: 'Pat Parent' },
    });
    mocks.sendEmail.mockResolvedValue(undefined);
  });

  it('requires an authenticated parent session', async () => {
    mocks.getSession.mockResolvedValue(null);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('emails totals across every subject from each owned child activity', async () => {
    mocks.execute
      .mockResolvedValueOnce([[
        { id: 7, name: 'Ava', total_stars: 42, avatar_emoji: '🦊' },
      ]])
      .mockResolvedValueOnce([[
        { top_subject: 'maths', games_played: 3, stars_this_week: 6 },
        { top_subject: 'reading', games_played: 2, stars_this_week: 3 },
      ]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'parent@example.test',
      subject: expect.stringContaining('5 games, 9 stars'),
      html: expect.stringMatching(/Ava[\s\S]*5[\s\S]*⭐ 9[\s\S]*maths/),
    }));
    expect(res.json).toHaveBeenCalledWith({
      sent: true,
      childCount: 1,
      totalGamesThisWeek: 5,
      totalStarsThisWeek: 9,
    });
  });

  it('does not send a report when the signed-in parent has no children', async () => {
    mocks.execute.mockResolvedValueOnce([[]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ sent: false, reason: 'No children found' });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it('escapes stored child fields before adding them to the report HTML', async () => {
    mocks.execute
      .mockResolvedValueOnce([[
        {
          id: 7,
          name: '</strong><img src="https://attacker.example/pixel"><strong>',
          total_stars: 1,
          avatar_emoji: '<svg onload="alert(1)">',
        },
      ]])
      .mockResolvedValueOnce([[
        { top_subject: '</td><a href="https://attacker.example">maths</a>', games_played: 1, stars_this_week: 1 },
      ]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    const message = mocks.sendEmail.mock.calls[0][0] as { html: string };
    expect(message.html).toContain('&lt;img src=&quot;https://attacker.example/pixel&quot;&gt;');
    expect(message.html).toContain('&lt;svg onload=&quot;alert(1)&quot;&gt;');
    expect(message.html).toContain('&lt;a href=&quot;https://attacker.example&quot;&gt;maths&lt;/a&gt;');
    expect(message.html).not.toContain('<img src="https://attacker.example/pixel">');
    expect(message.html).not.toContain('<svg onload="alert(1)">');
  });

  it('removes line breaks from the parent name used in the email subject', async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: 'parent-1', email: 'parent@example.test', name: 'Pat\r\nBcc: attacker@example.test' },
    });
    mocks.execute
      .mockResolvedValueOnce([[
        { id: 7, name: 'Ava', total_stars: 1, avatar_emoji: '🦊' },
      ]])
      .mockResolvedValueOnce([[]]);
    const res = response();

    await handler({ headers: {} } as Request, res);

    const message = mocks.sendEmail.mock.calls[0][0] as { subject: string };
    expect(message.subject).not.toMatch(/[\r\n]/);
    expect(message.subject).toContain("Pat's weekly learning report");
  });

  it('does not disclose internal database errors to the client', async () => {
    mocks.execute.mockRejectedValueOnce(new Error('private-db-host/schema-detail'));
    const res = response();

    await handler({ headers: {} } as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to send report' });
    expect(JSON.stringify((res.json as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('private-db-host');
  });
});
