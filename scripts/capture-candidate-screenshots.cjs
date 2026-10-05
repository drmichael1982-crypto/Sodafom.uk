const { chromium } = require('playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const executablePath = process.env.ARCHIE_CHROMIUM_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // 1. Class lessons on iPhone viewport
  await page.goto(`${base}/class?year=1&subject=maths`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/class-lessons-phone.png', fullPage: true });
  console.log('Saved test-results/class-lessons-phone.png');

  // 2. Teacher lessons (unlocked) on iPhone viewport
  await page.goto(`${base}/teacher?year=1&subject=maths`);
  await page.waitForLoadState('networkidle');
  const answerInput = page.getByLabel('Grown-up answer', { exact: true });
  if (await answerInput.count() > 0) {
    await answerInput.fill('privacy choose');
    await page.getByRole('button', { name: 'Continue with a grown-up' }).click();
    await page.waitForTimeout(500);
  }
  // Open first unit
  const firstUnit = page.locator('.tc-unit > summary').first();
  if (await firstUnit.count() > 0) {
    await firstUnit.click();
    await page.waitForTimeout(300);
    // Open first lesson
    const firstLesson = page.locator('.tc-lesson > summary').first();
    if (await firstLesson.count() > 0) {
      await firstLesson.click();
      await page.waitForTimeout(300);
    }
  }
  await page.screenshot({ path: 'test-results/teacher-lessons-phone.png', fullPage: true });
  console.log('Saved test-results/teacher-lessons-phone.png');

  // 3. Spelling Bee typed progression on iPhone viewport
  await page.goto(`${base}/games/spelling-bee`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/spelling-bee-phone.png', fullPage: true });
  console.log('Saved test-results/spelling-bee-phone.png');

  // 4. iPad viewport for Class lessons
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${base}/class?year=1&subject=maths`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/class-lessons-tablet.png', fullPage: true });
  console.log('Saved test-results/class-lessons-tablet.png');

  await browser.close();
  console.log('All additional screenshots captured successfully.');
})();
