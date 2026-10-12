# Learning year scope — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote head before this change was `f6988456a7b4779585a32750c00b01f62a9fedbe` and GitHub run #176 was successful.
- Rechecked the PR, saved run notes, current CI, repository year selectors and the Railway test service before editing. Leonard/sodafom797 remains separate.
- Railway reported the live test service healthy on `test/archie-2026-10-02` commit `c173a2565d96e66c781383b38445d85fa491795b`, deployed 8 October 2026 at 05:48:26 UTC. Direct live review confirmed the established blue/gold space home and blond Archie remained intact; the live Games page rendered its Year 1 selector, search/subject controls, 54 Year 1 games, cards and pagination without obvious clipping at the available browser size.
- The candidate branch was not merged or deployed.

## Reproduced scope mismatch and bounded change

1. The agreed product scope and automation brief say ages 5–12, while the public learner selectors presented Years 1–9 as one undifferentiated list. Years 8–9 can extend beyond the main age range, but hiding or removing them would break saved learner choices and existing content.
2. All nine existing year choices remain available. Years 1–7 are now grouped as `Main pathway · ages 5–12`; Years 8–9 are grouped as `Optional older extensions`.
3. The explanatory note says: `Archie's main pathway is ages 5–12. Year 8 can include age 12; choose Years 8–9 with a grown-up for optional older content.` This avoids incorrectly excluding all Year 8 learners while making the core product promise clear.
4. Year 8 and Year 9 option labels now include `optional extension`. The shared component is used by Games, Courses, Quests, grown-up settings and the device preview, so the scope is not stated differently on separate pages.
5. No game, lesson, learner setting or saved year was deleted or silently remapped. Existing branding, Archie artwork, reward behavior, accessibility controls and phone/tablet layouts are unchanged.

## Curriculum and design basis

- GOV.UK identifies Key Stage 3 as a statutory national-curriculum stage with its own subject programmes: <https://www.gov.uk/national-curriculum/key-stage-3-and-4>. The statutory English programme is published separately: <https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study>.
- The app's `main pathway` and `optional older extensions` grouping is an original product-scope and navigation decision, not a statutory curriculum requirement or a claim about educational outcomes.

## Verification and rendered review

- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 85 files / 834 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- `node --check scripts/test-archie-ui.cjs`: PASS.
- `git diff --check`: PASS.
- New component tests require all nine options, both group labels, the ages 5–12 scope note and optional-extension labels for Years 8–9.
- GitHub run #182 for code head `99f183de25dbd84858bde53f2077dc6b4dd57cbc`: PASS. TypeScript, 834 tests, production build, all 130 linked game routes, 12 core browser journeys, all 68 simulated year-group search/game/lesson journeys and artifact upload passed.
- The browser suite explicitly requires nine year options, both group labels and the exact scope note at 390 × 844 and 820 × 1180. These are simulated scenarios, not real-child tests.
- GitHub produced the `archie-test-results` artifact (ID `11532610224`, SHA-256 `eaeb6f8b80b8eafc3eac6413fbfe8cb65f0f1dd1c3256f96c0fd654ec2dbb8c1`). Manual download of the 40 MB bundle returned a transient gateway error in this runtime, so the new candidate screenshots were not directly reviewed here. Do not treat passing DOM/browser checks as a substitute for that visual review.

## Boundaries and next priority

No merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical phone/tablet, microphone/audio, device keyboard/screen reader, live accounts/payments and real-child testing remain unverified.

Next bounded priority: directly inspect the run #182 phone/tablet screenshots when artifact access succeeds, then reproduce the live Number Planets phone journey introduced on `c173a256` and fix only a confirmed visual or interaction defect.
