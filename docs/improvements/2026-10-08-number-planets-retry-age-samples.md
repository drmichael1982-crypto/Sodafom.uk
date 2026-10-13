# Number Planets retry recovery across age tiers — 8 October 2026

## State rechecked before work

- Continued `improve/archie-learning-20261007` at documented head `a96c492afab7f7acbdc222742d0e9b3cc3ccfd94`; draft PR #81 still targeted `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`, with that same merge base.
- GitHub documentation run #225 had passed. The previous note identified one younger and one older explicit retry sample as the next non-duplicate gap.
- Railway deployment `aa228b4a-9e25-450c-b109-fc0ab9ff4986` remained `SUCCESS` on test commit `4b2c533`, created 8 October 2026 at 19:17:29 UTC. No deploy or configuration change was made.
- Directly reopened the live `/device-check` view. Year 6 Number Planets at the 768 × 1024 tablet simulation retained large controls, multiplication content, coherent blue/gold space artwork and no observed horizontal clipping.
- Leonard/sodafom797 stayed separate. No Leonard file, service or queue was changed.

## Bounded regression improvement

Extended `scripts/test-archie-search-journey.cjs` so explicit recovery is sampled in the younger, middle and older Number Planets bands:

- Year 2 addition, Year 4 multiplication and Year 7 multiplication/division now deliberately select a wrong answer on Mission 1.
- Each sample must keep Mission 1 and zero first-try discoveries, block the Next control, expose a concrete arithmetic hint, accept a corrected retry and finish all eight missions.
- Year 2 and Year 7 also pause after requesting the hint. Resume must restore the exact equation and the same hint before the learner retries.
- All three retry samples must finish at 7/8 first-try answers, 88% and two stars. The remaining Year 1, 3, 5 and 6 journeys retain their perfect-answer, 100% and three-star coverage.
- The total remains 82 simulated journeys because the existing Year 2 and Year 7 scenarios were strengthened rather than duplicated.

These are simulated learner scenarios. They verify the implemented controls and feedback states, not enjoyment or learning outcomes in real children.

## Curriculum and current-product benchmark

- England's statutory mathematics programme progresses from addition/subtraction toward multiplication/division. The exact Number Planets year bands are a Sodafom design convention, not a claim of complete statutory coverage: [National curriculum in England: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).
- Khan Academy Kids' official maths page describes playful feedback and level adjustment for younger learners: [Khan Academy Kids maths](https://www.khanacademy.org/kids/math).
- Mathletics' official UK pages describe instant feedback and prompts within UK curriculum-aligned practice: [Mathletics for UK home learning](https://www.mathletics.com/uk/for-%20home/) and [Mathletics homework](https://www.mathletics.com/uk/for-schools/homework/).

The original Sodafom benchmark used here is concrete, non-pressuring recovery: retain the question, explain a next step, allow an optional break, preserve the hint through that break, and reward completed practice without pretending the initial mistake was correct. No character, artwork, lesson text or proprietary activity was copied, and no claim of superiority is made.

Stripe Directory was checked first as required for external-provider selection, but its CLI was not installed in this runner. The comparison therefore used only current official product pages and did not provision, subscribe to or integrate any external service.

## Verification

- Candidate code commit: `d0b4720fdb4b48e070bd8b174a11e20a9ec791cb`.
- Script syntax and `git diff --check`: PASS.
- Local `npm run type-check`: PASS.
- Focused Number Planets/age tests: PASS, 2 files / 16 tests.
- Local `npm test -- --run`: PASS, 87 files / 846 tests.
- Local `npm run build:archie`: PASS with the existing mixed-import and chunk-size warnings.
- The local browser attempt could not download Chromium in this restricted runner. The built app did start successfully, and the authoritative hosted browser gate below passed.
- [GitHub Actions run #227](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37851003885): PASS. Installation, type-check, 87 files / 846 tests, production build and Chromium setup all passed.
- Hosted route checks: PASS, 12 core browser journeys, all 130 linked game routes, responsive layout sweep with no horizontal overflow, zero browser errors and zero live API requests.
- Hosted simulated journeys: PASS, 82 total.
- Evidence artifact `11582770496`: 141 files / 59,535,655 bytes; SHA-256 `fd940f1b77021fd68e9d95c24b9677ff6f9273ce9379bb6faeb41b3b640734e0`.

## Rendered evidence reviewed

- Inspected retry, paused and completed captures for Year 2 and Year 7 at 390 × 844 and 820 × 1180—12 new state/viewport captures in total.
- Wrong-answer screens retained the arithmetic question, used a clearly different recovery colour and showed a specific addition or equal-groups hint. Next remained unavailable.
- Pause screens retained Mission 1 and the exact equation, with clear Resume mission and optional Still planets controls. Resume restored the hint before correction.
- Both tiers completed at 88%, 7/8 and two stars. Text, feedback and primary controls remained readable; no horizontal clipping was observed. Phone results use ordinary vertical scrolling for lower controls.
- This was browser/CSS viewport evidence, not a physical-device, real screen-reader or real-child test.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, payment, real child data or 3D work was used. Physical-device touch/keyboard, microphone/audio, screen-reader, live-account and real-child checks remain unverified.

Next bounded priority: exercise the Year 7 division mission—not only its opening multiplication mission—with a wrong answer, division-specific hint and corrected retry at phone and tablet widths. Change product code only if that journey exposes a current defect.
