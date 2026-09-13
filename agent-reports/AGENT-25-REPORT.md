# Agent 25 Recovery — Device Compatibility

## Status

Source files have been uploaded and content-verified through the authorised
GitHub connector. This report is the final branch document and is awaiting its
own upload and verification.

## Recovery basis

- Recovery branch: `recovery/agent25-device-compatibility-20260913`
- Current remote `main` base: `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Inspected legacy branch: `agent25/device-compatibility-20260913`
  (`055766dce66048511f87c7f1e817524dff5d1028`)
- The legacy branch diverged from current `main` and also contained unrelated
  app, Android, deployment, content, payment, AI and data changes. Its safe
  shared layout work was manually adapted; nothing was cherry-picked.

## Delivered scope

- Added a layout-only stylesheet, loaded after global styles, with safe-area
  variables, `100vh`/`100dvh` overlay limits, internal scrolling, wrapping,
  and small-screen padding for shared dialogs and sheets.
- Made shared dialog/sheet close controls at least 48 by 48 CSS pixels and
  reserved header space, without changing their event handlers or focus logic.
- Added non-behavioural class hooks to the shared Button, Dialog, Sheet and
  Tabs primitives. Standard controls may wrap long labels; caller-defined
  custom button heights are not reset.
- Added responsive/touch layout rules for shared tabs and the existing website
  header: safe-area gutters, a compact existing menu below 1280px or on short
  screens, wrapping account actions, readable logo sizing, and 48px targets
  for coarse-pointer/narrow layouts.
- Scoped header rules through the existing RootLayout website shell. Routes
  that do not render that Header are unaffected.
- Added a static CSS/TSX contract test that verifies stylesheet load order,
  safe-area/dynamic-viewport/wrapping/touch-target rules, absence of global
  `html`/`body` overflow masking, and all shared class hooks.

## Explicitly not changed

- No child data, storage, database, API, login/access rule, route, payment,
  admin, AI, scanner, seasonal-cover, default-branch, Railway, deployment, or
  `797` code.
- No artwork, asset, character, theme, content, event handler, or feature
  logic was altered.

## Verification

| Check | Result |
| --- | --- |
| Static device-compatibility contract fixture | Passed: 3 tests |
| Type check | Passed: `pnpm exec tsc --noEmit` |
| Focused ESLint | Passed with 0 errors; 1 existing unused `hydrateRoot` warning in `src/main.tsx` |
| Full Vitest suite | Passed: 19 files, 155 tests |
| Production client + SSR build | Passed: `pnpm run build` |
| Built CSS inspection | Device classes, `100dvh`, and safe-area rules emitted |
| Legacy Playwright viewport fixture | Not run: this environment has no Chromium executable or Python Playwright package |
| Physical device/browser testing | Not run; no claim of device certification |

The build emitted the repository's existing large-chunk advisory and third-party
Rollup comment warnings only; neither is caused by this recovery.

## Remaining checks before release

- Run actual routes against the fully compiled CSS in current Chrome, Firefox,
  Edge and Safari with keyboard navigation, Radix focus traps, nested overlays,
  and long labels.
- Test physical Android Chrome/WebView and installed Capacitor app, plus iPhone
  and iPad Safari, including rotation, browser chrome, keyboards, notches,
  real safe areas, text zoom, and touch targets.
- Re-run a controlled viewport fixture when Chromium/Playwright is available;
  it must not be mistaken for physical-device or full-route coverage.
- Check page-specific dialogs, games, lessons, books, scanner and floating UI
  after any future integration. This shared recovery deliberately avoids
  changing those feature implementations.
