# Agent 20 — Parent/Admin/Payments security

Branch: `agent-20-parent-admin-payments-security`  
Base: `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`

## Completed

- Replaced client-supplied Stripe price IDs in the parent trial flow with a
  server-owned `monthly`/`annual` plan selection.
- The server now requires an authenticated parent, attaches the user ID to the
  Checkout Session, and gets the actual Stripe Price ID from deployment secrets.
- Updated parent-facing prices to £4.99 monthly and £49.90 annual (two months
  free). No production Price IDs are present in browser code.
- Made Stripe webhooks fail closed when their signing secret/signature is
  absent, and registered the webhook before JSON parsing so Stripe's raw signed
  payload reaches `constructEvent` unchanged.

## Tests

- `pnpm type-check` — passed.
- `pnpm build` — passed (existing client bundle-size warning only).

## Still required before Stripe test readiness

1. Configure Stripe **test-mode** restricted key, `STRIPE_WEBHOOK_SECRET`,
   `STRIPE_MONTHLY_PRICE_ID` (£4.99/month) and `STRIPE_ANNUAL_PRICE_ID`
   (£49.90/year, two months free) in the private test environment.
2. Run an authenticated parent Checkout with Stripe test cards, then confirm
   rejected unsigned webhooks and accepted signed raw webhooks.
3. Bind subscription activation to Stripe `client_reference_id`/metadata and
   store idempotent webhook event records before any live release.
4. Complete the separate Admin/teacher role-hardening work before deployment.

No merge into `main`, deployment, live charge, or production configuration was
performed.
