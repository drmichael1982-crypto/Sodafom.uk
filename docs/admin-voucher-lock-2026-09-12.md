# Sodafom Admin lock and paid-AI spending safeguard

Scope: children's Sodafom only. No 797 resources, user data, secrets, or existing subscriptions were moved or deleted.

Base: master at 86c01c1f94d1ce034318aef78a1e4f7ed142b796. Backup branch: backup/pre-admin-voucher-lock-20260912.

## Changes

Admin open mode is ignored outside explicit development. Founder codes are type-checked, support a salted scrypt hash in ADMIN_MASTER_CODE_HASH, and remain server-side. Existing ADMIN_MASTER_CODE remains a compatibility fallback only when no hash is configured. Founder cookies are HTTP-only and expire after two hours; rotating the configured code/hash invalidates old founder sessions. Malformed cookies are rejected. An unverified email matching FOUNDER_EMAIL no longer grants Admin access. Existing authenticated administrators remain supported.

The verify endpoint limits wrong guesses to five per client IP per fifteen minutes, with a twenty-five-guess process-wide cap. These limits are in-memory, reset on deployment, and are not distributed across replicas. A short PIN is still weaker than a full password/MFA; this is not a complete security certification.

Voucher read/update endpoints now accept the same founder session as the Admin Hub, reject unauthenticated access and validate update types. They still configure TEST packs. Saving/enabling a test pack does NOT activate real paid AI.

The public chat, photo-help and transcription endpoints now fail closed with HTTP 503 and X-Sodafom-AI-Status: voucher-billing-pending before constructing the OpenAI client. This deliberately pauses ALL paid AI on those endpoints, including for the owner. Local AI and device/browser speech code are unchanged; the online photo and transcription features are temporarily unavailable. Provider integration code is retained for later metered reactivation.

## Not completed by this patch

Live voucher checkout, verified/idempotent live Stripe fulfillment, an account-owned credit ledger, atomic credit reservation/debit and refunds/reconciliation are not implemented here. Do not charge parents for vouchers or remove the spending safeguard until these are implemented and tested. Subscription/promo/free/research flags and client-supplied balances must never substitute for paid credit verification. Regular parent/teacher account login and real-device behavior are not certified by these tests.

## Verification

Run: node --test scripts/test-admin-paid-ai-guard.mjs

24 focused regression tests passed locally using the real patched TypeScript handlers with mocked HTTP, database and OpenAI boundaries. No paid API requests or real purchases were made. This is not a full build, full TypeScript type-check, browser test, live database test or live payment test. Deployment status must be checked separately in Railway.

## Sources used for payment/auth design boundaries

Stripe Checkout fulfillment: https://docs.stripe.com/checkout/fulfillment
Better Auth security: https://better-auth.com/docs/reference/security

The live admin PIN and all API keys are excluded from this document and commit.
