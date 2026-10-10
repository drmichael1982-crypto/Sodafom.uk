const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const cwd = path.resolve(__dirname, '..');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4176';
const captureDir = path.resolve(process.env.ARCHIE_CAPTURE_DIR || 'test-results/shared-device-progress');
const executablePath = process.env.ARCHIE_CHROMIUM_PATH;
let server;

async function startServer() {
  if (process.env.ARCHIE_TEST_URL) return;
  server = spawn(process.execPath, ['--import', 'tsx', 'scripts/serve-archie-test.ts'], {
    cwd,
    env: { ...process.env, PORT: '4176', NODE_ENV: 'development' },
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
  throw new Error('Pager did not reveal the shared-device report');
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
        settings: { childNickname: 'Mia', year: 2, sound: false, largeText: false, onlineHelp: false },
        activities: [
          { id: 'book-lost-key', kind: 'book', title: 'Archie and the Lost Key', stars: 1, date: '2026-10-10T12:00:00.000Z' },
          { id: 'learn-year-2', kind: 'lesson', title: 'Year 2 spelling', stars: 3, date: '2026-10-10T12:05:00.000Z' },
        ],
        stickers: [],
      }));
      localStorage.setItem('sodafom_game_stars', JSON.stringify({ 'game-archie-adventure-trail': 2 }));
    });
    await page.goto(`${base}/parents`);
    await unlock(page);
    const reportHeading = page.getByRole('heading', { name: 'Shared practice on this device', exact: true });
    await reportHeading.waitFor({ state: 'attached' });
    await reveal(page, reportHeading);
    await page.getByText('Current profile: Mia · selected lesson year 2', { exact: true }).waitFor();
    await page.getByText(/may combine practice from everyone who uses this browser/).waitFor();
    assert.equal(await page.getByText('Mia’s saved practice', { exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'parent-phone.png'), fullPage: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    await reveal(page, reportHeading);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'parent-tablet.png'), fullPage: true });

    const sharedProgressLink = page.getByRole('link', { name: 'Open shared device progress', exact: true });
    await reveal(page, sharedProgressLink);
    await sharedProgressLink.click();
    await page.waitForURL(`${base}/progress?from=parents`);
    await page.getByRole('heading', { level: 1, name: 'Shared device progress', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Shared device history', exact: true }).waitFor();
    await page.getByText('Recent shared learning', { exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { level: 1, name: 'My progress', exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'progress-tablet.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: path.join(captureDir, 'progress-phone.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS shared browser history is explicit in parent and detailed progress at phone/tablet widths');
  } finally {
    await browser.close();
    await stopServer();
  }
})().catch(async error => {
  console.error(error);
  await stopServer();
  process.exit(1);
});
