# Tablet spelling steps — 13 October 2026

## Repository state and scope

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from fresh repository and PR evidence: `test/archie-2026-10-02@a2d9e20c85c86f155d7a4699b75c4ce6dec36579` (`Keep parent progress totals accurate`), newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate: `improve/archie-learning-20261007`; open, mergeable draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), 0 commits behind the current target after reconciliation.
- Published reconciliation commit: `090ba7549a33c770900adc5064045e64464999b0`, with parents the prior documentation head and current target.
- Published application commit: `0fd228b8cef1a8f9770a4f515959416c1aa573b0` (`Use tablet lesson space for clear spelling steps`).
- The target brought its newer free parent-signup wording, hidden public owner access and accurate parent-progress totals into the candidate without conflict.
- No merge, deployment, 3D work, `sodafom797` change, credential change, paid service, live payment or real-child data use occurred.

The previous exact candidate artifact established the bounded issue rather than an older report: at 820×1180 the spelling lesson rendered a large blank whiteboard while its six actions occupied a narrow row. `app-screen.css` overrode the intended tablet lesson layout and hid the old decorative pseudo-element. The 390×844 lesson was already compact and clear, so this change is tablet-only.

## Changed behavior

- Uses the available tablet lesson width as a two-column composition: lined whiteboard and controls on the left; a contained Archie learning companion on the right.
- Reuses the established blond, emerald-eyed Archie artwork and blue/gold palette rather than adding a new character or third-party art.
- Gives three short, visible spelling steps — Hear it, Look closely, Try spelling — plus the calm reminder “Take your time. You can pause whenever you need.”
- Keeps the companion semantically labelled as a complementary region, uses an empty image alternative because the neighbouring heading supplies its meaning, and keeps all written lesson instructions and controls unchanged.
- Keeps the companion hidden below 700px so the successful phone flow remains uncluttered.
- Adds exact rendered assertions: hidden at 390px, visible at 820px, no board/companion overlap, inside-frame geometry and presence of the optional-break reminder.

## Verification

| Check | Result |
| --- | --- |
| Fresh target-focused units | PASS — 3 files / 7 tests (`Footer.owner-access`, `hub/progress`, `hub/signup.free-access`) |
| TypeScript | PASS locally |
| Production build | PASS locally — `vite build --mode archie-test`, 2,866 modules; existing chunk-size warning only |
| Browser script syntax | PASS — `node --check scripts/test-archie-search-journey.cjs` |
| Patch whitespace | PASS — `git diff --check` |
| Branch relationship | PASS — 0 behind / 277 ahead of current target before this documentation commit |
| Interest themes | [Run #148](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38395365254) PASS on exact application commit |
| Exact hosted application build | [Run #647](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38395365232) PASS on `0fd228b8`: 175 files / 1,220 tests, TypeScript, production build, 15 core journeys, all 130 game routes, zero browser errors/live API calls and 98 simulated phone/tablet journeys |
| Exact visual artifact | PASS — `archie-test-results` ID `11812288269`, 233 files, SHA-256 `e6ba87dc8fc97b79f74e982921762b6eb6b8ca8a4872290c372864666faacb0a`; downloaded, digest-checked and inspected |

The local runtime downloaded no browser executable because the Playwright CDN returned a truncated archive. This was not treated as a product failure or visual proof; the repository workflow installs Chromium and remains the required exact-head browser evidence.

## Direct rendered review

The current deployment at <https://archie-learning-test-production.up.railway.app/> was opened directly on 13 October 2026. It is the current test target, not this candidate.

- Home: the blue/gold identity, pale illustrated picture puzzle and blond, green-eyed Archie remain coherent; controls and picture pieces are clear at the available tablet/desktop viewport.
- Games: Year 4 showed 123 eligible activities with visible year, search and subject controls. The catalogue is information-dense, but the first activities have clear written instructions and large Play targets.
- Complete game: a simulated Year 4 Number Pop run covered one wrong answer, automatic hint disclosure, corrected retry, nine later first-try answers, ten-question progression and the branded final reward scene. Feedback was specific and supportive; Pause adventure remained visible. This is not real-child testing or evidence of learning gains.
- Lessons: Year 4 Maths showed 36 weeks, 180 lessons, next-step progress and week/day choices. The spelling route retained its readable instructions and large controls; its current tablet whiteboard remained sparse, matching the issue addressed here.
- Parents: the written grown-up gate was self-contained and readable with large controls. No credentials or child data were entered.
- Teacher: the School preview, no-tracking/no-real-pupil-data explanation and grown-up boundary were readable and contained, with pager actions visible.

The exact candidate artifact was inspected separately from the live deployment:

- At 390×844, the companion remains hidden; the word, full instruction, all six large controls and the entire whiteboard remain readable with no horizontal clipping. The successful phone composition is unchanged.
- At 820×1180, the lined whiteboard and controls occupy the left column. Archie, all three numbered spelling steps and the optional-break reminder are fully contained in the right column without overlap or horizontal clipping. The character remains blond with clearly green eyes and the established blue/gold outfit.
- Year 4’s simulated seven-word completion is fully contained at both widths. The three-star result, saved-device explanation, rewards and next-game actions are readable; this is successful simulated play, not a demonstrated learning outcome.
- Exact Home, Games, Parent and Teacher captures were also inspected. Home remains colourful and dense but contained; Games exposes four readable tablet cards and distinct activity badges; Parents remains a long but clear phone pager; the 820px Teacher preview and its privacy boundary are clear with generous decorative space.

Selected new text pairs have calculated contrast ratios of 10.83:1 (step text on white), 7.85:1 (pause reminder on pale gold) and 9.59:1 (heading on pale blue). This is a narrow colour check, not a full WCAG conformance claim. The layout preserves large controls, keyboard-readable structure and reduced-motion behavior already covered by the cumulative candidate.

## Curriculum, comparison and inclusion basis

- The [DfE English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study), checked 13 October 2026, is statutory guidance for England. It contains year-specific spelling expectations and distinguishes statutory content from non-statutory examples. The three visible steps are an interface scaffold, not a claim that this single activity covers the statutory programme.
- [DoodleSpell](https://doodlelearning.com/english/spelling), checked 13 October 2026, describes little-and-often practice and varied strategies. The relevant benchmark is a short, understandable practice sequence; no proprietary text, characters, art or lessons were copied.
- [Reading Eggs](https://readingeggs.co.uk/programmes/reading-eggspress/spelling/), checked 13 October 2026, describes explicit spelling instruction, immediate feedback and varied activities. Archie’s persistent three-step reminder is an original clarity response, not a superiority or outcome claim.
- [Oak National Academy’s accessibility statement](https://www.thenational.academy/legal/accessibility-statement), checked 13 October 2026, identifies keyboard access, readable text, reflow and candid reporting of gaps as useful accessibility benchmarks.

Stripe Directory was consulted before external-provider lookup. Its local CLI was unavailable and the directory page was not retrievable through the research tool; no provider, organisation, payment service or paid plan was selected or provisioned.

## Remaining boundaries and next priority

Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified. The hosted route suite and labelled simulations do not amount to a full real learner walkthrough of every one of the 123 Year 4 catalogue entries or every age/game pairing.

Next: after exact artifact inspection, continue from the next concrete browser failure. The residual repeated game-card treatment and information density on the Games catalogue are the strongest current visual/usability candidates; avoid duplicating the now-addressed tablet lesson composition and earlier result-action work.
