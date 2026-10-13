# Current-target reconciliation — 13 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current children’s test target from fetched repository and PR evidence: `test/archie-2026-10-02@0dbb8c3dd22c4d29a009bc0a03bff15a0f6f328a` (`Keep legacy Archie ages learner-scoped`). It is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4` and is now the merge base of this candidate.
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Initial reconciliation commit: `cbd6f2aa43ec5902178126b2e58d08434eabf6e0` (`Reconcile latest children test target`), with parents `969d84916e1f2a8bdc5d5fc0c226b14129c2e62d` and `ffac438052c2aa618e1526b37bff0ee92d22c26e`.
- Final application reconciliation: `de1551d5c8d45d6d51e1956a84fdd51e71069db3` (`Reconcile latest learner age target`), with parents documentation head `74d215b7f49df3816d55f0650ff5c8b3bf855016` and current target `0dbb8c3dd22c4d29a009bc0a03bff15a0f6f328a`.
- Browser-journey reliability commit: `3ecf7ab2680ce973b87826e7c341e0df8c198321` (`Stabilise Word Scramble journey readiness`).
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), kept draft, open and unmerged. The branch is 258 commits ahead and 0 behind the current target.
- The current Railway test deployment reports success on target `0dbb8c3dd22c4d29a009bc0a03bff15a0f6f328a`. No deployment was started in this run.

The repository also contains a separate `feature/walkable-island-prototype-20261013` 3D branch. It and the separate `sodafom797` work were not changed. No overlapping open 2D PR was found. Leonard’s private queue is not exposed in this runtime, so the fresh branch, PR and changed-file checks are the available coordination evidence.

## Bounded change

The cumulative improvement branch had moved 254 commits ahead but two commits behind the current children’s test target. This run reconciled the target rather than adding a competing feature.

- Retained the target’s corrected learner switcher behavior and its focused tests.
- Retained the target’s save-progress-before-badge-check ordering, including the signed-in completion path.
- Retained target assertions that reward and account actions meet the 44 px minimum touch target.
- Reconciled the later target’s learner-scoped legacy age fallback. The candidate first uses its canonical exact-age and scoped learner-setting readers, then preserves the target’s no-global-fallthrough fallback for older learner records.
- Stabilised the exhaustive Word Scramble browser journey after exact CI exposed a render-boundary race: the progress label could update one render before the next word’s tiles. The check now waits for a visible letter tile before reading the round, without changing game behavior.
- Retained the candidate’s original per-activity game-card cues, previous teacher summary reflow and earlier game, lesson and grown-up improvements.
- Resolved the single textual conflict in `GameShell.result.test.tsx` by keeping the target’s newer signed-in reward and daily-challenge coverage.

The initial merge directly reconciled five files: `ChildSwitcher.tsx` and its test, plus `GameShell.tsx`, its age test and its result test. The final target reconciliation touched `ArchieHelper.tsx` and its privacy test. It does not change curriculum content, 3D, payments, accounts, deployment configuration or branding.

## Verification

