# Agent23 — notifications and reminders

Branch: `agent23/notifications-reminders-20260913`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.
No deployment, merge, production database changes, live messages or scheduler setup were performed.

## Implemented

The existing `/notifications` page now provides authenticated parent settings for lessons,
reading, homework, achievements and daily learning nudges. Every type defaults off. Parents
choose each type's days and time, an IANA time zone, quiet hours and a one-or-two reminder
limit. Every save, including turning everything off, requires the signed-in parent account's
password. Passwords are never saved in browser storage, the reminder database or logs.
Accounts must own a child profile. Password confirmation is limited to five attempts in ten
minutes, with a shared database-backed counter.

A small in-app notice runs only on Home, Hub and Parent Area while the page is visible.
It is dismissible, polite, silent and does not interrupt lesson/game/book routes. No artwork
was added or replaced. RootLayout has exactly two added lines: the notice import and mount.

Anti-spam rules are enforced on the server, not just hidden controls: at most two reminders
in any rolling 24 hours, at least an hour apart, each category at most once per local day,
combined same-time categories, no catch-up after a ten-minute window, hard quiet hours
20:00–07:00 plus the parent's own quiet hours. Time zones use Intl, including daylight saving.
Achievement reminders require a fresh, actually recorded badge belonging to this parent.
This does not invent achievements or modify the underlying learning records.

The existing registered POST `/api/notifications/read` endpoint handles these scoped actions:
- `?reminders=preferences`: read the authenticated parent's choices.
- `?reminders=save`: save `{preferences,password}` after password confirmation.
- `?reminders=due`: claim one due reminder for the authenticated parent.
All use JSON and `X-Sodafom-Reminders: 1`; the server derives the parent ID from the session.
Without a reminder query, the existing read-receipt behavior is unchanged. No global API
registration, auth, admin, payment, AI, lesson, game or book files were modified.

Persistence is in the notification-only `notification_reminder_settings` InnoDB table.
The adapter creates it on first use in an approved running environment; missing DB/DDL
permissions fail closed. Claims use a row lock and commit the delivery ledger before
returning an alert. Separate tabs/processes use the same ledger. Editing preferences never
resets it. Old ledger entries are pruned on the next delivery; the latest achievement ID and
settings remain with the account's reminder row. Account-deletion integration/retention
review should include this new table before production approval.

## Legacy push compatibility and deliberate limits

The unsolicited streak-preservation push banner is now silent. The settings page does not
request browser permission or advertise automatic closed-app delivery. The existing push
subscription endpoint now requires parent reauthentication and saved opt-in preferences;
legacy clients calling it without these checks will be rejected rather than silently opted in.
The old hook is not exposed by the new settings page. A future consented device-setup UI
must supply the parent confirmation/header and validate actual device behavior.

The existing internal push-send endpoint retains its existing admin authorization but no
longer broadcasts arbitrary copy. It can only send a due, approved reminder to one device
of one specified parent, using the same atomic ledger and approved wording. Disabled types,
quiet times and caps apply. Stale subscriptions are removed, sends are not retried, external
payload URLs are not accepted, and push expiry is short. Actual presentation still depends
on the existing service worker, browser and operating system. The provider allowlist needs
real-device validation before use. **No closed-app scheduler was added or enabled.**

## Tests actually executed

114 targeted automated checks passed: 103 policy, handler, adapter, transactional-store and
push-endpoint unit tests with explicit fake services, plus 11 TypeScript/TSX syntax checks.
Concurrency tests use a simulated transactional database; they are not a live MySQL test.
Strict TypeScript compilation passed for `reminder-policy.ts` and `reminder-handlers.ts`.
Test Node version: 22.16.0; TypeScript: 5.8.3. Nothing contacts production or sends a message.

With project dependencies installed, run:

```sh
node --test tests/notifications/*.test.cjs
```

The tests load the actual TypeScript source through the installed TypeScript compiler.
A standalone environment with global TypeScript can use:

```sh
NODE_PATH="$(npm root -g)" node --test tests/notifications/*.test.cjs
tsc --strict --target ES2022 --module commonjs --outDir /tmp/sodafom-reminder-check src/lib/reminder-policy.ts src/server/notifications/reminder-handlers.ts
```

## Not verified here; required before approval to merge/deploy

Full app dependency installation, project-wide type-check, Vite client/server build and
existing Vitest suite were unavailable in the isolated environment (network/dependencies
unavailable; local Node also below the project's required version). No React DOM interaction,
real browser, screen-reader, real BetterAuth account, real MySQL locking/migration, real-device
push, service-worker or end-to-end test was run. Test password confirmation, account switching,
settings persistence, the new table's lifecycle, visual layout and quiet-hour behavior in a
non-production environment. This is a branch for review, not a claim of production readiness.
