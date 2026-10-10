# Teacher desktop gate-layout regression — 10 October 2026

## Fresh state and ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The active children’s test branch was resolved again from GitHub and Railway: `test/archie-2026-10-02` at `47e1e7fea32a6d3e63ebfe7a31afca0822a3284b`.
- Railway deployment `14cb7743-7caf-473b-bacc-89bdd8c75559` is `SUCCESS` on that exact commit. It was created on 10 October 2026 at 09:02 UTC. No deployment was started, restarted or changed here.
- Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains the dedicated 2D Archie improvement queue. Its branch `improve/archie-learning-20261007` was reconciled with `47e1e7f…` before this check. GitHub comparison reports the candidate 124 commits ahead and zero behind that target. The PR remains open, draft, unmerged and undeployed.
- PR #80’s homepage work, deferred 3D work and the separate `sodafom797` service/repository were not edited.

## Current deployed defect and bounded candidate check

The current Railway target was directly opened at `/teacher` in a cloud browser and unlocked by following the visible grown-up instruction. At the observed desktop viewport (1363 × 936), the deployed target left the old gate panel and teacher lesson content side by side. The lesson column extended beyond the app screen and clipped. This is current deployment evidence, not an inference from an old report.

The candidate already replaces the unlocked gate wrapper with a focused screen-reader announcement followed by the adult content as ordinary pager children. This run adds the missing regression coverage rather than changing that existing product behavior:

- Every responsive layout now unlocks `/teacher`, verifies the gate heading is removed from the rendered flow and rechecks page overflow.
- The 1440 × 900 desktop scenario waits for the post-unlock layout to settle, locates `Recent puzzle learning on this device`, and asserts its left and right bounds remain within `.app-screen-window`.
- The desktop state is saved as `test-results/teacher-unlocked-1440.png` for direct review.

No lesson objective, answer, game, reward, branding, character art, payment path, account behavior, credential, dependency, 3D feature or `sodafom797` code changed.

## Test development evidence

- Local TypeScript: PASS.
- Local Vitest: PASS — 128 files / 999 tests.
- Local Archie production build: PASS; the existing mixed-import and large-chunk warnings remain.
- Script syntax and `git diff --check`: PASS.
- Hosted run [#362](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38040587198) correctly failed the first over-broad version at 280 × 653 because a heading straddled a narrow paged column and the horizontal reveal helper could not settle it. TypeScript, 999 tests and build passed; the later scenario matrix was skipped.
- Hosted run [#364](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38041000804) reached the intended 1440 × 900 state. Its artifact visibly shows the candidate with the gate gone, `School preview` and `Recent puzzle learning on this device` fully contained on screen 1 / 8, coherent blue/gold styling and no side-by-side clipping. The check still failed because it sampled geometry during the unlock reflow and attempted to click an already-disabled Previous control. The final assertion therefore waits for settled layout and measures the visible first screen directly.
- Hosted code-head run [#366](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38041445054) is green at `4ec88304b720e4cfb89b4160a79b7fa6a24daf84`: TypeScript, 128 files / 999 tests, production build, Chromium install, 15 complete browser journeys, 130 game routes, all responsive layouts and 82 simulated search/game journeys passed with zero browser errors and zero live API requests.
- Artifact `11665598691` (`sha256:b214de7a39f9f0a1a5c0bdac3c9ec5d06193da9f755de4cbcc7f277933034045`) contains 180 files. Direct inspection of `teacher-unlocked-1440.png` confirms the gate is absent; `School preview` and `Recent puzzle learning on this device` are fully contained on screen 1 / 8; Previous remains disabled, Next remains visible; and the established blue/gold school artwork is preserved.
- Documentation-head run [#367](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38041663033) repeated the complete workflow after this note was first published and is also green.

These are simulated browser scenarios, not real-child testing or proof of learning outcomes or enjoyment.

## Curriculum, comparison and boundaries

This is layout-regression coverage only. The learning-source basis remains the [England English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study), [England maths programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) and [DfE reading framework](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy). The product benchmark remains clear print, optional support, large controls and calm feedback; no proprietary character, artwork, text or lesson was copied, and no new statutory or outcome claim is made here.

Physical phone/tablet testing, audible speech output, microphone capture, hardware screen readers, live parent accounts/payments and real-child outcomes remain unverified. Payments remain deliberately disabled on the public test unless explicitly enabled by the owner; no paid service or live payment was activated.

## Next priority

Exercise the newly deployed target’s parent progress summaries and one complete Sudoku round at phone and tablet widths. Verify saved-age tutoring uses the grown-up-selected learning age without sending real child data. Keep PR #81 draft, unmerged and undeployed.
