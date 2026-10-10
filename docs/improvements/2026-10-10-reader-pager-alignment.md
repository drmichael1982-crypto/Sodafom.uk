# Reader pager alignment — 10 October 2026

## Repository state and ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Authoritative children’s test branch was rechecked from the remote, not inferred: `test/archie-2026-10-02` at `13f0c79a2a6d826a33b57c6c99ee131c026c498a` (`Keep local tutor questions with the right age band`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate branch: `improve/archie-learning-20261007`, current head `8415014f2f301b1479632421aa862906c16c5ac4`.
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), open and unmerged. The branch includes merge commit `295c217c0368cccb47081c006102db9efc864133`, which preserved the current target’s owner-route, game-star and age-local tutor changes.
- The separate Railway service `sodafom797` and Leonard’s queue were not changed. No 3D work, deployment, payment, credential or real-child data work occurred.

## Fresh evidence and bounded repair

The preceding candidate’s independent 820 × 1180 screenshot showed a strip of the earlier picture puzzle beside a clipped story. The problem was reproduced in current hosted Chromium rather than inferred from that old image.

The shared pager allowed browser focus scrolling inside its hidden-overflow viewport. Its focus calculation omitted that internal scroll, so it could retain the wrong screen. The first repair now:

- includes hidden native scroll in the target calculation and clears it;
- distinguishes pointer focus from keyboard focus so an off-screen pointer action completes before the screen moves;
- aligns an action with content named by `aria-controls`;
- keeps the reader story card in one CSS column instead of fragmenting it;
- associates `Read aloud` with its printed story;
- measures the rendered pager again after column layout and preserves the selected screen across ordinary child re-renders.

Regression tests cover hidden native scroll, one-tap off-screen action activation, controlled story alignment and exact screen-boundary placement. The hosted journey measures native scroll, story edges and preceding-puzzle overlap at 820 × 1180; it also retains the 390 × 844 capture and fallback/focus assertions.

## Actual checks and current blocker

Local checks on the current tree:

- TypeScript: PASS.
- Full Vitest: PASS — 113 files / 967 tests.
- Focused pager tests: PASS — 4 cases.
- Archie build: PASS; existing mixed-import and large-chunk warnings remain.
- ESLint on changed pager files, browser-script syntax and `git diff --check`: PASS.

Hosted evidence:

- [Run #302](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38019246867) first exposed a separate one-tap regression: the rewards pager moved but `Collect sticker` did not activate.
- [Run #304](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38019732684) proves that repair: the complete seven-word spelling journey now claims the sticker and reloads it successfully. It then reached the new reader assertion and showed the story on the wrong screen.
- [Run #306](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38020255587), [#308](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38020546054) and [#310](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38020890622) passed install, TypeScript, all unit tests, build, browser installation, home/personalisation/Ask Archie, spelling reward and book completion. They failed only at the new tablet geometry assertion before the simulated Year 1–9 step could run. Run #310 measured zero native scroll but the intact story exactly one screen to the right (`storyLeft: 820`) while the puzzle remained active.
- GitHub had not scheduled a workflow for heads `9d621117…` or `8415014…` when this note was written. Therefore the final post-layout/preserved-screen change is **not claimed browser-green**. Re-run hosted Chromium and inspect the 390px/820px captures before describing the visual defect as fixed.

This is a concrete CI blocker, not a claim that workers are still running. The final all-year simulated journeys are skipped whenever the earlier browser step fails.

## Visual review and deployment boundary

Direct live review opened the deployed home and reader. The live app preserves the pale illustrated background, blue/gold header, full-page picture jigsaw, large controls and blond, green-eyed Archie. The live reader is coherent at the available desktop width, but it is the target baseline, not this candidate.

Hosted artifacts were inspected separately. Run #302 showed the unreached reward action on screen 2. Run #304 showed the reward repaired but the 820px reader mixing the puzzle and story; the 390px recovery was also visibly split across adjacent screens. Later geometry proves the story card became intact, but not yet selected. These are simulated browser observations, not real-child testing or evidence of learning outcomes.

Railway’s `archie-learning-test` deployment was rechecked read-only: deployment `cd3835a5-bdf5-46f7-ba9b-6eb79bd1b703`, status SUCCESS, serves target commit `13f0c79a2a6d826a33b57c6c99ee131c026c498a` from `test/archie-2026-10-02`. This candidate was not deployed.

## Curriculum, comparison and accessibility boundary

- England’s [English national curriculum](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) remains the statutory source. This pager repair supports access to printed reading practice; it adds no statutory objective and proves no educational outcome.
- [Khan Academy Kids’ official ELA description](https://www.khanacademy.org/kids/ela) was used only as a benchmark for keeping narration and visible text available together. No character, lesson, wording or proprietary design was copied.
- [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) is the relevant accessibility direction: focused content should remain at least partially visible. The regression is narrower than a full WCAG conformance audit.
- Stripe Directory was attempted before external provider/product lookup; no provider was selected, purchased or provisioned.

Real-device touch/keyboard, microphone capture, speech-synthesis playback, screen-reader hardware, live accounts/payments and real-child testing remain unverified.

## Next priority

1. Obtain a fresh hosted run for `8415014…`; do not weaken the 820px story/puzzle geometry assertions.
2. If it passes, inspect both recovery screenshots, save exact artifact/run evidence, update PR #81 and mark the browser fix complete.
3. If it still fails, add rendered pager status/transform/client-width diagnostics before changing product code again.
4. Only after this is green, continue to remaining direct speech-synthesis callers.
