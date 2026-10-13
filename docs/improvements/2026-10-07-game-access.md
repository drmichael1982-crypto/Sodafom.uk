# Archie game-access improvement — 7 October 2026

## Verified starting state and ownership
- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Actual test branch: `test/archie-2026-10-02`, head `d31cadfea3edc44e19d25e34f3c5b41ed3e3d5f6`, rechecked before publication. This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Implementation commit: `602ab1c20aa448857071d937522b5a72f2be15e1`. This note is a following documentation-only commit.
- Open PR #80 targets the test branch but contains an older homepage change. Homepage layout/art were left alone. Other open PRs concern older integration/3D/adult work, not these game-access fixes. No force updates, merges or deployments.
- Read Leonard's current task instructions privately: its development target is the separate `drmichael1982-crypto/sodafom797` repository, with explicit coordination and avoidance of concurrent Archie edits. No Leonard source or active service was changed. Running laptop worker/queue ownership is not observable here; future integration must recheck both queues and this draft branch.
- Current test URL: https://archie-learning-test-production.up.railway.app/
- Railway read-only evidence: deployment `15f206f9-e9ef-4070-bbab-b63f10cff7cd`, SUCCESS, updated 2026-10-07T16:35:57Z, test-branch head d31cadf. Its environment label is production, but the service is the separate archie-learning-test service. These candidate changes have not been deployed.

## Current failures established before changing code
GitHub Actions run [37652943503](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37652943503), job 112900699847: install, type check, unit tests, build and Chromium installation passed. The buttons/game-routes step failed because it searched for Number Pop in Year 4, where the existing age policy correctly excludes it. This is a stale test expectation, not evidence that Number Pop itself was broken.

Fresh browser execution then exposed actual defects:
1. Tier-1 Maths Bingo attempted to draw 16 unique numbers from a 10-number pool, freezing the browser.
2. Forty-seven game catalogue entries advertised years excluded by their actual GameShell/makeGame entry policy. Angle Explorer was the first observed guarded route after repairing Bingo.
3. Empty search gave no year-specific recovery guidance and its reset did not return keyboard focus.

## Changed behavior
- Maths Bingo generates a finite shuffled pool: 9 distinct numbers in 1–10 for tier 1 (3×3), 16 for other tiers (4×4). Repeated random values cannot hang generation. Row/column detection and reported card size follow the actual grid. Marked/completed cells are disabled, and the shared Ask Archie helper appears once.
- Removed an immediate stale-card question update; the marked-state effect now advances the question once.
- Tightened 47 catalogue age ranges to the intersection of the existing menu range and the actual game entry range. No game was deleted or made available to younger/older pupils beyond its existing policy; all 130 routes retain eligible years.
- Empty search offers clear suggestions and “Show Year N games”; reset clears subject/query, preserves the selected year and focuses search.
- Corrected the CI Number Pop launch to Year 3 while retaining negative Year 4 assertions.
- Added independent catalogue-vs-entry checks, finite-card/line/completion tests, year-preserving reset tests, and phone/tablet simulated game/lesson journeys. CI now runs the additional journey script and uploads captures.
- Branding, blond Archie with green eyes, 2D scope, existing curriculum content, adult gates and production settings are preserved.

## Validation on the exact implementation
| Check | Result |
| --- | --- |
| TypeScript noEmit | PASS |
| Full Vitest | PASS — 77 files, 807 tests |
| Archie-test Vite build | PASS — existing >500 kB chunk warning remains |
| Existing browser suite | PASS — 11 journeys; all 130 games opened through their eligible menu; zero browser errors; zero live API requests |
| Layout browser suite | PASS — 20 routes × 16 phone/foldable/tablet/landscape/desktop sizes, including unlocked adult views; no horizontal overflow |
| New simulated journey suite | PASS — 54 scenarios at 390×844 and 820×1180, reduced-motion requested |
| Syntax / workflow YAML / git diff whitespace | PASS |

The 54 scenarios comprise 18 empty-filter recoveries (Years 1–9 at two widths), 6 full Number Pop adventures (Years 1–3), 12 full Bingo games (Years 1–6), and 18 full seven-word spelling lessons (Years 1–9). Number Pop and spelling include wrong answers, retry/help, pause/resume, progression and rewards. Bingo checks menu access, grid size, one helper, correct answers, completed row/column and return navigation; it does not claim pause/retry/hints are implemented.

