import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearChildInterests,
  getChildInterests,
  getInterestTheme,
  removeChildInterest,
  saveChildInterest,
  tryRememberChildInterest,
} from '../interest-themes';

describe('device-local interest themes', () => {
  beforeEach(() => localStorage.clear());

  it('stores a short favourite and chooses original abstract artwork cues', () => {
    const message = tryRememberChildInterest('I like Teletubbies');
    expect(message).toContain('stays on this device');
    expect(message).toContain('abstract geometric shapes');
    expect(getChildInterests()).toEqual(['teletubbies']);
  });

  it('accepts custom interests while stripping punctuation and extra text', () => {
    const message = tryRememberChildInterest('My favourite show is Space Cats because they are funny!');
    expect(message).toContain('space cats');
    expect(getChildInterests()).toEqual(['space cats']);
    expect(getInterestTheme('space cats').motif).toContain('original colours');
  });

  it('keeps at most five interests and supports removing and clearing them', () => {
    ['space', 'dinosaurs', 'football', 'magic', 'music', 'trains'].forEach(saveChildInterest);
    expect(getChildInterests()).toEqual(['trains', 'music', 'magic', 'football', 'dinosaurs']);
    removeChildInterest('magic');
    expect(getChildInterests()).not.toContain('magic');
    clearChildInterests();
    expect(getChildInterests()).toEqual([]);
  });

  it('keeps different active child profiles separate', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 'one' }));
    saveChildInterest('space');
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 'two' }));
    saveChildInterest('football');
    expect(getChildInterests()).toEqual(['football']);
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 'one' }));
    expect(getChildInterests()).toEqual(['space']);
  });

  it('keeps numeric child profiles separate instead of sharing the guest interests', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 7 }));
    saveChildInterest('space');
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 8 }));
    saveChildInterest('football');
    expect(getChildInterests()).toEqual(['football']);

    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 7 }));
    expect(getChildInterests()).toEqual(['space']);
    expect(localStorage.getItem('sodafom_child_interests:default')).toBeNull();
  });

  it('keeps explicit profanity out of the saved theme and answers locally', () => {
    const reply = tryRememberChildInterest('I like shit');
    expect(reply).toContain('school-ready');
    expect(getChildInterests()).toEqual([]);
  });

  it('does not save an unprompted or overly long message', () => {
    expect(tryRememberChildInterest('Today I went to school and played outside.')).toBeNull();
    expect(getChildInterests()).toEqual([]);
  });
});
