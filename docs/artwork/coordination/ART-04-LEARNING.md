# ART-04 — Learning worlds artwork coordination

For Michael Davis and Coordinator Codex. Reviewed 16 September 2026.

## Scope and evidence baseline

- This is the new **ART-04 coordination lane**, not a renumbering of Books Agent 9, scanner Agent 12, classroom Agent 10, or school/teacher Agent 14.
- Local review branch: `codex/artwork-coordination-20260916`; inspected application commit: `442656b4e2ec76167b4d0b5fb7b804cf742904a5` (`codex/stable-app-build-20260915`). This worker changes only this report. The coordinator records its eventual report commit separately.
- Read the supplied artwork pack's `README.md`, `WORLD-ARTWORK-WORK-ORDER.md`, `MICHAEL-DAVIS-MASTER.md`, and `scene-status.json`; read GitHub #20 and its comments, PR #24 report/source at its exact commit, and the saved #31/#33 metadata. ART-02 supplied unchanged #31 library/sports source fetched at the exact commit below.
- No app code or image edits, image generation, commits, pushes, external comments, merge, deployment, Systems 797 work, or publication of private portrait/artwork bytes by ART-04.
- Existing branch existence or an old acknowledgement does not prove that its worker is currently running. New implementation tasks below require the existing owner's acknowledgement in the coordination thread before overlapping edits.

## Present implementation versus completed artwork

