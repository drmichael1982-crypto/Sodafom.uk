const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { mkdtempSync, mkdirSync } = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const cwd = path.resolve(__dirname, '..');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4175';
const captureDir = path.resolve(process.env.ARCHIE_CAPTURE_DIR || 'test-results/parent-tutor-isolation');
const executablePath = process.env.ARCHIE_CHROMIUM_PATH;
let server;

async function startServer() {
  if (process.env.ARCHIE_TEST_URL) return;
  server = spawn(process.execPath, ['--import', 'tsx', 'scripts/serve-archie-test.ts'], {
    cwd,
    env: {
      ...process.env,
      PORT: '4175',
      NODE_ENV: 'development',
      ARCHIE_PARENT_ACCOUNTS_ENABLED: 'true',
      BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
      BETTER_AUTH_URL: base,
      ARCHIE_PARENT_SQLITE_PATH: path.join(mkdtempSync('/tmp/archie-parent-report-'), 'parents.sqlite'),
    },
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

function profile(name, ageGroup, schoolYear, topic, subject, status) {
  const key = `${subject.toLowerCase()}:${topic.toLowerCase()}`;
  return {
    childName: name,
    ageGroup,
    schoolYear,
    topics: {
      [key]: {
        topic,
        subject,
        status,
        difficultyLevel: status === 'GREEN' ? 2 : 1,
        consecutiveCorrect: status === 'GREEN' ? 2 : 0,
        consecutiveIncorrect: status === 'RED' ? 2 : 0,
        totalAttempted: 2,
        totalCorrect: status === 'GREEN' ? 2 : 0,
        lastPractisedAt: '2026-10-10T12:00:00.000Z',
      },
    },
  };
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
    const signup = await page.evaluate(async () => {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'parent-isolation@example.test', password: 'Good-test-password-981', name: 'Pat Parent' }),
      });
      return { status: response.status, text: await response.text() };
    });
    assert.equal(signup.status, 200, signup.text);

    const children = [
      { id: 101, name: 'Mia', ageGroup: '5-7', totalStars: 6, avatarEmoji: '⭐' },
      { id: 202, name: 'Leo', ageGroup: '11-13', totalStars: 3, avatarEmoji: '🚀' },
    ];
    await page.route('**/api/children', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(children) }));
    await page.route(/\/api\/parent\/dashboard\?childId=(101|202)$/, route => {
      const id = Number(new URL(route.request().url()).searchParams.get('childId'));
      const child = children.find(item => item.id === id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ child: { id, name: child.name, age_group: child.ageGroup, total_stars: child.totalStars }, totalGames: 0, badgeCount: 0, subjects: [], daily: [], recent: [] }),
      });
    });
    await page.route(/\/api\/streak\?childId=(101|202)$/, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ currentStreak: 0, maxStreak: 0, starBalance: 0 }) }));
    await page.evaluate(({ mia, leo }) => {
      localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 202, name: 'Leo', ageGroup: '11-13' }));
      localStorage.setItem('sodafom_tutor_memory:101', JSON.stringify(mia));
      localStorage.setItem('sodafom_tutor_memory:202', JSON.stringify(leo));
    }, {
      mia: profile('Mia', '5-7', 'Year 2', 'Addition', 'Maths', 'GREEN'),
      leo: profile('Leo', '11-13', 'Year 7', 'Forces', 'Science', 'RED'),
    });

    await page.goto(`${base}/parent-dashboard`);
    await page.getByRole('heading', { name: 'Progress Dashboard' }).waitFor();
    const mia = page.locator('[data-tutor-report-child-id="101"]');
    const leo = page.locator('[data-tutor-report-child-id="202"]');
    await mia.getByText('Report for Mia • Year 2 • ages 5–7').waitFor();
    await leo.getByText('Report for Leo • Year 7 • ages 11–13').waitFor();
    await mia.getByText(/Addition - Great accuracy and confidence!/).waitFor();
    await leo.getByText(/Forces - Scheduled for simpler examples/).waitFor();
    assert.equal(await mia.getByText(/Forces - Scheduled/).count(), 0, 'Mia must not receive Leo’s tutor topic');
    assert.equal(await leo.getByText(/Addition - Great/).count(), 0, 'Leo must not receive Mia’s tutor topic');
    assert.equal(await page.getByText('COPPA Safe').count(), 0, 'The report must not make an unsupported compliance claim');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Parent dashboard must fit the phone width');
    await page.screenshot({ path: path.join(captureDir, 'phone.png'), fullPage: true });

    await page.setViewportSize({ width: 820, height: 1180 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'Parent dashboard must fit the tablet width');
    await page.screenshot({ path: path.join(captureDir, 'tablet.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS parent tutor reports stay isolated by explicit learner and saved year at phone/tablet widths');
  } finally {
    await browser.close();
    await stopServer();
  }
})().catch(async error => {
  console.error(error);
  await stopServer();
  process.exit(1);
});
