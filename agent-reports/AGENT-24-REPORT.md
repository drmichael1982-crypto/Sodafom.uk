# Agent 24 — Performance and Speed Recovery Report

**Recovery branch:** `recovery/agent24-performance-speed-20260913`
**Current-main baseline:** `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
**Source reviewed:** `agent24/performance-speed-20260913` at `af9779972248210d859a3db831066e9dcdac1881`
**Pushed:** Yes — published only on this dedicated recovery branch; no PR, default-branch merge, or deployment.

## Recovery decision

The source branch was based on an obsolete master line and diverged from current main (87 commits ahead and 23 behind). This recovery was rebuilt from current main and ports only isolated, current-compatible UI performance work. It does not change child data, security, routes' visible paths, payments, admin, AI, scanner, Railway, deployment, default branches, task 797, or any external asset.

## Included improvements

- Converted the 130 independent current-main game routes from eager imports to React Router route-level lazy modules. Existing paths, default component exports, and route behavior are preserved; the existing spinner is used for initial deep-link hydration fallback.
- Added a pooled, event-driven visibility helper for decorative mascot work. Archie/Soda/Bella/Rocky aura/body loops and the speaking-mouth timer suspend when off-screen, in a hidden tab, or during pagehide, then resume when visible. It does not alter lesson/game clocks, speech playback, network requests, or stored data.
- Added native image loading/decoding hints and explicit image dimensions to the shared mascot, while preserving asset paths, artwork, alternative text, and visible animation timing. Callers can opt out with `loading="eager"`.
- Added focused offline regression coverage for route-module targets, visibility lifecycle cleanup/fallback, and changed-source syntax/contracts.

## Deliberately not ported

- The old branch's lesson, reading, and learning-arena route mappings are not present on current main, so they were not recreated or inferred.
- No image files were added, deleted, resized, recompressed, or fetched; responsive-asset redesign needs separate visual review.

## Validation completed

| Check | Result |
| --- | --- |
| `node scripts/agent24-performance.test.mjs` | Passed — 3 focused checks; confirms 130 game modules are route-lazy and resolve locally, plus visibility lifecycle/fallback coverage |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed — client and SSR builds emitted separate game chunks; no measured production speed claim |
| Focused ESLint on changed files | No errors; three pre-existing unused-import warnings in `src/routes.tsx` |
| `git diff --check` | Passed |

## Current-main lockfile limitation

`pnpm install --frozen-lockfile` is currently blocked because `package.json` and `pnpm-lock.yaml` have mismatched dependency specifications. A no-write local install (`pnpm install --no-frozen-lockfile --lockfile=false`) was used solely for this recovery's validation. Agent 1's separate build repair remains the first dependency in any later approved integration branch.

## Real-device and network checks still required

1. Measure fresh and cached home/deep-link loads on throttled desktop and real low-end mobile networks, including LCP, INP, CLS, and actual chunk waterfalls.
2. Verify BrowserRouter, Capacitor/Android WebView, and iOS Safari navigation directly to representative lazy game URLs, including offline/slow-network failure and retry behavior.
3. Check visual loading and image quality on real devices; keep above-the-fold mascot instances eager where lazy loading would harm LCP.
4. Profile long sessions with several mascot instances, off-screen scrolling, background-tab/pagehide restoration, and memory usage.

No production database, network service, deployment, or external asset calls were made during this recovery.
