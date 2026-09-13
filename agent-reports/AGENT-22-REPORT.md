# Agent 22 Recovery — Daily Learning Progress

## Status

Completed: all recovery source files and this report were uploaded and
content-verified through the authorised GitHub connector. No pull request,
merge, deployment, Railway action, or default-branch change was made.

## Recovery basis

- Recovery branch: `recovery/agent22-daily-learning-progress-20260913`
- Current remote `main` base: `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Inspected legacy branch: `agent22/daily-learning-progress-20260913`
  (`0736dfcf7d9d473b02670896b6dc47e369e46c65`)
- The legacy branch was based on an older application structure, so its changes
  were reviewed and adapted rather than cherry-picked.

## Delivered scope

- Added a dedicated, no-index `/daily-learning` page and a **Daily learning**
  link for each child in the current Parent Hub. The link selects that child
  before opening the page.
- Added a read-only daily dashboard with saved activities, a gentle optional
  age-aware aim, recent activity, weekly view, and non-punitive best-streak
  wording. Opening a page does not count as completing one.
- Added a separate opt-in `?view=daily` progress response. It validates the
  child and cursor, verifies the signed-in account owns the child, paginates
  bounded history, sends `private, no-store`, and returns only the activity
  fields rendered by the dashboard. The existing default progress response was
  left unchanged.
- Added defensive client parsing, request cancellation/timeouts, retry/focus
  refresh, and focused model/query tests.
- Local device storage is restricted to an account-and-child-scoped best-streak
  value and earned achievement IDs. It stores no child name, score, activity
  title, activity history, or server data.

## Explicitly not changed

- No database schema, database data, production database, external service, or
  cloud call.
- No payment, admin, AI, scanner, seasonal-cover, Railway, deployment, default
  branch, or `797` change.
- No completion, rewards, stars, goals, or progress writes were added.

## Verification

| Check | Result |
| --- | --- |
| Focused daily-learning/query tests | Passed: 11 tests |
| Type check | Passed: `pnpm exec tsc --noEmit` |
| Focused ESLint | Passed with 0 errors; 5 pre-existing unused-symbol warnings in `hub/index.tsx` and `routes.tsx` |
| Full Vitest suite | Passed: 20 files, 163 tests |
| Production client + SSR build | Passed: `pnpm run build` (existing bundle-size and third-party Rollup comment warnings only) |
| Production DB / external calls | Not run by design |

## Remaining checks before release

- Exercise the endpoint against a non-production database with two parent
  accounts to confirm cross-account child IDs return no history and cursor
  pagination works with real records.
- Browser-check profile switching, empty history, session expiry, offline/
  timeout retry, and screen-reader keyboard flow.
- Check responsive phone/tablet layouts and local storage behavior on a shared
  device. Clearing device storage should only remove local keepsakes.
- Confirm that upstream lessons, reading and homework producers consistently
  save activity rows; the dashboard deliberately reports only rows already
  saved by those existing producers.
