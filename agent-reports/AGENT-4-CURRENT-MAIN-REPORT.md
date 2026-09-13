# Agent 4 Current-Main Admin Accounts & Visits Report

- **Agent number:** 4
- **Recovery branch:** `recovery/agent4-current-main-admin-accounts-visits-20260913`
- **Base:** current `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- **Legacy reference only:** `agent4-admin-accounts-visits`
- **Pushed:** Pending upload through the authorised GitHub connector.

## Delivered

- Rebuilt the Accounts & Visits work from current `main`; no old-master history was merged or cherry-picked.
- Added a small, accessible founder presentation for authorised visit counts and an explicit, on-demand account table.
- Visit counts reuse the Admin Hub’s already-authorised aggregate stats. They remain available for authorised-code testing.
- Account details are more restrictive: `/api/admin/list-users` now requires a signed-in Better Auth administrator and never accepts an admin code, query secret, or client-supplied secret.
- The account endpoint is `private, no-store`, returns only id/name/email/created date, uses generic errors, and does not return passwords, tokens, child records, roles, or subscriptions.
- The Admin Hub now waits for an authorised server summary before rendering stats-dependent cards. A signed-in administrator can open it without re-entering a code; code-based authorised testing remains available for the aggregate dashboard.

## Files changed

- `src/components/admin/AdminAccountsAndVisits.tsx`
- `src/components/admin/AdminAccountsAndVisits.test.tsx`
- `src/lib/admin-accounts.ts`
- `src/lib/admin-accounts.test.ts`
- `src/server/api/admin/list-users/GET.ts`
- `src/pages/admin-panel.tsx`
- `scripts/agent4-admin-security.test.cjs`

## Security coordination decision

Agent 17’s recovery marks the previous `list-users` authorisation as a legacy flow that needs review, while adding private/no-store and generic error handling. This recovery retains those privacy protections and narrows account-list access further to an actual administrator session.

The existing authorised-code path for aggregate `/api/admin/stats` was deliberately not expanded to return account PII. This preserves authorised testing without making account data available through a code-only path.

## Verification

| Check | Result |
| --- | --- |
| Focused Vitest | passed — 2 files, 6 tests |
| Focused Node security contract | passed — 2 tests |
| TypeScript | passed — `tsc --noEmit` |
| Production client + SSR build | passed |
| Focused ESLint | no errors; 12 existing unused-symbol warnings in the large legacy admin page remain |
| `git diff --check` | passed |

The production build reported the repository's existing large client-chunk warning and third-party Rollup comment warnings only.

## Cautions / follow-up

- No production database, account, or external service was called during this recovery. The UI tests mocked `fetch`; the endpoint was checked without invoking it.
- The broader current-main Admin Hub code-based access policy remains outside this narrowly scoped rebuild. It should be replaced or reviewed together with Agent 17’s wider security work before production release.
- A signed-in administrator and an approved non-production environment are required for real account-table testing.
- No payment, AI, scanner, default-branch, Railway, deployment, or 797 work was changed.
