import { describe, expect, it, vi } from 'vitest';
import {
  ArchieRoutingError,
  describeArchieReply,
  parseArchieReply,
  routeArchieQuestion,
} from '../archie-routing-core';

const request = (question: string, allowCloudFallback?: boolean) => ({
  messages: [{ role: 'user' as const, content: question }],
  allowCloudFallback,
});

describe('shared Local-first Archie routing', () => {
  it('answers a local hit without opening a cloud request', async () => {
    const requestCloud = vi.fn();
    const reply = await routeArchieQuestion(request('What is 2 plus 2?'), {
      lookupLocal: () => '2 plus 2 is 4.',
      lookupSaved: () => null,
      requestCloud,
      rememberCloudAnswer: vi.fn(),
    });

    expect(reply).toMatchObject({ source: 'local', modelUsed: 'Local AI', cost: 0, costStatus: 'local' });
    expect(requestCloud).not.toHaveBeenCalled();
  });

  it('reuses a saved general answer locally without another paid request', async () => {
    const requestCloud = vi.fn();
    const reply = await routeArchieQuestion(request('Explain a simile'), {
      lookupLocal: () => null,
      lookupSaved: () => 'A simile compares things using like or as.',
      requestCloud,
      rememberCloudAnswer: vi.fn(),
    });

    expect(reply).toMatchObject({ source: 'local', reused: true, cost: 0 });
    expect(requestCloud).not.toHaveBeenCalled();
    expect(describeArchieReply(reply)).toContain('saved answer');
  });

  it('makes exactly one cloud request after both local routes miss', async () => {
    const requestCloud = vi.fn().mockResolvedValue({
      text: 'Cloud explanation',
      source: 'openai',
      modelUsed: 'gpt-4o-mini',
      cost: null,
    });
    const rememberCloudAnswer = vi.fn();

    const reply = await routeArchieQuestion(request('Explain quantum mechanics simply'), {
      lookupLocal: () => null,
      lookupSaved: () => null,
      requestCloud,
      rememberCloudAnswer,
    });

    expect(requestCloud).toHaveBeenCalledTimes(1);
    expect(rememberCloudAnswer).toHaveBeenCalledWith('Explain quantum mechanics simply', 'Cloud explanation', 'general');
    expect(reply).toMatchObject({ source: 'openai', modelUsed: 'gpt-4o-mini', cost: null, costStatus: 'unavailable' });
    expect(describeArchieReply(reply)).toContain('Cost pending verified billing');
  });

  it('never turns a local engine error into a paid request', async () => {
    const requestCloud = vi.fn();
    await expect(routeArchieQuestion(request('What is 2 plus 2?'), {
      lookupLocal: () => { throw new Error('local engine unavailable'); },
      lookupSaved: () => null,
      requestCloud,
      rememberCloudAnswer: vi.fn(),
    })).rejects.toMatchObject({ code: 'LOCAL_UNAVAILABLE' });
    expect(requestCloud).not.toHaveBeenCalled();
  });

  it('does not open a cloud request when cloud fallback is disabled', async () => {
    const requestCloud = vi.fn();
    await expect(routeArchieQuestion(request('A question the local engine does not know', false), {
      lookupLocal: () => null,
      lookupSaved: () => null,
      requestCloud,
      rememberCloudAnswer: vi.fn(),
    })).rejects.toMatchObject({ code: 'FALLBACK_DISABLED' });
    expect(requestCloud).not.toHaveBeenCalled();
  });

  it('rejects missing provider provenance instead of presenting it as OpenAI', () => {
    expect(() => parseArchieReply({ text: 'A response without source data' })).toThrow(ArchieRoutingError);
  });
});
