# History and fraction jigsaw progress — 7 October 2026

## Repository state checked first

- Continued dedicated branch `improve/archie-learning-20261007` and draft PR #81; no merge or deployment was requested or performed.
- Rechecked the remote test branch rather than relying on the preceding run note. Its current head is `f254a44aa06bf0d8e4035059290e0a538393f886`, after the 26-piece space home, full-page solar-system reward, upright moving planet names and star-layer control fix (`126df4c` → `af72e93` → `b04e363` → `f254a44`).
- Railway commit status for `f254a44` is SUCCESS. The live test site was reloaded and directly inspected: it shows the three Explore/Planets/Puzzles screens, all 26 joined home pieces, moving planets and blond Archie. The History page was also directly inspected before this candidate change.
- Merged `f254a44` into the improvement branch. One test-only conflict retained both the newer full-page reward assertion and the improvement branch's robust accessible-name matching; all 8 solar-home tests then passed.

## Bounded change

1. Fraction picture puzzles now use explicit year-aware sequences:
   - Year 1: halves and quarters only.
   - Year 2: thirds, halves, quarters, two quarters and three quarters.
   - Years 3–9: the existing small-denominator practice, including eighths.
2. History and fraction picture puzzles now have pause/resume controls that preserve placed pieces. History also has an explicit scene restart.
3. Completing all fraction puzzles for a selected year or one complete history scene records one idempotent learning activity in the existing on-device progress store. The grown-up progress view now says “Recent learning” and includes puzzles as well as books and lessons.
4. Completion still gives a small learning reward; it does not add streak pressure, timers, purchases or a requirement to continue.

## Curriculum and comparison basis

- Statutory England mathematics source: <https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study>. Year 1 requires halves and quarters; Year 2 adds thirds, two quarters, three quarters and the equivalence of two quarters and one half. The app's Years 3–9 small-denominator circles are supplementary visual practice, not a claim of complete coverage for those years.
- Statutory England history source: <https://www.gov.uk/government/publications/national-curriculum-in-england-history-programmes-of-study/national-curriculum-in-england-history-programmes-of-study>. The questions continue to practise chronology, asking and answering questions, and using sources as evidence. The four scene choices are an editorial practice set, not statutory year-by-year allocations or a complete history scheme.
- Official product benchmark rechecked 7 October 2026: Khan Academy Kids advertises an adaptive learning path, in-the-moment guidance and parent/class progress reporting; Mathseeds advertises ability-matched lessons, rewards and instant progress reports. Archie now closes one narrow gap by saving these two jigsaw completions to the existing grown-up progress view. It does not claim equivalent reporting breadth, adaptive outcomes or superiority.
- Stripe Directory instructions were consulted before the provider comparison. The `stripe` CLI is unavailable in this runtime; no provider was selected or engaged and no service was provisioned, subscribed to or paid for. Only public official pages were read.

## Verification

- `npm run type-check`: PASS.
- Targeted Vitest (Fraction Jigsaw, History Jigsaw, Learning Jigsaw and Orbit Home): 4 files, 17 tests: PASS.
- Full Vitest: 84 files, 832 tests: PASS.
- `npm run build:archie`: PASS. Existing bundle-size and mixed dynamic/static import warnings remain warnings.
- First published GitHub run #132 passed install, TypeScript, all 832 tests and build, then reproduced a stale browser selector in the route sweep: the test still searched for “Explore my world” after the preserved space-home design renamed that visible piece “My world”. The browser suite, phone-action helper and release helper now use the current compact labels.
- Follow-up run #134 passed install, TypeScript, all tests and build, then exposed a real merge regression: `Progress` appeared twice because both reconciled branches added the same destination in different menu lists. The home puzzle now de-duplicates by route, covering Progress, Settings, Clock, Artwork and Privacy while preserving all 26 unique destinations.
- Run #136 passed install, TypeScript, all tests and build. The route sweep confirmed the duplicate was gone, then found one remaining stale test label: the approved card is named `Artwork gallery`, not `Artwork`. The assertion now uses the rendered accessible name; the app design is unchanged and another green rerun is required.
- Final code commit `7f2315ad54dc26fa844d2ffd3f6f7493f8900e00` passed GitHub run #138 in full: install, TypeScript, 84 files/832 tests, build, all approved home destinations, all 130 linked game routes, 11 browser journeys, 68 simulated search/game journeys, zero browser errors and zero live API requests. The responsive sweep found no horizontal overflow at its tested phone, foldable, tablet and landscape sizes.
- Candidate screenshots from run #138 were directly inspected at 390 × 844 and 820 × 1180. Home retained the joined 26-piece blue/gold space puzzle, moving-planet scene and blond Archie. Game selection, Number Pop with a wrong-answer hint, spelling lesson, unlocked parent area and unlocked teacher lessons remained readable without visible clipping; controls were large, colour use coherent and the phone layouts paged dense content rather than shrinking it. The tablet game list is intentionally denser than the phone view. This is visual QA of simulated states, not proof of real-child enjoyment or device accessibility.
- Live rendered review remains separate: the deployed test site is still `f254a44`, where the approved space home is present and the pre-change History page has clear large answers and a coherent six-piece scene but lacks this candidate's new pause/restart controls. No candidate deployment was made.

## Boundaries and next priority

These are simulated/tested interactions, not real-child testing or evidence of enjoyment or learning outcomes. Physical phone/tablet review, microphone/audio, screen-reader review on devices, live accounts, payments and cross-device progress remain unverified. Teacher-class reporting does not yet include these informal jigsaws; only the existing grown-up on-device progress view does. No production merge/deploy, paid service, credential change, real child data or 3D work occurred. Leonard/sodafom797 remains separate.

Next bounded priority: add teacher-visible reporting for completed History/Fraction jigsaws without duplicating the grown-up progress record, then capture the two new jigsaw states explicitly at phone and tablet widths.
