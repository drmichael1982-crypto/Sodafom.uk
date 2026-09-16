# SOD-FIN-03 — Books QA after artwork handoff #33

For Michael Davis and Coordinator Codex. 16 September 2026.

**Status: AMBER for reading functionality; RED for artwork, layout and accessibility acceptance.** The five existing component tests and production build pass. Fresh browser checks expose defects that those component tests do not cover. No whole-section or whole-app completion percentage is claimed.

## Scope and preserved ownership

- Worker: existing **SOD-BOOKS-QA**, Books playback QA support for SOD-FIN-03 / issue #20. This is not Agent 9 or the scanner owner.
- Existing repair branch/PR preserved unchanged: `codex/sod-books-playback-qa-20260915`, PR #24, head `17ac4c801cc462dc2fe47f8bade36fe5b06a11cd` when checked.
- New isolated evidence branch: `codex/sod-books-artwork-qa-20260916`.
- **Application commit actually tested:** `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, the stable checkpoint explicitly authorised in the PR #24 coordinator decision. Base tree: `47ce499ec7071d151db6d79454db56d8dcb98d89`.
- The final evidence commit is recorded in the draft PR, avoiding a self-referential hash in this report. All runtime results apply to the application commit above; this branch adds only this report, the browser audit script and structured results.
- Agent 9 retains reader/shelf ownership; Agent 12 retains scanners. The coordinator explicitly directed this worker to QA and report without further overlapping edits. No source, assets, routes, shared animation engine, lockfiles or existing reports were changed.

Read: PR #33 and its complete artwork handoff; issue #20 and comments; PR #24 and coordinator comments; Agent 9's existing report; the supplied artwork archive. The private reference images were inspected locally, not published in this branch.

## Artwork references actually inspected

The archive integrity check passed. All **9/9** image files matched the supplied size, dimensions and SHA-256 manifest. Visually inspected the original Michael portrait, approved rocket group and six-scene overview, then the six assets currently used by Books (four dedicated illustrations, the shared Archie mascot and the fallback library illustration).

Michael's portrait `27874.jpg` / `images/master/michael-davis-approved.jpg` overrides Michael in older artwork. Its hash is `74e4bc78fddea3ca40bc8bbb383a8b6c8a344178e27d9a2591d88e810dedefa2`. Preserve his actual face and beard, brown eyes, adult proportions, navy suit/waistcoat, open white shirt, pocket square and gold outline heart pin. He remains Archie's dad and sole Founder & Creator. No voice was changed or generated.

For Archie, Rob, Soda and the dogs, compare the actual supplied group image, not an approximate text prompt. Keep the same blond, green-eyed Archie in the blue/gold A outfit; Rob's hat/glasses/moustache and plain brown waistcoat; Soda's compact white/blue body and round SODAFOM badge. Jessica is black with only a tiny white chin; Sally is entirely black; Daisy is brown and white. Exactly three family dogs. The pack does not establish new designs for other cast.

**This is a before-state audit. No corrected still, new character model, moving clip or voice is represented as approved.**

## Executed checks

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Frozen dependency installation | PASS | `pnpm install --frozen-lockfile --ignore-scripts --fetch-retries=0 --network-concurrency=8`; lockfiles unchanged. Offline-only attempt first lacked a cached tarball; the frozen online install then succeeded. |
| Existing Books regressions | PASS — 5/5, 100% of these tests | `pnpm exec vitest run src/pages/__tests__/BooksPlaybackQA.test.tsx --reporter=verbose`. Covers all ten books/100 pages, chunked read-along including single-letter words, microphone cleanup, stale page-turn cancellation and startup failure recovery. Speech and character rendering are mocked in these existing tests. |
| TypeScript | PASS | `pnpm run type-check`. |
| Production build | PASS | `pnpm run build`: client and SSR builds completed; existing large-chunk warnings remain. |
| Browser menu → shelf → reader → next/previous → Archie view → return | PASS at 360×800 and 1280×800 | Actual React components and images in Chromium 153. Five checkpoints pass at each size. This does not make their artwork/layout acceptable. |
| Same browser journey at 768×1024 | FAIL after shelf entry | Ten covers are present, but the first book is clipped outside the reachable left edge; a normal click is intercepted. Later steps in this tablet journey are NOT TESTED. Complete journeys: **2/3 (67%)**, not a section-completion estimate. |
| Direct `/reading` URL | FAIL at all three sizes | Home artwork renders although the URL is `/reading`; browser reports Capacitor platform `web`. Navigation through the actual home/story buttons does reach Reading. |
| Phone layout | FAIL | At 360px, document width is **422px** on the shelf. Header overflows horizontally. Reader itself measured 360px. |
| Visible step-out character | FAIL visually | At phone and desktop sizes the white selected-book panel covers much of Archie. Desktop DOM hit-test at the character centre returns the panel's explanatory paragraph. |
| Reduced motion | FAIL | `prefers-reduced-motion: reduce` matched. In a separate 768×1024 probe on the visible Seaside book, the mascot transform changed from `matrix(1, 0, 0, 1, 0, -0.285264)` to `matrix(1, 0, 0, 1, 0, -0.0732742)` over 400ms after entrance animation settled. |
| Physical phone/tablet, audible voice and actual microphone | NOT TESTED | Viewport simulation and mocked speech tests do not certify hardware, voice identity or recognition accuracy. |
| Town entrance, real camera/scanner, login and backend | NOT TESTED | Outside this approved QA scope; all local API calls returned controlled 503 responses and external browser traffic was blocked. No real account or child data used. |

The browser audit intentionally exits nonzero for observed failures. `docs/qa/books-artwork-20260916/results.json` records the measurements. A first reduced-motion attempt was blocked by the tablet first-cover defect; the focused follow-up uses the visible Seaside book. These are separate runs, not an invented successful tablet journey.

## Defects and minimal owner handoffs

| ID / priority | Finding | Exact files and suggested owner action |
| --- | --- | --- |
| BKS-ART-01 / high | The fallback library art contains the old brown-haired Michael in a hoodie, extra puppies and older character designs. It fails the latest portrait/group reference. | `public/assets/approved/stories.png`; used by `src/pages/ApprovedArtworkPage.tsx` and the reader fallback in `src/pages/ArchieStoryCollectionPage.tsx`. Books/approved-art owner must correct the existing scene against the actual references, preserving environment and readable UI. |
| BKS-ART-02 / high | The step-out/reader mascot is the older spiky-haired superhero with cape/heart emblem, not the approved group outfit/proportions. | `public/assets/images/archie-character-v2.png`, `src/components/ArchieCharacter.tsx`, and reader cover fallbacks. Shared character owner should supply one consistent approved asset/model; avoid unrelated global replacement by this QA worker. |
| BKS-NAV-01 / high | Web imports create `window.Capacitor`; `App.tsx` selects hash routing merely because the object exists. Direct pathname links then render the hash root. | `src/App.tsx`, router selection. Coordinator/navigation owner should distinguish native platform from the web shim, preserving native hash routes and web pathname links. Source explanation is consistent with the observed `web` result. |
| BKS-LAYOUT-01 / high | At 768px, each centred overflowing shelf places the first book at x=-96 while the shelf starts at x=56 and scrollLeft=0. A normal click fails. | `src/pages/ArchieStoryCollectionPage.tsx`, shelf container `sm:justify-center`. Agent 9 should align overflowing rows from the start and centre only when they fit; verify the first and last covers remain reachable. |
| BKS-LAYOUT-02 / medium | Phone heading extends 62px beyond the viewport. | Same reader file, top header flex row. Agent 9 should allow wrapping/shrinking and retest at 360px with large text. |
| BKS-MOTION-01 / medium | Step-out character is partly hidden behind the `z-10` panel and clipped by its parent. | Same reader file, welcome scene's character wrapper and selected-book panel. Agent 9 should reserve visible space for the complete character while preserving the button. |
| BKS-A11Y-01 / high | Reader/mascot movement continues under the operating system's reduced-motion setting. | Same reader file plus `src/components/ArchieCharacter.tsx`; coordinate with shared animation owner. Respect reduced motion for idle movement, page pans and transitions. |
| BKS-ART-03 / medium | Dedicated illustrations are not a clean continuity sign-off: the football picture gives a black dog a conspicuous white chest bib, and outfits/markings vary between books and group reference. | `public/assets/stories/archie-magic-key.jpg`, `archie-seaside.jpg`, `archie-forest.jpg`, `archie-helps-friend.jpg`. Preserve these scenes while the artwork owner reviews identity/markings individually. Michael, Rob and Soda are not present in these four images; their absence is not a passed identity check. |

The fallback affects **six books / sixty page states**: The Lost Puppy; A Visit to Orford Castle; Space Explorers; Animals Around the World; Healthy and Happy; Caring for Our Planet. The shared `/stories` entrance also uses that old family image. The runtime Space Explorers probe confirms the fallback path; source inspection establishes the other five. Each book currently reuses one background, so availability is not evidence of per-page illustrated scenes.

## Evidence and reproduction

New files owned by this follow-up:

- `agent-reports/AGENT-SOD-BOOKS-QA-ARTWORK-20260916.md`
- `docs/qa/books-artwork-20260916/browser-qa.cjs`
- `docs/qa/books-artwork-20260916/results.json`

Run the browser script from the repository root with Playwright and a compatible Chromium installed:

```bash
node docs/qa/books-artwork-20260916/browser-qa.cjs
```

It starts/stops its own Vite server, creates disposable browser contexts, rejects optional cookies inside those test contexts, blocks external/API traffic, and writes screenshots plus JSON to `/tmp/sodafom-books-artwork-qa`. `SOD_BOOKS_QA_OUTPUT` changes the evidence directory; `SOD_BOOKS_QA_VIEWPORTS='[]'` runs only the reduced-motion probe. Optional `SOD_BOOKS_CHROMIUM_MODULE` selects a locally installed compatible Chromium package. In this environment Playwright's standard browser download timed out, so Chromium 153 from `@sparticuz/chromium@153.0.0` was installed separately from the app. No application dependency was added.

Screenshots include phone/tablet/desktop shelves, phone/desktop openings and readers, direct-link failures, the tablet click failure and the reduced-motion reader. These are private review evidence delivered to Michael; no portrait/reference bytes are added to the public repository. There are no after-fix screenshots because this work preserves the coordinator's QA-only boundary.

**No merge, no deployment, no main/master changes, no production settings changes, no Systems 797 changes, and no overwriting other agents' work.** The next dependency is Coordinator Codex/Agent 9 assigning the shared-file fixes and the approved artwork owner supplying corrected assets. Retest those exact commits and then perform a real phone/audio check.
