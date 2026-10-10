// Synthetic family only: this checks storage ownership and responsive controls,
// not real-child learning, enjoyment or physical-device behaviour.
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const cwd = path.resolve(__dirname, '..');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4177';
const captureDir = path.resolve(process.env.ARCHIE_CAPTURE_DIR || 'test-results/learner-settings-isolation');
const executablePath = process.env.ARCHIE_CHROMIUM_PATH;
let server;

async function startServer() {
  if (process.env.ARCHIE_TEST_URL) return;
  server = spawn(process.execPath, ['--import', 'tsx', 'scripts/serve-archie-test.ts'], {
    cwd,
    env: { ...process.env, PORT: '4177', NODE_ENV: 'development' },
    stdio: 'ignore',
  });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Archie preview server did not start');
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
}

async function unlock(page) {
  const title = 'A grown-up needs to help here';
  const form = page.getByRole('form', { name: title, exact: true });
  await form.waitFor();
  const words = (await form.locator('p strong').first().innerText()).trim().split(/\s+/);
  await page.getByLabel('Grown-up answer', { exact: true }).fill(`${words.at(-1)} ${words[1]}`);
  await page.getByRole('button', { name: 'Continue with a grown-up', exact: true }).click();
  await page.getByLabel('Grown-up area opened', { exact: true }).waitFor();
}

async function reveal(page, locator) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const direction = await locator.evaluate(element => {
      const viewport = element.closest('.app-screen-window')?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      if (!viewport || (box.left >= viewport.left - 1 && box.right <= viewport.right + 1)) return 0;
      return box.left < viewport.left ? -1 : 1;
    });
    if (direction === 0) return;
    await page.getByRole('button', { name: direction < 0 ? '← Previous' : 'Next →', exact: true }).click();
    await page.waitForTimeout(100);
  }
  throw new Error('Pager did not reveal the settings control');
}

async function saveLearner(page, { nickname, age, year }) {
  const form = page.locator('#learning-settings');
  const nicknameInput = form.locator('input[type="text"]').first();
  await reveal(page, nicknameInput);
  await nicknameInput.fill(nickname);
  const ageInput = form.locator('input[type="number"]').first();
  await reveal(page, ageInput);
  await ageInput.fill(String(age));
  const yearSelect = form.locator('select').first();
  await reveal(page, yearSelect);
  await yearSelect.selectOption(String(year));
  const save = page.getByRole('button', { name: 'Save learning settings', exact: true });
  await reveal(page, save);
  await save.click();
}

(async () => {
  mkdirSync(captureDir, { recursive: true });
  await startServer();
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(base);
    await page.evaluate(() => {
      localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({
        settings: { childNickname: 'Older nickname', year: 4, sound: true, largeText: false, onlineHelp: false },
        activities: [], stickers: [],
      }));
      localStorage.setItem('sodafom_learning_age', '9');
      localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 21, name: 'Mia', ageGroup: '5-7' }));
    });

    await page.goto(`${base}/parents`);
    await unlock(page);
    await page.getByRole('heading', { name: 'Practice settings for Mia', exact: true }).waitFor();
    await page.getByText(/Older shared setting:/).waitFor();
    await saveLearner(page, { nickname: 'Mia', age: 6, year: 2 });
    const sound = page.getByLabel('Read aloud and sound', { exact: true });
    await reveal(page, sound); await sound.uncheck();
    const largeText = page.getByLabel('Larger text on menus and books', { exact: true });
    await reveal(page, largeText); await largeText.check();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'mia-phone.png'), fullPage: true });

    await page.evaluate(() => localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 22, name: 'Leo', ageGroup: '11-13' })));
    await page.reload();
    await unlock(page);
    await page.getByRole('heading', { name: 'Practice settings for Leo', exact: true }).waitFor();
    assert.equal(await page.locator('#learning-settings select').first().inputValue(), '4');
    assert.equal(await page.locator('#learning-settings input[type="text"]').first().inputValue(), 'Older nickname');
    assert.equal(await page.locator('#learning-settings input[type="number"]').first().inputValue(), '9');
    assert.equal(await page.getByLabel('Read aloud and sound', { exact: true }).isChecked(), false);
    assert.equal(await page.getByLabel('Larger text on menus and books', { exact: true }).isChecked(), true);
    await saveLearner(page, { nickname: 'Leo', age: 12, year: 7 });
    const onlineHelp = page.getByLabel('Allow online learning help', { exact: true });
    await reveal(page, onlineHelp); await onlineHelp.check();

    await page.evaluate(() => localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 21, name: 'Mia', ageGroup: '5-7' })));
    await page.reload();
    await unlock(page);
    await page.getByRole('heading', { name: 'Practice settings for Mia', exact: true }).waitFor();
    assert.equal(await page.locator('#learning-settings select').first().inputValue(), '2');
    assert.equal(await page.locator('#learning-settings input[type="text"]').first().inputValue(), 'Mia');
    assert.equal(await page.locator('#learning-settings input[type="number"]').first().inputValue(), '6');
    assert.equal(await page.getByLabel('Read aloud and sound', { exact: true }).isChecked(), false);
    assert.equal(await page.getByLabel('Larger text on menus and books', { exact: true }).isChecked(), true);
    assert.equal(await page.getByLabel('Allow online learning help', { exact: true }).isChecked(), true);
    const stored = await page.evaluate(() => ({
      device: JSON.parse(localStorage.getItem('sodafom_archie_design_v1')),
      mia: JSON.parse(localStorage.getItem('sodafom_archie_settings:profile:child:21')),
      leo: JSON.parse(localStorage.getItem('sodafom_archie_settings:profile:child:22')),
      miaAge: localStorage.getItem('sodafom_learning_age:profile:child:21'),
      leoAge: localStorage.getItem('sodafom_learning_age:profile:child:22'),
    }));
    assert.deepEqual(stored.mia, { childNickname: 'Mia', year: 2 });
    assert.deepEqual(stored.leo, { childNickname: 'Leo', year: 7 });
    assert.equal(stored.miaAge, '6'); assert.equal(stored.leoAge, '12');
    assert.deepEqual(stored.device.settings, { childNickname: 'Older nickname', year: 4, sound: false, largeText: true, onlineHelp: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'mia-tablet.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS learner age/year/nickname stay isolated while device accessibility and online-help choices stay shared');
  } finally {
    await browser.close();
    await stopServer();
  }
})().catch(async error => {
  console.error(error);
  await stopServer();
  process.exit(1);
});
