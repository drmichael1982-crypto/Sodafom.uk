# Reconcile the latest Archie test design — 8 October 2026

## Repository and deployment state checked first

- Rechecked draft PR #81, current CI, saved run notes and Railway before editing. The draft head was `b9dedb28b93f6fb1ac2bb10529dc9f7388b5245f`; the current children’s test branch and live Railway deployment were `test/archie-2026-10-02` commit `c173a2565d96e66c781383b38445d85fa491795b`.
- GitHub comparison showed the draft was 34 commits ahead and 5 commits behind the current test branch, with merge base `f254a44aa06bf0d8e4035059290e0a538393f886`. PR #81 was not mergeable before reconciliation.
- The five newer test commits contain the current picture-piece home, textured/spinning planet art and compact Number Planets phone layout. They had been deployed to the test service without an associated GitHub Actions run.
- Leonard/sodafom797 remained separate. No Leonard files or services were changed.

## Live walkthrough before reconciliation

- Repeated the live Number Planets wrong-answer, hint and retry path. A wrong choice stayed on the same mission and showed `Try another planet`; the hint changed the guidance to the relevant grouping model; a corrected answer advanced only after the explicit Next action.
- Completed the remaining seven missions correctly. The final result settled at 88%, 7/8 first-try discoveries and two stars, matching the intended first-try scoring.
- Direct rendered checks at 360 × 740 and 768 × 1024 showed the equation, four answer picture pieces, retry/hint guidance and controls without horizontal clipping. These were CSS viewport simulations, not physical-device or real-child tests.

## Bounded reconciliation and fix

1. Merged the current test head into `improve/archie-learning-20261007`, preserving the new `ArchiePicturePiece`, `PlanetGlobe`, surface atlas, home artwork and compact Number Planets layout.
2. Resolved the single source conflict in `ArchiePages.tsx` by keeping both sets of intentional behavior:
   - picture artwork and the compact Games toolbar from the test branch;
   - duplicate-route filtering, the ages 5–12 year grouping/note and accessible empty-search recovery from the improvement branch.
3. The combined type-check exposed a real failure in the newly added planet-jigsaw test: Testing Library’s `getByRole` type does not accept the supplied `exact` option. Removed that unsupported option from the eight affected exact string queries; the asserted accessible names and behavior are unchanged.
4. Published merge commit `dd121a69015868c98c99bb487174db7e81f74fed`, with parents `b9dedb28b93f6fb1ac2bb10529dc9f7388b5245f` and `c173a2565d96e66c781383b38445d85fa491795b`. GitHub then reported PR #81 mergeable against the current test base.

## Hosted failure found and repaired

- GitHub run #187 passed dependency installation, type-checking, all 835 unit tests, the production build and Playwright installation, then failed the responsive route check before the simulated learner journeys could start.
- The uploaded failure screenshot and Playwright log showed the precise defect at 820 × 1180: the learning-year scope note took nearly all the filter row, collapsing `Search games` to its icon. The search control existed but was not visible or editable.
- Replaced that flex row with a bounded two-column grid so the year control and search both retain useful width. At 600 px and below the controls now stack, keeping the search full-width on phones instead of squeezing it.
- Directly inspected the hosted failure image as part of the diagnosis. The otherwise successful screenshots also preserve the colourful picture-piece home and History/Fraction completion views at 390 px and 820 px.

## Verification

- `npm run type-check`: PASS after the test-query repair.
- Focused integration tests: PASS, 4 files / 33 tests (Number Planets, OrbitHome, year options and Games age filtering).
- `npm test -- --run`: PASS, 85 files / 835 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `git diff --check`: PASS.
- Local Playwright execution could not start because no browser binary was installed; the attempted browser download was truncated by this runtime’s gateway. GitHub run #187 therefore provided the authoritative browser diagnosis and artifact for the merged candidate.
- After the responsive filter repair, type-check, all 85 files / 835 unit tests, the Archie build and `git diff --check` passed again locally. A fresh hosted browser run is required for the repair.

## Boundaries and next priority

Nothing was merged into the test or production branch and nothing was deployed. No paid service, credential, real child data or 3D work changed. Physical phone/tablet, microphone/audio, device keyboard/screen reader, live accounts/payments and real-child testing remain unverified.

Next bounded priority: confirm the new hosted browser run clears the Games search regression and completes the simulated learner journeys, then add an automated Number Planets wrong-answer → hint → retry → 7/8 result browser journey at both phone and tablet widths so this manually verified behavior cannot regress.
