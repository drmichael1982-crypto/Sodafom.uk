# Read-aloud recovery — 10 October 2026

## State rechecked before work

- Continued draft PR #81 on `improve/archie-learning-20261007`, targeting the children’s test branch `test/archie-2026-10-02`. It began this run at `faf0d7d4634b45e95c061278d4491248ad7b9783` and advanced independently during validation to `c2ba672e3bec514c80229b42c73ab1c322cab8fd` (`Protect legacy owner routes and repair game stars`). The final hosted run tested GitHub’s merge candidate containing both current target and improvement; no concurrent target work was overwritten. The known design reference `be917c8e6cdb99156a63b38f8d12792babeb31c4` remains in the lineage.
- The authoritative improvement head before this run was `1a8c3edb361ff844013e272d9074fb9d9ff07762`. A separate unpublished local history was not overwritten; work was based on that remote head. The recovery shipped as `c729248f399766eef8d86f3fa14294e7f7568cdb`; independent tablet verification followed in `4a07a45ecb4eab1ec6e811096367eb656f242a0b`.
- Current CI was green before implementation: Archie test build run #290 passed at tested product head `5bb734e0ff0846ccdf07c468589d4403431e02ae`. No current failure was inferred from an older report.
- Railway project `noble-emotion`, service `archie-learning-test`, remained successful on deployment `a09166b9-3f6e-4cde-b6e2-f1aef3dd587a`, target branch `test/archie-2026-10-02`, commit `faf0d7d`, created 10 October 2026 at 00:11:37 UTC. No deployment was started. The separate `sodafom797` service had been updated independently and was not touched by this run.

## Reproduced defect and bounded fix

The shared read-aloud path silently returned to idle when browser speech synthesis was absent, `SpeechSynthesisUtterance` could not be created, `speechSynthesis.speak()` threw, or the utterance emitted an error. Printed content remained available, but the learner received no explanation or recovery step.

The implementation now:

- distinguishes unavailable speech synthesis from a failed read-aloud attempt;
- shows a concise, high-contrast on-screen status that keeps printed content as the fallback and suggests adult help only for device sound settings;
- provides a 44px `Got it` control without stealing focus from the learner’s initiating button;
- clears stale notices on a new attempt and ignores errors emitted after Stop;
- keeps existing recorded-voice and browser-speech behaviour unchanged when playback succeeds;
- adds unit coverage for absent speech synthesis, thrown playback, utterance errors, dismissal and stale-error suppression;
- adds a deterministic hosted browser scenario at 390 × 844 and 820 × 1180 that disables `SpeechSynthesisUtterance` only inside that simulation, verifies the exact message, retained focus, visible story and no tablet overflow, and captures both states.

No lesson content, scoring, artwork, child record, microphone setting, online-help default or 3D work changed.

## Accessibility, curriculum and comparison boundary

- MDN documents the `SpeechSynthesisUtterance` error event for cases in which speech is prevented from completing successfully. Keeping a visible fallback is therefore necessary even when the browser exposes speech synthesis.
- Khan Academy Kids’ official English-language arts page describes read-to-me audio with word highlighting. It was used only as a benchmark for pairing audio support with visible reading; no character, artwork, lesson, wording or proprietary interaction was copied.
- England’s statutory English programme connects spoken language, listening, reading and transcription. This change improves access to existing reading support; it does not introduce a new statutory learning objective or demonstrate a learning outcome.
- Stripe Directory was checked before the fresh provider/product comparison. No provider was selected, subscribed to, provisioned, integrated or paid.

Sources reviewed:

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/error_event
- https://www.khanacademy.org/kids/ela
- https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study

## Verification

- Published branch: `improve/archie-learning-20261007`.
- Recovery commit: `c729248f399766eef8d86f3fa14294e7f7568cdb`.
- Final tested head: `4a07a45ecb4eab1ec6e811096367eb656f242a0b`.
- Focused voice suite: PASS, 2 files / 51 tests.
- Local full suite: PASS, 111 files / 954 tests.
- `npm run type-check`: PASS.
- `npm run build:archie`: PASS with existing mixed-import and large-chunk warnings.
- Focused ESLint for changed TypeScript/test/browser files: PASS, zero errors or warnings.
- [GitHub Actions run #297](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38016391058): PASS — TypeScript; 112 files / 961 tests on the current PR merge candidate; production build; all 130 linked game routes; 13 core browser journeys; seven jigsaw viewports; 82 simulated search/game journeys; no horizontal document overflow; zero browser errors; zero live API requests.
- Artifact `11655898604`: 78,961,406 bytes, SHA-256 `90196b6a7cbe874609207240141baa11796b8989e8eb1d4303c2181ae6929af5`.

## Rendered evidence reviewed

- Directly opened the current deployed home, Games catalogue, lesson selection, parent gate and teacher preview, and completed a Year 4 Maths Bingo simulation. The live baseline preserves the blue/gold identity, pale illustrated background, large controls, whole-page 2D jigsaw and blond, green-eyed Archie. The completed Bingo state was readable and unclipped. Parent and teacher routes retained their grown-up gate and local/no-pupil-data explanation.
- The deployment is the current target baseline, not this candidate. Hosted `reader-speech-fallback-390.png` shows the story, large Read aloud/Next controls and complete recovery notice together without clipping; the notice wraps clearly and the 44px dismissal remains reachable.
- Direct review of `reader-speech-fallback-820.png` confirmed the story and recovery text remain readable and the fixed notice stays within the viewport. It also exposed a separate pre-existing pager alignment defect: a strip of the preceding learning-jigsaw screen remains visible at the left and the story card is partially clipped on the right. The corrected independent-tablet test proves this is not an artefact of resizing a focused phone page. The current semantic document-overflow assertion does not detect the pager’s internal clipping, so this is recorded as a concrete blocker rather than described as visually clean.
- These walkthroughs are simulated learner scenarios, not real-child testing or evidence of enjoyment or educational outcomes.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, live payment, real child data or 3D work was used. Leonard’s `sodafom797` queue remained separate. Physical phone/tablet touch, real keyboard/screen-reader, real microphone/audio capture, speech-synthesis playback, live-account/payment and real-child checks remain unverified.

Next bounded priority: repair and measure the 820px reader pager alignment so the active story fills the page without exposing an adjacent screen, then return to auditing direct speech-synthesis callers outside the shared voice provider.
