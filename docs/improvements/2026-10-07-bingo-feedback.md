# Bingo feedback and breaks — 7 October 2026

## Current handoff
Repository: `drmichael1982-crypto/Sodafom.uk`. Continue `improve/archie-learning-20261007`, draft [PR #81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), base `test/archie-2026-10-02`.
Implementation commit: `35469e5d050312d0fc878286afdb4c894fa3f478`. This note and index are a following documentation-only commit.

Rechecked test head: `d31cadfea3edc44e19d25e34f3c5b41ed3e3d5f6`; previous improvement head: `08ac206e7dfb48228e94e9c4f90a74d287fc01f2`. Both prior-head GitHub runs [37678737123](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37678737123) and [37678729825](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/37678729825) completed successfully, including browser and simulated journeys. There is no current CI failure inferred from an older report. Fresh CI for this candidate must be reviewed after publication.

Railway remains deployment `15f206f9-e9ef-4070-bbab-b63f10cff7cd`, SUCCESS at 2026-10-07T16:35:57Z, test head d31cadf. The live test homepage at https://archie-learning-test-production.up.railway.app/ was directly re-opened and visually checked: blue/gold branding, planets, pale background and blond/green-eyed Archie remain. This candidate is not deployed.

The Leonard task instructions were re-read privately: it develops the separate `drmichael1982-crypto/sodafom797` app and must avoid concurrent Archie edits. No running laptop worker/queue status is available here. PR #80's homepage work and other open PRs were rechecked; only Bingo implementation/tests and its existing browser journey script were edited. No shared homepage, 3D, Leonard or production code was changed.

## Fresh reproduction and repair
Before changing the build, repeated all 54 previous simulated journeys on the exact prior improvement head. They passed but exposed an untested learning-feedback defect: a perfectly played Bingo line displayed “4 correct out of 9 questions” and “Keep practising”, although only four sums had been presented. The denominator counted unused card squares as missed questions. Before captures are in test-results/bingo-before; the low transient animated percentage in a capture is not the settled score.

Bingo now:
- Scores only presented sums. A perfect line earns 100% and three stars regardless of unused squares.
- Records first-try accuracy once per sum. Multiple wrong taps on the same sum do not create extra questions. Correcting it still marks the square and advances practice. Using a hint alone does not lower the score.
- Gives immediate supportive retry guidance; the question stays put after a wrong answer.
- Offers original counting-on/back hints for addition/subtraction, with a groups hint for the existing multiplication branch.
- Adds Pause Bingo / Resume Bingo. Answers and hint controls are disabled while paused; the current question, marks and retry/hint state are retained within the game. Reload/restart persistence is not claimed.
- Replaces the misleading “of 20” label with the actual row/column goal and sums solved.
- Uses readable navy/light-blue question styling, blue/white marked cells and large hint/pause controls. Bingo's scale/tap animations respect reduced motion.
- Cancels its delayed completion callback on leaving, preventing a later reward callback from an abandoned screen.

Changed code: src/pages/games/maths-bingo.tsx, src/pages/games/maths-bingo.test.tsx, scripts/test-archie-search-journey.cjs. No new dependency.

## Exact candidate checks
| Check | Result |
| --- | --- |
| TypeScript noEmit | PASS |
| Full unit suite | PASS — 77 files / 812 tests |
| Bingo unit cases | PASS — 12 cases; finite cards, lines, perfect/retry scoring, pause preservation and cancellation |
| Archie-test build | PASS — existing large-chunk warning remains |
| Main browser suite | PASS — 11 journeys; 130 game routes via eligible menus; zero browser errors; zero live API requests |
| Responsive browser suite | PASS — 20 routes × 16 sizes; no horizontal overflow |
| Simulated game/lesson suite | PASS — 66 scenarios, 390×844 and 820×1180, reduced-motion requested |
| Syntax / whitespace | PASS |
| Separate rendered sizing/contrast probe | PASS for selected controls/text; no phone horizontal overflow |

The 66 scenarios include 18 year-preserving search recoveries, 6 full Number Pop adventures, 24 full Bingo games (perfect and retry variants for Years 1–6 at two widths), and 18 seven-word spelling lessons (Years 1–9 at two widths). Bingo variants test wrong-answer preservation when relevant, hints, pause/resume, disabled answer controls, arithmetic answers, line completion, exact first-try counts/settled percentages and return to menu. Perfect rounds assert the three-star headline.

All offered year settings are included in search/spelling checks; Bingo remains excluded from older years by its unchanged existing policy. These are synthetic learner scenarios, not real children. All 130 routes opened, but every inherited game/year combination and every course/teacher lesson has not received a full walkthrough. Actual enjoyment, learning outcomes and comprehensive curriculum coverage are not established.

Commands are unchanged from the preceding note, with the expanded journey script. Local browser verification used the same temporary Chromium 153 executable (ARCHIE_CHROMIUM_PATH) and node --import tsx server workaround; no app dependency or standard CI browser was replaced.

## Rendered inspection
Reviewed phone/tablet captures of home, game selection, spelling, locked/unlocked parent/teacher pages, Bingo practice, wrong-answer/hint and completed rounds. The successful branding and layouts remain. Before perfect practice could report 4/9; after examples display 5/5 = 100% and 7/7 = 100%. A retry example displays 6/7 = 86%, rather than penalising unused squares. These are different random rounds, not a controlled educational efficacy study.

Selected computed-style measurements at 390px:
- Question text rgb(23,37,84) against rgb(239,246,255): 13.50:1.
- Hint text white against rgb(29,78,216): 6.70:1.
- Hint and pause controls: 52px high; number cells in the measured young-tier layout: 114×114px.
- No horizontal overflow.

These selected pairs exceed the ordinary-text 4.5:1 benchmark in [W3C's WCAG 2.2 contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), checked 7 October 2026. This is not a full accessibility-conformance claim. The inherited game shell still uses entrance fades and its shared reward banner/supportive text need contrast repair. Vertical scrolling is needed on phones; not every control is simultaneously above the fold.

After captures are produced in test-results/search-after and uploaded by existing CI. Before captures can be reproduced from 08ac206 with the prior journey script. A separate local probe also captured the paused phone screen. Microphone/audio output, physical phone/tablet, live account readiness and payments remain unverified.

## Curriculum and official comparison
- [DfE England maths programme](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study), checked 7 October 2026: Year 1 includes addition/subtraction to 20 including zero and number bonds. Counting-on/back hints support a practice subset; the within-10 tier is not a full Year 1 course. The programme also emphasises consolidation and progression based on understanding.
- [Mathseeds official school lessons](https://mathseeds.co.uk/schools/features/lessons/), checked 7 October 2026: guided, self-paced practice with immediate affirmative/corrective feedback is the relevant feature benchmark. The original Bingo hints, accurate scoring and optional break follow that design direction; no characters, art, lessons or text were copied. No superiority or independently proven learning claim.
- Required Stripe Directory skill/lookup was already attempted in this conversation, with the socket/broker limitation recorded in the preceding run note. This review uses official product documentation; no service was selected, purchased or provisioned.

Accurate first-try scoring, pause behavior, exact age buckets, stars and the line-completion design are app choices, not statutory curriculum requirements. No phonics/content lesson was changed.

## Next priority and remaining limits
1. Fix the shared GameShell ResultScreen contrast: white text on the maths gold celebration banner, and faint supportive text on the result card. Inspect settled rendered states; separate real contrast issues from entrance/counter animation. Preserve the encouraging break wording and branding.
2. Coordinate phone homepage helper wrapping with PR #80, then examine long/dense game menus, truncated year-selector text and repeated placeholder artwork.
3. Continue full inherited-game/year and course lesson walkthroughs, including incorrect answers, progression/retry, pause/resume and accessibility. Review age/objective fit individually.
4. Physical device microphone/audio and live account/payment readiness remain explicit gaps. Leonard's active laptop queues are not verified.
5. Recheck branch head/PR ownership, latest CI and deployment before the next change. No merge, deploy, paid provisioning, credential change, real child data or laptop installation occurred.
