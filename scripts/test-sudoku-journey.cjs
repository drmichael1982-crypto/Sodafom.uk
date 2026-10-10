const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const base = process.env.ARCHIE_TEST_URL || "http://127.0.0.1:4173";
const executablePath = process.env.ARCHIE_CHROMIUM_PATH;
const captureDir = path.resolve(
  process.env.ARCHIE_CAPTURE_DIR || "test-results/sudoku-journey",
);
const puzzle = [
  [1, null, 3, null],
  [null, 4, null, 2],
  [2, null, 4, null],
  [null, 3, null, 1],
];
const solution = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

async function choose(page, row, column, value) {
  await page
    .getByRole("button", { name: `Row ${row + 1} column ${column + 1}: empty` })
    .click();
  await page.getByRole("button", { name: String(value), exact: true }).click();
}

async function capture(page, viewport, state) {
  await page.screenshot({
    path: path.join(captureDir, `${viewport}-${state}.png`),
    fullPage: true,
  });
}

(async () => {
  fs.mkdirSync(captureDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    for (const [label, width, height] of [
      ["phone", 390, 844],
      ["tablet", 820, 1180],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      await page.addInitScript(() => {
        Math.random = () => 0;
        localStorage.setItem(
          "sodafom_archie_design_v1",
          JSON.stringify({
            settings: {
              year: 2,
              sound: false,
              largeText: false,
              onlineHelp: false,
            },
            activities: [],
            stickers: [],
          }),
        );
      });
      await page.goto(`${base}/games/sudoku`);

      await page
        .getByText(
          "Each row, column and 2×2 box must contain 1–4 exactly once.",
        )
        .waitFor();
      await page.getByRole("button", { name: "Row 1 column 2: empty" }).click();
      await page.getByRole("button", { name: "1", exact: true }).click();
      await page
        .getByRole("status")
        .filter({ hasText: /does not fit here yet/i })
        .waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: /Row 1 column 2: 1, try again/ })
          .getAttribute("aria-invalid"),
        "true",
      );
      await capture(page, label, "retry");

      await page.getByRole("button", { name: /Show hint/i }).click();
      await page
        .getByRole("status")
        .filter({ hasText: /Erase the red number first/i })
        .waitFor();
      await page.getByRole("button", { name: "Erase" }).click();
      await page.getByRole("button", { name: /Show hint/i }).click();
      await page
        .getByRole("status")
        .filter({ hasText: /Which number appears in both lists/i })
        .waitFor();
      await capture(page, label, "hint");

      await page.getByRole("button", { name: "2", exact: true }).click();
      await choose(page, 0, 3, 4);
      await page.getByRole("button", { name: /Pause puzzle/i }).click();
      await page.getByRole("heading", { name: "Take a calm break" }).waitFor();
      assert.equal(
        await page.getByRole("region", { name: /Sudoku board/i }).count(),
        0,
      );
      assert.match(
        await page.evaluate(() => document.activeElement?.textContent || ""),
        /Resume puzzle/,
      );
      await capture(page, label, "paused");

      await page.getByRole("button", { name: /Resume puzzle/i }).click();
      assert.match(
        await page.evaluate(() => document.activeElement?.textContent || ""),
        /Pause puzzle/,
      );
      assert.equal(
        await page
          .getByRole("button", { name: "Row 1 column 4: 4" })
          .getAttribute("aria-pressed"),
        "true",
      );

      for (let row = 0; row < puzzle.length; row += 1) {
        for (let column = 0; column < puzzle[row].length; column += 1) {
          if (
            puzzle[row][column] === null &&
            !(row === 0 && (column === 1 || column === 3))
          ) {
            await choose(page, row, column, solution[row][column]);
          }
        }
      }

      await page
        .getByRole("dialog", { name: /Your rocket is ready/i })
        .waitFor();
      await page.getByRole("button", { name: "Back to puzzle" }).click();
      await page.getByText("Final score: 95%").waitFor();
      await page.getByText("8 correct out of 8 questions").waitFor();
      await page.getByText("You earned 3 stars!").waitFor();
      await page.getByText("Your practice earned three stars!").waitFor();
      assert.equal(
        await page.getByText("You got every question right!").count(),
        0,
      );
      await page.waitForTimeout(1_800);
      await capture(page, label, "result");

      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
      console.log(
        `PASS: ${label} Sudoku retry, hint, pause/resume, completion and contained result.`,
      );
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
