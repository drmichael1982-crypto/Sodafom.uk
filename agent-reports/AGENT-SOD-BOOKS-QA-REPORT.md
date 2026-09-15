# SOD-BOOKS-QA — Michael / Coordinator Codex

Date: 15 September 2026.
Task: walk through the app, prioritise books/cartoons/films, assess character step-out fun and readiness, fix necessary faults without overwriting other agents.
Branch: `codex/sod-books-playback-qa-20260915`.
Base: Agent 9's `agent9/books-library-2026-09-13`, commit `8cc3b7f` (full base is the parent of this branch's first commit).
Implementation commit: see GitHub branch history; the report commit cannot contain its own hash.

## Key distinction

Live browser inspected: https://sodafomuk-production.up.railway.app/
The visible home has a 16-title Stories menu and a four-title Theatre. It differs from the master-based ten-book reader and the cartoon episode branches. Previous deployment notes must not be assumed current.
No production deployment or main/master modification was made. Agent 9's branch was not modified; this branch adds a narrow reader repair on top of its existing shelf/step-out implementation.

## Live browser results

- Opened Stories, Lessons, Ask Archie, Game Islands, Homework Helper, Theatre, Parents, Teacher Classroom, Shop, Sticker Book and Settings. Home-return controls worked in that tour.
- Clicked all 16 Stories buttons individually. Each retained the same title-selection screen; none opened a reader or page controls. The matching main-source Stories handler only calls speech with the title and 'Tap again in the reader to begin.'
- Theatre Play retained the selection screen without pause, progress, captions or film scenes. Selecting Space changed the displayed title. The matching source handler only speaks 'Now playing [title]'. This is not functioning film playback.
- Inspected home and theatre screenshots. Home has large colourful tiles and a friendly illustrated hero. Theatre heading uses dark blue on dark red: visibly poor contrast.
- No character stepping out of a book was observed in the live title-selection flow.
- Other areas received menu/navigation inspection only, not full account, payment, lesson, camera, game or teacher certification. No payments, uploads, account unlocking or real pupil data edits were performed.
- Browser's initial DOM snapshot stalled; documented DOM controls recovered. No physical phone/tablet or audible narration pass is claimed.

## Readiness scorecard

These are narrow checklist percentages, not a whole-project completion claim. Green = all listed checks passed; yellow = partly implemented/unverified; red = core use blocked.

| Area | Status | Result and denominator |
|---|---|---|
| Live book journey | Red, 20% | 1/5: title shelf available. Reader opening, page turning, reader narration controls and character step-out were unavailable through it. All 16 titles tested. |
| Live film journey | Red, 20% | 1/5: episode selection works. Actual playback, pause/resume, captions and episode completion are absent from this menu implementation. |
| Agent 9 book logic after isolated repair | Green for automated checks, 100% | 5/5 targeted checks below. Does not certify visual animation, real speech or release readiness. |
| Book character presentation | Yellow | Step-out exists in Agent 9 source; live menu does not expose it. Visual/phone quality remains unverified, so no completion percentage assigned. |
| 5–7 minute cartoons | Yellow | Science/English/Space/Dinosaurs exist on separate branches. Earlier reports explicitly lack complete real-time browser/audio/device verification. Not played end-to-end in this pass. |
| Whole app | Unscored | Main menus visited; insufficient evidence for an honest whole-app percentage. |

## Independent book tests and necessary repairs

Preserved Agent 9's ten books, 100 pages, artwork and shelf/step-out JSX.
Fixed:
- Speech callbacks retained the starting word position, losing progress between chunks.
- One-letter words such as 'a' were ignored; partial prefixes could be falsely marked correct. Matching now requires the complete normalised word.
- Recognition could survive route unmount. Cleanup detaches handlers and stops recognition.
- Delayed page turns could leak into a newly selected book. Timers are tracked and cancelled on leaving/resetting; turning state clears on close.
- Microphone start errors could leave a stuck listening state. Reader remains usable after failure.
- Page changes stop old narration.

Five automated tests:
1. Open all ten books, locate each step-out character, traverse all 100 pages, verify first/last boundaries, go back one page and return to library.
2. Complete a page in two speech chunks including 'a'.
3. Stop recognition when reader unmounts.
4. Leave during a page turn and open another book without stale navigation.
5. Recover from microphone startup failure.

Speech APIs and Archie rendering are mocked in these tests; they prove interaction/state behavior, not actual accent recognition, audio or animation appearance.

Validation:
- Frozen dependency install: PASS.
- Targeted tests: 5/5 PASS.
- Full TypeScript check: PASS after correcting test typing.
- Production client + SSR build: PASS.
- Full suite: 229 passed, 1 failed (230 total). The failure is unchanged `src/server/__tests__/admin-auth.test.ts`, founder authentication / signed short-lived HttpOnly cookie. No Admin/backend file was edited.
- Whitespace diff check: PASS.

## Improvements in priority order

1. Coordinator must connect the existing reader and real episode players to the live menus, reconciling the 16-title menu with the different ten actual books. Do not silently substitute one story for another.
2. Keep Agent 9's real Archie step-out; verify that Archie is not obscured by the welcome text card and that the motion visibly begins at the cover on narrow screens.
3. Add a replayable short greeting, then let the child open the book. Pause decorative motion while reading; provide reduced-motion and a visible calm-mode choice.
4. Use story-specific illustrations and character actions: Daisy fetching a page, a gentle wave, or a character inviting the child into the story. Six current books reuse fallback artwork and all pages of a book share one scene image.
5. Resolve separate cartoon players through the agreed engine; keep captions readable and pause animation/audio together. Confirm actual five-to-seven-minute playback.
6. Recheck phones/tablets, audible narration, microphone permissions and reading accuracy before release.

## Integration risks / handoff

Shared file: `src/pages/ArchieStoryCollectionPage.tsx`. Agent 9 and other reading branches also own edits here. This branch is based on Agent 9: review/apply its small logic diff, not a wholesale replacement from a different baseline.
Added test: `src/pages/__tests__/BooksPlaybackQA.test.tsx`.
No changes to routes, live home, artwork, cartoons, payments, auth/server or hosting.
No merge into main/master. No Railway deployment. Other agents' branches unchanged.
