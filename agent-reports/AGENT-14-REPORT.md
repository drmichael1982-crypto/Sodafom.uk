# Agent 14 — Schools and Teachers Recovery Report

**Recovery branch:** `recovery/agent14-schools-teachers-20260913`

**Current-main baseline:** `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
**Duplicate sources reviewed:**

- `agent-14/schools-teachers-20260913` at `b9365ae4be31ae647b199c71444d4368e46a5116`
- `agent14-schools-teachers-review-20260913` at `73a092aeff869f205e8287a27f9374e31462fd59`

**Pushed:** Yes — published only on this dedicated recovery branch. No pull request, default-branch merge, deployment, Railway change, or 797 work was performed.

## Deliberate reconciliation decision

Both source branches were competing one-commit forks from the old `master`, rather than compatible incremental work. This recovery selects the **review branch's** cohesive model: tab-scoped teacher sessions, hashed server-side session records, ownership-scoped pupil access, teacher-confirmed work reviews, and privacy-preserving local photo handling. It is ported onto current `main`, not onto either old branch.

The older `agent-14/...` implementation was not combined with it, avoiding two incompatible school-record formats and duplicate page/API rewrites.

## Child-safe school/teacher experience retained

- Teacher browser credentials are tab-scoped, legacy persistent teacher credentials are cleared, and invalid/unreadable 401 responses clear the teacher session.
- Teacher authentication uses bounded input, a 12-character registration password minimum, scrypt hashes with legacy-hash upgrade compatibility, rate limiting, 8-hour hashed bearer-token sessions, explicit logout, and no-store private responses.
- All teacher roster, pupil, note, and review reads/writes check teacher ownership; malformed IDs and foreign pupils are rejected without revealing records.
- Reviews are versioned records inside the existing teacher-owned notes store, so no new database table or migration is required. Marks require explicit teacher confirmation; zero is a valid mark while pending/unscored work is never treated as zero.
- Work photos use temporary browser object URLs only. Image bytes, filenames, base64 data, and attachments are rejected by the server and are not persisted or exported.
- CSV export requires a teacher confirmation and escapes spreadsheet formulas. Reports disclose their 500-record recent-history limit.

## Intentional limits and exclusions

- The existing school-licence registration model remains mandatory. The review branch's free-account/schema-migration proposal was deliberately excluded, so no payment, entitlement, school-licence, or schema policy changed.
- No AI-routing, scanner, game, admin, parent, or deployment feature was changed.
- Existing game-facing pupil-code lookup/activity endpoints were not changed because they are game integration outside this recovery. This branch is not a whole-app privacy certification; those legacy routes need a separate review before broad school rollout.
- No live MySQL, real account, browser, camera/device, or production-data test was run.

## Validation completed

| Check | Result |
| --- | --- |
| `node --test scripts/test-agent14.mjs` | 66 passed, 0 failed |
| `pnpm type-check` | Passed |
| `pnpm build` (client and SSR) | Passed |
| `git diff --check` | Passed |

`pnpm install --frozen-lockfile` was also attempted and correctly reported a pre-existing current-main mismatch between `package.json` and `pnpm-lock.yaml`. This recovery does not alter dependency manifests or lockfiles. Dependencies were installed for validation with `pnpm install --no-frozen-lockfile --lockfile=false`, which does not write a lockfile.

## Recovery files

The changes are limited to teacher pages/helpers, teacher API handlers/security, the teacher password helper, focused Agent 14 tests, and this report. Reviewers should integrate this recovery deliberately because it replaces the old teacher-hub page/API contract with the selected privacy-focused contract.
