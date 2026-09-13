# Agent 23 — notifications and reminders recovery

## Status

- Recovery branch: `recovery/agent23-notifications-reminders-20260913`
- Recovery base: current remote `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Source reviewed: `agent23/notifications-reminders-20260913` at `5605d8f0518aed0ea052f2a9afae7968446de93c`
- Pushed: **Yes** — uploaded to `recovery/agent23-notifications-reminders-20260913` via the authorised GitHub connector; no PR, merge or deployment was created.

## Recovery decision

The original Agent 23 notification commit was built on an older, divergent codebase. Its database table, password-verification handler, delivery ledger, scheduler-facing endpoint and web-push provider code were not ported blindly. Those parts require a production owner decision about consent, retention, account deletion, transactional storage, device support and delivery responsibility.

This recovery keeps the compatible child-safety intent and is deliberately local/contract-only. It creates no new child data, writes no notification preferences, requests no browser permission and sends no real message.

## Changes made

- Added `src/lib/reminder-policy.ts`, a pure reminder-policy contract with all types defaulted off, daytime/quiet-hour validation, a one-or-two-per-day cap, an hourly gap, no catch-up window, same-time grouping and recorded-achievement-only logic. It has no storage, network, scheduler, service-worker or Notification API dependency.
- Replaced `/notifications` with a parent-role-gated, in-memory planning preview. It clearly says delivery is off; it does not call `fetch`, use browser storage, ask for a password, request notification permission or enrol a device.
- Updated the notification-centre link to accurately describe the parent reminder plan rather than closed-app push delivery.
- Disabled the child-facing streak/push banner while retaining its component export for the existing Hub caller.
- Made the legacy `usePushNotifications` hook a no-op compatibility hook. It never registers a service worker, requests permission, reads a subscription or calls an API.
- Made `POST /api/push/subscribe` and `POST /api/push/send` fail closed with `503` and `Cache-Control: no-store`; neither reads the request body, persists a device subscription or sends a push message.
- Left admin UI, payments, AI/scanner paths, database schema, external accounts/credentials, Railway/deployment, default branches and 797 untouched.

## Validation performed

- Focused recovery tests: `npx vitest run src/lib/__tests__/reminder-policy.test.ts src/components/__tests__/PushNotificationBanner.test.tsx src/hooks/usePushNotifications.test.ts src/server/api/push/push-delivery-disabled.test.ts` — **4 files, 9 tests passed**.
- `npm run type-check` — passed.
- Focused ESLint on all changed TypeScript/TSX files — passed with no findings.
- `npm test -- --run` — **22 files, 161 tests passed**.
- `npm run build` — client and SSR builds passed.

The build retained pre-existing size and third-party Rollup annotation warnings; neither blocks the build and neither is from this recovery.

## Deliberate limits and follow-up owner decision

- No real browser permission, service-worker, push-provider, notification, device, account, database or production test was performed or attempted.
- The local planner only renders its controls when the client session reports the `parent` role. This is appropriate for a non-persistent preview, but any future save or delivery endpoint must enforce parent ownership again on the server.
- Before any delivery is enabled, the product owner must approve a signed-parent consent and re-confirmation flow, persistent preference/ledger design, retention and account-deletion handling, scheduler ownership, provider allowlist, audit trail, and a no-broadcast recipient model.
- A non-production real-device/browser accessibility pass must cover parent-role recognition, keyboard use, screen readers, denied/granted permission states, service-worker lifecycle, quiet hours/time zones/DST, subscription removal and closed-app behaviour.
- The existing admin push screen is intentionally not changed by this recovery. While delivery is disabled it will receive the guarded `503` response; it must not be used until the later owner-approved rollout exists.

No merge, PR, deployment, Railway change or live message was made.
