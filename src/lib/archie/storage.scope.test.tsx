import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { updateSavedData, useArchieData, type Activity } from './storage';

const guestActivity: Activity = {
  id: 'guest-book',
  kind: 'book',
  title: 'Guest book',
  stars: 1,
  date: '2026-10-11T00:00:00.000Z',
};

function selectChild(id: number | string, name = 'Learner') {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id, name, ageGroup: '8-10' }));
  window.dispatchEvent(new Event('sodafom:active-child-changed'));
}

function clearChild() {
  localStorage.removeItem('sodafom_active_child');
  window.dispatchEvent(new Event('sodafom:active-child-changed'));
}

function savedBase() {
  return JSON.parse(localStorage.getItem('sodafom_archie_design_v1') || '{}');
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({
    settings: { year: 4, sound: true, largeText: false, onlineHelp: false },
    activities: [guestActivity],
    stickers: ['guest-sticker'],
  }));
});

describe('child-scoped Archie activity and sticker storage', () => {
  it('isolates sibling progress, rerenders on child changes and retains learner-owned settings', () => {
    selectChild(1, 'Mia');
    const { result } = renderHook(() => useArchieData());

    expect(result.current.activities).toEqual([]);
    expect(result.current.stickers).toEqual([]);
    expect(result.current.settings.year).toBe(5);

    act(() => {
      result.current.complete({ id: 'quest-maths-1', kind: 'lesson', title: 'Mia maths quest', stars: 1 });
      updateSavedData(data => ({ ...data, stickers: [...data.stickers, 'gold-key'] }));
    });
    expect(result.current.activities.map(item => item.id)).toEqual(['quest-maths-1']);
    expect(result.current.stickers).toEqual(['gold-key']);

    act(() => selectChild(2, 'Leo'));
    expect(result.current.activities).toEqual([]);
    expect(result.current.stickers).toEqual([]);
    expect(result.current.settings.year).toBe(5);

    act(() => {
      result.current.setSettings({ year: 7 });
      result.current.complete({ id: 'course-science-2', kind: 'lesson', title: 'Leo science lesson', stars: 2 });
    });
    expect(result.current.settings.year).toBe(7);
    expect(result.current.activities.map(item => item.id)).toEqual(['course-science-2']);

    act(() => selectChild(1, 'Mia'));
    expect(result.current.settings.year).toBe(5);
    expect(result.current.activities.map(item => item.id)).toEqual(['quest-maths-1']);
    expect(result.current.stickers).toEqual(['gold-key']);

    expect(JSON.parse(localStorage.getItem('sodafom_archie_progress:1') || '{}')).toMatchObject({
      activities: [expect.objectContaining({ id: 'quest-maths-1' })],
      stickers: ['gold-key'],
    });
    expect(JSON.parse(localStorage.getItem('sodafom_archie_progress:2') || '{}')).toMatchObject({
      activities: [expect.objectContaining({ id: 'course-science-2' })],
      stickers: [],
    });
  });

  it('keeps legacy progress guest-only and restores it when no child is selected', () => {
    selectChild(7, 'Mia');
    const { result } = renderHook(() => useArchieData());
    expect(result.current.activities).toEqual([]);
    expect(result.current.stickers).toEqual([]);

    act(() => result.current.complete({ id: 'child-quest', kind: 'lesson', title: 'Child quest', stars: 1 }));
    expect(savedBase().activities).toEqual([guestActivity]);
    expect(savedBase().stickers).toEqual(['guest-sticker']);

    act(clearChild);
    expect(result.current.activities).toEqual([guestActivity]);
    expect(result.current.stickers).toEqual(['guest-sticker']);
    expect(result.current.activities.some(item => item.id === 'child-quest')).toBe(false);

    act(() => result.current.complete({ id: 'guest-quest', kind: 'lesson', title: 'Guest quest', stars: 1 }));
    expect(savedBase().activities.map((item: Activity) => item.id)).toEqual(['guest-book', 'guest-quest']);

    act(() => selectChild(7, 'Mia'));
    expect(result.current.activities.map(item => item.id)).toEqual(['child-quest']);
  });

  it('encodes string child identifiers without sharing progress', () => {
    selectChild('child/one');
    const { result } = renderHook(() => useArchieData());
    act(() => result.current.complete({ id: 'reading-one', kind: 'book', title: 'Reading one', stars: 1 }));

    expect(localStorage.getItem('sodafom_archie_progress:child%2Fone')).not.toBeNull();

    act(() => selectChild('child two'));
    expect(result.current.activities).toEqual([]);
    act(() => result.current.complete({ id: 'reading-two', kind: 'book', title: 'Reading two', stars: 1 }));

    expect(localStorage.getItem('sodafom_archie_progress:child%20two')).not.toBeNull();
    act(() => selectChild('child/one'));
    expect(result.current.activities.map(item => item.id)).toEqual(['reading-one']);
  });

  it('keeps malformed scoped data out without falling back to guest progress', () => {
    selectChild(9);
    localStorage.setItem('sodafom_archie_progress:9', JSON.stringify({
      activities: [
        { id: 'valid', kind: 'lesson', title: 'Valid lesson', stars: 3, date: '2026-10-11T00:00:00.000Z' },
        { id: 'too-many-stars', kind: 'lesson', title: 'Invalid', stars: 8, date: '2026-10-11T00:00:00.000Z' },
      ],
      stickers: ['valid-sticker', 42],
    }));

    const { result } = renderHook(() => useArchieData());
    expect(result.current.activities.map(item => item.id)).toEqual(['valid']);
    expect(result.current.stickers).toEqual(['valid-sticker']);
    expect(result.current.activities.some(item => item.id === 'guest-book')).toBe(false);
  });
});
