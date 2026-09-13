# Agent 20 — Sticker books

Date: 13 September 2026  
Repository: drmichael1982-crypto/Sodafom.uk  
Branch: agent20/sticker-books-20260913  
Starting master commit: 058097f78077015980460c0b359903fda5aa83a6

## Scope and entry point

This branch adds an interactive sticker book, not a colouring book. The existing home-screen “Archie's Sticker Book” button previously opened `/rewards`. It now opens `/?activity=sticker-books` through the existing home component. Only an import, that one hotspot destination and a conditional render were added to `ApprovedArtworkPage.tsx`. The original file was reconstructed and matched to its Git blob SHA before applying this narrow change.

Rewards, colouring books, games, lessons, books, scanners, accounts, payments, AI, admin, school features, voice systems, global routing and deployment configuration are unchanged. No existing artwork files were added, replaced or deleted. No dependency or lockfile changes. No merge, pull request or deployment was requested by this implementation.

## Implemented

- A colourful, responsive editor with 15 reusable stickers and five themes: a blank adventure, woodland, seaside, story time and inventors/explorers.
- Tap to add; drag from the tray; select, move, resize, bring forward and remove placed stickers. Mouse, touch and keyboard/button alternatives are provided.
- Multiple pages, editable titles, independent themes, a page selector and an explicit **Save all pages** button. Limits are 12 pages and 60 stickers per page.
- Undo/redo for editing, clearing and page deletion, with destructive-action confirmation. Drag cancellation restores the original placement. Switching page does not discard the other pages.
- Simple creative prompts, with an optional more detailed “Story challenge”. No age, birthday or personal profile collection is introduced.
- Clear saved/unsaved feedback, Back home confirmation and browser-unload warnings. Storage-denied, full-storage, damaged-save and sequential other-tab conflict handling do not falsely claim a successful save.
- Accessible labels, live feedback, large controls, keyboard arrow movement and Delete removal. Reduced-motion support and an informative missing-image fallback.

## Existing artwork and its limits

The catalogue reuses the repository's Archie image and established friend images. The Animals category currently contains Ziggy the dinosaur. Objects & cards contains Soda Bot and three whole illustrated story cards (magic key, library and seaside). These are not newly drawn or extracted animal/object cut-outs. A wider standalone animal/object selection remains dependent on additional approved artwork.

The source paths were checked against repository trees and the existing character pages. Real artwork appearance, transparency, cropping and visual approval were not reviewed in the browser tests: those tests deliberately substituted tiny image fixtures. No claim is made that every image is a transparent sticker cut-out.

## Saving and privacy

This first version saves one book per browser profile to `sodafom_sticker_books_v1` in localStorage. It does not save to Railway, an account or the cloud, and it does not sync across devices. Anyone using the same browser profile can see the book; an on-page notice explains this and asks children not to include private information. This is not parent/child access-controlled storage. Existing account and child-profile code is untouched.

Only allowlisted sticker/theme identifiers, positions, sizes and page titles are persisted. Saved image URLs or HTML are never trusted or restored; titles are rendered as text. Malformed saves are left unchanged unless replacement is explicitly confirmed. The editor accesses only its own storage key and adds no analytics, uploads, camera/microphone permissions, paid API calls or external data requests.

Save is explicit, not automatic. Save before changing routes: browser Back or another SPA navigation can bypass the editor's own Back home confirmation. Browser-unload warnings are also subject to browser behaviour. Clearing browser data removes saved pages. Sequential other-tab changes are detected, but localStorage is not transactional and simultaneous cross-tab writes cannot be guaranteed conflict-free.

## Tests actually run

**25 model/storage checks passed**, including isolated strict TypeScript compilation of the catalogue, model and DOM editor.

**26 isolated Chromium UI checks passed in offline mode**, covering tap/add, mouse dragging, out-of-page drops, placement movement, undo/redo, keyboard controls, resize/remove, categories, themes, multiple pages, explicit save/reload, clear/delete confirmation, cancelled drags, unsaved titles, simulated storage conflicts/quota failures/corruption, missing artwork, blocked storage, emulated touch, responsive widths from 320 to 1280 pixels, reduced motion, cleanup and lack of external data requests.

The test scripts are committed with the feature:

```sh
node scripts/test-sticker-books.mjs
python scripts/test-sticker-books-browser.py --offline
```

The browser script requires Python Playwright, Chromium and TypeScript. The Node script uses the project's TypeScript installation or an available `tsc` executable. No dependency changes are needed in this branch.

### Verification limits / checks still required

Normal browser navigation was blocked by the execution environment's managed policy. The offline test loaded the compiled isolated editor into an empty document, used embedded image fixtures and substituted in-memory storage and simulated cross-tab events. No policy was changed. Native browser storage persistence, normal HTTP mode and real-asset layout were not verified by that run.

The full repository and its installed dependencies were unavailable locally and network resolution failed. Consequently the full app build, full project type-check, ESLint, Vitest suite, React/router integration at runtime, real iPhone/iPad/Android hardware and Safari/Firefox were **not run**. TSX syntax transpilation and the narrow homepage diff were checked separately; these are not substitutes for a full app build. The final isolated checks have no failing assertions, but this is not a production-readiness or 100% app-wide pass claim.

Before any merge or deployment, run the full app checks, open the sticker hotspot with real assets, verify actual browser saving, review shared-browser privacy suitability and test physical mobile devices. Keep deployment subject to the owner's separate approval.
