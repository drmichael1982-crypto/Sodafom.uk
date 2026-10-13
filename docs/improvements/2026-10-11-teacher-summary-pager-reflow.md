# Teacher summary pager reflow — 11 October 2026

## Repository and deployment evidence

- Improvement branch: `improve/archie-learning-20261007`
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81)
- Current target branch: `test/archie-2026-10-02@9199ad0e66103ea826e1c3a2e30fc8b07261c2de` (`Keep parent learners visible across API revisions`)
- Railway deployment: `adb7c982-6b81-4bd5-800c-e0d8a5832844`, `SUCCESS` on that exact target commit
- Candidate application head tested: `911d201efbc3c0152762643a8654fd48739d78d9`
- Known reference `be917c8e6cdb99156a63b38f8d12792babeb31c4` remains earlier in the children’s lineage; this run used the newer target above.
- No production merge or deployment was performed.

## Fresh defect evidence

The live test app at [archie-learning-test-production.up.railway.app](https://archie-learning-test-production.up.railway.app/) was opened directly after Railway reported the current deployment successful. The home page retained the blue/gold identity, pale illustrated world, large navigation and blond Archie artwork.

After completing the simulated adult gate on `/teacher`, the deployed target visibly clipped the Year 4 selector/lesson screen and then left the “Recent puzzle learning for this learner” screen almost entirely outside the app window. This was reproduced on the current deployment, not inferred from an older report.

## Bounded repair

The teacher-only `DevicePuzzleLearning` content now owns one app-screen-sized wrapper:

- `src/pages/tutor/TeacherModePage.tsx` adds `.tc-pager-screen` around the learner puzzle summary.
- `src/pages/archie/teacher-class.css` constrains that wrapper to one `--app-screen-width`, applies `max-width: 100%`, `min-width: 0`, border-box sizing and vertical overflow containment.
- `src/pages/tutor/TeacherModePage.test.tsx` protects the wrapper plus the existing accessible subject/year state.
- `scripts/test-archie-ui.cjs` unlocks the teacher view at every responsive viewport, selects the summary screen deterministically and checks that both its heading and panel stay inside the current app-screen window.

The repair changes no lesson objective, scoring, personal-data flow, Archie artwork or child-facing content.

## Target reconciliation

The target advanced during the run. Its parent-dashboard change was reconciled without replacing the candidate’s learner-scoped report work:

- the target response normalizer and envelope scenario were retained;
- the candidate’s explicit learner/year request props and test mock were retained;
- no teacher-file overlap was present.

Failed development runs are intentionally retained as evidence:

1. [#551](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38175196354) measured the live 1,104 px summary panel inside a 264 px phone window.
2. [#553](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38175685441) proved the product containment worked but exposed a browser-check targeting error.
3. [#555](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38176156556) exposed an over-broad pager helper.
4. [#557](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38176759993) exposed an invalid one-step pager assumption.
5. [#562](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38178689950) exposed an incorrect whole-file target reconciliation.
6. [#564](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38178816410) exposed the remaining parent test-harness replacement.

## Verification

Final exact-head [Archie test build #566](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38179058365) passed on GitHub’s synthetic merge of the candidate into the current target:

- 169 test files / 1,195 tests
- TypeScript
- production build
- all 130 game routes
- full phone/foldable/tablet/landscape/laptop/desktop responsive matrix
- 15 core browser journeys with zero browser errors and zero live API requests
- 98 simulated search/game journeys
- artifact `archie-test-results`, ID `11717515794`, SHA-256 `25f95b7c1c7f682a03a28348c3f7abe5963e10a28ffd67670f561cb2b0eca2eb`

[Download the exact test artifact](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38179058365/artifacts/11717515794).

Interest-theme run [#118](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38179058326) also passed.

## Rendered review

The exact final artifact was inspected at 390 × 844, 820 × 1180 and 1440 × 900:

- 390 px: the complete summary card, wrapped heading, explanation, large “Open Learner Progress” control, pager and footer all fit without horizontal clipping.
- 820 px: the card is fully contained and immediately legible; there is generous illustrated background space below.
- 1440 px: the same one-screen containment holds; the adult page remains readable but has substantial unused decorative space.

This is a simulated browser walkthrough, not real-child testing and not evidence of improved learning or enjoyment. Archie is not shown on the teacher summary itself; the live home check separately confirmed the established blond character and blue/gold/pale-world presentation.

## Curriculum, accessibility and product benchmarks

Statutory sources:

- [DfE English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study) identifies the statutory English programmes and attainment targets for key stages 1–4.
- [DfE mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) identifies the statutory mathematics programmes and attainment targets for key stages 1–4.

This run made a layout/accessibility repair only; it did not alter those objectives. Any Archie sequence or interaction remains a design implementation rather than a new statutory requirement.

Design benchmarks:

- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) requires content to remain available without two-dimensional scrolling at the equivalent narrow width.
- [W3C responsive layout technique C31](https://www.w3.org/WAI/WCAG22/Techniques/css/C31) supports responsive reflow using CSS media queries.
- [Oak National Academy curriculum plans](https://www.thenational.academy/teachers/curriculum) provide a current official-product benchmark for sequenced, year-filtered units and lessons.

The comparison informed measurable containment and navigation checks only. No proprietary lesson, character, artwork or text was copied, and no claim is made that one app is universally best.

Stripe Directory was checked before any provider lookup. No external provider, payment, subscription or service was selected or engaged.

## Unverified boundaries and next priority

Unverified: physical-device touch/layout, real microphone/audio, hardware screen readers, live account/email/payment readiness and real-child learning or enjoyment. Production, credentials, payments, deferred 3D work and the separate `sodafom797` app were untouched.

Next bounded priority: complete a Reading Speed phone/tablet walkthrough covering instructions, wrong answer, hint/retry, pause/resume, progression, completion/reward and return navigation, then repair the first concrete failure without duplicating already verified reading/spelling work.
