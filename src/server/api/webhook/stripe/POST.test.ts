import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

vi.mock('#airo/secrets', () => ({ getSecret: vi.fn() }));
vi.mock('@/server/email', () => ({ sendEmail: vi.fn() }));

import handler from './POST';

function responseRecorder() {
  const record = { status: 200, body: undefined as unknown };
  const response = {
    status(code: number) {
      record.status = code;
      return response;
    },
    json(body: unknown) {
      record.body = body;
      return response;
    },
  } as unknown as Response;
  return { record, response };
}

describe('Stripe webhook verification', () => {
  beforeEach(() => vi.mocked(getSecret).mockReset());

  it('fails closed when the webhook signing secret is absent', async () => {
    vi.mocked(getSecret).mockReturnValue(null);
    const { record, response } = responseRecorder();

    await handler({ headers: {}, body: Buffer.from('{}') } as Request, response);

    expect(record.status).toBe(503);
    expect(record.body).toEqual({ error: 'Webhook verification is not configured' });
  });

  it('rejects unsigned webhook requests', async () => {
    vi.mocked(getSecret).mockImplementation((name: string) => name === 'STRIPE_WEBHOOK_SECRET' ? 'whsec_test' : 'sk_test_safe');
    const { record, response } = responseRecorder();

    await handler({ headers: {}, body: Buffer.from('{}') } as Request, response);

    expect(record.status).toBe(400);
    expect(record.body).toEqual({ error: 'Missing Stripe signature' });
  });
});
