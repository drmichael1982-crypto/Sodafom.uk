# Child progress race reconciliation — 11 October 2026

## Repository and deployment evidence

- The children’s target was resolved from the remote branch, draft pull request and Railway service rather than guessed. At the start of this run, `test/archie-2026-10-02` was `19eab31d0df9b28e19d3c820b563391b923d0877` (`Fix child progress learner-switch races`), newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway project `noble-emotion`, service `archie-learning-test`, reported deployment `b9e48c6c-a489-4de8-88f3-b9b8b4cdc0fa` as `SUCCESS` on that exact target. It was created at 2026-10-11T17:57:16Z and updated at 17:58:48Z. No Railway setting, variable, deployment or credential was changed.
- Continued branch `improve/archie-learning-20261007` and draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81). The published reconciliation is two-parent merge `d1c921b307d57b5599efb8f563f771a45f6a2325`, combining prior candidate `42ba788cec5c1ec2d07e6d5a2e30d725a9fc4530` with target `19eab31d0df9b28e19d3c820b563391b923d0877`. GitHub reports the PR open, draft, unmerged and mergeable. Nothing was merged to the test target or deployed.
- The last completed target workflow before editing was run [#530](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38154640523). TypeScript, all unit tests, the production build and Chromium installation passed. Its exact failure was the route checker timing out in `waitForGameCount` while comparing year/game overlap. That route-count failure was already repaired in the cumulative improvement branch and was preserved here; it was not attributed to an older report alone.

## Reconciliation and changed behaviour

The target and candidate both changed the parent tutor report. The conflict was resolved deliberately instead of choosing either whole file:

- retained the candidate’s defensive learner-scoped local tutor-memory reader, malformed-record validation, explicit `child` prop and saved `schoolYear` handling;
- integrated the target’s abortable child-progress and badge requests, response normalisation and HTTP failure handling, so an older request cannot overwrite a newly selected learner;
- integrated the target’s responsive recent-session rows and 44 px back/filter controls;
- preserved the candidate’s two-child parent report isolation and changed the tutor card from `p-6` to `p-4 sm:p-6` so its existing phone layout keeps more usable width;
- added the existing signed-in two-child parent-report browser journey and its phone/tablet captures to the authoritative hosted workflow, closing a coverage gap exposed by this reconciliation;
- removed an unused age variable and a stale duplicate test assertion created by the mechanical merge.

The target’s new deterministic race test switches from a slow first learner to a fast second learner and requires only the second learner’s progress and badges to remain visible. This is simulated synthetic data, not real child data.

## Verification and rendered review

- Focused reconciliation tests: PASS — 6 files / 19 tests, covering tutor reports, tutor-memory scope, parent dashboard, child-progress request races, the shared pager and quiz scoring.
- Local TypeScript: PASS.
- Full local suite: PASS — 169 files / 1,190 tests.
- Archie production build: PASS. Existing large-chunk, mixed dynamic/static import and six-month-old Browserslist-data messages remain warnings.
- First combined-head workflow: run [#532](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38162812177) began on the reconciliation merge. Review showed its workflow did not invoke the existing signed-in parent tutor browser journey, so its eventual result is not treated as final evidence for this change.
- Final hosted workflow [#534](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38163018792) on exact gate-repair head `a79adaa75aa94cbb45c28ef159a60b5c52402f43`: PASS. TypeScript, the full unit suite, production build, Chromium installation, 130 game-route checks, 15 core journeys, responsive-layout checks, 98 simulated game/lesson journeys and the newly gated parent tutor isolation journey all passed. Interest-theme run [#105](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38163018764) also passed.
- Hosted artifact `archie-test-results` (ID `11711212999`, 99,211,689 bytes, SHA-256 `00e946d1f2ff156a14800a9dad6c06415ef75fd6154cb7da1681b740611155aa`) was downloaded and inspected. Its phone and tablet captures show separate Mia / Year 2 / addition and Leo / Year 7 / forces report cards with no learner cross-contamination. The 820 px tablet layout is comfortably scannable. The 390 px phone layout is contained with no horizontal clipping but is long, and the fixed Ask Archie launcher overlaps part of the first `Child Tutor Progress Report` heading; that is a concrete remaining visual defect.

The current deployed target was inspected directly in a desktop browser, separately from source checks. Home retained the established blue/gold 2D identity, pale yellow-to-blue illustrated world and blond, emerald-eyed Archie. Games showed the Year 4 selector and 123 eligible cards. A complete Number Pop simulation deliberately answered one question incorrectly, requested the number-line hint, corrected the same question and completed all ten; the settled result accurately showed 90%, 9/10 and three stars. A stale cached chunk briefly opened the built-in recovery screen after the deployment changed; one `Reload app` action loaded the game and the route then completed, so this was not recorded as a persistent broken route.

Lessons rendered a clear Year 4 Maths path with a school-year selector, subject controls, progress, weekly sequence and 30-minute lesson labels. The parent gate kept its adult instruction and large controls; the teacher preview kept its local/no-pupil-data explanation and adult gate. Controls were clear and layouts were contained at the available desktop viewport. Candidate phone/tablet report captures were inspected separately from the deployed desktop pages and are described above; desktop evidence is not presented as a substitute.

## Curriculum and comparison grounding

- Statutory source: [Department for Education mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study). It distinguishes statutory programmes/attainment targets from non-statutory example content. This reconciliation changes request ownership and layout only; it changes no curriculum objective.
- Current official benchmark: [Reading Eggs UK pricing/features](https://readingeggs.co.uk/pricing/) describes separate access for up to four children, ability-matched lessons, rewards, instant progress reports and desktop/tablet access. The relevant original Archie benchmark is that every report stays bound to one explicit learner during fast switching; no report wording, proprietary lesson, character or artwork was copied.
- [Khan Academy Kids](https://www.khanacademykids.org/) currently advertises class rosters, assignments and student-progress views. It was used only as another product benchmark for unambiguous learner identity, not as proof of better outcomes or a universal-best comparison.
- Stripe Directory was consulted before provider/product research as required. No provider was selected, contacted, paid or provisioned.

## Boundaries and next priority

Production, the test deployment, payments, credentials, deferred 3D work and the separate `sodafom797` project were not changed. Leonard’s external queue is not visible in this runtime, so no active-worker coordination claim is made. Physical-device touch/layout, real microphone and audible speech, hardware screen readers, live accounts/email/payments and outcomes or enjoyment with real children remain unverified.

Next: prevent the fixed Ask Archie launcher from obscuring the first parent report heading at 390 px, verify the correction at phone/tablet widths, then run Reading Speed through instructions, wrong answer, hint/retry, pause/resume, progression, completion/reward and return navigation before changing its product code.