All application paths in this table refer to inspected commit `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. A route declared in source is not an exercised browser journey.

| Surface | Source evidence and existing implementation | Artwork/motion acceptance still needed |
| --- | --- | --- |
| Lessons entrance and classroom | `src/pages/ApprovedArtworkPage.tsx` maps `lessons` to `/assets/approved/lessons.png`; `/lessons` opens that page. The Science hotspot points to `/tutor?subject=Science&direct=1`. `src/routes.tsx` maps `/tutor` to `TeacherModePage`, whose file re-exports `ClassroomLessonPage`. | This is an existing raster entrance with live HTML hotspots, not a complete walkable school. Correct the old character artwork while preserving the approved setting and working entrances. Verify hotspot alignment after any corrected asset. |
| Classroom/science teaching | `src/components/ClassroomScene.tsx` uses `lessons.png`, Mia/Toby image motion, clock, lesson progress and child desk; `ClassroomTeacher.tsx` rotates/scales the existing teacher image with `speaking`/`demonstrating` states and `useReducedMotion`. `ClassroomLessonPage.tsx` owns lesson stages, 15/20/30/60-minute choices, questions, speech and microphone lifecycle. `/games/science-lab` is a separate implemented game route. | Whole-image sway/scale is present in source. Articulated walking, mouth animation, subject-specific science-room geometry/equipment, and final visual quality are not demonstrated by that code. Preserve teaching state and controls when adding presentation. The supplied pack has no final science-room master or teacher rig. |
| Stories/reading entrance | `ApprovedArtworkPage.tsx` maps `stories` to `/assets/approved/stories.png`; its collection hotspot opens `/reading`. `ReadingPage.tsx` shows `/assets/cartoon/worlds/reading.png` and distinct choices: `/reading?books=1`, `/games/reading`, `/reading?scan=1`, `/lessons`. | The illustrated Stories board and floating-island reading page have different visual directions. Select the approved entrance treatment from existing references before extending it. `classic=1` is not interpreted by stable `ReadingPage.tsx`; `/reading?classic=1` therefore opens the reading landing page, while `books=1` opens the shelf. Agree that distinction with Town. |
| Actual ten-book library | `src/pages/ArchieStoryCollectionPage.tsx` contains ten books/100 pages, two shelf rows, selected-book Archie emergence, page transitions, `Read to me`, microphone word states, page controls and Archie-eye view. Four books have dedicated story images; six use shared fallbacks. Each book's pages reuse one scene image. | Source provides transformed 2D character/scene motion, not unique animated illustrations for 100 pages. Preserve Agent 9's shelf/cover/step-out and PR #24's repairs. Verify character emergence begins at the correct cover, stays visible on a phone, and returns naturally. Decorative motion needs a checked pause/reduced-motion path; the page itself does not import `useReducedMotion`. |
| Real reading/homework scanner | `ReadingPage.tsx` selects `ScannerWorkspace mode="reading"` for `scan=1`. `src/components/scanners/ScannerWorkspace.tsx` calls `requestScan` against `${API_PREFIX}/ai-teacher/read-page`, uses `ScannerCapture`, cancellation/error state and `useScannerSpeech`, and shows actual returned text. | Keep these real features behind the library artwork. Do not replace capture, transcription, word help, permission checks, cancellation or failure feedback with a visual demonstration. Actual camera/microphone and network journeys remain untested here. |
| Museum | `src/routes.tsx` declares `/museum` and school-trip aliases. `src/pages/MuseumExplorerPage.tsx` defines six groups, each with three gallery facts: dinosaurs, Egypt, Romans, Vikings, space/inventions and nature. Buttons update museum/gallery state and call speech; Home and chooser returns exist. | Current presentation is gradients, emoji door cards and shared Archie. The text “walk inside” changes selected state; it does not establish a spatial walk. No museum-specific raster/3D scene is referenced in this page. Sutton Hoo, Stonehenge, Henry VIII and 1066 are not dedicated galleries in this file; do not label them finished. Retrieve their approved reference/content owners before extending coverage. |
| Sports/PE surfaces | `ClassroomScene.tsx` draws CSS football, track, field and indoor PE backdrops; `src/lib/tutor/classroom-system.ts` selects PE focus. `src/routes.tsx` declares football-times-tables, basketball-grammar, netball-spelling and pool-science games. `src/pages/games/learning-arena.tsx` connects question/action phases to `GameShell`, `useGameLevel` and result recording. | Existing arena art is generic gradient targets and emoji action motion. Preserve the learning/result logic when replacing the visual surface. `pool-science` is cue-sport pool (six pockets), **not swimming**. Stable arenas currently use `TOTAL_ROUNDS = 8`; artwork work must not quietly claim the requested ten-round completion. Route curriculum/round changes to the game owner. |

No learning world is certified as final artwork or physical-phone ready by this review.

## Exact PR/ownership reconciliation

| Existing owner/work | Evidence | Boundary to preserve |
| --- | --- | --- |
| Agent 9 — Books lead | [Issue #20](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/20); stable `agent-reports/AGENT-9-REPORT.md`; branch snapshot `agent9/books-library-2026-09-13` at `8cc3b7f7d6d4b89a7af34958bc4e89146209851a`. | Reader, shelves, covers and selected-book character emergence. `ArchieStoryCollectionPage.tsx` has one writer agreed through Agent 9/Coordinator Codex. |
| SOD-BOOKS-QA — existing nonnumeric QA contributor | [PR #24](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/24), head `17ac4c801cc462dc2fe47f8bade36fe5b06a11cd`; tested implementation reported as `820f230318bcec5b2d09aff5ab81bed6a7d37fc5`. | Narrow read-along/microphone/timer repairs, preserving Agent 9's art. **Stable reader and test file already match this PR's blobs exactly**; do not overwrite or reapply them wholesale. The old PR conflict report is not a reason to replace the current stable file. |
| Existing Books/library worker — no numeric identity asserted | [Acknowledgement in #20](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/20#issuecomment-5684450413) names `codex/books-living-library-20260915`, based on `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. The branch is absent from the supplied branch snapshot; current head/completion unverified. | Reserved NEW `src/components/books/living-library/` files, library-specific tests/previews, `docs/qa/living-library/`, and `agent-reports/AGENT-BOOKS-LIBRARY-REPORT.md`. Do not allocate a duplicate implementation worker. Obtain the current draft/head, then let Agent 9/Coordinator apply the smallest reader import/render handoff. |
| Agent 12 — scanners | #20; `docs/integration-status-20260915.md`; snapshot branch `agent12-homework-reading-scanners` at `70ab75d07ced102c44b175ab5447c9ee0c45fdaa`. | `src/components/scanners/` and real read-page service behavior; art should link to this implementation and preserve its state. |
| Agent 10 — classroom; Agent 14 — schools/teachers | Stable integration report; branch snapshot `agent10/classroom-lessons-20260913` at `6bbae3eff477706d444a84163c80a337c1f48858`; multiple Agent 14 variants are recorded as needing reconciliation. | Classroom learning/timing/teacher assignments remain with their owners. Art does not change teacher authentication, school register, pupil data or lesson logic. |
| Town #29 / PR #30 and Fairground PR #31 | PR #30 head `72812932facc1baed2589a9769e1c8924df70005`; PR #31 head `9c8d1f7528394c97fe351d81ce38df6883108f57`. | ART-02/Town owns entrance/return coordination. PR #31's `public/library-world.html` and `public/sports-centre.html` remain prototypes under their current owner until the overlap is resolved. |