Each catalogue entry is checked against all nine supported year settings in unit tests. Opening every route is not a full playthrough of every game/year combination. The full inherited-game matrix and complete course/teacher lesson matrix remain unfinished. These are simulated learners; no real children or demonstrated learning/enjoyment outcomes.

Commands: `node node_modules/typescript/bin/tsc --noEmit`; `node node_modules/vitest/vitest.mjs run`; `node node_modules/vite/bin/vite.js build --mode archie-test`; serve with `node --import tsx scripts/serve-archie-test.ts`, then `node scripts/test-archie-ui.cjs` and `node scripts/test-archie-search-journey.cjs`.

Runtime limitation: the standard Playwright Chromium download was unusable here. Local verification used a temporary Chromium 153 executable via ARCHIE_CHROMIUM_PATH; no dependency was added to the app. Hosted CI uses its normal Playwright-installed Chromium. CLI tsx IPC was blocked locally, so node --import tsx ran the same server. Real laptop microphone, speech recognition/audio, physical phone/tablet, live accounts and payments were not verified. No credentials, paid services or child data used.

## Rendered review and original design benchmark
The deployed homepage and Number Pop were directly viewed in the browser, including a wrong answer, pause/resume and completed adventure. Local before captures use the exact deployed d31cadf baseline; after captures use the candidate. Inspected home, games, Number Pop/Bingo, spelling lesson and both locked/unlocked parent/teacher pages at phone/tablet widths. Captures are generated in test-results/search-before and search-after; CI uploads after captures. The baseline can be reproduced with ARCHIE_CAPTURE_ONLY=1.

Successful elements: blue/gold hierarchy, pale background, clear white panels, prominent controls, blond/green-eyed Archie and planet artwork. The new empty state fits both widths and retains visible keyboard focus. Static CSS contrast examples: white on #0965d7 = 5.45:1; #173268 on white = 12.41:1. These are selected pairs, not a complete contrast audit. Narrow menus remain long and dense; lesson controls fit. Reduced motion was requested and no horizontal overflow detected; this does not establish every animation is fully suppressed.

Official comparison sources checked on 7 October 2026:
- [Reading Eggs official apps](https://readingeggs.co.uk/apps/): age/subject/platform filtering with reset is a relevant discovery benchmark. Our original improvement makes recovery explicitly retain the selected learning year and keyboard focus. No proprietary lessons, artwork or characters copied.
- [Oxford Owl official support](https://support.oxfordowl.co.uk/teacher-support/getting-started/what-is-oxford-owl/): separate school and home support is a relevant adult/pupil navigation benchmark. Existing adult gates were preserved; no claim of a new adult feature.
- Required Stripe Directory skill was read and Directory engagement attempted before provider comparison lookup. The Directory CLI/broker could not execute in this runtime (socket permission/broker timeout); official product pages were used as the documented fallback. No provider was purchased or provisioned.

There is no verified universal “best app” or superiority claim. Benchmark here is reliable age-appropriate discovery, clear recovery and working game access, not educational outcome ranking.

## Curriculum evidence and limits
[DfE England mathematics programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study), checked 7 October 2026, supports Year 1 addition/subtraction practice including numbers to 20 and zero. Bingo's within-10 addition is a bounded practice subset; it does not cover the full statutory programme. The finite 3×3 design, exact game age buckets, rewards and proposed year sequence are app design decisions, not statutory requirements. No phonics content changed. Curriculum alignment of every inherited activity still requires individual review.

## Next priorities and concrete limits
1. Fix Bingo learning feedback: winning a line can currently yield “Good try” and a low percentage because unmarked squares are treated as unanswered questions. Do not confuse this with the transient animated score captured immediately after completion. Evaluate wrong-answer support and optional pause/hints alongside accurate scoring in a separate bounded change.
2. Review gold/white reward controls for contrast, cramped phone home helper text, truncated year-selector text, repeated placeholder planet imagery and dense game lists. Coordinate homepage work with PR #80.
3. Continue full simulated game and course lessons for each eligible year, then real-device microphone/audio and representative supervised usability evaluation. Do not claim improved enjoyment or learning without evidence.
4. Recheck remote head/PR ownership/CI and deployment each iteration. This branch and note are the current handoff; do not edit deployed/test/main branches or auto-promote.

No merge, deployment, live payments, account activation or laptop installation occurred.
