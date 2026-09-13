# Agent34 — network reliability and offline behavior

Date: 13 September 2026.
Repository: `drmichael1982-crypto/Sodafom.uk`.
Branch: `agent34/network-offline-reliability-20260913`.
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.

## Status

Targeted implementation and isolated tests are complete. Full-app and real-browser network acceptance testing is NOT complete. This branch is for review, not production approval. No merge or deployment was performed. No production API, real accounts, personal records, or live progress stores were used in testing.

The existing notification worker remains intact apart from importing a separate network-only module. Existing feature code, authentication, payments, AI routing, artwork, lessons, games, and progress schemas are not changed. The two integration points are the worker import and the main entry's network startup/mutation defaults.

## Existing behavior inspected

`public/sw.js` handled notifications but had no fetch handler or offline cache. The main query client disabled mutation retries but did not explicitly opt out of offline pausing. Browser progress already has a local-storage implementation in `ProgressionContext.tsx`; that implementation was left to the data-saving agent. The production web configuration uses same-origin API requests, while packaged/native configurations can use an external backend.

## Changes

### Bounded, single-attempt transport

The existing service worker imports `public/network-worker.js`. For controlled same-origin requests, reads have a 15-second deadline and writes have a 60-second deadline. A slow-connection notice appears after four seconds. JSON body download/validation and eligible public build-asset downloads share the deadline, preventing a response whose headers arrive but body stalls from leaving the caller pending indefinitely.

There is exactly one fetch attempt per intercepted request. No mutation queue, background synchronization, reconnect replay, or automatic submission retry was added. A failed, timed-out, malformed acknowledgement, or already-sent cancelled write is treated as uncertain: the server may already have received it. The child is asked to keep the page open and ask a grown-up to check before sending again. Pre-cancelled requests are not sent.

Network exceptions and proxy 502/503/504 diagnostic pages become generic, no-store failure responses. Ordinary application statuses such as 400, 401, 402, 403, 409, 422, and 429 remain with their existing feature handlers. New connection messages contain no request URL, child identifier, body, token, stack, or exception details. Decoded responses have corrected length/encoding headers.

`networkMutationDefaults` sets `retry: 0` and `networkMode: 'always'` so new mutations are not intentionally paused for surprise execution on reconnect. The compiled configuration is tested; actual TanStack execution with this repository's dependencies still needs integration testing. Per-feature overrides must be reviewed during integration.

### Offline feedback without resetting activities

`network-status.ts` mounts a small accessible, dismissible connection banner outside the React app root. It never reloads the page, remounts the activity, clears storage, or submits work. Online/offline browser signals are advisory rather than evidence that a previous submission succeeded.

The banner handles offline, slow, unavailable, reconnected, and uncertain-submission states. Concurrent requests share one banner; late messages do not revive a completed request's warning. A successful request clears a read-outage notice, but does not erase an uncertain-write warning. Dismissal is respected until a new relevant failure. The control has a minimum 44-pixel height, polite live-region semantics, and was checked at a 360-pixel viewport.

Registration uses the existing `/sw.js` and requests no notification, camera, or microphone permission. Unsupported/insecure/native-app contexts retain connection feedback without registering a worker. A failed registration is handled safely and can be retried on an online event. This retry is only worker registration, never a replay of an activity submission.

### Conservative offline cache

Only same-origin, fingerprinted public JavaScript, CSS, and WOFF/WOFF2 build assets are eligible. Cache storage is limited to 60 entries and 2 MiB per decoded asset, and cache writes/eviction are serialized. Cache errors fall back to normal network behavior. Only the new named public-asset cache is managed.

API responses, HTML, images/photos, query-bearing URLs, authorization/range requests, no-store requests, redirected responses, private/no-cache/no-store responses, sensitive Vary headers, incorrect MIME types, and oversized responses are excluded. Original response eligibility is checked before reconstruction can erase redirect/length metadata; actual decoded size is also checked.

Navigation never caches private HTML. A failed controlled navigation receives a self-contained child-friendly offline page. This is NOT a full offline app shell and does not promise a first-time offline visit or offline reload will restore an activity.

## Tests actually run

### 59 Node transport/source checks — passed

Command:

```sh
node --test scripts/network-reliability.test.mjs
```

This dependency-free suite runs the actual worker source in Node's VM with real Request/Response objects, simulated fetch/cache/client APIs, and deterministic timers. It is not a browser service-worker test.

