type Scheduler = { request: (callback: FrameRequestCallback) => number; cancel: (id: number) => void };

export function createRoomClock(draw: (seconds: number) => void, scheduler: Scheduler) {
  let frame: number | undefined;
  let previous: number | undefined;
  let seconds = 0;
  let playing = false;
  let visible = true;
  let disposed = false;
  let speed = 1;
  const stop = () => { if (frame !== undefined) scheduler.cancel(frame); frame = undefined; previous = undefined; };
  const tick = (now: number) => {
    frame = undefined;
    if (disposed || !playing || !visible) return;
    if (previous !== undefined) seconds += Math.min(.1, Math.max(0, (now - previous) / 1000)) * speed;
    previous = now;
    draw(seconds);
    if (!disposed && playing && visible) frame = scheduler.request(tick);
  };
  const sync = () => { stop(); if (!disposed && playing && visible) frame = scheduler.request(tick); };
  return {
    setPlaying(value: boolean) { playing = value; sync(); },
    setVisible(value: boolean) { visible = value; sync(); },
    setSpeed(value: number) { if (Number.isFinite(value) && value >= .5 && value <= 2) speed = value; },
    redraw() { if (!disposed && visible) draw(seconds); },
    dispose() { disposed = true; stop(); },
  };
}

/** Right-handed +Y rotation: viewed from north (+Y), motion is prograde. */
export function orbit3D(seconds: number, radius: number, period: number, phase = 0) {
  const angle = phase + seconds / period * Math.PI * 2;
  return { x: radius * Math.cos(angle), y: .4, z: -radius * Math.sin(angle) };
}
