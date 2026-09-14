import { describe, expect, it } from 'vitest';
import { toSafeInternalPath } from './safe-redirect';

describe('toSafeInternalPath', () => {
  it('keeps an internal account return path including query and fragment', () => {
    expect(toSafeInternalPath('/hub?child=2#progress')).toBe('/hub?child=2#progress');
  });

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', '/\t//evil.example', 'hub'])(
    'rejects unsafe return path %s',
    (path) => expect(toSafeInternalPath(path)).toBeNull(),
  );
});
