import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { schemas } from '@/content/schemas';

describe('games content schema', () => {
  it('preserves every route slug from the game catalogue', () => {
    const source = JSON.parse(readFileSync(`${process.cwd()}/src/content/pages/games.json`, 'utf8'));
    const parsed = schemas.pages.games.parse(source);

    expect(parsed.games).toHaveLength(source.games.length);
    expect(parsed.games.map((game) => game.slug)).toEqual(source.games.map((game: { slug: string }) => game.slug));
    expect(parsed.games.every((game) => game.slug.length > 0)).toBe(true);
  });
});
