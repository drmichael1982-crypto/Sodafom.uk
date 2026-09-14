# Archie picture cinema and animated books

Frontend-only work. No backend, database, authentication, billing, hosting,
provider, microphone, recording, package or dependency changes.

## Route integration

- `/cinema`: default export from `src/pages/CinemaPage.tsx`.
- `/books/animated`: named `AnimatedBooksPage` export from the same module.
- Both pages link back to `/reading` and to one another.
- No existing story collection edits. Root owns route registration and entry links.

## Content and behaviour

The catalogue preserves the exact wording of the existing ten complete Archie
stories (100 pages) in `ArchieStoryCollectionPage.tsx`. Four stories have existing
individual cover illustrations and appear in the cinema. All ten appear in the
animated book shelf. The other six reuse the existing library shelf artwork.
The test checks every sentence against the original collection and checks the
dedicated artwork files exist. Keep both catalogues in sync if wording changes.

These are **illustrated story shorts**, with gentle camera motion over existing
artwork and a new readable sentence for each scene. They are not newly produced
cartoon videos, unique illustrations for every sentence, or synchronised character
animation. There are no duration claims beyond the runtime calculated from the
actual scene timing (minimum eight seconds per sentence, longer for more words).

Both readers start paused with sound off. Play advances automatically, Pause
retains elapsed scene time, arrows turn pages, Restart returns paused to page one,
and the final scene provides an ending and replay. Captions are always visible.
The book layout places the words beside the illustration on wide screens and
below it on portrait phones. Short landscape screens use a side-by-side layout.
Missing artwork falls back to a book symbol while text and controls stay usable.

Read this page is optional browser speech, available only when supported and
invoked directly by the user. It pauses timed playback and reads just that page;
Play resumes progression afterwards. No automatic narration or microphone access.
Page changes, backgrounding, returning to the shelf and unmount cancel owned speech.
Browser voice quality/availability varies; a failed voice leaves silent reading
available. Narration does not affect the advertised silent-play runtime.

The player releases its timer on pause/unmount and pauses when the tab is hidden,
without automatically resuming. OS reduced motion disables camera animation even
if timed playback is started. Motion can also be disabled separately. Native
buttons provide touch/keyboard controls; the focusable picture supports arrows and
Space without stealing input from buttons. Closing a story restores shelf focus.
Fullscreen requests gracefully fall back if unsupported or rejected.

An optional sparkle reveals a harmless joke. Its shuffle bag shows all five jokes
before refilling and prevents adjacent repeats, including after closing/reopening
the surprise. It has no rewards, purchases, tracking or automatic interruption.

## Validation

`vitest run src/components/cinema/cinema.test.tsx`: 15 targeted tests passed,
covering complete timed playback, paused time, ending/replay, manual navigation,
keyboard behaviour, background pause, timer and speech cleanup, reduced motion,
speech failure, missing artwork, fullscreen fallback, shelf focus, all ten books,
content fidelity, actual runtimes and shuffle-bag cycling.

Targeted ESLint passed for all five new TypeScript/TSX files. At the last full
TypeScript run, the new cinema files had no errors; one unrelated photo-test mock
type error was reported to the coordinator for correction.

No screenshot/browser playback verification is claimed: runtime Playwright could
not launch because its Chromium executable was unavailable. Root owns integrated
route/build verification and any later visual check.