PR #31 library source has emoji Archie/dogs, decorative shelf/glow art, a fixed Word Gate, a `420 ms` timer that highlights a sample sentence, and **“Simulate book scan”**. It speaks the instruction to follow the words, not a narration of the sample story. Repeated read/scan completion calls can increment a local capped counter. These are not real reader/scanner progress or final character designs.

PR #31 sports source has three local question unlocks for football, swimming and basketball, CSS/emoji movement and direct browser speech. It does not call the stable arena's result recording. Its swimming demonstration does not establish a persisted swimming game. Keep it identified as a prototype while Town, the game owner and ART-04 agree which surface should own each entrance.

## Character/reference gaps that affect learning worlds

Visual inspection of actual stable files found:

- `public/assets/approved/lessons.png` and `public/assets/approved/stories.png` still show the brown-haired adult in a blue hoodie. That depiction needs comparison/correction against the latest Michael portrait; the filename `approved` is not evidence that it meets the newer portrait instruction.
- Both contain repeated family/dog depictions and a separate Daisy-and-puppies cluster; Jessica's visible white markings also need the latest tiny-chin-only check. Review these areas against the current three-dog family-group rule without changing the approved room composition unnecessarily.
- The Stories raster includes a pictured title, “Archie Tries Something New,” that is not one of the ten executable titles in the reader. Keep decorative titles distinct from working title selection; do not silently substitute another story when making covers interactive.
- `public/assets/cartoon/worlds/reading.png` and `science.png` are standalone floating-island illustrations. They are usable existing direction assets, not a full interior, rig, animation or final approved world plan.

The supplied 16 September reference pack contains the Michael portrait, rocket group and six shop/fairground stills. It supplies **no new school/science, library, museum or sports master**, no living-book page-by-page animation, and no teacher rig. Locate earlier approved material through the reference owner; do not invent a replacement room and label it approved. Shared character corrections were reported to ART-01; ART-01's current private-scene scope does not itself assign a new owner to these public-app replacements.

Preserve source teacher identities from `src/lib/tutor/classroom-system.ts`: English/Spelling → Bella; Reading → Penny; Science → Professor Thinkwell; Geography → Rocky; Maths/History/French/German/PE → existing Archie guide fallback. This table records source assignments, not a new design approval. Beth, Kayla and Alfred require their established references; this pack does not establish new designs.

## Next bounded tasks and acceptance

These are owner-scoped follow-ups for Coordinator Codex to route, not claims that inactive external workers have started them.

| Task | Owner and exact boundary | Acceptance evidence |
| --- | --- | --- |
| ART-04.1 — learning asset correction handoff | Coordinator/character-reference owner selects one writer for corrected `lessons.png` and `stories.png` variants. Preserve originals and correct only requested character details. Shared asset-path/ratio changes in `ApprovedArtworkPage.tsx` go through Coordinator. | Before/after images against the actual portrait/group; correct Michael, Archie and dog markings/counts; room/covers remain recognisable; English and Reading stay separate; source dimensions and new paths recorded. No private source media posted publicly without the coordinator's publication decision. |
| ART-04.2 — living-library integration | Existing `codex/books-living-library-20260915` worker supplies its new component contract and current head. Agent 9 applies the minimum reader integration; SOD-BOOKS-QA checks regressions; Agent 12 supplies scanner entry. ART-02 handles Town entrance/return only. | Town entrance → reading landing or explicitly chosen shelf → all ten matching books → character emergence → page controls → shelf → Town. Correct back target, no stale page-turn timers/mic, no timer-only scan success. Existing five QA cases rerun at the combined commit; keyboard/touch, visible character, pause/reduced motion and actual mic results recorded separately. |
| ART-04.3 — classroom/science presentation | Agent 10 reviews visual changes in `ClassroomScene.tsx`/`ClassroomTeacher.tsx`; a new scene asset/component may be supplied after that owner confirms scope. No changes to curriculum, teacher mapping or Agent 14 school APIs. | Every existing subject entrance still reaches the intended teacher/lesson; 15/20/30/60 selectors and stage/pause/progress controls stay usable. Any science equipment is age-appropriate and follows retrieved approved art. Motion responds to actual speaking/demonstrating state, stops with pause/calm settings, and cannot cover learning text. |
| ART-04.4 — museum entrance/galleries | Coordinator identifies/reconfirms the existing museum owner before editing `MuseumExplorerPage.tsx`; ART-02 owns shared Town route updates. Until approved museum references arrive, produce a gallery-to-existing-content map, not invented final art. | All six current museum groups and 18 gallery choices retain correct text, chooser/Home exits and accessible labels. Any new historical topic has an approved scene reference and real content destination. Walking/door transitions, captions and reduced motion are demonstrated in a preview and checked on a phone. |
| ART-04.5 — sports art handoff | ART-02/Town owns geography/entrances; existing game owner owns `learning-arena.tsx`, `learning-arena-data.ts`, `GameShell` and saved-result logic; Agent 10 owns PE lesson scenes. ART-04 supplies visual/task mapping only. | Football, basketball, netball and cue-sport pool enter the matching real game, show correct prompts, unlock action after a correct answer, and preserve learning score/result behavior. Swimming is labelled prototype/unimplemented until its owner provides a real game. Correct/wrong/exit/reload behavior and mobile target placement are checked at the integration commit. |

