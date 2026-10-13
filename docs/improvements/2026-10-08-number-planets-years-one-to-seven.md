# Number Planets Years 1–7 browser coverage — 8 October 2026

## Current repository state checked first

- Continued `improve/archie-learning-20261007` for draft PR #81, targeting `test/archie-2026-10-02` at `4b2c53329e8d0a289cc3397de5a808e494d055dd`. The merge base remains that current test-branch head; this change does not overlap Leonard/sodafom797 work.
- Rechecked the existing Number Planets tests and the preceding run note before editing. Hosted coverage previously sampled Years 1, 4 and 7, so Years 2, 3, 5 and 6 were the concrete untested main-path boundaries.
- Reopened the current Railway test deployment before changing code. Year 2 at 412 × 915 rendered an addition mission with large answer planets and visible pause/hint controls. Year 6 at 768 × 1024 rendered multiplication with the same controls and no observed horizontal clipping. The deployment remains the test base, not this candidate commit.

## Bounded improvement

`scripts/test-archie-search-journey.cjs` now exercises Number Planets for every Year 1–7 tier at 390 × 844 and 820 × 1180 instead of sampling only Years 1, 4 and 7.

- Years 1–3 must render addition missions.
- Years 4–6 must render multiplication missions.
- Year 7 must render both multiplication and division during its eight deterministic missions.
- Years 1–3 and 5–7 pause on Mission 1, require the accessible break state, retain the exact equation after resume, then complete 8/8 at 100% and three stars.
- Year 4 retains the deliberate wrong-answer, blocked-progression, hint and retry journey, ending 7/8 at 88% and two stars.

The added journeys are simulated learner scenarios. They protect the implemented age-tier, pause and completion behavior; they do not represent real-child testing or prove enjoyment or learning outcomes.

## Curriculum boundary

The statutory England mathematics programmes of study include addition/subtraction in the early primary progression and multiplication/division as pupils progress. Source checked 8 October 2026: [National curriculum in England: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study).

The precise game bands above are a Sodafom design and test convention, not wording copied from the statutory programme. Passing these browser checks shows internal tier consistency only; it does not establish that Number Planets by itself covers every statutory objective for a year group.

## Verification

- Candidate code commit: `dc51826e4b558e56fe7c3f8f04fc0ec5fd27134f`.
- Local script syntax and `git diff --check`: PASS.
- Local `npm run type-check`: PASS.
- Local targeted Number Planets/age tests: PASS, 2 files / 16 tests.
- Local `npm test -- --run`: PASS, 87 files / 846 tests.
- Local `npm run build:archie`: PASS with the existing mixed-import and chunk-size warnings.
- [GitHub Actions run #221](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37843814489): PASS. Installation, type-check, 87 files / 846 unit tests, production build and Chromium setup all passed.
- Hosted route checks: PASS, 12 core browser journeys, all 130 linked game routes, responsive layout sweep with no horizontal overflow, zero browser errors and zero live API requests.
- Hosted simulated journeys: PASS, 82 total (increased from 74 by the eight new Year 2, 3, 5 and 6 phone/tablet scenarios).
- Evidence artifact `11579212146`: 141 files / 57,963,805 bytes; SHA-256 `73f3c218b9d1dc7238b06667d81866ef53b20adaa19d5148a346c6cedf6ad7ca`.

## Rendered evidence reviewed

- Inspected the new paused and completed captures for Years 2, 3, 5 and 6 at both 390 × 844 and 820 × 1180.
- Years 2–3 visibly used addition; Years 5–6 visibly used multiplication. The paused state retained Mission 1, the equation, Resume mission, Still planets and Ask Archie controls.
- All four added tiers reached the 8/8, 100%, three-star completion screen. Text and primary controls remained readable, the cartoon space artwork stayed coherent, and no horizontal clipping was observed at either width. Phone completion content correctly continues by ordinary vertical scrolling.

## Boundaries and next priority

Nothing was merged or deployed. No credential, paid service, payment, real child data, 3D feature or Leonard file was changed. Physical-device microphone/audio, keyboard/screen-reader behavior, live accounts and real-child use remain unverified.

Next bounded priority: extend the explicit wrong-answer → hint → retry assertions beyond the Year 4 representative, starting with one younger and one older tier, without duplicating the now-complete Year 1–7 correct-answer coverage.
