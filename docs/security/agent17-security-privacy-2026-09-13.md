# Agent 17 — Security and privacy audit

Date: 13 September 2026
Repository: drmichael1982-crypto/Sodafom.uk
Branch: agent17/security-privacy-2026-09-13
Base: master at 058097f78077015980460c0b359903fda5aa83a6

## Decision

Focused security fixes are ready for review on this branch. This is NOT a release clearance, complete penetration test, or assurance that children cannot enter a parent's account on a shared device. No merge, deployment, account modification, production configuration change, real media capture, paid AI call, or credential rotation was performed by this audit.

## Fixes

| Finding | Change | Scope and caveat |
| --- | --- | --- |
| Credentialed CORS accepted arbitrary websites | Shared exact-origin policy; untrusted API origins rejected before handlers; no wildcard response for missing Origin; browser writes cannot drop Origin to bypass Fetch Metadata checks | Known web and packaged native origins retained. CORS is not authentication. Headerless native/server clients still require their normal endpoint authentication/signature. |
| BetterAuth CSRF protection disabled | Enabled checks in production and preview; removed automatic trust in every builder tenant/subdomain | Individual preview/custom origins must be explicitly configured before integration. |
| Parent report accepted any authenticated role | Requires a server-provided parent role and a strictly validated child ID; retains ownership query before reading progress | Does NOT identify a child who is physically using a parent's authenticated session. |
| Sensitive request and error logging | Removed full request URLs and response-body logging in the shared HTTP/auth paths; generic errors in parent report, child progress and admin account list | Other route-specific logging/error handlers were not exhaustively audited. |
| Account notification HTML interpolated user input | Escaped names, email, phone and reset-link HTML attributes; removed personal data from signup logs | Existing authorised email notifications and their contents are otherwise retained. |
| Microphone lifecycle could outlive recorder component | Stops tracks/timers/readers on unmount and failures; discards late permission grants; prevents duplicate capture attempts; guards repeated stop | Applies to VoiceRecorder.tsx only. Other speech/recorder components and physical devices need separate checks. |
| Photo Responses API request used default response storage | Adds store: false without changing the model, prompt, result, or paid-AI guard | This disables retrievable response storage, NOT all provider retention. Provider controls and child-data suitability still require review. |
| Private API results could be cached | Private/no-store on API responses, including explicit headers on changed data handlers | Must also verify deployed proxy/CDN and service-worker behavior. |
| Browser capability and referrer exposure | Camera/microphone restricted to self; nosniff and strict-origin referrer policy | These headers do not grant camera/microphone permission. Real browser/native behavior remains untested. |

## Existing controls sampled and retained

The admin guard uses server-issued founder sessions or server-side admin/verified-founder status. Production open-mode bypass is not allowed. Signed founder cookies are HttpOnly, Secure in production, SameSite Strict, expiring, and bound to the current founder credential. Founder-code verification supports scrypt hashes and does not read privilege flags from the browser. BetterAuth's isAdmin and role additional fields remain input:false.

The admin account query selects id, name, email and created_at, not password or token columns. The parent report and child progress queries bind the authenticated parent's ID. The teacher profile handler checks an unexpired server-side bearer session and returns selected profile fields. The teacher password helper uses salted scrypt and retains a legacy verification/upgrade indicator; actual upgrade persistence was not exercised. The change-password endpoint delegates current-password verification to BetterAuth. Its existing revokeOtherSessions:false policy was not changed.

The reviewed photo picker requires a user action and stores its selected image in component state. The reviewed image endpoint does not write it to the Sodafom database. This does not establish the retention policy of external processing, logs, proxies, backups or every other media feature.

## Tests performed

52 focused offline regression tests passed, with zero failures, skips or cancellations. The script executes the actual selected TypeScript modules through TypeScript transpilation in an isolated VM. It uses dummy identities, an in-memory database double, mocked BetterAuth/OpenAI interfaces, mocked React hooks and mocked microphone/recorder objects. No live child data or service credentials are used.

