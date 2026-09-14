import { describe, expect, it, vi } from 'vitest';
import handler from './POST';

function makeResponse() {
  const response = {
    destroyed: false,
    writableEnded: false,
    setHeader: vi.fn(),
    status: vi.fn(),
    type: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.type.mockReturnValue(response);
  return response;
}

describe('/api/chat Local-first server guard', () => {
  it('returns a local JSON answer before checking paid cloud access', async () => {
    const response = makeResponse();
    await handler({
      headers: { accept: 'application/json' },
      body: { messages: [{ role: 'user', content: 'What is 2 plus 2?' }] },
      aborted: false,
    } as any, response as any);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      source: 'local',
      modelUsed: 'Local AI',
      cost: 0,
      costStatus: 'local',
    }));
    expect(response.on).not.toHaveBeenCalled();
  });

  it('keeps the legacy text contract for existing callers using a local answer', async () => {
    const response = makeResponse();
    await handler({
      headers: { accept: 'text/plain' },
      body: { messages: [{ role: 'user', content: 'What is 2 plus 2?' }] },
      aborted: false,
    } as any, response as any);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.type).toHaveBeenCalledWith('text/plain');
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('4'));
  });

  it('fails closed instead of spending AI credit when an unknown question needs cloud billing', async () => {
    const response = makeResponse();
    await handler({
      headers: { accept: 'application/json' },
      body: { messages: [{ role: 'user', content: 'Explain advanced quantum mechanics in detail.' }] },
      aborted: false,
    } as any, response as any);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'PAID_AI_BILLING_PENDING' }));
    expect(response.on).not.toHaveBeenCalled();
  });
});
