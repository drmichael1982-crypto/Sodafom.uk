/* Read-only Books journey audit. Run from the repository root with Playwright available.
 * Product code and assets are not changed. All API and external traffic is disabled.
 * Output stays outside the repository unless SOD_BOOKS_QA_OUTPUT explicitly changes it.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

async function main() {
  const runtimeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  const playwright = require(runtimeModules ? path.join(runtimeModules, 'playwright') : 'playwright');
  const output = process.env.SOD_BOOKS_QA_OUTPUT || '/tmp/sodafom-books-artwork-qa';
  await fs.mkdir(output, { recursive: true });
  const report = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    capturedAt: new Date().toISOString(),
    limitations: ['Viewport simulations, not physical devices.', 'Local API calls return 503; external requests are blocked.',
      'No audible voice, real microphone, scanner, auth, payment or Town integration certification.'],
    journeys: [], errors: [] };
  const chromeModule = process.env.SOD_BOOKS_CHROMIUM_MODULE;
  const chrome = chromeModule ? await import(chromeModule) : null;
  const chromium = chrome?.default;
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 5179, strictPort: true }, clearScreen: false });
  let browser;
  try {
    await server.listen();
    browser = await playwright.chromium.launch({ headless: true,
      ...(chromium ? { executablePath: await chromium.executablePath(),
        args: chromium.args.filter(arg => !['--single-process', '--disable-web-security', '--allow-running-insecure-content'].includes(arg)) } : {}) });
    report.browser = browser.version();
    const origin = 'http://127.0.0.1:5179';
    async function makeContext(viewport, reducedMotion = 'no-preference') {
      const context = await browser.newContext({ viewport, reducedMotion });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.abort();
        if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Local read-only QA: backend unavailable"}' });
        return route.continue();
      });
      return context;
    }
    async function dimensions(page) {
      return page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
        shelves: [...document.querySelectorAll('.overflow-x-auto')].map(s => ({ width: s.clientWidth,
          contentWidth: s.scrollWidth, scrollLeft: s.scrollLeft, firstLeft: s.firstElementChild?.getBoundingClientRect().left,
          containerLeft: s.getBoundingClientRect().left })) }));
    }
    const viewports = JSON.parse(process.env.SOD_BOOKS_QA_VIEWPORTS || '[{"width":360,"height":800},{"width":768,"height":1024},{"width":1280,"height":800}]');
    for (const viewport of viewports) {
      const context = await makeContext(viewport);
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      const result = { viewport, checks: [] };
      report.journeys.push(result);
      page.on('pageerror', error => report.errors.push(error.message));
      try {
        await page.goto(origin + '/reading', { waitUntil: 'networkidle', timeout: 60000 });
        await page.getByRole('button', { name: /Archie/ }).first().waitFor();
        if (await page.getByRole('button', { name: 'Decline', exact: true }).count()) {
          await page.getByRole('button', { name: 'Decline', exact: true }).click();
        }
        result.directEntry = { url: page.url(),
          readingMenuVisible: await page.getByRole('button', { name: /Archie’s Book Collection/ }).count() > 0,
          capacitorPlatform: await page.evaluate(() => window.Capacitor?.getPlatform?.()) };
        if (!result.directEntry.readingMenuVisible) {
          await page.screenshot({ path: path.join(output, `deep-link-${viewport.width}.png`), fullPage: true });
          await page.getByRole('button', { name: "Open Archie's Stories", exact: true }).click();
          await page.getByRole('button', { name: "Open Archie's reading collection", exact: true }).click();
        }
        await page.getByRole('button', { name: /Archie’s Book Collection/ }).click();
        await page.getByRole('heading', { name: 'ARCHIE’S BOOK COLLECTION' }).waitFor();
        const count = await page.getByRole('button', { name: /^Open / }).count();
        result.checks.push({ name: 'Reading menu to ten-book shelf', pass: count === 10, count });
        result.shelf = await dimensions(page);
        await page.screenshot({ path: path.join(output, `shelf-${viewport.width}.png`), fullPage: true });
        await page.getByRole('button', { name: 'Open Archie and the Magic Key', exact: true }).click();
        await page.getByLabel('Archie steps out of Archie and the Magic Key', { exact: true }).waitFor();
        await page.waitForTimeout(2000);
        result.opening = await dimensions(page);
        result.openingCharacter = await page.getByLabel('Archie steps out of Archie and the Magic Key', { exact: true }).evaluate(element => {
          const image = element.querySelector('img'); const r = image.getBoundingClientRect();
          return { image: image.getAttribute('src'), rect: r.toJSON(),
            centerCoveredBy: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.outerHTML.slice(0, 240) };
        });
        await page.screenshot({ path: path.join(output, `opening-${viewport.width}.png`), fullPage: true });
        await page.getByRole('button', { name: 'Open the book', exact: true }).click();
        await page.getByText('Archie’s Stories · Page 1 of 10', { exact: true }).waitFor();
        await page.waitForTimeout(600);
        result.reader = await dimensions(page);
        result.checks.push({ name: 'Previous page disabled at first page', pass: await page.getByRole('button', { name: 'Previous page', exact: true }).isDisabled() });
        await page.screenshot({ path: path.join(output, `reader-${viewport.width}.png`), fullPage: true });
        await page.getByRole('button', { name: 'Next page', exact: true }).click();
        await page.getByText('Archie’s Stories · Page 2 of 10', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Previous page', exact: true }).click();
        await page.getByText('Archie’s Stories · Page 1 of 10', { exact: true }).waitFor();
        result.checks.push({ name: 'Next and previous page', pass: true });
        await page.getByRole('button', { name: 'Look through Archie’s eyes', exact: true }).click();
        await page.getByText('Looking through Archie’s eyes', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Leave Archie’s view', exact: true }).click();
        result.checks.push({ name: 'Enter and leave Archie view', pass: true });
        await page.getByRole('button', { name: 'Back to library', exact: true }).click();
        await page.getByRole('button', { name: 'Open Space Explorers', exact: true }).click();
        await page.getByRole('button', { name: 'Open the book', exact: true }).click();
        result.spaceIllustration = await page.getByAltText('Space Explorers illustrated scene', { exact: true }).getAttribute('src');
        await page.screenshot({ path: path.join(output, `space-${viewport.width}.png`), fullPage: true });
        await page.getByRole('button', { name: 'Back to library', exact: true }).click();
        await page.getByRole('button', { name: 'Reading', exact: true }).click();
        await page.getByRole('button', { name: /Archie’s Book Collection/ }).waitFor();
        result.checks.push({ name: 'Return to reading menu', pass: true });
      } catch (error) {
        result.failure = error.message;
        await page.screenshot({ path: path.join(output, `failure-${viewport.width}.png`), fullPage: true }).catch(() => {});
      }
      await context.close();
      console.log(JSON.stringify(result));
    }
    const context = await makeContext({ width: 768, height: 1024 }, 'reduce');
    const page = await context.newPage();
    await page.goto(origin + '/#/reading?books=1', { waitUntil: 'networkidle', timeout: 60000 });
    if (await page.getByRole('button', { name: 'Decline', exact: true }).count()) {
      await page.getByRole('button', { name: 'Decline', exact: true }).click();
    }
    // Use a visible middle book: the first cover is clipped on the tablet shelf.
    await page.getByRole('button', { name: 'Open A Day at the Seaside', exact: true }).click();
    await page.getByRole('button', { name: 'Open the book', exact: true }).click();
    await page.waitForTimeout(2500);
    const mascot = page.getByAltText('Archie holding golden key', { exact: true });
    const first = await mascot.evaluate(e => getComputedStyle(e).transform);
    await page.waitForTimeout(400);
    const second = await mascot.evaluate(e => getComputedStyle(e).transform);
    report.reducedMotion = { mediaMatched: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
      book: 'A Day at the Seaside', viewport: { width: 768, height: 1024 }, first, second, characterStillMoving: first !== second };
    await page.screenshot({ path: path.join(output, 'reduced-motion-reader.png'), fullPage: true });
    await context.close();
    console.log(JSON.stringify({ reducedMotion: report.reducedMotion }));
  } catch (error) { report.fatal = error.stack; console.error(error.message); }
  finally {
    await browser?.close(); await server.close();
    await fs.writeFile(path.join(output, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('Evidence:', output);
    if (report.fatal || report.journeys.some(j => j.failure || j.checks.some(c => !c.pass)
      || !j.directEntry?.readingMenuVisible || j.shelf?.horizontalOverflow || j.reader?.horizontalOverflow)
      || report.reducedMotion?.characterStillMoving) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
