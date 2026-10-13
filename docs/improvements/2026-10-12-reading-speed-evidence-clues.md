# Reading Speed learner-controlled evidence clues — 12 October 2026

## Current handoff

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Current test target rechecked from GitHub: `test/archie-2026-10-02@e03f6875c65c8189d595b4da2e6c859a757e2fa6` (`Show Parent Hub learner loading failures`). This target is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `21b05b1d-8572-4f71-b4d5-cd7503e7ead8` is `SUCCESS` on that exact target (completed 11 October 2026 at 23:18:41Z).
- Dedicated improvement branch: `improve/archie-learning-20261007`.
- Reading Speed implementation commit: `44dacda1fe65756bb6150ac2c4b5ca5f8ea4c016`; reconciliation head: `63e287617d72cc92cc8d0422f3e876cc3c5fc2f2`; exact tested application head: `57371e3b9cbe156cd6efe0a80ea5299c7f809501`.
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81). It remains unmerged and undeployed.

The target moved twice during this run. First, `ffbb893` added legacy Parent Hub response compatibility; then `e03f687` added an explicit learner-loading error and retry. Both were merged into the improvement branch. The sole conflict remained in `src/pages/hub/index.tsx`; the resolution keeps the target's loading failure UI/test and the candidate's learner-scoped star/state behavior. Focused reconciliation tests and TypeScript pass.

## Fresh reproduction and bounded change

The deployed Reading Speed game was opened directly and completed through all ten questions. On every first attempt, the authored evidence clue was already printed underneath the passage question. This gave away the intended retrieval/inference prompt before the learner decided whether help was needed.

Reading Speed now:

- starts with the passage, question and answer choices but keeps the authored evidence clue hidden;
- provides a large `Show evidence clue` control with visible keyboard focus and `aria-pressed` state;
- lets the learner hide the clue again;
- automatically reveals the same clue after a wrong answer and keeps it visible for the corrected retry;
- retains the existing no-timer instruction, read-aloud control, first-attempt scoring, wrong-choice lockout, pause/resume state, ten-question progression and learning-focused reward;
- changes no other quiz by default: clue deferral is an opt-in `LevelledQuizEngine`/`QuizEngine` behavior enabled only by Reading Speed.

The CI browser journey is original and deterministic. At 390×844 and 820×1180 it checks initial instructions, optional clue reveal/hide, wrong answer, supportive retry clue, paused break, exact-question resume, disabled tried choice, ten-question completion, 90% first-attempt score, horizontal reflow, reward and Home return. It writes first-attempt, clue, paused and result captures for visual review. These are simulated learner scenarios, not real-child testing or evidence of enjoyment or learning outcomes.

## Verification

| Check | Result |
| --- | --- |
| Focused unit/reconciliation tests | PASS — 3 files / 14 tests |
| Full local unit suite | PASS — 169 files / 1,197 tests |
| TypeScript `tsc --noEmit` | PASS |
| Archie production build | PASS; existing Browserslist, mixed static/dynamic import and large-chunk warnings remain |
| Syntax and whitespace | PASS |
| Hosted Archie test build | PASS — [final exact-head run #579](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38185305769) |
| Hosted interest-theme check | PASS — [final exact-head run #123](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38185305752) |
| Browser artifact | PASS — `archie-test-results`, ID `11720230274`, SHA-256 `8bfd7abf138b3292515d73363d734a096037d773e565d8a7a2f25bec943822f0` |

The workspace's Playwright package was present but its Chromium download endpoint returned a zero-byte/truncated archive, so local after-captures could not be claimed. The hosted workflow installed Chromium independently and supplied the browser evidence for this commit.

The first green hosted run, [#577](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38184040398), exposed a useful review problem: its phone pause screenshot was taken during the pager's 150 ms return animation and therefore showed the card partway off-screen even though the existing native-scroll assertion passed. The journey was strengthened in `57371e3` to wait for the settled layout and measure both pause-card edges against the visible app-screen window. Final run #579 passed that geometry check at both widths, and its regenerated screenshots show the complete pause card. The transient capture was not hidden or misreported as a settled product failure.

## Rendered review

The current deployed target was directly inspected at `https://archie-learning-test-production.up.railway.app/`:

- **Home:** blue/gold identity, pale illustrated world, planet/garden art and blond, green-eyed Archie remain intact. The picture playground is attractive and clear, though visually dense.
- **Games:** year/subject/search controls are large and readable. The first visible catalogue cards reuse the same image, reducing visual distinction; no catalogue-art change was bundled into this fix.
- **Reading Speed:** the desktop layout is readable with large answer controls, no timer and a ten-piece progress picture. The current deployment visibly prints the evidence clue before the first attempt; this is the defect repaired by the candidate.
- **Complete game:** a ten-question live walkthrough reached the three-star 10/10 result and returned Home. The reward clearly separates score, stars, replay, Home and next-game actions.
- **Lessons:** Year 4 Maths shows year/subject selection, a 36-week/180-lesson sequence and a clear start/continue action.
- **Parent and teacher:** both adult gates were completed. The parent area clearly explains local/account/AI boundaries. The current deployed first parent screen makes its email/password inputs visually hard to distinguish on white, and the unlocked teacher screen visibly clips the left school-preview panel at desktop width. Those deployed issues are recorded for later work; this Reading Speed change does not claim to repair them.
- **Exact candidate at phone/tablet:** artifact `11720230274` was directly inspected at 390×844 and 820×1180. The first attempt keeps its clue hidden; the optional clue is centred below the passage; the settled pause panel, both Resume controls and text remain fully inside the app window; the 90% result is readable and unclipped. Phone practice intentionally uses two pager screens, while tablet shows the prompt and answers together. Both preserve the blue/gold world, pale puzzle artwork and blond, green-eyed Archie.

Physical phone/tablet touch, hardware screen readers and real-device microphone/audio remain unverified.

## Curriculum and product comparison

- **Statutory requirement:** the [DfE English programme](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) requires upper-key-stage-2 pupils to check meaning, ask questions, draw and justify inferences with evidence, summarise main ideas/key details, distinguish fact/opinion and retrieve information. Reading Speed's short retrieval, vocabulary, inference and evidence questions practise a subset; they are not a complete English curriculum or assessment.
- **Design proposal:** withholding the evidence clue until requested or needed is an app-scaffolding choice, not a statutory rule. It preserves an independent first attempt while keeping help immediate and optional.
- **Current product benchmark:** Reading Eggs' official school material describes scaffolded activities, levelled texts, comprehension quizzes, simple navigation, individualised levels and immediate quiz feedback. Archie now offers a concrete alternative interaction: learner-controlled pre-answer evidence plus persistent corrective evidence after a mistake. No lesson, character, art or proprietary text was copied, and no universal-best or outcome claim is made.

Stripe Directory was attempted before external provider/product lookup as required; no provider, organisation, payment service or paid plan was selected, contacted or provisioned.

## Boundaries and next priority

No production merge/deploy, credentials, live payments, real child data, 3D work or `sodafom797` code was touched. Leonard's active queue is not observable from this runtime; the repository/PR overlap check was used instead.

Next: after the hosted Reading Speed journey is green and its phone/tablet captures are reviewed, fix the first reproducible adult-page visual failure without overlapping target work — currently the deployed parent input affordance or teacher preview clipping — and add a settled geometry/contrast assertion.
