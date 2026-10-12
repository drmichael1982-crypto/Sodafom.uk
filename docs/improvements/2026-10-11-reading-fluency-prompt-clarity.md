# Reading Fluency prompt clarity — 11 October 2026

## Repository and deployment evidence

- The active children’s target was resolved from the open draft PR, the remote branch and Railway rather than inferred: `test/archie-2026-10-02` at `131518e017b2b72ba041d74626db0e6f74a6417c` (`fix: restore signed-in Star Bank rewards`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Railway deployment `4d90718f-7e56-41dc-9757-599a8858d8e3` is `SUCCESS` on that exact target. It completed at 2026-10-11T14:26:02Z. No deployment, environment, variable or credential was changed in this run.
- The bounded code change is commit `e68baaf1fbfef2253e7f9aa42840fa33e3920dae` on `improve/archie-learning-20261007`. Merge commit `91df3d42447108dcf3df74337a8bb853b71c8bab` incorporates the final target without conflict. Draft PR #81 remains the review surface; nothing was merged to the test branch or deployed.
- The target’s two later Star Bank/reward commits changed only `src/pages/rewards*` and `src/pages/star-bank*`. They did not overlap the Reading Fluency bank or browser check.

## Fresh rendered finding and bounded change

The current Railway app was opened directly and a simulated Year 4 learner entered Reading Fluency. An authored direct-speech passage rendered as:

`Read: ““I found it!” said Jo, grinning.” Which feeling should guide the reading?`

The extra application-supplied quotation pair made the boundary between passage and question harder to parse. The quiz bank builder now preserves only the punctuation authored inside each passage and adds an explicit question label:

`Read: “I found it!” said Jo, grinning. Question: Which feeling should guide the reading?`

This is an original clarity/accessibility treatment. It changes neither the answer, hint, scoring nor curriculum objective. Unit coverage rejects a second wrapper pair, checks the passage/question labels, and verifies that direct speech retains exactly one authored pair of speech marks. A new browser check renders Reading Fluency at 390 × 844 and 820 × 1180, validates the exact label pattern and horizontal containment, and requires both screenshots in CI.

## Checks and rendered review

- Before the final target advanced, exact-head workflow [#499](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38146130949) passed TypeScript, 165 test files / 1,180 tests, production build, all 130 linked game routes, 15 core journeys, 98 simulated phone/tablet game and lesson journeys, learner-isolation checks and artifact upload. The new output included `PASS Reading Fluency phone prompt clarity` and `PASS Reading Fluency tablet prompt clarity`.
- After reconciling the final target, authoritative combined-head workflow [#503](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38147630470) passed TypeScript, 167 test files / 1,184 tests, production build, all 130 linked game routes, 15 core journeys with zero browser errors and zero live API requests, both new Reading Fluency captures, 98 simulated phone/tablet game and lesson journeys, and artifact upload (212 files; artifact `11705855606`).
- The exact #499 candidate artifact was visually inspected at 390 × 844 and 820 × 1180. Both prompts use the explicit `Read:` / `Question:` structure without double quotation marks or sideways overflow. The phone prompt wraps inside one translucent white card with dark type and uses the existing Previous/Next pager for its answers; the tablet shows the prompt and answer choices together. Large controls, the blue/gold identity, pale picture-world art and blond, emerald-eyed Archie remain coherent. No measured contrast-ratio claim is made.
- Separately, the deployed target was directly inspected across Home, Games, one complete Reading Quest, Reading Fluency wrong-answer/hint/retry, Lessons, and parent/teacher gates. Reading Quest reached 100%, 3/3 and three stars. After Railway moved to final target `131518e`, Home was reopened again and visibly retained the established brand, picture jigsaw, large route controls and Archie artwork.
- These are labelled simulated learner scenarios, not real-child testing or evidence of improved attainment or enjoyment.

## Curriculum and comparison grounding

- Statutory source: [Department for Education, English programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) (official page last updated 16 July 2014). It includes fluent reading, comprehension, spoken-language development, punctuation and appropriate intonation. The explicit `Question:` label and punctuation-preservation rule are design proposals, not statutory wording.
- Current official benchmark: [Reading Eggs for schools](https://readingeggs.com/schools/) describes audio modelling, automaticity and repeated reading for fluency. Archie’s prompt is text-first and checks a learner’s choice, not microphone performance; no proprietary lesson, text, character or artwork was copied.
- Current official benchmark: [Khan Academy Kids ELA](https://www.khanacademy.org/kids/ela) describes narration, highlighted text, adaptive activities and phone/tablet access for ages 2–8. This informed only the benchmark of keeping passage and action visually unambiguous on small screens.
- Stripe Directory was consulted before provider research as required, but its local CLI transport was unavailable. No provider was selected, contacted or engaged.

## Boundaries and next priority

Production, the test deployment, payments, credentials, deferred 3D work and the separate `sodafom797` project were not changed. Leonard’s external queue is not visible in this runtime, so no active-worker coordination claim is made. Physical-device touch/layout, real microphone and audible speech, hardware screen readers, live accounts/email/payments and outcomes with real children remain unverified.

Next: complete the Reading Fluency journey itself at phone and tablet widths—wrong answer, hint/retry, optional pause/resume, ten-question completion, result/reward and return navigation—then address any current failure found before expanding appearance.
