# Agent 33 — backup/recovery rollout-safety recovery

## Status

- Recovery branch: `recovery/agent33-backup-recovery-safety-20260913`
- Recovery base: current remote `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Historical source reviewed: `agent33/backup-recovery-rollout-safety-20260913` at `79a05aebc0d819a91f2642628f2200c335fe8699`
- Pushed: **Yes** — uploaded to `recovery/agent33-backup-recovery-safety-20260913` via the authorised GitHub connector; no PR, merge or deployment was created.

## Recovery decision

The historical Agent 33 files were self-contained but documented deployment observations from an older, divergent branch. Those service, branch, engine, backup and retention observations were not treated as current facts and were not carried forward. Instead, this recovery keeps only offline safety guards, a deliberately blocked evidence example, documentation and tests.

No code in this recovery can connect to a database, backup provider, app service, deployment platform, account, or production data source. It cannot deploy, merge, roll back, create a real backup, perform a real restore, or alter a release configuration.

## Changes made

- Added `scripts/agent33-recovery.mjs`, a built-in Node-only offline drill with bounded AES-256-GCM synthetic artifacts, independent SHA-256 verification, private temporary-file permissions, cleanup and an offline-environment guard.
- Added a manual evidence checker that fail-closes incomplete, stale, malformed, mismatched or unapproved assertions. Targets/branches are opaque identifiers because the checker intentionally knows nothing about live services. Its successful result still says `authorizesDeployment: false`.
- Added 31 standalone Node tests in `scripts/test-agent33-recovery.mjs`, including tampering, cleanup, no-secret-output, environment refusal, evidence validation, blocked example, CLI restrictions and import/network surface checks.
- Added a deliberately incomplete public evidence example and a current-safe runbook at `docs/operations/`.
- Did not alter application code, database schema, payment/admin/AI/scanner paths, default branches, Railway/deployment configuration, external credentials/accounts, or 797.

## Validation performed

- `env -i PATH="$PATH" NODE_ENV=test node --test scripts/test-agent33-recovery.mjs` — **31 tests passed**.
- `env -i PATH="$PATH" NODE_ENV=test node scripts/agent33-recovery.mjs rehearse` — passed and explicitly reported synthetic-artifact-only scope, `mysqlRestoreTested: false`, `appRollbackTested: false`, and `deploymentAttempted: false`.
- The committed evidence example was checked in the same clean environment and correctly returned exit code `2`, `status: "blocked"`, `deploymentAttempted: false`, and `authorizesDeployment: false`.
- `npm run type-check` — passed.
- `npm test -- --run` — **18 files, 152 tests passed**.
- `npm run build` — client and SSR builds passed.

The build retained existing chunk-size and third-party Rollup annotation warnings; neither blocks the build and neither comes from this recovery.

## Production operations still requiring owner approval

- Verify the actual live service/environment, source branch, runtime, database engine/version, backup inventory, schedule, retention, encryption, independent copy and key recovery outside this public repository.
- Approve a disposable isolated MySQL/app recovery rehearsal using only synthetic records, no production credentials/volumes/network, and no outbound payments, email, AI, push or other external effects.
- Verify restored schema/indexes/counts/relationships, role boundaries and actual application reads/writes; a health response or local mock is insufficient.
- Demonstrate code-only rollback on the candidate schema while preserving newer synthetic writes, and review migrations, secrets, permissions and current security restrictions.
- Agree recovery-time/data-loss objectives, store non-sensitive evidence privately, independently verify all assertions, and give explicit owner authorization for any release, rollback, backup or restore event.

No merge, PR, deployment, production-data access, real backup, real restore or external account change was made.
