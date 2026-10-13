# Phone result primary actions — 13 October 2026

## Repository state and scope

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from repository and PR evidence: `test/archie-2026-10-02@a7538e37c7f5042ca1291d2bdc06af1b73c2a9d2`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; open, mergeable draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81).
- Application commits: `5a33668f162f82bfc7436e2282c8990fac934a10` (`Keep phone result actions in the first view`) and follow-up `90ad3df1199f61bf7bdf353775eb499790fa93f2` (`Fit phone result actions above the fold`).
- No merge, deployment, 3D work, `sodafom797` change, credential change, paid service, live payment or real-child data use occurred.

The previous exact hosted result capture established the bounded issue rather than relying on an older report: at 390×844 the score, learning feedback, certificate, level, replay and Home were clear, but Play Next was only partly visible before scrolling. Tablet was already clear. This run therefore leaves game logic, scoring, content and rewards unchanged and compacts only the shared result card below the `sm` breakpoint.

## Changed behavior

- Reduces phone-only outer/card padding and vertical gaps while retaining the headline, three-star display, exact score, accuracy text, supportive practice message, earned-star badge, certificate, level progress and all actions.
- Keeps certificate, replay and Home at a 44px minimum height; Play Next remains 48px on phones. Existing larger tablet/desktop sizing is preserved from `sm` upward.
- Adds a rendered browser geometry gate to every completed Number Pop and Number Planets simulation at both 390×844 and 820×1180. Replay, Home and Play Next/Choose Next must each be fully within the initial viewport before any result-screen scroll.
- Does not move sharing above the learning actions or hide content. Sharing remains below the primary practice/navigation actions and is reachable by ordinary vertical scrolling.

## Verification

| Check | Result |
| --- | --- |
| Focused units | PASS — 2 files / 24 tests (`GameShell.result`, `GameShell.age`) |
| TypeScript | PASS locally |
| Production build | PASS locally — `vite build --mode archie-test`, 2,866 modules |
| Browser script syntax | PASS — `node --check scripts/test-archie-search-journey.cjs` |
| Patch whitespace | PASS — `git diff --check` |
| First hosted application build | [Run #640](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38388489922) correctly FAILED the new geometry gate: Year 1 Number Pop Play Next was `top 829 / bottom 877` in an `844px` viewport. TypeScript, 174 files / 1,217 unit tests, build, 15 core journeys and 130 routes had passed before that failure. Artifact `11808585806`, SHA-256 `c617b01031117c16c58918e5351f65f3cfbbc4994534c193f634cf77524797af`. |
| Interest themes | [Run #146](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38390342194) PASS on exact application commit `90ad3df` — type-check, build and focused theme tests |
| Exact hosted application build | [Run #642](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38390342142) PASS on `90ad3df`: 175 files / 1,218 unit tests, production build, 15 core journeys, 130 game routes, zero browser errors, zero live API requests and 98 simulated search/game journeys |
| Exact visual artifact | `archie-test-results` ID `11811020703`, 233 files, SHA-256 `e57a91048836fec8ce86dfac914b70c31e98e95d70c1b58ab2d86b1982e8a8cd` |

The local runtime did not contain a Playwright browser executable, so it was not used as visual proof. The repository-hosted browser workflow installs Chromium and is the required final rendered evidence for the exact pushed commit.

The first hosted result was not treated as success. Its exact `33px` overflow prompted a second phone-only spacing pass: 12px card padding; 4px heading margin; 8px star margin; tighter score, earned-star, certificate and level-card spacing. Tablet/desktop `sm` values and all minimum action heights remain unchanged.

## Direct rendered review

The current test deployment at <https://archie-learning-test-production.up.railway.app/> was opened directly on 13 October 2026. It remains a separate, older deployed state, not this candidate.

- Home: blue/gold Sodafom branding, pale illustrated world, blond Archie with green eyes and the picture playground remain coherent and unclipped at the available desktop viewport.
- Games: the Year 4 selector, search, subjects and large Play controls are clear; repeated generic card artwork remains a separate visual-polish opportunity.
- Lesson: the Year 4 spelling instruction, visible study word and large Hear/Try/Rubber/Spoken/Pause/Next controls are clear, though the wide desktop whiteboard is visually sparse.
- Parents: the written grown-up check is clear, self-contained and uses large controls.
- Teacher: after loading, the School preview and grown-up boundary are readable and contained on screen 1 with Previous disabled and Next visible.

The exact candidate artifact was inspected directly after the hosted workflow finished:

- At 390×844, completed Number Pop retained headline, three stars, 90% score, `9 correct out of 10 questions`, supportive practice feedback, earned-star badge, certificate, level progress, 44px replay/Home controls and the entire 48px `Play Next: Number Pop!` control in the initial viewport. Sharing remains below that learning/navigation sequence.
- At 390×844, completed Number Planets retained the equivalent two-star, 88% / 7-of-8 feedback and all three primary actions; its shorter feedback stack also left sharing visible.
- At 820×1180, both result cards were centred, readable and unclipped, with sharing visible beneath the primary actions.
- The same artifact contains home, Games, spelling lesson, Parent Hub and Teacher preview captures at 390×844 and 820×1180. Controls and text remain contained with no horizontal clipping. The phone home remains colourful but busy; the tablet home has generous blank space below its puzzle board. The Year 9 Games capture clearly labels age 13 as an optional extension rather than part of the ages 5–12 main path. The lesson controls are large and clear but its tablet whiteboard remains visually sparse. Adult pages retain the grown-up/account boundaries and pager controls.

These are labelled simulated learner scenarios, not real-child testing and not evidence of learning outcomes or enjoyment.

## Curriculum, comparison and accessibility basis

This is a layout/reachability change, not a curriculum-content change.

- The [DfE mathematics programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study), checked 13 October 2026, is statutory guidance for England. It calls for varied, frequent practice, consolidation before progression when needed, and year-by-year content. Archie’s result ordering—score and feedback before the next-practice choice—is a design proposal supporting that direction, not a claim that a game completes the statutory programme.
- [Khan Academy Kids](https://www.khanacademy.org/kids), checked 13 October 2026, presents self-paced activities, personalised paths, teacher assignments/progress and a privacy position of no ads, no sale of personal information and minimal collection. It is an early-learning benchmark (ages 2–8), not a universal comparator for Archie’s whole 5–12 range.
- [Reading Eggs](https://readingeggs.co.uk/about/), checked 13 October 2026, describes scaffolded reading activities and progression from word meaning to reading for meaning. The benchmark used here is clear progression and visible next steps; no lessons, characters, artwork or wording were copied.
- [Oak National Academy’s accessibility statement](https://www.thenational.academy/legal/accessibility-statement), checked 13 October 2026, lists keyboard navigation, zoom/reflow, focus visibility and screen-reader use as explicit accessibility goals and candidly records remaining gaps. Archie’s measurable target here is narrow: the three primary result actions must be fully visible at 390×844 and at least 44px high.

Stripe Directory was consulted before any provider choice. Its local CLI was unavailable; no provider, organisation, subscription or payment service was selected or provisioned.

## Remaining boundaries and next priority

Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified. Full exhaustive walkthroughs of every game in every year remain ongoing; the exact hosted suite covers all routes and its labelled simulations, not demonstrated learning impact.

Next: prioritise the remaining sparse wide-screen lesson composition and continue differentiating the residual generic game-card artwork without changing established branding or age/curriculum policy.
