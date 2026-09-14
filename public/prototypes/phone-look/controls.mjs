// Phone look controls: renderer-independent, no storage or network access.
const radians = Math.PI / 180;
export const wrapDegrees = (value) => ((value + 180) % 360 + 360) % 360 - 180;
export const clampPitch = (value) => Math.max(-85, Math.min(85, value));

/** W3C Z-X'-Y'' rotation applied to the direction out of the phone's back.
 * Using the back normal supports both screen orientations and keeps the horizon
 * level. At the vertical poles yaw is undefined; retain the previous heading.
 */
export function orientationToView({ alpha, beta, gamma }) {
  if (![alpha, beta, gamma].every(Number.isFinite)) return null;
  const a = alpha * radians, b = beta * radians, g = gamma * radians;
  const x = -Math.cos(a) * Math.sin(g) - Math.sin(a) * Math.sin(b) * Math.cos(g);
  const y = -Math.sin(a) * Math.sin(g) + Math.cos(a) * Math.sin(b) * Math.cos(g);
  const z = -Math.cos(b) * Math.cos(g);
  const horizontal = Math.hypot(x, y);
  return {
    yaw: horizontal < 0.0001 ? null : Math.atan2(x, y) / radians,
    pitch: Math.atan2(z, horizontal) / radians,
  };
}

/** Call startMotion directly from a user click. Dispose on unmount/page exit. */
export function createLookController({ host = window, page = document, onView, onStatus }) {
  let view = { yaw: 0, pitch: 0 };
  let state = 'manual', active = false, disposed = false, generation = 0;
  let origin = null, anchor = { ...view }, previousYaw = 0, timer;
  const publish = () => onView({ ...view });
  const status = (value) => { state = value; onStatus(value); };
  function stopMotion(reason = 'manual') {
    generation++;
    active = false;
    origin = null;
    host.clearTimeout(timer);
    host.removeEventListener('deviceorientation', onOrientation);
    if (!disposed) status(reason);
  }
  function onOrientation(event) {
    if (!active || disposed || page.hidden) return;
    const reading = orientationToView(event);
    if (!reading) return;
    // Wait for an unambiguous heading before the first calibration.
    if (!origin && reading.yaw === null) return;
    if (reading.yaw !== null) previousYaw = reading.yaw;
    reading.yaw = previousYaw;
    if (!origin) {
      origin = reading;
      anchor = { ...view };
      host.clearTimeout(timer);
      status('motion');
    }
    view = {
      yaw: wrapDegrees(anchor.yaw + wrapDegrees(reading.yaw - origin.yaw)),
      pitch: clampPitch(anchor.pitch + reading.pitch - origin.pitch),
    };
    publish();
  }
  async function startMotion() {
    if (disposed) return;
    stopMotion();
    if (page.hidden) return;
    const api = host.DeviceOrientationEvent;
    if (!host.isSecureContext || !api) { status('unavailable'); return; }
    const request = generation;
    status('permission');
    try {
      // Invoke before the first await, preserving the browser's user activation.
      const permission = typeof api.requestPermission === 'function'
        ? await api.requestPermission() : 'granted';
      if (request !== generation || disposed || page.hidden) return;
      if (permission !== 'granted') { status('denied'); return; }
      active = true;
      status('waiting');
      host.addEventListener('deviceorientation', onOrientation);
      timer = host.setTimeout(() => stopMotion('unavailable'), 5000);
    } catch {
      if (request === generation && !disposed) stopMotion('denied');
    }
  }
  function move(yaw, pitch) {
    if (disposed || ![yaw, pitch].every(Number.isFinite)) return;
    stopMotion();
    view = { yaw: wrapDegrees(view.yaw + yaw), pitch: clampPitch(view.pitch + pitch) };
    publish();
  }
  function recenter() {
    if (disposed) return;
    view = { yaw: 0, pitch: 0 };
    // Re-anchor the next reading without asking for permission again.
    origin = null;
    publish();
  }
  function visibility() { if (page.hidden) stopMotion(); }
  page.addEventListener('visibilitychange', visibility);
  publish();
  status('manual');
  return {
    startMotion, stopMotion, move, recenter,
    getState: () => state,
    getView: () => ({ ...view }),
    dispose() {
      if (disposed) return;
      stopMotion();
      disposed = true;
      page.removeEventListener('visibilitychange', visibility);
    },
  };
}
