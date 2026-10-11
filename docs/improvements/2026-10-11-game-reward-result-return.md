# Game reward result return

Date: 11 October 2026

## Repository state checked first

- Improvement branch: `improve/archie-learning-20261007`
- Current children’s test target: `test/archie-2026-10-02`
- Target head inspected: `79ba0f7e76dfa95c249c97fdd0b0b02adf3cc353` (`fix: isolate tutor state when switching learners`)
- Target work retained in the candidate merge: the preceding duplicate-answer-bank integrity work and the latest teacher-mode learner-switch isolation.
- Draft PR: <https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81>
- This work does not touch `sodafom797`, deferred 3D work, payments, credentials or production.

## Current deployed evidence

Railway deployment `06eea751-d395-49c9-a44f-b940499b0c87` was `SUCCESS` on target commit `79ba0f7e76dfa95c249c97fdd0b0b02adf3cc353`, with no pending work. The separate `sodafom797` service was not changed.

A direct Chromium walkthrough of the deployed app covered the home picture playground, game selection, a complete three-question Reading Quest, its reward, the scored result, lessons, the parent gate and the teacher gate. The home retained the blue/gold identity, pale picture-world treatment and blond, green-eyed Archie. The lesson and adult pages retained large controls, clear headings and privacy-aware gates.

The completed Reading Quest exposed the bounded defect chosen here: its shared game reward used the button label `Back to puzzle`, even though closing it revealed the game’s score, stars and next actions. That label describes the jigsaw use of the same component, not the game flow.

## Bounded change

- `CompletionScene` now accepts an optional return label and keeps `Back to puzzle` as its default, preserving the established jigsaw flow.
- `GameShell` supplies `See my result` for completed games.
- Component tests cover both the unchanged puzzle default and the game-specific result label, including its initial focus and close action.
- The Reading Quest browser journey now captures the reward separately, asserts that the misleading puzzle label is absent, closes with `See my result`, verifies the visible `Final score: 67%`, and then captures the result at 390×844 and 820×1180.
- The shared simulated year-group game matrix and standalone Sudoku journey now close game rewards through the same result-oriented label; actual jigsaw checks continue to use `Back to puzzle`.
- CI explicitly requires all four reward/result phone/tablet screenshots.

This is a navigation-clarity change. It does not claim improved learning outcomes or enjoyment.

## Curriculum and comparison basis

Statutory basis:

- England’s English programme separates word reading and comprehension, and includes checking that text makes sense and correcting inaccurate reading: <https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study>

Current official product benchmarks, used only as design inspiration:

- Reading Eggs describes a simple-to-navigate school experience with explicit, engaging literacy activities: <https://readingeggs.com/schools/>
- Khan Academy Kids describes playful, research-backed reading activities for ages 2–8 and scaffolded vocabulary/read-aloud support: <https://www.khanacademy.org/kids/ela>

The result-oriented exit label is an original interface proposal, not a statutory requirement and not copied content. It supports the measurable benchmark that a completion control should accurately name its destination.

## Validation

- Focused component tests: 2 files / 11 tests passed.
- TypeScript: passed.
- Full unit suite after target reconciliation: 162 files / 1,173 tests passed.
- Archie production build: passed.
- Script syntax and `git diff --check`: passed.
- GitHub Actions run 489 found and documented a stale browser-helper expectation: unit, build and the focused Reading Quest browser journey passed, but the later year-group matrix still looked only for `Back to puzzle`. The helper was corrected to the game-specific label before rerunning the workflow.
- Direct inspection of run 489's focused phone/tablet artifact confirmed that `See my result` was clear, readable and unclipped in both viewports. It also exposed an evidence-timing problem: the accessible final value was ready before the animated visible value, so screenshots caught a blank phone score and an intermediate `10%` tablet score. The browser journey now waits for the rendered `67%` counter before capturing the result. This is a test-evidence correction, not a scoring change.
- GitHub Actions run 493 passed on final code commit `ada2ff70954c0fbce6fdaa925c2f34eb788ec3a5`: TypeScript, 162 files / 1,173 unit tests, production build, hosted Chromium install, route/button journeys, focused Reading Quest phone/tablet journeys, the simulated all-years game/spelling matrix and artifact upload. Run: <https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38140058802>
- Final artifact `11702806655` was inspected directly. Both reward captures show the new result-oriented control without clipping. Both result captures visibly show `67%`, `2 correct out of 3 questions` and one star; the phone keeps the main actions reachable on its vertical surface and the tablet shows the complete result card without horizontal overflow.

Local Playwright execution was blocked because this runtime could not download its Chromium binary from the external CDN. This is an environment limitation, not reported as a product failure; the repository’s GitHub workflow installs Chromium and executes the journey.

## Boundaries and next priority

All browser walkthroughs are simulated learner scenarios, not real-child testing. Physical phone/tablet touch, real-device microphone/audio, hardware screen readers, live accounts/payments and learning outcomes remain unverified.

Next: reproduce the next current lesson/game failure with a complete phone/tablet learner journey, prioritising real broken routes or misleading feedback over cosmetic expansion.
