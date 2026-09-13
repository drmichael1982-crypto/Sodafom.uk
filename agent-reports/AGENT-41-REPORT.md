# Agent 41 Report

## Agent number
41

## Original task
Create a new branch from `master` and work only on the existing admin system. Build a clear owner admin control panel that lets the owner toggle existing features without editing code, grouped logically across Learning, Games, Reading, Homework, Ask Archie AI, Voice, Cinema, Sticker books, Rewards, Shop, Notifications, Parent and Teacher. Reuse existing systems rather than duplicating them; show clear On, Off, Testing and Coming soon states; require confirmation before disabling key features; do not expose secrets; do not change other agents' features; test all changes. Do not merge or deploy.

## Exact branch name
`admin-feature-control-panel-2026-09-13`

## Latest completed-work commit ID before this handoff report
`8306d079a66e0496e2a7665b2c6e9204e910c2b4`

The official handoff commit is the commit containing this report and is therefore the branch HEAD after this file is committed. A Git commit cannot contain its own final SHA inside itself because changing the file changes the SHA; use the branch HEAD as the exact report-commit ID. The final chat handoff also states that exact pushed HEAD.

## Pushed
Yes. The implementation commit above was pushed before this report was added. This report is being committed and pushed on the same branch as the official handoff.

## Completed
- Added one grouped owner feature-control panel inside the existing authenticated Founder area of the Admin Hub.
- Added the 13 requested feature areas without duplicating existing implementations.
- Added working page-opening On/Off controls for Learning, Games, Reading, Homework, Cinema, Rewards, Shop, Parent and Teacher.
- Added explicit read-only status for unfinished integrations: Ask Archie AI, Voice and Notifications show `Testing`; Sticker books shows `Coming soon`.
- Added confirmation before disabling key controls: Learning, Games, Reading, Homework, Parent and Teacher.
- Added revision-safe saving so one Admin window cannot silently overwrite another.
- Added strict validation of known feature keys and boolean values only.
- Added trusted-origin, content-type and owner-authorisation checks for writes.
- Added friendly unavailable-page handling for controlled routes without deleting saved work.
- Kept account management, subscription/cancellation, notification opt-out, teacher login, parent chore approvals and Admin access outside the feature gate.
- Reused the existing `founder-changes` Admin endpoint and existing owner authentication instead of adding a competing Admin/security system.
- Added a dedicated Admin settings row in the existing database layer; no child, account or payment table was changed.
- Added isolated Node and Chromium test harnesses plus a detailed engineering review document at `docs/admin/feature-controls-2026-09-13.md`.

## Tests performed
### Node / logic tests
39 tests passed, 0 failed.

Covered:
- strict TypeScript checks for the new model/client/service/DOM view;
- syntax transpilation for new and modified TS/TSX files;
- all nine connected controls off/on round trips;
- preservation of unrelated settings;
- confirmation requirements;
- stale revision handling and simultaneous-edit conflicts;
- malformed, unknown, prototype and extra-field input rejection;
- protected route exclusions and overlapping route selection;
- unauthorised reads/writes;
- origin, content-type and action-header checks;
- public availability data minimisation;
- failure-safe SQL adapter behaviour;
- no false success on empty/mock database results;
- HTTP timeout and abort handling;
- offline/last-known availability behaviour;
- existing founder-change endpoint dispatch compatibility;
- page-boundary lifecycle, cleanup and stale-request handling.

### Chromium browser scenarios
29 scenarios passed, 0 failed.

Covered:
- all nine connected switches;
- confirmed off/on flows;
- simulated persistence across reload;
- keyboard confirmation and Escape cancellation;
- focus restoration;
- rapid repeated clicks;
- pending reads and pending writes;
- 401, 403, 409 and 500 responses;
- malformed responses;
- uncertain-save recovery without automatic retry;
- unsupported dialog fallback;
- cleanup/unmount behaviour;
- responsive viewports 320x740, 375x812, 768x1024, 1280x900 and 812x375;
- no horizontal overflow in those tested viewports;
- minimum 44px control heights.

## What passed
- 39/39 Node tests.
- 29/29 isolated Chromium browser scenarios.
- All nine connected controls changed only their own setting in tests.
- Critical disables required confirmation both in the interface and server-side validation.
- Failed/uncertain saves did not report false success and locked further changes until reload.
- Private test/server values were not rendered in user-facing Admin error messages.
- Branch stayed isolated from `master` and is one implementation commit ahead of the specified master base before this report commit.

## What failed
No failures in the tests that were actually run.

The following were not available or intentionally not claimed as test passes:
- full installed-project build/type-check/lint/existing Vitest suite;
- live React/React Router end-to-end integration;
- real founder-account sign-in/session-expiry tests;
- real MySQL persistence/restart/backup tests;
- production or Railway tests;
- physical iPhone/Safari/Android WebView tests;
- live AI, microphone, notification, payment or camera tests.

## Still needing work
- Connect Ask Archie AI, Voice and Notifications to their owning service integrations before those controls can honestly become On/Off switches.
- Connect Sticker books after its feature/route is present on the integration branch.
- Run the repository's full build, lint, type-check and existing test suite on the supported Node version.
- Verify the new Admin settings storage against a real non-production MySQL database, including restart persistence, backup and rollback.
- Test full React routing, SSR/hydration and real Admin authentication/session expiry after final branch integration.
- Test intended Admin access on Safari/iPhone, Android WebView and any packaged app that must cross origins; do not weaken the trusted-origin checks simply to pass those tests.
- Review the waiting-page behaviour for controlled routes and any SEO impact before production.

## Shared files / possible conflicts at merge
The following existing shared files were intentionally touched and need conflict review if other agents changed them:
- `src/components/FounderVoiceControl.tsx` — mounts the feature panel in the existing Founder area.
- `src/layouts/RootLayout.tsx` — adds the shared page-opening availability boundary.
- `src/server/api/admin/founder-changes/GET.ts` — adds namespaced feature-control read dispatch while retaining existing history behaviour.
- `src/server/api/admin/founder-changes/POST.ts` — adds namespaced feature-control write dispatch while retaining existing founder-change behaviour.

All other main feature-control implementation files are new under:
- `src/components/admin/`
- `src/server/admin-feature-controls/`

Potential integration conflicts:
- any agent changing the same Admin Founder component;
- any agent changing RootLayout or global routing/gating behaviour;
- any agent changing the founder-changes endpoint;
- AI, voice, notification or sticker-book agents, because their controls are deliberately read-only until their branches are integrated.

## Merge and deployment confirmation
- `master` was **not merged** into this branch after the branch was created from the specified master commit.
- This branch was **not merged into master**.
- **Nothing was deployed to Railway**.
- No deployment action was performed.

This branch plus this report file is the official Agent 41 handoff.
