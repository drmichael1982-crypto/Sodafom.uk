import { describe, expect, it } from 'vitest';
import { MOVEMENT_IDS, WORLD_DESTINATIONS, getWorldDestination, motionAllowed } from './visual-world';

describe('approved visual world model', () => {
  it('keeps every destination id unique and routed', () => {
    const ids = WORLD_DESTINATIONS.map((destination) => destination.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(WORLD_DESTINATIONS.every((destination) => destination.route.startsWith('/'))).toBe(true);
  });

  it('includes the approved core destinations', () => {
    for (const id of ['fairground', 'library', 'castle-museum', 'theatre', 'birthday-room', 'founder-room', 'ask-archie', 'night-sky'] as const) {
      expect(getWorldDestination(id)).toBeDefined();
    }
  });

  it('keeps the movement library modular and unique', () => {
    expect(MOVEMENT_IDS).toHaveLength(40);
    expect(new Set(MOVEMENT_IDS).size).toBe(40);
    expect(MOVEMENT_IDS).toContain('book-spin');
    expect(MOVEMENT_IDS).toContain('book-character-out');
    expect(MOVEMENT_IDS).toContain('dog-tail-wag');
    expect(MOVEMENT_IDS).toContain('walk-forward');
  });

  it('provides a reduced-motion safety decision', () => {
    const fairground = getWorldDestination('fairground');
    const library = getWorldDestination('library');
    expect(fairground && motionAllowed(true, fairground)).toBe(false);
    expect(library && motionAllowed(true, library)).toBe(true);
    expect(fairground && motionAllowed(false, fairground)).toBe(true);
  });
});
