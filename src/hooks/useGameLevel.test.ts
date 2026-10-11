import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const preview = vi.hoisted(() => ({ enabled: true }));
vi.mock('@/lib/config', () => ({ get ARCHIE_PREVIEW() { return preview.enabled; }, API_PREFIX: '/api' }));
import { useGameLevel } from './useGameLevel';

beforeEach(() => {
  localStorage.clear();
  preview.enabled = true;
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 31, ageGroup: '11-13' }));
  localStorage.setItem('sodafom_level_number-pop:child:31', JSON.stringify({ level: 4, bestStars: 2, playsAtLevel: 0 }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('saved game progression', () => {
  it.each(['null', '[]', '{"level":"4","bestStars":"3","playsAtLevel":-1}', '{"level":99,"bestStars":12,"playsAtLevel":0}'])('recovers from invalid stored progress %s and can save a new result', async (raw) => {
    localStorage.setItem('sodafom_level_number-pop:child:31', raw);
    vi.stubGlobal('fetch', vi.fn());
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 1, bestStars: 0 });
    await act(async () => { expect(await result.current.recordResult(2)).toBe(2); });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toEqual({ level: 2, bestStars: 2, playsAtLevel: 0 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps valid achievements when only the saved play counter is invalid', async () => {
    localStorage.setItem('sodafom_level_number-pop:child:31', JSON.stringify({ level: 4, bestStars: 3, playsAtLevel: -2 }));
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ level: 4, bestStars: 3 });
    await act(async () => { expect(await result.current.recordResult(0)).toBe(4); });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toEqual({ level: 4, bestStars: 3, playsAtLevel: 1 });
  });
  it('loads and advances device preview progress without using a stale account child', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 4, bestStars: 2 });
    await act(async () => { expect(await result.current.recordResult(3)).toBe(5); });
    expect(result.current).toMatchObject({ loading: false, level: 5, bestStars: 3 });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toMatchObject({ level: 5, bestStars: 3 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('preserves local progress when an account request receives an HTTP error', async () => {
    preview.enabled = false;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const { result } = renderHook(() => useGameLevel('number-pop'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ level: 4, bestStars: 2 });
  });
  it('keeps zero and one-star rounds at the current level, then advances after two stars', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { result } = renderHook(() => useGameLevel('number-pop'));
    for (const stars of [0, 1]) {
      await act(async () => { expect(await result.current.recordResult(stars)).toBe(4); });
      expect(result.current.level).toBe(4);
    }
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toMatchObject({ level: 4, playsAtLevel: 2 });
    await act(async () => { expect(await result.current.recordResult(2)).toBe(5); });
    expect(result.current.level).toBe(5);
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toMatchObject({ level: 5, playsAtLevel: 0 });
  });

  it('keeps device-only progress separate when the active child changes', async () => {
    localStorage.setItem('sodafom_level_number-pop:child:52', JSON.stringify({ level: 2, bestStars: 1, playsAtLevel: 3 }));
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 4, bestStars: 2 });

    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 52, ageGroup: '5-7' }));
    act(() => window.dispatchEvent(new Event('sodafom:active-child-changed')));
    await waitFor(() => expect(result.current).toMatchObject({ loading: false, level: 2, bestStars: 1 }));
    await act(async () => { expect(await result.current.recordResult(2)).toBe(3); });

    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:52')!)).toMatchObject({ level: 3, bestStars: 2 });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop:child:31')!)).toMatchObject({ level: 4, bestStars: 2 });
  });

  it('preserves the legacy unscoped key for a profile-less guest', async () => {
    localStorage.removeItem('sodafom_active_child');
    localStorage.setItem('sodafom_level_number-pop', JSON.stringify({ level: 6, bestStars: 2, playsAtLevel: 1 }));
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 6, bestStars: 2 });
    await act(async () => { expect(await result.current.recordResult(1)).toBe(6); });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop')!)).toMatchObject({ level: 6, playsAtLevel: 2 });
  });

  it('does not leak legacy guest progress into an active child profile', () => {
    localStorage.removeItem('sodafom_level_number-pop:child:31');
    localStorage.setItem('sodafom_level_number-pop', JSON.stringify({ level: 9, bestStars: 3, playsAtLevel: 0 }));
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 1, bestStars: 0 });
  });
});
