// Run from the repository root with Node 22.22+:
// node --experimental-strip-types --test scripts/test-navigation-recovery.mjs
// These are logic/source tests, NOT rendered mobile/desktop browser tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getNotFoundBackTarget,
  getRandomGameDestination,
  isGameNavigationCandidate,
} from '../src/lib/navigation-recovery.ts';

for (const [label, state] of [
  ['direct visit', { idx: 0 }],
  ['absent state', null],
  ['missing state', undefined],
  ['unrecognised state', {}],
  ['string index', { idx: '2' }],
  ['negative index', { idx: -1 }],
  ['fractional index', { idx: 0.5 }],
  ['non-finite index', { idx: Infinity }],
  ['NaN index', { idx: NaN }],
]) {
  test(`Back goes Home for ${label}`, () => {
    assert.equal(getNotFoundBackTarget(state), '/');
  });
}

test('Back retains previous-router-entry navigation', () => {
  assert.equal(getNotFoundBackTarget({ idx: 1, key: 'abc', usr: null }), -1);
  assert.equal(getNotFoundBackTarget({ idx: 9 }), -1);
});

test('Back does not mistake external browser history length for a router entry', () => {
  assert.equal(getNotFoundBackTarget({ length: 10 }), '/');
});

test('Surprise opens existing Games page for an empty catalogue', () => {
  assert.equal(getRandomGameDestination([]), '/games');
});

test('Surprise opens Games for an unavailable or non-array catalogue', () => {
  for (const data of [undefined, null, {}, 'not a catalogue', 3]) {
    assert.equal(getRandomGameDestination(data), '/games');
  }
});

test('Game links reject malformed and non-local slugs', () => {
  for (const item of [null, undefined, {}, { slug: '' }, { slug: 2 },
    { slug: '../admin-panel' }, { slug: '//outside.example' },
    { slug: 'https://outside.example' }, { slug: 'word search' },
    { slug: 'number-pop?redirect=/admin-panel' }, { slug: 'number-pop#part' }]) {
    assert.equal(isGameNavigationCandidate(item), false);
    assert.equal(getRandomGameDestination([item]), '/games');
  }
});

test('Surprise can choose both first and last valid game', () => {
  const games = [{ slug: 'number-pop' }, { slug: 'word-search' }];
  assert.equal(getRandomGameDestination(games, () => 0), '/games/number-pop');
  assert.equal(getRandomGameDestination(games, () => 0.999999), '/games/word-search');
});

test('Surprise ignores malformed entries without altering the catalogue', () => {
  const games = Object.freeze([null, Object.freeze({ slug: 'number-pop' }), {}]);
  assert.equal(getRandomGameDestination(games, () => 0.5), '/games/number-pop');
  assert.equal(games.length, 3);
});

test('Invalid random samples fall back instead of making an undefined link', () => {
  for (const sample of [-1, 1, Infinity, NaN]) {
    assert.equal(getRandomGameDestination([{ slug: 'number-pop' }], () => sample), '/games');
  }
});

test('No random sampling is needed when no valid game links exist', () => {
  assert.equal(getRandomGameDestination([], () => { throw new Error('must not run'); }), '/games');
});

test('Not-found buttons are wired to tested recovery helpers (source check)', () => {
  const page = readFileSync(new URL('../src/pages/_404.tsx', import.meta.url), 'utf8');
  assert.match(page, /onClick=\{handleGoBack\}/);
  assert.match(page, /getNotFoundBackTarget\(historyState\)/);
  assert.match(page, /navigate\(target, \{ replace: true \}\)/);
  assert.match(page, /navigate\(getRandomGameDestination\(gamesContent\.games\)\)/);
  assert.match(page, /\.filter\(isGameNavigationCandidate\)/);
  assert.match(page, /<button\s+type="button"\s+onClick=\{handleGoBack\}/);
  assert.match(page, /<motion\.button\s+type="button"/);
});