Routes, `ApprovedArtworkPage.tsx`, shared character components, shared voice/animation interfaces, game logic, configuration and lockfiles require the coordinator's single agreed writer. Do not solve a world-art task by replacing these shared systems.

## Checks performed and limits

| Check performed in this ART-04 pass | Result |
| --- | --- |
| Stable checkout commit and clean starting worktree read | PASS — application baseline `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. |
| Local `git hash-object` versus GitHub `fetch_file` SHA for PR #24 at `17ac4c801cc462dc2fe47f8bade36fe5b06a11cd` | PASS — reader blob `be80c0946cb13b372f663b9d31238e11c3305324`; QA test blob `733b2a8364907d016262e98b4eadc846e18d8fc9`; both identical to stable. This proves those files match, not whole-PR ancestry or release readiness. |
| Python static asset-path check across artwork registry, classroom, teacher mapping, reader and reading page | PASS — 20 distinct literal asset references, none missing. |
| Python static reader catalogue check | PASS — ten titles, ten pages each, 100 total pages, four dedicated story illustration paths. |
| Python static route declaration check | PASS — nine declared routes: `/lessons`, `/tutor`, `/reading`, `/museum`, `/games/science-lab`, `/games/football-times-tables`, `/games/basketball-grammar`, `/games/netball-spelling`, `/games/pool-science`. No browser execution implied. |
| Visual inspection of lessons/stories/reading-island/science-island image files | REVIEWED — old-character/extra-dog findings above; final latest-canon acceptance FAIL/PENDING correction. |
| Full unit suite, type-check and app build | NOT RUN in this pass — checkout has no `node_modules`/local Vitest executable; documentation-only scope did not require dependency installation. |
| Existing PR #24 tests | REPORTED PRIOR EVIDENCE ONLY — five targeted tests, type-check and client/SSR build pass; full suite reported 229 pass/one unchanged Admin failure. Speech and Archie were mocked. Not rerun by ART-04. |
| Browser routes, real camera, real microphone, audible narration, physical phone/tablet, frame-rate and full animation playback | NOT TESTED in this pass. |

Inspected image dimensions and SHA-256 evidence:

| Asset | Actual size | SHA-256 |
| --- | --- | --- |
| `public/assets/approved/lessons.png` | 1536 × 1151 | `cefb7e9d842da083ee137a49ec6ed120c5c6c5ea34170f7b4ffd6fc740f2ee1d` |
| `public/assets/approved/stories.png` | 1536 × 1151 | `35f3d75ef160fd9c32a9daacf860d78edb4a01b915acc85cc6630a2c673a4dad` |
| `public/assets/cartoon/worlds/reading.png` | 1254 × 1254 | `6dffc399e0307804a66929707c685e4e3109c0b5cfca665da66b2fedbfa1555d` |
| `public/assets/cartoon/worlds/science.png` | 1254 × 1254 | `918ef02195ebd56b2fb1a1183cb79acd1f1c7f932152d271b0f778b0e62bde05` |

Overall learning-art status: **AMBER — existing working-code foundations and old illustrations are present; final character corrections, approved interior references, motion integration and device acceptance remain. No whole-section percentage is asserted from static review.**
