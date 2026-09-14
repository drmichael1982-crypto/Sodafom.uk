import { describe, expect, it } from 'vitest';
import { createRoomClock, orbit3D } from './animation-clock';
import { ROOM_SKINS, ROOM_SURPRISES, createSurpriseBag, isRoomSkin, resolveRoomAction } from './room-config';

describe('skin-owned action mapping', () => {
  it('routes the actual book and aircraft activities and separates skin hit areas', () => {
    expect(resolveRoomAction('colouring', 'open-book')).toEqual({ kind: 'route', href: '/games/colour-book' });
    expect(resolveRoomAction('geography', 'aircraft-quiz')).toEqual({ kind: 'route', href: '/games/geography-quiz' });
    expect(resolveRoomAction('geography', 'uk-luggage')).toEqual({ kind: 'route', href: '/games/geography-uk' });
    for (const [skin, definition] of Object.entries(ROOM_SKINS)) {
      for (const hotspot of definition.hotspots) {
        expect(resolveRoomAction(skin, hotspot.id)).toEqual(hotspot.action);
        for (const other of Object.keys(ROOM_SKINS).filter(key => key !== skin)) expect(resolveRoomAction(other, hotspot.id)).toBeNull();
      }
    }
    expect(ROOM_SKINS.planets.hotspots[0].position).not.toEqual(ROOM_SKINS.colouring.hotspots[0].position);
    expect(ROOM_SKINS.colouring.hotspots[0].position).not.toEqual(ROOM_SKINS.geography.hotspots[0].position);
  });

  it.each([null, undefined, {}, 5, 'constructor', '__proto__', 'unknown'])('rejects invalid skin %s without throwing', value => {
    expect(isRoomSkin(value)).toBe(false);
    expect(resolveRoomAction(value, 'open-book')).toBeNull();
  });

  it('rejects injected hotspot IDs and non-string input', () => {
    for (const value of [null, {}, '/games/colour-book', 'constructor', 'javascript:alert(1)']) expect(resolveRoomAction('colouring', value)).toBeNull();
  });
});

describe('surprises are bounded and varied', () => {
  it.each([0, .4, 1, NaN, -50])('does not repeat within a bag or immediately across bags with random=%s', sample => {
    const next = createSurpriseBag(() => sample);
    const values = Array.from({ length: 16 }, () => next());
    for (let start = 0; start < values.length; start += 4) expect(new Set(values.slice(start, start + 4)).size).toBe(4);
    values.forEach((value, index) => { expect(ROOM_SURPRISES).toContain(value); if (index) expect(value).not.toBe(values[index - 1]); });
  });
});

function clockHarness() {
  const frames = new Map<number, FrameRequestCallback>();
  const times: number[] = [];
  let id = 0;
  const clock = createRoomClock(time => times.push(time), { request: callback => { frames.set(++id, callback); return id; }, cancel: frame => frames.delete(frame) });
  const advance = (now: number) => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); };
  return { clock, frames, times, advance };
}

describe('animation resources and time', () => {
  it('stops on pause/hidden/disposal, and resumes without background catch-up', () => {
    const { clock, frames, times, advance } = clockHarness();
    clock.setPlaying(true); advance(0); advance(100);
    expect(times.at(-1)).toBeCloseTo(.1);
    clock.setVisible(false); expect(frames.size).toBe(0);
    clock.setVisible(true); advance(90000); expect(times.at(-1)).toBeCloseTo(.1);
    clock.setSpeed(2); advance(90100); expect(times.at(-1)).toBeCloseTo(.3);
    clock.setPlaying(false); expect(frames.size).toBe(0);
    clock.setPlaying(true); expect(frames.size).toBe(1);
    clock.dispose(); clock.setPlaying(true); clock.redraw(); expect(frames.size).toBe(0);
  });

  it('ignores invalid speed and clamps a stalled frame', () => {
    const { clock, times, advance } = clockHarness();
    clock.setSpeed(NaN); clock.setSpeed(-1); clock.setSpeed(100);
    clock.setPlaying(true); advance(0); advance(10000);
    expect(times.at(-1)).toBeCloseTo(.1);
  });

  it('cannot reschedule after disposal inside the draw callback', () => {
    let callback: FrameRequestCallback | undefined;
    let requests = 0;
    const clock = createRoomClock(() => clock.dispose(), { request: fn => { callback = fn; return ++requests; }, cancel: () => {} });
    clock.setPlaying(true); callback?.(10); expect(requests).toBe(1);
  });

  it('uses prograde orbital geometry around +Y at constant mid-room height', () => {
    expect(orbit3D(0, 2, 40)).toEqual({ x: 2, y: .4, z: -0 });
    const quarter = orbit3D(10, 2, 40);
    expect(quarter.x).toBeCloseTo(0); expect(quarter.z).toBeCloseTo(-2); expect(quarter.y).toBe(.4);
  });
});
