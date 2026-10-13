# Voice fallback focus — 10 October 2026

## State rechecked before work

- Continued draft PR #81 on `improve/archie-learning-20261007`; no production branch was merged or deployed.
- Repository evidence showed the children’s test branch had advanced again to `faf0d7d4634b45e95c061278d4491248ad7b9783` (`Make footer age links select matching games`). The improvement branch was one commit behind, so the target’s age-link behaviour was reconciled with the existing learning-year scope and game-search work before this fix. The published reconciliation/code commit is `5253a0177cf775b4c551cf3ed410c5e2265b46ce`.
- Railway project `noble-emotion`, service `archie-learning-test`, is healthy on deployment `a09166b9-3f6e-4cde-b6e2-f1aef3dd587a`, target branch `test/archie-2026-10-02`, commit `faf0d7d`, created 10 October 2026 at 00:11:37 UTC. The public test URL remains `https://archie-learning-test-production.up.railway.app/`. The separate `sodafom797` service remained successful on its own older commit and was not changed.
- Current CI was checked before implementation. No failure was inferred from an older report; the hosted failures and final successful run below are from this candidate.

## Reproduced defect and bounded fix

When a spoken lesson reached an unsupported browser, denied microphone, missing microphone, failed recognition service or microphone-start exception, Archie displayed a typed alternative but left keyboard and screen-reader focus away from the usable text field. A learner could hear or see that typing was possible without being taken to the control they needed.

The implementation now:

- stops the failed voice session safely and transfers focus to `Your question for Archie`;
- distinguishes permission-off, no-microphone, unsupported-browser and other recognition failures with short recovery guidance;
- applies the same focus handoff to the one-shot microphone button’s unsupported, error and busy paths;
- keeps `no-speech` recoverable instead of ending the conversation immediately;
- adds exact message and focus assertions for `not-allowed`, `service-not-allowed`, `audio-capture`, network failure and unsupported recognition;
- explicitly simulates an unsupported browser in the hosted spoken-spelling journey, checks the status text and focused input, and captures the state at 390 × 844 and 820 × 1180.

No lesson content, scoring, artwork, child record, online-help default or voice privacy setting was changed.

## Accessibility, curriculum and product comparison boundary

- MDN documents that `SpeechRecognition` has limited browser availability and exposes an `error` event. The typed recovery route therefore remains necessary even when a browser exposes voice features. The new messages and focus transfer are Sodafom accessibility design choices, not claims that microphone recognition is universally available.
- Khan Academy Kids’ current official reading page describes read-to-me narration with word highlighting for ages 2–8. It was used only as a benchmark for keeping a visible, usable alternative beside audio support; no character, artwork, lesson, wording or proprietary interaction was copied.
- England’s statutory English programme identifies spoken language, listening, word reading, comprehension and spelling/transcription as connected areas. This change improves access to an existing spoken spelling path; it does not add a new statutory objective or claim that voice input demonstrates learning outcomes.
- The Stripe Directory workflow was checked before the fresh provider comparison. No provider was selected, subscribed to, provisioned, integrated or paid.

Sources reviewed:

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/error_event
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- https://www.khanacademy.org/kids/ela
- https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study

## Verification

- Published branch: `improve/archie-learning-20261007`.
- Reconciled product commit: `5253a0177cf775b4c551cf3ed410c5e2265b46ce`.
- Hosted-test corrections: `b054e21c4d220112def03b1f60b8e0080b21bb7f` and final tested head `5bb734e0ff0846ccdf07c468589d4403431e02ae`.
- Focused local suite: PASS, 2 files / 57 tests; final voice-only rerun: PASS, 1 file / 39 tests.
- Local full suite after reconciliation: PASS, 111 files / 953 tests.
- `npm run type-check`: PASS.
- `npm run build:archie`: PASS with the existing mixed-import and large-chunk warnings.
- Focused ESLint: 0 errors and 5 inherited hook-dependency warnings in `ArchieHelper.tsx`.
- Local Chromium execution was not claimed because the system browser was absent; hosted Chromium supplied the browser authority.
- GitHub Actions run #286 correctly failed at the new status assertion. Run #288 confirmed that current headless Chromium exposes speech recognition, so the nominal unsupported-browser scenario was not deterministic. The test was corrected to disable both recognition globals only inside that explicit simulation.
- [GitHub Actions run #290](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38012886772): PASS — TypeScript; 111 files / 953 tests; production build; all 130 linked game routes; 12 core browser journeys; seven jigsaw viewports; 82 simulated search/game journeys; no horizontal overflow; zero browser errors; zero live API requests.
- Artifact `11655586879`: 77,857,701 bytes, SHA-256 `3c11dca2abbc56fbdf8059f8909370cf69e047f8069b14ae507f6a223814ad90`.

## Rendered evidence reviewed

- Directly opened the current deployed home, Games catalogue, lesson selection, parent gate, teacher preview and an age-mismatched game route. The deployment is the current target, not this candidate. Its established blue/gold identity, pale illustrated background, large controls, whole-page 2D jigsaw and blond, green-eyed Archie artwork remain intact. The Year 8 guard correctly redirected an unavailable Maths Bingo route to a year-appropriate choice.
- Reviewed hosted `spoken-lesson-typed-fallback-390.png` and `spoken-lesson-typed-fallback-820.png`. The fallback message is readable, the gold focus ring is clearly visible around the typed input, microphone and send controls remain large, and neither dialog clips or overflows. The phone dialog uses the available width without hiding the lesson actions behind it; the tablet dialog remains centred with comfortable spacing.
- Reviewed hosted phone/tablet captures for home, Games, completed spelling lessons, unlocked parent/teacher pages and a completed Maths Bingo run. The broader navigation, feedback and reward screens remain coherent and unclipped. These are labelled simulations, not real-child testing or evidence of enjoyment or educational outcomes.
- The complete browser matrix also exercised instructions, wrong/correct answers, hints, retries, pause/resume, progression, completion and rewards across the supported main-path year scenarios at 390px and 820px.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, live payment, real child data or 3D work was used. Leonard’s `sodafom797` queue remained separate. Physical phone/tablet touch, real keyboard/screen-reader, real microphone/audio capture, speech-synthesis playback, live-account/payment and real-child checks remain unverified.

Next bounded priority: inspect read-aloud and speech-synthesis unavailable/error recovery at phone/tablet widths, then fix only a newly reproduced defect.
