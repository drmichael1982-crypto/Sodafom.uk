# Agent 27 — Full-App QA and Safe-Fixes Recovery Report

**Recovery branch:** `recovery/agent27-full-app-qa-safe-fixes-20260913`
**Current-main baseline:** `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
**Source reviewed:** `agent27/full-app-qa-safe-fixes-20260913` at `05d2cb6fc8a260a886de1eca6c0dea7ab0c34191`
**Source application-fix commit:** `0f237cb890c90f2983be6e38fddb3f747b34974d`
**Pushed:** Yes — published only on this dedicated recovery branch; no PR, default-branch merge, or deployment.

## Recovery decision

The source QA branch was based on an obsolete master line and diverges from current main (91 commits ahead and 23 behind). This recovery was rebuilt from current main. Only two isolated, current-compatible fixes were selected because each has focused regression coverage. This is not full end-to-end certification of the app or a combined-agent integration.

## Safe fixes included

1. The global recovery screen now builds its existing heading, details, and reload control with DOM text nodes instead of interpolating error details into `innerHTML`. HTML-looking error text stays inert, repeated errors reuse one panel, and early/malformed error reporting cannot mask the original problem with a second exception.
2. The optional Capacitor diagnostic flag now treats `localStorage` as best effort. Denied storage, a blocked getter/read, or a quota write failure can no longer abort app startup. Platform detection, production URL, API routing, AI behavior, authentication, payments, and data handling are unchanged.

## Deliberately excluded

- The source branch's admin-auth test change: current main does not contain that old admin implementation, and admin changes are outside this recovery's permitted scope.
- Source workflow, browser tooling, and master-only QA claims: they were not copied because they do not demonstrate current-main compatibility.
- Any payment, admin, AI, scanner, database, default-branch, Railway, deployment, or task-797 work.

## Validation completed

| Check | Result |
| --- | --- |
| `node --experimental-strip-types --test scripts/agent27-safe-fixes.node.mjs` | Passed — 6 focused regressions |
| `node scripts/agent27-route-audit.mjs` | Passed — 197 route paths, 191 relative route imports, and 14 key routes checked |
| `pnpm test -- --run` | Passed — 18 files, 152 tests |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed — client and SSR builds; existing bundle-size and Rollup comment warnings remain |
| Focused ESLint | No errors; one pre-existing unused `hydrateRoot` warning in `src/main.tsx` |
| `git diff --check` | Passed |

## Current-main lockfile limitation

`pnpm install --frozen-lockfile` is currently blocked because `package.json` and `pnpm-lock.yaml` have mismatched dependency specifications. A no-write local install (`pnpm install --no-frozen-lockfile --lockfile=false`) was used solely for this recovery's validation. Agent 1's separate build repair remains the first dependency in any later approved integration branch.

## Browser, device, and database work still required

1. Exercise the global error screen in a full browser page, including reload and recovery after an actual boot/render error.
2. Test first-run and denied/quota storage behavior on real Android WebView, iOS Safari, and supported desktop browsers.
3. Run authenticated account, profile, parent/teacher, progress, camera, microphone, notification, and database-persistence journeys against isolated test services.
4. Run payment/voucher and paid-AI paths only in approved dedicated test environments; none were started here.
5. Measure navigation, keyboard/screen-reader behavior, and responsive visual checks on real devices.

No production database, real account, email/notification, paid AI, payment, deployment, Railway change, or external runtime service call was made during this recovery.
