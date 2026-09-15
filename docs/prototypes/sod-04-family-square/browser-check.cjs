'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');
let playwright;
try { playwright = require('playwright'); }
catch {
  const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!modules) throw new Error('Playwright unavailable: browser assertions NOT TESTED');
  playwright = createRequire(path.join(modules, '_sod04.cjs'))('playwright');
}
const sizes = [[320,480],[360,640],[375,812],[390,844],[412,915],[430,932],
  [600,960],[601,960],[768,1024],[820,1180],[1024,768],[1280,800],[852,393]];
(async () => {
  const browser = await playwright.chromium.launch({
    headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {})
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith('file:')
      ? route.continue() : route.abort());
    const url = pathToFileURL(path.join(__dirname, 'Sodafom-Moving-Family-Square.html')).href;
    await page.goto(url);
    const root = '#sodafom-family-square';
    await page.waitForSelector(root + '[data-ready="true"]');
    const state = () => page.$eval(root, el => el.previewState());
    for (const [width, height] of sizes) {
      await page.setViewportSize({width, height});
      await page.waitForTimeout(180);
      const fit = await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('#sodafom-family-square button')]
          .map(button => { const b=button.getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height}; });
        return {buttons, scrollW:document.documentElement.scrollWidth,
          scrollH:document.documentElement.scrollHeight, w:innerWidth,h:innerHeight};
      });
      assert(fit.scrollW <= width + 1 && fit.scrollH <= height + 1, 'Screen overflow ' + width + 'x' + height);
      for (const b of fit.buttons) assert(b.w >= 43.9 && b.h >= 43.9 &&
        b.x >= -1 && b.y >= -1 && b.x+b.w <= width+1 && b.y+b.h <= height+1, 'Button fit ' + width);
      const s = await state();
      assert.equal(s.actors.length, 8);
      assert(s.actors.every(a => a.rotation === 0), 'Upright balloons');
    }
    await page.setViewportSize({width:390,height:844});
    const start = await state();
    await page.waitForTimeout(180);
    assert((await state()).walkTime > start.walkTime);
    await page.click('[data-walk]');
    const stopped = await state();
    await page.waitForTimeout(180);
    assert.equal((await state()).walkTime, stopped.walkTime);
    await page.click('[data-play]');
    const paused = await state();
    const pixels = await page.$eval('canvas', c => c.toDataURL());
    await page.waitForTimeout(180);
    assert.equal((await state()).seconds, paused.seconds);
    assert.equal(await page.$eval('canvas', c => c.toDataURL()), pixels);
    await page.click('[data-follow]');
    assert.equal((await state()).lightsOn, false);
    await page.click('[data-follow]');
    assert.equal((await state()).lightsOn, true);
    const lamp = (await state()).lightHits[0];
    const box = await page.locator('canvas').boundingBox();
    await page.mouse.click(box.x+lamp.x/1024*box.width, box.y+lamp.y/(1024*16/9)*box.height);
    assert((await state()).offLights.includes(lamp.key), 'Individual lamp off');
    await page.click('[data-talk]');
    assert((await page.locator('[data-speech]').textContent()).includes('Archie:'));
    await page.click('button[data-scene="solar"]');
    assert.equal((await state()).actors.length, 9);
    const solar = await state();
    await page.click('[data-play]');
    await page.waitForTimeout(180);
    const advanced = await state();
    assert.deepEqual(advanced.sun, solar.sun);
    const earthBefore = solar.actors.find(a => a.name === 'Earth');
    const earthAfter = advanced.actors.find(a => a.name === 'Earth');
    assert.notEqual(earthBefore.spinAngle, earthAfter.spinAngle);
    assert.notEqual(earthBefore.x, earthAfter.x);
    await page.click('button[data-scene="carousel"]');
    assert.equal((await state()).scene, 'carousel');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal((await state()).playing, false);
    assert.deepEqual(errors, []);
    if (process.env.SOD04_SCREENSHOT_PATH) await page.screenshot({path:process.env.SOD04_SCREENSHOT_PATH});
    console.log(JSON.stringify({result:'PASS',simulatedViewports:sizes,physicalDevices:'NOT TESTED',
      audibleSpeech:'NOT TESTED',actualAppJourney:'NOT TESTED'},null,2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });

