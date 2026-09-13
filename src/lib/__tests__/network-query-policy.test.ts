import { describe, expect, it } from 'vitest';
import { networkMutationDefaults } from '../network-query-policy';

describe('network mutation policy', () => {
  it('does not pause and replay an offline mutation on reconnect', () => {
    expect(networkMutationDefaults).toEqual({ retry: 0, networkMode: 'always' });
  });
});
