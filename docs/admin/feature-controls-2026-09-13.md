# Owner feature controls — branch review

Branch: `admin-feature-control-panel-2026-09-13`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.
This branch must not be merged or deployed without a separate approval and the integration checks below.

## What is implemented

The existing authenticated Admin Hub's Founder tab (`/admin-panel?tab=founder`) now includes one feature control panel. The existing founder voice/change-request workflow, vouchers, promo codes, research-mode demonstration and notification sender are not duplicated or rewritten.

The catalogue contains all 13 requested areas in five groups. Nine controls govern **opening pages**, not underlying services: Learning, Games, Reading, Homework, Cinema, Rewards, Shop, Parent and Teacher. All nine default to the pre-existing availability (On). Turning one off shows a friendly unavailable page with a Home link on a subsequent online page visit. No activity, illustration, payment, login or AI-routing implementation was changed.

The other four controls are deliberately read-only. Ask Archie AI, Voice and Notifications show **Testing**, meaning their control integration is unfinished, not that their tests have passed. Sticker books shows **Coming soon** because no connected sticker-book route was identified in this master snapshot. These labels describe the controls, not a claim about whether those features work on another agent's branch.

Critical disables (Learning, Games, Reading, Homework, Parent, Teacher) require a native confirmation dialog. Cancel has initial focus; Escape cancels and restores focus. The server independently requires confirmation. A browser without dialog support cannot skip this check. No change is presented as saved until a valid server response confirms it.

## Limits of page switches

These switches are **not global kill switches, authorisation checks, parental restrictions, or an emergency safety system**. They do not stop backend APIs, Local AI/OpenAI, voice, reward earning, push delivery, checkout or subscriptions. Shop currently controls the `/sodafom-shop` entry page only; Cinema controls `/archie-theatre` only. Alternative legacy entry points outside the catalogue are not claimed to be disabled.

Existing menu/artwork buttons remain in place and lead to the friendly unavailable message when a controlled page is Off. Account management, owner access, subscription cancellation, notification opt-out, teacher sign-in and parent chore approvals remain reachable through their protected routes. Reading's `/subjects/reading` match takes precedence over the broader Learning `/subjects` match.

The single shared `RootLayout` boundary is the only integration outside the admin area. It checks on a new page visit, before mounting the activity. It does not poll or tear down an already-running activity when the owner changes a switch. A controlled server-rendered page initially renders the waiting message; React hydration, SEO implications and complete-app navigation must be reviewed before merge. Uncontrolled/protected pages are passed through immediately.

If an availability read fails, the page uses the last successful **public, in-memory** snapshot, or the original defaults if none exists. This deliberately permits existing offline activities instead of treating availability as a security restriction. A fresh/offline browser can therefore open a page whose owner setting was changed elsewhere. No cross-device immediate shutdown is promised. Controls themselves lock on load/save errors until reloaded. An uncertain save is never automatically retried.

## Storage and API

A single `admin_feature_controls` row holds JSON settings and a revision in the existing MySQL database. Only an authenticated admin read or write attempts `CREATE TABLE IF NOT EXISTS` and an insert-if-missing. Public reads are SELECT-only. No existing child/account/payment tables are altered. The original shared database client and schema file are untouched.

The new store rejects missing rows, malformed JSON and the existing DB client's empty fallback mock; these can never be reported as a successful save. An atomic `UPDATE ... WHERE revision = expectedRevision` prevents one window from overwriting another. Unknown stored fields survive an update, but only the known catalogue states are sent to the browser. No-op writes do not increment the revision.

To reuse the already-registered owner endpoint without editing shared server routing:

- `GET /api/admin/founder-changes?view=feature-controls`: existing admin authorisation required; no-store response.
- `GET /api/admin/founder-changes?view=feature-availability`: intentionally public, no-store, only known IDs/states/revision; no history, account data or secrets.
- `POST /api/admin/founder-changes` with `action: "set-feature-control"`: existing admin authorisation plus JSON content type, `X-Sodafom-Admin-Action: feature-control`, trusted Origin and strict body validation. Only one known connected key can be changed. No arbitrary environment/config updates.

