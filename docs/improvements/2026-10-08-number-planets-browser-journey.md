# Number Planets retry browser journey — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote candidate head before this change was `2b9ad8d213f8b6df50e5307230e73c2e2af590e2`.
- Rechecked the PR, current CI, saved run notes and Railway before editing. GitHub run #193 passed type-checking, all 835 unit tests, the production build, route checks, complete simulated learner journeys and artifact upload.
- The latest observed Railway test deployment remains healthy on `test/archie-2026-10-02` commit `c173a2565d96e66c781383b38445d85fa491795b`. The candidate branch is not deployed.
- Leonard/sodafom797 remains separate. No Leonard files or services were changed.

## Bounded test improvement

1. Added a complete Number Planets simulated browser journey to the existing responsive learner suite at 390 × 844 and 820 × 1180.
2. The journey opens Number Planets through its eligible Year 4 Games card and reads each rendered equation rather than relying on a hard-coded answer sequence.
3. On the first mission it deliberately chooses a wrong planet, verifies that the mission cannot advance, checks the supportive retry message, opens the explicit grouping hint and saves a retry-state screenshot.
4. It retries correctly, verifies the correct planet styling and de-emphasis of the alternatives, then completes all eight explicit missions.
5. The result check requires the settled accessible score of 88%, 7/8 first-try discoveries, the two-star heading and badge, a settled result screenshot, and successful navigation back to Games.
6. This adds regression coverage only. Game content, scoring, lesson progression, artwork, colours and learner data behavior are unchanged.

## Verification

- `node --check scripts/test-archie-search-journey.cjs`: PASS.
- Focused `number-planets.test.tsx`: PASS, 8/8 tests.
- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 85 files / 835 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `git diff --check`: PASS.
- Local Chromium is not installed in this runtime. The hosted browser run and its new phone/tablet screenshots remain required before treating the integrated journey as verified.

## Boundaries and next priority

Nothing was merged into the test or production branch and nothing was deployed. No paid service, credential, real child data, 3D work or Leonard edit occurred. Physical phone/tablet, microphone/audio, device keyboard/screen reader, live accounts/payments and real-child testing remain unverified.

Next bounded priority: run the new journey in hosted Chromium, inspect both retry and completed-result screenshots, and fix only a reproduced failure or visual defect.