| Condition | Verified result |
| --- | --- |
| Good connection | JSON/status preserved; one transport attempt; timers cleaned up. |
| Slow connection | Four-second notice; later success without an added retry. |
| Black-holed connection | Read deadline settles; write uses its longer deadline; no automatic replay. |
| Headers arrive, body stalls | JSON and eligible script downloads share the deadline. |
| Offline/dropout | Safe failure response; no account/API cache; no technical exception leakage from the new handler. |
| Interrupted POST/PUT/PATCH/DELETE | Uncertain result, one attempt, no delayed retry or background sync. |
| Reconnection | A new explicit read succeeds; an earlier write is not replayed. |
| Repeated dropouts | No leftover retry timers. |
| Cancellation | Read cancellation propagates; sent writes retain uncertainty; pre-cancelled writes are never sent. |
| Malformed JSON/proxy outage | Friendly failure instead of exposed parsing/proxy diagnostics. |
| Cached public asset during outage | Previously cached fixture asset loads without another network fetch. |
| Cache exclusions and pressure | Sensitive/oversized/redirected assets excluded; 65 concurrent writes capped at 60; unrelated cache untouched. |
| Cache blocked/full | Online file still loads; no cache exception reaches caller. |
| Navigation outage | Independent no-store offline page; no private HTML cached. |

Additional source checks cover one worker import, preserved notification handlers, main integration, no progress-storage clearing/reload/data logging/background sync, and mutation configuration. Streaming API bodies are deliberately left streaming and tested as unchanged, not declared dropout-safe.

### 16 isolated Chromium DOM checks — passed

Command (requires Python Playwright, Chromium, and TypeScript):

```sh
python scripts/test-network-status-dom.py --output /tmp/agent34-dom.json
```

Real Chromium rendered the actual compiled connection module into a test page with simulated connection/worker events. The activity DOM identity, typed answer, working step button, concurrent/late-message handling, uncertainty/dismissal behavior, recovery, cleanup, registration failures, native/unsupported-worker flags, narrow-screen layout, accessibility semantics, and compiled mutation defaults were checked. There were no uncaught page errors in these scenarios.

These checks did NOT run the full Sodafom app, actual browser network transport, persistence across a real app reload, or physical devices. The native-app flag was simulated; it is not an Android/iOS certification.

### Other checks — passed

Strict TypeScript compilation of the two new network modules; JavaScript syntax checks; Python test-harness syntax checks; syntax/transpilation of `main.tsx` (not full application type-checking). Baseline `main.tsx` and `sw.js` bytes were verified against their Git blob hashes before applying the small integration edits.

## Blocked or still required before production

1. **Actual browser network testing:** `scripts/test-network-browser.py` provides an isolated local HTTP/Chromium harness, but this environment blocked local HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR` before any network scenario ran. Zero browser network scenarios are credited as passed. The restriction was not bypassed. Run this harness in an authorized development environment, then test the real app with throttling, offline mode, mid-submit disconnects, and reconnection.
2. **Full build and integration suite:** container cloning/download access was unavailable. Only connector-read source needed for this change was reconstructed locally. The repository dependencies, full build, full type-check, existing Vitest suite, and actual TanStack mutation execution were not run. Check behavior alongside the other agents' changes, especially the shared `src/main.tsx` integration point and notification worker import.
3. **Real feature progress:** the fixture proves the banner does not replace its activity DOM or typed answer. It does not prove real lesson, game, reading, homework, or reward persistence across refresh, browser eviction, storage-quota failure, logout, or device switching. Existing save/sync ownership remains with Agent28 and the feature agents; no new store or progress queue was created here.
4. **Exactly-once server processing:** no automatic transport replay is added, but this is not server-side idempotency. Double-clicks, manual retries after an uncertain acknowledgement, multiple tabs/devices, and feature-specific retry overrides still require endpoint-specific identifiers/deduplication and integration tests. Do not claim duplicate submissions are impossible.
5. **Worker coverage:** protection starts only after the worker controls the page. Cold offline starts, missing/evicted assets, first-load registration races, blocked service workers, and native/cross-origin API traffic are not made fully offline-capable by this branch. Native packaging and physical Android/iPhone/iPad tests remain required.
6. **Stream lifecycle and large payloads:** API event/media streams remain under their existing feature lifecycle; a dropout after their headers arrive is not bounded by the JSON-body logic. Full-app payload/memory testing is still required.
7. **Existing global error UI:** the baseline `window.onerror` in `main.tsx` still logs and displays technical diagnostic details. It was not rewritten because that is shared security/error-boundary work. Unexpected render or lazy-chunk failures can still reach it. Coordinate with the security/QA agents before production; do not claim app-wide error privacy is solved.

No changes to real user data, production settings, deployment configuration, or other branches are part of this work. Review and production acceptance are separate from publishing this branch.
