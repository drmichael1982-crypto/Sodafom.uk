# Maths Bingo keyboard hint and pause focus — 9 October 2026

## State rechecked before work

- Continued draft PR #81 on `improve/archie-learning-20261007` from documented head `df9ebab281c120401d60cb8ac11f547b9e8302bd`; its last workflow, run #249, was green.
- Rechecked the target branch before changing code. It had advanced to `360721c548b9c1e2a87cf659e31c7bd6245d06e9` with the full-screen page jigsaw and moving game-completion scenes, so this run reconciled that real state instead of assuming the older base.
- Railway deployment `fae64657-857d-4b0e-a66d-d446eae5fed4` was `SUCCESS` on test commit `360721c`, branch `test/archie-2026-10-02`, created 9 October 2026 at 20:54:44 UTC. No deployment or configuration was changed.
- The merge had two textual conflicts. `LearningJigsaw.tsx` keeps the incoming moving reward/replay behavior and the candidate's year-specific fraction puzzle. `GameShell.help.test.tsx` keeps the incoming return-to-puzzle check and the candidate's settled final-score accessibility assertion.
- Focused reconciliation tests passed, 2 files / 9 tests. Leonard/sodafom797 stayed separate; no Leonard file, service or queue was changed.

## Bounded regression improvement

Strengthened the existing Maths Bingo retry journey in `scripts/test-archie-search-journey.cjs` and `src/pages/games/maths-bingo.test.tsx`. The checks now require:

- activate a wrong answer by keyboard and retain focus while supportive retry feedback appears;
- focus Show a hint, activate it with Enter and retain focus while the arithmetic hint is announced;
- focus Pause Bingo, activate it with Space and keep focus on the renamed Resume Bingo control;
- disable every answer while paused, preserving the exact question, retry feedback and hint;
- resume with Enter and restore focus to Pause Bingo;
- repeat the browser path for Years 1–6 at 390 × 844 and 820 × 1180, with representative Year 1 and Year 6 hint/paused screenshots at both widths.

The existing simulated-journey count is unchanged because current paths were strengthened instead of duplicated. No product-code change was warranted: current Bingo controls passed the focused unit and real-browser assertions.

These are simulated learner scenarios. They verify implemented controls, state, focus and feedback; they do not demonstrate enjoyment or learning outcomes in real children.

## Accessibility, curriculum and product boundary

- WCAG 2.2 Focus Order supports the predictable hint and renamed pause/resume sequence: [W3C Understanding Success Criterion 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).
- England's statutory mathematics programme remains the boundary for the existing addition, subtraction and multiplication practice. Game tiers, hints, recovery and focus behavior are Sodafom design proposals rather than statutory requirements: [National curriculum in England: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).
- Prior official-product comparisons remain design inspiration only. This run validates Sodafom's original keyboard path; it does not copy proprietary art, characters, wording or lessons and makes no superiority or learning-outcome claim.

No new provider or organisation was selected or looked up. No external service was provisioned, subscribed to or integrated.

## Verification

- Candidate code head: `706632a820e0195f23d8db3ef23ae747ed50ee23`.
- Script syntax and `git diff --check`: PASS.
- Focused merge checks: PASS, 2 files / 9 tests.
- Focused Maths Bingo test: PASS, 1 file / 12 tests.
- Local `npm run type-check`: PASS.
- Local full unit suite: PASS, 87 files / 849 tests.
- Local production build: PASS with the existing mixed-import and chunk-size warnings.
- GitHub Actions run #255 correctly failed when the newly reconciled moving reward intercepted the old journey's behind-dialog Back to games click. The browser journey was repaired to require initial focus on Back to puzzle, close the modal through that control and then continue to the settled result. No product code was weakened or bypassed.
- [GitHub Actions run #257](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37992570791): PASS. Installation, type-check, 87 files / 849 tests, production build and Chromium setup all passed.
- Hosted route checks: PASS, 12 core browser journeys, all 130 linked game routes, whole-picture play at six viewports, responsive layout sweep with no horizontal overflow, zero browser errors and zero live API requests.
- Hosted simulated journeys: PASS, 82 total. Maths Bingo completed Years 1–6 in perfect and retry variants at both widths, including keyboard hint/pause/resume focus assertions and the moving reward close path.
- Evidence artifact `11645727845`: 159 files / 70,171,203 bytes; SHA-256 `8a8a070680c442e1b285c5a731db3c73f75a7e1a6b59bb4264e41a63b8f0e51a`.

## Rendered evidence reviewed

- Directly opened the current deployed home, Games, Lessons, Maths Bingo, grown-up gate and teacher preview. The home screen preserves SODAFOM branding, blond/green-eyed Archie, clear route controls and the new fitted 18-piece picture playground. Maths Bingo remains readable and unclipped. The grown-up and teacher pages continue to avoid requesting real pupil data.
- Opened the deployed full-screen page jigsaw. Its picture, spaces, loose-piece tray and primary actions are visually coherent at the desktop viewport. The left identity text in the thin top strip appeared partly clipped, so that specific responsive strip is recorded for follow-up rather than generalised as a passing phone/tablet result.
- Reviewed fresh Year 1 and Year 6 hint and paused captures at 390 × 844 and 820 × 1180. They show the exact question and retry hint, large Show a hint/Pause or Resume controls, visible keyboard focus and no horizontal clipping. At tablet width the full card remains visible; at phone width the existing pager keeps the question and break controls on a clear first screen.
- Reviewed the fresh Maths moving-reward scene at both widths. The reduced-motion capture shows a still space scene with blond, green-eyed Archie at tablet width, a high-contrast Back to puzzle control, explanatory completion copy and a disabled Still scene control; the portrait phone composition retains the title and both actions without clipping.
- Reviewed settled retry and perfect Bingo results after closing the modal. The phone result exposes the 80%/two-star recovery outcome and next actions; the tablet result exposes the 100%/three-star outcome, certificate and navigation with readable contrast.
- Screenshot evidence is supporting visual evidence, not a physical-device, real screen-reader or real-child test.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, payment, real child data or 3D work was used. Physical-device touch/keyboard, microphone/audio, screen-reader, live-account and real-child checks remain unverified.

Next bounded priority: inspect the full-screen page-jigsaw identity strip at phone and tablet widths, then fix the observed left-label clipping if the hosted responsive captures reproduce it. Keep Leonard's queue isolated and preserve the existing picture, controls and completion behavior.
