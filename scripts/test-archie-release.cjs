const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.ARCHIE_CHROMIUM_PATH ? { executablePath: process.env.ARCHIE_CHROMIUM_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.goto(base);
    for (const [name, route] of [['My world', '/world'], ['Games', '/games'], ['Lessons', '/courses'], ['Whiteboard', '/lesson'], ['Parents', '/parents'], ['Rewards', '/rewards'], ['Stickers', '/stickers'], ['Cartoons', '/cartoons'], ['Progress', '/progress'], ['Settings', '/settings']]) {
      await page.goto(base); await page.getByRole('link', { name, exact: true }).click(); await page.waitForURL(base + route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    await page.goto(base + '/lesson');
    await page.getByRole('button', { name: 'Try spelling', exact: true }).click();
    await page.getByLabel('Your spelling').fill('mistake');
    await page.getByRole('button', { name: 'Rubber: clear spelling', exact: true }).click();
    assert.equal(await page.getByLabel('Your spelling').inputValue(), '');
    await page.getByLabel('Your spelling').fill('Wednesday');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.getByText('Brilliant! You spelled it correctly.').waitFor();
    await page.getByRole('button', { name: 'Next word', exact: true }).click();
    await page.getByText('beautiful', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Ask Archie', exact: true }).click();
    assert.equal(await page.getByRole('dialog').count(), 1);
    await page.getByLabel('Your question for Archie').fill('What is 8 plus 4?');
    await page.getByRole('button', { name: 'Send question', exact: true }).click();
    await page.getByRole('log').getByText(/8 plus 4 is 12/i).waitFor();
    if (process.env.ARCHIE_CHECK_CLOUD === '1') {
      await page.getByRole('button', { name: 'Close Ask Archie', exact: true }).click();
      await page.goto(base);
      await page.getByRole('button', { name: 'Ask Archie', exact: true }).click();
      await page.getByLabel('Your question for Archie').fill('Why do rainbows have different colours?');
      await page.getByRole('button', { name: 'Send question', exact: true }).click();
      await page.getByRole('log').getByText(/sunlight|raindrops|white light/i).waitFor({ timeout: 20000 });
      console.log('PASS: a hosted cloud learning answer appeared in the shared Archie panel.');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: 390px phone navigation, whiteboard rubber, spelling, next word, one shared Archie and local maths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
