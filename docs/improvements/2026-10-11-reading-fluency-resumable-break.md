# Reading Fluency resumable break — 11 October 2026

## Repository and deployment evidence

- The current children’s target was resolved from the remote branch, open draft PR and Railway rather than guessed: `test/archie-2026-10-02` at `45533827a33d977a649d80fa6efdc119604a3927` (`Protect certificates during child switching`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `eff26ac5-0055-44be-ac3d-84694a3b8687` is `SUCCESS` on that exact target. It completed at 2026-10-11T15:17:10Z. No deployment, environment, variable or credential was changed in this run.
- The exact target was merged without conflict into continued branch `improve/archie-learning-20261007` by `8b7a2cb3dbfdea4bdce6d568bfa6a3b363686c47`. The bounded candidate head is `7bc7d45fb79a6b75d981a3ed619b322386c647bd`; the final application-code change is `fd6af4897d3c3ea2eba01bd516a463e2a009b7cc`. Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open and draft; nothing was merged to the test branch or deployed.
- The target change protects certificates during child switching and does not overlap the shared quiz break or Reading Fluency journey files.

## Bounded improvement

Shared multiple-choice practice now has a 44 px minimum-height `Pause game` control. Pausing stops current speech, hides the question and choices, removes the picture puzzle to keep the break uncluttered on a phone, and offers supportive stretch/rest/drink copy. Resuming restores the exact question, clue, first-attempt scoring and disabled tried answer; the pause control retains keyboard focus. Correct-answer transitions cannot be paused midway.

The Reading Fluency browser journey now simulates a Year 4 learner at 390 × 844 and 820 × 1180: clear initial prompt, deliberate wrong answer, clue, pause, resume, corrected retry, all ten questions, completion reward and result. It verifies that the corrected answer is still scored as a correction (9/10 and 90%) rather than rewriting first-attempt accuracy.

Fresh CI found browser-check and rendered-state defects while exercising the real pager. Runs [#507](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38150362308), [#510](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38151009656) and [#514](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38151732531) exposed respectively an unrevealed pause control, a transformed-coordinate error, and a partially visible retry control misclassified as another page. The #514 artifact also showed the picture board crowding the break card. Later green runs #522, #524, #525 and #526 were not accepted on checks alone: their artifacts revealed an empty or shifted phone break, a mid-transition capture, or a settling result. The final fix resets and clamps the pager's hidden native scroll, marks the break control as a first-screen destination, hides the board only during the break, and waits for the rendered state to settle before capture.

## Checks and visual review

- Local focused unit tests: PASS — 2 files, 13 tests. They cover stopped speech, hidden active question and picture board, retained focus, restored question/board/clue, preserved tried-answer state, and pager scroll-reset behaviour.
- Local TypeScript: PASS.
- Local Archie production build: PASS. Existing large-chunk and mixed-import warnings remain warnings.
- Authoritative combined-head CI: PASS — [workflow #527](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38159295349) on exact head `7bc7d45fb79a6b75d981a3ed619b322386c647bd`: 168 test files / 1,188 tests, production build, 15 journeys, 130 game routes, 98 simulated search/game journeys, zero browser errors and zero live API requests. Reading Fluency passed explicitly at both phone and tablet sizes.
- Candidate visual artifact: PASS — artifact `11710286053`, 98,705,009 bytes, digest `sha256:5f1a760857a9251636edd5b14bf080df2600b38329e4fc6cfd94d347a444a5f0`.

The deployed Railway target was opened directly at Reading Fluency. It retains the blue/gold identity, pale illustrated puzzle world, readable `Read:` / `Question:` prompt, large answer controls and blond Archie; as expected, the undeployed target does not yet show the new break control. The final candidate artifact was inspected separately. At 390 × 844, the prompt is centred and unclipped, the complete paused card and both resume controls are visible on a single settled screen, and the settled result shows 90%, 9/10 and three stars. At 820 × 1180, the paused and result cards remain centred and fully contained with large controls. No horizontal overflow was detected. These are simulated learner scenarios, not real-child testing or evidence of attainment or enjoyment.

## Curriculum and comparison grounding

- Statutory source: [Department for Education, English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) (official page last updated 16 July 2014). It includes reading easily, fluently and with good understanding, and rereading/correcting inaccurate reading. The optional break and retained-retry treatment are Archie design proposals, not statutory requirements.
- Current official benchmark: [Reading Eggs for schools](https://readingeggs.com/schools/) describes systematic instruction, audio modelling, automaticity, repeated reading, rewards and an easy-to-use interface. Archie’s bounded original benchmark here is transparent first-attempt scoring plus a state-preserving optional break; no proprietary text, lesson, character or artwork was copied.
- Current official benchmark: [Khan Academy Kids ELA](https://www.khanacademy.org/kids/ela) describes playful, adaptive, ad-free activities, read-aloud support, word highlighting, phone/tablet access and adult progress tracking for ages 2–8. Archie uses this only as a clarity/access benchmark, not as an age-range substitute or a universal-best claim.
- Stripe Directory was consulted before provider research as required, but its local CLI transport was unavailable. No provider was selected, contacted, purchased or provisioned.

## Boundaries and next priority

Production, the test deployment, payments, credentials, deferred 3D work and the separate `sodafom797` project were not changed. Leonard’s external queue is not visible in this runtime, so no active-worker coordination claim is made. Physical-device touch/layout, real microphone and audible speech, hardware screen readers, live accounts/email/payments and outcomes with real children remain unverified.

Next: recheck the current target and PR, then run a complete Reading Speed phone/tablet journey covering instructions, wrong answer, hint/retry, pause/resume, progression, completion/reward and navigation. Real-device microphone and audible-speech validation remains a separate explicit blocker.
