import { createLookController } from './controls.mjs';

const canvas = document.querySelector('#room');
const ctx = canvas.getContext('2d');
const motionButton = document.querySelector('#motion');
const statusText = document.querySelector('#status');
const rad = Math.PI / 180;
let view = { yaw: 0, pitch: 0 }, width = 1, height = 1, frame = 0;
const names = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const colours = ['#ffd17b', '#b5b9c6', '#f9c891', '#78c4ff', '#ff9375', '#e8b58e', '#ead5a6', '#9eece9', '#8c9dff'];
const planets = names.map((name, i) => ({
  name, yaw: i * 40, pitch: 8 + Math.sin(i * 1.4) * 12,
  radius: i === 0 ? 14 : i === 5 ? 10 : 6 + i % 3,
  colour: colours[i],
}));
// Fixed pseudo-random star positions: stable between renders, no idle animation.
const stars = Array.from({ length: 380 }, (_, i) => ({
  yaw: (i * 137.508) % 360, pitch: 5 + ((i * 29.71) % 79),
  bright: i % 5 === 0,
}));

function project(yaw, pitch) {
  const longitude = (yaw - view.yaw) * rad, latitude = pitch * rad;
  const cp = Math.cos(view.pitch * rad), sp = Math.sin(view.pitch * rad);
  const x = Math.sin(longitude) * Math.cos(latitude);
  const y = Math.sin(latitude) * cp - Math.cos(longitude) * Math.cos(latitude) * sp;
  const z = Math.sin(latitude) * sp + Math.cos(longitude) * Math.cos(latitude) * cp;
  if (z < 0.12) return null;
  const focal = Math.min(width, height) * 0.85;
  return { x: width / 2 + focal * x / z, y: height / 2 - focal * y / z, scale: focal / z };
}

function line(yaw1, pitch1, yaw2, pitch2) {
  const a = project(yaw1, pitch1), b = project(yaw2, pitch2);
  if (!a || !b) return;
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
}

function draw() {
  frame = 0;
  if (!ctx || document.hidden) return;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#080d25'); sky.addColorStop(0.55, '#192554'); sky.addColorStop(1, '#322958');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
  for (const star of stars) {
    const p = project(star.yaw, star.pitch);
    if (!p) continue;
    ctx.fillStyle = star.bright ? '#fff5d2' : '#b5c9e2';
    ctx.beginPath(); ctx.arc(p.x, p.y, star.bright ? 1.7 : 0.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#6577a44d';
  for (let pitch = -10; pitch >= -80; pitch -= 10) {
    for (let yaw = 0; yaw < 360; yaw += 3) line(yaw, pitch, yaw + 3, pitch);
  }
  for (let yaw = 0; yaw < 360; yaw += 20) {
    for (let pitch = -5; pitch > -85; pitch -= 5) line(yaw, pitch, yaw, pitch - 5);
  }
  ctx.strokeStyle = '#ebbf7090'; ctx.lineWidth = 2;
  for (let yaw = 0; yaw < 360; yaw += 3) line(yaw, -5, yaw + 3, -5);
  for (const planet of planets) {
    const p = project(planet.yaw, planet.pitch);
    if (!p) continue;
    const radius = p.scale * Math.sin(planet.radius * rad);
    if (p.x + radius < 0 || p.x - radius > width) continue;
    const sphere = ctx.createRadialGradient(p.x - radius * .35, p.y - radius * .35, radius * .05, p.x + radius * .15, p.y + radius * .1, radius * 1.15);
    sphere.addColorStop(0, '#fff6da'); sphere.addColorStop(.35, planet.colour); sphere.addColorStop(1, planet.name === 'Sun' ? '#ce652c' : '#161d39');
    if (planet.name === 'Sun') {
      ctx.shadowColor = '#ffc465'; ctx.shadowBlur = 40;
    }
    ctx.fillStyle = sphere;
    ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (planet.name === 'Saturn') {
      ctx.strokeStyle = '#f6deaf'; ctx.lineWidth = Math.max(3, radius * .12);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, radius * 1.65, radius * .3, -.25, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff5e3'; ctx.fillText(planet.name, p.x, p.y + radius + 26);
  }
}
function scheduleDraw() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }
function resize() {
  const box = canvas.getBoundingClientRect();
  width = box.width; height = box.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  scheduleDraw();
}
const messages = {
  manual: 'Swipe the picture or use the arrows to look around.',
  permission: 'Waiting for movement permission. Swipe controls still work.',
  waiting: 'Hold your phone up and turn it gently.',
  motion: 'Turn or tilt your phone to look around.',
  denied: 'Movement access was not allowed. You can still swipe or use the arrows.',
  unavailable: 'Phone movement is unavailable here. Use swipe or arrow controls.',
};
const controller = createLookController({
  onView(next) { view = next; scheduleDraw(); },
  onStatus(state) {
    const usingMotion = ['permission', 'waiting', 'motion'].includes(state);
    motionButton.setAttribute('aria-pressed', String(usingMotion));
    motionButton.textContent = usingMotion ? 'Use swipe controls' : 'Move phone to look';
    statusText.textContent = ctx ? messages[state] : 'The space picture is unavailable in this browser. Open the description below.';
  },
});
motionButton.addEventListener('click', () => {
  if (['permission', 'waiting', 'motion'].includes(controller.getState())) controller.stopMotion();
  else void controller.startMotion();
});
document.querySelector('#reset').addEventListener('click', controller.recenter);
for (const button of document.querySelectorAll('[data-yaw]')) {
  button.addEventListener('click', () => controller.move(Number(button.dataset.yaw), Number(button.dataset.pitch)));
}
let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (drag?.id !== event.pointerId) return;
  controller.move(-(event.clientX - drag.x) * .22, (event.clientY - drag.y) * .22);
  drag.x = event.clientX; drag.y = event.clientY;
});
function endDrag(event) { if (drag?.id === event.pointerId) drag = null; }
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('lostpointercapture', endDrag);
canvas.addEventListener('keydown', (event) => {
  const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] };
  if (event.key === 'Home') { event.preventDefault(); controller.recenter(); }
  else if (directions[event.key]) { event.preventDefault(); controller.move(...directions[event.key]); }
});
const observer = new ResizeObserver(resize);
observer.observe(canvas);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; drag = null; }
  else scheduleDraw();
});
// A bfcache restore returns in manual mode and may be explicitly enabled again.
window.addEventListener('pagehide', () => { controller.stopMotion(); cancelAnimationFrame(frame); frame = 0; });
window.addEventListener('pageshow', resize);
resize();
