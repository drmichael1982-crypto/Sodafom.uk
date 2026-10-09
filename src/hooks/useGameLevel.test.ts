import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const preview = vi.hoisted(() => ({ enabled: true }));
vi.mock('@/lib/config', () => ({ get ARCHIE_PREVIEW() { return preview.enabled; }, API_PREFIX: '/api' }));
import { useGameLevel } from './useGameLevel';

beforeEach(() => {
  localStorage.clear();
  preview.enabled = true;
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 31, ageGroup: '11-13' }));
  localStorage.setItem('sodafom_level_number-pop', JSON.stringify({ level: 4, bestStars: 2, playsAtLevel: 0 }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('saved game progression', () => {
  it('loads and advances device preview progress without using a stale account child', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { result } = renderHook(() => useGameLevel('number-pop'));
    expect(result.current).toMatchObject({ loading: false, level: 4, bestStars: 2 });
    await act(async () => { expect(await result.current.recordResult(3)).toBe(5); });
    expect(result.current).toMatchObject({ loading: false, level: 5, bestStars: 3 });
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop')!)).toMatchObject({ level: 5, bestStars: 3 });
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
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop')!)).toMatchObject({ level: 4, playsAtLevel: 2 });
    await act(async () => { expect(await result.current.recordResult(2)).toBe(5); });
    expect(result.current.level).toBe(5);
    expect(JSON.parse(localStorage.getItem('sodafom_level_number-pop')!)).toMatchObject({ level: 5, playsAtLevel: 0 });
  });
});
