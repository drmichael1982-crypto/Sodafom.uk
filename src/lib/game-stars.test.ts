import { beforeEach, describe, expect, it } from 'vitest';
import { gameStarsStorageKey, readGameStarMap, saveBestGameStars, totalGameStars } from './game-stars';

function selectChild(id: number | string) {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id, name: 'Learner', ageGroup: '8-10' }));
}

beforeEach(() => localStorage.clear());

describe('child-scoped game stars', () => {
  it('isolates sibling best scores and keeps legacy guest progress guest-only', () => {
    localStorage.setItem('sodafom_game_stars', JSON.stringify({ 'game-guest': 2 }));

    selectChild(1);
    saveBestGameStars('game-counting', 2);
    expect(readGameStarMap()).toEqual({ 'game-counting': 2 });
    expect(gameStarsStorageKey()).toBe('sodafom_game_stars:child:1');

    selectChild(2);
    expect(readGameStarMap()).toEqual({});
    saveBestGameStars('game-spelling', 3);
    expect(totalGameStars()).toBe(3);

    selectChild(1);
    saveBestGameStars('game-counting', 1);
    expect(readGameStarMap()).toEqual({ 'game-counting': 2 });
    expect(totalGameStars()).toBe(2);

    localStorage.removeItem('sodafom_active_child');
    expect(readGameStarMap()).toEqual({ 'game-guest': 2 });
  });

  it('encodes string identifiers and rejects malformed scores', () => {
    selectChild('child/one');
    saveBestGameStars('game-valid', 3);
    saveBestGameStars('game-too-high', 8);
    expect(gameStarsStorageKey()).toBe('sodafom_game_stars:child:child%2Fone');
    expect(readGameStarMap()).toEqual({ 'game-valid': 3 });
  });

  it('reads the previous profile key until the next score is saved canonically', () => {
    selectChild(7);
    localStorage.setItem('sodafom_game_stars:profile:child:7', JSON.stringify({ 'game-reading': 2 }));

    expect(readGameStarMap()).toEqual({ 'game-reading': 2 });
    expect(localStorage.getItem('sodafom_game_stars:child:7')).toBeNull();

    saveBestGameStars('game-spelling', 3);
    expect(JSON.parse(localStorage.getItem('sodafom_game_stars:child:7')!)).toEqual({
      'game-reading': 2,
      'game-spelling': 3,
    });
    expect(localStorage.getItem('sodafom_game_stars:profile:child:7')).not.toBeNull();
  });
});
