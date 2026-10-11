import { describe, expect, it } from 'vitest';
import { normalizeChildrenResponse } from './children-response';

const canonicalChild = {
  id: 7,
  name: 'Ava',
  ageGroup: '8-10',
  avatarEmoji: '🦊',
  totalStars: 42,
};

describe('normalizeChildrenResponse', () => {
  it('accepts the canonical bare camelCase array', () => {
    expect(normalizeChildrenResponse([canonicalChild])).toEqual([canonicalChild]);
  });

  it('accepts the legacy response envelope and field names', () => {
    expect(normalizeChildrenResponse({ children: [{
      id: 7,
      name: 'Ava',
      age_group: '8-10',
      avatar_emoji: '🦊',
      total_stars: '42',
      leaderboard_opt_in: 1,
    }] })).toEqual([{ ...canonicalChild, leaderboardOptIn: 1 }]);
  });

  it('drops malformed entries instead of exposing broken profiles to consumers', () => {
    expect(normalizeChildrenResponse({ children: [null, { id: 'bad', name: 'Ava' }] })).toEqual([]);
    expect(normalizeChildrenResponse({ error: 'Unauthorised' })).toEqual([]);
  });
});
