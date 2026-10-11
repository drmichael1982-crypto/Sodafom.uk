# Sudoku guided retry and optional break — 10 October 2026

## Fresh state and bounded ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- Evidence-resolved children’s target: `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remained open and unmerged.
- Implementation commit: `d60877389eccff100e943ab13b7695dfed6d2b3f`.
- Before editing, the open PR, latest branch commits, current target deployment and exact CI on the preceding implementation/documentation commits were rechecked. This run changed Sudoku, the shared result wording and their tests only. Production, 3D work, credentials, payments and the separate `sodafom797` project were not touched. Leonard’s live worker status is not observable here, so no claim of active-worker coordination is made.

## Reproduced behavior and repair

The current Sudoku accepted an incorrect digit but offered no hint, corrective retry guidance or optional pause. It also silently reduced the score as wall-clock time passed, while the shared result banner could claim “You got every question right” after a corrected mistake even when the score was 95%.

The bounded repair now:

- retains an incorrect digit in the selected square, marks it invalid and calmly asks the learner to try again;
- gives an erase-first hint for a wrong entry, then a reasoning hint that lists the missing row and column values and asks which value appears in both rather than revealing the answer;
- adds an explicit Erase action and preserves the selected square through correction;
- adds Pause/Resume with the grid and selected square retained, hides the board and number pad during the break and restores focus on resume;
- replaces the hidden elapsed-time penalty with an observable mistake-based score: five points per mistake, floored at 50%;
- changes the shared perfect-result message to depend on a true 100% score, so a corrected 95% round earns three stars without falsely claiming every response was right;
- centres the controls and number pad at both phone and tablet widths while preserving the existing blue/gold 2D game style, puzzle bank and difficulty choices.

This is an original feedback/recovery design proposal. It is not evidence of improved attainment or enjoyment.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Focused Sudoku/shared-result tests | PASS — 2 files / 11 tests |
| Full Vitest suite | PASS — 136 files / 1,040 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Main browser suite | PASS — 15 journeys, all 130 linked game routes, phone/foldable/tablet/landscape layouts, zero browser errors and zero live API requests |
| Whole-page jigsaw browser check | PASS — all checked viewports and actions |
| New full Sudoku browser journey | PASS — 390 × 844 and 820 × 1180 |
| Exact implementation workflows | PASS — [Archie test build #403](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38063648261) and [interest themes #54](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38063648262) |

The deterministic browser journey selects Year 2 and Easy, enters a deliberate wrong digit, requests help, erases it, reads the row/column reasoning prompt, corrects the square, pauses after a correct entry, resumes with state and focus preserved, completes all eight editable squares, closes the moving reward and verifies the settled 95%, 8/8, three-star result with the accurate “Your practice earned three stars” banner. It runs at phone and tablet sizes and checks for page overflow and browser errors. This is a simulated learner journey, not real-child testing.

Hosted run #403 passed on exact implementation commit `d6087738…`: install, TypeScript, all 1,040 unit tests, production build, Chromium installation, 15 core journeys, all 130 linked game routes, responsive layouts, whole-page jigsaw verification, the expanded 84-journey simulated matrix and artifact upload. Interest-theme run #54 also passed.

An exploratory broad whole-space check sampled the animated jigsaw pieces between frames and failed its strict equality comparison after pause; the dedicated current jigsaw workflow passed. A separate exploratory layout probe reported decorative home SVG/piece extents a few pixels outside its element bounds while document-level horizontal overflow remained false. Neither was attributed to Sudoku or represented as a current product failure.

## Rendered and deployment review

Fresh before/after Sudoku captures were directly inspected at 390 × 844 and 820 × 1180. Before the change, the screen showed only a mistake count after a wrong digit, with no retry guidance, hint or break. After the change, the retry message, erase and reasoning-hint states are readable; the centred break card hides the puzzle; the number pad and controls remain contained; and the final result accurately shows 95%, 8/8 and three stars. Headless Chromium displays some emoji as square placeholders; this is not treated as proof of a production glyph defect.

Fresh local rendered captures of home, Games, Lessons and parent/teacher progress were also inspected at phone and tablet sizes. The established blue/gold branding, pale illustrated backgrounds, readable cards and blond Archie with emerald-green eyes remain intact. Navigation/containment checks passed. The full Sudoku round was inspected separately from those overview pages.

The known Railway URL was opened read-only. Its deployed home still presents the established blue/gold/pale illustrated 2D design and Archie character. Railway deployment `f0320c4c-8306-41da-b432-543ccbed6b96` is `SUCCESS`, created on 10 October 2026 from exact target `286817348b5bf82954b7e67cab01fdd99c4187f8` on `test/archie-2026-10-02`. The Sudoku candidate is not deployed, so the candidate’s other pages were inspected through the local rendered preview rather than represented as live.

## Product comparison and curriculum boundary

The required Stripe Directory workflow was attempted before provider lookup, but its CLI is unavailable in this runtime. No provider was selected, contacted, provisioned or paid. Current official sources were then checked on 10 October 2026:

- [Sumdog](https://learn.sumdog.com/en-gb/about-us) describes adaptive maths and spelling practice for ages 5–14 across multiple games. The relevant benchmark is level-appropriate practice and clear feedback, not copied characters, game text or lessons.
- [Khan Academy Kids](https://www.khanacademy.org/kids) describes a personalised learning path and playful foundational practice for younger learners. Archie’s narrower measurable change is a recoverable same-puzzle retry with an optional break.
- [NRICH mathematical Sudoku](https://nrich.maths.org/problems/mathematical-sudokus) demonstrates Sudoku-style mathematical problem solving. Archie’s hint uses row/column elimination in its existing 4 × 4 puzzle rather than copying NRICH content.

The [England mathematics programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) is the authoritative curricular source and expects pupils to develop fluency, reason mathematically and solve increasingly sophisticated problems. The row/column elimination hint supports reasoning practice, but this particular Sudoku mechanic, mistake scoring and pause design are app proposals rather than statutory requirements.

## Unverified boundaries and next priority

Physical phones/tablets, real audible speech, microphone capture, hardware screen readers, live accounts/payments and real-child learning or enjoyment remain unverified. No merge or deployment was performed.

Next: recheck the branch, PR, CI and live target, then complete the newly deployed parent-summary journey at phone/tablet widths and verify saved tutoring is isolated by synthetic learner and year. Keep Leonard’s separate queue and `sodafom797` isolated.
