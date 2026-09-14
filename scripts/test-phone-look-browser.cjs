// Optional local browser check. Requires Playwright and its Chromium browser.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(require.resolve('playwright', {
  paths: [process.cwd(), ...(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES] : [])],
}));
const directory = path.resolve(__dirname, '../public/prototypes/phone-look');

test('360 preview browser flow: desktop, phone sizes, touch, keyboard and simulated permission', async (t) => {
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'demo.mjs', 'controls.mjs'].includes(name)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', name.endsWith('.html') ? 'text/html' : 'text/javascript');
    res.end(fs.readFileSync(path.join(directory, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const url = `http://127.0.0.1:${server.address().port}/`;
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1280, height: 800 }]) {
    const context = await browser.newContext({ viewport, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => { if (!req.url().startsWith(url)) external.push(req.url()); });
    await page.addInitScript(() => {
      window.testPermission = 'granted'; window.testPermissionCalls = 0;
      Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: {
        requestPermission: () => { window.testPermissionCalls++; return Promise.resolve(window.testPermission); },
      } });
    });
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Swipe'));
    assert.equal(await page.evaluate(() => window.testPermissionCalls), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const snap = () => page.locator('canvas').evaluate(c => c.toDataURL());
    const initial = await snap();
    await page.getByRole('button', { name: 'Look right', exact: true }).click();
    await page.waitForTimeout(60);
    assert.notEqual(await snap(), initial);
    await page.getByRole('button', { name: 'Reset view' }).click(); await page.waitForTimeout(60);
    assert.equal(await snap(), initial);
    await page.locator('canvas').focus(); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(60);
    assert.notEqual(await snap(), initial);
    // Native Chromium touch events exercise real pointer capture and drag handling.
    await page.getByRole('button', { name: 'Reset view' }).click(); await page.waitForTimeout(60);
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const box = await page.locator('canvas').boundingBox();
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2, y = box.y + Math.min(box.height / 2, 90);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 80, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(60); assert.notEqual(await snap(), initial);
    await page.getByRole('button', { name: 'Move phone to look' }).click();
    const sample = async (alpha, beta = 90, gamma = 0) => page.evaluate(({ alpha, beta, gamma }) => {
      const event = new Event('deviceorientation'); Object.assign(event, { alpha, beta, gamma }); window.dispatchEvent(event);
    }, { alpha, beta, gamma });
    await sample(359); await page.waitForTimeout(60);
    const before = await snap(); await sample(30, 105); await page.waitForTimeout(60);
    assert.notEqual(await snap(), before);
    assert.match(await page.locator('#status').textContent(), /Turn or tilt/);
    await page.getByRole('button', { name: 'Use swipe controls' }).click();
    const stopped = await snap(); await sample(100); await page.waitForTimeout(60); assert.equal(await snap(), stopped);
    await page.evaluate(() => { window.testPermission = 'denied'; });
    await page.getByRole('button', { name: 'Move phone to look' }).click();
    assert.match(await page.locator('#status').textContent(), /not allowed/);
    await page.getByRole('button', { name: 'Look right', exact: true }).click(); await page.waitForTimeout(60);
    assert.notEqual(await snap(), stopped);
    // With no interaction there is no scene animation, including reduced motion.
    const still = await snap(); await page.waitForTimeout(120); assert.equal(await snap(), still);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    if (process.env.SODAFOM_PREVIEW_SCREENSHOT && viewport.width === 390) {
      await page.getByRole('button', { name: 'Reset view' }).click(); await page.waitForTimeout(60);
      await page.screenshot({ path: process.env.SODAFOM_PREVIEW_SCREENSHOT, fullPage: true });
    }
    await context.close();
  }
});
