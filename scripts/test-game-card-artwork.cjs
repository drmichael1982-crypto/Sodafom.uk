const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
  : 'playwright');

const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const output = path.join(process.cwd(), 'test-results', 'game-card-artwork');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browserOptions = { headless: true };
  if (process.env.ARCHIE_CHROMIUM_PATH) browserOptions.executablePath = process.env.ARCHIE_CHROMIUM_PATH;
  const browser = await chromium.launch(browserOptions);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(base + '/games');
    await page.getByRole('heading', { name: 'Choose a game', exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'My learning year', exact: true }).selectOption('4');
    const cards = page.locator('[data-game-link]');
    assert.ok(await cards.count() >= 7, 'Year 4 must show enough games to compare artwork cues');
    const firstCues = await cards.locator('[data-game-art-cue]').evaluateAll(items => items.slice(0, 7).map(item => item.textContent));
    assert.deepEqual(firstCues, ['🗺️', '⭐', '🎈', '🏁', '🍕', '🔷', '🧩']);
    assert.equal(new Set(firstCues).size, firstCues.length, 'The opening repeated maths scenes need distinct visual cues');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Phone game cards must not overflow');
    await page.screenshot({ path: path.join(output, 'games-phone.png'), fullPage: true });

    await page.setViewportSize({ width: 820, height: 1180 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Tablet game cards must not overflow');
    await page.screenshot({ path: path.join(output, 'games-tablet.png'), fullPage: true });
    console.log('PASS game cards have distinct decorative cues at phone and tablet sizes');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
