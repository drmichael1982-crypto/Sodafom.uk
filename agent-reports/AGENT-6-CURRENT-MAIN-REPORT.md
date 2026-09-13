# Agent 6 Current-Main Recovery Report

- **Agent number:** 6
- **Original task:** Re-evaluate Museum Explorer on current `main`, retaining the existing experience and correcting only a verified immersive-layout or accessibility gap.
- **Recovery branch:** `recovery/agent6-current-main-museum-explorer-20260913`
- **Base:** remote `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- **Old reference reviewed only:** `agent-6-full-app-qa-2026-09-13` at `6aa9ddb24a404f73a027cb2e678470501a95424f`
- **Pushed:** Yes — this branch’s application change, focused test, and report were uploaded and content-verified through the authorised GitHub connector. No PR, merge, or deployment was created.

## Completed

- Audited the old Agent 6 fix before porting anything. Its only Museum change added `/museum` to an obsolete legacy immersive-route list; it was not copied because current `main` does not use that page route.
- Verified current Museum Explorer is an internal screen of the immersive `/` route. `RootLayout` already suppresses the legacy header, footer, accessibility toolbar, Archie helper, and mobile CTA there, so the old route-list fix is already satisfied by the current architecture.
- Preserved the existing full-screen Museum experience, Home return control, responsive gallery grid, six galleries, and 36 artefacts.
- Added the one verified accessibility correction: the Museum “Ask Archie” text input now has the explicit accessible name **“Ask Archie to open a museum.”** The visual design and request behaviour are unchanged.
- Added a focused jsdom interaction test: open Museum Explorer, find the named input, type “Viking museum,” activate the labelled request control, and confirm Viking artefacts appear.

## Privacy and scope confirmation

- The change only adds an accessible name to an existing local text input and a focused test. It does not add or alter camera, microphone, image, speech, AI, account, payment, database, analytics, or network behaviour.
- No homework/scanner flow, raw image handling, parent/child permissions, seasonal cover, admin, payment, AI-routing, default-branch, Railway/deployment, or 797 work was changed.
- No production database, external API, physical device, or real child data was used.

## Seasonal-cover coordination

The seasonal-cover recovery also changes `src/pages/SodafomAdventurePage.tsx`. This recovery changes only the Museum `ASK ARCHIE` input attribute in that shared file and adds `src/pages/SodafomAdventurePage.museum.test.tsx`. When reconciling branches, retain both the seasonal work and `aria-label="Ask Archie to open a museum"`; do not replace either file wholesale.

## Tests performed

| Command | Result |
| --- | --- |
| Read-only Museum route/layout/source audit | Passed: immersive root route confirmed; 6 galleries and 36 artefacts confirmed |
| `pnpm vitest run src/pages/SodafomAdventurePage.museum.test.tsx` | Passed: 1/1 focused interaction test |
| `pnpm exec eslint src/pages/SodafomAdventurePage.tsx src/pages/SodafomAdventurePage.museum.test.tsx` | Passed: 0 errors; 1 pre-existing `react-hooks/exhaustive-deps` warning in the existing page |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed (existing large-client-chunk advisory and third-party Rollup annotation notices) |
| `git diff --check` | Passed |

`pnpm install --offline --ignore-scripts --no-lockfile` supplied local dependencies without changing tracked manifests or the lockfile.

## Deliberately omitted stale or out-of-scope integrations

- No separate `/museum` route or old immersive-route-list entry was added: current Museum Explorer belongs to the root immersive screen, and creating a duplicate route would conflict with the current route/UI model.
- No replacement of the existing Museum layout, art, content, voice behaviour, Home navigation, or gallery interactions.
- No seasonal-cover, scanner, voice/audio, payment, admin, AI, database, deployment, default-branch, or 797 change.

## Real browser and accessibility checks still required

- On current Chrome, Safari/iOS, Firefox, Android WebView, and desktop/mobile screen readers, verify the input’s announced name, visible keyboard focus, touch target, Enter-key activation, and the labelled “Open requested museum” control.
- On narrow mobile/tablet layouts, verify Museum gallery doors and artefact cards remain reachable, correctly reflow, and retain sufficient colour contrast.
- After the seasonal-cover recovery is integrated, verify both the seasonal UI and Museum Explorer at `/` together, manually reconciling the shared Adventure page rather than overwriting either branch.

## Safety confirmation

`main`/`master` was not merged or changed. No PR, deployment, Railway action, production database operation, paid-AI action, payment action, or external API operation was made.
