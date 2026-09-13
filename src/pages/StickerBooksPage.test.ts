import { describe, expect, it } from 'vitest';
import { readStickerBookChildren } from './StickerBooksPage';

describe('sticker-book child profile response parsing', () => {
  const child = { id: 12, name: 'Avery', ageGroup: '8-10' };

  it('accepts the current authenticated children API array response', () => {
    expect(readStickerBookChildren([child])).toEqual([child]);
  });

  it('remains compatible with a wrapped children response without trusting malformed data', () => {
    expect(readStickerBookChildren({ children: [child] })).toEqual([child]);
    expect(readStickerBookChildren({ children: [{ ...child, id: '12' }] })).toBeNull();
    expect(readStickerBookChildren({ children: [{ id: 12, name: 'Avery' }] })).toBeNull();
  });
});