Origin must be HTTPS and match the request Host or the origin of the existing server-side `BETTER_AUTH_URL`. HTTP localhost is accepted only in development. A packaged app or cross-origin frontend may need an approved integration with the existing CORS/cookie configuration; no broad origin allowlist or security relaxation was added. The web Admin Hub on its trusted HTTPS host is the intended owner interface.

Normal founder-change history/preparation/approve-for-development/reject requests retain their existing behavior. Feature controls do not create deployment requests or invoke GitHub/Railway.

## Tests actually run

**39 Node tests passed, 0 failed.** These include strict TypeScript checks on the model/client/service/DOM view; syntax transpilation of every new or modified TS/TSX file; all nine off/on round trips; single-key updates; malformed/unknown/prototype inputs; confirmation; protected/overlapping routes; unauthorised requests; Origin/content-type/header checks; simultaneous edit conflicts; failure-safe SQL adapter behavior; HTTP timeout/cancellation; offline public snapshots; existing endpoint dispatch; and page-boundary decisions/cleanup.

The SQL tests use an injected adapter, not a running MySQL server. Route tests mock the existing authorisation provider and database; they are not real-account sign-in tests. Boundary lifecycle tests use a small hook driver, not the full React runtime. These distinctions are intentional and must not be represented as full integration passes.

**29 Chromium browser scenarios passed, 0 failed.** These run the actual DOM view and scoped CSS entirely offline with a simulated API. They cover all nine switches, confirmed off/on, browser refresh with retained simulated server state, protected cancel/keyboard focus, repeated clicks, pending reads/writes, expired access, malformed responses, 403/409/500 responses, uncertain-save recovery without retries, missing dialog support, cleanup, and layouts at 320×740, 375×812, 768×1024, 1280×900 and 812×375. Controls were at least 44 pixels high; no horizontal overflow was detected in these viewports. Desktop screenshots were inspected visually. These are viewport tests, not physical device or Safari tests.

Browser network navigation was blocked by the execution environment. The final browser harness does not bypass that restriction: it uses an about:blank document, in-memory scripts/styles and simulated fetch responses. No live Sodafom URL, production account, payment service, camera, microphone or AI provider was contacted.

Re-run in a checkout with TypeScript (already a project dependency):

```sh
node --test scripts/test-admin-feature-controls.mjs
python scripts/test-admin-feature-controls-browser.py
```

The browser suite needs Python Playwright and Chromium. Set `CHROMIUM_PATH` if needed. Optional `ADMIN_TEST_SCREENSHOTS` writes local screenshots to the chosen directory. The test helper can use the project's TypeScript or an installed global TypeScript. Temporary browser fixtures are removed after the suite.

## Required before merge / production

1. Run the full installed-project build, type-check, lint and existing Vitest suite. They were not available in this isolated checkout. The available Node runtime was 22.16.0, below the repository's declared minimum 22.22.0; the app build must run on its supported version.
2. Verify real MySQL creation permissions, durable persistence across server restart, concurrent updates and backup/rollback of the new settings row in a non-production database. No live database was used here.
3. Run the complete React/React Router app, including server rendering/hydration, controlled-route navigation, founder sign-in, session expiry, parent cancellation/opt-out paths, and other agents' shared-layout changes. Review the initial waiting-page effect on server-rendered content/SEO.
4. Coordinate actual AI, voice, notification and sticker-book integrations with their owning agents. Do not change these read-only labels to On/Off until their controls genuinely enforce the stated scope.
5. Test Safari/iPhone, Android WebView and packaged-app cookie/CORS behavior where owner access is intended. Do not loosen origin checks merely to make a failing test pass.

Scope conflicts to review: the two-line RootLayout integration, two-line FounderVoiceControl mount, and the two founder-changes endpoint dispatch additions. No feature page, artwork, deployment file, credential, package/lock file or other agent's branch was edited.