Coverage includes trusted/untrusted origins; credentialed CORS and preflight handling; headerless signed-webhook compatibility; Fetch Metadata rejection; protected auth configuration; missing secrets; error/log redaction; HTML escaping; denied roles; invalid/repeated IDs; parent ownership checks; valid parent reports; admin privileges and signed cookies; password hashing; photo storage and billing-guard preservation; media permission timing; denial, failure, stop, eight-second timeout, unmount, preview and explicit save.

Four temporary fault-injection checks were run locally: disabling CSRF, accepting untrusted CORS, removing the parent role check and removing recorder teardown. Each caused its targeted regression test to fail. All temporary faults were restored; the final 52-test run passed.

API import and registration blocks and the initialization/migration block in entry.ts were compared byte-for-byte with the pinned base and are unchanged. Selected TypeScript files parse without syntax errors. The unchanged admin-auth.ts and teacher-password.ts copies used for tests were verified against their Git blob SHAs.

Re-run in a checkout with the project's dependencies installed:

```sh
node --test scripts/agent17-security.test.cjs
```

## Limits and outstanding release checks

1. **Shared-device parent boundary — unresolved, high priority.** The reviewed child flows use the parent's session. A role check protects against a child-role account, not a child holding a device already signed in as a parent. Verify every parent/admin page and sensitive API using direct URLs and shared sessions. A server-enforced parent reauthentication/unlock boundary and child-session model require a coordinated follow-up; no new PIN/authentication feature was invented in this audit.

2. **Full integration remains unverified.** GitHub reads/writes were available, but direct cloning/network dependency installation were unavailable. Tests ran against a reconstructed subset on Node 22.16.0; package.json requests Node >=22.22.0. The full build, full TypeScript type check, existing Vitest suite, lint, lockfile vulnerability audit, database migrations, real BetterAuth flows, browser/device flows and deployed settings were not run. Run those on the supported Node version before any merge/release. Mocked tests do not substitute for them.

3. **Secret exposure is not globally cleared.** The selected files read secrets server-side; no real API credential was identified in the reviewed source. A full repository/history, generated browser bundle, sourcemap, public asset, log and hosting-variable scan has NOT been completed. Vite exposes VITE_ and SITE_ variables: never place private credentials in either namespace. Verify actual hosting configuration without printing values. Any credential found to have been exposed needs controlled rotation; none was rotated here.

4. **Remaining media and native checks.** Other voice components, permission revocation, tab backgrounding, native runtime permissions and account-local recording storage still need device testing. The reviewed Android manifest enables backups and cleartext traffic and references a separate network-security policy; packaged backup exclusions, effective network policy and release configuration were not established. Do not assume this manifest alone proves a public cleartext connection or safe storage.

5. **Provider/child-data privacy.** store:false is not Zero Data Retention. Check provider retention controls, under-13 suitability, parental notices, third-party speech processing, deletion/retention behavior and consent before enabling child-photo/voice processing. This audit neither enables paid AI nor certifies legal compliance.

6. **Operational and broader access controls.** Review all other endpoints, persistent/session revocation, reset-password session policy, rate-limit persistence across replicas, trusted proxy topology (entry.ts currently trusts proxies), security headers/CSP/frame embedding, development-server exposure and backups. No production topology or global policy was guessed or changed here.

## Integration notes

Only this Agent 17 branch should be reviewed. Do not merge or deploy automatically. Coordinate conflicts in shared auth/server, parent, scanner and recorder files with the other agents. No artwork, game/lesson content, payment logic, database schema, package dependencies, CI workflows or other branches were changed by this patch.

SODAFOM_TRUSTED_ORIGINS is an optional comma-separated list of exact HTTPS origins for approved previews/custom frontends. Invalid entries, credentials, paths, queries and wildcards are ignored. HTTP configuration is accepted only in NODE_ENV=development. Native compatibility is limited to the existing exact http://localhost, https://localhost and capacitor://localhost origins; arbitrary localhost ports are development-only. Do not broaden this policy to all tenant domains.

## Reference documentation consulted

- Better Auth security: https://better-auth.com/docs/reference/security
- MDN MediaStreamTrack.stop(): https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
- MDN camera Permissions Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/camera
- OpenAI data controls: https://developers.openai.com/api/docs/guides/your-data

Repository evidence is the pinned base and the specific files changed/reviewed above. No claim is made about unrelated branches or the separate Sodafoam Systems 797 project.
