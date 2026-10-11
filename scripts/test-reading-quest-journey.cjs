const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
  : 'playwright');

const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const options = { headless: true };
if (process.env.ARCHIE_CHROMIUM_PATH) options.executablePath = process.env.ARCHIE_CHROMIUM_PATH;

const answers = {
  'Where did Maya find the compass?': "Her grandmother's attic",
  'What was unusual about the compass?': "It didn't point north",
  'What did Maya find under the oak tree?': 'A wooden box',
  "What was the name of Zara's robot?": 'Biscuit',
  'What did Biscuit make for breakfast?': 'Galaxy Pancakes',
  'What happened when you poured syrup on the pancakes?': 'They changed colour',
};

(async () => {
  fs.mkdirSync('test-results/reading-quest', { recursive: true });
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
      await page.goto(base + '/games/reading-quest');
      await page.getByRole('heading', { name: 'Reading Quest', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Answer questions 🎯', exact: true }).click();

      for (let index = 0; index < 3; index += 1) {
        const question = page.locator('[data-reading-question]');
        const prompt = (await question.innerText()).trim();
        const answer = answers[prompt];
        assert.ok(answer, `${viewport.label}: recognise the rendered reading prompt`);

        if (index === 0) {
          const options = page.getByLabel('Reading Quest answers').getByRole('button');
          const labels = await options.allTextContents();
          const wrong = labels.map(text => text.trim()).find(text => text && text !== answer);
          assert.ok(wrong, `${viewport.label}: choose an explicit wrong option`);
          await page.getByRole('button', { name: wrong, exact: true }).click();
          await page.getByRole('status').filter({ hasText: 'Good try. Keep this question and look for evidence.' }).waitFor();
          assert.equal((await question.innerText()).trim(), prompt,
            `${viewport.label}: wrong answer keeps the same question`);
          await page.getByRole('button', { name: 'Pause quest', exact: true }).click();
          await page.getByRole('status').filter({ hasText: 'Paused. Your question is saved.' }).waitFor();
          assert.equal(await page.getByRole('button', { name: answer, exact: true }).isDisabled(), true,
            `${viewport.label}: pause stops answering`);
          await page.screenshot({ path: `test-results/reading-quest/retry-break-${viewport.label}.png`, fullPage: true });
          await page.getByRole('button', { name: 'Resume quest', exact: true }).click();
        }

        await page.getByRole('button', { name: answer, exact: true }).click();
        await page.waitForTimeout(950);
      }

      await page.getByText('You earned 2 stars!', { exact: true }).waitFor();
      assert.equal(await page.getByText('Final score: 67%', { exact: true }).count(), 1,
        `${viewport.label}: result retains first-try accuracy`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
        `${viewport.label}: Reading Quest does not overflow horizontally`);
      await page.screenshot({ path: `test-results/reading-quest/complete-${viewport.label}.png`, fullPage: true });
      await page.close();
      console.log(`PASS Reading Quest ${viewport.label} retry, break and completion`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
