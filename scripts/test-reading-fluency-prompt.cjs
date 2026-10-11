const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
  : 'playwright');

const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const options = { headless: true };
if (process.env.ARCHIE_CHROMIUM_PATH) options.executablePath = process.env.ARCHIE_CHROMIUM_PATH;

(async () => {
  fs.mkdirSync('test-results/reading-fluency', { recursive: true });
  const browser = await chromium.launch(options);
  try {
    for (const viewport of [
      { width: 390, height: 844, label: 'phone' },
      { width: 820, height: 1180, label: 'tablet' },
    ]) {
      const page = await browser.newPage({ viewport });
      await page.addInitScript(() => {
        localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({
          settings: { year: 4, sound: false, largeText: false, onlineHelp: false },
          activities: [],
          stickers: [],
        }));
      });
      await page.goto(base + '/games/reading-fluency');
      await page.getByRole('heading', { name: 'Reading Fluency', exact: true }).waitFor();

      const prompt = page.locator('p').filter({ hasText: /^Read: / }).first();
      await prompt.waitFor();
      const promptText = (await prompt.innerText()).trim();
      assert.match(promptText, /^Read: .+ Question: .+\?$/,
        `${viewport.label}: passage and question have explicit labels`);
      assert.equal(promptText.includes('Read: ““'), false,
        `${viewport.label}: authored direct speech is not double-wrapped`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
        `${viewport.label}: Reading Fluency does not overflow horizontally`);

      await page.screenshot({
        path: `test-results/reading-fluency/prompt-${viewport.label}.png`,
        fullPage: true,
      });
      await page.close();
      console.log(`PASS Reading Fluency ${viewport.label} prompt clarity`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
