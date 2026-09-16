# QA-FIX-04 — Reader repairs

For Michael Davis and Coordinator Codex. 16 September 2026.

## Scope and ownership

- Branch: `codex/qa-fix-04-books-20260916`.
- Base: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`.
- Narrow repair of the live-audit reader findings, with two local layout repairs confirmed in the existing PR #36 report.
- Preserves Agent 9's shelf/reader work and the PR #24 playback fixes already integrated into stable. No unrelated branch changes were imported.
- Owned files: `src/pages/ArchieStoryCollectionPage.tsx`, `src/pages/__tests__/BooksPlaybackQA.test.tsx`, and this report.

## New changes

1. **Magic Key opening now matches the existing illustration.** The committed image was visually inspected: Archie finds the key outdoors beside a garden path. Page 1 now says “on the garden path”; page 3 uses “Soon” to keep the outdoor opening continuous. No image bytes or private artwork were added or changed.
2. **Overflowing shelves start with the first cover visible.** The old `sm:justify-center` scroller could centre an oversized row beyond its reachable left edge. The new outer scroller contains an intrinsic-width row with a minimum width of the viewport. Books centre when they fit and scroll from the first cover when they do not.
3. **The shelf heading can wrap on phones.** Its panel takes a full row below the Reading button below the `sm` breakpoint (640px), and can shrink/wrap at larger sizes. The icon and back button retain their widths.
4. **Read-along regression coverage is stronger.** Tests now verify that both named page controls stay disabled during a turn. A new test checks that a manual page turn stops recognition/narration, clears spoken-word state, and rejects a late recognition result from the previous page.

## Already fixed in stable — not new repairs

- `Previous page` and `Next page` already have accessible names in the stable source. Existing tests exercise these exact button names through all ten books. Those labels were retained.
- The decorative black dog incorrectly labelled Daisy is already absent from the stable reader. Its removal was retained; no replacement dog asset was introduced. This was coordinated with QA-FIX-05.
- Existing microphone shutdown, pending-turn cancellation, startup-failure handling and chunked speech matching remain in place.

The audit tested an older deployment. These existing stable fixes still need to reach the chosen deployment through the coordinator's normal review process; this branch does not deploy them.

## Executed validation

| Check | Result | Scope |
| --- | --- | --- |
| `node node_modules/vitest/vitest.mjs run src/pages/__tests__/BooksPlaybackQA.test.tsx --reporter=verbose` | PASS — 6/6 | All ten books and 100 page positions; named and bounded page controls; chunked speech; page-change cancellation; late results; unmount cleanup; book-switch cancellation; microphone-start failure. |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS | Repository TypeScript check after these changes. |
| `git diff --check` | PASS | No whitespace errors. |
| Current shelf rendering at 360px / 768px / 1280px | NOT TESTED in this worker | Prior PR #36 gives concrete before-state failures. The new CSS addresses their cause, but component tests do not establish rendered widths or visual acceptance. Coordinator browser review remains required. |
| Real microphone, audible narration, physical phones/tablets | NOT TESTED | Speech recognition, TTS and the shared character component are mocked in the component tests. |

Dependencies were shared from the coordinator's frozen install. `pnpm exec` attempted an automatic install because of the worktree symlink and stopped before changing the directory; tests were then run directly through the installed Vitest CLI. No package files or lockfiles changed.

## Remaining limitations and handoffs

- Recheck the first and last shelf covers and document width at 360px, 768px and 1280px, including enlarged text. Layout changes are not a whole-section completion claim.
- The welcome scene's character/panel overlap and reader/shared-character reduced-motion behaviour from PR #36 remain outside this narrow repair. Shared animation work needs coordinated ownership.
- Six books still use the old shared library illustration; dedicated story images repeat across their ten pages. Aligning the Magic Key opening does not make every page individually illustrated.
- Existing shared Archie artwork and the older Michael/family fallback need approved, consistent replacement assets. QA-FIX-05 is reporting that artwork work; this branch does not publish private portrait/reference images.
- Real narration identity, read-along accuracy and physical-device interaction remain unverified.

**No merge, no deployment, no main/master change, no force push, no production setting change, no GitHub post, and no Systems 797 change.**
