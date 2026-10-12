# Owner payment draft settings

The standalone app exposes `/admin/payments` and an owner-only `GET`/`PUT /api/admin/payments` endpoint. Learning stays free. The endpoint always returns `mode: "free"` and `collectionEnabled: false`; the form cannot create checkout sessions, subscriptions, charges or paid access.

## Server setup

1. Configure real parent accounts using `PARENT-ACCOUNTS-SETUP.md`.
2. Create and verify the intended owner account, then set the server environment variable `ARCHIE_OWNER_USER_ID` to that account's immutable user ID. A matching verified session is the only owner grant; local preferences, form fields, account email, old preview codes and database admin flags cannot grant access.
3. Set `BETTER_AUTH_URL` to the exact public HTTPS app origin. Saves require this same Origin.
4. Configure persistent storage. With `ARCHIE_PARENT_SQLITE_PATH=/data/parents.sqlite`, the payment draft defaults to `/data/payment-settings.json`. Otherwise set an absolute `ARCHIE_ADMIN_SETTINGS_PATH`. Production requires the file to reside under `RAILWAY_VOLUME_MOUNT_PATH`.
5. Restart the server after environment changes. Sign in through the parent hub, then open its owner payment settings link.

These variables belong on the server. Do not prefix them with `VITE_` or include secrets in browser code.

## Draft behavior

The owner can save a label, a public HTTPS signup URL, and a marker that the draft is ready for a future review. Empty fields are allowed when that marker is off. The server validates the destination, stores the draft atomically with owner-only filesystem permissions, and records its save time. It never fetches the URL, shares it with learners, or accepts payment-provider keys.

If persistent storage is not configured, the page explains that saving is unavailable. If authorization or storage fails, the endpoint returns an error and payments remain off. Normal learning does not depend on this settings file.

Activating a payment product requires a separate implementation and release. This draft is not a connected payment provider, verified checkout integration, App Store purchase implementation, or billing entitlement system.

## Verification

Run `npx vitest run src/server/lib/archie-admin-payments.test.ts src/pages/admin/PaymentSettings.test.tsx src/server/lib/archie-parent-auth.test.ts` to verify owner authorization, request-origin checks, draft validation, persistence, free mode, and the page's access behavior.
