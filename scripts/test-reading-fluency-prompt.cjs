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
        Math.random = () => 0.5;
        localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({
          settings: { year: 4, sound: false, largeText: false, onlineHelp: false },
          activities: [],
          stickers: [],
        }));
      });
      await page.goto(base + '/games/reading-fluency');
      await page.getByRole('heading', { name: 'Reading Fluency', exact: true }).waitFor();
      const activateWithPager = async locator => {
        await locator.focus();
        // AppScreenPager aligns an off-screen keyboard target over two frames.
        await page.waitForTimeout(250);
        await locator.press('Enter');
      };

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

      const wrongAnswer = page.locator('.answer-snake-board button').nth(1);
      await activateWithPager(wrongAnswer);
      await page.getByRole('alert').waitFor();
      assert.match(await page.getByRole('alert').innerText(), /Good effort.+clue/is,
        `${viewport.label}: a mistake gives supportive clue feedback`);
      const savedPrompt = await prompt.innerText();

      const pauseButton = page.getByRole('button', { name: 'Pause game', exact: true });
      await pauseButton.focus();
      await page.waitForTimeout(250);
      await pauseButton.press('Enter');
      await page.getByRole('heading', { name: 'Game paused', exact: true }).waitFor();
      const topResume = page.getByRole('button', { name: 'Resume game', exact: true }).first();
      assert.equal(await topResume.evaluate(element => element === document.activeElement), true,
        `${viewport.label}: keyboard focus stays on pause/resume control`);
      assert.equal(await prompt.count(), 0,
        `${viewport.label}: the active question is hidden during a break`);
      await page.screenshot({
        path: `test-results/reading-fluency/paused-${viewport.label}.png`,
        fullPage: true,
      });
      await topResume.press('Enter');
      assert.equal(await page.getByText(savedPrompt, { exact: true }).count(), 1,
        `${viewport.label}: resume restores the exact question`);
      const retryButton = page.getByRole('button', { name: 'Try again', exact: true });
      await activateWithPager(retryButton);
      assert.equal(await wrongAnswer.isDisabled(), true,
        `${viewport.label}: the tried answer remains unavailable after resume and retry`);

      // The fixed random source keeps authored answer order stable: the first
      // option is correct, while still exercising the real ten-question bank.
      for (let question = 1; question <= 10; question++) {
        const correctAnswer = page.locator('.answer-snake-board button').first();
        await activateWithPager(correctAnswer);
        await page.getByRole('status').filter({ hasText: 'Correct!' }).waitFor();
        if (question < 10) {
          await page.waitForFunction(progress => document.body.textContent?.includes(progress), `${question + 1} / 10`);
        }
      }
      await page.getByRole('dialog').waitFor({ timeout: 7000 });
      await page.getByRole('button', { name: 'See my result', exact: true }).click();
      await page.getByText('9 correct out of 10 questions', { exact: true }).waitFor();
      assert.equal(await page.getByText('Final score: 90%', { exact: true }).count(), 1,
        `${viewport.label}: corrected practice reports first-attempt accuracy`);
      await page.waitForTimeout(1800);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
        `${viewport.label}: completed result stays within the viewport`);
      await page.screenshot({
        path: `test-results/reading-fluency/result-${viewport.label}.png`,
        fullPage: true,
      });
      await page.close();
      console.log(`PASS Reading Fluency ${viewport.label}: prompt, wrong answer, clue, pause/resume, corrected retry, ten questions and result`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
