const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright'
  : 'playwright');

const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const options = { headless: true };
if (process.env.ARCHIE_CHROMIUM_PATH) options.executablePath = process.env.ARCHIE_CHROMIUM_PATH;

(async () => {
  fs.mkdirSync('test-results/reading-speed', { recursive: true });
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
          settings: { year: 5, sound: false, largeText: false, onlineHelp: false },
          activities: [], stickers: [],
        }));
      });
      await page.goto(base + '/games/reading-speed');
      await page.getByRole('heading', { name: 'Reading Speed', exact: true }).waitFor();
      const activate = async locator => {
        await locator.focus();
        await page.waitForTimeout(250);
        await locator.press('Enter');
      };

      assert.equal(await page.getByText('There is no reading timer.', { exact: false }).count(), 1,
        `${viewport.label}: instructions explicitly remove speed pressure`);
      const showClue = page.getByRole('button', { name: 'Show evidence clue', exact: true });
      await showClue.waitFor();
      assert.equal(await showClue.getAttribute('aria-pressed'), 'false',
        `${viewport.label}: clue is not pre-revealed`);
      await page.screenshot({ path: `test-results/reading-speed/first-attempt-${viewport.label}.png`, fullPage: true });

      await activate(showClue);
      await page.getByRole('button', { name: 'Hide evidence clue', exact: true }).waitFor();
      await page.screenshot({ path: `test-results/reading-speed/optional-clue-${viewport.label}.png`, fullPage: true });
      await activate(page.getByRole('button', { name: 'Hide evidence clue', exact: true }));

      const wrongAnswer = page.locator('.answer-snake-board button').nth(1);
      await activate(wrongAnswer);
      await page.getByRole('alert').waitFor();
      assert.match(await page.getByRole('alert').innerText(), /Good effort.+clue/is,
        `${viewport.label}: wrong answer gives supportive evidence guidance`);
      const question = await page.locator('p').filter({ hasText: /^Read: / }).first().innerText();

      await activate(page.getByRole('button', { name: 'Pause game', exact: true }));
      await page.getByRole('heading', { name: 'Game paused', exact: true }).waitFor();
      assert.equal(await page.locator('.app-screen-window').evaluate(element => element.scrollLeft), 0,
        `${viewport.label}: pause returns to the first reflowed screen`);
      await page.waitForFunction(() => {
        const windowElement = document.querySelector('.app-screen-window');
        const pausedPanel = [...document.querySelectorAll('.app-screen-flow section[role="status"]')]
          .find(element => element.textContent?.includes('Game paused'));
        if (!windowElement || !pausedPanel) return false;
        const windowBox = windowElement.getBoundingClientRect();
        const panelBox = pausedPanel.getBoundingClientRect();
        return panelBox.left >= windowBox.left - 1 && panelBox.right <= windowBox.right + 1;
      });
      assert.equal(await page.locator('.app-screen-flow section[role="status"]')
        .filter({ hasText: 'Game paused' })
        .evaluate((panel, windowElement) => {
          const panelBox = panel.getBoundingClientRect();
          const windowBox = windowElement.getBoundingClientRect();
          return panelBox.left >= windowBox.left - 1 && panelBox.right <= windowBox.right + 1;
        }, await page.locator('.app-screen-window').elementHandle()), true,
      `${viewport.label}: the settled pause card stays inside the visible app screen`);
      await page.screenshot({ path: `test-results/reading-speed/paused-${viewport.label}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Resume game', exact: true }).first().press('Enter');
      assert.equal(await page.getByText(question, { exact: true }).count(), 1,
        `${viewport.label}: resume restores the exact passage question`);
      await activate(page.getByRole('button', { name: 'Try again', exact: true }));
      assert.equal(await page.getByRole('button', { name: 'Hide evidence clue', exact: true }).count(), 1,
        `${viewport.label}: evidence clue remains available for the retry`);
      assert.equal(await wrongAnswer.isDisabled(), true,
        `${viewport.label}: tried answer remains unavailable`);

      // The fixed random source preserves authored option order: the first is correct.
      for (let number = 1; number <= 10; number++) {
        await activate(page.locator('.answer-snake-board button').first());
        await page.getByRole('status').filter({ hasText: 'Correct!' }).waitFor();
        if (number < 10) {
          await page.waitForFunction(progress => document.body.textContent?.includes(progress), `${number + 1} / 10`);
        }
      }
      await page.getByRole('dialog').waitFor({ timeout: 7000 });
      await page.getByRole('button', { name: 'See my result', exact: true }).click();
      await page.getByText('9 correct out of 10 questions', { exact: true }).waitFor();
      assert.equal(await page.getByText('Final score: 90%', { exact: true }).count(), 1,
        `${viewport.label}: corrected practice keeps first-attempt accuracy`);
      await page.waitForTimeout(1800);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
        `${viewport.label}: completed result has no horizontal overflow`);
      await page.screenshot({ path: `test-results/reading-speed/result-${viewport.label}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Home', exact: true }).click();
      await page.waitForURL(url => url.pathname === '/');
      await page.close();
      console.log(`PASS Reading Speed ${viewport.label}: instructions, optional clue, wrong/retry, pause/resume, completion, reward and home`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
