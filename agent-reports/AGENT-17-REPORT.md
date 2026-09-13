# Agent 17 — Security and Privacy Recovery Report

**Recovery branch:** `recovery/agent17-security-privacy-20260913`
**Current-main baseline:** `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
**Source reviewed:** `agent17/security-privacy-2026-09-13` at `06a7d53c407f2939f116b564a90b0bc9a4c32b7b`
**Pushed:** Yes — published only on this dedicated recovery branch; no PR, default-branch merge, or deployment.

## Recovery decision

The source branch was based on an obsolete master line and diverged by hundreds of unrelated files. This recovery was rebuilt from current `main` and ports only current-compatible, high-priority security and privacy protections. Payment/Stripe flow, paid-AI policy, scanner, games, Railway, deployment, default branches, and task 797 were not changed.

## Included protections

- Exact trusted-origin allowlisting for web and native clients; no reflected or wildcard CORS.
- CSRF protection enabled for Better Auth, with redacted auth errors/logging and escaped account-email interpolation.
- Private/no-store API responses, baseline browser security headers, strict browser write-origin checks, safe preflight handling, and generic API error responses.
- Parent role, identifier, and child-ownership enforcement before child progress/report reads.
- OpenAI photo-read requests use `store: false`; model choice, billing, availability, and paid-AI policy are unchanged.
- Voice-recorder stream, timer, reader, and audio cleanup for unmount, late permission, repeated tap, and stop-error cases.
- User-list API now returns private/no-store and generic errors only. Its existing legacy authorization flow was intentionally left unchanged.

## Deferred security and production review

1. Set and review the exact production `SODAFOM_TRUSTED_ORIGINS` list, including any legitimate app subdomain.
2. Test real Better Auth, CORS, Capacitor, CDN/proxy, and service-worker behaviour in a non-production environment.
3. Review and replace the current legacy authorised-test admin panel/code/header/query authorization flow. This recovery deliberately does not change that admin flow.
4. Confirm provider retention, under-13 consent, and data-processing requirements; `store: false` alone is not a complete retention/privacy assessment.
5. Review browser/device-session controls, microphone permissions, server secret handling, logs, backups, and the remaining routes before production release.

## Validation completed

| Check | Result |
| --- | --- |
| `node --test scripts/agent17-security.test.cjs` | Passed — 12 focused offline regression tests |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed (client and SSR); only existing bundle-size/Rollup warning output |
| Focused ESLint on changed TS/TSX files | Passed with no errors; three pre-existing unused-disable warnings in `src/server/entry.ts` |
| `git diff --check` | Passed |

No production database, external provider, or runtime service calls were made during this recovery.
