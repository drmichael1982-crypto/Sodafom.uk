const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const captureDir = path.resolve(process.env.ARCHIE_CAPTURE_DIR || 'test-results/short-landscape-help');
(async () => {
  mkdirSync(captureDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ARCHIE_CHROMIUM_PATH ? { executablePath: process.env.ARCHIE_CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    for (const route of ['/games', '/library']) {
      await page.goto(base + route);
      const help = page.locator('.a-page-help').getByRole('button', { name: 'Ask Archie', exact: true });
      await help.waitFor({ state: 'visible' });
      const bounds = await help.boundingBox();
      assert(bounds && bounds.height >= 44 && bounds.y >= 0 && bounds.y + bounds.height <= 390, `${route}: tutor action must remain touchable inside the landscape viewport`);
      const controls = await page.locator('.app-screen-controls').boundingBox();
      assert.equal(controls, null, `${route}: horizontal pager should be removed on a short landscape screen`);
      await help.click();
      await page.getByLabel('Your question for Archie').waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Close Ask Archie', exact: true }).click();

      const routeContent = page.locator('.picture-route-content:not([hidden])');
      const scrollMetrics = await routeContent.evaluate(element => ({
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      }));
      assert(scrollMetrics.clientHeight > 0 && scrollMetrics.scrollHeight > scrollMetrics.clientHeight,
        `${route}: route content should provide one contained vertical scroll area`);
      assert(['auto', 'scroll'].includes(scrollMetrics.overflowY), `${route}: route content must own vertical scrolling`);

      const firstActivity = route === '/games' ? page.locator('.a-card').first() : page.locator('.a-book').first();
      await firstActivity.scrollIntoViewIfNeeded();
      const activityBounds = await firstActivity.boundingBox();
      assert(activityBounds && activityBounds.height >= 100 && activityBounds.y < 390 && activityBounds.y + activityBounds.height > 44,
        `${route}: the first activity must be readable and reachable`);

      const footer = page.locator('.a-bottom').first();
      await footer.scrollIntoViewIfNeeded();
      const footerBounds = await footer.boundingBox();
      assert(footerBounds && footerBounds.y >= 44 && footerBounds.y + footerBounds.height <= 391,
        `${route}: the main navigation must be reachable inside the landscape viewport`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true,
        `${route}: page must not overflow horizontally`);
      await page.screenshot({ path: path.join(captureDir, `${route.slice(1)}-844x390.png`) });
    }
    assert.deepEqual(errors, []);
    console.log('Short landscape tutor help, activities and navigation passed on /games and /library.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
