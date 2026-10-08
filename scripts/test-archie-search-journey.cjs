// Simulated learners only: these checks do not measure children's learning or enjoyment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const captureOnly = process.env.ARCHIE_CAPTURE_ONLY === '1';
const lessonsOnly = process.env.ARCHIE_LESSONS_ONLY === '1';
const output = `test-results/search-${captureOnly ? 'before' : 'after'}`;
const catalog = require('../src/lib/archie/game-catalog.json');
const eligible = (game, year) => game.ageGroups.some(range => {
  const [low, high] = range.split(/[–-]/).map(Number);
  return year + 4 >= low && year + 4 <= high;
});
const luminance = rgb => rgb.map(value => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};
const rgbValues = value => [...value.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].map(match => match.slice(1, 4).map(Number));
const results = [];
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ARCHIE_CHROMIUM_PATH ? { executablePath: process.env.ARCHIE_CHROMIUM_PATH } : {}) });
  const errors = [];
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(String(error)));
      const button = name => page.getByRole('button', { name, exact: true });
      const goto = async route => { await page.goto(base + route); await page.getByRole('heading').first().waitFor(); };
      const chooseYear = year => page.getByRole('combobox', { name: 'My learning year', exact: true }).selectOption(String(year));
      await goto('/games'); await chooseYear(4);
      await page.getByLabel('Search games', { exact: true }).fill('Phonics Parrot');
      await page.getByText('0 games for Year 4', { exact: true }).waitFor();
      await page.screenshot({ path: `${output}/empty-${viewport.width}.png`, fullPage: true });
      if (captureOnly) { await page.close(); continue; }
      for (let year = 1; year <= (lessonsOnly ? 0 : 9); year++) {
        await goto('/games?subject=spelling'); await chooseYear(year);
        await page.getByLabel('Search games', { exact: true }).fill('no such game');
        await page.getByRole('heading', { name: "Let's find another game", exact: true }).waitFor();
        await button(`Show Year ${year} games`).click();
        assert.equal(await page.getByRole('combobox', { name: 'My learning year', exact: true }).inputValue(), String(year));
        assert.equal(await page.getByLabel('Search games', { exact: true }).inputValue(), '');
        assert.equal(await page.getByLabel('Search games', { exact: true }).evaluate(input => input === document.activeElement), true);
        assert.equal(await button('All games').getAttribute('aria-pressed'), 'true');
        assert.deepEqual(await page.locator('[data-game-link]').evaluateAll(links => links.map(link => link.getAttribute('href'))), catalog.filter(game => eligible(game, year)).map(game => game.route));
        results.push(`Year ${year}, ${viewport.width}px: empty filters recover to eligible games with keyboard focus`);
      }
      // The corrected CI journey must reach and finish the game through its eligible menu.
      for (const year of lessonsOnly ? [] : [1, 2, 3]) {
        await goto('/games'); await chooseYear(year);
        await page.getByLabel('Search games', { exact: true }).fill('Number Pop');
        await page.locator('[data-game-link][href="/games/number-pop"]').click();
        await page.getByRole('region', { name: 'Number Pop adventure', exact: true }).waitFor();
        for (let round = 1; round <= 10; round++) {
          const question = await page.getByRole('heading', { level: 2 }).innerText();
          const parts = question.match(/^(\d+) \+ (\d+) = \?$/);
          assert.ok(parts, 'Young learner receives a clear addition question');
          const answer = Number(parts[1]) + Number(parts[2]);
          if (round === 1) {
            // Use the actual accessible label rather than assuming a random distractor.
            const choices = await page.getByRole('button', { name: /^Pop balloon / }).all();
            for (const choice of choices) {
              if (await choice.getAttribute('aria-label') !== `Pop balloon ${answer}`) { await choice.click(); break; }
            }
            await page.getByText('Good try. Use the hint and have another go at this balloon.', { exact: true }).waitFor();
            assert.equal(await page.getByRole('heading', { level: 2 }).innerText(), question, 'Wrong answer keeps the question');
            await button('Pause adventure').click();
            await page.getByText('Time for a breather', { exact: true }).waitFor();
            await button('Resume adventure').click();
            assert.equal(await page.getByRole('heading', { level: 2 }).innerText(), question, 'Pause preserves the question');
            await page.screenshot({ path: `${output}/game-year-${year}-${viewport.width}.png`, fullPage: true });
          }
          await button(`Pop balloon ${answer}`).click();
          await button(round === 10 ? 'Finish balloon adventure' : 'Next balloon').click();
        }
        await page.getByText('9 correct out of 10 questions', { exact: true }).waitFor();
        await page.getByRole('heading', { name: '🎉 Amazing exploring!', exact: true }).waitFor();
        await page.screenshot({ path: `${output}/complete-year-${year}-${viewport.width}.png`, fullPage: true });
        await button('Back to games').click(); await page.waitForURL(base + '/games');
        results.push(`Year ${year}, ${viewport.width}px: eligible menu → wrong answer/hint → pause/resume → ten answers → completion → menu`);
      }
      if (!lessonsOnly) {
        await goto('/games'); await chooseYear(4);
        await page.getByLabel('Search games', { exact: true }).fill('Number Planets');
        await page.locator('[data-game-link][href="/games/number-planets"]').click();
        await page.getByText('Mission 1 of 8 · 0 first-try discoveries', { exact: true }).waitFor();
        for (let round = 0; round < 8; round++) {
          const equation = await page.locator('.planet-equation').getAttribute('aria-label');
          const parts = equation?.match(/^(\d+) ([+×÷]) (\d+) = \?$/);
          assert.ok(parts, 'Number Planets presents a readable arithmetic question');
          const left = Number(parts[1]), right = Number(parts[3]);
          const answer = parts[2] === '+' ? left + right : parts[2] === '×' ? left * right : left / right;
          const hint = parts[2] === '+'
            ? `Start at ${left}, then count on ${right}.`
            : parts[2] === '÷'
              ? `How many groups of ${right} make ${left}?`
              : `Draw ${left} equal groups of ${right}.`;
          if (round === 0) {
            const choices = await page.getByRole('button', { name: /^Answer / }).all();
            for (const choice of choices) {
              if (await choice.getAttribute('aria-label') !== `Answer ${answer}`) { await choice.click(); break; }
            }
            await page.getByRole('status').filter({ hasText: `Try another planet. ${hint}` }).waitFor();
            await page.getByText('Mission 1 of 8 · 0 first-try discoveries', { exact: true }).waitFor();
            assert.equal(await button('Next space mission').count(), 0, 'Wrong answer cannot advance the mission');
            await button('Show a hint').click();
            await page.getByRole('status').getByText(hint, { exact: true }).waitFor();
            await page.screenshot({ path: `${output}/number-planets-retry-year-4-${viewport.width}.png`, fullPage: true });
          }
          await button(`Answer ${answer}`).click();
          await page.getByRole('status').filter({ hasText: 'Correct!' }).waitFor();
          assert.equal(await button(`Answer ${answer}`).evaluate(element => element.classList.contains('correct-planet')), true, 'Correct planet is visually identified');
          for (const choice of await page.getByRole('button', { name: /^Answer / }).all()) {
            if (await choice.getAttribute('aria-label') !== `Answer ${answer}`)
              assert.equal(await choice.evaluate(element => element.classList.contains('other-planet')), true, 'Other planets are visually de-emphasised');
          }
          await button(round === 7 ? 'Finish space mission' : 'Next space mission').click();
        }
        await page.getByText('Final score: 88%', { exact: true }).waitFor();
        await page.getByText('7 correct out of 8 questions', { exact: true }).waitFor();
        await page.getByRole('heading', { name: '🌟 Great job!', exact: true }).waitFor();
        await page.getByText('You earned 2 stars!', { exact: true }).waitFor();
        await page.waitForTimeout(1700);
        await page.getByText('88%', { exact: true }).waitFor();
        await page.screenshot({ path: `${output}/number-planets-complete-year-4-${viewport.width}.png`, fullPage: true });
        await button('Back to games').click(); await page.waitForURL(base + '/games');
        results.push(`Year 4, ${viewport.width}px: Number Planets → wrong answer → explicit hint → retry → 7/8 first-try answers (88%, two stars) → menu`);
      }
      for (let year = 1; year <= (lessonsOnly ? 0 : 6); year++) {
        for (const retry of [false, true]) {
          await goto('/games'); await chooseYear(year);
          await page.getByLabel('Search games', { exact: true }).fill('Maths Bingo');
          await page.locator('[data-game-link][href="/games/maths-bingo"]').click();
          const total = year <= 3 ? 9 : 16;
          await page.locator('[aria-label="Bingo card"]').waitFor();
          assert.equal(await page.getByRole('button', { name: /^Bingo number / }).count(), total);
          assert.equal(await button('Ask Archie').count(), 1, 'Bingo has one shared helper');
          let solved = 0;
          while (!(await page.getByText('🎱 BINGO!', { exact: true }).count()) && solved < total) {
            const question = await page.locator('p.text-4xl').innerText();
            const parts = question.match(/^(\d+) ([+\-×]) (\d+) = \?$/);
            assert.ok(parts, 'Bingo presents a readable arithmetic question');
            const a = Number(parts[1]), b = Number(parts[3]);
            const answer = parts[2] === '+' ? a + b : parts[2] === '-' ? a - b : a * b;
            if (solved === 0) {
              if (retry) {
                for (const choice of await page.getByRole('button', { name: /^Bingo number / }).all()) {
                  if (await choice.getAttribute('aria-label') !== `Bingo number ${answer}`) { await choice.click(); break; }
                }
                await page.getByRole('status').filter({ hasText: 'Good try. Use a hint' }).waitFor();
                assert.equal(await page.locator('p.text-4xl').innerText(), question, 'Wrong answer preserves the question');
              }
              await button('Show a hint').click();
              await page.getByRole('status').filter({ hasText: /Start at|Try \d+ groups/ }).waitFor();
              await button('Pause Bingo').click();
              await page.getByText('Paused. Your card and question are saved.', { exact: true }).waitFor();
              for (const choice of await page.getByRole('button', { name: /^Bingo number / }).all()) assert.equal(await choice.isDisabled(), true);
              await button('Resume Bingo').click();
              assert.equal(await page.locator('p.text-4xl').innerText(), question, 'Pause preserves the question');
              await page.screenshot({ path: `${output}/bingo-practice-${retry ? 'retry' : 'perfect'}-year-${year}-${viewport.width}.png`, fullPage: true });
            }
            await button(`Bingo number ${answer}`).click(); solved++;
            await button(`Bingo number ${answer}, marked`).waitFor();
            await page.waitForFunction(previous => document.body.textContent.includes('🎱 BINGO!') || document.querySelector('p.text-4xl')?.textContent !== previous, question);
          }
          const correct = solved - (retry ? 1 : 0);
          await page.getByText(`${correct} correct out of ${solved} questions`, { exact: true }).waitFor().catch(async error => {
            await page.screenshot({ path: `${output}/bingo-failure-${year}-${viewport.width}.png`, fullPage: true });
            throw error;
          });
          const score = Math.round(correct / solved * 100);
          await page.getByText(`${score}%`, { exact: true }).waitFor();
          if (!retry) {
            await page.getByRole('heading', { name: '🎉 Amazing exploring!', exact: true }).waitFor();
            await page.getByText('⭐ Three stars earned! ⭐', { exact: true }).waitFor();
            await page.waitForTimeout(1700); // inspect settled reward colours, not entrance fades
            if (year === 1) {
              const reward = await page.getByText('⭐ Three stars earned! ⭐', { exact: true }).evaluate(element => {
                const banner = getComputedStyle(element.parentElement);
                const encouragement = getComputedStyle([...document.querySelectorAll('div')].find(node => node.textContent?.trim() === 'Well done for practising. Come back whenever you are ready.'));
                const certificate = getComputedStyle([...document.querySelectorAll('button')].find(node => node.textContent?.includes('View Certificate')));
                return {
                  bannerText: banner.color,
                  bannerBackground: banner.backgroundImage,
                  encouragementText: encouragement.color,
                  encouragementBackground: encouragement.backgroundColor,
                  certificateText: certificate.color,
                  certificateBackground: certificate.backgroundImage,
                };
              });
              const bannerText = rgbValues(reward.bannerText)[0];
              const bannerBackgrounds = rgbValues(reward.bannerBackground);
              const encouragementText = rgbValues(reward.encouragementText)[0];
              const encouragementBackground = rgbValues(reward.encouragementBackground)[0];
              const certificateText = rgbValues(reward.certificateText)[0];
              const certificateBackgrounds = rgbValues(reward.certificateBackground);
              assert.ok(bannerText && bannerBackgrounds.length >= 2 && bannerBackgrounds.every(background => contrast(bannerText, background) >= 4.5), 'Maths reward banner text meets 4.5:1 against both gradient endpoints');
              assert.ok(certificateText && certificateBackgrounds.length >= 2 && certificateBackgrounds.every(background => contrast(certificateText, background) >= 4.5), 'Maths certificate text meets 4.5:1 against both gradient endpoints');
              assert.ok(encouragementText && encouragementBackground && contrast(encouragementText, encouragementBackground) >= 4.5, 'Supportive reward text meets 4.5:1');
              results.push(`Year ${year}, ${viewport.width}px: settled reward contrast ≥ 4.5:1 for banner, encouragement and certificate`);
            }
          }
          await page.screenshot({ path: `${output}/bingo-complete-${retry ? 'retry' : 'perfect'}-year-${year}-${viewport.width}.png`, fullPage: true });
          await button('Back to games').click(); await page.waitForURL(base + '/games');
          results.push(`Year ${year}, ${viewport.width}px: Maths Bingo ${retry ? 'retry' : 'perfect'} → hint → pause/resume → completed line → ${correct}/${solved} first-try answers (${score}%) → menu`);
        }
      }
      for (let year = 1; year <= 9; year++) {
        await goto('/games'); await chooseYear(year); await goto('/lesson');
        const studied = [];
        for (let step = 1; step <= 7; step++) {
          await page.getByRole('heading', { level: 1, name: new RegExp(`Year ${year}.*Step ${step} of 7`) }).waitFor();
          const board = page.getByRole('region', { name: 'Lesson whiteboard', exact: true });
          const word = (await (await board.locator('.lesson-word').count() ? board.locator('.lesson-word') : board.getByRole('heading', { level: 2 })).innerText()).trim();
          studied.push(word);
          if (step === 1) await page.getByText('Look at the word. Tap Hear the word, then Try spelling. The word will hide.', { exact: true }).waitFor();
          await button('Try spelling').click();
          if (step === 1) await page.getByText('Type the word you heard, then press Check.', { exact: true }).waitFor();
          if (step === 1) {
            await page.getByLabel('Your spelling').fill('wrong'); await button('Check').click();
            await page.getByText('Good try.', { exact: false }).waitFor();
            assert.equal(await page.getByLabel('Your spelling').isDisabled(), false);
            await button('Rubber: clear spelling').click();
            await button('Pause lesson').click();
            await page.getByRole('heading', { name: 'Lesson paused', exact: true }).waitFor();
            await button('Resume lesson').last().click();
            assert.equal(await page.getByLabel('Your spelling').inputValue(), '');
          }
          await page.getByLabel('Your spelling').fill(word); await button('Check').click();
          await page.getByText('Brilliant! You spelled it correctly.', { exact: false }).waitFor().catch(async error => {
            console.error({ year, step, word, input: await page.getByLabel('Your spelling').inputValue(), feedback: await page.getByRole('status').allTextContents() });
            await page.screenshot({ path: `${output}/lesson-failure-${year}-${step}-${viewport.width}.png`, fullPage: true });
            throw error;
          });
          assert.equal(await page.getByLabel('Your spelling').isDisabled(), true);
          await button(step === 7 ? 'Finish lesson' : 'Next word').click();
        }
        assert.equal(new Set(studied.map(word => word.toLowerCase())).size, 7);
        await page.getByRole('heading', { name: '3 stars earned', exact: true }).waitFor();
        await page.screenshot({ path: `${output}/lesson-complete-year-${year}-${viewport.width}.png`, fullPage: true });
        results.push(`Year ${year}, ${viewport.width}px: spelling lesson → wrong answer/retry → pause/resume → seven different words → reward`);
      }
      for (const [name, route] of [['home', '/'], ['games', '/games'], ['lesson', '/lesson'], ['parents', '/parents'], ['teacher', '/teacher']]) {
        await goto(route); await page.screenshot({ path: `${output}/${name}-${viewport.width}.png`, fullPage: true });
        if (name === 'parents' || name === 'teacher') {
          const words = (await page.getByRole('form').locator('p strong').first().innerText()).split(' ');
          await page.getByLabel('Grown-up answer', { exact: true }).fill(`${words.at(-1)} ${words[1]}`);
          await button('Continue with a grown-up').click();
          await page.getByRole('heading', { name: 'A grown-up needs to help here', exact: true }).waitFor({ state: 'detached' });
          await page.screenshot({ path: `${output}/${name}-unlocked-${viewport.width}.png`, fullPage: true });
        }
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        assert.ok(dimensions.document <= dimensions.viewport + 1, `${name} must not overflow at ${viewport.width}px`);
      }
      await page.close();
    }
    assert.deepEqual(errors, [], 'No browser exceptions');
    fs.writeFileSync(`${output}/results.json`, JSON.stringify({ base, simulatedLearners: true, results, errors }, null, 2));
    console.log(`PASS ${results.length} simulated search/game journeys; before/after captures: ${output}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
