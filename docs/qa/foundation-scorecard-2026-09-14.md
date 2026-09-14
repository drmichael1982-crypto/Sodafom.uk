# Children's Sodafom: first repair and foundation scorecard

Date: 14 September 2026. Scope: `drmichael1982-crypto/Sodafom.uk` only.

## Straight answer

The app is deployed, but that does not establish that all its features work.
There is no defensible whole-app completion percentage yet: there is not a
complete, tested acceptance checklist for all lessons, accounts, devices and the
agreed visual design. The percentages below have explicit, narrow denominators.

The first changes repair authentication endpoint selection, stale-session
recovery and badges ownership lookup, and start the shared Victorian shop data
foundation. They are review work, not an approved production release.

## Traffic lights

| Area | Signal | Measured result | What remains |
| --- | --- | --- | --- |
| Uploaded backups | Green: checked | 4/4 outer ZIPs passed integrity/path checks: 100%; two are exact duplicates | Preserve useful differences, especially nested Android/lesson recovery files |
| Railway deployment | Green: deployed, not feature-certified | App and MySQL both reported successful deployments: 2/2 | End-to-end feature checks and post-release log verification |
| First-pass focused checks | Green: isolated tests | 50/50 passed: 100% of these tests only | Real auth, MySQL, browser and device integration |
| Login/session reliability | Amber: patched for review | Same-origin web auth, corrected recovery URL and blocked-storage handling | Production sign-in/sign-up/reset/logout and phone cookie checks |
| Child badges | Amber: patched for review | Corrected `parent_id`; 12 authorization/input/statistics checks passed | Test against intended database; verify live logs after approved release |
| Victorian shops | Amber: foundation only | Five planned shop definitions; 11 registry tests passed | Street/interiors, matching approved art, UI wiring and themed activities |
| Newly planned 3D shop scenes | Not built in this pass | 0/5 finished scenes: 0% of these five new scenes | Complete visible, accessible, device-tested scenes |
| Photo/homework | Red: confirmed fault still open | Railway recorded an oversized request failure for `/api/ai-teacher/read-page` | Bounded upload/compression/error handling and route-flow verification |
| Paid AI/vouchers | Red: not ready for use | Existing paid-AI guard remains enabled; vouchers were reported disabled | Server-verified billing/credits and tests before enabling paid use |
| Security and adult shopping | Red: further work required | Credentialed CORS reflects unlisted origins; CSRF check is disabled; existing affiliate page needs review | Cross-origin authorization tests and server-verified adult purchase boundary |
| All games, lessons, Android/iPhone | Grey: not certified | No comprehensive browser/device test completed here | Full age/difficulty, scoring, accessibility, audio, navigation and device matrix |
| Full build/type check/test suite | Blocked | Vite, TypeScript and Vitest unavailable in this local dependency environment | Run unchanged build/type-check/full tests in a configured development environment |

Green means the stated narrow check succeeded. It does not mean the entire area is
complete or safe for release. These percentages must not be averaged into a
whole-app completion figure.

## Source and deployment baseline

- Repair baseline: master commit `058097f78077015980460c0b359903fda5aa83a6`.
- Its 778 source-tree blobs were verified against the local baseline before repairs.
- Railway project: `affectionate-essence`; service: `Sodafom.uk`; environment: production.
- Observed deployment: `7dd2cc1b-ba98-4c9c-b15a-ff21edbe5240`, successful, created 12 September 2026 at 22:03:46 UTC, on that exact commit.
- Railway service configuration explicitly tracks `master`. This pass does not merge into or update `master`, change Railway configuration, run migrations or request a deployment.
- No credentials, secret values or real child records were collected for tests.

The two main ZIPs are byte-identical and match the inspected GitHub main tree.
The uploaded master ZIP is older than the deployed master. The dated latest ZIP
contains an additional, substantially different nested backup, including native
Android source and recovery material, but it lacks 22 bracket-named dynamic route
files present in the comparison baseline. It must not replace master wholesale.
All uploaded originals remain unchanged.

## Implemented changes

### Authentication and session recovery

