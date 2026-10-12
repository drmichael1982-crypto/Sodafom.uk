const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/playwright"
    : "playwright",
);
const base = process.env.ARCHIE_TEST_URL || "http://127.0.0.1:4173";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ARCHIE_CHROMIUM_PATH,
    args: process.env.ARCHIE_CHROMIUM_ARGS
      ? JSON.parse(process.env.ARCHIE_CHROMIUM_ARGS)
      : ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  fs.mkdirSync("test-results", { recursive: true });
  try {
    await page.goto(base);
    await page.getByRole("button", { name: "Planets", exact: true }).click();
    await page
      .getByRole("heading", { name: "Build the whole space picture" })
      .waitFor();
    await page.screenshot({
      path: "test-results/whole-space-mobile-before.png",
      fullPage: true,
    });
    const piece = page.getByRole("button", {
      name: "Pick space picture piece 1",
      exact: true,
    });
    await piece.click();
    await page
      .getByRole("button", { name: "Place space picture piece 2", exact: true })
      .click();
    assert.ok(
      (
        await page.locator(".whole-space-tray [role=status]").innerText()
      ).includes("do not join"),
    );
    for (let i = 1; i <= 9; i++) {
      await page
        .getByRole("button", {
          name: `Pick space picture piece ${i}`,
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: `Place space picture piece ${i}`,
          exact: true,
        })
        .click();
    }
    const model = page.locator(".whole-space-reward .orbit-model");
    await model.waitFor();
    const mb = await model.boundingBox();
    const bb = await page.locator(".whole-space-board").boundingBox();
    assert.ok(
      Math.abs(mb.height - bb.height) < 5 && Math.abs(mb.width - bb.width) < 5,
      "Space art must fill the whole picture: " + JSON.stringify({ mb, bb }),
    );
    assert.equal(await model.locator(".home-orbit").count(), 8);
    assert.equal(await model.locator(".home-planet-name").count(), 0);
    const transforms = () =>
      model
        .locator(".home-orbit")
        .evaluateAll((es) => es.map((e) => getComputedStyle(e).transform));
    const before = await transforms();
    await page.waitForTimeout(350);
    const after = await transforms();
    before.forEach((v, i) => assert.notEqual(v, after[i]));
    const moon = model.locator(".home-moon-orbit");
    const moonBefore = await moon.evaluate(
      (e) => getComputedStyle(e).transform,
    );
    await page.waitForTimeout(250);
    assert.notEqual(
      await moon.evaluate((e) => getComputedStyle(e).transform),
      moonBefore,
    );
    assert.equal(await model.locator(".shooting-star").count(), 3);
    assert.equal(
      await model
        .locator(".shooting-star")
        .first()
        .evaluate((e) => getComputedStyle(e).animationPlayState),
      "running",
    );
    await page.getByRole("button", { name: "Pause space scene" }).click();
    const stopped = await transforms();
    await page.waitForTimeout(250);
    assert.deepEqual(await transforms(), stopped);
    assert.equal(
      await model
        .locator(".shooting-star")
        .first()
        .evaluate((e) => getComputedStyle(e).animationPlayState),
      "paused",
    );
    await page.getByRole("button", { name: "Move space scene" }).click();
    await page.screenshot({
      path: "test-results/whole-space-mobile-finished.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Full screen" }).click();
    await page
      .getByRole("dialog", { name: "Full-screen whole-picture space jigsaw" })
      .waitFor();
    await page.screenshot({
      path: "test-results/whole-space-mobile-full.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Back to app" }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await model
        .locator(".home-orbit")
        .first()
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    assert.equal(
      await model
        .locator(".shooting-star")
        .first()
        .evaluate((e) => getComputedStyle(e).display),
      "none",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const v of [
      { width: 280, height: 653 },
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 900 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(v);
      await page
        .getByRole("button", { name: "Start the picture again" })
        .click();
      const dims = await page.evaluate(() => ({
        w: innerWidth,
        d: document.documentElement.scrollWidth,
      }));
      assert.ok(dims.d <= dims.w + 1, JSON.stringify({ v, dims }));
      const board = await page.locator(".whole-space-board").boundingBox();
      assert.ok(
        board.x >= 0 && board.y >= 0 && board.y + board.height <= v.height,
        JSON.stringify({ v, board }),
      );
      const cells = await page
        .locator(".whole-space-cell")
        .evaluateAll((es) =>
          es.map((e) => ({
            w: e.getBoundingClientRect().width,
            h: e.getBoundingClientRect().height,
          })),
        );
      assert.ok(
        cells.every((e) => e.w >= 44 && e.h >= 44),
        JSON.stringify({ v, cells }),
      );
      await page.screenshot({
        path: `test-results/whole-space-${v.width}x${v.height}.png`,
        fullPage: true,
      });
      console.log("PASS space layout " + v.width + "x" + v.height);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Puzzles", exact: true }).click();
    await page.getByRole("button", { name: "Fractions", exact: true }).click();
    await page.getByText("Question 1 of 10", { exact: true }).waitFor();
    for (let index = 0; index < 10; index++) {
      const heading = await page.locator(".fraction-jigsaw h3").innerText();
      if (heading.startsWith("Can you make")) {
        const match = heading.match(/(\d+)\/(\d+)/);
        for (let i = 1; i <= Number(match[1]); i++)
          await page
            .getByRole("button", { name: `Fraction section ${i}`, exact: true })
            .click();
        await page
          .getByRole("button", { name: "Check the fraction", exact: true })
          .click();
      } else {
        const imageLabel = await page
          .locator(".fraction-circle")
          .getAttribute("aria-label");
        const m = imageLabel.match(/(\d+) equal sections; (\d+) shaded/);
        const n = Number(m[2]),
          d = Number(m[1]);
        const answer = heading.startsWith("Which fraction")
          ? `${n * 2}/${d * 2}`
          : `${n}/${d}`;
        await page
          .getByRole("group", { name: "Fraction answers" })
          .getByRole("button", { name: answer, exact: true })
          .click();
      }
      if (index === 0) {
        await page.waitForTimeout(2600);
        await page.getByText("Question 2 of 10", { exact: true }).waitFor();
      } else
        await page
          .getByRole("button", {
            name: index === 9 ? "See my results" : "Next question",
            exact: true,
          })
          .click();
    }
    await page
      .getByRole("heading", { name: "Ten fractions explored!" })
      .waitFor();
    assert.ok(
      (await page.getByRole("status").innerText()).includes("10 of 10"),
    );
    await page.getByRole("button", { name: "Play ten more questions" }).click();
    await page.screenshot({
      path: "test-results/fractions-ten-questions-mobile.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS whole-picture completion, eight unlabelled orbits, Moon, shooting stars, pause, full screen, reduced motion, ten fractions and saved results",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
