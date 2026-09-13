# Agent 29 — Account and login reliability

Branch: `agent29/account-login-reliability-20260913`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`
Scope: account/session reliability and access checks only. No merge, deployment, payment changes or artwork changes.

## Implemented

- Web authentication now uses the same origin as the app API; native builds retain their configured backend.
- Removed automatic destructive cookie clearing/reloads on session/network errors. Recovery is explicit, bounded, validates the response and offers usable retry/login/home controls.
- Corrected the duplicated `/api/api` recovery URL and the loading timeout that stayed latched after a healthy response.
- Reject stale, expired, pending and error-bearing cached sessions; recheck at session expiry.
- Guarded optional browser-storage reads/writes, so SSR/private-storage restrictions and remembered-email failures cannot blank the login page or turn a successful login into an error.
- Confirm the server session before login navigation. Preserve valid internal query/fragment return paths and reject external, looping and wrong-role destinations.
- Validate signup return paths at the account boundary without editing the mixed signup/payment form. Its plan, pricing, promotion and checkout code is unchanged.
- Make logout handle returned errors, keep error feedback visible, use the active router and clear founder authentication on confirmed server logout. Recovery also expires the founder cookie without deleting progress data.
- Add parent-route checks and parent-dashboard API role checks while retaining its existing child ownership query. Explicit child/pupil/student accounts cannot inherit administrator access from a conflicting flag or old founder cookie.
- Keep teacher storage failures from creating blank screens or partially saved credentials; validate cached profile shapes. Teacher token expiry continues to be checked by the existing server resolver.
- Make password-reset HTTP failures visible, show invalid-link recovery, remove used reset tokens from the page URL, use a trusted callback origin and request revocation of existing BetterAuth sessions after reset.
- Stop an optional owner notification email from blocking completion of account creation. Remove raw authentication errors/account details from the logging touched by this branch.

## Tests actually executed locally

Commands:

```sh
node --experimental-strip-types --test scripts/agent29-account-reliability.test.mjs
node --experimental-strip-types --test scripts/agent29-server-reliability.test.mjs
```

The second command requires the project's TypeScript dependency. In the constrained editing environment it used the installed global TypeScript compiler via `AGENT29_TYPESCRIPT_PATH`, not downloaded packages.

At preparation time: **70 policy/storage/cookie/redirect tests passed; 29 real-source handler/configuration tests passed; zero failures.** TypeScript syntax transpilation passed for all 18 edited/new TypeScript and TSX files. This is **not** a whole-project type check or a browser/device end-to-end result.

Server-handler tests execute the actual edited source with isolated authentication/database/email doubles. They verify role denial before data queries, ownership parameters, generic errors, founder-cookie handling, protected signup fields and nonblocking notification behavior. They do not prove a real database, delivered email or real device flow.

## Additional verification supplied

`.github/workflows/agent29-account-reliability.yml` runs only for this Agent 29 branch. It has read-only repository permissions, no deployment steps and no production secrets. It runs the existing locked dependencies, DOM component tests and real BetterAuth/Drizzle integration tests against a disposable loopback-only MySQL database. It also attempts the project's type check and build.

The API integration cases cover account creation, existing-user login, repeat session reads, separate sessions, bad passwords, server-side logout/replay rejection, expiry, password reset/revocation/reuse, expired tokens and protected role fields. Email is intercepted in memory; no message is delivered. DOM tests cover account forms, expiry, timeout recovery, failed/confirmed logout, blocked storage, role boundaries and invalid reset links.

**Writing a workflow or test is not proof it passed.** The accompanying hand-back must state the observed CI result separately. Do not mark these as verified until the corresponding run finishes successfully.

## Remaining acceptance risks

1. **Shared-device child mode is not certified secure.** The existing schema links child profiles to a parent account. A child using an already signed-in parent's credentials still appears to the server as that parent. Explicit child-role checks do not solve this; existing profile selection and an adult reauthentication/PIN boundary need integration review before production approval.
2. **Teacher logout/revocation remains separate.** This branch makes teacher storage reliable and reviews the existing expiring bearer-session resolver. It does not introduce a new teacher authentication system or certify server-side token revocation on every teacher logout path.
3. **Real-device/browser acceptance remains required.** Physical Android/iOS, WebView cross-site cookie behavior, refresh/back navigation and delivered reset email are not proven by policy tests or a DOM simulator.
4. **Reset request acceptance is not email-delivery confirmation.** To avoid account enumeration, per-address processing/delivery errors remain generic. The mail transport must be verified privately in an authorised test environment.
5. Existing broader security concerns remain for coordination with the security agent: global request URL logging can include reset tokens; permissive CORS/CSRF configuration was not broadened or redesigned here. No production secrets or user records were retrieved for these tests.
6. Other agents may edit the same authentication/layout files. This branch starts from the pinned master commit, does not pull their changes, and requires conflict review before any later authorised merge. Whole-project test/build failures must be reported, not silently treated as passes.
