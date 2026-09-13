# Agent 33 — backup, recovery and rollout safety

Status: **offline safeguards only; production recovery and release are not approved.**

This recovery is based on the historical Agent 33 work, but it intentionally does not repeat that branch's old deployment observations. The current application branch alone is not evidence of a live service's source branch, backup policy, database engine, retention, key recovery or rollback availability.

## What this recovery adds

- `scripts/agent33-recovery.mjs`: an offline-only synthetic artifact drill and a manual release-evidence checker.
- `scripts/test-agent33-recovery.mjs`: standalone Node tests for its fail-closed boundaries.
- `docs/operations/agent33-release-evidence.example.json`: a deliberately incomplete public example which must remain blocked.

No application source, schema, payment, admin, AI, scanner, deployment configuration, Railway configuration or default branch is changed.

## Safety boundary

The tool has exactly two commands:

```sh
node scripts/agent33-recovery.mjs rehearse
node scripts/agent33-recovery.mjs check-release <evidence-file>
```

It has no deploy, merge, rollback, database, backup-provider, network, application-import or background-job command. It does not load `.env` files. It refuses a production-like environment and environments containing Railway, database, cloud-storage or named application-secret variables. Errors use fixed codes and do not print input paths, evidence contents, bytes, keys, environment values or stack traces.

The `rehearse` command creates synthetic bytes in memory, encrypts them with a fresh AES-256-GCM key and nonce, verifies a separately supplied SHA-256 hash, writes one fixed-name file inside a newly created private temporary directory, reads it back, verifies it, and removes only that temporary directory. Its result explicitly reports:

```json
{
  "mysqlRestoreTested": false,
  "appRollbackTested": false,
  "deploymentAttempted": false
}
```

This is an offline file-handling drill, **not** a database backup, MySQL restore, provider snapshot test or forensic erase claim.

## Release evidence check

`check-release` validates supplied assertions only. A successful result means `assertions-complete-needs-manual-verification`; it always reports `authorizesDeployment: false` and does not execute a release.

Targets and target branches are deliberately opaque identifiers because the checker is offline and must not make unverified deployment assumptions. Its evidence still has to provide matching candidate, rollback, backup and tested SHAs; a matching expected/restored MySQL major; fresh UTC timestamps; backward-compatible schema assertion; every required safety assertion; and explicit owner approval. The checker cannot prove any supplied assertion is true.

The committed example is intentionally incomplete. It must be rejected:

```sh
env -i PATH="$PATH" NODE_ENV=test node scripts/agent33-recovery.mjs check-release docs/operations/agent33-release-evidence.example.json
```

Expected result: exit code `2`, `status: "blocked"`, and no deployment attempt. Do not change its unknown values to pass a check. Store any real evidence, service mappings, backup hashes, credentials and restore records only in approved private operations storage.

## Local validation only

Run the standalone drill tests from a clean local shell:

```sh
env -i PATH="$PATH" NODE_ENV=test node --test scripts/test-agent33-recovery.mjs
env -i PATH="$PATH" NODE_ENV=test node scripts/agent33-recovery.mjs rehearse
```

These tests use only synthetic content and temporary directories. They do not contact a database, provider, device, account, deployment service or production data source.

## Still required before any production operation

The owner must separately approve all of the following in a disposable, isolated environment before a release, rollback or recovery can be considered:

1. Verify the live service/environment and exact candidate and rollback artifacts without publishing their private configuration here.
2. Inventory all data stores, including databases, assets, unsynced device data, third-party stores, backup schedules, retention, encryption and independent-copy/key recovery.
3. Create and restore a database-consistent backup using synthetic records only into a new isolated database. Do not mount production volumes, use production credentials, or allow outbound payments, email, AI, push or other external effects.
4. Verify schema, indexes, record counts, parent-child relationships, access boundaries and actual application reads/writes against that recovered disposable data.
5. Demonstrate a code-only rollback on the candidate schema without discarding newer synthetic writes. Review migrations, secrets, permissions and current security restrictions.
6. Agree recovery-time and data-loss objectives, record non-sensitive evidence privately, and obtain explicit owner authorization for the chosen operation.

Any production restore is a separate approved event with an explicit impact and data-loss assessment. A historical deployment entry, a healthy HTTP response, a mounted volume, an automated test, or a green evidence-checker result is not enough to authorize it.

No merge, pull request, deployment, backup, restore, production data access or external account change was performed by this recovery.
