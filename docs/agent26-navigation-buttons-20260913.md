# Agent26 — Navigation and Buttons

**Status: PARTIAL. Recovery-button fixes tested in isolation; complete mobile and desktop navigation acceptance is NOT finished.**

Date: 13 September 2026  
Repository: `drmichael1982-crypto/Sodafom.uk`  
Branch: `agent26/navigation-buttons-20260913`  
Starting branch: `master`  
Starting commit: `058097f78077015980460c0b359903fda5aa83a6`

## Fixes

The not-found page previously sent Go back directly to `navigate(-1)`, even on a direct visit with no previous router entry. It now goes back when a positive integer router history index is present and otherwise replaces the broken URL with the existing Home route. It deliberately does not use `history.length`, which can include pages outside the app. This uses BrowserRouter/HashRouter's `history.state.idx` convention; actual installed-router/browser compatibility still needs the acceptance checks below.

Surprise me previously returned without navigating when the optional game catalogue was empty. It now opens the existing `/games` page in that case. Invalid catalogue entries and malformed slugs are excluded from random navigation and suggested-game links; a malformed catalogue no longer reaches the array shuffle. This is syntax validation of slugs, not proof that every valid-looking slug has a registered route.

Both recovery buttons now explicitly use `type="button"`. No wording, artwork, layout classes, animations, game content, scoring, auth, subscription, AI or permissions were changed.

## Changed files

- `src/pages/_404.tsx` — recovery navigation only.
- `src/lib/navigation-recovery.ts` — pure destination/slug helpers.
- `scripts/test-navigation-recovery.mjs` — isolated Node regression checks.
- `docs/agent26-navigation-buttons-20260913.md` — this report.

## Checks actually run

| Check | Result |
| --- | --- |
| Original `_404.tsx` integrity | Git blob hash matched `0a44315ed290d55ec98b3f62fdc7b62a7e91a64d` before editing. |
| Node recovery regression suite | **19 passed; 0 failed.** Includes a source-wiring check, not a rendered component test. |
| Strict TypeScript check of `navigation-recovery.ts` | Passed. |
| TypeScript syntax/transpilation of edited `_404.tsx` | Passed; not a dependency-resolved whole-app type check or build. |
| Existing `_404.tsx` className values | Unchanged. |
| Full application build / Vitest suite | Not run: full checkout and app dependencies unavailable. |
| Mobile and desktop browser journeys | **Not run.** No installed Playwright browser executables; no physical device or emulator tests. |

The isolated checks ran with Node 22.16.0, older than the project's declared Node >=22.22.0. Repeat in the project's supported environment before acceptance.

Re-run the added regression suite from a complete checkout with the project's supported Node version:

```bash
node --experimental-strip-types --test scripts/test-navigation-recovery.mjs
```

## Source review boundary

Read the app router setup, RootLayout, router-hooks, FeaturePageShell, the complete ApprovedArtworkPage and not-found page, the beginning of Header, and relevant portions of routes.tsx. The existing Home (`/`) and Games (`/games`) fallback destinations were confirmed in routes.tsx. This was not a complete read of every page, route or handler.

The GitHub connection allowed source reads and branch writes. A local `git clone` failed with `Could not resolve host: github.com`; an archive download also failed. Selected source files were reconstructed from GitHub reads for isolated testing. No browser test results are inferred from source inspection.

## Outstanding acceptance checks

1. On desktop browsers, Android and iPhone browsers, and the packaged HashRouter app, test direct visits to an invalid URL, entry from an outside page, refresh, internal navigation, Go back, browser Back/Forward, and Home. Confirm fallback replaces the broken URL and that a real previous in-app route still works.
2. Click every existing Home hotspot, shared menu, icon, Next/Previous control and internal link. Check correct destinations, query parameters, non-blank rendering and return paths, in portrait and landscape. Confirm keyboard and touch activation.
3. Check both normal and missing/malformed game data. Confirm every game selected from the real catalogue has an existing registered route and does not loop back to not-found.
4. Check sign-in-dependent parent, teacher and admin navigation with authorised test accounts, without changing access controls or submitting payments, deletions, reports or other live actions.
5. Coordinate ownership: the inspected Home mapping currently points Archie's Sticker Book to `/rewards`; do not invent a new sticker route before Agent20's work is reviewed. Settings links pass `section=` parameters to the profile page; their feature behaviour was not verified or changed.

## Isolation

Only the Agent26 branch is to receive this commit. No merge, pull request, Railway deployment, production configuration change, or update to master/main was requested or performed. Other agents' branches and features are outside this patch. Agent27 was not started.
