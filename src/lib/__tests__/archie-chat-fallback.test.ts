import { describe, expect, it } from 'vitest';
import { getArchieConnectionFallback } from '../archie-chat-fallback';

describe('Ask Archie connection fallback', () => {
  it('gives a child-friendly explanation when paid AI is deliberately paused', () => {
    expect(getArchieConnectionFallback(new Error('voucher-billing-pending: service unavailable')))
      .toContain('online helper');
  });

  it('does not expose a raw fetch error to children', () => {
    const message = getArchieConnectionFallback(new Error('Connection failed: Failed to fetch'));
    expect(message).toContain("can't reach");
    expect(message).not.toContain('Failed to fetch');
  });
});
