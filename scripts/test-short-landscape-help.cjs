const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.ARCHIE_CHROMIUM_PATH ? { executablePath: process.env.ARCHIE_CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, reducedMotion: 'reduce' });
    for (const route of ['/games', '/library']) {
      await page.goto(base + route);
      const help = page.locator('.a-page-help').getByRole('button', { name: 'Ask Archie', exact: true });
      await help.waitFor({ state: 'visible' });
      const bounds = await help.boundingBox();
      assert(bounds && bounds.height >= 44 && bounds.y >= 0 && bounds.y + bounds.height <= 390, `${route}: tutor action must remain touchable inside the landscape viewport`);
      const controls = await page.locator('.app-screen-controls').boundingBox();
      assert(controls && controls.y >= 0 && controls.y + controls.height <= 391, `${route}: page controls must remain reachable`);
      await help.click();
      await page.getByLabel('Your question for Archie').waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Close Ask Archie', exact: true }).click();
    }
    console.log('Short landscape tutor help passed on /games and /library.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
