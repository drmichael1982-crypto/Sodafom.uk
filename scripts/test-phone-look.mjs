import test from 'node:test';
import assert from 'node:assert/strict';
import { createLookController, orientationToView, wrapDegrees } from '../public/prototypes/phone-look/controls.mjs';

function events() {
  const listeners = new Map();
  return {
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    emit(name, value) { for (const fn of listeners.get(name) || []) fn(value); },
    count(name) { return listeners.get(name)?.size || 0; },
  };
}
function setup(permission) {
  let timeout;
  const host = {
    ...events(), isSecureContext: true,
    DeviceOrientationEvent: permission ? { requestPermission: permission } : {},
    setTimeout(fn) { timeout = fn; return 1; },
    clearTimeout() { timeout = null; },
  };
  const page = { ...events(), hidden: false };
  const views = [], statuses = [];
  const controller = createLookController({ host, page, onView: (v) => views.push(v), onStatus: (s) => statuses.push(s) });
  return { controller, host, page, views, statuses, expire: () => timeout?.(), sample: (alpha, beta = 90, gamma = 0) => host.emit('deviceorientation', { alpha, beta, gamma }) };
}
function near(actual, expected) { assert.ok(Math.abs(actual - expected) < .00001, `${actual} != ${expected}`); }

test('portrait orientation gives level view and a full 360 turn', () => {
  for (const alpha of [0, 45, 90, 135, 180, 225, 270, 315, 359]) {
    const view = orientationToView({ alpha, beta: 90, gamma: 0 });
    near(wrapDegrees(view.yaw + alpha), 0); near(view.pitch, 0);
  }
});
test('both landscape orientations preserve the same forward direction', () => {
  for (const alpha of [0, 40, 170, 280]) {
    const portrait = orientationToView({ alpha, beta: 90, gamma: 0 });
    const right = orientationToView({ alpha: (alpha + 270) % 360, beta: 0, gamma: 90 });
    const left = orientationToView({ alpha: (alpha + 90) % 360, beta: 0, gamma: -90 });
    near(wrapDegrees(right.yaw - portrait.yaw), 0); near(right.pitch, portrait.pitch);
    near(wrapDegrees(left.yaw - portrait.yaw), 0); near(left.pitch, portrait.pitch);
  }
});
test('null, partial and non-finite readings are ignored; poles have no heading', () => {
  for (const alpha of [null, undefined, NaN, Infinity, '0']) assert.equal(orientationToView({ alpha, beta: 90, gamma: 0 }), null);
  assert.equal(orientationToView({ alpha: 0, beta: null, gamma: 0 }), null);
  assert.equal(orientationToView({ alpha: 0, beta: 0, gamma: 0 }).yaw, null);
});
test('motion is opt-in and permission is invoked synchronously on start', async () => {
  let calls = 0;
  const f = setup(() => { calls++; return Promise.resolve('granted'); });
  assert.equal(calls, 0); assert.equal(f.host.count('deviceorientation'), 0);
  const pending = f.controller.startMotion();
  assert.equal(calls, 1);
  await pending;
  assert.equal(f.controller.getState(), 'waiting');
  f.sample(42); assert.equal(f.controller.getState(), 'motion');
  near(f.controller.getView().yaw, 0);
  f.controller.dispose();
});
test('denied/rejected permission, insecure contexts and missing API retain manual controls', async () => {
  for (const request of [async () => 'denied', async () => { throw Error('blocked'); }]) {
    const f = setup(request); await f.controller.startMotion();
    assert.equal(f.controller.getState(), 'denied'); assert.equal(f.host.count('deviceorientation'), 0);
    f.controller.move(20, 10); assert.deepEqual(f.controller.getView(), { yaw: 20, pitch: 10 });
    f.controller.dispose();
  }
  for (const change of [f => f.host.isSecureContext = false, f => delete f.host.DeviceOrientationEvent]) {
    const f = setup(); change(f); await f.controller.startMotion();
    assert.equal(f.controller.getState(), 'unavailable'); assert.equal(f.host.count('deviceorientation'), 0);
    f.controller.dispose();
  }
});
test('no valid sensor events times out to manual controls and removes listeners', async () => {
  const f = setup(); await f.controller.startMotion(); f.sample(null); f.expire();
  assert.equal(f.controller.getState(), 'unavailable'); assert.equal(f.host.count('deviceorientation'), 0);
  f.controller.dispose();
});
test('sensor heading crosses zero without a jump and calibration avoids initial snapping', async () => {
  const f = setup(); f.controller.move(20, 5); await f.controller.startMotion();
  f.sample(359); assert.deepEqual(f.controller.getView(), { yaw: 20, pitch: 5 });
  f.sample(1, 100); near(f.controller.getView().yaw, 18); near(f.controller.getView().pitch, 15);
  f.controller.recenter(); f.sample(1, 100); assert.deepEqual(f.controller.getView(), { yaw: 0, pitch: 0 });
  f.sample(11, 110); near(f.controller.getView().yaw, -10); near(f.controller.getView().pitch, 10);
  f.controller.dispose();
});
test('drag/buttons stop sensor control, wrap horizontal travel and clamp pitch', async () => {
  const f = setup(); await f.controller.startMotion(); f.sample(10);
  f.controller.move(380, 1000); assert.deepEqual(f.controller.getView(), { yaw: 20, pitch: 85 });
  assert.equal(f.host.count('deviceorientation'), 0);
  f.sample(100); assert.deepEqual(f.controller.getView(), { yaw: 20, pitch: 85 });
  f.controller.move(-380, -1000); assert.deepEqual(f.controller.getView(), { yaw: 0, pitch: -85 });
  f.controller.move(NaN, Infinity); assert.deepEqual(f.controller.getView(), { yaw: 0, pitch: -85 });
  f.controller.dispose();
});
test('leaving the page pauses sensors without restarting automatically on return', async () => {
  const f = setup(); await f.controller.startMotion(); f.sample(0);
  f.page.hidden = true; f.page.emit('visibilitychange');
  assert.equal(f.host.count('deviceorientation'), 0); assert.equal(f.controller.getState(), 'manual');
  f.page.hidden = false; f.page.emit('visibilitychange'); assert.equal(f.host.count('deviceorientation'), 0);
  f.controller.dispose(); assert.equal(f.page.count('visibilitychange'), 0);
});
test('late permission grant cannot restart after stop, hide or dispose', async () => {
  for (const action of ['stop', 'hide', 'dispose']) {
    let resolve;
    const f = setup(() => new Promise(r => { resolve = r; }));
    const pending = f.controller.startMotion();
    if (action === 'stop') f.controller.stopMotion();
    if (action === 'hide') { f.page.hidden = true; f.page.emit('visibilitychange'); }
    if (action === 'dispose') f.controller.dispose();
    resolve('granted'); await pending;
    assert.equal(f.host.count('deviceorientation'), 0);
    assert.equal(f.controller.getState(), 'manual');
    f.controller.dispose();
  }
});
