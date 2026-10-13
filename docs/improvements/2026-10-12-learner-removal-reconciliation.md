# Parent Hub learner-removal reconciliation — 12 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current test target rechecked from GitHub: `test/archie-2026-10-02@48aadea151dd841b59dbaddfc39d9d159e01c2b3` (`Keep learner context correct after removal`). This is newer than both the saved handoff and reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `678c2c24-30a0-48ea-9d4c-f5851659d7c8` is `SUCCESS` on that exact target (completed 12 October 2026 at 00:26:38Z). One replica is running, no staged work or active warning/critical is present. An older failure remains in Railway's eight-hour history and is not reported as the current state.
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Exact reconciliation commit: `fdae14dc4663e768c2168f553fb25ebc57c8e040` (parents `bcd7a5d3f0e655e86f12a226eb769ef976535d6e` and `48aadea151dd841b59dbaddfc39d9d159e01c2b3`).
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81). It is mergeable again, remains draft, and is not merged or deployed.

This run did not guess the child-test branch or continue from the stale base. It fetched both named branches, inspected the target commit and Railway source commit, then combined the independently advanced Parent Hub learner-removal work with the existing Reading Speed candidate. The merge was conflict-free and the local/server tree IDs match (`bc030473252958515b33c43601cc6134755949b2`).

## Preserved behavior

The target change is intentionally preserved rather than rewritten:

- removing the active learner now selects the first remaining learner;
- removing a different learner keeps the current active learner;
- removing the last learner clears the active learner context;
- failed removal keeps the learner list and active context, shows a clear alert and leaves the 44 px remove action available for retry;
- successful removal refreshes the learner list and reports success.

These behaviors are covered in `src/pages/hub/index.add-child.test.tsx`. The reconciliation does not create, expose or upload child data, and it does not bypass the signed-in Parent Hub.

## Verification

| Check | Result |
| --- | --- |
| Parent Hub focused tests | PASS — 2 files / 8 tests |
| TypeScript `tsc --noEmit` | PASS |
| Full local unit suite | PASS — 169 files / 1,200 tests |
| Archie production build | PASS; existing Browserslist and large-chunk warnings remain |
| Server/local merge tree | PASS — exact tree `bc030473252958515b33c43601cc6134755949b2` |
| Hosted Archie test build | PASS — [run #584](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38190235268) |
| Hosted interest-theme check | PASS — [run #125](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38190235237) |
| Browser artifact | PASS — `archie-test-results`, ID `11721234791`, SHA-256 `44ba8be00fd58590adf53b8ff4d29924b83ae841503d37ea5483533b9c66a098` |

## Rendered review

The current Railway deployment was opened directly on 12 October 2026:

- **Home:** the blue/gold Sodafom identity, pale blue-to-yellow surround, clear activity tabs and large fixed puzzle destinations remain intact. No branding or Archie character asset changed in this reconciliation.
- **Game selection:** Year 4, search and subject controls are readable and the large game actions remain clear; the first cards still repeat the same placeholder artwork, so catalogue distinction remains a later visual-design opportunity.
- **One complete game:** the exact candidate workflow completed Reading Speed from instructions through wrong/correct retry, pause/resume, all ten questions, 90% first-attempt result, three-star reward and Home return. The live deployment was also opened directly at question 1 and still exposes its evidence clue before the first attempt; the candidate keeps that clue optional.
- **Lessons:** Year 4 Maths settled after its loading state with the year/subject controls, 36-week/180-lesson sequence, next-adventure card and pager fully readable.
- **Parent route:** the grown-up gate renders as a centred, unclipped card with readable instructions, a strongly outlined answer field and large Continue/Back actions at the browser viewport.
- **Teacher route:** the preview and grown-up gate remain readable, but the first desktop app screen ends before the gate actions and relies on the second pager screen. This is the existing bounded adult-page priority, not a regression claimed fixed here.
- **Authenticated Parent Hub boundary:** `/hub` correctly redirects an anonymous session to the sign-in page. The real learner-removal control therefore was not exercised with a live account or real child record. The deterministic component tests use simulated learners and mocked API responses instead.
- **Candidate phone/tablet:** the exact run #584 artifact was downloaded, hash-verified and directly inspected. At 390×844 and 820×1180 the Reading Speed first attempt keeps its clue hidden behind a large, centred action; Archie remains blond and green-eyed; text, question, answers, progress and the 90% result remain readable and unclipped. The signed-in mocked parent captures keep Mia and Leo's stars and tutor summaries separate, use large controls and legible green/amber/red status cards, and do not expose real child data. The long phone dashboard necessarily scrolls; no horizontal clipping was visible. Teacher summary screen 2 is fully fitted at both widths. Home retains the coherent puzzle artwork and large fixed destinations.

The hosted workflow passed its complete simulated Years 1–9 game/lesson matrix at 390×844 and 820×1180, including the ages 5–12 main path and optional older extensions. This reconciliation does not claim real-child testing, demonstrated enjoyment or improved learning outcomes.

## Curriculum, comparison and privacy grounding

- **Statutory curriculum context:** the [DfE English programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) distinguishes word reading and comprehension, and sets year-by-year/two-year-block expectations through primary education. This reconciliation changes learner identity management, not lesson content, so it makes no new curriculum-alignment claim.
- **Current product benchmark:** official [Khan Academy Kids](https://www.khanacademy.org/kids) material separates a child-facing app from teacher/school dashboards and reporting. That supports the design benchmark of keeping adult learner-management tools distinct from child play; no proprietary lesson, character, art or text was copied.
- **Privacy benchmark:** the ICO [Children's code standards](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/) make children's best interests, age-appropriate application and data minimisation explicit design considerations. Keeping the selected learner context consistent after deletion is an original defensive UI/data-integrity measure, not a claim of legal compliance.

Stripe Directory was attempted before the external product lookup as required; its local CLI was unavailable. No provider, organisation, payment service or paid plan was selected, contacted or provisioned.

## Boundaries and next priority

No production merge/deploy, credentials, live payments, real child data, 3D work or `sodafom797` code was touched. Leonard's active queue is not observable from this runtime; the fresh branch/PR/file overlap check was used instead. Physical phone/tablet touch, hardware screen readers, real-device microphone/audio and live account/payment readiness remain unverified.

Next: address one current reproducible adult-page visual defect without overlapping target work. The signed-in parent dashboard is legible but very long on phone; a bounded information-density/navigation review is now a stronger candidate than the already-fitted teacher summary pager.
