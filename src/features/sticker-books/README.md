# Agent 20: interactive sticker books

Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.
Branch: `agent20/sticker-books-interactive-20260913`.
Status: implementation and local code checks complete; browser/full-app verification remains required. Not deployed or merged.

## What is included

A separate `/sticker-books` page with an authenticated child selector, four age-adapted scene prompts, and twelve existing character illustrations. Children can tap to add, drag from the palette, reposition, resize, remove, name pages, change themes, switch pages, undo, and save/reopen their creations. Keyboard arrows/Delete and labelled movement buttons offer alternatives to dragging. A book holds up to 20 pages, with up to 40 stickers per page. Reduced-motion styling and missing-image text fallbacks are included.

The themes are Friends in the park, Story time, Dinosaur adventure, and Robot workshop. Animal/object categories deliberately use only the existing Ziggy dinosaur and Soda Bot assets. This is not a claim that a larger animal/object artwork library was available. Existing illustrations are reused, not generated, cropped, replaced or redesigned. Backgrounds are simple CSS colours/patterns, not new illustrated scenery. There is no paid AI, star spending, reward unlocking or payment handling.

## Mounting without changing unrelated features

The existing Home sticker-book hotspot opens `/rewards`. The sticker route adapter adds an Open sticker books doorway above the original Rewards element and registers `/sticker-books`. Rewards and all other route objects retain their existing behaviour. Only one import line changes in each of `src/App.tsx` and `src/entry-server.tsx`, so client and server use the same adapter. The original `src/routes.tsx`, Home artwork, Rewards implementation, colouring games, authentication, payments, server APIs, deployment files, books and other agents' branches are untouched.

React owns a host div. `editor.ts` owns the sticker DOM within that host and cleans up its listeners on unmount. No new production dependency is required.

## Storage and privacy

Saved books use browser localStorage, separately keyed by the authenticated account and a child returned by the existing authenticated GET `/children` endpoint. No child ID is taken from a URL or another browser-storage key. Profile changes unmount the old editor. Saved data contains only the book namespace, page titles, theme IDs, fixed catalogue IDs, and positions/sizes; names/photos are not uploaded by this feature.

This is device/browser-local persistence, not cloud sync or encrypted storage. Anyone with access to that browser profile or its developer tools can inspect localStorage. Clearing browser data removes the books. The existing account security is unchanged; this feature is not a separate sibling PIN or server-side authorization layer. A parent-signed-in session can select its authorized children.

Saves validate schema, ownership, IDs, limits and numeric values; saved image URLs are never rendered. Corrupt/newer books are preserved rather than silently overwritten. Quota/restricted storage keeps the page editable with an explicit unsaved warning. Start again requires confirmation. Stale writes are refused when stored bytes changed, but localStorage is not a transactional multi-tab database and simultaneous races are still possible. Page names save while typing. Unsaved-change warnings cover browser unload, the feature Back link and its child selector; other app-wide navigation is not intercepted.

## Checks actually run on 13 September 2026

- Strict TypeScript check of `model.ts` and `editor.ts`: passed.
- `model.node-check.mjs`: 26 passed, 0 failed.
- `integration.node-check.mjs`: 10 passed, 0 failed. These are JSX syntax/transpile checks, adapter tests with a small mocked route/React runtime, exact-base-file scope hashes, and a catalogue allowlist check. They are not full React integration tests.
- Verified the twelve asset paths against the connected GitHub tree and existing character components at the pinned base. Actual image rendering was not validated locally; the full public asset directory was not present in this workspace.
- Attempted the isolated browser harness. Chromium refused its local URL with `net::ERR_BLOCKED_BY_ADMINISTRATOR` before any interaction check ran. Browser checks are **blocked, not passed**. The included harness uses stub image bytes and is not an artwork-quality test. It has not completed a successful run in this environment.
- Full dependency installation, full-app build/Vitest suite, semantic checking against the app's React dependencies, real authenticated profile selection, SSR hydration, touch/keyboard interaction, physical iOS/Android devices and visual layout remain unverified. Direct repository/dependency network access was unavailable; the connected GitHub API was used for the branch and files.

Run from a full checkout with its development dependencies installed:

```sh
node --experimental-strip-types --test src/features/sticker-books/model.node-check.mjs
node --test src/features/sticker-books/integration.node-check.mjs
npx tsc --strict --noEmit --target ES2022 --module ES2022 --moduleResolution bundler --lib ES2022,DOM,DOM.Iterable src/features/sticker-books/model.ts src/features/sticker-books/editor.ts
```

The browser harness additionally requires Python Playwright, Chromium, and `tsc` on PATH:

```sh
python src/features/sticker-books/browser-check.py
```

The Node check files deliberately avoid `*.test.*` names so the existing Vitest suite does not accidentally collect Node's test runner. No package scripts or lockfiles were changed.

## Required checks before any merge or release

Run the normal full build, type-check and test suite, then open Home > Archie's Sticker Book > Open sticker books. Verify sign-in, real authorized child switching, account sign-out/switching, SSR reload, and Capacitor navigation. Use the real art on desktop and phone: add/drag/reposition/remove; keyboard and touch; page naming/undo; all four themes; save/reopen; resize/orientation; no horizontal overflow. Verify storage denial/quota, corrupt save preservation, stale-tab conflicts, the child/page limits, and image failures. Confirm Rewards, colouring games and all other routes remain unchanged. Review approved artwork suitability in the rendered sticker palette. Do not treat this branch as production-ready until those checks pass. No merge or deployment is authorized by this work.
