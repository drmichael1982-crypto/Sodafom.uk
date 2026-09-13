# Agent 29 — Account/Login Reliability Recovery Report

**Recovery branch:** `recovery/agent29-login-20260913`  
**Baseline branch:** `agent29/account-login-reliability-20260913`  
**Baseline commit:** `765b3dceb5438e2bab6c12d2d4a7dcaffcf8aaa1`  
**Pushed:** Yes — this recovery report, lockfile correction, and CI workflow correction are published on the dedicated recovery branch only.

## Scope recovered

Agent 29's work is account/login reliability. This recovery preserves the existing account-security implementation and makes its intended CI checks installable and enforceable. It does not add features, merge any branch, deploy, alter Railway, or touch 797 work.

## CI lockfile issue reproduced and corrected

The baseline's `npm ci` failed because `package-lock.json` was inconsistent with the committed dependency overrides. The failing entries were:

- `js-yaml`: lockfile `4.3.1`, override-required `4.3.2`
- `qs`: lockfile `6.15.2`, override-required `6.16.0`
- `side-channel`: lockfile `1.1.0`, override-required `1.1.1`
- `uuid`: lockfile `7.0.3`, override-required `11.1.1`

`package-lock.json` was regenerated with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`; `package.json` and `pnpm-lock.yaml` remain unchanged. The workflow now runs a normal fail-fast `npm ci` instead of deliberately retaining the failed lockfile as a final failing step, and it also covers this recovery branch.

## Security coverage retained

Focused tests continue to cover fail-closed session handling, child/parent/admin role boundaries, unsafe redirect rejection, password-reset request and callback protections, generic reset responses, logout cookie clearing, founder-session precedence, and sign-up role/admin-field restrictions.

## Validation completed

| Check | Result |
| --- | --- |
| Baseline `npm ci --ignore-scripts --no-audit --no-fund` | Reproduced failure |
| Corrected `npm ci --no-audit --no-fund` | Passed |
| `pnpm install --frozen-lockfile` | Passed |
| `node --experimental-strip-types --test scripts/agent29-account-reliability.test.mjs` | 70 passed, 0 failed |
| `node --experimental-strip-types --test scripts/agent29-server-reliability.test.mjs` | 29 passed, 0 failed |
| `npx vitest run --config agent29.vitest.config.ts` | 16 passed, 0 failed |
| `pnpm type-check` | Passed |
| `pnpm build` (client and SSR) | Passed |
| `git diff --check` | Passed |

The workflow's disposable MySQL integration variant requires `AGENT29_TEST_DB=1`; a local MySQL service was not provisioned for this recovery, so that integration variant remains delegated to CI.

## Files changed by this recovery

- `.github/workflows/agent29-account-reliability.yml`
- `package-lock.json`
- `agent-reports/AGENT-29-REPORT.md`

## Integration note

This is a standalone recovery handoff. Reviewers should integrate it deliberately because the workflow and lockfile may overlap with later dependency or CI changes. No main/master merge, pull request, deployment, or production credential change was performed.
