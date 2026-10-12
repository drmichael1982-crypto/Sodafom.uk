const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, webkit } = require('playwright');
const base = (process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const engine = process.env.ARCHIE_BROWSER || 'chromium';
const profiles = [
  { name: 'small-phone', width: 320, height: 568 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
];
// Browser viewport simulation only. Does not assert microphone hardware,
// speech recognition availability, native WebViews or universal 100ms latency.
(async () => {
  assert.ok(['chromium', 'webkit'].includes(engine), 'ARCHIE_BROWSER must be chromium or webkit');
  const browser = await (engine === 'webkit' ? webkit : chromium).launch({
    headless: true,
    ...(engine === 'chromium' && process.env.ARCHIE_CHROMIUM_PATH ? { executablePath: process.env.ARCHIE_CHROMIUM_PATH } : {}),
  });
  const results = [];
  try {
    for (const profile of profiles) for (let year = 1; year <= 9; year += 1) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(`${base}/courses?year=${year}&subject=history`);
        const start = page.getByRole('link', { name: 'Start or continue', exact: true });
        await start.waitFor();
        // The app and course chunk are already loaded. Test in-app offline
        // navigation; reloading an uncached website is a separate requirement.
        await context.setOffline(true);
        await start.click();
        await page.getByRole('button', { name: "Let's try together", exact: true }).waitFor();
        const metrics = await page.evaluate(() => ({
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          speechRecognitionAdvertised: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
          secureContext: window.isSecureContext,
        }));
        const responseMilliseconds = await page.evaluate(() => new Promise((resolve, reject) => {
          const board = document.querySelector('.course-whiteboard');
          const button = [...document.querySelectorAll('button')].find(item => item.textContent.trim() === "Let's try together");
          if (!board || !button) return reject(new Error('History discovery controls missing'));
          const startTime = performance.now();
          const timer = setTimeout(() => { observer.disconnect(); reject(new Error('History phase did not change offline')); }, 5000);
          const observer = new MutationObserver(() => {
            if (board.getAttribute('data-phase') === '1') {
              clearTimeout(timer); observer.disconnect(); resolve(performance.now() - startTime);
            }
          });
          observer.observe(board, { attributes: true, attributeFilter: ['data-phase'] });
          button.click();
        }));
        await page.getByText('Archie thinks it through', { exact: true }).waitFor();
        assert.equal(metrics.horizontalOverflow, false, `${profile.name}, Year ${year}: horizontal overflow`);
        assert.deepEqual(errors, []);
        results.push({ engine, profile: profile.name, year, offlinePhasePassed: true, responseMilliseconds, ...metrics });
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(`test-results/mobile-history-${engine}.json`, JSON.stringify({ scope: 'Loaded web app, viewport simulation; no physical microphone or native-app certification', results }, null, 2));
  console.log(JSON.stringify({ cases: results.length, engine, maxObservedPhaseMilliseconds: Math.max(...results.map(result => result.responseMilliseconds)), allPhonesGuarantee: false }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
