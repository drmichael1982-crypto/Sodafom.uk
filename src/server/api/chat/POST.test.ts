// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
const mocks = vi.hoisted(() => ({ session: vi.fn(), env: vi.fn(), answer: vi.fn() }));
vi.mock('../../lib/archie-parent-auth', () => ({ requirePreviewParentSession: mocks.session }));
vi.mock('../../lib/archie-parent-ai', () => ({ getParentAIEnv: mocks.env }));
vi.mock('../../lib/archie-brain', async importOriginal => ({ ...await importOriginal<object>(), answerWithArchie: mocks.answer }));
import handler from './POST';
const response = () => { const res = { setHeader: vi.fn(), status: vi.fn(), send: vi.fn(), type: vi.fn() }; res.status.mockReturnValue(res); res.type.mockReturnValue(res); return res as unknown as Response; };
const request = () => ({ body: { messages: [{ role: 'user', content: 'Explain a river' }], learnerAge: 8 }, ip: 'fixture' }) as Request;
beforeEach(() => { vi.clearAllMocks(); mocks.env.mockResolvedValue({ ARCHIE_CLOUD_PROVIDER: 'none' }); mocks.answer.mockResolvedValue('A river is flowing water.'); });
describe('authenticated optional model requests', () => {
  it('does not reach a provider without a verified parent session', async () => {
    mocks.session.mockResolvedValue(null);
    await handler(request(), response());
    expect(mocks.env).not.toHaveBeenCalled(); expect(mocks.answer).not.toHaveBeenCalled();
  });
  it('routes with the authenticated parent ID and selected environment rather than raw server credentials', async () => {
    mocks.session.mockResolvedValue({ user: { id: 'verified-parent' } });
    const req = request(); const res = response();
    await handler(req, res);
    expect(mocks.env).toHaveBeenCalledWith(req, 'verified-parent');
    expect(mocks.answer).toHaveBeenCalledWith(req.body.messages, '', { ARCHIE_CLOUD_PROVIDER: 'none' }, 8);
    expect(res.send).toHaveBeenCalledWith('A river is flowing water.');
  });
  it('never logs provider errors containing a key or submitted content', async () => {
    mocks.session.mockResolvedValue({ user: { id: 'verified-parent' } });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sensitive = 'synthetic-secret-do-not-log';
    mocks.answer.mockRejectedValue({ status: 500, code: sensitive, message: sensitive });
    try {
      const res = response(); await handler(request(), res);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(JSON.stringify(warning.mock.calls)).not.toContain(sensitive);
      expect(JSON.stringify((res.send as ReturnType<typeof vi.fn>).mock.calls)).not.toContain(sensitive);
    } finally { warning.mockRestore(); }
  });
});
