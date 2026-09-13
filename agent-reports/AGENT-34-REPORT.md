# Agent 34 Recovery — network and offline reliability

**Status:** authorised GitHub recovery-branch upload complete and content verification passed.

## Recovery basis

- Recovery branch: `recovery/agent34-network-offline-reliability-20260913`
- Current-main base: `305401d15acfaa60d8bd12f32a1aafd5f351f34`
- Inspected legacy branch: `agent34/network-offline-reliability-20260913` at
  `fa827c653babf5c8d4b47a1e219d4dcf27bfceae`
- The divergent legacy work was reviewed and selectively ported; it was not
  merged or blindly cherry-picked.

## Delivered

- A small, separate network worker is imported by the existing notification
  worker. It makes one bounded attempt for an eligible same-origin request and
  never adds a mutation queue, Background Sync, cache of user data, or
  automatic resubmission.
- Failed or interrupted writes return an `unknown` outcome and a child-safe
  message. Reconnection only allows an explicit new action; it never proves an
  earlier write succeeded.
- TanStack mutation defaults remain `retry: 0` and use `networkMode: 'always'`,
  so an offline mutation is not paused then surprise-replayed on reconnect.
- An accessible, dismissible connection banner provides offline, slow,
  unavailable, uncertain, and restored-connection feedback. It preserves the
  open activity and does not reload, clear storage, request permissions, or
  expose diagnostic details.
- Only anonymous fingerprinted build assets may be cached, with strict
  same-origin, size, type, header, and 60-entry limits. HTML, images, API
  data, query-bearing requests, authenticated/range requests, and unsafe cache
  headers are excluded.
- Payment, admin, AI, scanner, authentication, push, teacher, and related
  APIs are explicitly bypassed. Their matching route navigations are also
  bypassed, leaving their existing feature-specific behaviour untouched.

## Deliberately out of scope

- No production database, credentials, cloud call, deployment, Railway change,
  PR, merge, or default-branch update.
- No payment/Stripe, admin, AI routing, scanner, seasonal cover, Agent 28 data
  persistence, or `797` changes.
- No real payment or submission retry was added.

## Local verification

| Check | Result |
| --- | --- |
| `node --test scripts/network-reliability.checks.mjs` | 70 passed |
| Focused Vitest policy/status tests | 5 passed |
| `pnpm exec tsc --noEmit` | passed |
| Checked-in/staged Vitest suite | 20 files / 157 passed |
| `pnpm run build` | passed (existing large-chunk and third-party Rollup-comment warnings only) |
| Static/lint checks | worker/service-worker/check script syntax passed; TypeScript lint has no errors and one pre-existing unused `hydrateRoot` warning in `src/main.tsx` |

The raw working tree also contains unrelated untracked Agent 25 device files;
they are intentionally excluded from this recovery and its test selection.

## Remaining acceptance checks

- Test first-load and update activation of `/sw.js` in a real browser on a safe
  non-production origin, including offline/slow/interrupted request cases.
- Confirm the connection banner and manual retry wording on supported desktop
  and mobile browsers, including multi-tab behaviour and service-worker update
  lifecycle.
- Current configuration can use a cross-origin API. A same-origin service
  worker cannot intercept that API traffic, so validate the feature-owned
  cross-origin failure UI separately; no cloud or production endpoint was
  contacted here.
- Confirm server-side idempotency and the parent/grown-up review flow for any
  real submission after an uncertain network outcome.

## Upload record

- The eight source and test files above were uploaded only to
  `recovery/agent34-network-offline-reliability-20260913` and then read back
  byte-for-byte against the tested local commit.
- This report is included in the final branch-content verification. No PR,
  merge, deployment, Railway action, or default-branch write was performed.