`src/lib/auth/endpoint-config.ts` aligns web authentication with the same-origin
API selected by the application, while retaining the configured remote backend
for native/local use. It joins the session-recovery endpoint without the previous
duplicate `/api/api/` path.

`src/lib/auth/logout-cleanup.ts` makes optional removal of an old UI flag
best-effort: denied browser storage can no longer prevent the server sign-out
request. The existing awaited sign-out, rejection handling and redirect remain.

`src/lib/auth/session-recovery.ts` safely handles browsers that throw when accessing
session storage. `src/lib/config.ts` no longer lets optional diagnostic local
storage prevent startup. The client retains credentialed recovery and the existing
one-shot guard. No cookie policy or CSRF setting is loosened by these changes.

Changing web authentication from Railway's hostname to the app's current origin
may require existing users to sign in again. The existing automatic cookie-clear
behavior on any session error/eight-second timeout still needs review: transient
network trouble should not be confused with an invalid session.

### Children’s badges

The schema uses `children.parent_id`; the route incorrectly queried `user_id`.
The query is corrected and child IDs must be positive safe integers in canonical
string form. A signed-in parent's ownership is checked before progress, streak or
referral reads. Another parent's child and an unknown child both return 404.

See [the badges QA note](session02-badges.md). Its tests run the real handler and
badge definitions with mocked authentication, HTTP and SQL boundaries. They do
not prove live database behavior.

### Underlying agreed shop design

`src/lib/world/shop-registry.ts` records five planned shops: sweets, uniform/shoes,
school supplies, cake/pie, and celebration/merchandise. It records the Victorian
deep-red/dark-wood/gold style and double-fronted sweet-shop requirements, with ten
activity mappings to eight existing maths game routes.

Existing approved characters, artwork and pages are untouched. All matching shop
artwork remains explicitly pending. No visible 3D feature or checkout is claimed.
The new resolver exposes only registered learning targets and disables purchasing
for everyone. That is not a repair of existing payment or affiliate pages.
See [the shop foundation note](../world/shop-foundation.md) for the exact contract,
age-suitability caveat and remaining visible work.

## Verification

Executed successfully on Node v24.19.0:

```sh
node --experimental-vm-modules --test scripts/test-auth-endpoints.cjs scripts/test-logout-cleanup.cjs scripts/test-badges-ownership.cjs scripts/test-shop-registry.cjs
```

Result: 50 passed, 0 failed: 17 auth/config, 10 logout, 12 badges and 11 shop-registry tests.
These checks use Node's built-in TypeScript stripping, which is not semantic
TypeScript checking. The badges harness requires the VM-modules flag above.

The following full-project checks could not start their actual work:

```sh
npm run build
npm run type-check
npm test -- --run
```

They reported missing `vite`, `tsc` and `vitest`, respectively. The existing
island-adventure and admin/paid-AI suites also stopped at startup because their
TypeScript dependency was unavailable. No passes are claimed for those suites.
There was no production login, real-user mutation, live payment or device test.

## Next work, in order

1. Obtain a configured dependency environment; build, type-check and run all existing tests on the review branch.
2. Verify login, password reset, logout, cookies and parent/child isolation in a non-production environment; review CORS/CSRF without weakening protection.
3. Repair and test the photo/homework request flow with explicit size limits and helpful errors; do not bypass the paid-AI billing guard.
4. Reconcile valuable backup-only work file by file; do not overwrite working dynamic routes or approved art.
5. Implement the visible Victorian street and matched shop scenes, then wire the registry with age-appropriate activity selection and accessible controls.
6. Verify server-side adult-only purchasing separately; keep children's learning independent of real-money shopping.
7. Run the full feature/device checklist, record pass/fail evidence, then request approval before merging or deploying.

## Coordination

The main assistant coordinates the three helpers in this conversation; Michael
retains release and design approval. SESSION-01 inspected Railway and reviewed
authentication, SESSION-02 repaired badges, and SESSION-03 built the shop registry.
Independent chats are not automatically supervised or synchronized by this team.
No additional agent is required for this first pass. A separate reviewer can be
useful later, but should receive one fixed branch/commit and a read-only test scope.