| Check | Result |
| --- | --- |
| Local TypeScript `tsc --noEmit` | PASS |
| Local production build | PASS; existing Browserslist, mixed import and large-chunk warnings remain |
| Local full unit suite with default concurrency | Environment-sensitive: 1,206/1,209 tests passed; three files hit their five-second timeout while type/build work was running concurrently. The affected files passed when rerun alone or in a smaller group; this is recorded rather than presented as an application regression. |
| Initial local exact CI unit command | PASS — 170 files / 1,209 tests using two workers and a 20-second timeout |
| Latest learner-age focused test | PASS — 1 file / 19 tests on the final merged tree |
| Final merged-tree TypeScript | PASS |
| Final merged-tree production build | PASS; existing warnings remain |
| Final merged-tree exact CI unit command | PASS — 170 files / 1,210 tests using two workers and a 20-second timeout |
| Hosted interest-theme check | PASS — run #133 on exact final application commit |
| Hosted type, unit and build steps | PASS — [Archie run #602](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38354625626) on exact reconciliation commit; the unit step uses two workers and a 20-second timeout |
| Hosted route/button check | PASS — exact reconciliation commit |
| Hosted Years 1–9 game/lesson and parent/learner matrix | PASS — exact reconciliation commit |
| Exact browser artifact | PASS — ID `11792424782`, SHA-256 `68e24c4f9564407cf6c82287d092e1897817ffa5359319ea9e36a5c19ea45a63` |
| Current target CI | FAIL — run #603’s route/button step timed out because its browser script expected the older one-age Year 4 count while the rendered page correctly showed 123 games; type, 1,209 tests and build passed. Candidate commit `357b1b1` already uses both possible ages for a school year. |
| Exact final application workflow | PASS — [push run #605](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38357057729) on `de1551d5`: TypeScript, 1,210 tests, build, route/button checks and the complete simulated matrix all passed. This confirms the retained school-year eligibility repair. |
| Exact final application artifact | PASS — ID `11793718542`, SHA-256 `ae75794f5b3179b5454b8036d1aa5a4d0d34c80e8e101519738e79a553f0db14`; downloaded, hash-verified and visually inspected. |
| Pre-fix exact final candidate workflow | FAIL — [run #606](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38357062952) passed TypeScript, 1,210 unit tests, build and route/button checks, then sampled Word Scramble during its brief between-round empty-tile render. Failure artifact ID `11793807788`, SHA-256 `a49e901feccecea342b1263b3f7c0bd50398c689172d4886953285ba73bd523f`. |
| Browser-race fix syntax/diff validation | PASS — `node --check scripts/test-archie-search-journey.cjs`; `git diff --check` |
| Post-fix exact candidate workflow | Pending at note update. A local browser rerun could not start because this fresh runtime lacks a Playwright Chromium executable; hosted CI remains the required post-fix check. |

All learner scenarios are simulated. They are not real-child tests and do not demonstrate learning gains or enjoyment.

## Direct rendered review

- **Current live home:** the deployed target preserves blue/gold SODAFOM branding, the pale yellow-to-blue illustrated background, large controls and blond, emerald-eyed Archie.
- **Current live game selection:** Year 4 offered 123 eligible activities with visible year and subject controls. Adventure Trail, Star Trail and Number Pop still repeated the same orb artwork because the distinct cue change is not deployed.
- **Complete current live game:** Number Pop was completed from question 1 through question 10 with simulated correct responses. Every answer produced explanatory feedback; first-try progress reached 10, Finish opened the branded rocket completion scene, and the settled result showed 100%, 10/10 and three stars without clipping.
- **Current live lessons:** Year 4 Maths exposed 36 weeks and 180 lessons, a school-year selector, subject controls, week/day progression and the next activity. The first screenshot briefly caught the loading state, so no load-speed claim is made.
- **Current live parent page:** the visible grown-up gate worked. Parent sign-in, optional AI, learning settings and the learner-scoped local record were separated clearly. No credentials or child data were entered.
- **Current live teacher page:** the current `0dbb8c3` deployment was reloaded and opened through the visible gate. It still has settled desktop clipping: left preview copy and right lesson titles are cut off. This is a current deployment observation, not attributed to the reconciled candidate.
- **Candidate game selection after final reconciliation:** the hash-verified exact final application artifact from run #605 was downloaded and its 390×844 and 820×1180 captures were inspected directly. Written titles remain primary; the first activities have distinct map, star, balloon and race cues. Two complete cards remain visible on the phone and four on the tablet, with readable controls and no horizontal clipping.
- **Candidate teacher page after final reconciliation:** direct inspection of the same exact artifact’s 390, 820 and 1,440 px captures confirms the earlier candidate repair survived both target merges. The preview text, puzzle-learning card, action and pager remain fully inside the viewport. The 820 px page has generous vertical space, but no clipped copy or controls. This is visual/layout evidence, not a learning-outcome claim.

## Current comparison, inclusion and curriculum boundary

- Khan Academy Kids’ official page describes an age 2–8 experience with a curated library of activities, books, videos and games. Distinct content types and independent navigation remain useful visual benchmarks; no character, artwork, wording or proprietary lesson was copied.
- The Education Endowment Foundation’s inclusive-teaching guidance recommends clear and unambiguous language, visual/verbal/written scaffolding, specific supportive feedback and guided-to-independent practice. Archie’s written labels plus decorative activity cues and immediate explanatory game feedback are design responses, not evidence of improved outcomes.
- The DfE mathematics programme remains the statutory England source: key stages 1 and 2 are specified year by year and schools must cover the relevant programme by the end of each key stage. No statutory objective changed in this reconciliation.

Sources:

- [Khan Academy Kids official product page](https://learn.khanacademy.org/khan-academy-kids/)
- [EEF universal approaches for inclusive teaching](https://educationendowmentfoundation.org.uk/education-evidence/inclusive-teaching/universal-approaches)
- [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study)

Stripe Directory was attempted before current external-product lookup; its CLI is unavailable in this runtime. No provider, organisation, payment service or paid plan was selected, contacted or provisioned.

## Boundaries and next priority

No target/production merge, Railway deployment, credentials, paid service, live payment, real child data, 3D work or Systems 797 code was changed. Physical-device touch/layout, hardware screen readers, real-device microphone/audio, live account/email/payment readiness and real-child outcomes remain unverified.

Next priority: first confirm hosted CI on the Word Scramble readiness fix. The teacher clipping is already repaired in the exact application artifact, so do not duplicate it. After CI is green, recheck the current deployment and start from the next concrete browser failure, with the live lessons loading transition and its perceived responsiveness the first bounded candidate to investigate.
