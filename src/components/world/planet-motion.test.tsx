import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlanetRoom from './PlanetRoom';
import { PLANETS, orbitPosition, progradeDegrees } from './planet-motion';
import { usePlanetMotion } from './usePlanetMotion';

let frames: Map<number, FrameRequestCallback>;
let frameId = 0;
let preferenceChanged: (() => void) | undefined;
let reduced = false;

function advanceFrame(now: number) {
  const pending = [...frames.values()];
  frames.clear();
  act(() => pending.forEach(callback => callback(now)));
}

beforeEach(() => {
  frames = new Map();
  reduced = false;
  preferenceChanged = undefined;
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, listener: () => void) => { preferenceChanged = listener; },
    removeEventListener: vi.fn(),
  })));
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('planet direction and independent spin', () => {
  it('moves counterclockwise from right to top in SVG coordinates', () => {
    expect(orbitPosition(0, 100, 40)).toEqual({ x: 100, y: 0 });
    const quarter = orbitPosition(10, 100, 40);
    expect(quarter.x).toBeCloseTo(0);
    expect(quarter.y).toBeCloseTo(-100);
    expect(progradeDegrees(2, 8)).toBe(-90);
  });

  it('keeps eight ordered, nested orbits with slower outer teaching periods', () => {
    expect(PLANETS.map(planet => planet.name)).toEqual(['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']);
    PLANETS.slice(1).forEach((planet, index) => {
      expect(planet.radius).toBeGreaterThan(PLANETS[index].radius);
      expect(planet.period).toBeGreaterThan(PLANETS[index].period);
    });
  });
});

describe('planet animation lifecycle', () => {
  it('pauses its clock, changes speed, and releases its frame on unmount', () => {
    const { result, unmount } = renderHook(() => usePlanetMotion());
    advanceFrame(0); advanceFrame(100);
    expect(result.current.seconds).toBeCloseTo(.1);
    act(() => result.current.setPlaying(false));
    expect(frames.size).toBe(0);
    expect(result.current.seconds).toBeCloseTo(.1);
    act(() => { result.current.setSpeed(2); result.current.setPlaying(true); });
    advanceFrame(1000); advanceFrame(1100);
    expect(result.current.seconds).toBeCloseTo(.3);
    unmount();
    expect(frames.size).toBe(0);
  });

  it('freezes in a hidden tab without catching up elapsed background time', () => {
    const { result } = renderHook(() => usePlanetMotion());
    advanceFrame(0); advanceFrame(100);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(frames.size).toBe(0);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    advanceFrame(20000);
    expect(result.current.seconds).toBeCloseTo(.1);
    advanceFrame(20100);
    expect(result.current.seconds).toBeCloseTo(.2);
  });

  it('starts paused for reduced motion and pauses if that preference changes', () => {
    reduced = true;
    const { result } = renderHook(() => usePlanetMotion());
    expect(result.current.playing).toBe(false);
    expect(frames.size).toBe(0);
    act(() => result.current.setPlaying(true));
    expect(frames.size).toBe(1);
    act(() => preferenceChanged?.());
    expect(result.current.playing).toBe(false);
    expect(frames.size).toBe(0);
  });
});

describe('planet room controls', () => {
  it('exposes touch/keyboard controls, text facts, and a scale explanation', () => {
    render(<PlanetRoom />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause motion' }));
    expect(screen.getByRole('button', { name: 'Play motion' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Speed'), { target: { value: '2' } });
    expect(screen.getByLabelText('Speed')).toHaveValue('2');
    fireEvent.click(screen.getByRole('button', { name: 'Neptune' }));
    expect(screen.getByRole('button', { name: 'Neptune' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Neptune is the farthest planet from the Sun.')).toBeInTheDocument();
    expect(screen.getByText(/Sizes, distances and speeds are not to scale/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('button', { name: 'Play motion' })).toBeInTheDocument();
  });
});
